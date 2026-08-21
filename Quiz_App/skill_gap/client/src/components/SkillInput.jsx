function SkillInput({
  skills,
  setSkills,
  targetRole,
  setTargetRole,
  onAnalyze,
  loading,
}) {
  function handleSubmit(event) {
    event.preventDefault();

    if (!skills.trim() || !targetRole.trim() || loading) {
      return;
    }

    onAnalyze();
  }

  return (
    <section className="skill-input-card">
      <div className="section-heading">
        <div className="section-icon">◆</div>

        <div>
          <h2>Analyze Your Skill Gap</h2>
          <p>
            Enter your current skills and the role you want to prepare for.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="skill-form">
        <div className="form-group">
          <label htmlFor="current-skills">
            Your Current Skills
          </label>

          <textarea
            id="current-skills"
            className="skill-textarea"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            placeholder="e.g. HTML, CSS, JavaScript, React, Git"
            rows={4}
            disabled={loading}
          />

          <span className="input-hint">
            Separate multiple skills with commas.
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="target-role">
            Target Role
          </label>

          <input
            id="target-role"
            type="text"
            className="skill-input"
            value={targetRole}
            onChange={(event) => setTargetRole(event.target.value)}
            placeholder="e.g. Frontend Developer"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="analyze-button"
          disabled={
            loading ||
            !skills.trim() ||
            !targetRole.trim()
          }
        >
          {loading ? (
            <>
              <span className="button-spinner"></span>
              Analyzing Skills...
            </>
          ) : (
            <>
              <span className="button-icon">✦</span>
              Analyze Skill Gap
            </>
          )}
        </button>
      </form>
    </section>
  );
}

export default SkillInput;