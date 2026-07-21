/**
 * verificationService.js — Backend only (Node.js)
 *
 * Drop-in replacement for your existing verificationService.js.
 * Exports: verifyPost(), handleStrike(), isUserRestricted()
 *
 * All providers are FREE. Switch any of them via .env:
 *
 *   MODERATION_PROVIDER=badwords       ← default, offline, no key
 *   MODERATION_PROVIDER=perspective    ← free Google key required
 *   MODERATION_PROVIDER=openai         ← free endpoint, OpenAI key required
 *
 *   AI_DETECTION_PROVIDER=offline      ← default, no API, no key
 *   AI_DETECTION_PROVIDER=gptzero      ← free tier 10k words/month, key required
 *   AI_DETECTION_PROVIDER=sapling      ← free tier 2k req/month, key required
 *
 *   SAFE_BROWSING_API_KEY=your_key     ← optional free Google key;
 *                                         falls back to offline pattern check
 *
 * Install (backend only):
 *   npm install bad-words natural
 */

// ─── Imports ─────────────────────────────────────────────────────────────────

// ── Provider router ────────────────────────────────────────────────────────────

const MODERATION_PROVIDER    = process.env.MODERATION_PROVIDER    || 'badwords';
const AI_DETECTION_PROVIDER  = process.env.AI_DETECTION_PROVIDER  || 'offline';

// ═══════════════════════════════════════════════════════════════════════════════
// MODERATION ADAPTERS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Adapter 1: bad-words (free, fully offline, no API key) ────────────────────
async function badwordsCheck(text) {
  try {
    let Filter;
    try {
      const mod = await import('bad-words');
      Filter = mod.default || mod.Filter;
    } catch {
      return { passed: true, flags: [] }; // package not installed, fail open
    }
    const filter = new Filter();
    const isProfane = filter.isProfane(text);
    return {
      passed: !isProfane,
      flags: isProfane ? ['profanity'] : [],
    };
  } catch {
    return { passed: true, flags: [] }; // fail open
  }
}

// ── Adapter 2: Google Perspective API (free, needs a free Google Cloud key) ───
async function perspectiveCheck(text) {
  const key = process.env.PERSPECTIVE_API_KEY;
  if (!key) {
    console.warn('[moderation] PERSPECTIVE_API_KEY not set, falling back to badwords');
    return badwordsCheck(text);
  }

  try {
    const res = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: { text },
          requestedAttributes: {
            TOXICITY: {},
            SPAM: {},
            SEXUALLY_EXPLICIT: {},
            THREAT: {},
            IDENTITY_ATTACK: {},
          },
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    const data = await res.json();
    const scores = data.attributeScores || {};

    const thresholds = {
      TOXICITY: 0.85,
      SPAM: 0.90,
      SEXUALLY_EXPLICIT: 0.80,
      THREAT: 0.80,
      IDENTITY_ATTACK: 0.80,
    };

    const flags = [];
    for (const [attr, threshold] of Object.entries(thresholds)) {
      const score = scores[attr]?.summaryScore?.value || 0;
      if (score >= threshold) flags.push(attr.toLowerCase());
    }

    return { passed: flags.length === 0, flags };
  } catch (err) {
    console.error('[Perspective] error:', err.message, '— falling back to badwords');
    return badwordsCheck(text);
  }
}

// ── Adapter 3: OpenAI Moderation endpoint (free, needs an OpenAI key) ─────────
async function openaiModerationCheck(text) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.warn('[moderation] OPENAI_API_KEY not set, falling back to badwords');
    return badwordsCheck(text);
  }

  try {
    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ input: text }),
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json();
    const result = data.results?.[0];
    const flags = Object.entries(result?.categories || {})
      .filter(([, flagged]) => flagged)
      .map(([category]) => category);

    return { passed: !result?.flagged, flags };
  } catch (err) {
    console.error('[OpenAI moderation] error:', err.message, '— falling back to badwords');
    return badwordsCheck(text);
  }
}

// ── Moderation router ────────────────────────────────────────────────────────
async function moderateContent(text) {
  if (!text || text.trim().length < 5) return { passed: true, flags: [] };

  if (MODERATION_PROVIDER === 'perspective') return perspectiveCheck(text);
  if (MODERATION_PROVIDER === 'openai')      return openaiModerationCheck(text);
  return await badwordsCheck(text); // default
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI DETECTION ADAPTERS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Adapter 1: Offline statistical analysis (free, no API, no key) ────────────
//
//  AI text tends to have uniformly long sentences (low variance).
//  Human text is burstier — short sentences mixed with long ones.
//  This isn't perfect but catches obvious AI outputs without any API cost.
//
function offlineDetectAI(text) {
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (sentences.length < 3) return { flag: 'human', score: 0 };

  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance =
    lengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / lengths.length;

  // Low variance = uniform sentence length = likely AI
  // Thresholds tuned empirically:
  //   variance < 8  → strongly AI-like
  //   variance < 15 → ambiguous
  //   variance >= 15 → human-like
  const score =
    variance < 8 ? 75 :
    variance < 15 ? 40 : 10;

  const flag =
    score >= 65 ? 'ai_generated' :
    score >= 35 ? 'ai_assisted' : 'human';

  return { flag, score };
}

// ── Adapter 2: GPTZero (free tier — 10,000 words/month, key required) ─────────
async function gptzeroDetectAI(text) {
  const key = process.env.GPTZERO_API_KEY;
  if (!key) {
    console.warn('[AI detection] GPTZERO_API_KEY not set, falling back to offline');
    return offlineDetectAI(text);
  }

  try {
    const res = await fetch('https://api.gptzero.me/v2/predict/text', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ document: text }),
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json();
    const score = Math.round(
      (data.documents?.[0]?.average_generated_prob || 0) * 100
    );

    const flag =
      score >= 80 ? 'ai_generated' :
      score >= 40 ? 'ai_assisted' : 'human';

    return { flag, score };
  } catch (err) {
    console.error('[GPTZero] error:', err.message, '— falling back to offline');
    return offlineDetectAI(text);
  }
}

