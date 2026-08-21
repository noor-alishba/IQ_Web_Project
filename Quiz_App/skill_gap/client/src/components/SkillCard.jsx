function SkillCard({ skill, status = "missing", priority = "medium" }) {
  const normalizedStatus = String(status).toLowerCase();
  const normalizedPriority = String(priority).toLowerCase();

  const statusConfig = {
    matched: {
      label: "Matched",
      icon: "✓",
      className: "matched",
    },
    missing: {
      label: "Missing",
      icon: "!",
      className: "missing",
    },
    recommended: {
      label: "Recommended",
      icon: "→",
      className: "recommended",
    },
  };

  const priorityConfig = {
    high: {
      label: "High Priority",
      className: "high",
    },
    medium: {
      label: "Medium Priority",
      className: "medium",
    },
    low: {
      label: "Low Priority",
      className: "low",
    },
  };

  const currentStatus =
    statusConfig[normalizedStatus] || statusConfig.missing;

  const currentPriority =
    priorityConfig[normalizedPriority] || priorityConfig.medium;

  return (
    <div
      className={`skill-card skill-card-${currentStatus.className}`}
    >
      <div className="skill-card-main">
        <div
          className={`skill-status-icon ${currentStatus.className}`}
        >
          {currentStatus.icon}
        </div>

        <div className="skill-card-content">
          <h3>{skill || "Unnamed Skill"}</h3>

          <div className="skill-card-meta">
            <span
              className={`skill-status-badge ${currentStatus.className}`}
            >
              {currentStatus.label}
            </span>

            {normalizedStatus === "missing" && (
              <span
                className={`skill-priority-badge ${currentPriority.className}`}
              >
                {currentPriority.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillCard;