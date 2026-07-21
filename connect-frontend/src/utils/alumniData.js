export const ALUMNI_PROFILES = {
  "Rahul Sharma": {
    name: "Rahul Sharma",
    role: "SWE @ Google · IIT Delhi '21",
    college: "IIT Delhi",
    verified: true,
    isPremium: true,
    has24h: true,
  },
  "Priya Nair": {
    name: "Priya Nair",
    role: "Data Scientist @ Microsoft",
    college: "IIT Bombay",
    verified: true,
    isPremium: false,
    has24h: false,
  },
  "Aman Gupta": {
    name: "Aman Gupta",
    role: "Founding Engineer @ Zepto",
    college: "NIT Trichy",
    verified: true,
    isPremium: true,
    has24h: true,
  },
  "Ananya Verma": {
    name: "Ananya Verma",
    role: "Product Manager @ Amazon",
    college: "DTU",
    verified: true,
    isPremium: false,
    has24h: false,
  },
  "Karan Mehta": {
    name: "Karan Mehta",
    role: "FAANG SWE · IIT Bombay",
    college: "IIT Bombay",
    verified: true,
    isPremium: true,
    has24h: false,
  },
  "Sneha Joshi": {
    name: "Sneha Joshi",
    role: "UX Designer @ Flipkart",
    college: "BITS Pilani",
    verified: true,
    isPremium: false,
    has24h: false,
  },
  "Vikram Rao": {
    name: "Vikram Rao",
    role: "ML Engineer @ Razorpay",
    college: "IIT Madras",
    verified: true,
    isPremium: true,
    has24h: true,
  },
};

export const ALUMNI_POSTS = [
  {
    id: 1,
    author: "Rahul Sharma",
    role: "SWE @ Google · IIT Delhi '21",
    content: "Just cracked the Google SWE interview after 3 months of prep! Here's my entire DSA roadmap 🚀\n\n✅ Month 1: Arrays, Strings, Hashing\n✅ Month 2: Trees, Graphs, DP\n✅ Month 3: System Design + Mock Interviews\n\nDrop a comment if you want my full resource list!",
    time: "2h ago",
    likes: 134,
    verified: true,
    has24h: true,
    isPremium: true,
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80", name: "prep.jpg" },
      { type: "image", url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80", name: "coding.jpg" },
    ],
  },
  {
    id: 2,
    author: "Priya Nair",
    role: "Data Scientist @ Microsoft",
    content: "Proud to share I just completed the Google Data Analytics Professional Certificate! 🎓 6 months of evening study while working full-time. If you're a student thinking about data science, this is a great starting point.",
    time: "4h ago",
    likes: 87,
    verified: true,
    postType: "certificate",
    certificate: { title: "Google Data Analytics Professional Certificate", issuer: "Google / Coursera", date: "March 2025" },
  },
  {
    id: 3,
    author: "Aman Gupta",
    role: "Founding Engineer @ Zepto",
    content: "🎯 FREE Live Session this Sunday!\n'Breaking into Data Science: No-BS Guide'\n\nI'll cover what recruiters ACTUALLY look at — not the YouTube hype.\n\n📅 Sunday, 10 AM IST\n🔗 Register via Academics tab\n\nLimited to 100 seats!",
    time: "Yesterday",
    likes: 267,
    verified: true,
    has24h: true,
    postType: "poster",
    media: [{ type: "image", url: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=600&q=80", name: "session-poster.jpg" }],
  },
  {
    id: 4,
    author: "Ananya Verma",
    role: "Product Manager @ Amazon",
    content: "Hot take: Most students underestimate behavioral interviews.\n\nFor Amazon SDE roles, STAR format is literally 40% of the evaluation. Here's my quick framework 🧵👇\n\nSituation → Task → Action → Result\n\nSaved as a short video — watch it before your next interview!",
    time: "Yesterday",
    likes: 198,
    verified: true,
    media: [{ type: "image", url: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&q=80", name: "interview.jpg" }],
    linkUrl: "https://linkedin.com",
  },
  {
    id: 5,
    author: "Karan Mehta",
    role: "FAANG SWE · IIT Bombay",
    content: "Finally got my AWS Solutions Architect — Professional certification! This one was HARD. 3 months of prep, 2 failed attempts, but third time's the charm 💪\n\nHappy to answer any AWS or cloud career questions.",
    time: "2 days ago",
    likes: 312,
    verified: true,
    postType: "certificate",
    certificate: { title: "AWS Solutions Architect – Professional", issuer: "Amazon Web Services", date: "April 2025" },
    media: [{ type: "image", url: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&q=80", name: "aws.jpg" }],
  },
  {
    id: 6,
    author: "Sneha Joshi",
    role: "UX Designer @ Flipkart",
    content: "Sharing the poster for my upcoming FREE workshop on 'Design Thinking for Engineers'!\n\nSo many engineers want to transition to design but don't know where to start. This workshop is for you 🎨",
    time: "3 days ago",
    likes: 156,
    verified: true,
    postType: "poster",
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&q=80", name: "workshop-poster.jpg" },
      { type: "image", url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80", name: "design.jpg" },
    ],
  },
  {
    id: 7,
    author: "Vikram Rao",
    role: "ML Engineer @ Razorpay",
    content: "Built a mini video tutorial on 'How I fine-tuned LLaMA 2 for domain-specific tasks' — drop me a comment if you want the Colab notebook! 🤖\n\nThis approach got me a 40% accuracy improvement over baseline GPT-4 on our internal dataset.",
    time: "4 days ago",
    likes: 445,
    verified: true,
    has24h: true,
    isPremium: true,
    media: [{ type: "image", url: "https://images.unsplash.com/photo-1677756119517-756a188d2d94?w=600&q=80", name: "ai-thumb.jpg" }],
  },
];

export const DEFAULT_ALUMNI_PROFILE = {
  name: "Alumni",
  role: "Verified Alumni",
  college: "Verified Mentor",
  verified: true,
  isPremium: false,
  has24h: false,
};

export function getAlumniProfileByName(name) {
  return ALUMNI_PROFILES[name] || {
    ...DEFAULT_ALUMNI_PROFILE,
    name: name || DEFAULT_ALUMNI_PROFILE.name,
  };
}

export function getPostsByAlumniName(name) {
  if (!name) return [];
  return ALUMNI_POSTS.filter(post => post.author === name);
}