// ── Adapter 3: Sapling AI (free tier — 2,000 requests/month, key required) ────
async function saplingDetectAI(text) {
  const key = process.env.SAPLING_API_KEY;
  if (!key) {
    console.warn('[AI detection] SAPLING_API_KEY not set, falling back to offline');
    return offlineDetectAI(text);
  }

  try {
    const res = await fetch('https://api.sapling.ai/api/v1/aidetect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, text }),
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json();
    const score = Math.round((data.score || 0) * 100);

    const flag =
      score >= 80 ? 'ai_generated' :
      score >= 40 ? 'ai_assisted' : 'human';

    return { flag, score };
  } catch (err) {
    console.error('[Sapling] error:', err.message, '— falling back to offline');
    return offlineDetectAI(text);
  }
}

// ── AI detection router ──────────────────────────────────────────────────────
async function detectAI(text) {
  if (!text || text.trim().length < 50) return { flag: 'human', score: 0 };

  if (AI_DETECTION_PROVIDER === 'gptzero') return gptzeroDetectAI(text);
  if (AI_DETECTION_PROVIDER === 'sapling') return saplingDetectAI(text);
  return offlineDetectAI(text); // default
}

// ═══════════════════════════════════════════════════════════════════════════════
// LINK SAFETY CHECK
// ═══════════════════════════════════════════════════════════════════════════════

// Known suspicious TLDs and patterns — offline fallback
const SUSPICIOUS_PATTERNS = [
  /bit\.ly\/[a-zA-Z0-9]{6,}/,       // URL shorteners
  /tinyurl\.com\//,
  /t\.co\//,
  /\.(tk|ml|ga|cf|gq)\b/,           // free TLDs commonly abused
  /free.{0,10}(iphone|ipad|gift)/i, // phishing bait
  /verify.{0,10}(account|paypal)/i,
  /login.{0,10}(bank|paypal|amazon)/i,
];

async function checkLinks(text) {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text?.match(urlRegex) || [];
  if (!urls.length) return { safe: true };

  // Try Google Safe Browsing if key is provided (free)
  const sbKey = process.env.SAFE_BROWSING_API_KEY;
  if (sbKey) {
    try {
      const res = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${sbKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: { clientId: 'connect-platform', clientVersion: '1.0.0' },
            threatInfo: {
              threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: urls.map(u => ({ url: u })),
            },
          }),
          signal: AbortSignal.timeout(6000),
        }
      );

      const data = await res.json();
      return { safe: !data.matches?.length };
    } catch (err) {
      console.warn('[Safe Browsing] error:', err.message, '— falling back to pattern check');
    }
  }

  // Offline pattern check — free, no API
  const suspicious = urls.some(url =>
    SUSPICIOUS_PATTERNS.some(pattern => pattern.test(url))
  );
  return { safe: !suspicious };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTERNAL PAYMENT LINK CHECK (offline, free, always runs)
// ═══════════════════════════════════════════════════════════════════════════════

const PAYMENT_DOMAINS = [
  'paypal.com', 'razorpay.com', 'paytm.com', 'upi://',
  'phonepe.com', 'gpay.app', 'stripe.com',
];

function hasExternalPaymentLink(text) {
  const lower = text?.toLowerCase() || '';
  return PAYMENT_DOMAINS.some(domain => lower.includes(domain));
}

// ═══════════════════════════════════════════════════════════════════════════════
// STRIKE SYSTEM (unchanged from your original)
// ═══════════════════════════════════════════════════════════════════════════════

export async function handleStrike(user) {
  user.strikes = (user.strikes || 0) + 1;

  // hours until restriction lifts (null = permanent review)
  const cooldowns = { 2: 24, 3: 168, 4: null };
  const hours = cooldowns[user.strikes];

  if (hours) {
    user.restrictedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  await user.save();
  return user.strikes;
}

export function isUserRestricted(user) {
  if (!user.restrictedUntil) return false;
  return new Date() < new Date(user.restrictedUntil);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN VERIFICATION PIPELINE (same interface as before)
// ═══════════════════════════════════════════════════════════════════════════════

export async function verifyPost(content) {
  const [aiResult, moderationResult, linkResult] = await Promise.all([
    detectAI(content),
    moderateContent(content),
    checkLinks(content),
  ]);

  const hasPaymentLink = hasExternalPaymentLink(content);

  const rejectionReasons = [];

  if (!moderationResult.passed) {
    rejectionReasons.push(
      `Content flagged for: ${moderationResult.flags.join(', ')}`
    );
  }
  if (!linkResult.safe) {
    rejectionReasons.push('Post contains unsafe or suspicious links');
  }
  if (hasPaymentLink) {
    rejectionReasons.push(
      "External payment links are not allowed — use Connect's built-in payment system"
    );
  }

  const approved = rejectionReasons.length === 0;

  return {
    approved,
    rejectionReason: approved ? null : rejectionReasons.join('. '),
    aiFlag: aiResult.flag,    // 'human' | 'ai_assisted' | 'ai_generated'
    aiScore: aiResult.score,  // 0–100
  };
}