import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================================================
// GROQ
// ==================================================

if (!process.env.GROQ_API_KEY) {
  console.error(
    "ERROR: GROQ_API_KEY is missing from environment variables."
  );
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ==================================================
// MIDDLEWARE
// ==================================================

app.use(cors());

app.use(
  express.json({
    limit: "1mb",
  })
);

// ==================================================
// HOME / TEST ROUTE
// ==================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Quiz App Backend is running!",
  });
});

// ==================================================
// AI QUIZ GENERATION
// ==================================================

app.post("/api/quiz/generate", async (req, res) => {
  try {
    const { topic } = req.body;

    // ----------------------------------------------
    // INPUT VALIDATION
    // ----------------------------------------------

    if (
      typeof topic !== "string" ||
      !topic.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Topic is required.",
      });
    }

    const cleanTopic = topic.trim();

    if (cleanTopic.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Topic must contain at least 2 characters.",
      });
    }

    if (cleanTopic.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Topic must be 100 characters or less.",
      });
    }

    // ----------------------------------------------
    // GROQ REQUEST
    // ----------------------------------------------

    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",

        messages: [
          {
            role: "system",

            content:
              "You are an expert educational quiz generator. Create clear, accurate, age-appropriate and educational quizzes. Follow the requested JSON structure exactly.",
          },

          {
            role: "user",

            content: `
Create exactly 6 questions about "${cleanTopic}".

The quiz MUST contain:

1. Exactly 4 multiple-choice questions.
2. Exactly 2 short-answer questions.

For multiple-choice questions:

- type must be "mcq"
- question must be clear
- exactly 4 options
- answer must exactly match one of the options

For short-answer questions:

- type must be "short"
- question must be clear
- options must be an empty array
- answer must be a short correct answer

The final structure MUST contain:

- exactly 4 questions with type "mcq"
- exactly 2 questions with type "short"

Return ONLY valid JSON.
`,
          },
        ],

        response_format: {
          type: "json_schema",

          json_schema: {
            name: "quiz",

            strict: true,

            schema: {
              type: "object",

              properties: {
                quiz: {
                  type: "array",

                  items: {
                    type: "object",

                    properties: {
                      type: {
                        type: "string",

                        enum: [
                          "mcq",
                          "short",
                        ],
                      },

                      question: {
                        type: "string",
                      },

                      options: {
                        type: "array",

                        items: {
                          type: "string",
                        },
                      },

                      answer: {
                        type: "string",
                      },
                    },

                    required: [
                      "type",
                      "question",
                      "options",
                      "answer",
                    ],

                    additionalProperties: false,
                  },
                },
              },

              required: ["quiz"],

              additionalProperties: false,
            },
          },
        },

        temperature: 0.3,
      });

    // ----------------------------------------------
    // PARSE AI RESPONSE
    // ----------------------------------------------

    const content =
      completion?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(
        "AI returned an empty response."
      );
    }

    let result;

    try {
      result = JSON.parse(content);
    } catch {
      throw new Error(
        "AI returned invalid JSON."
      );
    }

    // ----------------------------------------------
    // GENERAL VALIDATION
    // ----------------------------------------------

    if (
      !result ||
      !Array.isArray(result.quiz)
    ) {
      throw new Error(
        "AI response does not contain a valid quiz."
      );
    }

    if (result.quiz.length !== 6) {
      throw new Error(
        "AI did not return exactly 6 questions."
      );
    }

    // ----------------------------------------------
    // TYPE VALIDATION
    // ----------------------------------------------

    const mcqs = result.quiz.filter(
      (question) =>
        question.type === "mcq"
    );

    const shortQuestions =
      result.quiz.filter(
        (question) =>
          question.type === "short"
      );

    if (mcqs.length !== 4) {
      throw new Error(
        "AI did not return exactly 4 MCQs."
      );
    }

    if (shortQuestions.length !== 2) {
      throw new Error(
        "AI did not return exactly 2 short questions."
      );
    }

    // ----------------------------------------------
    // MCQ VALIDATION
    // ----------------------------------------------

    for (const question of mcqs) {
      if (
        typeof question.question !==
          "string" ||
        !question.question.trim()
      ) {
        throw new Error(
          "An MCQ has an invalid question."
        );
      }

      if (
        !Array.isArray(
          question.options
        ) ||
        question.options.length !== 4
      ) {
        throw new Error(
          "An MCQ must contain exactly 4 options."
        );
      }

      if (
        typeof question.answer !==
          "string" ||
        !question.answer.trim()
      ) {
        throw new Error(
          "An MCQ has an invalid answer."
        );
      }

      const answerExists =
        question.options.some(
          (option) =>
            String(option)
              .trim()
              .toLowerCase() ===
            String(question.answer)
              .trim()
              .toLowerCase()
        );

      if (!answerExists) {
        throw new Error(
          "An MCQ answer does not match any option."
        );
      }
    }

    // ----------------------------------------------
    // SHORT ANSWER VALIDATION
    // ----------------------------------------------

    for (const question of shortQuestions) {
      if (
        typeof question.question !==
          "string" ||
        !question.question.trim()
      ) {
        throw new Error(
          "A short-answer question is invalid."
        );
      }

      if (
        !Array.isArray(
          question.options
        ) ||
        question.options.length !== 0
      ) {
        throw new Error(
          "Short-answer questions must have an empty options array."
        );
      }

      if (
        typeof question.answer !==
          "string" ||
        !question.answer.trim()
      ) {
        throw new Error(
          "A short-answer question has an invalid answer."
        );
      }
    }

    // ----------------------------------------------
    // SUCCESS RESPONSE
    // ----------------------------------------------

    return res.json({
      success: true,

      topic: cleanTopic,

      quiz: result.quiz,
    });
  } catch (error) {
    console.error(
      "Groq Quiz Generation Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to generate quiz.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
});

// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});