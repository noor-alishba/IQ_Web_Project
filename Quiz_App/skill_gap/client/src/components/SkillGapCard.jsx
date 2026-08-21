function SkillGapCard({
  matchedSkills = [],
  missingSkills = [],
  overallScore = 0,
}) {
  const safeMatchedSkills = Array.isArray(matchedSkills)
    ? matchedSkills
    : [];

  const safeMissingSkills = Array.isArray(missingSkills)
    ? missingSkills
    : [];

  const safeScore = Math.min(
    100,
    Math.max(0, Number(overallScore) || 0)
  );

  return (
    <section className="skill-gap-card">
      <div className="skill-gap-header">
        <div>
          <span className="result-eyebrow">
            SKILL GAP REPORT
          </span>

          <h2>Your Skill Analysis</h2>

          <p>
            Here is how your current skills compare with
            the requirements of your target role.
          </p>
        </div>

        <div className="skill-score">
          <div className="skill-score-value">
            {safeScore}%
          </div>

          <span>Skill Match</span>
        </div>
      </div>

      <div className="skill-progress">
        <div className="skill-progress-track">
          <div
            className="skill-progress-fill"
            style={{
              width: `${safeScore}%`,
            }}
          />
        </div>

        <div className="skill-progress-labels">
          <span>Current Skill Match</span>
          <strong>{safeScore}%</strong>
        </div>
      </div>

      <div className="skill-columns">
        <div className="skill-column matched-column">
          <div className="column-heading">
            <div className="column-icon matched">
              ✓
            </div>

            <div>
              <h3>Skills You Have</h3>
              <span>
                {safeMatchedSkills.length} matched
              </span>
            </div>
          </div>

          {safeMatchedSkills.length > 0 ? (
            <div className="skill-card-list">
              {safeMatchedSkills.map((skill, index) => (
                <div
                  className="skill-list-item matched"
                  key={`${skill}-${index}`}
                >
                  <span className="list-check">✓</span>
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-skill-state">
              No matching skills found yet.
            </div>
          )}
        </div>

        <div className="skill-column missing-column">
          <div className="column-heading">
            <div className="column-icon missing">
              !
            </div>

            <div>
              <h3>Skills to Develop</h3>
              <span>
                {safeMissingSkills.length} remaining
              </span>
            </div>
          </div>

          {safeMissingSkills.length > 0 ? (
            <div className="skill-card-list">
              {safeMissingSkills.map((item, index) => {
                const skill =
                  typeof item === "string"
                    ? item
                    : item?.skill || "Unknown Skill";

                const priority =
                  typeof item === "object"
                    ? item?.priority || "medium"
                    : "medium";

                const priorityClass = String(
                  priority
                ).toLowerCase();

                return (
                  <div
                    className="skill-list-item missing"
                    key={`${skill}-${index}`}
                  >
                    <div className="missing-skill-info">
                      <span className="list-warning">
                        !
                      </span>

                      <span>{skill}</span>
                    </div>

                    <span
                      className={`mini-priority ${priorityClass}`}
                    >
                      {priority}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-skill-state success">
              Great! No major skill gaps found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default SkillGapCard;