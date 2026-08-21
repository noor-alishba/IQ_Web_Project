import { useEffect, useState } from "react";
import "./App.css";
import inquisitorsLogo from "./assets/inquisitors-logo.png";

function App() {
  // ==================================================
  // QUIZ STATE
  // ==================================================

  const [questions, setQuestions] = useState([]);
  const [topic, setTopic] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [shortAnswer, setShortAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showHistory, setShowHistory] = useState(false);

  // ==================================================
  // QUIZ HISTORY
  // ==================================================

  const [history, setHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem("quizHistory");
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch {
      return [];
    }
  });

  // ==================================================
  // QUIZ STATUS
  // ==================================================

  const quizFinished =
    quizStarted &&
    questions.length > 0 &&
    currentQuestion >= questions.length;

  const currentQuizQuestion =
    questions.length > 0 && currentQuestion < questions.length
      ? questions[currentQuestion]
      : null;

  // ==================================================
  // QUESTION TYPE
  // ==================================================

  function getQuestionType(question) {
    if (!question) {
      return "mcq";
    }

    if (
      question.type === "short" ||
      question.type === "short-answer" ||
      question.type === "short_answer"
    ) {
      return "short";
    }

    return "mcq";
  }

  const currentQuestionType = getQuestionType(currentQuizQuestion);

  // ==================================================
  // GENERATE QUIZ
  // ==================================================

  async function generateQuiz() {
    if (loading) {
      return;
    }

    if (!topic.trim()) {
      setError("Please enter a topic first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/quiz/generate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            topic: topic.trim(),
          }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid response received from server.");
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to generate quiz."
        );
      }

      if (!Array.isArray(data.quiz) || data.quiz.length !== 6) {
        throw new Error(
          "The AI did not generate exactly 6 questions."
        );
      }

      const mcqs = data.quiz.filter(
        (question) => question.type === "mcq"
      );

      const shortQuestions = data.quiz.filter(
        (question) => question.type === "short"
      );

      if (mcqs.length !== 4) {
        throw new Error(
          "The AI did not generate exactly 4 MCQs."
        );
      }

      if (shortQuestions.length !== 2) {
        throw new Error(
          "The AI did not generate exactly 2 short questions."
        );
      }

      // Validate MCQs
      for (const question of mcqs) {
        if (
          !question.question ||
          !Array.isArray(question.options) ||
          question.options.length !== 4 ||
          !question.answer ||
          !question.options.includes(question.answer)
        ) {
          throw new Error(
            "One or more MCQs returned by AI are invalid."
          );
        }
      }

      // Validate short questions
      for (const question of shortQuestions) {
        if (!question.question || !question.answer) {
          throw new Error(
            "One or more short-answer questions returned by AI are invalid."
          );
        }
      }

      setQuestions(data.quiz);
      setCurrentQuestion(0);
      setScore(0);

      setSelectedAnswer(null);
      setShortAnswer("");

      setQuizStarted(true);
      setShowHistory(false);
    } catch (err) {
      console.error("Quiz Generation Error:", err);

      setError(
        err.message || "Could not generate the quiz."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // MCQ ANSWER
  // ==================================================

  function handleAnswerSelect(option) {
    if (selectedAnswer !== null) {
      return;
    }

    setSelectedAnswer(option);
  }

  // ==================================================
  // NEXT MCQ
  // ==================================================

  function handleMCQNext() {
    if (
      selectedAnswer === null ||
      !currentQuizQuestion
    ) {
      return;
    }

    const correctAnswer =
      currentQuizQuestion.answer || "";

    const userAnswer = String(selectedAnswer)
      .trim()
      .toLowerCase();

    const expectedAnswer = String(correctAnswer)
      .trim()
      .toLowerCase();

    if (userAnswer === expectedAnswer) {
      setScore((previousScore) => previousScore + 1);
    }

    moveToNextQuestion();
  }

  // ==================================================
  // SHORT ANSWER
  // ==================================================

  function handleShortNext() {
    if (!shortAnswer.trim()) {
      return;
    }

    if (!currentQuizQuestion) {
      return;
    }

    const correctAnswer =
      currentQuizQuestion.answer ||
      currentQuizQuestion.correctAnswer ||
      "";

    const userAnswer = shortAnswer
      .trim()
      .toLowerCase();

    const expectedAnswer = String(correctAnswer)
      .trim()
      .toLowerCase();

    if (
      expectedAnswer &&
      userAnswer === expectedAnswer
    ) {
      setScore((previousScore) => previousScore + 1);
    }

    moveToNextQuestion();
  }

  // ==================================================
  // MOVE TO NEXT QUESTION
  // ==================================================

  function moveToNextQuestion() {
    setSelectedAnswer(null);
    setShortAnswer("");

    setCurrentQuestion(
      (previousQuestion) => previousQuestion + 1
    );
  }

  // ==================================================
  // RESTART QUIZ
  // ==================================================

  function restartQuiz() {
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);

    setSelectedAnswer(null);
    setShortAnswer("");

    setQuizStarted(false);
    setError("");
    setShowHistory(false);
  }

  // ==================================================
  // CLEAR HISTORY
  // ==================================================

  function clearHistory() {
    localStorage.removeItem("quizHistory");
    setHistory([]);
  }

  // ==================================================
  // SAVE RESULT
  // ==================================================

  useEffect(() => {
    if (!quizFinished || !questions.length) {
      return;
    }

    const percentage = Math.round(
      (score / questions.length) * 100
    );

    const newResult = {
      id: Date.now(),
      topic: topic.trim(),
      score,
      total: questions.length,
      percentage,
      date: new Date().toLocaleString(),
    };

    setHistory((previousHistory) => {
      const alreadySaved = previousHistory.some(
        (item) =>
          item.topic === topic.trim() &&
          item.score === score &&
          item.total === questions.length
      );

      if (alreadySaved) {
        return previousHistory;
      }

      const updatedHistory = [
        newResult,
        ...previousHistory,
      ];

      localStorage.setItem(
        "quizHistory",
        JSON.stringify(updatedHistory)
      );

      return updatedHistory;
    });
  }, [
    quizFinished,
    questions.length,
    score,
    topic,
  ]);

  // ==================================================
  // RESULT SCREEN
  // ==================================================

  if (quizFinished) {
    const percentage = Math.round(
      (score / questions.length) * 100
    );

    return (
      <div className="app">
        <div className="result-card">

          <div className="result-brand">
            <img
              src={inquisitorsLogo}
              alt="INQUISITORS"
              className="result-logo"
            />

            <p className="brand-tagline">
              Think <span>•</span> Learn <span>•</span> Master
            </p>
          </div>

          <div className="result-icon">
            ✓
          </div>

          <p className="result-label">
            QUIZ COMPLETED
          </p>

          <h1>
            Your Final Score
          </h1>

          <div className="score-display">
            {score}
            <span>/{questions.length}</span>
          </div>

          <div className="percentage-display">
            {percentage}%
          </div>

          <p className="result-message">
            {percentage >= 80 ? (
              <>
                Excellent work! You have a strong
                understanding of{" "}
                <strong>{topic}</strong>.
              </>
            ) : percentage >= 60 ? (
              <>
                Good job! You understand the basics
                of <strong>{topic}</strong>, but there
                is still room to improve.
              </>
            ) : percentage >= 40 ? (
              <>
                You're making progress! Review the
                key concepts of <strong>{topic}</strong>
                and try again.
              </>
            ) : (
              <>
                Needs improvement. Review the
                important concepts of{" "}
                <strong>{topic}</strong> and try the
                quiz again.
              </>
            )}
          </p>

          <div className="result-actions">

            <button
              className="restart-button"
              onClick={restartQuiz}
            >
              Try Again
            </button>

            <button
              className="history-button"
              onClick={() =>
                setShowHistory(!showHistory)
              }
            >
              {showHistory
                ? "Hide History"
                : "Quiz History"}
            </button>

          </div>

          {showHistory && (
            <div className="history-section">

              <div className="history-header">

                <h2>
                  Quiz History
                </h2>

                {history.length > 0 && (
                  <button
                    className="clear-history-button"
                    onClick={clearHistory}
                  >
                    Clear History
                  </button>
                )}

              </div>

              {history.length === 0 ? (
                <p className="empty-history">
                  No quiz history yet.
                </p>
              ) : (
                <div className="history-list">

                  {history.map((item) => (
                    <div
                      className="history-item"
                      key={item.id}
                    >

                      <div className="history-info">
                        <h3>
                          {item.topic}
                        </h3>

                        <p>
                          {item.date}
                        </p>
                      </div>

                      <div className="history-score">

                        <strong>
                          {item.score}/{item.total}
                        </strong>

                        <span>
                          {item.percentage}%
                        </span>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>
          )}

        </div>
      </div>
    );
  }

  // ==================================================
  // START SCREEN
  // ==================================================

  if (!quizStarted) {
    return (
      <div className="app">

        <div className="quiz-card start-card">

          <div className="brand-section">

            <img
              src={inquisitorsLogo}
              alt="INQUISITORS"
              className="brand-logo"
            />

            <p className="brand-tagline">
              Think <span>•</span> Learn{" "}
              <span>•</span> Master
            </p>

          </div>

          <div className="hero-section">

            <div className="ai-badge">
              AI POWERED QUIZ
            </div>

            <h1>
              Quiz Challenge
            </h1>

            <p>
              Generate a personalized quiz using AI.
            </p>

          </div>

          <div className="section-divider">
            <span></span>
          </div>

          <div className="topic-section">

            <div className="topic-title">

              <div className="topic-icon">
                ▤
              </div>

              <h2>
                Choose Your Topic
              </h2>

            </div>

            <p>
              Enter any topic and Groq AI will
              generate 4 multiple-choice and
              2 short-answer questions.
            </p>

            <input
              type="text"
              className="topic-input"
              placeholder="e.g. React, JavaScript, Python..."
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value);

                if (error) {
                  setError("");
                }
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !loading
                ) {
                  generateQuiz();
                }
              }}
              disabled={loading}
            />

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

            <button
              className="generate-button"
              onClick={generateQuiz}
              disabled={loading || !topic.trim()}
            >

              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Generating Quiz...
                </>
              ) : (
                <>
                  <span className="sparkle-icon">
                    ✦
                  </span>
                  Generate AI Quiz
                </>
              )}

            </button>

          </div>

        </div>

      </div>
    );
  }

  // ==================================================
  // LOADING SAFETY
  // ==================================================

  if (!currentQuizQuestion && !quizFinished) {
    return (
      <div className="app">
        <div className="quiz-card loading-card">

          <div className="loading-spinner large"></div>

          <h2>
            Loading quiz...
          </h2>

          <p>
            Please wait a moment.
          </p>

        </div>
      </div>
    );
  }

  // ==================================================
  // PROGRESS
  // ==================================================

  const progress =
    ((currentQuestion + 1) /
      questions.length) *
    100;

  // ==================================================
  // QUIZ SCREEN
  // ==================================================

  return (
    <div className="app">

      <div className="quiz-card">

        {/* HEADER */}

        <div className="quiz-header">

          <div className="header-brand">

            <img
              src={inquisitorsLogo}
              alt="INQUISITORS"
              className="quiz-logo"
            />

            <div>

              <p className="quiz-label">
                AI GENERATED QUIZ
              </p>

              <h1>
                Quiz Challenge
              </h1>

              <p>
                Topic:{" "}
                <strong>{topic}</strong>
              </p>

            </div>

          </div>

          <div className="score-box">

            <span>
              Score
            </span>

            <strong>
              {score}
            </strong>

          </div>

        </div>

        {/* PROGRESS */}

        <div className="progress-section">

          <div className="progress-info">

            <span>
              Question {currentQuestion + 1} of{" "}
              {questions.length}
            </span>

            <span>
              {Math.round(progress)}%
            </span>

          </div>

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        {/* QUESTION */}

        <div className="question-section">

          <p className="question-type">

            {currentQuestionType === "short"
              ? "SHORT ANSWER"
              : "MULTIPLE CHOICE"}

          </p>

          <h2>
            {currentQuizQuestion.question}
          </h2>

          {/* MCQ */}

          {currentQuestionType === "mcq" ? (
            <>

              <div className="options">

                {currentQuizQuestion.options?.map(
                  (option, index) => {

                    const isSelected =
                      selectedAnswer === option;

                    const isCorrect =
                      option ===
                      currentQuizQuestion.answer;

                    let optionClass =
                      "option-button";

                    if (
                      selectedAnswer !== null
                    ) {
                      if (
                        isSelected &&
                        isCorrect
                      ) {
                        optionClass +=
                          " correct";
                      } else if (
                        isSelected &&
                        !isCorrect
                      ) {
                        optionClass +=
                          " incorrect";
                      } else if (
                        isCorrect
                      ) {
                        optionClass +=
                          " correct-answer";
                      }
                    }

                    return (
                      <button
                        key={`${option}-${index}`}
                        className={optionClass}
                        onClick={() =>
                          handleAnswerSelect(option)
                        }
                        disabled={
                          selectedAnswer !== null
                        }
                      >

                        <span className="option-letter">
                          {String.fromCharCode(
                            65 + index
                          )}
                        </span>

                        <span className="option-text">
                          {option}
                        </span>

                      </button>
                    );
                  }
                )}

              </div>

              <div className="next-section">

                {selectedAnswer === null ? (
                  <p>
                    Select an option to continue
                  </p>
                ) : (
                  <button
                    className="next-button"
                    onClick={handleMCQNext}
                  >
                    Next Question →
                  </button>
                )}

              </div>

            </>
          ) : (

            /* SHORT ANSWER */

            <>

              <textarea
                className="short-answer-input"
                placeholder="Type your answer here..."
                value={shortAnswer}
                onChange={(event) =>
                  setShortAnswer(event.target.value)
                }
                rows="5"
              />

              <div className="next-section">

                <button
                  className="next-button"
                  onClick={handleShortNext}
                  disabled={!shortAnswer.trim()}
                >
                  Next Question →
                </button>

              </div>

            </>
          )}

        </div>

      </div>

    </div>
  );
}

export default App;