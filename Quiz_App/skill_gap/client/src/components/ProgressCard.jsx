function ProgressCard({
  overallScore = 0,
  matchedSkills = [],
  missingSkills = [],
}) {
  const score = Math.min(
    100,
    Math.max(0, Number(overallScore) || 0)
  );

  const matchedCount = Array.isArray(matchedSkills)
    ? matchedSkills.length
    : 0;

  const missingCount = Array.isArray(missingSkills)
    ? missingSkills.length
    : 0;

  const totalSkills = matchedCount + missingCount;

  let level = "Needs Development";

  if (score >= 80) {
    level = "Strong Match";
  } else if (score >= 60) {
    level = "Good Progress";
  } else if (score >= 40) {
    level = "Developing";
  }

  return (
    <section className="progress-card">
      <div className="progress-card-header">
        <div>
          <span className="result-eyebrow">
            YOUR PROGRESS
          </span>

          <h2>Career Readiness</h2>

          <p>
            Track how closely your current profile
            matches your target requirements.
          </p>
        </div>

        <div className="readiness-level">
          <span>Current Level</span>
          <strong>{level}</strong>
        </div>
      </div>

      <div className="progress-overview">
        <div className="progress-circle-wrapper">
          <div
            className="progress-circle"
            style={{
              "--progress": `${score}%`,
            }}
          >
            <div className="progress-circle-inner">
              <strong>{score}%</strong>
              <span>Ready</span>
            </div>
          </div>
        </div>

        <div className="progress-stats">
          <div className="progress-stat">
            <span className="stat-icon matched">
              ✓
            </span>

            <div>
              <strong>{matchedCount}</strong>
              <span>Matched Skills</span>
            </div>
          </div>

          <div className="progress-stat">
            <span className="stat-icon missing">
              !
            </span>

            <div>
              <strong>{missingCount}</strong>
              <span>Skills to Develop</span>
            </div>
          </div>

          <div className="progress-stat">
            <span className="stat-icon total">
              #
            </span>

            <div>
              <strong>{totalSkills}</strong>
              <span>Total Skills</span>
            </div>
          </div>
        </div>
      </div>

      <div className="progress-message">
        {score >= 80 ? (
          <>
            <strong>Excellent progress!</strong>{" "}
            You already have most of the skills required
            for your target role.
          </>
        ) : score >= 60 ? (
          <>
            <strong>Good progress!</strong>{" "}
            You have a solid foundation, with a few
            important areas left to develop.
          </>
        ) : score >= 40 ? (
          <>
            <strong>You're on your way!</strong>{" "}
            Focus on the high-priority gaps in your
            learning path to improve your readiness.
          </>
        ) : (
          <>
            <strong>Start building your foundation.</strong>{" "}
            Follow the recommended learning path and
            focus first on the highest-priority skills.
          </>
        )}
      </div>
    </section>
  );
}

export default ProgressCard;