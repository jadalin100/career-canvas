# Career Canvas

**Try it live:** https://career-canvas-classroom.web.app

Career Canvas is a free classroom website that helps middle-school students turn
their interests into real business, creative, and technology projects. Students
take career quizzes, work through short business lessons, build a project in the
studio, and publish finished work to a class gallery. A teacher runs the class
from a dashboard: creating quizzes, reviewing submissions, and tracking progress.

It was built for a Career Development Project at Great Neck South and entered in
the 2026 Congressional App Challenge.

## What it does

| Page | What students and teachers do there |
|---|---|
| `index.html` | Home page with the lesson path, featured student work, and class stats |
| `discover.html`, `quiz.html` | Career, DECA event, digital branding, and college quizzes with instant results |
| `learn.html`, `lesson.html` | Business Lessons: a step-by-step path of short lessons and checks |
| `studio.html` | Project studio: build a project from templates and submit it to the gallery |
| `gallery.html`, `artifact.html` | Class gallery of finished articles, ads, and projects |
| `join.html`, `student.html` | Join a class with a code (no account or email needed) and see your own work |
| `teacher.html`, `quiz-builder.html` | Teacher dashboard (Google sign-in) and a quiz builder for the class |
| `about.html`, `contact.html` | About the project and a contact form for partner businesses |

## How it is built

- Plain HTML, CSS, and JavaScript in `site/`. No framework and no build step for the pages.
- [Firebase](https://firebase.google.com/) for hosting, Firestore (the class database),
  anonymous sign-in for students, and Google sign-in for the teacher.
- Quiz questions are written in Markdown in `quizzes/`; `site/build_quiz_data.py`
  compiles them into `site/quiz-data.js`, which is already built and checked in.
- Firestore security rules are in `firebase/firestore.rules`.

## Run it on your own computer

You need Python 3 (already on macOS and most Linux machines).

```bash
git clone https://github.com/jadalin100/career-canvas.git
cd career-canvas/site
python3 -m http.server 8000
```

Then open <http://localhost:8000>. The pages, quizzes, and lessons work right away.
Class features (joining a class, the gallery, the teacher dashboard) talk to the
project's Firebase backend, which allows `localhost`.

If you edit the quiz files in `quizzes/`, rebuild the quiz data and check it:

```bash
python3 site/build_quiz_data.py
python3 quizzes/verify_deca_quiz.py
```

## Deploy your own copy

1. Create a Firebase project and turn on Firestore, Anonymous sign-in, and Google sign-in.
2. Put your project's web config in `site/classroom-config.js`.
3. Install the Firebase CLI and deploy the site and the security rules:

   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --project <your-project-id>
   ```

## License

[MIT](LICENSE). Made by Jada Lin.
