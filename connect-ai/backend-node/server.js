require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const axios   = require("axios");
const { MongoClient, ObjectId } = require("mongodb");
const Groq    = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());
const PYTHON_AI_URL = (process.env.PYTHON_AI_URL || "http://localhost:8000").replace(/\/+$/, "");

// ─── MongoDB ──────────────────────────────────────────────────────────────────
let db;
async function connectDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db("test");
  console.log("✅ MongoDB connected");
}
connectDB().catch(console.error);

// ─── Platform Knowledge Base ──────────────────────────────────────────────────
const PLATFORM_KNOWLEDGE = `
You are Connect AI — the official assistant for the Connect platform.
Connect is a platform that bridges students and alumni for learning, mentorship, and career growth.

=== PLATFORM OVERVIEW ===
Connect has three types of users: Students, Alumni, and Admins.

=== STUDENT FEATURES ===
• Home Feed: See posts from alumni and fellow students. Like, comment, and engage.
• Academics: Browse and enroll in courses, live sessions, and workshops uploaded by alumni.
• Networking: Discover alumni profiles, filter by skill/company/role, send connection requests.
• Messages: Message alumni directly. Students are grouped as Basic or Active Membership based on subscription status.
• My Learning: Track enrolled courses, sessions, and workshop progress.
• Profile: Edit your profile, add skills, upload photo, view your activity stats.
• Alumni Profile View: Click any alumni card to see their detailed profile, skills, experience, and offerings.

=== ALUMNI FEATURES ===
Two tiers: Simple and Premium.

Simple Plan (Free):
• Post in the home feed (text, images, tips, updates)
• Connect with students and reply to messages
• Handle basic student messages

Premium Plan (Paid monthly):
• Everything in Simple, PLUS:
• Upload and monetize paid courses, 1-on-1 sessions, and workshops
• Enable alumni membership subscriptions for students
• Platform takes a 20% cut from all earnings
• Access to advanced analytics on your content performance
• Priority listing in student searches

My Posts: Manage all your feed posts.
Sessions/Workshops: Create, schedule, and manage your paid sessions.
Earnings: View total earnings, token balance, payout history.

=== ADMIN FEATURES ===
• Dashboard: Platform-wide stats (users, revenue, activity).
• Users Management: View, verify, suspend all student and alumni accounts.
• Courses Management: Approve, remove, or feature courses.
• Sessions Management: Oversee all scheduled sessions and workshops.
• Analytics: Deep insights into platform engagement and growth.

=== COLLEGE PARTNERSHIPS ===
• Partner colleges provide venues for in-person workshops.
• Alumni hosting on-campus events earn extra pay from the college.
• Students from partner colleges get special discounts on sessions.

=== MESSAGING & PAYMENTS ===
• Students can subscribe to alumni memberships to unlock member benefits.
• Alumni can manage subscriptions through the Membership dashboard.
• Alumni with inactive membership can access only basic student messages.

=== HOW TO DO COMMON TASKS ===

For Students:
- Find a mentor: Go to Networking → search by skill/role → Click alumni card → Send connection request or message.
- Enroll in a course: Go to Academics → Browse courses → Click course → Pay and enroll.
- Book a session: Go to Academics → Sessions tab → Pick a session → Book and pay.
- Edit profile: Click your avatar → Profile → Edit Profile button.
- View messages: Click Messages in the sidebar.

For Alumni:
- Upload a course: Go to Sessions (Premium required) → Create New → Fill details → Publish.
- Post to feed: Click "Create Post" in the Feed page.
- Check earnings: Go to Earnings in the sidebar.
- Manage posts: Go to My Posts in the sidebar.

=== RESPONSE STYLE ===
- Be friendly, clear, and concise.
- Use bullet points for lists of features or steps.
- Bold key terms using **term** format.
- Always end with a helpful next step or question.
- If the user's role is known, tailor your answer to them (student vs alumni).
- If asked about specific data (courses, alumni, users), say you're checking the database and use the DB results provided.
`;

// ─── Intent Detection ──────────────────────────────────────────────────────────
function detectIntent(message) {
  const m = message.toLowerCase();
  if (/list.*alumni|show.*alumni|find.*alumni|suggest.*alumni|alumni.*skill|alumni.*company|alumni.*from|alumni.*at|alumni.*who|.*alumni.*from\s+\w+/i.test(m)) return "alumni_search";
  if (/list.*course|show.*course|find.*course|available.*course|what.*course/i.test(m)) return "course_search";
  if (/list.*session|show.*session|find.*session|book.*session/i.test(m)) return "session_search";
  if (/how many (user|student|alumni)|total (user|student|alumni)|user count|platform stat/i.test(m)) return "stats";
  if (/skill|job|career|role|engineer|analyst|developer|manager/i.test(m)) return "career";
  return "platform";
}

