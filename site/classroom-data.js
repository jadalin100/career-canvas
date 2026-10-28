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
  const uniqueId = (prefix) => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`}`;
  const usernameKey = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  const hasFirebase = () => Boolean(config.firebase && config.firebase.apiKey && config.firebase.projectId && config.firebase.appId);
  // Classes live in the database. This browser remembers the ones it has seen (name and code) for display.
  const KNOWN_CLASSES_KEY = "careerCanvasKnownClasses";
  const defaultClass = () => ({ id: config.classId, name: config.className, code: config.classCode });
  const knownClasses = () => { try { return JSON.parse(localStorage.getItem(KNOWN_CLASSES_KEY)) || {}; } catch (_) { return {}; } };
  const rememberClass = (item) => { const all = knownClasses(); all[item.id] = { ...all[item.id], ...item }; localStorage.setItem(KNOWN_CLASSES_KEY, JSON.stringify(all)); return all[item.id]; };
  const classes = () => { const all = { [config.classId]: defaultClass(), ...knownClasses() }; return Object.values(all); };
  const classById = (id) => !id ? defaultClass() : (knownClasses()[id] || (id === config.classId ? defaultClass() : { id, name: "Your class" }));
  const requireClass = (id) => {
    const selected = classById(id);
    if (!/^[a-z0-9][a-z0-9-]{2,60}$/.test(String(selected.id || ""))) throw new Error("That class could not be found.");
    return selected;
  };
  const studentClassId = () => requireClass(getSession()?.classId).id;
  const CODE_LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const randomCode = (length) => Array.from(globalThis.crypto.getRandomValues(new Uint32Array(length)), n => CODE_LETTERS[n % CODE_LETTERS.length]).join("");
  const isGoogleTeacher = (user) => Boolean(user && !user.isAnonymous && user.email);

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

  function demoKey(classId) { return `${DB_KEY}:${requireClass(classId).id}`; }

  function emptyDemoDb() { return { students: {}, quizzes: {}, attempts: {}, artifacts: {}, comments: {}, blocked: {} }; }

  function demoDb(classId) {
    const selectedId = requireClass(classId || getSession()?.classId).id;
    const scoped = read(demoKey(selectedId), null);
    if (scoped) return { ...emptyDemoDb(), ...scoped };
    if (selectedId === config.classId) return { ...emptyDemoDb(), ...read(DB_KEY, emptyDemoDb()) };
    return emptyDemoDb();
  }

  function saveDemoDb(db, classId) { write(demoKey(classId || getSession()?.classId), db); }

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
    })().catch(error => { cloudPromise = null; throw error; });
    return cloudPromise;
  }

  async function anonymousUser() {
    const services = await initCloud();
    if (!services) return null;
    if (services.auth.currentUser) return services.auth.currentUser;
    return (await services.authSdk.signInAnonymously(services.auth)).user;
  }


  function offlineMessage(error) {
    return /failed to fetch|network|offline|internet|dynamically imported module/i.test(String(error?.message || error));
  }

  async function findClassByCode(code) {
    const clean = String(code || "").trim().toUpperCase();
    if (!/^[A-Z0-9]{4,10}$/.test(clean)) return null;
    if (hasFirebase()) {
      await anonymousUser();
      const found = await cloud.storeSdk.getDoc(cloud.storeSdk.doc(cloud.db, "classCodes", clean));
      if (found.exists()) return rememberClass({ id: found.data().classId, name: found.data().name, code: clean });
      // The two original classes work before a teacher's first sign-in saves their codes (the rules allow it too).
      const legacy = (config.legacyClasses || []).find(item => item.code === clean);
      return legacy ? rememberClass({ id: legacy.id, name: legacy.name, code: legacy.code }) : null;
    }
    return classes().find(item => String(item.code || "").toUpperCase() === clean) || null;
  }

  function validateJoin(selectedClass, username) {
    if (!selectedClass) throw new Error("That class code does not match.");
    const clean = String(username || "").trim().replace(/\s+/g, " ");
    if (clean.length < 3 || clean.length > 40) throw new Error("Choose a name that is 3–40 characters.");
    if (!/^[a-zA-Z0-9 _'-]+$/.test(clean)) throw new Error("Use only letters, numbers, spaces, apostrophes, hyphens, or underscores.");
    return { clean, selectedClass };
  }

  async function joinClass(code, username) {
    const { clean, selectedClass } = validateJoin(await findClassByCode(code), username);
    const classId = selectedClass.id;
    const studentId = usernameKey(clean);
    const joinedAt = now();
    if (hasFirebase()) {
      const user = await anonymousUser();
      const { db, storeSdk } = cloud;
      const ref = storeSdk.doc(db, "classes", classId, "students", studentId);
      const blockRef = storeSdk.doc(db, "classes", classId, "blockedStudents", studentId);
      try {
        const existing = await storeSdk.getDoc(ref);
        const blocked = await storeSdk.getDoc(blockRef);
        if (blocked.exists()) throw new Error("That student was removed from the class. Ask the teacher before joining again.");
        if (existing.exists() && existing.data().authUid !== user.uid && existing.data().locked) throw new Error("That name is locked. Ask the teacher to unlock it, or add your middle initial if it isn't you.");
        await storeSdk.setDoc(ref, { username: clean, usernameKey: studentId, authUid: user.uid, joinedAt: existing.data()?.joinedAt || joinedAt, lastSeenAt: joinedAt }, { merge: true });
        await storeSdk.setDoc(storeSdk.doc(db, "classes", classId, "members", user.uid), { studentId }).catch(() => {});
      } catch (error) {
        if (/removed|another student account/i.test(error.message || "")) throw error;
        if (error?.code === "permission-denied") throw new Error("That name is already used by another student or was removed. Add your middle initial or ask the teacher.");
        throw error;
      }
      const local = demoDb(classId);
      local.students[studentId] = { ...(local.students[studentId] || {}), username: clean, usernameKey: studentId, authUid: user.uid, joinedAt: local.students[studentId]?.joinedAt || joinedAt, lastSeenAt: joinedAt };
      saveDemoDb(local, classId);
      const session = { username: clean, studentId, classId, className: selectedClass.name, authUid: user.uid, joinedAt };
      write(SESSION_KEY, session);
      return session;
    } else {
      const db = demoDb(classId);
      if (db.blocked?.[studentId]) throw new Error("That student was removed from the class. Ask the teacher before joining again.");
      db.students[studentId] = { ...(db.students[studentId] || {}), username: clean, usernameKey: studentId, joinedAt: db.students[studentId]?.joinedAt || joinedAt, lastSeenAt: joinedAt };
      saveDemoDb(db, classId);
    }
    const session = { username: clean, studentId, classId, className: selectedClass.name, joinedAt };
    write(SESSION_KEY, session);
    return session;
  }

  async function syncStudent(patch) {
    const session = getSession();
    if (!session) return false;
    const payload = { ...clone(patch), username: session.username, lastSeenAt: now() };
    const local = demoDb(session.classId);
    if (local.blocked?.[session.studentId]) { localStorage.removeItem(SESSION_KEY); throw new Error("This student was removed from the class."); }
    local.students[session.studentId] = { ...(local.students[session.studentId] || {}), ...payload };
    saveDemoDb(local, session.classId);
    if (hasFirebase()) {
      try {
        const services = await initCloud();
        const user = services.auth.currentUser;
        if (!user || user.uid !== session.authUid) return false;
        await services.storeSdk.setDoc(services.storeSdk.doc(services.db, "classes", studentClassId(), "students", session.studentId), { ...payload, authUid: user.uid }, { merge: true });
        await flushPendingLocal(services, session);
      } catch (error) {
        if (offlineMessage(error)) return false;
        if (error?.code === "permission-denied") {
          local.blocked ||= {};
          local.blocked[session.studentId] = { studentId: session.studentId, deletedAt: now() };
          saveDemoDb(local, session.classId);
          localStorage.removeItem(SESSION_KEY);
          throw new Error("This student no longer has access to the class.");
        }
        throw error;
      }
    }
    return true;
  }

  async function getStudentRecord() {
    const session = getSession();
    if (!session) return null;
    const local = demoDb(session.classId).students[session.studentId] || null;
    if (hasFirebase()) {
      try {
        const services = await initCloud();
        const user = services.auth.currentUser;
        if (!user || user.uid !== session.authUid) return local;
        const snap = await services.storeSdk.getDoc(services.storeSdk.doc(services.db, "classes", studentClassId(), "students", session.studentId));
        return snap.exists() ? snap.data() : local;
      } catch (error) {
        if (offlineMessage(error)) return local;
        throw error;
      }
    }
    return local;
  }

  async function flushPendingLocal(services, session) {
    if (!services || !session || services.auth.currentUser?.uid !== session.authUid) return;
    const local = demoDb(session.classId);
    const collections = [
      ["quizzes", local.quizzes, item => item.ownerId === session.studentId],
      ["attempts", local.attempts, item => item.playerId === session.studentId],
      ["artifacts", local.artifacts, item => item.ownerId === session.studentId]
    ];
    let changed = false;
    for (const [collectionName, records, owns] of collections) {
      for (const [id, item] of Object.entries(records || {})) {
        if (item.syncState !== "pending" || !owns(item)) continue;
        const payload = clone(item); delete payload.syncState; delete payload.savedOffline;
        const ref = services.storeSdk.doc(services.db, "classes", session.classId, collectionName, id);
        if (collectionName === "attempts") await services.storeSdk.setDoc(ref, payload);
        else await services.storeSdk.setDoc(ref, payload, { merge: true });
        records[id] = { ...item, syncState: "synced" };
        changed = true;
      }
    }
    if (changed) saveDemoDb(local, session.classId);
  }

  async function submitQuiz(quiz) {
    const session = getSession();
    if (!session) throw new Error("Join the class before submitting a quiz.");
    const clean = clone(quiz);
    delete clean.updatedAt;
    if (!Array.isArray(clean.questions) || !clean.questions.length) throw new Error("Add at least one complete question before submitting your quiz.");
    const invalidQuestion = clean.questions.some(question => !String(question.prompt || "").trim() || !Array.isArray(question.choices) || question.choices.length < 2 || question.choices.some(choice => !String(choice || "").trim()) || !Number.isInteger(Number(question.correct)) || Number(question.correct) < 0 || Number(question.correct) >= question.choices.length);
    if (invalidQuestion) throw new Error("Every quiz question needs a prompt, at least two choices, and one correct answer.");
    const id = clean.classQuizId || uniqueId(session.studentId);
    const payload = { ...clean, id, ownerId: session.studentId, ownerUsername: session.username, status: "pending", updatedAt: now() };
    if (hasFirebase() && session.authUid) payload.authUid = session.authUid;
    const local = demoDb(session.classId); local.quizzes[id] = { ...payload, syncState: hasFirebase() ? "pending" : "local" }; saveDemoDb(local, session.classId);
    if (hasFirebase()) {
      try {
        const services = await initCloud();
        const user = services.auth.currentUser;
        if (!user || user.uid !== session.authUid) throw new Error("Sign in again before submitting your quiz.");
        payload.authUid = user.uid;
        await services.storeSdk.setDoc(services.storeSdk.doc(services.db, "classes", studentClassId(), "quizzes", id), payload, { merge: true });
        local.quizzes[id] = { ...payload, syncState: "synced" }; saveDemoDb(local, session.classId);
      } catch (error) {
        if (!offlineMessage(error)) throw error;
        payload.savedOffline = true;
      }
    }
    await syncStudent({ lastQuizSubmittedAt: now() });
    return payload;
  }

  async function listQuizzes(includeOwn = true) {
    const session = getSession();
    const localItems = Object.values(demoDb(session?.classId).quizzes || {}).filter(item => item.status === "published" || (includeOwn && session && item.ownerId === session.studentId));
    if (hasFirebase()) {
      try {
        const user = await anonymousUser();
        const { db, storeSdk } = cloud;
        if (session && user.uid === session.authUid) await flushPendingLocal(cloud, session);
        const quizzes = storeSdk.collection(db, "classes", studentClassId(), "quizzes");
        const publishedSnap = await storeSdk.getDocs(storeSdk.query(quizzes, storeSdk.where("status", "==", "published")));
        const items = new Map([...localItems.map(item => [item.id, item]), ...publishedSnap.docs.map(item => [item.id, item.data()])]);
        if (includeOwn && session && user.uid === session.authUid) {
          const ownSnap = await storeSdk.getDocs(storeSdk.query(quizzes, storeSdk.where("ownerId", "==", session.studentId)));
          ownSnap.docs.forEach(item => items.set(item.id, item.data()));
        }
        return [...items.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
      } catch (error) {
        if (!offlineMessage(error)) throw error;
      }
    }
    return localItems.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async function getQuiz(id, requestedClassId) {
    const classId = requestedClassId ? requireClass(requestedClassId).id : studentClassId();
    const local = demoDb(classId).quizzes[id] || null;
    if (hasFirebase()) {
      try {
        await anonymousUser();
        const { db, storeSdk } = cloud;
        const snap = await storeSdk.getDoc(storeSdk.doc(db, "classes", classId, "quizzes", id));
        return snap.exists() ? snap.data() : local;
      } catch (error) {
        if (!offlineMessage(error)) throw error;
        return local;
      }
    }
    return local;
  }

  async function saveAttempt(quiz, score, total) {
    const session = getSession();
    if (!session) return;
    const id = uniqueId(`${quiz.id}-${session.studentId}`);
    const payload = { id, quizId: quiz.id, quizTitle: quiz.title, ownerId: quiz.ownerId, playerId: session.studentId, playerUsername: session.username, score, total, completedAt: now() };
    if (hasFirebase() && session.authUid) payload.authUid = session.authUid;
    const local = demoDb(session.classId); local.attempts[id] = { ...payload, syncState: hasFirebase() ? "pending" : "local" }; saveDemoDb(local, session.classId);
    if (hasFirebase()) {
      try {
        const services = await initCloud();
        const user = services.auth.currentUser;
        if (!user || user.uid !== session.authUid) throw new Error("Sign in again before saving this quiz result.");
        payload.authUid = user.uid;
        await services.storeSdk.setDoc(services.storeSdk.doc(services.db, "classes", studentClassId(), "attempts", id), payload);
        local.attempts[id] = { ...payload, syncState: "synced" }; saveDemoDb(local, session.classId);
      } catch (error) {
        if (!offlineMessage(error)) throw error;
        payload.savedOffline = true;
      }
    }
    return payload;
  }

  async function submitArtifact(artifact) {
    const session = getSession();
    if (!session) throw new Error("Join the class before submitting work.");
    const type = String(artifact.type || "");
    if (!["article", "ad", "portfolio"].includes(type)) throw new Error("Choose a project type.");
    const title = String(artifact.title || "").trim();
    const url = String(artifact.url || "").trim();
    let parsedUrl;
    try { parsedUrl = new URL(url); } catch (_) { parsedUrl = null; }
    if (!title || !parsedUrl || parsedUrl.protocol !== "https:" || !parsedUrl.hostname.includes(".")) throw new Error("Add a title and a complete https share link.");
    const id = artifact.id || uniqueId(`${session.studentId}-${type}`);
    const payload = { id, type, title, url, ownerId: session.studentId, ownerUsername: session.username, status: "pending", updatedAt: now() };
    if (hasFirebase() && session.authUid) payload.authUid = session.authUid;
    const local = demoDb(session.classId); local.artifacts[id] = { ...payload, syncState: hasFirebase() ? "pending" : "local" }; saveDemoDb(local, session.classId);
    if (hasFirebase()) {
      try {
        const services = await initCloud();
        const user = services.auth.currentUser;
        if (!user || user.uid !== session.authUid) throw new Error("Sign in again before submitting this project link.");
        payload.authUid = user.uid;
        await services.storeSdk.setDoc(services.storeSdk.doc(services.db, "classes", studentClassId(), "artifacts", id), payload, { merge: true });
        local.artifacts[id] = { ...payload, syncState: "synced" }; saveDemoDb(local, session.classId);
      } catch (error) {
        if (!offlineMessage(error)) throw error;
        payload.savedOffline = true;
      }
    }
    return payload;
  }

  async function listArtifacts(includeOwn = true) {
    const session = getSession();
    const localItems = Object.values(demoDb(session?.classId).artifacts || {}).filter(item => item.status === "published" || (includeOwn && session && item.ownerId === session.studentId));
    if (hasFirebase()) {
      try {
        const user = await anonymousUser(); const { db, storeSdk } = cloud;
        if (session && user.uid === session.authUid) await flushPendingLocal(cloud, session);
        const items = storeSdk.collection(db, "classes", studentClassId(), "artifacts");
        const published = await storeSdk.getDocs(storeSdk.query(items, storeSdk.where("status", "==", "published")));
        const results = new Map([...localItems.map(item => [item.id, item]), ...published.docs.map(item => [item.id, item.data()])]);
        if (includeOwn && session && user.uid === session.authUid) {
          const own = await storeSdk.getDocs(storeSdk.query(items, storeSdk.where("ownerId", "==", session.studentId)));
          own.docs.forEach(item => results.set(item.id, item.data()));
        }
        return [...results.values()].sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
      } catch (error) {
        if (!offlineMessage(error)) throw error;
      }
    }
    return localItems.sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async function setArtifactStatus(id, status, requestedClassId) {
    if (!["pending", "published"].includes(status)) throw new Error("Invalid artifact status.");
    const classId = requireClass(requestedClassId).id;
    if (hasFirebase()) { const { db, storeSdk } = await initCloud(); await storeSdk.updateDoc(storeSdk.doc(db, "classes", classId, "artifacts", id), { status, updatedAt: now() }); }
    else { const db = demoDb(classId); if (db.artifacts?.[id]) db.artifacts[id] = { ...db.artifacts[id], status, updatedAt: now() }; saveDemoDb(db, classId); }
  }

  // Comments are visible only to students in the same class (enforced by Firestore rules through members/{uid}).
  async function cloudStudent() {
    const session = getSession();
    if (!session) throw new Error("Join the class to see comments.");
    const user = await anonymousUser();
    if (!user || user.uid !== session.authUid) throw new Error("Rejoin the class to see comments.");
    const { db, storeSdk } = cloud;
    await storeSdk.setDoc(storeSdk.doc(db, "classes", session.classId, "members", user.uid), { studentId: session.studentId });
    return { session, user, db, storeSdk };
  }

  async function listComments() {
    const session = getSession();
    if (!session) return [];
    if (hasFirebase()) {
      const { db, storeSdk } = await cloudStudent();
      const snapshot = await storeSdk.getDocs(storeSdk.collection(db, "classes", session.classId, "comments"));
      return snapshot.docs.map(d => d.data()).sort((a,b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    }
    return Object.values(demoDb(session.classId).comments || {}).sort((a,b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  }

  async function addComment(targetId, text) {
    const session = getSession();
    if (!session) throw new Error("Join the class before commenting.");
    const clean = String(text || "").trim().replace(/\s+/g, " ");
    if (!clean || clean.length > 300) throw new Error("Write a comment between 1 and 300 characters.");
    const comment = { id: uniqueId(`${session.studentId}-comment`), targetId: String(targetId), text: clean, authorId: session.studentId, authorUsername: session.username, createdAt: now() };
    if (hasFirebase()) {
      const { user, db, storeSdk } = await cloudStudent();
      comment.authUid = user.uid;
      await storeSdk.setDoc(storeSdk.doc(db, "classes", session.classId, "comments", comment.id), comment);
    } else {
      const db = demoDb(session.classId); db.comments ||= {}; db.comments[comment.id] = comment; saveDemoDb(db, session.classId);
    }
    return comment;
  }

  async function deleteComment(id, requestedClassId) {
    const classId = requireClass(requestedClassId || getSession()?.classId).id;
    if (hasFirebase()) { const { db, storeSdk } = await initCloud(); await storeSdk.deleteDoc(storeSdk.doc(db, "classes", classId, "comments", id)); }
    else { const db = demoDb(classId); delete db.comments?.[id]; saveDemoDb(db, classId); }
  }

  async function teacherSignIn() {
    if (!hasFirebase()) return { demo: true, email: config.teacherEmail };
    const services = await initCloud();
    const provider = new services.authSdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await services.authSdk.signInWithPopup(services.auth, provider);
    return result.user;
  }

  async function teacherUser() {
    const services = await initCloud();
    const user = services.auth.currentUser;
    if (!isGoogleTeacher(user)) throw new Error("Sign in as a teacher with Google first.");
    return { services, user, email: user.email.toLowerCase() };
  }

  // Classes this teacher teaches. Classes that existed before the database move are saved once, here.
  async function listTeacherClasses() {
    if (!hasFirebase()) return classes();
    const { services, user, email } = await teacherUser();
    const { db, storeSdk } = services;
    const mine = async () => (await storeSdk.getDocs(storeSdk.query(storeSdk.collection(db, "classes"), storeSdk.where("teacherEmails", "array-contains", email)))).docs.map(d => d.data());
    let found = await mine();
    const legacy = (config.legacyClasses || []).filter(item => (item.teacherEmails || []).includes(email) && !found.some(f => f.id === item.id));
    for (const item of legacy) {
      try { await saveClassRecord(services, user, item.id, item.name, item.code, item.teacherEmails); } catch (_) { /* already saved by a co-teacher, or not allowed */ }
    }
    if (legacy.length) found = await mine();
    return found.map(item => rememberClass({ id: item.id, name: item.name, code: item.code, teacherEmails: item.teacherEmails })).sort((a,b) => a.name.localeCompare(b.name));
  }

  async function saveClassRecord(services, user, id, name, code, teacherEmails) {
    const { db, storeSdk } = services;
    const batch = storeSdk.writeBatch(db);
    batch.set(storeSdk.doc(db, "classes", id), { id, name, code, teacherEmails, ownerUid: user.uid, createdAt: now() });
    batch.set(storeSdk.doc(db, "classCodes", code), { classId: id, name });
    await batch.commit();
  }

  async function createClass(name) {
    const clean = String(name || "").trim().replace(/\s+/g, " ");
    if (!clean || clean.length > 60) throw new Error("Give the class a name up to 60 characters.");
    if (!hasFirebase()) {
      const item = rememberClass({ id: `class-${randomCode(8).toLowerCase()}`, name: clean, code: randomCode(6) });
      return item;
    }
    const { services, user, email } = await teacherUser();
    for (let tries = 0; tries < 4; tries++) {
      const id = `class-${randomCode(10).toLowerCase()}`;
      const code = randomCode(6);
      try {
        await saveClassRecord(services, user, id, clean, code, [email]);
        return rememberClass({ id, name: clean, code, teacherEmails: [email] });
      } catch (error) {
        if (error?.code !== "permission-denied" || tries === 3) throw error;
      }
    }
  }

  async function addCoTeacher(classId, coTeacherEmail) {
    const email = String(coTeacherEmail || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a full email address.");
    const id = requireClass(classId).id;
    if (!hasFirebase()) return;
    const { services } = await teacherUser();
    await services.storeSdk.updateDoc(services.storeSdk.doc(services.db, "classes", id), { teacherEmails: services.storeSdk.arrayUnion(email) });
  }

  async function teacherDashboard(requestedClassId) {
    const classId = requireClass(requestedClassId).id;
    if (hasFirebase()) {
      const { services } = await teacherUser();
      const [students, quizzes, attempts, artifacts, comments] = await Promise.all([
        services.storeSdk.getDocs(services.storeSdk.collection(services.db, "classes", classId, "students")),
        services.storeSdk.getDocs(services.storeSdk.collection(services.db, "classes", classId, "quizzes")),
        services.storeSdk.getDocs(services.storeSdk.collection(services.db, "classes", classId, "attempts")),
        services.storeSdk.getDocs(services.storeSdk.collection(services.db, "classes", classId, "artifacts")),
        services.storeSdk.getDocs(services.storeSdk.collection(services.db, "classes", classId, "comments"))
      ]);
      return { students: students.docs.map(d => ({ ...d.data(), id: d.id })), quizzes: quizzes.docs.map(d => d.data()), attempts: attempts.docs.map(d => d.data()), artifacts: artifacts.docs.map(d => d.data()), comments: comments.docs.map(d => d.data()) };
    }
    const db = demoDb(classId);
    return { students: Object.entries(db.students).map(([id, student]) => ({ ...student, id })), quizzes: Object.values(db.quizzes), attempts: Object.values(db.attempts), artifacts: Object.values(db.artifacts || {}), comments: Object.values(db.comments || {}) };
  }

  async function setStudentLocked(studentId, locked, requestedClassId) {
    const classId = requireClass(requestedClassId).id;
    const id = usernameKey(studentId);
    if (hasFirebase()) { const { db, storeSdk } = await initCloud(); await storeSdk.updateDoc(storeSdk.doc(db, "classes", classId, "students", id), { locked: Boolean(locked) }); }
    else { const db = demoDb(classId); if (db.students[id]) db.students[id].locked = Boolean(locked); saveDemoDb(db, classId); }
  }

  async function deleteStudent(studentId, requestedClassId) {
    const id = usernameKey(studentId);
    const classId = requireClass(requestedClassId).id;
    if (!id) throw new Error("Student record not found.");
    if (hasFirebase()) {
      const { services, email } = await teacherUser();
      const { db, storeSdk } = services;
      const classRoot = ["classes", classId];
      await storeSdk.setDoc(storeSdk.doc(db, ...classRoot, "blockedStudents", id), { studentId: id, deletedAt: now(), deletedBy: email });
      const queries = await Promise.all([
        storeSdk.getDocs(storeSdk.query(storeSdk.collection(db, ...classRoot, "quizzes"), storeSdk.where("ownerId", "==", id))),
        storeSdk.getDocs(storeSdk.query(storeSdk.collection(db, ...classRoot, "artifacts"), storeSdk.where("ownerId", "==", id))),
        storeSdk.getDocs(storeSdk.query(storeSdk.collection(db, ...classRoot, "attempts"), storeSdk.where("playerId", "==", id))),
        storeSdk.getDocs(storeSdk.query(storeSdk.collection(db, ...classRoot, "attempts"), storeSdk.where("ownerId", "==", id))),
        storeSdk.getDocs(storeSdk.query(storeSdk.collection(db, ...classRoot, "comments"), storeSdk.where("authorId", "==", id))),
        storeSdk.getDocs(storeSdk.query(storeSdk.collection(db, ...classRoot, "members"), storeSdk.where("studentId", "==", id)))
      ]);
      const refs = new Map();
      queries.forEach(snapshot => snapshot.docs.forEach(document => refs.set(document.ref.path, document.ref)));
      refs.set(`classes/${classId}/students/${id}`, storeSdk.doc(db, ...classRoot, "students", id));
      await Promise.all([...refs.values()].map(ref => storeSdk.deleteDoc(ref)));
      return refs.size;
    }
    const db = demoDb(classId);
    db.blocked ||= {};
    db.blocked[id] = { studentId: id, deletedAt: now() };
    delete db.students[id];
    Object.keys(db.quizzes).forEach(key => { if (db.quizzes[key]?.ownerId === id) delete db.quizzes[key]; });
    Object.keys(db.attempts).forEach(key => { if (db.attempts[key]?.playerId === id || db.attempts[key]?.ownerId === id) delete db.attempts[key]; });
    Object.keys(db.artifacts || {}).forEach(key => { if (db.artifacts[key]?.ownerId === id) delete db.artifacts[key]; });
    Object.keys(db.comments || {}).forEach(key => { if (db.comments[key]?.authorId === id) delete db.comments[key]; });
    saveDemoDb(db, classId);
    return true;
  }

  async function setQuizStatus(id, status, requestedClassId) {
    if (!["pending", "published"].includes(status)) throw new Error("Invalid quiz status.");
    const classId = requireClass(requestedClassId).id;
    if (hasFirebase()) {
      const { db, storeSdk } = await initCloud();
      await storeSdk.updateDoc(storeSdk.doc(db, "classes", classId, "quizzes", id), { status, updatedAt: now() });
    } else {
      const db = demoDb(classId);
      if (db.quizzes[id]) db.quizzes[id] = { ...db.quizzes[id], status, updatedAt: now() };
      saveDemoDb(db, classId);
    }
  }

  window.CareerCanvasClassroom = {
    config,
    mode: hasFirebase() ? "cloud" : "demo",
    listClasses: classes,
    getClass: classById,
    listTeacherClasses,
    createClass,
    addCoTeacher,
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
    listComments,
    addComment,
    deleteComment,
    teacherSignIn,
    teacherDashboard,
    deleteStudent,
    setQuizStatus,
    setStudentLocked,
    async isTeacherSignedIn() {
      if (!hasFirebase()) return true;
      const services = await initCloud();
      return isGoogleTeacher(services.auth.currentUser);
    }
  };
})();
