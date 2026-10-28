// Career Canvas classroom settings. The Firebase values are intentionally blank
// until a Firebase web app is created. The site then runs in an honest,
// same-browser demo mode instead of pretending to sync across iPads.
window.CAREER_CANVAS_CONFIG = {
  classId: "career-canvas-pilot",
  className: "Career Canvas Pilot",
  classCode: "CANVAS26",
  teacherEmail: "careercanva.gns@gmail.com",
  // Classes and teachers now live in the database: any teacher can sign in with Google and create a class.
  // These two classes existed before that change; the first time one of their teachers signs in,
  // the dashboard saves them to the database once. After that, this list is not used.
  legacyClasses: [
    { id: "career-canvas-cac", name: "Career Canvas Demo", code: "CAC2026", teacherEmails: ["careercanva.gns@gmail.com", "jadaxinyulin@gmail.com", "jlin15@student.gn.k12.ny.us"] },
    { id: "career-canvas-pilot", name: "Career Canvas Pilot", code: "CANVAS26", teacherEmails: ["careercanva.gns@gmail.com", "jadaxinyulin@gmail.com", "jlin15@student.gn.k12.ny.us"] }
  ],
  firebase: {
    projectId: "career-canvas-classroom",
    appId: "1:298841013518:web:e3e07d1428e097452f2b5f",
    storageBucket: "career-canvas-classroom.firebasestorage.app",
    apiKey: "AIzaSyBOiRkyP3GLDHB1fCuRQkDxJ-SuLCU5Ppo",
    authDomain: "career-canvas-classroom.firebaseapp.com",
    messagingSenderId: "298841013518"
  }
};
