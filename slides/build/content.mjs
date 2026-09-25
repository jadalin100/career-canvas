// Content for all seven Career Canvas meeting decks.
// Every content slide carries a `source` footer line and the full URLs in
// speaker notes. Each source below was opened and read on 2026-09-21.
import { C } from "./deck_kit.mjs";

export const ACCESSED = "September 21, 2026";

const S = {
  wef: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/3-skills-outlook/",
  decaCompete: "https://www.deca.org/compete",
  finance: "https://www.investopedia.com/terms/f/finance.asp",
  marketing: "https://www.investopedia.com/terms/m/marketing.asp",
  entrepreneur: "https://www.investopedia.com/terms/e/entrepreneur.asp",
  businessModel: "https://www.investopedia.com/terms/b/businessmodel.asp",
  valueProp: "https://www.investopedia.com/terms/v/valueproposition.asp",
  targetMarket: "https://www.investopedia.com/terms/t/target-market.asp",
  marketResearch: "https://www.investopedia.com/terms/m/market-research.asp",
  swot: "https://www.investopedia.com/terms/s/swot.asp",
  fourPs: "https://www.investopedia.com/terms/f/four-ps.asp",
  advantage: "https://www.investopedia.com/terms/c/competitive_advantage.asp",
  brand: "https://www.investopedia.com/terms/b/brand.asp",
  businessPlan: "https://www.investopedia.com/terms/b/business-plan.asp",
  digital: "https://www.investopedia.com/terms/d/digital-marketing.asp",
  pitch: "https://www.investopedia.com/terms/e/elevatorpitch.asp",
  owl: "https://owl.purdue.edu/owl/research_and_citation/conducting_research/evaluating_sources_of_information/general_guidelines.html",
  testing: "https://doi.org/10.1111/j.1467-9280.2006.01693.x",
};

const lib = {
  wef: ["World Economic Forum", "Future of Jobs Report 2025, Skills Outlook", "weforum.org/publications/the-future-of-jobs-report-2025", S.wef],
  decaCompete: ["DECA", "Competitive Events Program", "deca.org/compete", S.decaCompete],
  finance: ["Investopedia", "Finance", "investopedia.com/terms/f/finance.asp", S.finance],
  marketing: ["Investopedia", "Marketing", "investopedia.com/terms/m/marketing.asp", S.marketing],
  entrepreneur: ["Investopedia", "Entrepreneur", "investopedia.com/terms/e/entrepreneur.asp", S.entrepreneur],
  businessModel: ["Investopedia", "Business Model", "investopedia.com/terms/b/businessmodel.asp", S.businessModel],
  valueProp: ["Investopedia", "Value Proposition", "investopedia.com/terms/v/valueproposition.asp", S.valueProp],
  targetMarket: ["Investopedia", "Target Market", "investopedia.com/terms/t/target-market.asp", S.targetMarket],
  marketResearch: ["Investopedia", "Market Research", "investopedia.com/terms/m/market-research.asp", S.marketResearch],
  swot: ["Investopedia", "SWOT Analysis", "investopedia.com/terms/s/swot.asp", S.swot],
  fourPs: ["Investopedia", "The 4 Ps of Marketing", "investopedia.com/terms/f/four-ps.asp", S.fourPs],
  advantage: ["Investopedia", "Competitive Advantage", "investopedia.com/terms/c/competitive_advantage.asp", S.advantage],
  brand: ["Investopedia", "Brand and Brand Identity", "investopedia.com/terms/b/brand.asp", S.brand],
  businessPlan: ["Investopedia", "Business Plan", "investopedia.com/terms/b/business-plan.asp", S.businessPlan],
  digital: ["Investopedia", "Digital Marketing", "investopedia.com/terms/d/digital-marketing.asp", S.digital],
  pitch: ["Investopedia", "Elevator Pitch", "investopedia.com/terms/e/elevatorpitch.asp", S.pitch],
  owl: ["Purdue OWL", "Evaluating Sources: General Guidelines", "owl.purdue.edu/owl/research_and_citation", S.owl],
  testing: ["Roediger & Karpicke (2006)", "Test-Enhanced Learning, Psychological Science 17(3), 249-255", "doi.org/10.1111/j.1467-9280.2006.01693.x", S.testing],
};

const JOURNEY = [
  ["1", "DISCOVER", "Name the human strengths you actually bring.", C.blue],
  ["2", "RESEARCH", "Study one real business with evidence.", C.coral],
  ["3", "BUILD", "Turn the research into a paper, an ad, and an app.", C.navy],
  ["4", "SHOWCASE", "Present the work and collect real feedback.", C.teal],
];


// Each meeting is run, not presented. One teaching anchor, then timed rounds
// that each hand the student a piece of one of the four producibles:
// the business paper, the ad, the quiz app, and the portfolio.
const plan = (rows) => rows.map(([n, name, desc, color]) => [n, name, desc, color]);

