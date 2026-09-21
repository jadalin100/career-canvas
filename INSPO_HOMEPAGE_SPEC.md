# Career Canvas Inspiration Homepage

## Purpose

Create a single visual-direction homepage for approval before changing the existing quiz website. The page should make a middle-school student want to explore the program while giving parents, educators, and business partners enough structure to trust it.

## Current implementation

The approved visual direction is now the main `site/index.html` homepage. Career,
DECA Event, and Digital Branding quizzes run directly on that page, while the
student studio and quiz builder remain separate tools.

## Story

The page opens with “Discover your creativity” and moves through one connected
journey: discover strengths, research a real business, create original work,
build a quiz app, and showcase the result. The product is framed as a guided
studio rather than a collection of AI generators.

## Sections

1. Navigation and program identity
2. Hero question and interactive compass-path visual
3. Four-stage learning journey
4. Student deliverables
5. Embedded career, DECA, and digital-branding quizzes
6. Business-partner role
7. Final pilot call to action

## Visual direction

- Deep navy `#092454` for trust and structure
- Electric blue `#2563EB` for technology and active states
- Sunflower yellow `#FFD43B` for human energy and progress
- Ice blue `#BFE6FF` for secondary highlights
- Off-white `#F7F8F2` for readable work surfaces
- Oversized condensed-feeling display type, clean humanist body type, and monospaced utility labels
- A continuous compass route is the signature element; it visually connects the program stages

## Interaction

- Smooth internal navigation
- Subtle hero-card tilt on pointer movement
- Scroll reveal for journey and deliverable cards
- Full keyboard focus styles
- Reduced-motion support

## Acceptance criteria

- Works as a standalone local page without accounts, APIs, or a build step
- Looks intentional at desktop, tablet, and mobile widths
- Contains no invented partner endorsements, statistics, or testimonials
- Every link and button has a working destination
- All three active quizzes load and score on the homepage
- No console errors during a complete homepage scroll-through
