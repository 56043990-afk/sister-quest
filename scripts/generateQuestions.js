#!/usr/bin/env node

/**
 * SisterQuest - AI Auto-Generator Engine
 *
 * Generates and uploads quiz questions to Firestore using an LLM (OpenAI or Anthropic).
 * Fully automated: calls the LLM → parses JSON → uploads to Firestore.
 *
 * Usage:
 *   node scripts/generateQuestions.js --pink          # Generate for Pink only (Level A)
 *   node scripts/generateQuestions.js --rosie         # Generate for Rosie only (Level B)
 *   node scripts/generateQuestions.js --all            # Generate for both profiles
 *   node scripts/generateQuestions.js --dry-run        # Preview prompts without uploading
 *
 * Environment (.env.local):
 *   LLM_API_KEY        - Your OpenAI or Anthropic API key
 *   LLM_PROVIDER       - "openai" or "anthropic" (auto-detected from key prefix if unset)
 *   FIREBASE_PROJECT_ID - Firestore project ID (optional, uses NEXT_PUBLIC_FIREBASE_PROJECT_ID fallback)
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// =============================================================================
// ENV CONFIG
// =============================================================================

function loadEnv() {
  try {
    const envPath = path.join(__dirname, "..", ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      content.split("\n").forEach((line) => {
        const [key, ...vals] = line.split("=");
        if (key && vals.length > 0) {
          const k = key.trim();
          const v = vals.join("=").trim();
          if (!process.env[k]) process.env[k] = v;
        }
      });
    }
  } catch { /* ignore */ }
}

loadEnv();

const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_PROVIDER = process.env.LLM_PROVIDER ||
  (LLM_API_KEY?.startsWith("sk-") ? "openai" :
   LLM_API_KEY?.startsWith("sk-ant") ? "anthropic" : "openai");
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sisterquest-b041f";

// =============================================================================
// FIREBASE ADMIN INIT
// =============================================================================

let adminDb = null;
let adminInitialized = false;

function initFirebaseAdmin() {
  if (adminInitialized) return;
  try {
    // Try to load firebase-admin from project node_modules
    const adminPath = path.join(__dirname, "..", "node_modules", "firebase-admin", "lib", "index.js");
    if (fs.existsSync(adminPath)) {
      const admin = require(adminPath);
      const { applicationDefault } = require(adminPath);
      // Use service account from environment or application default
      admin.initializeApp({
        credential: applicationDefault(),
        projectId: PROJECT_ID,
      });
      adminDb = admin.firestore();
      adminInitialized = true;
      console.log("✅ Firebase Admin initialized");
    }
  } catch (e) {
    console.warn("⚠️  Firebase Admin not available:", e.message);
    console.warn("   Questions will be logged to console instead of uploaded to Firestore.");
    adminInitialized = true; // prevent retry
  }
}

// =============================================================================
// LLM API CALLS (native fetch, no SDK)
// =============================================================================

async function callOpenAI(prompt, systemPrompt) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LLM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(prompt, systemPrompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": LLM_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-7",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? "";
}

async function callLLM(prompt, systemPrompt) {
  console.log(`   🔄 Calling ${LLM_PROVIDER === "anthropic" ? "Claude (Sonnet 4)" : "GPT-4o"}...`);
  if (LLM_PROVIDER === "anthropic") {
    return callAnthropic(prompt, systemPrompt);
  }
  return callOpenAI(prompt, systemPrompt);
}

// =============================================================================
// JSON PARSING (with retry on markdown-wrapped output)
// =============================================================================