const ORIGINAL_DECKS = [

// ───────────────────────────── MEETING 1 ─────────────────────────────
// Producible fed: the concept sketch that becomes the business choice.
{
  file: "Career_Canvas_Meeting_1_Creativity_Across_DECA_Areas",
  slides: [
    ["cover", {
      title: "Creativity across\nbusiness",
      sub: "Five timed rounds, five DECA career areas, one idea you build and defend",
      meeting: "Meeting 1",
      figure: "wefSkills",
      sources: [S.wef],
      notes: "The chart is the Future of Jobs 2025 core-skills ranking; creative thinking is fourth. Do not open with a lecture. Ask where they used creativity today without making art, take two answers, and go straight to the anchor slide.",
    }],
    ["statement", {
      kicker: "The only thing we teach today",
      title: "Creative thinking is a business skill.",
      stat: "#4",
      statText: "Creative thinking ranks fourth among the core skills employers say workers need today.",
      footline: "So we are not going to talk about it. You get five rounds, five business lenses, and a concept sketch at the end.",
      source: "Source: World Economic Forum, Future of Jobs Report 2025, Skills Outlook",
      sources: [S.wef],
      notes: "Keep this to three minutes. Analytical thinking is first and creative thinking fourth, just ahead of motivation and self-awareness. The point is only to justify the next 50 minutes of doing.",
    }],
    ["pipeline", {
      kicker: "Run of show", title: "Five rounds. Five ways to be creative.",
      sub: "Each round is a real business problem from one DECA career area. You produce something in every one.",
      stages: plan([
        ["6", "ROUNDS 1 TO 2", "Finance and marketing. Money and message.", C.blue],
        ["6", "ROUND 3", "Entrepreneurship. A complaint becomes an offer.", C.coral],
        ["6", "ROUNDS 4 TO 5", "Hospitality and operations. Feel and flow.", C.navy],
        ["20", "THE BUILD", "Pick your best round and make the sketch.", C.teal],
      ]),
      source: "Source: DECA, Competitive Events Program career clusters",
      sources: [S.decaCompete],
      notes: "The numbers on the circles are minutes, not step numbers. DECA's events sit in marketing, business management and administration, finance, and hospitality and tourism, plus entrepreneurship and personal financial literacy.",
    }],
    ["round", {
      label: "Round 1 of 5 · Finance", minutes: 6,
      task: "Build a budget that survives bad news.",
      steps: [
        "You have $500 to launch a school pop-up. Write five lines of spending.",
        "Circle the one line you would protect if you lost half the money.",
        "Now one cost doubles. Rewrite the budget without cutting the circled line.",
      ],
      grounding: "Finance is the study and management of money and financial resources. (Investopedia)",
      produces: "A five-line budget with one protected item",
      producesNote: "Keep this. It is the first evidence you can make a trade-off on purpose.",
      source: "Source: Investopedia, Finance", sources: [S.finance],
      notes: "Facilitation: 2 minutes to draft, 1 to circle, 3 to rewrite. Walk the room and ask what got cut, not what got kept. The creative act is the trade-off, not the list.",
    }],
    ["round", {
      label: "Round 2 of 5 · Marketing", minutes: 6,
      task: "Sell the same thing three different ways.",
      steps: [
        "A student tutoring service. Write one sentence selling it to a student.",
        "Rewrite it for a parent. Then rewrite it for a principal.",
        "Read all three to a partner. Nothing in them may be untrue.",
      ],
      grounding: "Marketing is everything a company does to promote and sell what it offers. (Investopedia)",
      produces: "Three one-line messages for three audiences",
      producesNote: "This is the exact move you will make for a real business in Meeting 5.",
      source: "Source: Investopedia, Marketing", sources: [S.marketing, S.fourPs],
      notes: "Facilitation: 3 minutes to write all three, 3 to read in pairs. If a pair finds a sentence that stretched the truth, read it aloud to the room. That is the lesson.",
    }],
    ["round", {
      label: "Round 3 of 5 · Entrepreneurship", minutes: 6,
      task: "Turn a complaint into something people would choose.",
      steps: [
        "Write down one thing about school that genuinely annoys you.",
        "Rewrite it as a need: someone wants ___ but cannot get it because ___.",
        "Write the offer. It only counts if students would use it unforced.",
      ],
      grounding: "An entrepreneur spots an opportunity and takes on the risk of building something to meet it. (Investopedia)",
      produces: "One need statement and one offer",
      producesNote: "Most concept sketches at the end of today come out of this round.",
      source: "Source: Investopedia, Entrepreneur", sources: [S.entrepreneur],
      notes: "Facilitation: 1 minute to complain, 2 to reframe, 3 to write the offer. The unforced test is what kills the assembly-mandate ideas.",
    }],
    ["round", {
      label: "Round 4 of 5 · Hospitality", minutes: 6,
      task: "Fix ten bad minutes for a real person.",
      steps: [
        "A family arrives early, tired, and their room is not ready.",
        "Write a four-step recovery, one line each, that takes ten minutes.",
        "Mark the step that costs the business nothing.",
      ],
      grounding: "Hospitality and tourism is one of DECA's four career clusters: service, operations, and the guest experience.",
      produces: "A four-step service recovery script",
      producesNote: "Notice how much of it was free. That is usually where the creativity was.",
      source: "Source: DECA, Competitive Events Program career clusters", sources: [S.decaCompete],
      notes: "Facilitation: 4 minutes to write, 2 to share one script aloud. Ask the room which step they would actually remember a week later.",
    }],
    ["round", {
      label: "Round 5 of 5 · Business administration", minutes: 6,
      task: "Kill the lunch line without spending anything.",
      steps: [
        "Sketch how the school store line works now, as five boxes.",
        "Cross out every box that does not have to happen at the counter.",
        "Redraw it. No new staff, no more space, no new equipment.",
      ],
      grounding: "Business management and administration coordinates people, information, and operations to meet goals.",
      produces: "A before-and-after process sketch",
      producesNote: "A process change can beat a marketing campaign. This round proves it fastest.",
      source: "Source: DECA, Competitive Events Program career clusters", sources: [S.decaCompete],
      notes: "Facilitation: 2 minutes to draw, 1 to cross out, 3 to redraw. The constraint line is the whole exercise; do not let anyone add staff.",
    }],
    ["checklist", {
      kicker: "Pick one", title: "Which of your five is actually worth building?",
      sub: "Two minutes. Run every round you just did against these six, and keep the one that scores highest.",
      items: [
        "It solves a problem you can name in one sentence.",
        "A specific person benefits, not everyone.",
        "It works under the limit you were given.",
        "Someone would choose it without being told to.",
        "You could test it this month.",
        "You still want to talk about it.",
      ],
      aside: "If two rounds tie, take the one you argued about with your partner. Disagreement usually means there is something real there.",
      source: "Career Canvas selection bar",
      notes: "Two minutes, silent, individual. Do not let this turn into a discussion or the build slot disappears.",
    }],
    ["challenge", {
      kicker: "The build", title: "Make the concept sketch.", minutes: 20,
      steps: [
        ["01", "Name the business or place, and the DECA area you are working in."],
        ["02", "Write the need and the constraint in one sentence each."],
        ["03", "Draw or describe the idea. One page, no more."],
        ["04", "Write the smallest test that would tell you if you are wrong."],
      ],
      deliverable: { big: "One-page\nconcept\nsketch", note: "You will be asked to defend one choice in it." },
      source: "Career Canvas Meeting 1 build",
      notes: "Timing: 3 to frame, 10 to make, 4 for the test, 3 to prepare the defense. Circulate and ask only one question: what evidence would change your mind?",
    }],
    ["closer", {
      kicker: "Defend it", title: "Sixty seconds each. Say the choice, not the idea.",
      exit: ["What constraint made it better?", "Who exactly is it for?", "What would you test first?"],
      next: { title: "Meet the business", body: "Meet the partner businesses, take apart how one of them actually makes money, and leave with five research questions." },
      source: "Career Canvas Meeting 1",
      notes: "Collect the sketches. They are the raw material for which business each student wants to study in Meeting 2.",
    }],
    ["sourceLibrary", { entries: [lib.wef, lib.decaCompete, lib.finance, lib.marketing, lib.entrepreneur, lib.fourPs] }],
  ],
},

// ───────────────────────────── MEETING 2 ─────────────────────────────
// Producible fed: the business choice and the five research questions.
{
  file: "Career_Canvas_Meeting_2_Meet_The_Business",
  slides: [
    ["cover", {
      title: "Meet the\nbusiness",
      sub: "Take a real business apart, meet the people who run one, and leave with five questions",
      meeting: "Meeting 2",
      notes: "Open by naming one business every student has been inside this month. Do not explain it. Round 1 makes them explain it.",
    }],
    ["statement", {
      kicker: "The only thing we teach today",
      title: "A business model is a plan for making money.",
      stat: "4",
      statText: "Products or services, target customers, revenue sources, cost structure. Four boxes.",
      footline: "Fill those four boxes for any business on your street and you can ask it a real question. That is the whole meeting.",
      source: "Source: Investopedia, Business Model",
      sources: [S.businessModel],
      notes: "Three minutes maximum. Investopedia defines a business model as a plan outlining what a company will do to create and deliver value to customers in order to make a profit.",
    }],
    ["pipeline", {
      kicker: "Run of show", title: "Take one apart. Then choose your own.",
      sub: "Everything you make for the rest of the program comes out of the choice you make in the last round.",
      stages: plan([
        ["8", "ROUND 1", "Reverse-engineer a business everyone knows.", C.blue],
        ["10", "ROUNDS 2 TO 3", "Write its value and its customer, in one line each.", C.coral],
        ["15", "ROUND 4", "The partner business is in the room. Ask them.", C.navy],
        ["12", "ROUND 5 AND BUILD", "Choose your business. Write five questions.", C.teal],
      ]),
      source: "Career Canvas program structure",
      notes: "A business representative joins for 10 to 15 minutes in Round 4, in person or by a short recorded introduction. Send them the Round 4 slide in advance.",
    }],
    ["round", {
      label: "Round 1 of 5 · Reverse-engineer", minutes: 8,
      task: "Fill four boxes for a business you already know.",
      steps: [
        "Pick somewhere you have been in the last month. Write its name.",
        "Fill in: what it sells, who buys, where the money comes from, what it costs them to run.",
        "Trade with a partner. Mark every box you filled by guessing.",
      ],
      grounding: "Those four boxes are what a business model is: products, target customers, revenue, cost structure. (Investopedia)",
      produces: "Four filled boxes and a list of your own guesses",
      producesNote: "The guesses matter more than the answers. Those are research questions.",
      source: "Source: Investopedia, Business Model", sources: [S.businessModel],
      notes: "Facilitation: 4 minutes to fill, 4 to trade and mark. Most students discover they cannot answer the cost box. Say out loud that this is normal and it is exactly what research is for.",
    }],
    ["round", {
      label: "Round 2 of 5 · Value", minutes: 5,
      task: "Write the promise, without using the word quality.",
      steps: [
        "Take the last thing you bought with your own money.",
        "Write one sentence: why you chose it over the alternative.",
        "Banned words: best, quality, amazing, great. Rewrite if you used one.",
      ],
      grounding: "A value proposition states the unique value a product delivers to a specific customer. (Investopedia)",
      produces: "One value proposition in your own words",
      producesNote: "You will write one of these about your chosen business in Meeting 4.",
      source: "Source: Investopedia, Value Proposition", sources: [S.valueProp],
      notes: "Investopedia's bar: clear, concise, understandable at a glance, and it shows what a brand offers that competitors do not. The banned-words rule is what forces specificity.",
    }],
    ["round", {
      label: "Round 3 of 5 · Customer", minutes: 5,
      task: "Describe one customer so exactly that someone could find them.",
      steps: [
        "Write who buys from the business in Round 1.",
        "Use at least two of: demographic, geographic, psychographic, behavioral.",
        "Read it to a partner. If it could be them and also their grandmother, narrow it.",
      ],
      grounding: "A target market is the specific slice of consumers a company aims to serve, not the general public. (Investopedia)",
      produces: "A customer description you could act on",
      producesNote: "This becomes the target-customer section of your paper and the audience for your ad.",
      source: "Source: Investopedia, Target Market", sources: [S.targetMarket],
      notes: "Investopedia lists four segments: demographic, geographic, psychographic, and behavioral. The narrowing test is the activity; two rounds of it is usually enough.",
    }],
    ["round", {
      label: "Round 4 of 5 · The partner is here", minutes: 15,
      task: "Ask the business the things you could not find out.",
      steps: [
        "Before they speak: write two questions from your guess list in Round 1.",
        "They take 10 minutes: who they are, what sells most, who buys, what is hard right now.",
        "You take 5: ask your two questions and write the answers down verbatim.",
      ],
      grounding: "An answer from the owner is primary data. An article about them is secondary. You need both. (Investopedia)",
      produces: "Two answers, in the owner's own words",
      producesNote: "Quote these in your paper. Nobody else in the room will have them.",
      source: "Source: Investopedia, Market Research", sources: [S.marketResearch],
      notes: "Send the four bullets in step 2 to the representative in advance so they do not improvise. If they send a recording instead, run the questions as a written list you forward afterwards.",
    }],
    ["round", {
      label: "Round 5 of 5 · Choose", minutes: 7,
      task: "Pick the business you will study for six weeks.",
      steps: [
        "Shortlist three: the partner, one from your sketch, one you are curious about.",
        "For each, try to name a competitor and one public source in 60 seconds.",
        "Keep the one you got furthest with. That is your business.",
      ],
      grounding: "If you cannot find three independent sources this week, study the industry instead of the single business.",
      produces: "One business, chosen on evidence",
      producesNote: "Changing later costs you a meeting, so choose on what you can research, not what you like.",
      source: "Source: Investopedia, Market Research", sources: [S.marketResearch],
      notes: "The 60-second limit is deliberate. A business nobody can source in a minute will not get easier in Meeting 3.",
    }],
    ["challenge", {
      kicker: "The build", title: "Write five questions you cannot answer yet.", minutes: 12,
      steps: [
        ["01", "One about the product or service itself."],
        ["02", "One about who the customer is and why."],
        ["03", "One about a competitor or an alternative."],
        ["04", "One about how the business reaches people."],
        ["05", "One about the challenge the business is facing."],
      ],
      deliverable: { big: "Five\nresearch\nquestions", note: "None of them may be answerable yes or no." },
      source: "Career Canvas Meeting 2 build",
      notes: "Check each question against the four business-model boxes. If all five land on the product, the student has not really chosen a business yet.",
    }],
    ["closer", {
      kicker: "Before you leave", title: "Read your hardest question out loud. Someone may already know where to look.",
      exit: ["Which business did you choose?", "Which question matters most?", "Where will you look first?"],
      next: { title: "Business research lab", body: "Bring your five questions. You will hunt sources, throw some out, and leave with findings you can defend." },
      source: "Career Canvas Meeting 2",
      notes: "Assignment: find at least three sources about the chosen business before Meeting 3 and write down where each one came from.",
    }],
    ["sourceLibrary", { entries: [lib.businessModel, lib.valueProp, lib.targetMarket, lib.marketResearch, lib.decaCompete, lib.businessPlan] }],
  ],
},

// ───────────────────────────── MEETING 3 ─────────────────────────────
// Producible fed: the sourced findings behind the business paper.
{
  file: "Career_Canvas_Meeting_3_Business_Research_Lab",
  slides: [
    ["cover", {
      title: "Business\nresearch lab",
      sub: "Five rounds of hunting, judging, and throwing sources out",
      meeting: "Meeting 3",
      notes: "Open by reading a confident claim about a local business with nothing behind it. Ask how we would check. Then start Round 1.",
    }],
    ["statement", {
      kicker: "The only thing we teach today",
      title: "Two kinds of data, and you need both.",
      stat: "2",
      statText: "Primary data is what you collect yourself. Secondary data already exists somewhere else.",
      footline: "Your interview answer from last meeting is primary. Everything you find today is secondary. Today you get both on paper.",
      source: "Source: Investopedia, Market Research",
      sources: [S.marketResearch],
      notes: "Three minutes. Market research gathers and analyzes data about consumers, competitors, and market trends using surveys, interviews, focus groups, and product testing.",
    }],
    ["compare", {
      kicker: "Your judging card", title: "Keep this in front of you all meeting.",
      sub: "You will run every source you find today against these two columns. It is the tool, not a lecture.",
      left: {
        heading: "Keep it",
        points: [
          "A named author with relevant expertise.",
          "Facts separated from opinion.",
          "Objective language, not loaded language.",
          "The claim shows up in a second source.",
          "It cites where its own information came from.",
        ],
      },
      right: {
        heading: "Cut it",
        points: [
          "No author you can check.",
          "Opinion presented as settled fact.",
          "Adjectives doing the persuading.",
          "The only place the claim appears.",
          "Out of date for a question that moves.",
        ],
      },
      source: "Source: Purdue OWL, Evaluating Sources: General Guidelines",
      sources: [S.owl],
      notes: "Purdue OWL's criteria: author expertise, intended audience, fact versus opinion versus propaganda, objective language, sufficient evidence, cross-referencing, timeliness, and a reference list. Print this slide as a handout if you can.",
    }],
    ["round", {
      label: "Round 1 of 5 · Triage", minutes: 7,
      task: "Throw a source out and be able to say why.",
      steps: [
        "Take the three sources you brought. Do not read them fully.",
        "Run each one against the judging card. Write keep or cut, plus the reason.",
        "You must cut at least one. If all three survive, your standard is too low.",
      ],
      grounding: "Cross-referencing is the fastest check: does the claim appear anywhere else? (Purdue OWL)",
      produces: "Three verdicts with reasons attached",
      producesNote: "The cut one is the most useful thing here. You now know what bad looks like.",
      source: "Source: Purdue OWL, Evaluating Sources: General Guidelines", sources: [S.owl],
      notes: "Facilitation: 5 minutes working, 2 minutes of cut sources read aloud. Students who brought nothing pair with someone who did.",
    }],
    ["round", {
      label: "Round 2 of 5 · Hunt", minutes: 12,
      task: "Answer three of your five questions, with receipts.",
      steps: [
        "Pick three questions. Find one source that could answer each.",
        "Log the link and today's date next to every one.",
        "Write the answer in your own words, in one or two sentences.",
      ],
      grounding: "An answer with no link and no date does not survive to the paper. Log it now or lose it.",
      produces: "Three sourced findings, logged",
      producesNote: "These are the first real sentences of your business paper.",
      source: "Source: Investopedia, Market Research", sources: [S.marketResearch, S.owl],
      notes: "Facilitation: circulate and ask students to read you the source, not the finding. If they cannot say where it came from, the round is not done for them.",
    }],
    ["round", {
      label: "Round 3 of 5 · Competitor sweep", minutes: 8,
      task: "Name who your business could lose a customer to.",
      steps: [
        "List two businesses your customer could choose instead.",
        "For each, write the one sentence they would say about why they are the better choice.",
        "Now write the honest sentence your business would say back.",
      ],
      grounding: "A competitive advantage is the edge that lets a company outperform rivals: cost, brand, quality, distribution, or service. (Investopedia)",
      produces: "Two competitors and three positioning sentences",
      producesNote: "This is the competitors section of your paper, already drafted.",
      source: "Source: Investopedia, Competitive Advantage", sources: [S.advantage],
      notes: "Investopedia names two types: comparative advantage, producing the same thing more cheaply, and differential advantage, offering something hard to copy. Push students to say which one their business has.",
    }],
    ["round", {
      label: "Round 4 of 5 · Sort it", minutes: 7,
      task: "Put your findings in four boxes and find the empty one.",
      steps: [
        "Draw four boxes: strengths, weaknesses, opportunities, threats.",
        "Place every finding you have into the box where it belongs.",
        "Name the emptiest box out loud. That is your next research question.",
      ],
      grounding: "Strengths and weaknesses are internal to the business. Opportunities and threats are external. (Investopedia)",
      produces: "A filled SWOT with one named gap",
      producesNote: "The gap is worth more than the full boxes. It tells you where to look next.",
      source: "Source: Investopedia, SWOT Analysis", sources: [S.swot],
      notes: "Investopedia stresses SWOT works when people supply realistic data points rather than prescribed messaging. An empty threats box usually means the student is being polite, not thorough.",
    }],
    ["round", {
      label: "Round 5 of 5 · Go get primary data", minutes: 8,
      task: "Write three questions you will actually send or ask.",
      steps: [
        "Aim them at your emptiest SWOT box.",
        "No yes-or-no questions and no questions a website already answers.",
        "Decide now: email, visit, or observe. Write which, and when.",
      ],
      grounding: "Primary data is what you gather directly. It is the part of your paper nobody else can copy. (Investopedia)",
      produces: "Three questions and a plan to ask them",
      producesNote: "Send them before Meeting 4. An owner's sentence outranks any article.",
      source: "Source: Investopedia, Market Research", sources: [S.marketResearch],
      notes: "Make the when concrete. A question with no date attached does not get asked.",
    }],
    ["challenge", {
      kicker: "The build", title: "Write up your findings so a stranger could check them.", minutes: 10,
      steps: [
        ["01", "One line per finding, in your own words."],
        ["02", "Link and date under each one."],
        ["03", "Mark which are primary and which are secondary."],
        ["04", "List the questions still open at the bottom."],
      ],
      deliverable: { big: "A sourced\nfindings\nlog", note: "This is what you write the paper from next meeting." },
      source: "Career Canvas Meeting 3 build",
      notes: "Students who arrive at Meeting 4 without this cannot draft. Say that now, not next week.",
    }],
    ["closer", {
      kicker: "Before you leave", title: "Name the source you threw out and the finding that surprised you.",
      exit: ["Which finding surprised you?", "Which source did you cut, and why?", "What is still unanswered?"],
      next: { title: "Write the business spotlight", body: "Turn the findings log into a one-page paper with one claim, real evidence, and your own analysis." },
      source: "Career Canvas Meeting 3",
      notes: "Assignment: finish all five questions with sources logged, and send the primary-data questions from Round 5.",
    }],
    ["sourceLibrary", { entries: [lib.marketResearch, lib.owl, lib.advantage, lib.swot, lib.businessModel, lib.businessPlan] }],
  ],
},

// ───────────────────────────── MEETING 4 ─────────────────────────────
// Producible built: the one-page business paper.
{
  file: "Career_Canvas_Meeting_4_Write_The_Business_Spotlight",
  slides: [
    ["cover", {
      title: "Write the\nbusiness spotlight",
      sub: "Five writing rounds that assemble into the one-page paper before you leave",
      meeting: "Meeting 4",
      notes: "Open by reading two sentences about the same business: one that only describes, one that makes a claim. Take a show of hands on which is worth reading, then start Round 1.",
    }],
    ["statement", {
      kicker: "The only thing we teach today",
      title: "A paper is one claim, held up by evidence.",
      stat: "1",
      statText: "One page, one business, one thing you are actually arguing. Everything else is support.",
      footline: "A business plan does the same job for a company: goals, market, strategy, and the numbers behind them.",
      source: "Source: Investopedia, Business Plan",
      sources: [S.businessPlan],
      notes: "Three minutes. Investopedia describes a business plan as a strategic roadmap with an executive summary, market analysis, marketing strategy, and financial projections. Students are writing a much shorter version about someone else's business.",
    }],
    ["round", {
      label: "Round 1 of 5 · Claim sprint", minutes: 6,
      task: "Write three claims. Keep one.",
      steps: [
        "Look only at your findings log. Write three sentences that could be true about this business.",
        "Cross out any that are just descriptions. A claim can be argued with.",
        "Circle the one you have the most evidence for, not the one you like most.",
      ],
      grounding: "If nobody could disagree with your sentence, it is a fact, not a claim.",
      produces: "One claim your paper will defend",
      producesNote: "Everything you write for the rest of the meeting hangs off this sentence.",
      source: "Source: Investopedia, Business Plan", sources: [S.businessPlan],
      notes: "Facilitation: 3 minutes to write, 3 to cut. Read two or three claims aloud and ask the room to argue with them. A claim nobody can argue with goes back for a rewrite.",
    }],
    ["round", {
      label: "Round 2 of 5 · Evidence match", minutes: 7,
      task: "Sort your findings under the claim and find the orphans.",
      steps: [
        "List every finding that supports the claim directly underneath it.",
        "Put the rest in a second pile labelled interesting but unused.",
        "Count the first pile. Fewer than three means the claim is too big or the research is thin.",
      ],
      grounding: "Evidence that does not support the claim it sits under is still the wrong evidence. (Purdue OWL)",
      produces: "A claim with its evidence stacked under it",
      producesNote: "The unused pile is not wasted. Most of it belongs in another section.",
      source: "Source: Purdue OWL, Evaluating Sources: General Guidelines", sources: [S.owl],
      notes: "The count in step 3 is the real diagnostic. Students with one supporting finding need a smaller claim, not more adjectives.",
    }],
    ["round", {
      label: "Round 3 of 5 · Weak-sentence hunt", minutes: 6,
      task: "Underline every sentence you cannot back up.",
      steps: [
        "Go through your notes and underline anything using best, popular, or high quality.",
        "Underline anything with no source next to it.",
        "Fix three of them. Cut any you cannot fix.",
      ],
      grounding: "A claim a reader cannot check does not count, in your writing or anyone else's. (Purdue OWL)",
      produces: "Three rewritten sentences and a shorter draft",
      producesNote: "Cutting is progress here. A shorter honest page beats a full page of adjectives.",
      source: "Source: Purdue OWL, Evaluating Sources: General Guidelines", sources: [S.owl],
      notes: "This round is where most of the lesson lands. Do not let students skip to polishing sentences before they have done it.",
    }],
    ["round", {
      label: "Round 4 of 5 · Paragraph build", minutes: 7,
      task: "Write four sentences in this exact order.",
      steps: [
        "Claim: this bakery competes on being walkable, not cheap.",
        "Evidence and source: its two nearest competitors are over a mile away, checked on their own sites in September 2026.",
        "Analysis: location is its edge, and a new shop nearby would erase it.",
        "Now write your own four, about your business, on any section you like.",
      ],
      grounding: "Claim, evidence, source, analysis. Read together it is ordinary prose, not a form.",
      produces: "One finished paragraph of your paper",
      producesNote: "Copy this shape for every section. It is the whole writing technique.",
      source: "Sources: Investopedia, Competitive Advantage; Purdue OWL", sources: [S.advantage, S.owl],
      notes: "The bakery example is a differential advantage in Investopedia's terms: something hard for a rival to copy quickly. Read the four sentences aloud as one paragraph first so students hear it.",
    }],
    ["round", {
      label: "Round 5 of 5 · So what", minutes: 5,
      task: "Write the sentence only you could write.",
      steps: [
        "Take one finding. Write what it implies, not what it says.",
        "Then write what would have to change for you to be wrong.",
        "No new facts allowed. This is analysis, not more research.",
      ],
      grounding: "Analysis is the part a judge, a teacher, or the business owner will actually respond to.",
      produces: "Your opportunity-or-challenge paragraph",
      producesNote: "If anyone in the room could have written your sentence, rewrite it.",
      source: "Source: Purdue OWL, Evaluating Sources: General Guidelines", sources: [S.owl],
      notes: "Collect two or three so-what sentences aloud before the build starts. It sets the bar better than any explanation.",
    }],
    ["checklist", {
      kicker: "The eight sections", title: "Your page is done when all eight are filled.",
      sub: "Assemble what the five rounds produced. Most of these are already written.",
      items: [
        "Business overview",
        "Target customer",
        "Customer need",
        "Products or services",
        "Marketing approach",
        "Competitors",
        "One opportunity or challenge",
        "Sources",
      ],
      aside: "Every section except the overview needs at least one thing you learned from a source, not from the storefront.",
      source: "Sources: Investopedia, Business Plan and Business Model",
      sources: [S.businessPlan, S.businessModel],
      notes: "Point at which round produced which section. Students usually realize they have already written five of the eight.",
    }],
    ["challenge", {
      kicker: "The build", title: "Assemble the page and submit it.", minutes: 20,
      steps: [
        ["01", "Drop your round outputs into the eight sections."],
        ["02", "Fill the gaps without stopping to polish."],
        ["03", "Run the weak-sentence hunt one more time on the whole page."],
        ["04", "Add your sources list with links and dates."],
      ],
      deliverable: { big: "One-page\nbusiness\nspotlight", note: "Submitted for feedback before you leave." },
      source: "Career Canvas Meeting 4 build",
      notes: "Feedback should target unsupported claims and missing analysis, not grammar.",
    }],
    ["closer", {
      kicker: "Before you leave", title: "Say your claim out loud in one sentence.",
      exit: ["What is your paper's one claim?", "Which section was hardest to source?", "What did you cut?"],
      next: { title: "Create for a real audience", body: "Take the customer you just described and build an advertisement aimed at that exact person." },
      source: "Career Canvas Meeting 4",
      notes: "Anyone who cannot say the claim in one sentence has written a summary, not a paper. Flag it in the feedback.",
    }],
    ["sourceLibrary", { entries: [lib.businessPlan, lib.businessModel, lib.owl, lib.advantage, lib.marketResearch, lib.valueProp] }],
  ],
},

// ───────────────────────────── MEETING 5 ─────────────────────────────
// Producible built: the advertisement and the reasoning behind it.
{
  file: "Career_Canvas_Meeting_5_Create_For_A_Real_Audience",
  slides: [
    ["cover", {
      title: "Create for a\nreal audience",
      sub: "Four decisions, five rounds, one ad the business will actually see",
      meeting: "Meeting 5",
      notes: "Open by showing an ad everyone has seen and asking who it was built for. Push past everyone, then go to the anchor.",
    }],
    ["statement", {
      kicker: "The only thing we teach today",
      title: "An ad is the promotion decision.",
      stat: "4",
      statText: "Product, price, place, promotion. Your ad is the fourth one, and it only works if the other three are true.",
      footline: "Advertising a nine-dollar sandwich as a bargain fails no matter how good the design is.",
      source: "Source: Investopedia, The 4 Ps of Marketing",
      sources: [S.fourPs, S.marketing],
      notes: "Three minutes. The four Ps were popularized by Neil Borden in the 1950s and refined by E. Jerome McCarthy. Services marketing later added people, process, and physical evidence.",
    }],
    ["round", {
      label: "Round 1 of 5 · Teardown", minutes: 8,
      task: "Judge two real ads before you make your own.",
      steps: [
        "For each ad on the next slide, name the audience, the message, the first thing you look at, and the next step.",
        "Score each of the four out of two. Eight is a perfect ad.",
        "Cover them up. Describe one from memory. That is the real test.",
      ],
      grounding: "Digital channels let you target a specific audience and measure the result, so the audience decision comes first. (Investopedia)",
      produces: "A scoring habit you will use on your own ad",
      producesNote: "Everything you just criticized, you are about to be asked to do.",
      source: "Sources: Investopedia, Marketing and Digital Marketing", sources: [S.marketing, S.digital],
      notes: "Facilitation: 5 minutes scoring in pairs, 3 minutes on the memory test. Put the next slide up while they work.",
    }],
    ["compare", {
      kicker: "Round 1 material", title: "Two ads for the same bakery.",
      sub: "Score each on audience, message, visual, and call to action. Do not score them on which looks nicer.",
      left: {
        heading: "Ad A",
        points: [
          "Audience: parents doing school pickup nearby.",
          "Message: fresh bread ready at 3 p.m.",
          "Visual: one photo, readable from across a street.",
          "Call to action: a time and a street name.",
        ],
      },
      right: {
        heading: "Ad B",
        points: [
          "Audience: anyone who likes food.",
          "Message: quality baked goods since 1998.",
          "Visual: six photos and three fonts.",
          "Call to action: none, or visit us today.",
        ],
      },
      source: "Sources: Investopedia, Marketing and Brand",
      sources: [S.marketing, S.brand],
      notes: "Ask which one they could describe correctly tomorrow. That question does more work than any explanation of design principles.",
    }],
    ["round", {
      label: "Round 2 of 5 · Audience lock", minutes: 5,
      task: "Write your audience in one sentence, from your own paper.",
      steps: [
        "Open the target-customer section you wrote in Meeting 4.",
        "Write: age or role, where they are, and what they care about.",
        "Read it to a partner. If it fits them and their grandmother, narrow it.",
      ],
      grounding: "A target market is a slice of consumers with shared characteristics, not the general public. (Investopedia)",
      produces: "The audience line for your ad",
      producesNote: "Do not invent a new audience here. Use the one you researched.",
      source: "Source: Investopedia, Target Market", sources: [S.targetMarket],
      notes: "Students who want to switch audiences usually did not finish the target-customer section. Send them back to the paper.",
    }],
    ["round", {
      label: "Round 3 of 5 · Message cut", minutes: 6,
      task: "Get it to ten words and check it against the truth.",
      steps: [
        "Write what the audience must understand. Any length.",
        "Cut it to ten words or fewer.",
        "Put it next to the value proposition from your paper. If they disagree, the message is wrong, not the paper.",
      ],
      grounding: "A brand is the distinctive identity that sets a business apart, and consistency is what builds it. (Investopedia)",
      produces: "A ten-word message that matches the business",
      producesNote: "Your ad has to sound like the business it is for, not like you.",
      source: "Source: Investopedia, Brand and Brand Identity", sources: [S.brand, S.valueProp],
      notes: "A student ad that contradicts the real promise is a good teaching moment, not a failure. Surface one if you find it.",
    }],
    ["round", {
      label: "Round 4 of 5 · Three-second test", minutes: 6,
      task: "Show a partner your layout for three seconds.",
      steps: [
        "Sketch the ad on paper. One thing should be biggest.",
        "Show a partner for three seconds, then hide it.",
        "They say what they saw and what they think you want them to do. Fix whatever they missed.",
      ],
      grounding: "One thing to look at first. If two things compete, the reader picks neither.",
      produces: "A layout that survived a real reader",
      producesNote: "Do this on paper before you open any design tool.",
      source: "Sources: Investopedia, Marketing and Brand", sources: [S.marketing, S.brand],
      notes: "Facilitation: run it twice, swapping roles. The three-second limit is not negotiable, or it becomes a critique session.",
    }],
    ["round", {
      label: "Round 5 of 5 · Call to action", minutes: 5,
      task: "Name exactly what you want them to do next.",
      steps: [
        "Write the next step: a time, a place, a link, or an action.",
        "Banned: visit us today, check us out, learn more.",
        "Ask your partner: could you actually do this thing tomorrow?",
      ],
      grounding: "An ad with no specific next step is a poster. Promotion is supposed to move someone. (Investopedia)",
      produces: "One call to action a person could act on",
      producesNote: "This is the line the business partner will react to first.",
      source: "Source: Investopedia, The 4 Ps of Marketing", sources: [S.fourPs],
      notes: "The banned-phrases rule does most of the work. Keep it visible while they write.",
    }],
    ["challenge", {
      kicker: "The build", title: "Make the ad and write the reasoning.", minutes: 20,
      steps: [
        ["01", "Pick a template and drop in your four decisions."],
        ["02", "Cut anything that is not doing a job."],
        ["03", "Score your own ad out of eight on the four decisions."],
        ["04", "Write three sentences: audience, message, call to action."],
      ],
      deliverable: { big: "One ad\nplus your\nreasoning", note: "The reasoning is what goes to the business." },
      source: "Career Canvas Meeting 5 build",
      notes: "A beautiful ad with no reasoning gets weak feedback from partners. Say that before they start designing.",
    }],
    ["closer", {
      kicker: "Before you leave", title: "Send it to the business with one specific question attached.",
      exit: ["Who is this ad for?", "What do you want them to do?", "What would you test first?"],
      next: { title: "Build your quiz app", body: "Turn what you learned about this business and its industry into a quiz other students can play." },
      source: "Career Canvas Meeting 5",
      notes: "Business feedback submission happens here. Require a specific question rather than what do you think.",
    }],
    ["sourceLibrary", { entries: [lib.fourPs, lib.marketing, lib.digital, lib.targetMarket, lib.brand, lib.valueProp] }],
  ],
},

// ───────────────────────────── MEETING 6 ─────────────────────────────
// Producible built: the playable quiz app.
{
  file: "Career_Canvas_Meeting_6_Build_Your_Quiz_App",
  slides: [
    ["cover", {
      title: "Build your\nquiz app",
      sub: "Write it, build it, and have someone else break it, all in one meeting",
      meeting: "Meeting 6",
      notes: "Open by asking who has built something other people used. Then say that everyone in the room will have by the end of the meeting.",
    }],
    ["statement", {
      kicker: "The only thing we teach today",
      title: "Being tested beats re-reading.",
      stat: "2006",
      statText: "Students who took recall tests remembered substantially more a week later than students who restudied the same material.",
      footline: "So the quiz you build is not a decoration on your research. It is the thing that makes someone else remember it.",
      source: "Source: Roediger & Karpicke, Psychological Science 17(3), 2006, pp. 249-255, via PubMed",
      sources: [S.testing],
      notes: "According to PubMed, Roediger and Karpicke (2006) found repeated studying beat repeated testing after five minutes, but after two days or a week prior testing produced substantially greater retention, even though restudying made students more confident.",
    }],
    ["barFigure", {
      kicker: "The evidence", title: "Testing wins, but only after a delay.",
      sub: "Roediger & Karpicke (2006), Experiment 1: students read a passage, then either restudied it or took a recall test with no feedback.",
      groups: [
        { label: "After 5 minutes", values: [81, 75] },
        { label: "After 2 days", values: [54, 68] },
        { label: "After 1 week", values: [42, 56] },
      ],
      series: ["Restudied the passage", "Took a recall test"],
      takeaway: "Restudying wins the first five minutes and loses every delay that matters. Your quiz is built for the one-week column.",
      source: "Source: Roediger & Karpicke, Psychological Science 17(3), 2006, p. 251, via PubMed",
      sources: [S.testing],
      notes: "Percentages are the proportion of idea units recalled in Experiment 1, read from the paper itself. The authors also note the tested group recalled as much after a week as the restudy group did after two days, so one test bought five days of retention. Confidence ran the other way: restudying made students more sure they would remember.",
    }],
    ["round", {
      label: "Round 1 of 5 · Closed book", minutes: 7,
      task: "Write three questions without looking at your paper.",
      steps: [
        "Close the paper. Write three questions you could answer from memory.",
        "Open it. Check whether you were right.",
        "Anything you got wrong is a better question than anything you got right.",
      ],
      grounding: "Recall without the page in front of you is the effect the research is actually about. (Roediger & Karpicke, 2006)",
      produces: "Three questions grounded in your own research",
      producesNote: "You just ran the testing effect on yourself. That is the design brief.",
      source: "Source: Roediger & Karpicke, Psychological Science 17(3), 2006, via PubMed", sources: [S.testing],
      notes: "Facilitation: 3 minutes closed, 2 checking, 2 discussing. Ask who got one wrong and make the point that this is the useful part.",
    }],
    ["round", {
      label: "Round 2 of 5 · Mix the types", minutes: 8,
      task: "Write one question of each kind.",
      steps: [
        "Recall: can they retrieve the fact at all?",
        "Apply: given a new situation, what would they do?",
        "Spot the flaw: what is wrong with this business decision?",
      ],
      grounding: "Recall questions carry the memory effect. Apply and spot-the-flaw are what make it worth playing.",
      produces: "Three questions of three different kinds",
      producesNote: "A quiz of pure recall is a flashcard deck. Mix it.",
      source: "Source: Roediger & Karpicke, Psychological Science 17(3), 2006, via PubMed", sources: [S.testing],
      notes: "The spot-the-flaw question is the hardest to write and the one peers enjoy most. Give an example from your own business if the room stalls.",
    }],
    ["round", {
      label: "Round 3 of 5 · Distractor workshop", minutes: 7,
      task: "Make the wrong answers hard to dismiss.",
      steps: [
        "Take one question. Write three wrong answers.",
        "Cross out any that are obviously jokes. A silly option is not an option.",
        "Each survivor has to be something a reasonable person might believe.",
      ],
      grounding: "If one option is a joke, your four-option question is really a three-option question.",
      produces: "One question with three plausible distractors",
      producesNote: "This is the single biggest difference between a real quiz and a filler quiz.",
      source: "Career Canvas quiz-design bar", sources: [S.testing],
      notes: "Have two students swap one question and try to guess the answer without knowing the topic. Guessable means the distractors failed.",
    }],
    ["round", {
      label: "Round 4 of 5 · Write the why", minutes: 7,
      task: "Write feedback that teaches, not feedback that judges.",
      steps: [
        "Pick your best wrong answer. Write why someone would pick it.",
        "Write why the right answer is right, in one or two lines.",
        "Add one fact the player did not have before. Then stop.",
      ],
      grounding: "Correct with nothing else, and try again with no hint, are both wasted messages.",
      produces: "Feedback text for one whole question",
      producesNote: "Players read the feedback more carefully than the question. Spend your effort here.",
      source: "Career Canvas quiz-design bar", sources: [S.testing],
      notes: "Cap it at two lines. Students who write a paragraph have written something nobody will finish.",
    }],
    ["round", {
      label: "Round 5 of 5 · Peer play", minutes: 10,
      task: "Hand it to someone and watch it break.",
      steps: [
        "Swap with someone who studied a different business.",
        "Play the whole thing without asking the author anything.",
        "Log every question you could guess without knowing the topic, and give back one fix.",
      ],
      grounding: "A quiz a stranger cannot play alone is not finished, whatever it looks like on your screen.",
      produces: "A list of what broke, from a real player",
      producesNote: "Guessable questions are the most common finding. Better a peer finds them than a judge.",
      source: "Career Canvas quiz-builder acceptance criteria",
      notes: "Enforce the no-asking rule. The moment the author explains, the test stops working.",
    }],
    ["challenge", {
      kicker: "The build", title: "Ship the quiz and fix what the tester found.", minutes: 18,
      steps: [
        ["01", "Enter your questions, answers, and feedback in the builder."],
        ["02", "Set the title, introduction, and audience."],
        ["03", "Generate it and play it yourself start to finish."],
        ["04", "Apply your tester's fix and export the file."],
      ],
      deliverable: { big: "A tested,\nplayable\nquiz app", note: "Five questions minimum, exported and working offline." },
      source: "Career Canvas Meeting 6 build",
      notes: "Collect the exported files now so Meeting 7 does not start with missing work.",
    }],
    ["closer", {
      kicker: "Before you leave", title: "You built something other people can use.",
      exit: ["Which question was hardest to write?", "What did your tester guess?", "What did you fix?"],
      next: { title: "Showcase your work", body: "Put the paper, the ad, and the app into a portfolio, write the skills resume, and rehearse sixty seconds." },
      source: "Career Canvas Meeting 6",
      notes: "This meeting tests the platform's central promise: a student with no coding experience turning original research into a working app.",
    }],
    ["sourceLibrary", { entries: [lib.testing, lib.decaCompete, lib.marketResearch, lib.owl] }],
  ],
},

// ───────────────────────────── MEETING 7 ─────────────────────────────
// Producible built: the portfolio, the skills resume, and the pitch.
{
  file: "Career_Canvas_Meeting_7_Showcase_Your_Work",
  slides: [
    ["cover", {
      title: "Showcase\nyour work",
      sub: "Assemble it, name what it proves, and say it out loud in sixty seconds",
      meeting: "Meeting 7",
      notes: "Do not start with a slide. Start with Round 1 on the board: everything this group made in six meetings.",
    }],
    ["statement", {
      kicker: "The only thing we teach today",
      title: "Sixty seconds is a real format.",
      stat: "60",
      statText: "An elevator pitch is a 30 to 60 second summary used to spark interest and open the door to a longer conversation.",
      footline: "Entrepreneurs, salespeople, and job seekers all rehearse one. Venture capitalists judge startups on it. You will rehearse yours three times today.",
      source: "Source: Investopedia, Elevator Pitch",
      sources: [S.pitch],
      notes: "Three minutes. Investopedia notes an effective pitch names the pain point and why the idea is worth backing. The point here is that it is designed and practised, not improvised.",
    }],
    ["round", {
      label: "Round 1 of 5 · Inventory", minutes: 5,
      task: "List everything you made. You have forgotten half of it.",
      steps: [
        "Write down every piece of work from Meetings 1 through 6.",
        "Mark anything you cannot currently find.",
        "Go get the missing ones now, not at the end.",
      ],
      grounding: "Six meetings produced a sketch, five questions, a findings log, a paper, an ad, and a quiz.",
      produces: "A complete list of your own work",
      producesNote: "Students are routinely surprised by how much is on this list.",
      source: "Career Canvas program structure",
      notes: "Run this out loud as a whole room first, on the board, then let them write. Hearing the list is the motivating part.",
    }],
    ["round", {
      label: "Round 2 of 5 · Assemble", minutes: 10,
      task: "Build the portfolio in this order.",
      steps: [
        "The business you chose and why, your five questions, and the one-page paper.",
        "The ad and the reasoning, then a link to your playable quiz.",
        "Your sources, with links and dates, at the end.",
      ],
      grounding: "The sources list is not paperwork. It is the evidence the work is yours and that it is checkable. (Purdue OWL)",
      produces: "A portfolio someone can follow without you",
      producesNote: "Order matters. A reader should never have to ask what this is.",
      source: "Source: Purdue OWL, Evaluating Sources: General Guidelines", sources: [S.owl],
      notes: "Ten minutes of quiet assembly. Anyone who lost a file finds out now rather than during the showcase.",
    }],
    ["round", {
      label: "Round 3 of 5 · Resume lines", minutes: 7,
      task: "Write three lines in the form skill, artifact, proof.",
      steps: [
        "Research: name the sources you judged and used.",
        "Writing: name the paper and the claim it defends.",
        "Building: name the app a stranger can play.",
      ],
      grounding: "Analytical thinking is the top core skill employers name, with creative thinking fourth. You have now done both. (World Economic Forum)",
      produces: "Three resume lines with artifacts attached",
      producesNote: "A skill with no artifact behind it is a wish. Cut those lines.",
      source: "Source: World Economic Forum, Future of Jobs Report 2025, Skills Outlook", sources: [S.wef],
      notes: "Put the next slide up while they write so they can see specific against vague side by side.",
    }],
    ["compare", {
      kicker: "Round 3 material", title: "The same skills, written two ways.",
      sub: "A reader can check everything in the left column and nothing in the right one.",
      left: {
        heading: "Specific",
        points: [
          "Researched a local bakery using five sources and logged each one.",
          "Wrote a one-page analysis naming its location advantage.",
          "Built a playable eight-question quiz on retail pricing.",
          "Presented to the owner and revised on their feedback.",
        ],
      },
      right: {
        heading: "Vague",
        points: [
          "Strong research skills.",
          "Excellent written communication.",
          "Experience with technology.",
          "Works well with others.",
        ],
      },
      source: "Source: Purdue OWL, Evaluating Sources: General Guidelines",
      sources: [S.owl],
      notes: "Same rule as the research lab: a claim a reader cannot check does not count. Students can now apply that test to themselves.",
    }],
    ["round", {
      label: "Round 4 of 5 · Draft the minute", minutes: 6,
      task: "Write the pitch to these four time blocks.",
      steps: [
        "0:00 to 0:10, the business and why you picked it. 0:10 to 0:30, your one claim.",
        "0:30 to 0:45, the ad or the app and the choice behind it.",
        "0:45 to 0:60, what you would do next with more time.",
      ],
      grounding: "An elevator pitch runs 30 to 60 seconds and is memorized and practised in advance. (Investopedia)",
      produces: "A written sixty-second pitch",
      producesNote: "Write it out. Improvised pitches run to two minutes every time.",
      source: "Source: Investopedia, Elevator Pitch", sources: [S.pitch],
      notes: "Time the first volunteer publicly. Everyone adjusts after watching one person run over.",
    }],
    ["round", {
      label: "Round 5 of 5 · Rehearse", minutes: 8,
      task: "Say it out loud three times before anyone important hears it.",
      steps: [
        "Read it to a partner with a timer running. Cut whatever pushed you over.",
        "Say it again without the paper.",
        "Third time, standing, no notes. That is the version you deliver.",
      ],
      grounding: "The pitch is a thing you practise, not a summary you improvise on the spot.",
      produces: "A pitch you can deliver without notes",
      producesNote: "Three rehearsals is the minimum. Most people need the third one.",
      source: "Source: Investopedia, Elevator Pitch", sources: [S.pitch],
      notes: "Circulate with the timer. The cut in step 1 is where the pitch actually gets good.",
    }],
    ["challenge", {
      kicker: "The showcase", title: "Present, then take real feedback.", minutes: 25,
      steps: [
        ["01", "Deliver your sixty seconds without notes."],
        ["02", "Take one question from the room or the business partner."],
        ["03", "Write down the single most useful thing you heard."],
        ["04", "Name what you would change first."],
      ],
      deliverable: { big: "Portfolio,\nresume,\nand pitch", note: "Recognized by the partner businesses." },
      source: "Career Canvas Meeting 7 showcase",
      notes: "Ask partners for one specific compliment and one specific question per student. Keep general praise out of it.",
    }],
    ["closer", {
      kicker: "Before you leave", title: "You started with curiosity. You are leaving with evidence.",
      exit: ["What can you do now that you could not in Meeting 1?", "Which deliverable are you proudest of?", "Where does this go next?"],
      next: { title: "Post-program reflection", body: "Retake the confidence survey from Meeting 1 and compare the two side by side." },
      source: "Career Canvas Meeting 7",
      notes: "Pair the post-program survey with the pre-program one so students see their own change rather than hearing about it.",
    }],
    ["sourceLibrary", { entries: [lib.pitch, lib.wef, lib.owl, lib.decaCompete] }],
  ],
},
];

