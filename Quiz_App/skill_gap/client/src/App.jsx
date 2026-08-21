import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/skill-gap/analyze";

export default function App() {
  const [skills, setSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyzeSkills(event) {
    event.preventDefault();
    const skillList = skills.split(",").map((item) => item.trim()).filter(Boolean);
    if (!skillList.length || !targetRole.trim()) {
      setError("Please enter your current skills and target role."); return;
    }
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ skills: skillList, targetRole: targetRole.trim() }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.data) throw new Error(data.message || "Failed to analyze skill gap.");
      setResult(data.data);
    } catch (err) { setError(err.message || "Unable to connect to the backend server."); }
    finally { setLoading(false); }
  }

  const gaps = Array.isArray(result?.skillGaps) ? result.skillGaps : [];
  const path = Array.isArray(result?.learningPath) ? result.learningPath : [];
  const projects = Array.isArray(result?.recommendedProjects) ? result.recommendedProjects : [];
  const readiness = result?.readiness || {};

  return <div className="app">
    <header className="top-header"><div className="brand"><span className="brand-mark">SG</span><span>Skill Gap Analyzer</span></div></header>
    <main className="main-container">
      <section className="hero-section"><span className="hero-badge">AI POWERED CAREER ANALYSIS</span><h1>Discover Your <span>Skill Gap</span></h1><p>Compare your current skills with your target career and get a personalized learning path.</p></section>
      <section className="input-card">
        <div className="section-title"><span className="section-icon">◆</span><div><h2>Analyze Your Skill Gap</h2><p>Enter your current skills and the role you want to prepare for.</p></div></div>
        <form onSubmit={analyzeSkills}>
          <label htmlFor="skills">Your Current Skills</label><textarea id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. HTML, CSS, JavaScript, React" rows="4" disabled={loading} />
          <small>Separate multiple skills with commas.</small>
          <label htmlFor="targetRole">Target Role</label><input id="targetRole" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Frontend Developer" disabled={loading} />
          <button type="submit" disabled={loading}>{loading ? "Analyzing Skills..." : "✦ Analyze Skill Gap"}</button>
        </form>
        {error && <div className="error-message"><strong>Analysis Error</strong><span>{error}</span></div>}
      </section>
      {loading && <section className="status-card"><div className="spinner" /><h3>Analyzing Your Skills...</h3><p>AI is comparing your skills with the target role.</p></section>}
      {!loading && result && <section className="results-section">
        <div className="results-header"><span className="results-label">ANALYSIS COMPLETE</span><h2>Your Skill Gap Analysis</h2><p>Target Role: <strong>{result.targetRole || targetRole}</strong></p></div>
        <section className="readiness-card"><div className="readiness-top"><div><span className="results-label">YOUR PROGRESS</span><h2>Career Readiness</h2><p>{readiness.summary}</p></div><div className="score-circle"><strong>{readiness.score ?? 0}%</strong><span>Ready</span></div></div><div className="progress-track"><div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, readiness.score ?? 0))}%` }} /></div><p>Level: <strong>{readiness.level || "Getting started"}</strong></p></section>
        <div className="section-heading"><span className="section-icon">◆</span><div><h2>Skills You Need to Improve</h2><p>Prioritized skills that move you closer to your target role.</p></div></div>
        {gaps.length ? <div className="card-grid">{gaps.map((gap, index) => <article className="gap-card" key={`${gap.skill}-${index}`}><div className="gap-card-top"><h3>{gap.skill}</h3><span className={`priority ${String(gap.priority).toLowerCase()}`}>{gap.priority}</span></div><p>{gap.reason}</p></article>)}</div> : <div className="empty-result"><h3>No Major Skill Gaps Found</h3><p>Your current skills are a strong match for this role.</p></div>}
        <div className="section-heading learning-heading"><span className="section-icon">✦</span><div><h2>Recommended Learning Path</h2><p>Follow these steps in order to strengthen your skills.</p></div></div>
        <div className="learning-list">{path.map((step) => <article className="learning-card" key={step.step}><div className="step-number">{step.step}</div><div><h3>{step.skill}</h3><p>{step.description}</p></div></article>)}</div>
        {projects.length > 0 && <><div className="section-heading"><span className="section-icon">●</span><div><h2>Recommended Projects</h2></div></div><div className="card-grid">{projects.map((project, index) => <article className="gap-card" key={`${project.title}-${index}`}><h3>{project.title}</h3><p>{project.description}</p></article>)}</div></>}
      </section>}
    </main>
  </div>;
}