function parseJSONResponse(text) {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]+?)```/);
  if (fenceMatch) cleaned = fenceMatch[1].trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch { /* fall through */ }

  // Try extracting first JSON array or object from the text
  const arrayMatch = cleaned.match(/\[[\s\S]+?\]/);
  const objectMatch = cleaned.match(/\{[\s\S]+\}/);

  if (arrayMatch) {
    try { return JSON.parse(arrayMatch[0]); } catch { /* fall through */ }
  }
  if (objectMatch) {
    try { return JSON.parse(objectMatch[0]); } catch { /* fall through */ }
  }

  throw new Error("Could not parse JSON from LLM response");
}

// =============================================================================
// QUESTION SCHEMA VALIDATION
// =============================================================================

function validateQuestion(q, level) {
  const required = ["subject", "question", "questionType", "correctAnswer", "explanation", "difficulty", "difficultyLevel", "level"];
  for (const field of required) {
    if (q[field] === undefined) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  if (!["math", "english", "science", "logic", "physics", "chemistry"].includes(q.subject)) {
    throw new Error(`Invalid subject: ${q.subject}`);
  }
  if (!["multiple_choice", "short_answer", "reading_comprehension", "visual_analysis"].includes(q.questionType)) {
    throw new Error(`Invalid questionType: ${q.questionType}`);
  }
  if (q.level !== level) q.level = level;
  if (!q.id) q.id = `${q.subject}-${level}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  if (q.options && Array.isArray(q.options) && q.options.length >= 2) {
    if (typeof q.correctAnswer === "string") {
      q.correctAnswer = q.options.findIndex(
        (o) => o.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
      );
      if (q.correctAnswer === -1) q.correctAnswer = 0;
    }
    q.correctAnswer = Math.max(0, Math.min(q.options.length - 1, Number(q.correctAnswer)));
  }
  return q;
}

// =============================================================================
// FIRESTORE UPLOAD
// =============================================================================

async function uploadQuestionsToFirestore(questions, level) {
  if (!adminDb) {
    console.log("\n📋 Questions (not uploaded — Firebase Admin unavailable):");
    questions.forEach((q, i) => {
      console.log(`  ${i + 1}. [${q.subject}] ${q.question.slice(0, 60)}...`);
    });
    return questions.length;
  }

  const batch = adminDb.batch();
  let count = 0;

  for (const q of questions) {
    const ref = adminDb.collection("questions").doc(q.id);
    batch.set(ref, {
      ...q,
      level,
      createdAt: adminDb.FieldValue.serverTimestamp(),
      generatedAt: new Date().toISOString(),
    }, { merge: true });
    count++;
    // Firestore batch limit is 500, but we won't hit that
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`   📤 Uploaded ${count} questions...`);
    }
  }

  await batch.commit();
  return count;
}

// =============================================================================
// PROMPT TEMPLATES
// =============================================================================

const SYSTEM_PROMPT = `You are an expert Irish education curriculum designer for the SisterQuest adaptive learning platform. You generate precisely formatted JSON question banks for quizzes. Follow the schema exactly — no extra text, no commentary, only valid JSON output. Every question must be curriculum-aligned, engaging, and age-appropriate for the specified student level. Include reading comprehension passages and visual analysis questions to ensure diversity (15%+ of questions should be passage or image-based).`;

function buildPinkPrompt() {
  return `Generate exactly 20 quiz questions for a 13-year-old advanced student (Junior Cycle, Level A) in Ireland.

SUBJECT DISTRIBUTION (20 questions):
- Math (IMTA Olympiad style): 5 questions
  Topics: algebraic reasoning, number theory, sequences, geometry proofs, combinatorics
  Difficulty spread: 2 easy, 2 medium, 1 hard (difficultyLevel 1-10 scale)

- Computational Logic (Bebras competition style): 5 questions
  Bebras categories: AL, CB, DL, IL, RG — use authentic Bebras wording
  Examples: "Bebras beavers built...", "In the binary forest...", "The clever fox..."
  Topics: pattern recognition, binary trees, algorithmic steps, data encoding, rule discovery
  At least 2 must use a "passage" with a short story/scenario and reading_comprehension questionType

- Physics: 4 questions
  Topics: mechanics, waves, electricity, energy conservation
  Real-world engineering context: bridge design, roller coasters, musical instruments
  At least 1 must be visual_analysis questionType with an image description

- Chemistry: 3 questions
  Topics: periodic table patterns, reaction types, molecular structure
  Include a short reading passage for 1 question

- English/Reading Comprehension: 3 questions
  Topics: inference, vocabulary in context, literaryDevices
  Must include a reading passage (3-4 sentences minimum) and multiple sub-questions OR one deep comprehension question
  questionType must be "reading_comprehension" for these

QUESTION SCHEMA (each question MUST have):
{
  "id": "subject-level-timestamp-suffix",
  "subject": "math|logic|physics|chemistry|english|science",
  "level": "A",
  "question": "exact question text",
  "questionType": "multiple_choice|short_answer|reading_comprehension|visual_analysis",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correctAnswer": 0-3 (index of correct option, MUST be integer),
  "explanation": "Detailed explanation of why the correct answer is right AND why each wrong answer is wrong",
  "difficulty": "easy|medium|hard",
  "difficultyLevel": 1-10 integer,
  "points": 80-150 (higher for harder),
  "passage": "3-4 sentence passage text" (required for reading_comprehension and at least 2 logic questions),
  "imageUrl": "description of image for analysis" (optional, for visual_analysis)
}

DIFFICULTY GUIDELINES:
- easy: difficultyLevel 1-4 — straightforward application of one concept
- medium: difficultyLevel 5-7 — multi-step reasoning, 2-3 concept integration
- hard: difficultyLevel 8-10 — Olympiad-level insight, novel problem decomposition

DIVERSITY REQUIREMENT:
- At least 3 reading_comprehension questions (with actual passage text)
- At least 2 visual_analysis questions (with imageUrl descriptions)
- Mix of questionType: ~14 multiple_choice, ~2 short_answer, ~3 reading_comprehension, ~1 visual_analysis

OUTPUT: A single JSON array with exactly 20 objects, no extra text.`;
}

