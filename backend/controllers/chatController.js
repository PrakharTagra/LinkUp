import Groq from "groq-sdk";
import mongoose from "mongoose";

const PLATFORM_KNOWLEDGE = `
You are LinkUp AI — the official assistant for the LinkUp platform.
LinkUp bridges students and alumni for learning, mentorship, and career growth.

=== PLATFORM OVERVIEW ===
LinkUp has three types of users: Students, Alumni, and Admins.

=== STUDENT FEATURES ===
• Home Feed: See posts from alumni and fellow students. Like, comment, and engage.
• Academics: Browse and enroll in courses, live sessions, and workshops uploaded by alumni.
• Networking: Discover alumni profiles, filter by skill/company/role, send connection requests.
• Messages: Message alumni directly. Students are grouped as Basic or Active Membership based on subscription status.
• My Learning: Track enrolled courses, sessions, and workshop progress.
• Profile: Edit your profile, add skills, upload photo, view your activity stats.
• Alumni Profile View: Click any alumni card to see their detailed profile, skills, experience, and offerings.
• Skill Gap Analyzer: Identify market-demanded skills and get personalized course and alumni recommendations.
• Career Path: Predict best career matches from profile skills with stage-by-stage learning roadmaps.

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

=== RESPONSE STYLE ===
• Be friendly, clear, and concise.
• Use bullet points for lists of features or steps.
• Bold key terms using **term** format.
• Always end with a helpful next step or question.
• If the user's role is known, tailor your answer to them (student vs alumni).
`;

function detectIntent(message) {
  const m = message.toLowerCase();
  if (/list.*alumni|show.*alumni|find.*alumni|suggest.*alumni|alumni.*skill|alumni.*company|alumni.*from|alumni.*at|alumni.*who|.*alumni.*from\s+\w+/i.test(m)) {
    return "alumni_search";
  }
  if (/list.*course|show.*course|find.*course|available.*course|what.*course/i.test(m)) {
    return "course_search";
  }
  if (/list.*session|show.*session|find.*session|book.*session/i.test(m)) {
    return "session_search";
  }
  if (/how many (user|student|alumni)|total (user|student|alumni)|user count|platform stat/i.test(m)) {
    return "stats";
  }
  if (/skill|job|career|role|engineer|analyst|developer|manager/i.test(m)) {
    return "career";
  }
  return "platform";
}

async function queryDB(intent, message) {
  const db = mongoose.connection.db;
  if (!db) return null;

  try {
    if (intent === "alumni_search") {
      const skillMatch = message.match(/(?:skilled in|knows?|expert in|with skill[s]?)\s+([a-zA-Z#+.]+)/i);
      const compMatch = message.match(/(?:from|at)\s+([a-zA-Z][a-zA-Z0-9\s&.,'-]{1,40}?)(?:\s*$|\s+(?:and|or|who|with)\b)/i);
      const query = {};
      if (skillMatch) query.domain = { $regex: skillMatch[1].trim(), $options: "i" };
      if (compMatch) query.company = { $regex: compMatch[1].trim(), $options: "i" };

      const alumni = await db.collection("alumnis")
        .find(query, { projection: { _id: 0, name: 1, company: 1, job_profile: 1, domain: 1, city: 1, college: 1, branch: 1 } })
        .limit(5)
        .toArray();
      return { type: "alumni", data: alumni };
    }

    if (intent === "course_search") {
      const skillMatch = message.match(/(?:for|about|on|in)\s+([a-zA-Z#+.\s]+?)(?:\s+course|\s*$)/i);
      const query = skillMatch ? {
        $or: [
          { title: { $regex: skillMatch[1].trim(), $options: "i" } },
          { skills: { $regex: skillMatch[1].trim(), $options: "i" } },
        ]
      } : {};

      const courses = await db.collection("courses")
        .find(query, { projection: { _id: 0, title: 1, price: 1, instructor: 1, skills: 1 } })
        .limit(5)
        .toArray();
      return courses.length ? { type: "courses", data: courses } : null;
    }

    if (intent === "session_search") {
      const sessions = await db.collection("sessions")
        .find({}, { projection: { _id: 0, title: 1, date: 1, price: 1, host: 1, type: 1 } })
        .sort({ date: 1 })
        .limit(5)
        .toArray();
      return sessions.length ? { type: "sessions", data: sessions } : null;
    }

    if (intent === "stats") {
      const [students, alumni, courses, sessions] = await Promise.all([
        db.collection("students").countDocuments({}),
        db.collection("alumnis").countDocuments({}),
        db.collection("courses").countDocuments({}),
        db.collection("sessions").countDocuments({}),
      ]);
      return { type: "stats", data: { students, alumni, courses, sessions } };
    }
  } catch (e) {
    console.error("Chat DB query error:", e.message);
  }
  return null;
}

async function callLLM(systemPrompt, userMessage) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return "I'm LinkUp AI! To activate real-time AI responses, please provide a GROQ_API_KEY in the environment. You can explore courses in Academics, connect with mentors in Networking, or analyze your skills in Career Path!";
  }

  const groq = new Groq({ apiKey });
  const candidateModels = [
    process.env.GROQ_MODEL,
    "qwen/qwen3.8-27b",
    "llama-3.3-70b-versatile",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
  ].filter(Boolean);

  let lastError = null;
  for (const model of candidateModels) {
    try {
      const resp = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.5,
        max_tokens: 1024,
      });
      const content = resp.choices?.[0]?.message?.content;
      if (content && content.trim()) {
        return content.trim();
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Groq] Model ${model} failed: ${err.message}. Trying next candidate...`);
    }
  }

  throw lastError || new Error("No Groq model candidates succeeded");
}

export const handleChatMessage = async (req, res) => {
  const {
    message,
    userRole = "student",
    userSkills = [],
    userName = "",
    isGuest = false,
    pagePath = "",
  } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  const isLandingPublicMode = Boolean(isGuest) && (pagePath === "/" || pagePath === "/landing");
  const intent = detectIntent(message);

  let dataContext = "";
  if (!isLandingPublicMode) {
    const dbResult = await queryDB(intent, message);
    if (dbResult) {
      if (dbResult.type === "alumni" && dbResult.data.length === 0) {
        dataContext = `\n\n=== LIVE DATABASE RESULTS ===\nNo alumni found matching that query in the database. Do NOT invent names. Suggest browsing Networking tab directly.`;
      } else {
        dataContext = `\n\n=== LIVE DATABASE RESULTS ===\n${JSON.stringify(dbResult.data, null, 2)}\nUse ONLY this data. Do not invent names or details.`;
      }
    }
  }

  const roleContext = isLandingPublicMode
    ? "\nThe user is a public landing-page visitor (not logged in)."
    : `\nThe user is a ${userRole}${userName ? ` named ${userName}` : ""}. Tailor your answer accordingly.`;

  const publicModeRules = isLandingPublicMode
    ? `\n=== LANDING PAGE PUBLIC MODE ===\n- Give high-level platform guidance.\n- End every response with a prompt to log in or sign up.`
    : "";

  const systemPrompt = PLATFORM_KNOWLEDGE + roleContext + publicModeRules + dataContext;

  try {
    const reply = await callLLM(systemPrompt, message);
    return res.json({ reply });
  } catch (e) {
    console.error("LLM error:", e.message);
    return res.status(500).json({
      error: "LLM call failed",
      reply: "I'm having trouble responding right now. Please try again in a moment.",
    });
  }
};
