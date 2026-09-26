(() => {
  "use strict";

  const config = window.CAREER_CANVAS_CONFIG || {};
  const SESSION_KEY = "careerCanvasClassSession";
  const DB_KEY = "careerCanvasClassDemo";
  const FIREBASE_VERSION = "12.19.0";
  let cloud = null;
  let cloudPromise = null;

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();
  const usernameKey = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  const hasFirebase = () => Boolean(config.firebase && config.firebase.apiKey && config.firebase.projectId && config.firebase.appId);
  const classes = () => Array.isArray(config.classes) && config.classes.length ? config.classes : [{ id: config.classId, name: config.className, code: config.classCode }];
  const classById = (id) => classes().find(item => item.id === id) || classes()[0];
  const classByCode = (code) => classes().find(item => String(item.code || "").toUpperCase() === String(code || "").trim().toUpperCase());
  const studentClassId = () => classById(getSession()?.classId).id;
  const teacherEmails = () => (Array.isArray(config.teacherEmails) && config.teacherEmails.length ? config.teacherEmails : [config.teacherEmail]).map(email => String(email || "").toLowerCase());
  const isTeacherEmail = (email) => teacherEmails().includes(String(email || "").toLowerCase());

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getSession() {
    const value = read(SESSION_KEY, null);
    return value && value.username && value.studentId ? value : null;
  }

  function demoDb() {
    return read(DB_KEY, { students: {}, quizzes: {}, attempts: {}, artifacts: {} });
  }

  function saveDemoDb(db) { write(DB_KEY, db); }

  async function initCloud() {
    if (!hasFirebase()) return null;
    if (cloud) return cloud;
    if (cloudPromise) return cloudPromise;
    cloudPromise = (async () => {
      const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
      const appSdk = await import(`${base}/firebase-app.js`);
      const authSdk = await import(`${base}/firebase-auth.js`);
      const storeSdk = await import(`${base}/firebase-firestore.js`);
      const app = appSdk.initializeApp(config.firebase);
      const auth = authSdk.getAuth(app);
      if (typeof auth.authStateReady === "function") await auth.authStateReady();
      let db;
      try {
        db = storeSdk.initializeFirestore(app, {
          localCache: storeSdk.persistentLocalCache({ tabManager: storeSdk.persistentMultipleTabManager() })
        });
      } catch (_) {
        db = storeSdk.getFirestore(app);
      }
      cloud = { auth, db, authSdk, storeSdk };
      return cloud;
    })();
    return cloudPromise;
  }

  async function anonymousUser() {
    const services = await initCloud();
    if (!services) return null;
    if (services.auth.currentUser) return services.auth.currentUser;
    return (await services.authSdk.signInAnonymously(services.auth)).user;
  }

  function validateJoin(code, username) {
    const selectedClass = classByCode(code);
    if (!selectedClass) throw new Error("That class code does not match.");
    const clean = String(username || "").trim().replace(/\s+/g, " ");
    if (clean.length < 3 || clean.length > 20) throw new Error("Choose a username that is 3–20 characters.");
    if (!/^[a-zA-Z0-9 _-]+$/.test(clean)) throw new Error("Use only letters, numbers, spaces, hyphens, or underscores.");
    return { clean, selectedClass };
  }

  async function joinClass(code, username) {
    const { clean, selectedClass } = validateJoin(code, username);
    const classId = selectedClass.id;
    const studentId = usernameKey(clean);
    const joinedAt = now();
    if (hasFirebase()) {
      const user = await anonymousUser();
      const { db, storeSdk } = cloud;
      const ref = storeSdk.doc(db, "classes", classId, "students", studentId);
      const existing = await storeSdk.getDoc(ref);
      if (existing.exists() && existing.data().authUid !== user.uid) throw new Error("That username is already taken. Ask the teacher to reset it or choose another.");
      await storeSdk.setDoc(ref, { username: clean, usernameKey: studentId, authUid: user.uid, joinedAt: existing.data()?.joinedAt || joinedAt, lastSeenAt: joinedAt }, { merge: true });
    } else {
      const db = demoDb();
      db.students[studentId] = { ...(db.students[studentId] || {}), username: clean, usernameKey: studentId, joinedAt: db.students[studentId]?.joinedAt || joinedAt, lastSeenAt: joinedAt };
      saveDemoDb(db);
    }
    const session = { username: clean, studentId, classId, className: selectedClass.name, joinedAt };
    write(SESSION_KEY, session);
    return session;
  }

  async function syncStudent(patch) {
    const session = getSession();
    if (!session) return false;
    const payload = { ...clone(patch), username: session.username, lastSeenAt: now() };
    if (hasFirebase()) {
      await anonymousUser();
      const { db, storeSdk } = cloud;
      await storeSdk.setDoc(storeSdk.doc(db, "classes", studentClassId(), "students", session.studentId), payload, { merge: true });
    } else {
      const db = demoDb();
      db.students[session.studentId] = { ...(db.students[session.studentId] || {}), ...payload };
      saveDemoDb(db);
    }
    return true;
  }

  async function getStudentRecord() {
    const session = getSession();
    if (!session) return null;
    if (hasFirebase()) {
      await anonymousUser();
      const { db, storeSdk } = cloud;
      const snap = await storeSdk.getDoc(storeSdk.doc(db, "classes", studentClassId(), "students", session.studentId));
      return snap.exists() ? snap.data() : null;
    }
    return demoDb().students[session.studentId] || null;
  }

  async function submitQuiz(quiz) {
    const session = getSession();
    if (!session) throw new Error("Join the class before submitting a quiz.");
    const clean = clone(quiz);
    delete clean.updatedAt;
    const id = clean.classQuizId || `${session.studentId}-${Date.now().toString(36)}`;
    const payload = { ...clean, id, ownerId: session.studentId, ownerUsername: session.username, status: "pending", updatedAt: now() };
    if (hasFirebase()) {
      const user = await anonymousUser();
      payload.authUid = user.uid;
      const { db, storeSdk } = cloud;
      await storeSdk.setDoc(storeSdk.doc(db, "classes", studentClassId(), "quizzes", id), payload, { merge: true });
    } else {
      const db = demoDb();
      db.quizzes[id] = payload;
      saveDemoDb(db);
    }
    await syncStudent({ lastQuizSubmittedAt: now() });
    return payload;
  }

  async function listQuizzes(includeOwn = true) {
    const session = getSession();
    if (hasFirebase()) {
      const user = await anonymousUser();
      const { db, storeSdk } = cloud;
      const quizzes = storeSdk.collection(db, "classes", studentClassId(), "quizzes");
      const publishedSnap = await storeSdk.getDocs(storeSdk.query(quizzes, storeSdk.where("status", "==", "published")));
      const items = new Map(publishedSnap.docs.map(item => [item.id, item.data()]));
      if (includeOwn && session) {
        const ownSnap = await storeSdk.getDocs(storeSdk.query(quizzes, storeSdk.where("authUid", "==", user.uid)));
        ownSnap.docs.forEach(item => items.set(item.id, item.data()));
      }
      return [...items.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    }
    return Object.values(demoDb().quizzes).filter((item) => item.status === "published" || (includeOwn && session && item.ownerId === session.studentId)).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async function getQuiz(id, requestedClassId) {
    const classId = requestedClassId ? classById(requestedClassId).id : studentClassId();
    if (hasFirebase()) {
      await anonymousUser();
      const { db, storeSdk } = cloud;
      const snap = await storeSdk.getDoc(storeSdk.doc(db, "classes", classId, "quizzes", id));
      return snap.exists() ? snap.data() : null;
    }
    return demoDb().quizzes[id] || null;
  }

  async function saveAttempt(quiz, score, total) {
    const session = getSession();
    if (!session) return;
    const id = `${quiz.id}-${session.studentId}-${Date.now().toString(36)}`;
    const payload = { id, quizId: quiz.id, quizTitle: quiz.title, ownerId: quiz.ownerId, playerId: session.studentId, playerUsername: session.username, score, total, completedAt: now() };
    if (hasFirebase()) {
      const user = await anonymousUser();
      payload.authUid = user.uid;
      const { db, storeSdk } = cloud;
      await storeSdk.setDoc(storeSdk.doc(db, "classes", studentClassId(), "attempts", id), payload);
    } else {
      const db = demoDb(); db.attempts[id] = payload; saveDemoDb(db);
    }
  }

  async function submitArtifact(artifact) {
    const session = getSession();
    if (!session) throw new Error("Join the class before submitting work.");
    const type = String(artifact.type || "");
    if (!["article", "ad", "portfolio"].includes(type)) throw new Error("Choose a project type.");
    const title = String(artifact.title || "").trim();
    const url = String(artifact.url || "").trim();
    if (!title || !/^https:\/\//i.test(url)) throw new Error("Add a title and an https share link.");
    const id = artifact.id || `${session.studentId}-${type}-${Date.now().toString(36)}`;
    const payload = { id, type, title, url, ownerId: session.studentId, ownerUsername: session.username, status: "pending", updatedAt: now() };
    if (hasFirebase()) {
      const user = await anonymousUser(); payload.authUid = user.uid;
      const { db, storeSdk } = cloud;
      await storeSdk.setDoc(storeSdk.doc(db, "classes", studentClassId(), "artifacts", id), payload, { merge: true });
    } else { const db = demoDb(); db.artifacts ||= {}; db.artifacts[id] = payload; saveDemoDb(db); }
    return payload;
  }

  async function listArtifacts(includeOwn = true) {
    const session = getSession();
    if (hasFirebase()) {
      const user = await anonymousUser(); const { db, storeSdk } = cloud;
      const items = storeSdk.collection(db, "classes", studentClassId(), "artifacts");
      const published = await storeSdk.getDocs(storeSdk.query(items, storeSdk.where("status", "==", "published")));
      const results = new Map(published.docs.map(item => [item.id, item.data()]));
      if (includeOwn && session) {
        const own = await storeSdk.getDocs(storeSdk.query(items, storeSdk.where("authUid", "==", user.uid)));
        own.docs.forEach(item => results.set(item.id, item.data()));
      }
      return [...results.values()].sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    }
    return Object.values(demoDb().artifacts || {}).filter(item => item.status === "published" || (includeOwn && session && item.ownerId === session.studentId));
  }

  async function setArtifactStatus(id, status, requestedClassId) {
    if (!["pending", "published"].includes(status)) throw new Error("Invalid artifact status.");
    const classId = classById(requestedClassId).id;
    if (hasFirebase()) { const { db, storeSdk } = await initCloud(); await storeSdk.updateDoc(storeSdk.doc(db, "classes", classId, "artifacts", id), { status, updatedAt: now() }); }
    else { const db = demoDb(); if (db.artifacts?.[id]) db.artifacts[id] = { ...db.artifacts[id], status, updatedAt: now() }; saveDemoDb(db); }
  }

  async function teacherSignIn() {
    if (!hasFirebase()) return { demo: true, email: config.teacherEmail };
    const services = await initCloud();
    const provider = new services.authSdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await services.authSdk.signInWithPopup(services.auth, provider);
    if (!isTeacherEmail(result.user.email)) {
      await services.authSdk.signOut(services.auth);
      throw new Error(`Use an approved teacher account: ${teacherEmails().join(", ")}`);
    }
    return result.user;
  }

  async function teacherDashboard(requestedClassId) {
    const classId = classById(requestedClassId).id;
    if (hasFirebase()) {
      const services = await initCloud();
      const email = services.auth.currentUser?.email?.toLowerCase();
      if (!isTeacherEmail(email)) throw new Error("Teacher sign-in required.");
      const [students, quizzes, attempts, artifacts] = await Promise.all([
        services.storeSdk.getDocs(services.storeSdk.collection(services.db, "classes", classId, "students")),
        services.storeSdk.getDocs(services.storeSdk.collection(services.db, "classes", classId, "quizzes")),
        services.storeSdk.getDocs(services.storeSdk.collection(services.db, "classes", classId, "attempts")),
        services.storeSdk.getDocs(services.storeSdk.collection(services.db, "classes", classId, "artifacts"))
      ]);
      return { students: students.docs.map(d => ({ ...d.data(), id: d.id })), quizzes: quizzes.docs.map(d => d.data()), attempts: attempts.docs.map(d => d.data()), artifacts: artifacts.docs.map(d => d.data()) };
    }
    const db = demoDb();
    return { students: Object.entries(db.students).map(([id, student]) => ({ ...student, id })), quizzes: Object.values(db.quizzes), attempts: Object.values(db.attempts), artifacts: Object.values(db.artifacts || {}) };
  }

  async function deleteStudent(studentId, requestedClassId) {
    const id = usernameKey(studentId);
    const classId = classById(requestedClassId).id;
    if (!id) throw new Error("Student record not found.");
    if (hasFirebase()) {
      const services = await initCloud();
      const email = services.auth.currentUser?.email?.toLowerCase();
      if (!isTeacherEmail(email)) throw new Error("Teacher sign-in required.");
      const { db, storeSdk } = services;
      const classRoot = ["classes", classId];
      const queries = await Promise.all([
        storeSdk.getDocs(storeSdk.query(storeSdk.collection(db, ...classRoot, "quizzes"), storeSdk.where("ownerId", "==", id))),
        storeSdk.getDocs(storeSdk.query(storeSdk.collection(db, ...classRoot, "artifacts"), storeSdk.where("ownerId", "==", id))),
        storeSdk.getDocs(storeSdk.query(storeSdk.collection(db, ...classRoot, "attempts"), storeSdk.where("playerId", "==", id))),
        storeSdk.getDocs(storeSdk.query(storeSdk.collection(db, ...classRoot, "attempts"), storeSdk.where("ownerId", "==", id)))
      ]);
      const refs = new Map();
      queries.forEach(snapshot => snapshot.docs.forEach(document => refs.set(document.ref.path, document.ref)));
      refs.set(`classes/${classId}/students/${id}`, storeSdk.doc(db, ...classRoot, "students", id));
      await Promise.all([...refs.values()].map(ref => storeSdk.deleteDoc(ref)));
      return refs.size;
    }
    const db = demoDb();
    delete db.students[id];
    Object.keys(db.quizzes).forEach(key => { if (db.quizzes[key]?.ownerId === id) delete db.quizzes[key]; });
    Object.keys(db.attempts).forEach(key => { if (db.attempts[key]?.playerId === id || db.attempts[key]?.ownerId === id) delete db.attempts[key]; });
    Object.keys(db.artifacts || {}).forEach(key => { if (db.artifacts[key]?.ownerId === id) delete db.artifacts[key]; });
    saveDemoDb(db);
    return true;
  }

  async function setQuizStatus(id, status, requestedClassId) {
    if (!["pending", "published"].includes(status)) throw new Error("Invalid quiz status.");
    const classId = classById(requestedClassId).id;
    if (hasFirebase()) {
      const { db, storeSdk } = await initCloud();
      await storeSdk.updateDoc(storeSdk.doc(db, "classes", classId, "quizzes", id), { status, updatedAt: now() });
    } else {
      const db = demoDb();
      if (db.quizzes[id]) db.quizzes[id] = { ...db.quizzes[id], status, updatedAt: now() };
      saveDemoDb(db);
    }
  }

  window.CareerCanvasClassroom = {
    config,
    mode: hasFirebase() ? "cloud" : "demo",
    listClasses: classes,
    getClass: classById,
    getSession,
    joinClass,
    leaveClass() { localStorage.removeItem(SESSION_KEY); },
    syncStudent,
    getStudentRecord,
    submitQuiz,
    listQuizzes,
    getQuiz,
    saveAttempt,
    submitArtifact,
    listArtifacts,
    setArtifactStatus,
    teacherSignIn,
    teacherDashboard,
    deleteStudent,
    setQuizStatus,
    async isTeacherSignedIn() {
      if (!hasFirebase()) return true;
      const services = await initCloud();
      return isTeacherEmail(services.auth.currentUser?.email);
    }
  };
})();
