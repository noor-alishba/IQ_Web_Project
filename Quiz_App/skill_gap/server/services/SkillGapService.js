/*
 * SkillGapService.js
 * Core skill-gap analysis always works. Groq adds optional projects only;
 * an invalid key, model, quota, or missing SDK never breaks the API response.
 */

const ROLE_SKILLS = {
  frontend: ["HTML", "CSS", "JavaScript", "React", "Git", "Responsive Design", "REST APIs"],
  "frontend developer": ["HTML", "CSS", "JavaScript", "React", "Git", "Responsive Design", "REST APIs"],
  backend: ["JavaScript", "Node.js", "Express.js", "REST APIs", "Databases", "SQL", "Authentication", "Git"],
  "backend developer": ["JavaScript", "Node.js", "Express.js", "REST APIs", "Databases", "SQL", "Authentication", "Git"],
  fullstack: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "REST APIs", "Databases", "SQL", "Git"],
  "full stack developer": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "REST APIs", "Databases", "SQL", "Git"],
  "data analyst": ["Python", "SQL", "Excel", "Statistics", "Data Visualization", "Pandas", "Power BI"],
  "software engineer": ["Programming", "Data Structures", "Algorithms", "Object-Oriented Programming", "Git", "Databases", "APIs", "Testing"],
};

const SKILL_ALIASES = {
  html: "HTML", html5: "HTML", css: "CSS", css3: "CSS", js: "JavaScript", javascript: "JavaScript",
  react: "React", reactjs: "React", node: "Node.js", nodejs: "Node.js", "node.js": "Node.js",
  express: "Express.js", expressjs: "Express.js", "express.js": "Express.js",
  api: "REST APIs", apis: "REST APIs", "rest api": "REST APIs", "rest apis": "REST APIs",
  database: "Databases", databases: "Databases", db: "Databases", sql: "SQL", mysql: "SQL",
  postgresql: "SQL", postgres: "SQL", auth: "Authentication", authentication: "Authentication",
};

function normalizeText(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeSkill(skill) {
  const normalized = normalizeText(skill);
  return SKILL_ALIASES[normalized] || String(skill).trim();
}

function getRequiredSkills(targetRole) {
  const role = normalizeText(targetRole);
  const match = Object.keys(ROLE_SKILLS).find(
    (knownRole) => role === knownRole || role.includes(knownRole)
  );

  // Unknown roles must never be treated as a 100% match.
  return match
    ? ROLE_SKILLS[match]
    : ["Programming Fundamentals", "Problem Solving", "Git", "Communication"];
}

function fallbackProjects(targetRole, missingSkills) {
  if (missingSkills.length === 0) return [];

  return [{
    title: `${targetRole} Practice Project`,
    description: `Build a small project using ${missingSkills.slice(0, 3).join(", ")}.`,
  }];
}

async function getGroqProjects(targetRole, missingSkills) {
  if (!process.env.GROQ_API_KEY || missingSkills.length === 0) return [];

  try {
    // Dynamic import prevents a missing groq-sdk package from crashing the server.
    const { default: Groq } = await import("groq-sdk");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return valid JSON only. Do not use Markdown." },
        {
          role: "user",
          content: `Return {"projects":[{"title":"string","description":"string"}]}. Suggest at most 3 beginner portfolio projects for a ${targetRole}. Missing skills: ${missingSkills.join(", ")}.`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices?.[0]?.message?.content || "{}");
    return Array.isArray(parsed.projects) ? parsed.projects.slice(0, 3) : [];
  } catch (error) {
    // Groq is an enhancement only. The normal analysis continues safely.
    console.warn("Groq recommendations skipped:", error.message);
    return [];
  }
}

export async function analyzeSkillGap(skills, targetRole) {
  const currentSkills = [...new Set(skills.map(normalizeSkill).filter(Boolean))];
  const requiredSkills = getRequiredSkills(targetRole);
  const currentSkillSet = new Set(currentSkills.map(normalizeText));

  const matchedSkills = requiredSkills.filter((skill) => currentSkillSet.has(normalizeText(skill)));
  const missingSkills = requiredSkills.filter((skill) => !currentSkillSet.has(normalizeText(skill)));
  const score = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  const skillGaps = missingSkills.map((skill, index) => ({
    skill,
    priority: index < 2 ? "High" : index < 5 ? "Medium" : "Low",
    reason: `${skill} is a core skill for a ${targetRole} role.`,
  }));

  const learningPath = missingSkills.map((skill, index) => ({
    step: index + 1,
    skill,
    description: `Learn ${skill}, then practise it in a small hands-on exercise.`,
  }));

  const groqProjects = await getGroqProjects(targetRole, missingSkills);

  return {
    targetRole,
    currentSkills,
    requiredSkills,
    matchedSkills,
    skillGaps,
    learningPath,
    recommendedProjects: groqProjects.length ? groqProjects : fallbackProjects(targetRole, missingSkills),
    readiness: {
      score,
      level: score >= 80 ? "Strong" : score >= 50 ? "Developing" : "Getting started",
      summary: `You match ${matchedSkills.length} of ${requiredSkills.length} core skills for ${targetRole}.`,
    },
  };
}