function buildRosiePrompt() {
  return `Generate exactly 20 quiz questions for a 10-year-old student (Irish 4th/5th Class, Level B) in Ireland.

SUBJECT DISTRIBUTION (20 questions):
- Math (Game Design themed): 6 questions
  Topics: coordinates (X,Y in video games), HP/damage calculations, score multipliers, grid movement
  Use exciting game scenarios: "Hero's health bar", "Dragon's HP", "score multiplier combos"
  Difficulty: 1-4 easy, 2 medium, 0-1 harder (difficultyLevel 1-10 for 10yo scale)

- Scratch-to-Python Bridge: 4 questions
  Translate Scratch block concepts to Python:
  - "If-then" blocks → Python if statements
  - Loop blocks → Python for/while loops
  - Variables in Scratch → Python variables
  Make it feel like game coding!

- Computational Logic / Escape Room: 4 questions
  Multi-step conditional puzzles:
  - "If key is red AND door is locked, then..."
  - Multi-step puzzle chains (3-4 steps)
  - Escape room scenarios with fun narratives
  At least 2 with a short passage/story

- Science (Musical Instruments): 4 questions
  Topics: sound waves (high pitch = high frequency), how instruments make sounds differently
  Piano keys, saxophone fingerings, mathematical ratios in music (octaves = 2:1)
  Game/quest context: "The Magic Music Machine", "Sound Lab adventure"

- English / Vocabulary: 2 questions
  Topics: word meaning in context, simple literary devices, reading comprehension
  Must include a short passage (2-3 sentences) with questionType reading_comprehension

QUESTION SCHEMA (each question MUST have):
{
  "id": "subject-level-timestamp-suffix",
  "subject": "math|english|science|logic",
  "level": "B",
  "question": "exact question text (game-themed for math)",
  "questionType": "multiple_choice|short_answer|reading_comprehension",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correctAnswer": 0-3 (index of correct option, MUST be integer),
  "explanation": "Simple explanation a 10yo would understand and find satisfying",
  "difficulty": "easy|medium|hard",
  "difficultyLevel": 1-10 (keep easy: 1-5, medium: 6-7, hard: 8-10 for 10yo),
  "points": 50-100 (based on difficulty),
  "passage": "2-3 sentence passage" (required for reading_comprehension and at least 3 logic questions)
}

GAME THEME REQUIREMENTS:
- Math questions MUST use video game scenarios
- All questions should feel like an adventure or game quest
- Language must be simple, fun, and exciting for a 10yo
- Avoid abstract concepts — always ground in something concrete and relatable

DIVERSITY:
- At least 2 reading_comprehension questions with passages
- Mix: ~16 multiple_choice, ~2 short_answer, ~2 reading_comprehension

OUTPUT: A single JSON array with exactly 20 objects, no extra text.`;
}

// =============================================================================
// DRY RUN (preview prompts)
// =============================================================================

