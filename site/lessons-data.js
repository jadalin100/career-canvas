// Career Canvas Business Lessons: 5 units x 3 lessons x 6 questions, focused on digital marketing and creativity.
// Questions are original.
// Question shape: { q, choices: [4 strings], answer: index of correct choice, why }
window.CC_LESSONS = [
  {
    id: "cre", title: "Creative Thinking", color: "#ff9f43",
    lessons: [
      { id: "cre-1", title: "Finding ideas", questions: [
        { q: "During the first ten minutes of a brainstorm, the best rule is to", choices: ["pick the best idea right away", "write down every idea without judging it", "only share ideas the teacher will like", "stop once you have one idea"], answer: 1, why: "Judging ideas too early shuts them down. Collect many first, then sort them." },
        { q: "An entrepreneur asks, \"Why do customers have to wait in line to pay?\" and builds a phone checkout. They are", choices: ["challenging the status quo", "following tradition", "avoiding risk", "copying a competitor"], answer: 0, why: "Challenging the status quo means questioning the usual way of doing things to find a better one." },
        { q: "A student puts a solar charger into a backpack and sells it as one product. This creative method is", choices: ["copying a competitor", "lowering the price", "combining two existing ideas", "asking for a refund"], answer: 2, why: "Many new products come from putting two familiar ideas together." },
        { q: "Showing initiative means", choices: ["waiting to be told what to do", "starting useful work without being asked", "only doing the minimum", "letting others take every risk"], answer: 1, why: "Initiative is spotting what needs doing and acting on it yourself." },
        { q: "Your team has 30 ideas for a bake sale poster. What is a good next step?", choices: ["Throw them all away", "Use all 30 on one poster", "Let the loudest person choose", "Group similar ideas and pick the strongest few"], answer: 3, why: "After brainstorming, you sort the ideas and narrow them down to the best ones." },
        { q: "Which question is most likely to spark a new business idea?", choices: ["What annoys people every day that no one has fixed?", "What did my competitor do last year?", "How can I avoid all risk?", "What is the cheapest font?"], answer: 0, why: "Everyday problems are a great source of ideas, because solving them helps people." }
      ]},
      { id: "cre-2", title: "Thinking like a customer", questions: [
        { q: "Empathy in design means", choices: ["making the product as cheap as possible", "understanding how the user feels and what they need", "designing only for yourself", "adding as many features as possible"], answer: 1, why: "Designers start by understanding the people they are designing for." },
        { q: "A team watches students use the lunch app and sees them get stuck on the payment screen. The team is", choices: ["guessing", "advertising", "observing users to find problems", "budgeting"], answer: 2, why: "Watching real users shows problems they might never mention." },
        { q: "A user persona is", choices: ["a made-up profile of a typical customer, based on research", "a famous spokesperson", "a company password", "a type of logo"], answer: 0, why: "A persona sums up who you are designing for, so the whole team remembers their needs." },
        { q: "Your online store's sales dropped. What is the first step in solving the problem?", choices: ["Lower every price immediately", "Figure out what is causing the drop", "Close the store", "Blame the website"], answer: 1, why: "Problem-solving starts by finding the real cause before choosing a fix." },
        { q: "Which is a problem statement a designer could work on?", choices: ["Make an app", "Sell more stuff", "Be creative", "Busy parents need a quick way to pack healthy lunches"], answer: 3, why: "A good problem statement names who has the problem and what they need." },
        { q: "When interviewing a customer, which question gets the most useful answer?", choices: ["You like our product, right?", "Tell me about the last time you shopped for sneakers.", "Is our price good?", "Would you buy this, yes or no?"], answer: 1, why: "Open questions about real experiences get honest, detailed answers. Leading questions do not." }
      ]},
      { id: "cre-3", title: "Testing ideas", questions: [
        { q: "A prototype is", choices: ["a simple early version of an idea that you can test", "the final product", "a patent", "a sales report"], answer: 0, why: "Prototypes let you try an idea quickly before spending time and money on it." },
        { q: "Why do designers test a rough sketch before building the full product?", choices: ["Because sketches are prettier", "To skip asking customers", "To find problems early, when they are cheap to fix", "Because testing is required by law"], answer: 2, why: "Fixing a sketch takes minutes. Fixing a finished product can take months." },
        { q: "Customers review your new product and say the packaging is hard to open. The best move is to", choices: ["delete the reviews", "use the feedback to improve it", "argue with reviewers", "ignore it"], answer: 1, why: "Feedback is information for getting better." },
        { q: "You launch a product without knowing exactly how customers will react. Handling this well shows", choices: ["tolerance for ambiguity", "poor planning", "a fixed mindset", "bad customer service"], answer: 0, why: "Creators often work with incomplete information. Staying calm and adjusting is tolerance for ambiguity." },
        { q: "Changing your design a little after each round of feedback is called", choices: ["giving up", "copying", "pricing", "iterating"], answer: 3, why: "Iterating means improving step by step and testing each new version." },
        { q: "A new competitor opens next door. Adjusting to change might look like", choices: ["ignoring them", "finding what makes your business different and improving it", "giving up", "copying everything they do"], answer: 1, why: "Adapting means responding to change with a plan instead of standing still." }
      ]}
    ]
  },
  {
    id: "brd", title: "Branding & Design", color: "#a66cff",
    lessons: [
      { id: "brd-1", title: "What a brand is", questions: [
        { q: "A brand is best described as", choices: ["just the company's logo", "how people think and feel about a business", "the company's bank account", "the store's address"], answer: 1, why: "A logo is one part of a brand. The brand is the whole impression people have of the business." },
        { q: "A pizza shop promises \"Hot in 30 minutes or it's free.\" This is its", choices: ["brand promise", "tax bill", "inventory", "budget"], answer: 0, why: "A brand promise is what customers can always expect from the business." },
        { q: "Why does keeping the brand promise matter?", choices: ["It does not, because customers forget", "Customers trust brands that deliver what they promise", "It lowers taxes", "It replaces advertising"], answer: 1, why: "Breaking a promise damages trust. Keeping it builds loyalty." },
        { q: "A skate shop's posts use slang, bright colors, and jokes. A bank's posts are calm and formal. Each one has a different", choices: ["tax rate", "supply chain", "brand voice", "price"], answer: 2, why: "Brand voice is the personality in how a business writes and speaks." },
        { q: "A clothing brand sends a thank-you note with every online order. It is building", choices: ["a supply chain", "an accounting system", "a production line", "positive customer relations"], answer: 3, why: "Small, personal touches make customers feel valued." },
        { q: "A brand claims its juice is \"100% organic\" when it is not. This is", choices: ["unethical and misleading", "smart marketing", "required by law", "good customer service"], answer: 0, why: "Ethical marketing tells the truth. False claims break trust and can break the law." }
      ]},
      { id: "brd-2", title: "Design basics", questions: [
        { q: "Which text is easiest to read on a poster?", choices: ["Light yellow text on a white background", "Dark navy text on a white background", "Gray text on a gray background", "Red text on a green background"], answer: 1, why: "Strong contrast between the text and the background makes words easy to read." },
        { q: "On an ad, the biggest and boldest text should be", choices: ["the most important message", "the fine print", "the date it was designed", "the designer's name"], answer: 0, why: "Size and boldness show the reader what to look at first. Designers call this visual hierarchy." },
        { q: "Leaving empty space around a logo or headline", choices: ["makes the design look unfinished", "helps the important parts stand out", "wastes money", "is a mistake designers avoid"], answer: 1, why: "White space gives each element room, so the eye goes straight to what matters." },
        { q: "A flyer uses six different fonts. The main problem is that", choices: ["it uses too little ink", "it is too short", "it looks messy and is hard to read", "it has no price"], answer: 2, why: "Most designs stick to one or two fonts so the look stays clean and consistent." },
        { q: "Many fast-food brands use red and yellow. Designers choose colors carefully because colors", choices: ["are free", "are required by law", "never matter", "can make people feel certain ways"], answer: 3, why: "Color sets a mood. Warm colors like red and yellow feel energetic and grab attention." },
        { q: "Using the same colors, fonts, and logo on every post helps a brand", choices: ["get recognized quickly", "spend more money", "confuse competitors", "avoid customers"], answer: 0, why: "When everything matches, people recognize the brand at a glance." }
      ]},
      { id: "brd-3", title: "Logos and visual identity", questions: [
        { q: "A good logo should", choices: ["include as many details as possible", "be simple enough to recognize when it is tiny", "change every week", "use ten colors"], answer: 1, why: "Logos show up as small app icons and profile pictures, so they have to work small." },
        { q: "A logo that is only a symbol, with no words, works best when", choices: ["people already know the brand well", "the business just opened", "no one has seen it before", "it is printed small and blurry"], answer: 0, why: "A symbol-only logo depends on people already connecting it to the brand." },
        { q: "Before finishing a new logo, a designer should check how it looks", choices: ["only on a giant billboard", "only in the designer's favorite color", "in black and white and at small sizes", "upside down"], answer: 2, why: "A strong logo still works without color and at tiny sizes." },
        { q: "A brand style guide is", choices: ["a map to the store", "a list of employees", "a sales receipt", "a document that sets the brand's colors, fonts, and logo rules"], answer: 3, why: "A style guide keeps everyone who designs for the brand consistent." },
        { q: "You find a cool logo online and change one color for your client's business. This is", choices: ["fine, because you changed it", "copying someone else's work", "a style guide", "a brand promise"], answer: 1, why: "A small change does not make a design yours. Original work avoids copyright problems and gives the brand its own identity." },
        { q: "A bakery's logo, sign, cups, and website all match. Customers will most likely", choices: ["remember the bakery more easily", "think it is several bakeries", "stop visiting", "ask for a refund"], answer: 0, why: "A matching visual identity makes a business easier to remember." }
      ]}
    ]
  },
  {
    id: "soc", title: "Social Media & Content", color: "#ff5c8a",
    lessons: [
      { id: "soc-1", title: "Know your audience", questions: [
        { q: "A target audience is", choices: ["everyone in the world", "the specific group a business most wants to reach", "only the business's employees", "people who already dislike the product"], answer: 1, why: "Knowing exactly who you want to reach shapes every message you make." },
        { q: "Before starting an Instagram campaign, a cafe should first decide", choices: ["which filter looks coolest", "how many posts a competitor made in 2015", "what information it needs, like who its audience is", "the font for its menu"], answer: 2, why: "Figuring out what you need to know keeps marketing focused on the right audience." },
        { q: "A toy store wants to reach parents of young kids. Which is the best fit?", choices: ["Posts in parenting groups and on family pages", "Ads during a late-night horror movie", "Flyers at a retirement home", "A billboard in another country"], answer: 0, why: "Put your message where your audience already spends time." },
        { q: "Splitting customers into groups by age, interests, or location is called", choices: ["inventory", "payroll", "production", "market segmentation"], answer: 3, why: "Segmentation lets a business talk to each group in a way that fits it." },
        { q: "A business's post data shows most followers are online at 7 p.m. The best time to post is", choices: ["3 a.m.", "around 7 p.m.", "whenever the owner remembers", "only on holidays"], answer: 1, why: "Posting when your audience is online means more people see it." },
        { q: "Which message would teenagers most likely respond to on social media?", choices: ["A short, funny video showing the product in use", "A 10-page printed brochure", "A fax", "A long legal notice"], answer: 0, why: "Content should match how the audience likes to take in information." }
      ]},
      { id: "soc-2", title: "Making content", questions: [
        { q: "The first two seconds of a short video matter most because", choices: ["that is when viewers decide whether to keep watching", "that is where the price goes", "platforms delete the rest", "it is the only part with sound"], answer: 0, why: "The opening hook decides whether people stay or scroll away." },
        { q: "A call to action is", choices: ["a phone call to a customer", "a line that tells the viewer what to do next, like \"Order today\"", "a complaint", "a type of logo"], answer: 1, why: "A clear call to action turns attention into a next step." },
        { q: "Which caption is strongest for a new smoothie shop?", choices: ["Smoothies.", "We exist.", "Beat the heat with our mango smoothie, half price this Friday!", "Please read this long post about our tax filing."], answer: 2, why: "A strong caption is short, specific, and gives people a reason to act now." },
        { q: "A cafe posts the same kind of content every Monday, Wednesday, and Friday. The main benefit is that", choices: ["the app charges less", "it never needs new ideas", "it avoids all comments", "followers know when to expect new posts"], answer: 3, why: "A steady posting schedule builds habits, so followers keep coming back." },
        { q: "Behind-the-scenes posts, like a baker shaping dough, work well because they", choices: ["make the brand feel real and personal", "hide the product", "are always the cheapest ad", "replace customer service"], answer: 0, why: "Showing the people and process behind a business builds connection and trust." },
        { q: "Telling customers how a product makes their life easier, instead of only listing its parts, is focusing on", choices: ["features", "benefits", "prices", "taxes"], answer: 1, why: "Features are what a product has. Benefits are what it does for the customer." }
      ]},
      { id: "soc-3", title: "Posting responsibly", questions: [
        { q: "A company's social media manager posts insulting jokes from their personal account. The biggest risk to the company is", choices: ["a lower electricity bill", "more inventory", "damage to its public image", "a faster website"], answer: 2, why: "Employees' public posts can reflect on the brand, even from personal accounts." },
        { q: "An influencer is paid to post about a water bottle. They should", choices: ["hide that they were paid", "clearly label the post as an ad or sponsored", "delete it after an hour", "say they bought it themselves"], answer: 1, why: "Viewers deserve to know when a post is paid for. In the U.S., the FTC requires influencers to disclose it." },
        { q: "You want to use a popular song in a business's video. You should", choices: ["use it, since everyone does", "credit the singer and use it anyway", "speed it up so no one notices", "use music that is licensed for business use"], answer: 3, why: "Songs are copyrighted. Giving credit does not give you permission." },
        { q: "Before posting a photo of customers at an event, a business should", choices: ["ask their permission", "add a filter", "post it at night", "tag random accounts"], answer: 0, why: "People have a right to decide whether their picture is used in marketing." },
        { q: "A business uses an AI tool to make a picture of its product for an ad. The honest move is to", choices: ["claim it is a real photo", "make sure the picture does not show things the product cannot do", "add more fake features", "hide the product"], answer: 1, why: "Ads must not mislead customers, whether a camera or an AI tool made the picture." },
        { q: "An angry customer comments on a business's post. The best first response is to", choices: ["argue back publicly", "delete every comment", "reply politely and offer to fix the problem", "block all followers"], answer: 2, why: "A calm, helpful reply shows every other customer that the business cares." }
      ]}
    ]
  },
  {
    id: "ads", title: "Ads & Campaigns", color: "#58a6ff",
    lessons: [
      { id: "ads-1", title: "What marketing does", questions: [
        { q: "Deciding what to charge for a new sneaker is the marketing function of", choices: ["channel management", "pricing", "selling", "financing"], answer: 1, why: "Pricing sets the amount customers pay, balancing value and profit." },
        { q: "Running ads and social posts about a new snack is", choices: ["promotion", "purchasing", "accounting", "production"], answer: 0, why: "Promotion communicates with customers to inform and persuade them." },
        { q: "Surveying customers about what flavors they want is", choices: ["product shipping", "payroll", "marketing-information management", "inventory counting"], answer: 2, why: "Marketing-information management gathers data to make better marketing decisions." },
        { q: "Getting products from the factory to store shelves is", choices: ["pricing", "promotion", "product design", "channel management"], answer: 3, why: "Channel management (distribution) moves products to where customers can buy them." },
        { q: "Deciding to add a new color option to a water bottle is", choices: ["product/service management", "financing", "selling", "promotion"], answer: 0, why: "Product/service management decides what to offer and how to improve it." },
        { q: "A salesperson helping a customer choose the right laptop is the marketing function of", choices: ["pricing", "selling", "financing", "channel management"], answer: 1, why: "Selling is direct, personal communication that helps customers decide to buy." }
      ]},
      { id: "ads-2", title: "Writing an ad", questions: [
        { q: "An ad's headline should", choices: ["grab attention and say the main idea fast", "explain every detail", "be written in tiny print", "match every competitor's headline"], answer: 0, why: "Most people only read the headline, so it has to carry the message." },
        { q: "Which headline is most persuasive for a tutoring service?", choices: ["Tutoring available.", "Raise your math grade in 4 weeks", "We are a business.", "Click here for info about information"], answer: 1, why: "A strong headline promises a specific result the reader wants." },
        { q: "A gym ad shows a real member talking about reaching her goal. The ad is using", choices: ["a price cut", "a coupon code", "a customer testimonial", "a logo change"], answer: 2, why: "Testimonials persuade because people trust other customers' stories." },
        { q: "\"Only 10 left, order today!\" tries to persuade by creating", choices: ["a brand voice", "a style guide", "a supply chain", "a sense of urgency"], answer: 3, why: "Urgency gives people a reason to act now instead of later." },
        { q: "Every ad should make one clear point because", choices: ["people only glance at ads for a few seconds", "ads are too expensive to finish", "more points are illegal", "customers like confusion"], answer: 0, why: "With only a few seconds of attention, one clear message beats five crowded ones." },
        { q: "An ad says a cereal is \"the healthiest in the world\" with no proof. This could", choices: ["make the ad more honest", "mislead customers and break advertising rules", "lower the price", "improve the logo"], answer: 1, why: "Claims in ads need evidence. Truth-in-advertising rules ban misleading ones." }
      ]},
      { id: "ads-3", title: "Planning a campaign", questions: [
        { q: "A marketing campaign is", choices: ["one random post", "a planned set of messages working toward one goal", "a store's opening hours", "a job application"], answer: 1, why: "A campaign connects many messages to a single goal." },
        { q: "Which is the clearest campaign goal?", choices: ["Be popular", "Post stuff", "Get 100 new email sign-ups by June 1", "Make good ads"], answer: 2, why: "A clear goal is specific, measurable, and has a deadline." },
        { q: "How has technology changed how small businesses advertise?", choices: ["They can target ads to specific audiences online", "They can only use newspapers", "Ads now cost nothing to make", "Ads are no longer allowed"], answer: 0, why: "Digital ads can be aimed at people by interest, age, and location." },
        { q: "A campaign has a $200 budget. The smartest plan is to", choices: ["spend it all on the first day without checking results", "spend a little, see what works, then spend more on the winner", "spend nothing", "spend $500"], answer: 1, why: "Testing small first keeps you from wasting the budget on an ad that does not work." },
        { q: "A local pizza shop wants more families on Friday nights. Which channel fits best?", choices: ["A national TV ad", "A billboard in another state", "A magazine for car collectors", "Posts and ads aimed at nearby families"], answer: 3, why: "Pick the channel that reaches your audience where they are." },
        { q: "Running two versions of an ad to see which one gets more clicks is called", choices: ["A/B testing", "inventory", "bookkeeping", "franchising"], answer: 0, why: "A/B testing lets real results, not guesses, pick the better ad." }
      ]}
    ]
  },
  {
    id: "num", title: "Metrics & Money", color: "#2ecc71",
    lessons: [
      { id: "num-1", title: "Reading the results", questions: [
        { q: "In social media, reach means", choices: ["how many different people saw a post", "how much the post cost", "how long the caption is", "how many employees work there"], answer: 0, why: "Reach counts the number of different people who saw your content." },
        { q: "A post was seen 1,000 times and 50 people clicked the link. What is the click-through rate?", choices: ["50%", "5%", "0.5%", "20%"], answer: 1, why: "Click-through rate is clicks divided by views. 50 divided by 1,000 is 5%." },
        { q: "Likes, comments, shares, and saves are all measures of", choices: ["inventory", "payroll", "engagement", "rent"], answer: 2, why: "Engagement measures how much people interact with your content." },
        { q: "One post got 5,000 likes and no sales. Another got 300 likes and brought in 40 orders. Which did better for the sales goal?", choices: ["The 5,000-like post", "The 300-like post", "They did the same", "There is no way to tell"], answer: 1, why: "Judge a post by the goal you set. Likes are nice, but orders are what the sales goal measures." },
        { q: "A conversion happens when someone", choices: ["scrolls past an ad", "unfollows the account", "sees a logo", "takes the action you wanted, like buying or signing up"], answer: 3, why: "A conversion is the moment a viewer does what the campaign was asking for." },
        { q: "Why check results while a campaign is still running?", choices: ["To fix what is not working before the money runs out", "Because the results never change", "To skip planning", "To avoid customers"], answer: 0, why: "Checking early lets you move money toward what works." }
      ]},
      { id: "num-2", title: "Data and customers", questions: [
        { q: "An online store studies thousands of past orders to find which products are often bought together. This is", choices: ["data mining", "cold calling", "printing flyers", "inventory shrinkage"], answer: 0, why: "Data mining finds patterns in large amounts of data." },
        { q: "\"Customers who bought this also bought...\" suggestions come from", choices: ["random guesses", "patterns found in customer data", "the weather", "printed catalogs"], answer: 1, why: "Recommendation features are built from patterns in purchase data." },
        { q: "A business keeps its customer email list organized and secure. This is", choices: ["production", "pricing", "information management", "purchasing"], answer: 2, why: "Information management is collecting, organizing, and protecting data so it can be used well." },
        { q: "Which is something a small business can do on the internet?", choices: ["Sell products through a website", "Reach customers on social media", "Answer questions by email", "All of these"], answer: 3, why: "The internet lets businesses sell, advertise, and communicate worldwide." },
        { q: "A survey asks 20 customers which new flavor they want, and 14 pick mango. What percent picked mango?", choices: ["14%", "50%", "70%", "20%"], answer: 2, why: "14 out of 20 is 14 divided by 20, which is 0.7, or 70%." },
        { q: "Which data should a small business keep private and secure?", choices: ["Customers' emails and home addresses", "Its store hours", "Its menu prices", "Its public logo"], answer: 0, why: "Customers trust a business with their personal information, so it has to be protected." }
      ]},
      { id: "num-3", title: "The money behind marketing", questions: [
        { q: "Profit is", choices: ["revenue minus costs", "all the money a business takes in", "the price of one item", "the cost of ads"], answer: 0, why: "Profit is what is left after you subtract costs from the money coming in." },
        { q: "Which change would most likely raise a lemonade stand's profit?", choices: ["Paying more for lemons", "Selling more cups at the same cost per cup", "Giving away free cups", "Closing on the hottest days"], answer: 1, why: "Profit is revenue minus costs. Selling more while costs per cup stay the same increases profit." },
        { q: "A shop spends $100 on ads, and the ads bring in $400 in sales. For every $1 spent on ads, the shop got", choices: ["$1 in sales", "$4 in sales", "$40 in sales", "$0.25 in sales"], answer: 1, why: "$400 divided by $100 is 4, so each ad dollar brought in $4." },
        { q: "A new video game is popular and stores are running out. If supply stays the same, the price will most likely", choices: ["go down", "stay at zero", "go up", "disappear"], answer: 2, why: "When demand rises and supply does not, prices tend to rise." },
        { q: "A coupon gives 20% off a $15 T-shirt. The new price is", choices: ["$3", "$12", "$13", "$18"], answer: 1, why: "20% of $15 is $3, and $15 minus $3 is $12." },
        { q: "A plan for how much to spend on each marketing channel is called a", choices: ["style guide", "persona", "logo", "marketing budget"], answer: 3, why: "A marketing budget decides where the money goes before you start spending it." }
      ]}
    ]
  }
];
