import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import Student from "../models/Student.js";
import Alumni from "../models/Alumni.js";
import Post from "../models/Post.js";
import Course from "../models/Course.js";
import Session from "../models/Session.js";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://prakhartagra16_db_user:LTIyxZ0oM72XgOpS@linkup.mcx6g77.mongodb.net/linkup?retryWrites=true&w=majority";

async function seed() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected successfully to DB:", mongoose.connection.name);

  const defaultPassword = await bcrypt.hash("LinkUp@2026!", 10);

  // ─────────────────────────────────────────────────────────────
  // 1. REALISTIC ALUMNI PROFILES (CLEAN BULLETS, NO EMOJIS)
  // ─────────────────────────────────────────────────────────────
  const alumniData = [
    {
      name: "Aditya Verma",
      email: "aditya.verma@alumni.linkup.com",
      password: defaultPassword,
      role: "alumni",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      coverPhoto: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
      about:
        `Staff Software Engineer at Google leading distributed storage architecture. Previously SWE II at Uber.

Core focus areas and mentoring topics:
• Low-level system design (LLD) and thread-safe concurrency
• High-throughput storage systems, Raft consensus, and Kafka pipelines
• Technical interview strategy for Tier-1 product companies and resume reviews`,
      title: "Staff Software Engineer @ Google",
      headline: "Ex-Uber · IIT Delhi '20 · Distributed Systems & Scalable Architecture",
      company: "Google",
      college: "IIT Delhi",
      domain: "Software Engineering",
      city: "Bengaluru",
      country: "India",
      joiningYear: 2016,
      passingYear: 2020,
      degree: "B.Tech",
      branch: "Computer Science & Engineering",
      isVerified: true,
      alumniPlan: "premium",
      alumniMembershipActive: true,
      alumniMembershipStartedAt: new Date("2024-01-15"),
      skills: ["Distributed Systems", "Go", "Java", "Kubernetes", "Kafka", "Low-Level Design", "System Architecture", "gRPC"],
      certifications: ["Google Cloud Certified Fellow", "AWS Solutions Architect Professional"],
      stats: { totalSessionsHosted: 48, totalEarnings: 42500 },
      experience: [
        {
          company: "Google",
          title: "Staff Software Engineer",
          location: "Bengaluru, India",
          startDate: new Date("2022-08-01"),
          isCurrent: true,
          description: "Leading core infrastructure storage layer processing 1M+ write IOPS across globally replicated clusters.",
        },
        {
          company: "Uber",
          title: "Senior Software Engineer",
          location: "Hyderabad, India",
          startDate: new Date("2020-07-01"),
          endDate: new Date("2022-07-31"),
          isCurrent: false,
          description: "Scaled driver-dispatch algorithms and reduced P99 latency by 42% on critical trip-match services.",
        },
      ],
      education: [
        {
          institution: "Indian Institute of Technology, Delhi",
          degree: "B.Tech",
          fieldOfStudy: "Computer Science & Engineering",
          startYear: 2016,
          endYear: 2020,
          grade: "9.4 CGPA",
          description: "Department rank 3. Published research paper on distributed Byzantine fault tolerance in IEEE.",
        },
      ],
      projects: [
        {
          title: "RaftKV - Distributed Key-Value Engine",
          link: "https://github.com/aditya-verma/raft-kv",
          description: "Production-ready consensus engine written in Go supporting linearizable reads and zero-downtime snapshots.",
        },
      ],
      availability: [
        { day: "Saturday", startTime: "10:00 AM", endTime: "2:00 PM" },
        { day: "Sunday", startTime: "4:00 PM", endTime: "8:00 PM" },
      ],
      sessionPricing: [
        { duration: 30, price: 349 },
        { duration: 60, price: 599 },
      ],
    },
    {
      name: "Priya Nair",
      email: "priya.nair@alumni.linkup.com",
      password: defaultPassword,
      role: "alumni",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
      coverPhoto: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
      about:
        `Senior AI/ML Research Engineer at Microsoft AI. Ex-Flipkart Data Science.

Core focus areas and mentoring topics:
• LLM fine-tuning methodologies (LoRA, QLoRA) and quantization (AWQ, GPTQ)
• Production RAG architectures with hybrid search and semantic reranking
• Transitioning from academia to applied industry Machine Learning engineering`,
      title: "Senior Machine Learning Engineer @ Microsoft",
      headline: "IIT Bombay '21 · GenAI & LLM Productionization · Ex-Flipkart Data Science",
      company: "Microsoft",
      college: "IIT Bombay",
      domain: "Data & AI",
      city: "Hyderabad",
      country: "India",
      joiningYear: 2017,
      passingYear: 2021,
      degree: "B.Tech",
      branch: "Electrical Engineering (Minor in CS)",
      isVerified: true,
      alumniPlan: "premium",
      alumniMembershipActive: true,
      alumniMembershipStartedAt: new Date("2024-02-01"),
      skills: ["PyTorch", "Transformers", "LLMs", "RAG", "TensorFlow", "Python", "MLOps", "vLLM", "DeepSeek"],
      certifications: ["NVIDIA Deep Learning Institute Certified", "Microsoft Certified: Azure AI Engineer"],
      stats: { totalSessionsHosted: 62, totalEarnings: 58000 },
      experience: [
        {
          company: "Microsoft",
          title: "Senior Machine Learning Engineer",
          location: "Hyderabad, India",
          startDate: new Date("2023-01-01"),
          isCurrent: true,
          description: "Building production enterprise Copilot agents with sub-200ms TTFT using speculative decoding and 4-bit AWQ.",
        },
        {
          company: "Flipkart",
          title: "Machine Learning Engineer",
          location: "Bengaluru, India",
          startDate: new Date("2021-06-01"),
          endDate: new Date("2022-12-31"),
          isCurrent: false,
          description: "Developed real-time visual similarity search engine indexing 50M+ e-commerce product catalogs.",
        },
      ],
      education: [
        {
          institution: "Indian Institute of Technology, Bombay",
          degree: "B.Tech",
          fieldOfStudy: "Electrical Engineering & Data Science",
          startYear: 2017,
          endYear: 2021,
          grade: "9.2 CGPA",
          description: "Head of Artificial Intelligence Student Society, IIT Bombay.",
        },
      ],
      projects: [
        {
          title: "Fast-RAG: Sub-second Hybrid Dense/Sparse Search",
          link: "https://github.com/priya-nair/fast-rag",
          description: "Lightweight retrieval engine with semantic caching, cross-encoder reranking, and dynamic context compression.",
        },
      ],
      availability: [
        { day: "Friday", startTime: "7:00 PM", endTime: "9:00 PM" },
        { day: "Sunday", startTime: "11:00 AM", endTime: "3:00 PM" },
      ],
      sessionPricing: [
        { duration: 30, price: 399 },
        { duration: 60, price: 699 },
      ],
    },
    {
      name: "Rohan Kulkarni",
      email: "rohan.kulkarni@alumni.linkup.com",
      password: defaultPassword,
      role: "alumni",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
      coverPhoto: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
      about:
        `Founding Tech Lead at Zepto. Built our real-time order tracking and store-allocation engine.

Core focus areas and mentoring topics:
• Full-stack systems architecture with Go, Node.js, and Next.js
• Real-time WebSocket clustering and Redis pub/sub communication
• Practical guidance on transitioning from university projects to production codebases`,
      title: "Founding Tech Lead @ Zepto",
      headline: "NIT Trichy '21 · High-Scale Systems · Next.js, Go & Microservices",
      company: "Zepto",
      college: "NIT Trichy",
      domain: "Software Engineering",
      city: "Bengaluru",
      country: "India",
      joiningYear: 2017,
      passingYear: 2021,
      degree: "B.Tech",
      branch: "Computer Science & Engineering",
      isVerified: true,
      alumniPlan: "premium",
      alumniMembershipActive: true,
      alumniMembershipStartedAt: new Date("2024-03-10"),
      skills: ["Node.js", "Go", "Next.js", "React", "Redis", "PostgreSQL", "Docker", "WebSockets", "Kafka"],
      certifications: ["AWS Certified Developer Associate"],
      stats: { totalSessionsHosted: 39, totalEarnings: 31000 },
      experience: [
        {
          company: "Zepto",
          title: "Founding Tech Lead",
          location: "Bengaluru, India",
          startDate: new Date("2021-08-01"),
          isCurrent: true,
          description: "Architected dark-store inventory allocation dispatching 500k+ daily deliveries under 10 minutes.",
        },
      ],
      education: [
        {
          institution: "National Institute of Technology, Tiruchirappalli",
          degree: "B.Tech",
          fieldOfStudy: "Computer Science & Engineering",
          startYear: 2017,
          endYear: 2021,
          grade: "8.9 CGPA",
        },
      ],
      projects: [],
      availability: [
        { day: "Tuesday", startTime: "8:00 PM", endTime: "10:00 PM" },
        { day: "Saturday", startTime: "2:00 PM", endTime: "6:00 PM" },
      ],
      sessionPricing: [
        { duration: 30, price: 299 },
        { duration: 60, price: 499 },
      ],
    },
    {
      name: "Ananya Sen",
      email: "ananya.sen@alumni.linkup.com",
      password: defaultPassword,
      role: "alumni",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80",
      coverPhoto: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
      about:
        `Senior Product Manager at Amazon Prime Video. Ex-Product Lead at Swiggy.

Core focus areas and mentoring topics:
• Product Sense and execution frameworks (CIRCLES, RICE prioritization)
• A/B testing methodologies and customer discovery for consumer internet products
• Behavioral interview preparation using Amazon Leadership Principles`,
      title: "Senior Product Manager @ Amazon",
      headline: "DTU '19 · Product Strategy & Tech Leadership · Ex-Swiggy PM",
      company: "Amazon",
      college: "Delhi Technological University (DTU)",
      domain: "Product Management",
      city: "Gurugram",
      country: "India",
      joiningYear: 2015,
      passingYear: 2019,
      degree: "B.Tech",
      branch: "Information Technology",
      isVerified: true,
      alumniPlan: "premium",
      alumniMembershipActive: true,
      alumniMembershipStartedAt: new Date("2024-01-20"),
      skills: ["Product Strategy", "User Research", "A/B Testing", "Agile", "SQL", "Marketplace Economics", "PRFAQ"],
      certifications: ["Reforge Product Strategy Fellow"],
      stats: { totalSessionsHosted: 54, totalEarnings: 49000 },
      experience: [
        {
          company: "Amazon",
          title: "Senior Product Manager",
          location: "Gurugram, India",
          startDate: new Date("2022-04-01"),
          isCurrent: true,
          description: "Leading Prime Video personalization & retention growth for India and SEA markets.",
        },
      ],
      education: [
        {
          institution: "Delhi Technological University (DTU)",
          degree: "B.Tech",
          fieldOfStudy: "Information Technology",
          startYear: 2015,
          endYear: 2019,
          grade: "8.7 CGPA",
        },
      ],
      projects: [],
      availability: [
        { day: "Sunday", startTime: "10:00 AM", endTime: "2:00 PM" },
        { day: "Wednesday", startTime: "7:00 PM", endTime: "9:00 PM" },
      ],
      sessionPricing: [
        { duration: 30, price: 349 },
        { duration: 60, price: 599 },
      ],
    },
    {
      name: "Karan Mehta",
      email: "karan.mehta@alumni.linkup.com",
      password: defaultPassword,
      role: "alumni",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
      coverPhoto: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
      about:
        `Principal Cloud Solutions Architect at AWS. 5x AWS Certified, CKA holder.

Core focus areas and mentoring topics:
• Multi-region Kubernetes architecture and disaster recovery automation
• Infrastructure as Code with Terraform and automated CI/CD pipelines
• Site Reliability Engineering practices and AWS certification roadmaps`,
      title: "Principal Cloud Architect @ AWS",
      headline: "BITS Pilani '19 · Cloud Infrastructure & Multi-Region Kubernetes · DevOps",
      company: "Amazon Web Services (AWS)",
      college: "BITS Pilani",
      domain: "DevOps & Cloud",
      city: "Mumbai",
      country: "India",
      joiningYear: 2015,
      passingYear: 2019,
      degree: "B.E. (Hons.)",
      branch: "Computer Science",
      isVerified: true,
      alumniPlan: "premium",
      alumniMembershipActive: true,
      alumniMembershipStartedAt: new Date("2024-02-15"),
      skills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Linux", "Docker", "Prometheus", "Site Reliability Engineering"],
      certifications: ["AWS Certified Solutions Architect Professional", "Certified Kubernetes Administrator (CKA)"],
      stats: { totalSessionsHosted: 35, totalEarnings: 29000 },
      experience: [
        {
          company: "Amazon Web Services (AWS)",
          title: "Principal Cloud Solutions Architect",
          location: "Mumbai, India",
          startDate: new Date("2021-10-01"),
          isCurrent: true,
          description: "Architecting cloud migrations and disaster recovery models for tier-1 Indian financial institutions.",
        },
      ],
      education: [
        {
          institution: "BITS Pilani, Pilani Campus",
          degree: "B.E. (Hons.)",
          fieldOfStudy: "Computer Science",
          startYear: 2015,
          endYear: 2019,
          grade: "9.1 CGPA",
        },
      ],
      projects: [],
      availability: [
        { day: "Saturday", startTime: "11:00 AM", endTime: "3:00 PM" },
      ],
      sessionPricing: [
        { duration: 30, price: 349 },
        { duration: 60, price: 549 },
      ],
    },
    {
      name: "Sneha Joshi",
      email: "sneha.joshi@alumni.linkup.com",
      password: defaultPassword,
      role: "alumni",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
      coverPhoto: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
      about:
        `Staff Product Designer at Flipkart. Lead designer for checkout and design systems.

Core focus areas and mentoring topics:
• Building comprehensive design systems in Figma for large engineering teams
• UX portfolio teardowns and articulating business impact of design decisions
• Transitioning from engineering or general disciplines into product design`,
      title: "Staff Product Designer @ Flipkart",
      headline: "IIT Guwahati '21 · Design Systems & Mobile UX · 200M+ Users",
      company: "Flipkart",
      college: "IIT Guwahati",
      domain: "Design",
      city: "Bengaluru",
      country: "India",
      joiningYear: 2017,
      passingYear: 2021,
      degree: "B.Des",
      branch: "Design",
      isVerified: true,
      alumniPlan: "premium",
      alumniMembershipActive: true,
      alumniMembershipStartedAt: new Date("2024-03-01"),
      skills: ["Figma", "Design Systems", "User Research", "Interaction Design", "Prototyping", "Design Thinking", "Accessibility"],
      certifications: ["Nielsen Norman Group UX Master Certified"],
      stats: { totalSessionsHosted: 28, totalEarnings: 22000 },
      experience: [
        {
          company: "Flipkart",
          title: "Staff Product Designer",
          location: "Bengaluru, India",
          startDate: new Date("2021-07-01"),
          isCurrent: true,
          description: "Leading core checkout and cart experience design across mobile web and native apps.",
        },
      ],
      education: [
        {
          institution: "Indian Institute of Technology, Guwahati",
          degree: "B.Des",
          fieldOfStudy: "Industrial & Interaction Design",
          startYear: 2017,
          endYear: 2021,
          grade: "9.3 CGPA",
        },
      ],
      projects: [],
      availability: [
        { day: "Sunday", startTime: "3:00 PM", endTime: "7:00 PM" },
      ],
      sessionPricing: [
        { duration: 30, price: 299 },
        { duration: 60, price: 499 },
      ],
    },
    {
      name: "Vikramaditya Rao",
      email: "vikram.rao@alumni.linkup.com",
      password: defaultPassword,
      role: "alumni",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
      coverPhoto: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80",
      about:
        `Quantitative Strategy Vice President at Goldman Sachs.

Core focus areas and mentoring topics:
• Algorithmic trading and market-making models for equity derivatives
• Low-latency C++ programming, memory optimization, and cache mechanics
• Mathematical finance interview preparation and stochastic calculus fundamentals`,
      title: "Vice President, Quantitative Trading @ Goldman Sachs",
      headline: "IIT Madras '20 · High-Frequency Trading & Mathematical Modeling",
      company: "Goldman Sachs",
      college: "IIT Madras",
      domain: "Finance",
      city: "Bengaluru",
      country: "India",
      joiningYear: 2016,
      passingYear: 2020,
      degree: "B.Tech",
      branch: "Mechanical Engineering (Minor in Mathematics)",
      isVerified: true,
      alumniPlan: "premium",
      alumniMembershipActive: true,
      alumniMembershipStartedAt: new Date("2024-01-10"),
      skills: ["C++", "Python", "Quantitative Research", "Algorithmic Trading", "Statistics", "Stochastic Calculus", "Time Series"],
      certifications: ["CFA Charterholder (Level 3 Passed)"],
      stats: { totalSessionsHosted: 44, totalEarnings: 48000 },
      experience: [
        {
          company: "Goldman Sachs",
          title: "Vice President, Quantitative Strategy",
          location: "Bengaluru, India",
          startDate: new Date("2020-08-01"),
          isCurrent: true,
          description: "Developing market-making algorithmic strategies for multi-asset equity derivatives.",
        },
      ],
      education: [
        {
          institution: "Indian Institute of Technology, Madras",
          degree: "B.Tech",
          fieldOfStudy: "Engineering & Applied Mathematics",
          startYear: 2016,
          endYear: 2020,
          grade: "9.5 CGPA",
        },
      ],
      projects: [],
      availability: [
        { day: "Saturday", startTime: "5:00 PM", endTime: "8:00 PM" },
      ],
      sessionPricing: [
        { duration: 30, price: 449 },
        { duration: 60, price: 799 },
      ],
    },
    {
      name: "Meera Krishnan",
      email: "meera.krishnan@alumni.linkup.com",
      password: defaultPassword,
      role: "alumni",
      avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&auto=format&fit=crop&q=80",
      coverPhoto: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
      about:
        `Staff Security Architect at Palo Alto Networks.

Core focus areas and mentoring topics:
• Application Security (AppSec) auditing and OWASP Top 10 vulnerabilities
• Cloud security architectures and Zero Trust implementation models
• Guidance on security certifications (OSCP, CISSP) and competitive CTF preparation`,
      title: "Staff Security Architect @ Palo Alto Networks",
      headline: "IIIT Hyderabad '20 · Zero Trust & Cloud Defense · Bug Bounty Hunter",
      company: "Palo Alto Networks",
      college: "IIIT Hyderabad",
      domain: "Cybersecurity",
      city: "Bengaluru",
      country: "India",
      joiningYear: 2016,
      passingYear: 2020,
      degree: "B.Tech",
      branch: "Computer Science",
      isVerified: true,
      alumniPlan: "premium",
      alumniMembershipActive: true,
      alumniMembershipStartedAt: new Date("2024-02-20"),
      skills: ["Cybersecurity", "Zero Trust", "Cloud Security", "Penetration Testing", "Python", "Network Security", "Cryptography"],
      certifications: ["CISSP", "Offensive Security Certified Professional (OSCP)"],
      stats: { totalSessionsHosted: 31, totalEarnings: 27500 },
      experience: [
        {
          company: "Palo Alto Networks",
          title: "Staff Security Architect",
          location: "Bengaluru, India",
          startDate: new Date("2020-07-01"),
          isCurrent: true,
          description: "Architecting cloud threat intelligence pipelines for Prisma Cloud protecting 10,000+ enterprise environments.",
        },
      ],
      education: [
        {
          institution: "International Institute of Information Technology, Hyderabad",
          degree: "B.Tech",
          fieldOfStudy: "Computer Science",
          startYear: 2016,
          endYear: 2020,
          grade: "9.0 CGPA",
        },
      ],
      projects: [],
      availability: [
        { day: "Sunday", startTime: "2:00 PM", endTime: "6:00 PM" },
      ],
      sessionPricing: [
        { duration: 30, price: 349 },
        { duration: 60, price: 599 },
      ],
    },
  ];

  // ─────────────────────────────────────────────────────────────
  // 2. REALISTIC STUDENT PROFILES (CLEAN BULLETS, NO EMOJIS)
  // ─────────────────────────────────────────────────────────────
  const studentData = [
    {
      name: "Arjun Patel",
      email: "arjun.patel@student.linkup.com",
      password: defaultPassword,
      role: "student",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
      coverPhoto: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
      about:
        `3rd Year B.Tech CSE student at Delhi Technological University.

Current technical background and focus:
• Competitive programming: 450+ solved algorithmic problems on LeetCode (Knight badge)
• Building scalable backend services using Go, Docker, and PostgreSQL
• Actively seeking Summer 2026 Software Engineering internships`,
      title: "Aspiring Backend & Cloud Engineer",
      headline: "3rd Year CSE @ DTU · Go, Docker & Microservices Enthusiast · LeetCode 450+",
      college: "Delhi Technological University (DTU)",
      branch: "Computer Science & Engineering",
      year: 3,
      degree: "B.Tech",
      isVerified: true,
      isCollegePartner: true,
      tokens: 250,
      skills: ["Go", "Node.js", "Docker", "PostgreSQL", "Data Structures", "Redis", "C++", "System Design"],
      certifications: ["AWS Certified Cloud Practitioner", "HackerRank Problem Solving (Gold)"],
      education: [
        {
          institution: "Delhi Technological University (DTU)",
          degree: "B.Tech",
          fieldOfStudy: "Computer Science & Engineering",
          startYear: 2023,
          endYear: 2027,
          grade: "8.8 CGPA",
          description: "Lead Backend Developer at DTU Student Developer Club.",
        },
      ],
    },
    {
      name: "Tanvi Sharma",
      email: "tanvi.sharma@student.linkup.com",
      password: defaultPassword,
      role: "student",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80",
      coverPhoto: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
      about:
        `Final year undergraduate in Artificial Intelligence & Data Science at IIT Roorkee.

Current technical background and focus:
• Research internship at IIIT Delhi on model compression for edge deployment
• Hands-on experience fine-tuning open-source LLMs using PyTorch and HuggingFace
• Looking for Machine Learning Engineer and Data Science graduate roles`,
      title: "ML Research Intern & Data Science Undergraduate",
      headline: "4th Year AI & Data Science @ IIT Roorkee · PyTorch, LLMs & MLOps",
      college: "IIT Roorkee",
      branch: "Artificial Intelligence & Data Science",
      year: 4,
      degree: "B.Tech",
      isVerified: true,
      isCollegePartner: true,
      tokens: 400,
      skills: ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "SQL", "Pandas", "NLP", "Computer Vision"],
      certifications: ["DeepLearning.AI Deep Learning Specialization", "TensorFlow Developer Certificate"],
      education: [
        {
          institution: "Indian Institute of Technology, Roorkee",
          degree: "B.Tech",
          fieldOfStudy: "Artificial Intelligence & Data Science",
          startYear: 2022,
          endYear: 2026,
          grade: "9.1 CGPA",
          description: "Core Member, Data Science Group, IIT Roorkee.",
        },
      ],
    },
    {
      name: "Siddharth Roy",
      email: "siddharth.roy@student.linkup.com",
      password: defaultPassword,
      role: "student",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
      coverPhoto: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80",
      about:
        `2nd Year Information Technology student at NIT Surathkal.

Current technical background and focus:
• Full-stack developer with 4 shipped web applications in production
• Daily stack: React, TypeScript, Node.js, Tailwind CSS, and MongoDB
• Active open-source contributor to developer tooling repositories`,
      title: "Full Stack Web Developer & Open Source Contributor",
      headline: "2nd Year IT @ NIT Surathkal · React, TypeScript & Node.js Developer",
      college: "NIT Surathkal",
      branch: "Information Technology",
      year: 2,
      degree: "B.Tech",
      isVerified: true,
      isCollegePartner: true,
      tokens: 150,
      skills: ["React", "TypeScript", "Node.js", "Express", "Tailwind CSS", "MongoDB", "Git", "Next.js"],
      certifications: ["Meta Front-End Developer Professional Certificate"],
      education: [
        {
          institution: "National Institute of Technology Karnataka, Surathkal",
          degree: "B.Tech",
          fieldOfStudy: "Information Technology",
          startYear: 2024,
          endYear: 2028,
          grade: "8.6 CGPA",
        },
      ],
    },
    {
      name: "Kavya Nair",
      email: "kavya.nair@student.linkup.com",
      password: defaultPassword,
      role: "student",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      coverPhoto: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80",
      about:
        `Final year undergraduate at BITS Pilani. Incoming SDE intern.

Current technical background and focus:
• Backend systems development in Java, Spring Boot, and PostgreSQL
• System design and object-oriented design patterns enthusiast
• Campus placement coordinator helping junior batches with mock technical rounds`,
      title: "Incoming Software Engineering Intern",
      headline: "4th Year CSE @ BITS Pilani · System Design Enthusiast · Placement Coordinator",
      college: "BITS Pilani",
      branch: "Computer Science",
      year: 4,
      degree: "B.E.",
      isVerified: true,
      isCollegePartner: false,
      tokens: 300,
      skills: ["Java", "Spring Boot", "MySQL", "System Design", "AWS", "Microservices", "DSA", "JUnit"],
      certifications: ["Oracle Certified Associate, Java SE Programmer"],
      education: [
        {
          institution: "BITS Pilani",
          degree: "B.E.",
          fieldOfStudy: "Computer Science",
          startYear: 2022,
          endYear: 2026,
          grade: "8.9 CGPA",
        },
      ],
    },
  ];

  // ─────────────────────────────────────────────────────────────
  // Insert or Update Alumni & Students
  // ─────────────────────────────────────────────────────────────
  console.log("Upserting realistic Alumni profiles...");
  const createdAlumni = [];
  for (const item of alumniData) {
    const existing = await Alumni.findOne({ email: item.email });
    if (existing) {
      await Alumni.updateOne({ _id: existing._id }, { $set: item });
      createdAlumni.push(await Alumni.findById(existing._id));
    } else {
      const doc = await Alumni.create(item);
      createdAlumni.push(doc);
    }
  }
  console.log(`Saved ${createdAlumni.length} Alumni profiles.`);

  console.log("Upserting realistic Student profiles...");
  const createdStudents = [];
  for (const item of studentData) {
    const existing = await Student.findOne({ email: item.email });
    if (existing) {
      await Student.updateOne({ _id: existing._id }, { $set: item });
      createdStudents.push(await Student.findById(existing._id));
    } else {
      const doc = await Student.create(item);
      createdStudents.push(doc);
    }
  }
  console.log(`Saved ${createdStudents.length} Student profiles.`);

  // Attach reviews
  console.log("Adding genuine student reviews to alumni...");
  const reviewsPool = [
    {
      rating: 5,
      comment: "Aditya's session on distributed caching was very helpful. He explained concurrency bottlenecks and lock contention clearly.",
    },
    {
      rating: 5,
      comment: "Priya helped me tailor my machine learning resume specifically for ATS filters. Received callbacks shortly after.",
    },
    {
      rating: 5,
      comment: "Rohan gave practical, no-nonsense feedback on my Go backend code. Showed real-world patterns for handling webhook volume.",
    },
    {
      rating: 5,
      comment: "Ananya broke down the STAR method for Amazon Leadership Principles in a way that felt natural and well-structured.",
    },
  ];

  for (let i = 0; i < createdAlumni.length; i++) {
    const a = createdAlumni[i];
    const s1 = createdStudents[i % createdStudents.length];
    const s2 = createdStudents[(i + 1) % createdStudents.length];
    const r1 = reviewsPool[i % reviewsPool.length];
    const r2 = reviewsPool[(i + 1) % reviewsPool.length];

    a.reviews = [
      {
        student: s1._id,
        reviewerName: s1.name,
        reviewerAvatar: s1.avatar,
        rating: r1.rating,
        comment: r1.comment,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i + 2)),
      },
      {
        student: s2._id,
        reviewerName: s2.name,
        reviewerAvatar: s2.avatar,
        rating: r2.rating,
        comment: r2.comment,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i + 12)),
      },
    ];
    await a.save();
  }

  // ─────────────────────────────────────────────────────────────
  // 3. REALISTIC, HIGH-ENGAGEMENT POSTS (CLEAN BULLETS, NO EMOJIS)
  // ─────────────────────────────────────────────────────────────
  console.log("Generating clean, professional posts by alumni...");

  const aditya = createdAlumni[0];
  const priya = createdAlumni[1];
  const rohan = createdAlumni[2];
  const ananya = createdAlumni[3];
  const karan = createdAlumni[4];
  const sneha = createdAlumni[5];
  const vikram = createdAlumni[6];
  const meera = createdAlumni[7];

  const studentA = createdStudents[0];
  const studentB = createdStudents[1];
  const studentC = createdStudents[2];

  const postsData = [
    {
      author: aditya._id,
      authorModel: "Alumni",
      content:
        `From IIT Delhi to SWE at Google: My 3-Month System Design and DSA Blueprint

When preparing for Tier-1 engineering roles, problem volume matters far less than structural depth. Here is the exact phased approach I recommend:

Month 1 - Pattern Mastery:
• Focus on foundational patterns: Two Pointers, Sliding Window, Monotonic Stacks, and Topological Sort
• Solve 5 representative problems per pattern rather than grinding random problem lists

Month 2 - Concurrency & Low-Level Design (LLD):
• Implement core object-oriented patterns in code: Strategy, Observer, Factory, and State
• Build thread-safe systems from scratch: Rate Limiter, Parking Lot, and In-Memory Cache

Month 3 - Distributed Fundamentals:
• Study partitioning strategies, consistent hashing, write-ahead logs, and quorum reads
• Compare Kafka and traditional message brokers under high consumer backpressure

Feel free to post questions in the comments below.`,
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80",
      media: [
        {
          url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80",
          type: "image",
        },
      ],
      tags: ["SystemDesign", "FAANGPrep", "CareerAdvice", "GoogleSWE", "DSA"],
      verification: { status: "approved", rejectionReason: null, checkedAt: new Date() },
      aiDetection: { flag: "human", score: 0.04 },
      likes: [
        { user: studentA._id, userModel: "Student" },
        { user: studentB._id, userModel: "Student" },
        { user: rohan._id, userModel: "Alumni" },
        { user: ananya._id, userModel: "Alumni" },
      ],
      comments: [
        {
          author: studentA._id,
          authorModel: "Student",
          content: "Very clear roadmap. Would you recommend starting with C++ or Go for LLD practice?",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14),
        },
        {
          author: aditya._id,
          authorModel: "Alumni",
          content: "Either works well, but Java or C++ makes memory models and locks very explicit. Go is excellent once fundamentals are clear.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
        },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      author: priya._id,
      authorModel: "Alumni",
      content:
        `Key Differences Between Academic ML and Production Machine Learning at Scale:

In university courses, machine learning is often treated as model selection on static datasets.

In enterprise production environments:
• 80% is Data Hygiene & Pipelines: Managing schema drift, handling corrupted inputs, and operating real-time feature stores
• 15% is Inference Optimization: Quantization (AWQ/GPTQ), speculative decoding, and minimizing Time to First Token (TTFT)
• Only 5% is pure hyperparameter tuning

To build a standout portfolio:
• Build end-to-end RAG systems with hybrid vector search (Dense + BM25)
• Implement semantic caching layers using Redis to cut LLM inference costs
• Incorporate automated evaluation benchmarks (ROUGE, BERTScore, latency percentiles)

I will be covering these architecture patterns in upcoming LinkUp sessions.`,
      image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1000&auto=format&fit=crop&q=80",
      media: [
        {
          url: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1000&auto=format&fit=crop&q=80",
          type: "image",
        },
      ],
      tags: ["MachineLearning", "GenAI", "LLM", "DataScience", "MicrosoftAI"],
      verification: { status: "approved", rejectionReason: null, checkedAt: new Date() },
      aiDetection: { flag: "human", score: 0.02 },
      likes: [
        { user: studentB._id, userModel: "Student" },
        { user: studentC._id, userModel: "Student" },
        { user: aditya._id, userModel: "Alumni" },
      ],
      comments: [
        {
          author: studentB._id,
          authorModel: "Student",
          content: "Very practical advice. Working on semantic chunking right now and seeing the real-world trade-offs.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
        },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
    },
    {
      author: rohan._id,
      authorModel: "Alumni",
      content:
        `Architecture Decisions for Real-Time High Concurrency: Lessons from Zepto

When orders need reliable sub-second status updates, standard HTTP polling quickly degrades under load. Here are three architectural shifts that improved our throughput:

1. Stateful WebSocket Clusters with Redis Pub/Sub:
• Replaced polling with long-lived WebSocket connections
• Backed by clustered Redis channels with client-side exponential backoff

2. In-Memory Geohash Indexing:
• Drivers stream GPS updates into ephemeral in-memory sets with 30-second TTLs
• Bypasses repetitive geospatial disk writes during peak traffic

3. Low-Allocation Serialization:
• Replaced heavy JSON payload parsing with Protocol Buffers on critical paths
• Reduced CPU utilization by over 40% on dispatch services`,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80",
      media: [
        {
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80",
          type: "image",
        },
      ],
      tags: ["FullStack", "HighScale", "GoLang", "Redis", "ZeptoEngineering"],
      verification: { status: "approved", rejectionReason: null, checkedAt: new Date() },
      aiDetection: { flag: "human", score: 0.03 },
      likes: [
        { user: studentA._id, userModel: "Student" },
        { user: studentC._id, userModel: "Student" },
        { user: karan._id, userModel: "Alumni" },
      ],
      comments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
    {
      author: ananya._id,
      authorModel: "Alumni",
      content:
        `Product Management Framework: Preparing for Case Study and Behavioral Rounds

When transitioning from technical degrees into Product Management, common pitfalls involve reciting buzzwords without clear customer reasoning.

Structured approach for interview cases:
• Comprehend the Macro Context: Clarify the business objective and competitive landscape
• User Segmentation: Identify specific personas and their distinct friction points
• Problem Prioritization: Focus on the single highest-impact unmet need
• Solution Trade-Offs: Evaluate alternatives against effort and adoption metrics using RICE

Structure demonstrates product maturity far more than memorized answers. Feel free to reach out for mock interview practice on LinkUp.`,
      image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1000&auto=format&fit=crop&q=80",
      media: [
        {
          url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1000&auto=format&fit=crop&q=80",
          type: "image",
        },
      ],
      tags: ["ProductManagement", "InterviewPrep", "AmazonPM", "CareerGrowth"],
      verification: { status: "approved", rejectionReason: null, checkedAt: new Date() },
      aiDetection: { flag: "human", score: 0.05 },
      likes: [
        { user: studentB._id, userModel: "Student" },
        { user: sneha._id, userModel: "Alumni" },
      ],
      comments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60),
    },
    {
      author: karan._id,
      authorModel: "Alumni",
      content:
        `Cloud Architecture Best Practices: Achieving Multi-Region High Availability

High Availability in production cloud systems is less about service count and more about automated recovery mechanics.

Core principles to implement:
• Decouple Shallow vs Deep Health Checks: Prevent false-positive container restarts during upstream database slowdowns
• Infrastructure as Code: Maintain version-controlled Terraform modules with remote state locks
• Automated Chaos Testing: Regularly simulate zone dropouts to verify seamless DNS failover

If you are preparing for AWS Solutions Architect or CKA certifications, feel free to leave questions in the discussion.`,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80",
      media: [
        {
          url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80",
          type: "image",
        },
      ],
      tags: ["CloudComputing", "DevOps", "AWS", "Kubernetes", "SRE"],
      verification: { status: "approved", rejectionReason: null, checkedAt: new Date() },
      aiDetection: { flag: "human", score: 0.03 },
      likes: [
        { user: studentA._id, userModel: "Student" },
        { user: aditya._id, userModel: "Alumni" },
      ],
      comments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    },
    {
      author: sneha._id,
      authorModel: "Alumni",
      content:
        `Product Design Portfolio Guidelines: What Evaluators Look for in Tech Hiring

When reviewing design candidates for product design teams, superficial visual artifacts are secondary to problem-solving logic.

Key portfolio recommendations:
• Document the Iteration Journey: Highlight failed initial assumptions and user research findings that directed the final design
• Adhere to WCAG Accessibility Guidelines: Maintain strict contrast ratios and well-defined interactive states
• Quantify User Impact: Connect layout improvements to measurable outcomes like conversion rates and task completion times`,
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1000&auto=format&fit=crop&q=80",
      media: [
        {
          url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1000&auto=format&fit=crop&q=80",
          type: "image",
        },
      ],
      tags: ["UIUX", "ProductDesign", "PortfolioReview", "DesignSystems"],
      verification: { status: "approved", rejectionReason: null, checkedAt: new Date() },
      aiDetection: { flag: "human", score: 0.04 },
      likes: [
        { user: studentB._id, userModel: "Student" },
        { user: ananya._id, userModel: "Alumni" },
      ],
      comments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
    },
    {
      author: vikram._id,
      authorModel: "Alumni",
      content:
        `Quantitative Strategy Interview Preparation: Core Focus Areas

Quantitative trading interviews require deep mathematical reasoning combined with efficient programming practices.

Preparation breakdown:
• Probability and Stochastic Processes: Master conditional expectations, Markov chains, and Poisson arrivals
• Low-Latency C++: Understand cache lines, memory alignment, and zero-cost abstraction overhead
• Mental Calculation Under Time Limits: Practice option payoff estimations and numerical reasoning

Feel free to connect on LinkUp if you are preparing for quantitative trading and research positions.`,
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1000&auto=format&fit=crop&q=80",
      media: [
        {
          url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1000&auto=format&fit=crop&q=80",
          type: "image",
        },
      ],
      tags: ["QuantTrading", "Finance", "HFT", "GoldmanSachs", "CareerPath"],
      verification: { status: "approved", rejectionReason: null, checkedAt: new Date() },
      aiDetection: { flag: "human", score: 0.05 },
      likes: [
        { user: studentA._id, userModel: "Student" },
        { user: studentB._id, userModel: "Student" },
      ],
      comments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
    },
    {
      author: meera._id,
      authorModel: "Alumni",
      content:
        `Application Security Foundations for Software Developers

Securing enterprise systems begins in the codebase, not just at perimeter firewalls.

Essential security habits for developers:
• Understand OWASP Top 10 vulnerabilities in depth, particularly injection and broken access controls
• Run automated dependency scanning to catch vulnerable third-party packages early
• Implement strict least-privilege principles across OAuth token scopes and API gateways

Security should be an integrated engineering discipline throughout the development cycle.`,
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80",
      media: [
        {
          url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80",
          type: "image",
        },
      ],
      tags: ["Cybersecurity", "AppSec", "InfoSec", "EthicalHacking", "ZeroTrust"],
      verification: { status: "approved", rejectionReason: null, checkedAt: new Date() },
      aiDetection: { flag: "human", score: 0.02 },
      likes: [
        { user: studentC._id, userModel: "Student" },
        { user: karan._id, userModel: "Alumni" },
      ],
      comments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 144),
    },
  ];

  console.log("Upserting clean, professional Posts into database...");
  await Post.deleteMany({});
  const createdPosts = await Post.insertMany(postsData);
  console.log(`Successfully created ${createdPosts.length} posts with clean bullets and no emojis.`);

  // ─────────────────────────────────────────────────────────────
  // 4. FEATURED REAL COURSES & SESSIONS
  // ─────────────────────────────────────────────────────────────
  console.log("Upserting featured Courses and live Sessions...");
  await Course.deleteMany({});
  await Session.deleteMany({});

  const coursesData = [
    {
      title: "Mastering Distributed Systems & Low-Level Design",
      description:
        "Comprehensive deep-dive into distributed systems, Raft consensus, Kafka event streaming, concurrency in Go & Java, and cracking Tier-1 backend interviews with Staff Engineer Aditya Verma.",
      instructor: aditya._id,
      price: 1499,
      originalPrice: 2499,
      isCollegePartner: true,
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      syllabus: [
        { title: "Module 1: Foundations of Distributed Storage", duration: "3 hours" },
        { title: "Module 2: Raft Consensus & Leader Election", duration: "4 hours" },
        { title: "Module 3: Low-Level Concurrency & Lock-Free Structures", duration: "4.5 hours" },
        { title: "Module 4: Real-World System Design Case Studies", duration: "5 hours" },
      ],
    },
    {
      title: "Generative AI in Production: LLM Fine-Tuning & Quantization",
      description:
        "Master the complete production lifecycle of modern LLMs. Learn LoRA fine-tuning, retrieval-augmented generation (RAG) with hybrid search, and latency optimization using vLLM and TensorRT-LLM.",
      instructor: priya._id,
      price: 1799,
      originalPrice: 2999,
      isCollegePartner: true,
      thumbnail: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=80",
      syllabus: [
        { title: "Module 1: Vector Databases & Hybrid Embeddings", duration: "3.5 hours" },
        { title: "Module 2: LoRA & QLoRA Parameter-Efficient Fine-Tuning", duration: "4 hours" },
        { title: "Module 3: Production Serving with vLLM & AWQ", duration: "4 hours" },
        { title: "Module 4: Building Enterprise Agentic Workflows", duration: "5 hours" },
      ],
    },
    {
      title: "Full-Stack System Engineering with Go, React & Redis",
      description:
        "Build an ultra-fast real-time dark-store allocation platform from scratch. Covers WebSockets, high-throughput Redis pub/sub, PostgreSQL query optimization, and clean microservice architecture.",
      instructor: rohan._id,
      price: 1299,
      originalPrice: 1999,
      isCollegePartner: false,
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
      syllabus: [
        { title: "Module 1: Microservices Architecture with Go", duration: "3 hours" },
        { title: "Module 2: Real-Time Sockets & Redis Pub/Sub", duration: "3.5 hours" },
        { title: "Module 3: Next.js Frontend with Optimistic Updates", duration: "4 hours" },
      ],
    },
  ];
  await Course.insertMany(coursesData);

  const sessionsData = [
    {
      title: "Weekend Live Workshop: End-to-End Kubernetes & Multi-Cloud CI/CD",
      description:
        "Interactive live workshop by AWS Principal Architect Karan Mehta. Setting up a multi-node Kubernetes cluster, deploying microservices with Helm, and configuring Prometheus observability.",
      instructor: karan._id,
      type: "workshop",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      time: "11:00 AM IST",
      duration: 120,
      price: 499,
      originalPrice: 999,
      isCollegePartner: true,
      totalSeats: 60,
      isApproved: true,
      isPublished: true,
      meetingLink: "https://meet.google.com/linkup-kubernetes-workshop",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Interactive Masterclass: Cracking the Product Management Case Study",
      description:
        "Join Amazon Senior PM Ananya Sen for a live teardown of real product sense and execution interview questions. Interactive roleplays with enrolled participants.",
      instructor: ananya._id,
      type: "session",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      time: "5:00 PM IST",
      duration: 90,
      price: 399,
      originalPrice: 799,
      isCollegePartner: false,
      totalSeats: 40,
      isApproved: true,
      isPublished: true,
      meetingLink: "https://meet.google.com/linkup-pm-masterclass",
      thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "AMA & Live Resume Teardown: How to Stand Out for 2026 Tech Placements",
      description:
        "Live interactive session hosted by Google Staff Engineer Aditya Verma. Live resume reviews, project critiques, and roadmap advice for 2nd, 3rd, and 4th-year engineering students.",
      instructor: aditya._id,
      type: "session",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      time: "6:00 PM IST",
      duration: 90,
      price: 299,
      originalPrice: 599,
      isCollegePartner: true,
      totalSeats: 100,
      isApproved: true,
      isPublished: true,
      meetingLink: "https://meet.google.com/linkup-google-ama",
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    },
  ];
  await Session.insertMany(sessionsData);

  console.log("Seeding complete! Database is now rich with clean professional profiles, posts, courses, and sessions.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
