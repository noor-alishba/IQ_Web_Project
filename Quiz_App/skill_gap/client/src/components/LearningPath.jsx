function LearningPath({ learningPath = [], path = [] }) {
  const items =
    learningPath?.length > 0
      ? learningPath
      : path || [];

  if (!items.length) {
    return (
      <div className="learning-empty">
        <div className="learning-empty-icon">✦</div>

        <h3>No Learning Steps Available</h3>

        <p>
          Your current skills are already a strong match
          for the selected target role.
        </p>
      </div>
    );
  }

  return (
    <div className="learning-path-list">
      {items.map((item, index) => {
        const title =
          typeof item === "string"
            ? item
            : item.title ||
              item.skill ||
              item.name ||
              item.topic ||
              `Learning Step ${index + 1}`;

        const description =
          typeof item === "object"
            ? item.description ||
              item.details ||
              item.reason ||
              ""
            : "";

        return (
          <div
            className="learning-step"
            key={item.id || index}
          >
            <div className="step-number">
              {index + 1}
            </div>

            <div className="step-content">
              <span className="step-label">
                STEP {index + 1}
              </span>

              <h3>{title}</h3>

              {description && (
                <p>{description}</p>
              )}
            </div>

            <div className="step-arrow">
              →
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LearningPath;