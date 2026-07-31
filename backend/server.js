import "dotenv/config";
import cors from "cors";
import express from "express";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 8080;
const PAYOUT = 260;

const QUESTIONS = [
  {
    id: "patient",
    field: "patient",
    q: "The receipt only says “M. Chen.” Who was seen?",
    chips: [
      { label: "Maya — that's me", v: "Maya Chen · member" },
      { label: "Marcus — son, 14", v: "Marcus Chen · dependent" },
    ],
    ack: (v) => `Set. Filing under ${v.split(" ·")[0]}.`,
  },
  {
    id: "reason",
    field: "visitType",
    q: "Was this routine vision care, or was something wrong with your eyes?",
    chips: [
      { label: "Routine — new glasses", v: "Routine vision care" },
      { label: "Something was wrong", v: "Medical eye condition" },
    ],
    ack: (v) =>
      v === "Routine vision care"
        ? "Good — that keeps it on your vision plan, which pays faster."
        : "Noted. I'll flag it for medical review so it routes to the right desk.",
  },
  {
    id: "paid",
    field: "payment",
    q: "Last thing. Did you pay the full $618 yourself at the desk?",
    chips: [
      { label: "Yes, paid in full", v: "Paid in full by member" },
      { label: "Only part of it", v: "Partial payment" },
    ],
    ack: () => "That's everything. Building your estimate now.",
  },
];

const money = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, llm: openai ? "openai" : "scripted" });
});

/** LLM chat — processes a copilot answer and returns the next bot message. */
app.post("/api/chat", async (req, res) => {
  try {
    const { message, questionIndex = 0, answers = {}, history = [], memberId } = req.body ?? {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const q = QUESTIONS[questionIndex];
    if (!q) {
      return res.json({
        reply: "You're all set — no more questions from me.",
        nextQuestionIndex: QUESTIONS.length,
        done: true,
      });
    }

    const nextAnswers = { ...answers, [q.id]: message };
    const claimDetailUpdates = { [q.field]: message };

    if (openai) {
      const llmReply = await chatWithOpenAI({ message, q, history, memberId, nextAnswers });
      const nextIndex = questionIndex + 1;
      const done = nextIndex >= QUESTIONS.length;

      return res.json({
        reply: llmReply,
        fieldUpdates: { [q.id]: message },
        claimDetailUpdates,
        nextQuestionIndex: nextIndex,
        done,
        completionMessage: done
          ? `Your claim is complete and error-checked. Estimated reimbursement is ${money(PAYOUT)}. Send it whenever you're ready.`
          : undefined,
        nextQuestion: done ? undefined : { id: QUESTIONS[nextIndex].id, q: QUESTIONS[nextIndex].q, chips: QUESTIONS[nextIndex].chips },
      });
    }

    const nextIndex = questionIndex + 1;
    const done = nextIndex >= QUESTIONS.length;

    res.json({
      reply: q.ack(message),
      fieldUpdates: { [q.id]: message },
      claimDetailUpdates,
      nextQuestionIndex: nextIndex,
      done,
      completionMessage: done
        ? `Your claim is complete and error-checked. Estimated reimbursement is ${money(PAYOUT)}. Send it whenever you're ready.`
        : undefined,
      nextQuestion: done ? undefined : { id: QUESTIONS[nextIndex].id, q: QUESTIONS[nextIndex].q, chips: QUESTIONS[nextIndex].chips },
    });
  } catch (err) {
    console.error("POST /api/chat failed:", err);
    res.status(500).json({ error: err.message || "Chat failed" });
  }
});

async function chatWithOpenAI({ message, q, history, memberId, nextAnswers }) {
  const system = `You are Vision Claim Copilot, a friendly VSP out-of-network claims assistant.
The member just answered a clarifying question about their receipt claim.
Question asked: "${q.q}"
Their answer: "${message}"
Member ID: ${memberId || "unknown"}
Answers so far: ${JSON.stringify(nextAnswers)}

Reply in 1-2 short, warm sentences acknowledging their answer and what you did with it.
Do not ask the next question — the UI handles that separately.`;

  const messages = [
    { role: "system", content: system },
    ...history
      .filter((m) => m.role === "bot" || m.role === "me")
      .slice(-8)
      .map((m) => ({ role: m.role === "me" ? "user" : "assistant", content: m.text })),
    { role: "user", content: message },
  ];

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages,
    max_tokens: 120,
    temperature: 0.4,
  });

  return completion.choices[0]?.message?.content?.trim() || q.ack(message);
}

app.listen(PORT, () => {
  console.log(`Vision Claim Copilot API on http://localhost:${PORT}`);
  console.log(`LLM mode: ${openai ? "OpenAI (" + (process.env.OPENAI_MODEL || "gpt-4o-mini") + ")" : "scripted (set OPENAI_API_KEY for live LLM)"}`);
});
