# Career Canvas — Website MVP

## Purpose

Career Canvas is a guided, student-friendly platform for middle-school students to explore their human strengths, study a real local business, and turn their research into a business paper, advertisement, playable quiz, and digital portfolio.

## MVP scope

The first build stays fully local with no accounts, paid APIs, or student-data collection.

### 1. Public homepage

- Explain the program and the four-step journey.
- Show the four finished deliverables.
- Give students a clear route into the project workspace.
- Give business partners a short explanation of their commitment.

### 2. Student project workspace

- Start or rename one project.
- Record the local business, audience, problem, and project idea.
- Track the four deliverables: business paper, ad, quiz, and portfolio.
- Save progress automatically in the browser using `localStorage`.
- Download a plain-text project summary for backup or sharing.

### 3. Guided quiz builder

- Set a quiz title, short introduction, and audience.
- Add, edit, reorder, and remove multiple-choice questions.
- Mark one correct answer for each question.
- Preview and play the quiz before sharing it.
- Export the quiz as a standalone HTML file that works without an account.

### 4. Existing exploration quizzes

- Keep the Career and DECA Event quizzes working.
- Add a Digital Branding interest quiz.
- Run all three directly inside the Career Canvas homepage.

## Main screens

1. `index.html` — public Career Canvas homepage and exploration quizzes.
2. `studio.html` — project overview and four-deliverable tracker.
3. `quiz-builder.html` — guided quiz creation and playable preview.
4. `quiz.html` — standalone quiz runner retained for exported/offline builds.

## Local data model

- `careerCanvasProject`: project name, business, audience, problem, idea, updated date.
- `careerCanvasDeliverables`: four completion states and notes.
- `careerCanvasQuiz`: title, introduction, audience, and an ordered list of questions with four choices and one correct answer.

## Acceptance criteria

- A student can start a project, refresh, and see the saved information again.
- A student can mark each deliverable complete and download a readable project summary.
- A student can create at least three quiz questions, preview the quiz, answer it, and see a score.
- A student can export the quiz and open the exported HTML without the website.
- All screens work at phone, tablet, and desktop widths.
- Existing quizzes still load and score correctly.
- No login, analytics, network submission, or paid service is required.

## Not in this build

- Teacher accounts, class rosters, cloud syncing, public profiles, AI-generated writing, or live business messaging.