const contentSlides = (deck) => deck.slides.filter(([layout]) => layout !== "cover" && layout !== "sourceLibrary");
const sourceEntries = (...decks) => {
  const entries = decks.flatMap(deck => deck.slides.filter(([layout]) => layout === "sourceLibrary").flatMap(([, props]) => props.entries));
  return [...new Map(entries.map(entry => [entry[3], entry])).values()];
};
const replaceMeetingText = (value, replacements) => {
  if (typeof value === "string") return replacements.reduce((text, [from, to]) => text.replaceAll(from, to), value);
  if (Array.isArray(value)) return value.map(item => replaceMeetingText(item, replacements));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceMeetingText(item, replacements)]));
  return value;
};
const retitleDeck = (deck, number, file, title, sub, replacements = []) => ({
  file,
  slides: deck.slides.map(([layout, props]) => [layout, replaceMeetingText(layout === "cover" ? { ...props, meeting: `Meeting ${number}`, title, sub } : props, replacements)]),
});

const craapSlide = ["checklist", {
  kicker: "Source check", title: "The CRAAP test for student research",
  sub: "Before a source enters your article, answer all five questions and record the evidence in your research notes.",
  items: [
    "Currency: When was it published or updated, and is that date appropriate for your question?",
    "Relevance: Does it directly help answer your research question for this business and audience?",
    "Authority: Who created it, and what gives that person or organization credibility?",
    "Accuracy: Can you verify the claim with evidence or another reliable source?",
    "Purpose: Is the source trying to inform, sell, persuade, entertain, or collect attention?",
    "Decision: Use it, use it with a warning, or leave it out. Write one sentence explaining why.",
  ],
  aside: "A source can look professional and still fail. Save the title, publisher, date, link, and your five-part decision before you start writing.",
  source: "Source: California State University Chico, Meriam Library, CRAAP Test",
  sources: ["https://library.csuchico.edu/sites/default/files/craap-test.pdf"],
  notes: "Students complete this check for every outside source. CRAAP stands for Currency, Relevance, Authority, Accuracy, and Purpose. The slide paraphrases the original checklist for middle-school use.",
}];

