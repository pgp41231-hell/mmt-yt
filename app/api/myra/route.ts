import { NextResponse } from "next/server";

type MyraRequest = { question?: string; budget?: number; stage?: string; itinerary?: Array<{ day: string; title: string; note: string; status: string; price: string }> };
const demoAnswer = "I’d keep Bangkok compact and protect the early Krabi transfer. For the best trade-off, move the rooftop to Day 1 and keep Day 2 flexible — that should save about ₹900 in cross-city travel without cutting an experience.";

export async function POST(request: Request) {
  let input: MyraRequest;
  try { input = (await request.json()) as MyraRequest; } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const question = input.question?.trim();
  if (!question || question.length > 800) return NextResponse.json({ error: "Question must be between 1 and 800 characters" }, { status: 400 });
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ answer: demoAnswer, mode: "demo" });
  const tripContext = JSON.stringify({ route: "Delhi → Bangkok → Krabi", dates: "8–13 November", travellers: 2, targetBudgetPerPerson: 55000, currentEstimatedBudgetPerPerson: input.budget, pace: "balanced", preferences: ["street food", "beaches", "nightlife", "vegetarian-friendly"], itinerary: input.itinerary });
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.GROQ_MODEL || "openai/gpt-oss-120b", temperature: 0.35, max_completion_tokens: 260, messages: [{ role: "system", content: "You are Myra, a concise India-first trip companion. Use only the supplied trip context. Clearly distinguish estimates from verified facts. Never claim live price, availability, safety, visa, weather, opening-hour or booking certainty. Give practical, specific advice in INR, usually in 2-4 short sentences. If asked to transact, explain that the user must confirm in checkout." }, { role: "system", content: `Trip context: ${tripContext}` }, { role: "user", content: question }] }) });
    if (!response.ok) return NextResponse.json({ answer: demoAnswer, mode: "fallback" });
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return NextResponse.json({ answer: data.choices?.[0]?.message?.content?.trim() || demoAnswer, mode: "groq" });
  } catch { return NextResponse.json({ answer: demoAnswer, mode: "fallback" }); }
}
