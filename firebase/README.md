# Career Canvas classroom backend

The site is connected to the Firebase project `career-canvas-classroom`.

- Firestore location: `nam5`
- Firestore deletion protection: enabled
- Class: `Career Canvas Pilot`
- Class code: `CANVAS26`
- Teacher account: `careercanva.gns@gmail.com`
- Rules source: `firebase/firestore.rules`
- Authentication: Anonymous students + Google teacher sign-in
- Authorized live domain: `jadalin100.github.io`

The class code is an entry code, not a password. Students should choose a nickname rather than a full name.

## Deploy updated database rules

```bash
npx firebase-tools deploy --only firestore:rules --project career-canvas-classroom
```

## Before the first live class

Run one hands-on check on two actual school iPads: join as a student, submit a quiz, approve it from `teacher.html`, and confirm it appears in the class gallery. The automated two-session cloud test passed on September 23, 2026.