const researchSlides = contentSlides(ORIGINAL_DECKS[2]).filter(([, props]) => !String(props.label || "").toLowerCase().includes("competitor sweep"));
const writingSlides = contentSlides(ORIGINAL_DECKS[3]).map(([layout, props]) => {
  if (props.title === "Your page is done when all eight are filled.") return ["checklist", {
    ...props,
    title: "Your article and campaign plan are ready when these sections connect.",
    sub: "The article may run one to four pages. Every section should help the reader understand the business, the audience, and the creative recommendation.",
    items: ["Business overview", "Research question", "Evidence with source checks", "Audience insight", "Advertisement goal", "Message and desired action", "Creative direction", "Sources"],
    aside: "The campaign recommendation belongs in the same paper because it should grow directly from the research, not appear as a separate guess.",
  }];
  if (props.title === "Assemble the page and submit it.") return [layout, {
    ...props,
    title: "Assemble the article and campaign plan.",
    steps: [
      ["01", "Put the business overview, research question, and strongest evidence first."],
      ["02", "Explain the audience insight in your own words and connect it to evidence."],
      ["03", "Add the advertisement goal, message, action, and creative direction."],
      ["04", "Run the source and fact check, then add your source list."],
    ],
    deliverable: { big: "One-to-four-page\nbusiness\narticle", note: "Research and creative recommendation in one paper." },
  }];
  return [layout, props];
});

