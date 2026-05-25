/**
 * Seed Script - Upload questions to Firestore
 *
 * Usage: node scripts/seedFirebase.js
 *
 * Requires .env.local with Firebase credentials:
 *   NEXT_PUBLIC_FIREBASE_API_KEY
 *   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 *   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 *   NEXT_PUBLIC_FIREBASE_APP_ID
 */

const { initializeApp, getApps } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");

// Load environment variables from .env.local
const path = require("path");
const fs = require("fs");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Error: .env.local not found at", envPath);
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, "utf-8");
  const vars = {};

  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...valueParts] = trimmed.split("=");
    if (key && valueParts.length > 0) {
      vars[key.trim()] = valueParts.join("=").trim();
    }
  });

  return vars;
}

const env = loadEnv();

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Questions data (from src/data/questions.ts)
const questions = [
  // ========== LEVEL A (13yo) ==========
  // MATH - Level A
  {
    id: "math-A-1",
    subject: "math",
    level: "A",
    question: "Solve for x: 3x² - 12x + 9 = 0",
    questionType: "multiple_choice",
    options: ["x = 1 or x = 3", "x = -1 or x = 3", "x = 1 or x = -3", "x = 2 or x = 6"],
    correctAnswer: 0,
    explanation: "Factor: 3(x² - 4x + 3) = 0 → 3(x-1)(x-3) = 0. So x = 1 or x = 3.",
    difficulty: "medium",
    points: 100,
  },
  {
    id: "math-A-2",
    subject: "math",
    level: "A",
    question: "If f(x) = 2x³ - 3x² + x - 5, what is f(2)?",
    questionType: "multiple_choice",
    options: ["1", "3", "5", "7"],
    correctAnswer: 0,
    explanation: "f(2) = 2(8) - 3(4) + 2 - 5 = 16 - 12 + 2 - 5 = 1",
    difficulty: "medium",
    points: 100,
  },
  {
    id: "math-A-3",
    subject: "math",
    level: "A",
    question: "What is the 7th term of the Fibonacci sequence starting with 0, 1?",
    questionType: "multiple_choice",
    options: ["5", "8", "13", "21"],
    correctAnswer: 2,
    explanation: "Sequence: 0, 1, 1, 2, 3, 5, 8, 13. The 7th term (0-indexed) is 13.",
    difficulty: "easy",
    points: 80,
  },
  {
    id: "math-A-4",
    subject: "math",
    level: "A",
    question: "Find the sum: 1 + 2 + 4 + 8 + ... + 1024",
    questionType: "multiple_choice",
    options: ["2047", "2048", "2049", "2050"],
    correctAnswer: 0,
    explanation: "This is a geometric series with r=2, n=11 terms. Sum = 2¹¹ - 1 = 2047.",
    difficulty: "hard",
    points: 150,
  },
  {
    id: "math-A-5",
    subject: "math",
    level: "A",
    question: "A circle has radius 7cm. What is its area to nearest cm²?",
    questionType: "multiple_choice",
    options: ["154 cm²", "44 cm²", "22 cm²", "308 cm²"],
    correctAnswer: 0,
    explanation: "Area = πr² = π × 49 ≈ 3.14 × 49 = 153.86 ≈ 154 cm²",
    difficulty: "easy",
    points: 80,
  },
  // LOGIC - Level A
  {
    id: "logic-A-1",
    subject: "logic",
    level: "A",
    question: "Bebras-style: In a binary tree, each node has either 0 or 2 children. If there are 15 leaves, how many internal nodes are there?",
    questionType: "multiple_choice",
    options: ["7", "14", "15", "30"],
    correctAnswer: 1,
    explanation: "In a full binary tree, leaves = internal nodes + 1. So internal nodes = 15 - 1 = 14.",
    difficulty: "medium",
    points: 120,
    BebrasCategory: "DL",
  },
  {
    id: "logic-A-2",
    subject: "logic",
    level: "A",
    question: "If today is Friday, what day will it be in 100 days?",
    questionType: "multiple_choice",
    options: ["Sunday", "Monday", "Tuesday", "Wednesday"],
    correctAnswer: 0,
    explanation: "100 mod 7 = 2. Friday + 2 days = Sunday.",
    difficulty: "easy",
    points: 80,
    BebrasCategory: "AL",
  },
  {
    id: "logic-A-3",
    subject: "logic",
    level: "A",
    question: "How many different 4-letter permutations can be made from 'COMPUTER'?",
    questionType: "multiple_choice",
    options: ["120", "240", "480", "1680"],
    correctAnswer: 3,
    explanation: "8 letters, choosing 4 in order: 8 × 7 × 6 × 5 = 1680 permutations.",
    difficulty: "medium",
    points: 120,
    BebrasCategory: "CB",
  },
  {
    id: "logic-A-4",
    subject: "logic",
    level: "A",
    question: "Bebras: A secret code uses the pattern ◆●◆▲. What comes next in: ◆●◆▲ ◆◆●● ▲◆●◆ ●●◆▲ ?",
    questionType: "multiple_choice",
    options: ["◆▲●◆", "●◆◆▲", "▲◆◆●", "◆●◆◆"],
    correctAnswer: 2,
    explanation: "Each column shifts down one position in the pattern sequence. The next is ▲◆◆●.",
    difficulty: "hard",
    points: 150,
    BebrasCategory: "IL",
  },
  // PHYSICS - Level A
  {
    id: "physics-A-1",
    subject: "physics",
    level: "A",
    question: "A car accelerates from rest at 2 m/s². How far does it travel in 5 seconds?",
    questionType: "multiple_choice",
    options: ["10 m", "25 m", "50 m", "100 m"],
    correctAnswer: 1,
    explanation: "Using s = ½at² = ½ × 2 × 25 = 25 m. Don't forget the ½!",
    difficulty: "medium",
    points: 100,
  },
  {
    id: "physics-A-2",
    subject: "physics",
    level: "A",
    question: "Two identical resistors (R) are connected in parallel. What is total resistance?",
    questionType: "multiple_choice",
    options: ["R/2", "R", "2R", "R²"],
    correctAnswer: 0,
    explanation: "For parallel: 1/Rtotal = 1/R + 1/R = 2/R, so Rtotal = R/2.",
    difficulty: "medium",
    points: 100,
  },
  {
    id: "physics-A-3",
    subject: "physics",
    level: "A",
    question: "What is the momentum of a 2kg ball moving at 10 m/s?",
    questionType: "multiple_choice",
    options: ["12 kg·m/s", "20 kg·m/s", "5 kg·m/s", "200 kg·m/s"],
    correctAnswer: 1,
    explanation: "Momentum = mass × velocity = 2kg × 10m/s = 20 kg·m/s",
    difficulty: "easy",
    points: 80,
  },
  {
    id: "physics-A-4",
    subject: "physics",
    level: "A",
    question: "A 60W light bulb is on for 2 minutes. How much energy is used?",
    questionType: "multiple_choice",
    options: ["120 J", "3600 J", "7200 J", "720 J"],
    correctAnswer: 2,
    explanation: "Energy = Power × time = 60W × 120s = 7200 J (or 7.2 kJ)",
    difficulty: "medium",
    points: 100,
  },
  // CHEMISTRY - Level A
  {
    id: "chemistry-A-1",
    subject: "chemistry",
    level: "A",
    question: "How many moles are in 36g of water (H₂O)?",
    questionType: "multiple_choice",
    options: ["1 mol", "2 mol", "3 mol", "18 mol"],
    correctAnswer: 1,
    explanation: "Molar mass of H₂O = 18 g/mol. 36g ÷ 18g/mol = 2 mol.",
    difficulty: "medium",
    points: 100,
  },
  {
    id: "chemistry-A-2",
    subject: "chemistry",
    level: "A",
    question: "What type of bond holds NaCl together?",
    questionType: "multiple_choice",
    options: ["Covalent", "Ionic", "Metallic", "Hydrogen"],
    correctAnswer: 1,
    explanation: "NaCl forms through ionic bonding - Na donates an electron to Cl.",
    difficulty: "easy",
    points: 80,
  },
  {
    id: "chemistry-A-3",
    subject: "chemistry",
    level: "A",
    question: "What is the pH of a solution with [H⁺] = 1×10⁻⁴ M?",
    questionType: "multiple_choice",
    options: ["4", "10", "7", "-4"],
    correctAnswer: 0,
    explanation: "pH = -log[H⁺] = -log(10⁻⁴) = 4",
    difficulty: "medium",
    points: 100,
  },
  {
    id: "chemistry-A-4",
    subject: "chemistry",
    level: "A",
    question: "Which element has electron configuration 2,8,8,1?",
    questionType: "multiple_choice",
    options: ["Sodium (Na)", "Potassium (K)", "Calcium (Ca)", "Chlorine (Cl)"],
    correctAnswer: 1,
    explanation: "2+8+8+1 = 19 electrons = Potassium (K). Sodium has 11 electrons.",
    difficulty: "easy",
    points: 80,
  },
  // ENGLISH - Level A
  {
    id: "english-A-1",
    subject: "english",
    level: "A",
    question: "Identify the figure of speech: 'The wind whispered through the trees.'",
    questionType: "multiple_choice",
    options: ["Simile", "Metaphor", "Personification", "Hyperbole"],
    correctAnswer: 2,
    explanation: "Wind is given human qualities (whispering) = Personification.",
    difficulty: "easy",
    points: 80,
  },
  {
    id: "english-A-2",
    subject: "english",
    level: "A",
    question: "Which sentence uses the subjunctive mood correctly?",
    questionType: "multiple_choice",
    options: [
      "If I was taller, I would play basketball.",
      "If I were taller, I would play basketball.",
      "If I am taller, I would play basketball.",
      "If I were taller, I will play basketball."
    ],
    correctAnswer: 1,
    explanation: "The subjunctive uses 'were' for hypothetical situations.",
    difficulty: "medium",
    points: 100,
  },
  {
    id: "english-A-3",
    subject: "english",
    level: "A",
    question: "In 'She gave him a book,' what is the indirect object?",
    questionType: "multiple_choice",
    options: ["She", "him", "book", "a"],
    correctAnswer: 1,
    explanation: "'Him' receives the direct object (book). That's the indirect object.",
    difficulty: "easy",
    points: 80,
  },
  {
    id: "english-A-4",
    subject: "english",
    level: "A",
    question: "Which word is a antonym of 'ephemeral'?",
    questionType: "multiple_choice",
    options: ["Brief", "Temporary", "Eternal", "Fleeting"],
    correctAnswer: 2,
    explanation: "Ephemeral means short-lived. Eternal means lasting forever - opposite meaning.",
    difficulty: "medium",
    points: 100,
  },
  // SCIENCE - Level A
  {
    id: "science-A-1",
    subject: "science",
    level: "A",
    question: "What type of cell division produces gametes?",
    questionType: "multiple_choice",
    options: ["Mitosis", "Meiosis", "Binary fission", "Budding"],
    correctAnswer: 1,
    explanation: "Meiosis produces haploid gametes with half the chromosome number.",
    difficulty: "medium",
    points: 100,
  },
  {
    id: "science-A-2",
    subject: "science",
    level: "A",
    question: "What is the function of the mitochondria?",
    questionType: "multiple_choice",
    options: ["DNA storage", "Protein synthesis", "Energy production", "Cell division"],
    correctAnswer: 2,
    explanation: "Mitochondria produce ATP through cellular respiration - the powerhouse!",
    difficulty: "easy",
    points: 80,
  },
  {
    id: "science-A-3",
    subject: "science",
    level: "A",
    question: "In the carbon cycle, what process releases CO₂ into the atmosphere?",
    questionType: "multiple_choice",
    options: ["Photosynthesis", "Respiration", "Decomposition", "Both B and C"],
    correctAnswer: 3,
    explanation: "Both respiration (organisms) and decomposition (fungi/bacteria) release CO₂.",
    difficulty: "medium",
    points: 100,
  },
  {
    id: "science-A-4",
    subject: "science",
    level: "A",
    question: "What is the function of white blood cells?",
    questionType: "multiple_choice",
    options: ["Carry oxygen", "Fight infection", "Blood clotting", "Carry nutrients"],
    correctAnswer: 1,
    explanation: "White blood cells (leukocytes) are part of the immune system.",
    difficulty: "easy",
    points: 80,
  },
  // ========== LEVEL B (10yo) ==========
  // MATH - Level B
  {
    id: "math-B-1",
    subject: "math",
    level: "B",
    question: "What is 24 + 17?",
    questionType: "multiple_choice",
    options: ["41", "40", "31", "51"],
    correctAnswer: 0,
    explanation: "24 + 10 = 34, 34 + 7 = 41. You can also do 20 + 10 = 30, 4 + 7 = 11, 30 + 11 = 41.",
    difficulty: "easy",
    points: 50,
  },
  {
    id: "math-B-2",
    subject: "math",
    level: "B",
    question: "What is 8 × 7?",
    questionType: "multiple_choice",
    options: ["54", "56", "48", "64"],
    correctAnswer: 1,
    explanation: "8 × 7 means 8 added together 7 times: 8+8+8+8+8+8+8 = 56. Or remember: 5×7=35, 3×7=21, 35+21=56!",
    difficulty: "easy",
    points: 50,
  },
  {
    id: "math-B-3",
    subject: "math",
    level: "B",
    question: "If you have €5.00 and spend €2.30, how much do you have left?",
    questionType: "multiple_choice",
    options: ["€3.70", "€2.70", "€3.30", "€2.30"],
    correctAnswer: 1,
    explanation: "€5.00 - €2.30 = €2.70. Think: €5 - €2 = €3, then €3 - €0.30 = €2.70.",
    difficulty: "medium",
    points: 70,
  },
  {
    id: "math-B-4",
    subject: "math",
    level: "B",
    question: "What is half of 84?",
    questionType: "multiple_choice",
    options: ["42", "44", "40", "46"],
    correctAnswer: 0,
    explanation: "Half means divide by 2. 84 ÷ 2 = 42. Think: 80÷2=40, 4÷2=2, 40+2=42.",
    difficulty: "easy",
    points: 50,
  },
  {
    id: "math-B-5",
    subject: "math",
    level: "B",
    question: "A shop sells 6 apples for €2.40. How much is one apple?",
    questionType: "multiple_choice",
    options: ["€0.30", "€0.40", "€0.50", "€0.60"],
    correctAnswer: 1,
    explanation: "€2.40 ÷ 6 = €0.40 per apple. €2.40 = 240 cents, 240÷6=40 cents = €0.40!",
    difficulty: "medium",
    points: 70,
  },
  // ENGLISH - Level B
  {
    id: "english-B-1",
    subject: "english",
    level: "B",
    question: "Which word is a verb?",
    questionType: "multiple_choice",
    options: ["Happy", "Quickly", "Jump", "Blue"],
    correctAnswer: 2,
    explanation: "Jump is an action word (verb). Happy is describing word (adjective), Quickly is an adverb, Blue is a colour (adjective).",
    difficulty: "easy",
    points: 50,
  },
  {
    id: "english-B-2",
    subject: "english",
    level: "B",
    question: "What is the plural of 'child'?",
    questionType: "multiple_choice",
    options: ["Childs", "Childrens", "Children", "Childes"],
    correctAnswer: 2,
    explanation: "Child is an irregular noun. Its plural is children - you need to remember this one!",
    difficulty: "easy",
    points: 50,
  },
  {
    id: "english-B-3",
    subject: "english",
    level: "B",
    question: "Which sentence is correct?",
    questionType: "multiple_choice",
    options: [
      "The dog chase the cat.",
      "The dogs chases the cat.",
      "The dog chases the cat.",
      "The dog chased the cats."
    ],
    correctAnswer: 2,
    explanation: "One dog (singular) chasing = 'chases'. The other sentences have wrong verb agreement.",
    difficulty: "medium",
    points: 70,
  },
  {
    id: "english-B-4",
    subject: "english",
    level: "B",
    question: "What type of word is 'big'?",
    questionType: "multiple_choice",
    options: ["Verb", "Noun", "Adjective", "Adverb"],
    correctAnswer: 2,
    explanation: "Big describes a noun (it tells us size), so it's an adjective.",
    difficulty: "easy",
    points: 50,
  },
  {
    id: "english-B-5",
    subject: "english",
    level: "B",
    question: "Choose the correct spelling:",
    questionType: "multiple_choice",
    options: ["Beautiful", "Beutiful", "Beutiful", "Beauteiful"],
    correctAnswer: 0,
    explanation: "Beautiful has 'eau' in the middle - remember: 'a beautiful day'!",
    difficulty: "easy",
    points: 50,
  },
  // SCIENCE - Level B
  {
    id: "science-B-1",
    subject: "science",
    level: "B",
    question: "What do plants need to grow?",
    questionType: "multiple_choice",
    options: ["Only water", "Water and sunlight", "Only sunlight", "Soil only"],
    correctAnswer: 1,
    explanation: "Plants need water AND sunlight to make their food through photosynthesis!",
    difficulty: "easy",
    points: 50,
  },
  {
    id: "science-B-2",
    subject: "science",
    level: "B",
    question: "How many legs does a spider have?",
    questionType: "multiple_choice",
    options: ["6", "8", "10", "4"],
    correctAnswer: 1,
    explanation: "Spiders have 8 legs - they're arachnids, not insects!",
    difficulty: "easy",
    points: 50,
  },
  {
    id: "science-B-3",
    subject: "science",
    level: "B",
    question: "What are the three states of water?",
    questionType: "multiple_choice",
    options: ["Hot, Cold, Warm", "Solid, Liquid, Gas", "Rain, Snow, Ice", "Big, Medium, Small"],
    correctAnswer: 1,
    explanation: "Water can be ice (solid), liquid water, or steam (gas) - these are states of matter!",
    difficulty: "medium",
    points: 70,
  },
  {
    id: "science-B-4",
    subject: "science",
    level: "B",
    question: "What organ pumps blood around your body?",
    questionType: "multiple_choice",
    options: ["Brain", "Lungs", "Heart", "Stomach"],
    correctAnswer: 2,
    explanation: "Your heart is a muscle that pumps blood to all parts of your body!",
    difficulty: "easy",
    points: 50,
  },
  {
    id: "science-B-5",
    subject: "science",
    level: "B",
    question: "What do caterpillars turn into?",
    questionType: "multiple_choice",
    options: ["Beetles", "Butterflies", "Spiders", "Birds"],
    correctAnswer: 1,
    explanation: "A caterpillar goes through metamorphosis to become a butterfly - amazing transformation!",
    difficulty: "easy",
    points: 50,
  },
  // ========== USER-PROVIDED QUESTIONS ==========
  // PINK's QUESTIONS (Level A)
  {
    id: "p_math_001",
    subject: "math",
    level: "A",
    question: "(IMTA Style) The sum of the ages of three siblings is 32. The oldest is twice as old as the youngest, and the middle sibling is 4 years older than the youngest. How old is the oldest sibling?",
    questionType: "multiple_choice",
    options: ["12", "14", "16", "18"],
    correctAnswer: 1,
    explanation: "Let youngest = x. Middle = x + 4. Oldest = 2x. So, x + (x + 4) + 2x = 32. 4x + 4 = 32, 4x = 28, x = 7. The oldest is 2(7) = 14.",
    difficulty: "hard",
    difficultyLevel: 8,
    points: 150,
  },
  {
    id: "p_physics_001",
    subject: "physics",
    level: "A",
    question: "As a violinist in the RIAM orchestra, you know about tuning. If the tension of your A-string is increased by 21%, what happens to the fundamental frequency of the sound it produces?",
    questionType: "multiple_choice",
    options: ["Increases by 10%", "Increases by 21%", "Decreases by 10%", "Increases by 4.5%"],
    correctAnswer: 0,
    explanation: "Frequency is proportional to the square root of tension (f ∝ √T). If tension becomes 1.21T, the new frequency is √1.21 = 1.1 times the original, which is a 10% increase.",
    difficulty: "hard",
    difficultyLevel: 9,
    points: 180,
  },
  // ROSIE's QUESTIONS (Level B)
  {
    id: "r_logic_001",
    subject: "logic",
    level: "B",
    question: "Maker Lab Challenge: You are migrating your Escape Room game from Scratch to Python. In Scratch, you used 'if Key [Space] pressed? then Jump'. How do you write a basic if-statement in Python to check if a variable 'key_pressed' equals 'space'?",
    questionType: "multiple_choice",
    options: ["if key_pressed = 'space':", "if key_pressed == 'space':", "if (key_pressed == 'space') then", "check key_pressed is 'space'"],
    correctAnswer: 1,
    explanation: "In Python, we use a double equals sign '==' to check if two things are equal, and we end the if-statement line with a colon ':' instead of the word 'then'.",
    difficulty: "medium",
    difficultyLevel: 5,
    points: 80,
  },
  {
    id: "r_math_001",
    subject: "math",
    level: "B",
    question: "Game Design Math: Your main character has 120 Health Points (HP). She takes a hit that removes 1/4 of her total HP. Then she finds a potion that restores 15 HP. What is her HP now?",
    questionType: "multiple_choice",
    options: ["90", "105", "110", "115"],
    correctAnswer: 1,
    explanation: "1/4 of 120 is 30. So she loses 30 HP (120 - 30 = 90). Then the potion adds 15 HP (90 + 15 = 105).",
    difficulty: "easy",
    difficultyLevel: 4,
    points: 60,
  },
];

async function seedQuestions() {
  console.log("🌱 Starting Firestore seed...\n");

  const questionsRef = collection(db, "questions");
  let successCount = 0;
  let errorCount = 0;

  for (const question of questions) {
    try {
      await addDoc(questionsRef, question);
      successCount++;
      console.log(`  ✓ Added: ${question.id} (${question.subject}/${question.level})`);
    } catch (error) {
      errorCount++;
      console.error(`  ✗ Failed: ${question.id}`, error.message);
    }
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   Successfully uploaded: ${successCount}`);
  console.log(`   Failed: ${errorCount}`);
  console.log(`\n   Run 'npm run dev' and check your Firebase console.`);
}

seedQuestions().catch(console.error);