async function dryRun(target) {
  console.log("\n🎯 DRY RUN — Question Generation Prompts\n");
  console.log("=".repeat(80));
  console.log("To run for real, set LLM_API_KEY in .env.local and run:");
  console.log("  node scripts/generateQuestions.js --pink   # Pink only");
  console.log("  node scripts/generateQuestions.js --rosie  # Rosie only");
  console.log("  node scripts/generateQuestions.js --all    # Both profiles");
  console.log("=".repeat(80));

  if (target === "pink" || target === "all") {
    console.log("\n📚 PINK (Level A — 13yo, Junior Cycle)");
    console.log("-".repeat(80));
    console.log(buildPinkPrompt());
  }

  if (target === "rosie" || target === "all") {
    console.log("\n\n⭐ ROSIE (Level B — 10yo, 4th/5th Class)");
    console.log("-".repeat(80));
    console.log(buildRosiePrompt());
  }
}

// =============================================================================
// MAIN GENERATION LOGIC
// =============================================================================

async function generateForProfile(level) {
  const profileName = level === "A" ? "Pink" : "Rosie";
  const systemPrompt = SYSTEM_PROMPT;
  const userPrompt = level === "A" ? buildPinkPrompt() : buildRosiePrompt();

  console.log(`\n🎲 Generating 20 questions for ${profileName} (Level ${level})...`);

  let raw;
  try {
    raw = await callLLM(userPrompt, systemPrompt);
    console.log(`   ✅ LLM response received (${raw.length} chars)`);
  } catch (err) {
    console.error(`   ❌ LLM call failed: ${err.message}`);
    return 0;
  }

  let parsed;
  try {
    parsed = parseJSONResponse(raw);
  } catch (err) {
    console.error(`   ❌ JSON parse failed: ${err.message}`);
    console.error("   Raw response:", raw.slice(0, 300));
    return 0;
  }

  const questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
  if (questions.length === 0) {
    console.error("   ❌ No questions found in response");
    return 0;
  }

  console.log(`   📝 Parsed ${questions.length} questions`);

  const validated = [];
  for (let i = 0; i < questions.length; i++) {
    try {
      validated.push(validateQuestion(questions[i], level));
    } catch (err) {
      console.warn(`   ⚠️  Question ${i + 1} invalid, skipping: ${err.message}`);
    }
  }

  console.log(`   ✅ ${validated.length} validated questions`);
  const uploaded = await uploadQuestionsToFirestore(validated, level);
  console.log(`   📤 ${uploaded} questions uploaded to Firestore`);
  return uploaded;
}

// =============================================================================
// CLI
// =============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
🎯 SisterQuest AI Question Generator

Usage:
  node scripts/generateQuestions.js [options]

Options:
  --pink       Generate for Pink only (Level A — 13yo Junior Cycle)
  --rosie      Generate for Rosie only (Level B — 10yo 4th/5th Class)
  --all        Generate for both profiles (default)
  --dry-run    Preview prompts without calling LLM or uploading
  --help, -h   Show this help

Environment (.env.local):
  LLM_API_KEY      Your OpenAI or Anthropic API key (required for --pink/--rosie/--all)
  LLM_PROVIDER     "openai" or "anthropic" (auto-detected from key prefix)
  FIREBASE_PROJECT_ID  Firestore project ID (auto-fallback to .env.local value)

Examples:
  node scripts/generateQuestions.js --dry-run
  node scripts/generateQuestions.js --pink
  node scripts/generateQuestions.js --all

First time? Run --dry-run to see the prompts, then set LLM_API_KEY in .env.local
    `);
    return;
  }

  const target = args.includes("--pink")
    ? "pink"
    : args.includes("--rosie")
    ? "rosie"
    : "all";

  if (args.includes("--dry-run")) {
    await dryRun(target);
    return;
  }

  // Validate API key
  if (!LLM_API_KEY) {
    console.error("❌ LLM_API_KEY not set in .env.local");
    console.error("   Set it like: LLM_API_KEY=sk-...");
    console.error("   Then run: node scripts/generateQuestions.js --all");
    process.exit(1);
  }

  initFirebaseAdmin();

  const profiles = target === "all"
    ? ["A", "B"]
    : target === "pink" ? ["A"] : ["B"];

  let totalUploaded = 0;
  for (const level of profiles) {
    const count = await generateForProfile(level);
    totalUploaded += count;
  }

  console.log(`\n✅ Done! Total questions uploaded: ${totalUploaded}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});