const researchWriting = {
  file: "Career_Canvas_Meeting_3_Research_And_Write_The_Business_Story",
  slides: [
    ["cover", { ...ORIGINAL_DECKS[2].slides[0][1], meeting: "Meeting 3", title: "Research and write\nthe business story", sub: "Find trustworthy evidence, test every source, and turn your research into a one-to-four-page article" }],
    ...researchSlides,
    craapSlide,
    ...writingSlides,
    ["sourceLibrary", { entries: sourceEntries(ORIGINAL_DECKS[2], ORIGINAL_DECKS[3]).concat([["California State University Chico", "CRAAP Test", "library.csuchico.edu", "https://library.csuchico.edu/sites/default/files/craap-test.pdf"]]) }],
  ],
};

const createBuild = {
  file: "Career_Canvas_Meeting_4_Create_The_Ad_And_Build_The_Quiz",
  slides: [
    ["cover", { ...ORIGINAL_DECKS[4].slides[0][1], meeting: "Meeting 4", title: "Create the ad\nand build the quiz", sub: "Turn one audience insight into an original advertisement and an educational quiz people can play" }],
    ...contentSlides(retitleDeck(ORIGINAL_DECKS[4], 4, "", "", "", [["Meeting 5", "Meeting 4"], ["Meeting 6", "Meeting 4"]])),
    ...contentSlides(retitleDeck(ORIGINAL_DECKS[5], 4, "", "", "", [["Meeting 6", "Meeting 4"], ["Meeting 7", "Meeting 5"]])),
    ["sourceLibrary", { entries: sourceEntries(ORIGINAL_DECKS[4], ORIGINAL_DECKS[5]).slice(0, 8) }],
    ["sourceLibrary", { entries: sourceEntries(ORIGINAL_DECKS[4], ORIGINAL_DECKS[5]).slice(8) }],
  ],
};

export const DECKS = [
  retitleDeck(ORIGINAL_DECKS[0], 1, "Career_Canvas_Meeting_1_Creativity_Across_DECA_Areas", "Creativity across\nbusiness", "Five timed rounds, five DECA career areas, one idea you build and defend"),
  retitleDeck(ORIGINAL_DECKS[1], 2, "Career_Canvas_Meeting_2_Meet_The_Business", "Meet the\nbusiness", "Take a real business apart, meet the people who run one, and leave with five research questions"),
  researchWriting,
  createBuild,
  retitleDeck(ORIGINAL_DECKS[6], 5, "Career_Canvas_Meeting_5_Showcase_Your_Work", "Showcase\nyour work", "Build a portfolio and resume, then present the project story to a real audience", [["Meeting 7", "Meeting 5"], ["Meetings 1 through 6", "Meetings 1 through 4"], ["six meetings", "four meetings"]]),
];