// ─── DB Queries ───────────────────────────────────────────────────────────────
async function queryDB(intent, message) {
  if (!db) return null;

  try {
    if (intent === "alumni_search") {
      // Extract possible skill/company keyword
      const skillMatch = message.match(/(?:skilled in|knows?|expert in|with skill[s]?)\s+([a-zA-Z#+.]+)/i);
      // Fix: match any company name after "from" or "at" regardless of case or suffix
      const compMatch  = message.match(/(?:from|at)\s+([a-zA-Z][a-zA-Z0-9\s&.,'-]{1,40}?)(?:\s*$|\s+(?:and|or|who|with)\b)/i);
      const query = {};
      if (skillMatch) query.domain  = { $regex: skillMatch[1].trim(), $options: "i" };
      if (compMatch)  query.company = { $regex: compMatch[1].trim(),  $options: "i" };

      const alumni = await db.collection("alumnis")
        .find(query, { projection: { _id: 0, name: 1, company: 1, job_profile: 1, domain: 1, city: 1, college: 1, branch: 1 } })
        .limit(5).toArray();
      // Always return a result object so the LLM gets explicit DB feedback (empty or not)
      return { type: "alumni", data: alumni };
    }

    if (intent === "course_search") {
      const skillMatch = message.match(/(?:for|about|on|in)\s+([a-zA-Z#+.\s]+?)(?:\s+course|\s*$)/i);
      const query = skillMatch ? { $or: [
        { title:  { $regex: skillMatch[1].trim(), $options: "i" } },
        { skills: { $regex: skillMatch[1].trim(), $options: "i" } },
      ] } : {};

      const courses = await db.collection("courses")
        .find(query, { projection: { _id: 0, title: 1, price: 1, instructor: 1, skills: 1 } })
        .limit(5).toArray();
      return courses.length ? { type: "courses", data: courses } : null;
    }

    if (intent === "session_search") {
      const sessions = await db.collection("sessions")
        .find({}, { projection: { _id: 0, title: 1, date: 1, price: 1, host: 1, type: 1 } })
        .sort({ date: 1 }).limit(5).toArray();
      return sessions.length ? { type: "sessions", data: sessions } : null;
    }

    if (intent === "stats") {
      const [students, alumni, courses, sessions] = await Promise.all([
        db.collection("users").countDocuments({ role: "student" }),
        db.collection("alumni").countDocuments({}),
        db.collection("courses").countDocuments({}),
        db.collection("sessions").countDocuments({}),
      ]);
      return { type: "stats", data: { students, alumni, courses, sessions } };
    }

  } catch (e) {
    console.error("DB query error:", e.message);
  }
  return null;
}

// ─── LLM Call ─────────────────────────────────────────────────────────────────
async function callLLM(systemPrompt, userMessage) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const resp = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMessage  },
    ],
    temperature: 0.5,
    max_tokens: 1024,
  });
  return resp.choices[0].message.content;
}

// ─── Chat Endpoint ─────────────────────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  const {
    message,
    userRole = "student",
    userSkills = [],
    userName = "",
    isGuest = false,
    pagePath = "",
  } = req.body;
  if (!message) return res.status(400).json({ error: "message is required" });

  const isLandingPublicMode = Boolean(isGuest) && (pagePath === "/" || pagePath === "/landing");
  const intent = detectIntent(message);

  // Build context from DB or Python AI
  let dataContext = "";

  if (!isLandingPublicMode && intent === "career") {
    try {
      const aiRes = await axios.post(`${PYTHON_AI_URL}/analyze`, {
        message, user_skills: userSkills,
      });
      dataContext = `\n\n=== CAREER DATA FROM DATABASE ===\n${JSON.stringify(aiRes.data, null, 2)}`;
    } catch (e) {
      console.error("Python AI error:", e.message);
    }
  } else if (!isLandingPublicMode) {
    const dbResult = await queryDB(intent, message);
    if (dbResult) {
      if (dbResult.type === "alumni" && dbResult.data.length === 0) {
        dataContext = `\n\n=== LIVE DATABASE RESULTS ===\nNo alumni found matching that query in the database. Do NOT invent or suggest alumni names. Tell the user no matching alumni were found and suggest they browse the Networking tab directly.`;
      } else {
        dataContext = `\n\n=== LIVE DATABASE RESULTS ===\n${JSON.stringify(dbResult.data, null, 2)}\nUse ONLY this data. Do not invent or add names or details not present above.`;
      }
    }
  }

  // Personalize system prompt for user's role
  const roleContext = isLandingPublicMode
    ? "\nThe user is a public landing-page visitor (not logged in)."
    : `\nThe user is a ${userRole}${userName ? ` named ${userName}` : ""}. Tailor your answer accordingly.`;

  const publicModeRules = isLandingPublicMode
    ? `

=== LANDING PAGE PUBLIC MODE (STRICT) ===
- Give only high-level platform guidance and general feature explanations.
- Do NOT claim to fetch or show live database/course/session/user/alumni stats.
- If asked for specific or personalized recommendations, explain that login/signup is required.
- End every response with a short prompt to log in or sign up for detailed, personalized help.
`
    : "";

  const systemPrompt = PLATFORM_KNOWLEDGE + roleContext + publicModeRules + dataContext;

  try {
    const reply = await callLLM(systemPrompt, message);
    res.json({ reply });
  } catch (e) {
    console.error("LLM error:", e.message);
    res.status(500).json({ error: "LLM call failed", reply: "I'm having trouble responding right now. Please try again." });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok", db: !!db }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Connect AI Node server on port ${PORT}`));