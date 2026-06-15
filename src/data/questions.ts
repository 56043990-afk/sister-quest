import { mathQuestions } from "./mathQuestions";
import { Question } from "@/types/quiz";

export const questions: Question[] = [...mathQuestions,
  // ============================================================================
  // ========== LEVEL A: PINK (13yo - Advanced Junior Cycle / STEAM) ==========
  // ============================================================================

  // --- HISTORY (New Subject!) ---
  {
    id: "p_history_001",
    subject: "history",
    level: "A",
    question: "During the Renaissance, which famous polymath painted the Mona Lisa and also filled notebooks with designs for flying machines?",
    questionType: "multiple_choice",
    options: ["Michelangelo", "Galileo Galilei", "Leonardo da Vinci", "Raphael"],
    correctAnswer: 2,
    explanation: "Leonardo da Vinci was the ultimate 'Renaissance Man'. He wasn't just an artist; his engineering and anatomy sketches were centuries ahead of their time!",
    difficulty: "medium",
    points: 100,
  },
  {
    id: "p_history_002",
    subject: "history",
    level: "A",
    question: "The Great Famine (An Gorta Mór) in Ireland began in 1845. What caused the widespread failure of the potato crop?",
    questionType: "multiple_choice",
    options: ["A severe drought", "A fungal disease called potato blight", "Over-harvesting by the British", "A harsh winter frost"],
    correctAnswer: 1,
    explanation: "It was caused by a water mold (Phytophthora infestans) known as potato blight, which thrived in the damp Irish climate and destroyed the primary food source for the poor.",
    difficulty: "medium",
    points: 100,
  },

  // --- MATH ---
  {
    id: "p_math_001",
    subject: "math",
    level: "A",
    question: "(IMTA Olympiad Style) The sum of the ages of three siblings is 32. The oldest is twice as old as the youngest, and the middle sibling is 4 years older than the youngest. How old is the oldest?",
    questionType: "multiple_choice",
    options: ["12", "14", "16", "18"],
    correctAnswer: 1,
    explanation: "Let youngest = x. Middle = x+4. Oldest = 2x. Equation: x + (x+4) + 2x = 32. So 4x = 28, meaning x = 7. The oldest is 2(7) = 14.",
    difficulty: "hard",
    points: 150,
  },
  {
    id: "p_math_002",
    subject: "math",
    level: "A",
    question: "If you have a right-angled triangle where the two shorter sides are 3cm and 4cm, what is the length of the hypotenuse?",
    questionType: "multiple_choice",
    options: ["5cm", "6cm", "7cm", "25cm"],
    correctAnswer: 0,
    explanation: "Pythagoras' Theorem! a² + b² = c². 3² + 4² = 9 + 16 = 25. The square root of 25 is 5. This is the famous 3-4-5 triangle.",
    difficulty: "medium",
    points: 100,
  },

  // --- PHYSICS ---
  {
    id: "p_physics_001",
    subject: "physics",
    level: "A",
    question: "As a violinist, you know about tuning. If the tension of your A-string is increased by 21%, what happens to the fundamental frequency (pitch) it produces?",
    questionType: "multiple_choice",
    options: ["Increases by 10%", "Increases by 21%", "Decreases by 10%", "Increases by 4.5%"],
    correctAnswer: 0,
    explanation: "Frequency is proportional to the square root of tension. √1.21 = 1.1, which means a 10% increase in frequency. Physics makes music!",
    difficulty: "hard",
    points: 150,
  },

  // --- LOGIC / COMPUTER SCIENCE ---
  {
    id: "p_logic_001",
    subject: "logic",
    level: "A",
    question: "Bebras Challenge: A cipher shifts every letter forward by 3 places in the alphabet (A becomes D, B becomes E). How do you decode the word 'FDW'?",
    questionType: "multiple_choice",
    options: ["CAT", "DOG", "BAT", "CAR"],
    correctAnswer: 0,
    explanation: "To decode, shift backward by 3. F-3 = C. D-3 = A. W-3 = T. The answer is CAT! This is called a Caesar Cipher.",
    difficulty: "medium",
    points: 100,
    BebrasCategory: "AL",
  },


  // ============================================================================
  // ========== LEVEL B: ROSIE (10yo - Primary 4th/5th Class / Fun & Maker) =====
  // ============================================================================

  // --- LOGIC / MAKER ---
  {
    id: "r_logic_001",
    subject: "logic",
    level: "B",
    question: "Maker Lab: You are moving your Escape Room game from Scratch to Python. In Scratch, you used 'if Key [Space] pressed?'. How do you write a check in Python if a variable 'key' equals 'space'?",
    questionType: "multiple_choice",
    options: ["if key = 'space':", "if key == 'space':", "if (key == 'space') then", "check key is 'space'"],
    correctAnswer: 1,
    explanation: "In Python, we use a double equals '==' to check if things are the same, and we put a colon ':' at the end instead of saying 'then'!",
    difficulty: "medium",
    points: 80,
  },
  {
    id: "r_logic_002",
    subject: "logic",
    level: "B",
    question: "If a robot is facing North, and you give it the instructions: TURN RIGHT, TURN RIGHT, GO FORWARD. Which direction is it walking?",
    questionType: "multiple_choice",
    options: ["North", "East", "South", "West"],
    correctAnswer: 2,
    explanation: "Facing North. One right turn = East. Second right turn = South. So the robot is walking South!",
    difficulty: "easy",
    points: 50,
  },

  // --- MATH ---
  {
    id: "r_math_001",
    subject: "math",
    level: "B",
    question: "Game Design Math: Your character has 120 HP. She takes a hit that removes 1/4 of her total HP. Then she drinks a potion that restores 15 HP. What is her HP now?",
    questionType: "multiple_choice",
    options: ["90", "105", "110", "115"],
    correctAnswer: 1,
    explanation: "1/4 of 120 is 30. She loses 30 HP (120 - 30 = 90). The potion adds 15 back (90 + 15 = 105). You survived!",
    difficulty: "medium",
    points: 70,
  },
  {
    id: "r_math_002",
    subject: "math",
    level: "B",
    question: "Baking challenge! A recipe needs 200g of flour to make 12 cupcakes. If you only want to make 6 cupcakes, how much flour do you need?",
    questionType: "multiple_choice",
    options: ["100g", "150g", "50g", "400g"],
    correctAnswer: 0,
    explanation: "6 cupcakes is exactly half of 12. So you need half the flour! Half of 200g is 100g.",
    difficulty: "easy",
    points: 50,
  },

  // --- SCIENCE ---
  {
    id: "r_science_001",
    subject: "science",
    level: "B",
    question: "What is the largest planet in our solar system?",
    questionType: "multiple_choice",
    options: ["Earth", "Mars", "Saturn", "Jupiter"],
    correctAnswer: 3,
    explanation: "Jupiter is the biggest! It's a gas giant and is so large that over 1,300 Earths could fit inside it.",
    difficulty: "easy",
    points: 50,
  },
  {
    id: "r_science_002",
    subject: "science",
    level: "B",
    question: "What do caterpillars undergo to turn into beautiful butterflies?",
    questionType: "multiple_choice",
    options: ["Photosynthesis", "Metamorphosis", "Hibernation", "Evaporation"],
    correctAnswer: 1,
    explanation: "It's called Metamorphosis! It's a big science word that means an animal completely changes its body shape as it grows up.",
    difficulty: "easy",
    points: 50,
  }
];

export function getQuestionsBySubjectAndLevel(
  subject: string,
  level: "A" | "B"
): Question[] {
  return questions.filter(
    (q) => q.subject === subject && q.level === level
  );
}

export function getAllQuestionsByLevel(level: "A" | "B"): Question[] {
  return questions.filter((q) => q.level === level);
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}
