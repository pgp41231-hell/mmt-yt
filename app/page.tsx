"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Bot, CalendarDays, Check, ChevronRight, CircleAlert, Compass,
  IndianRupee, LoaderCircle, MapPin, MessageCircle, MoreHorizontal, Plane,
  Play, Send, ShieldCheck, Sparkles, TicketCheck, Users, WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const POSTER = "https://images.unsplash.com/photo-1494949360228-4e9bde560065?auto=format&fit=crop&w=1100&q=88";
type Stage = "inspiration" | "intent" | "plan";
type ChatMessage = { role: "user" | "assistant"; content: string };

const itinerary = [
  { day: "Day 1", date: "Sat, 8 Nov", title: "Bangkok, slow and cinematic", note: "Check in, Wat Arun at golden hour, Chinatown food walk", price: "₹5,400", status: "Verified", tone: "verified" },
  { day: "Day 2", date: "Sun, 9 Nov", title: "Old city to rooftop lights", note: "Grand Palace, canal boat, free afternoon, sunset rooftop", price: "₹7,150", status: "1 check needed", tone: "check" },
  { day: "Day 3", date: "Mon, 10 Nov", title: "Fly south to Krabi", note: "Morning flight, Railay transfer, beach evening", price: "₹8,900", status: "Verified", tone: "verified" },
  { day: "Day 4", date: "Tue, 11 Nov", title: "Four Islands, without the rush", note: "Early long-tail boat, snorkelling, Ao Nang night market", price: "₹6,200", status: "Weather check", tone: "check" },
];

const fallbackReply = "Yes — I’d move the rooftop to Day 1 and keep Day 2 flexible. That protects the Grand Palace opening window and saves roughly ₹900 in cross-city transfers.";

export default function Home() {
  const [stage, setStage] = useState<Stage>("inspiration");
  const [activeTab, setActiveTab] = useState("plan");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [optimised, setOptimised] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: "Send me the trip you’re thinking about. I’ll turn it into a realistic plan and show what needs checking." }]);

  const progress = stage === "inspiration" ? 18 : stage === "intent" ? 48 : 82;
  const budget = optimised ? 52200 : 56850;
  const stageTitle = useMemo(() => stage === "inspiration" ? "A Thailand reel is ready" : stage === "intent" ? "First, check what I understood" : "Your Thailand plan is taking shape", [stage]);

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => Promise<object> }, options: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "start_thailand_trip_demo",
      title: "Start Thailand trip demo",
      description: "Move the visible Myra interface from inspiration to intent confirmation for the fixed Thailand reel.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute() { setStage("intent"); return { stage: "intent_confirmation", destination: "Thailand" }; },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  function startJourney() {
    setStage("intent");
    setMessages((current) => [...current, { role: "user", content: "Plan this Thailand reel for me" }, { role: "assistant", content: "I found Bangkok, Krabi and an island day. I’ve filled the gaps with sensible assumptions — confirm them before I verify the plan." }]);
  }

  function confirmIntent() {
    setStage("plan");
    setMessages((current) => [...current, { role: "user", content: "That looks right. Build my trip." }, { role: "assistant", content: "Done. I’ve kept the pace balanced, protected the beach time, and marked anything that still depends on live inventory or weather." }]);
  }

  async function askMyra() {
    const question = prompt.trim();
    if (!question || loading) return;
    setPrompt(""); setLoading(true);
    setMessages((current) => [...current, { role: "user", content: question }]);
    try {
      const response = await fetch("/api/myra", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, budget, stage, itinerary }) });
      const data = (await response.json()) as { answer?: string };
      setMessages((current) => [...current, { role: "assistant", content: data.answer || fallbackReply }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: fallbackReply }]);
    } finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-[#eff4f8] text-[#17243d]">
      <header className="sticky top-0 z-40 border-b border-[#dbe3eb] bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#155eef] text-white shadow-[0_8px_24px_rgba(21,94,239,.22)]"><Compass className="size-5" /></div>
            <div><div className="flex items-baseline gap-2"><span className="text-[1.18rem] font-bold tracking-[-0.03em]">myra</span><span className="hidden text-sm font-medium text-[#5d6b82] sm:inline">trip companion</span></div><p className="text-xs text-[#7d8aa0]">Thailand demo trip</p></div>
          </div>
          <div className="hidden items-center gap-3 md:flex"><span className="rounded-full bg-[#ebf8f1] px-3 py-1.5 text-sm font-semibold text-[#16734b]">Demo mode</span><button className="grid size-9 place-items-center rounded-full border border-[#dbe3eb] bg-white text-[#5d6b82]" aria-label="More options"><MoreHorizontal className="size-4" /></button></div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 lg:grid-cols-[300px_minmax(0,1fr)_360px] sm:px-7">
        <aside className="order-2 space-y-4 lg:order-none lg:sticky lg:top-[92px] lg:h-[calc(100vh-112px)]">
          <section className="overflow-hidden rounded-[28px] bg-[#111a2e] p-3 shadow-[0_20px_60px_rgba(28,42,70,.18)]">
            <div className="relative aspect-[9/14] overflow-hidden rounded-[20px] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg,rgba(5,12,26,.04),rgba(5,12,26,.58)),url(${POSTER})` }} role="img" aria-label="Thailand coastal reel preview with a long-tail boat">
              <div className="absolute left-3 right-3 top-3 flex items-center justify-between text-white"><span className="rounded-full bg-black/35 px-2.5 py-1 text-xs font-semibold backdrop-blur">REEL · 0:18</span><span className="rounded-full bg-black/35 px-2.5 py-1 text-xs backdrop-blur">@roamwithmaya</span></div>
              <button className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/20 text-white shadow-xl backdrop-blur-md transition hover:scale-105 hover:bg-white/30" aria-label="Play reel preview"><Play className="ml-1 size-7 fill-white" /></button>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white"><p className="text-lg font-bold leading-tight">Bangkok → Krabi in 6 days</p><p className="mt-1 text-sm text-white/80">temples, street food & island mornings</p><div className="mt-3 h-1 overflow-hidden rounded-full bg-white/35"><span className="block h-full w-[44%] rounded-full bg-white" /></div></div>
            </div>
            <div className="flex items-center gap-2 px-2 pb-1 pt-3 text-sm text-white/70"><Sparkles className="size-4 text-[#5eead4]" /><span>Fixed inspiration source</span></div>
          </section>

          <section className="rounded-[24px] border border-[#dbe3eb] bg-white p-4">
            <div className="mb-3 flex items-center justify-between text-sm"><span className="font-semibold">Trip readiness</span><span className="text-[#5d6b82]">{progress}%</span></div>
            <Progress value={progress} className="h-1.5 bg-[#e8eef5] [&_[data-slot=progress-indicator]]:bg-[#155eef]" />
            <div className="mt-4 space-y-3">
              {[["Inspiration", true], ["Intent", stage !== "inspiration"], ["Verified plan", stage === "plan"], ["Booking ready", false]].map(([label, done], index) => (
                <div className="flex items-center gap-3 text-sm" key={String(label)}><span className={`grid size-6 place-items-center rounded-full ${done ? "bg-[#155eef] text-white" : "bg-[#edf1f6] text-[#8a96a8]"}`}>{done ? <Check className="size-3.5" /> : index + 1}</span><span className={done ? "font-semibold text-[#26334b]" : "text-[#7d8aa0]"}>{label}</span></div>
              ))}
            </div>
          </section>
        </aside>

        <section className="order-1 min-w-0 space-y-4 lg:order-none">
          <div className="rounded-[28px] border border-[#dbe3eb] bg-white p-5 shadow-[0_10px_40px_rgba(54,76,110,.06)] sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div><p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#155eef]"><WandSparkles className="size-4" /> Myra is working from your reel</p><h1 className="max-w-2xl text-[clamp(1.8rem,3vw,2.6rem)] font-bold leading-[1.06] tracking-[-0.045em] text-[#14213a]">{stageTitle}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-[#607087]">{stage === "inspiration" && "I’ll extract the places, check what is realistic, and build a budget-aware route you can actually book."}{stage === "intent" && "I found a two-city Thailand trip. These details control feasibility, price and pace — edit anything before I continue."}{stage === "plan" && "The route fits your dates and target pace. Live inventory is simulated for this demo; uncertainty stays visible."}</p></div>
              {stage === "plan" && <div className="shrink-0 rounded-2xl bg-[#eef5ff] px-4 py-3 text-right"><p className="text-xs font-semibold uppercase tracking-[.08em] text-[#627692]">Estimated total</p><p className="mt-1 text-2xl font-bold tracking-[-0.04em]">₹{budget.toLocaleString("en-IN")}</p><p className="text-xs text-[#607087]">per person · incl. buffer</p></div>}
            </div>

            {stage === "inspiration" && <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button onClick={startJourney} size="lg" className="h-12 rounded-xl bg-[#155eef] px-6 text-base hover:bg-[#0f4fd6]">Turn this reel into a trip <ArrowRight /></Button><Button variant="outline" size="lg" className="h-12 rounded-xl border-[#ced8e5] px-5 text-base">Replace inspiration</Button></div>}

            {stage === "intent" && <div className="mt-7">
              <div className="grid gap-3 sm:grid-cols-2">
                {[[MapPin, "Route", "Delhi → Bangkok → Krabi"], [CalendarDays, "Dates", "8–13 November · 5 nights"], [Users, "Travellers", "2 adults"], [IndianRupee, "Target budget", "₹55,000 per person"]].map(([Icon, label, value]) => { const ItemIcon = Icon as typeof MapPin; return <button key={String(label)} className="group flex items-center gap-3 rounded-2xl border border-[#dbe3eb] bg-[#fbfcfe] p-4 text-left transition hover:border-[#98b8f9] hover:bg-[#f6f9ff]"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#155eef] shadow-sm"><ItemIcon className="size-4.5" /></span><span className="min-w-0"><span className="block text-xs font-semibold uppercase tracking-[.07em] text-[#7a879b]">{label as string}</span><span className="mt-0.5 block truncate text-[15px] font-semibold text-[#25334a]">{value as string}</span></span><ChevronRight className="ml-auto size-4 text-[#9ba6b6] transition group-hover:translate-x-0.5" /></button>; })}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">{["Balanced pace", "Street food", "Beaches", "Good nightlife", "Vegetarian-friendly"].map((chip) => <span key={chip} className="rounded-full border border-[#dbe3eb] bg-white px-3 py-1.5 text-sm font-medium text-[#4f5f75]">{chip}</span>)}</div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button onClick={confirmIntent} size="lg" className="h-12 rounded-xl bg-[#155eef] px-6 text-base hover:bg-[#0f4fd6]">Confirm & build my trip <Sparkles /></Button><Button variant="ghost" size="lg" onClick={() => setStage("inspiration")} className="h-12 rounded-xl px-5 text-base text-[#526078]">Back</Button></div>
            </div>}

            {stage === "plan" && <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-7">
              <TabsList variant="line" className="w-full justify-start gap-5 overflow-x-auto border-b border-[#e3e8ef] pb-0">{[["plan", "Plan"], ["budget", "Budget"], ["book", "Book"], ["travel", "Travel mode"]].map(([value, label]) => <TabsTrigger key={value} value={value} className="h-11 flex-none px-1 text-[15px]">{label}</TabsTrigger>)}</TabsList>
              <TabsContent value="plan" className="pt-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm text-[#5f6d80]"><ShieldCheck className="size-4 text-[#138454]" /> 9 items verified · 2 need a check</div><Button variant="outline" size="sm" className="rounded-lg border-[#d3dce7]">Edit trip</Button></div>
                <div className="space-y-3">{itinerary.map((item) => <article key={item.day} className="group grid gap-3 rounded-2xl border border-[#dfe6ee] bg-[#fbfcfe] p-4 transition hover:border-[#b7c9e4] sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center"><div><p className="text-sm font-bold text-[#155eef]">{item.day}</p><p className="mt-0.5 text-xs text-[#7b8799]">{item.date}</p></div><div className="min-w-0 sm:border-l sm:border-[#e1e7ef] sm:pl-4"><h3 className="font-bold tracking-[-0.015em] text-[#233149]">{item.title}</h3><p className="mt-1 text-sm leading-6 text-[#66758a]">{item.note}</p><span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${item.tone === "verified" ? "bg-[#e8f7ef] text-[#16734b]" : "bg-[#fff4db] text-[#9a6100]"}`}>{item.tone === "verified" ? <Check className="size-3" /> : <CircleAlert className="size-3" />}{item.status}</span></div><div className="flex items-center justify-between gap-4 sm:block sm:text-right"><p className="font-bold text-[#29364b]">{item.price}</p><button className="mt-1 text-xs font-semibold text-[#155eef]">View details</button></div></article>)}</div>
              </TabsContent>
              <TabsContent value="budget" className="pt-5">
                <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-[#13213b] p-5 text-white sm:col-span-2"><p className="text-sm text-white/65">Expected total · per person</p><div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><span className="text-4xl font-bold tracking-[-0.05em]">₹{budget.toLocaleString("en-IN")}</span><span className="ml-2 text-sm text-white/60">± ₹2,800</span></div><span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${optimised ? "bg-[#2dd4bf]/20 text-[#7eead9]" : "bg-[#ffcc66]/15 text-[#ffd57c]"}`}>{optimised ? "Within budget" : "₹1,850 over target"}</span></div></div>{[["Flights", "₹24,600", "LIVE"], ["Stays", "₹13,400", "LIVE"], ["Local travel", "₹6,250", "ESTIMATED"], ["Food + experiences", optimised ? "₹6,100" : "₹10,750", "ESTIMATED"]].map(([label, value, source]) => <div key={label} className="rounded-2xl border border-[#dfe6ee] p-4"><div className="flex items-center justify-between"><span className="text-sm text-[#69778b]">{label}</span><span className="rounded bg-[#edf2f7] px-1.5 py-0.5 text-[10px] font-bold tracking-[.06em] text-[#68768a]">{source}</span></div><p className="mt-2 text-xl font-bold">{value}</p></div>)}</div>
                <Button onClick={() => setOptimised(true)} disabled={optimised} className="mt-5 h-11 rounded-xl bg-[#155eef] px-5 hover:bg-[#0f4fd6]"><WandSparkles /> {optimised ? "Plan optimised" : "Optimise under ₹55,000"}</Button>
              </TabsContent>
              <TabsContent value="book" className="pt-5"><div className="rounded-2xl border border-[#dfe6ee] bg-[#fbfcfe] p-5"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eaf2ff] text-[#155eef]"><TicketCheck /></span><div><h3 className="text-lg font-bold">3 components are booking-ready</h3><p className="mt-1 text-sm leading-6 text-[#66758a]">Return flights, Bangkok stay and Krabi stay. Prices will be rechecked before handoff.</p></div></div><div className="my-5 space-y-3 border-y border-[#e0e7ef] py-4 text-sm"><div className="flex justify-between"><span>Flights · DEL–BKK–KBV–DEL</span><strong>₹24,600</strong></div><div className="flex justify-between"><span>Hotels · 5 nights</span><strong>₹13,400</strong></div><div className="flex justify-between"><span>Selected total</span><strong>₹38,000</strong></div></div><Button className="h-11 rounded-xl bg-[#e84b53] px-5 hover:bg-[#d63f47]">Continue to checkout <ArrowRight /></Button></div></TabsContent>
              <TabsContent value="travel" className="pt-5"><div className="overflow-hidden rounded-[24px] bg-[#14213a] text-white"><div className="bg-[linear-gradient(120deg,#155eef,#14b8a6)] p-5"><p className="text-sm font-semibold text-white/80">Tuesday · Krabi · 7:15 AM</p><h3 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Four Islands morning</h3><p className="mt-1 text-sm text-white/75">Boat pickup in 45 minutes</p></div><div className="grid gap-3 p-4 sm:grid-cols-3">{[[Plane, "Pickup", "8:00 · Lobby"], [MapPin, "Meet", "Ao Nang pier"], [MessageCircle, "Phrase", "How much?"]].map(([Icon, label, value]) => { const CardIcon = Icon as typeof Plane; return <div key={String(label)} className="rounded-xl bg-white/8 p-3"><CardIcon className="size-4 text-[#5eead4]" /><p className="mt-3 text-xs text-white/50">{label as string}</p><p className="mt-1 text-sm font-semibold">{value as string}</p></div>; })}</div></div></TabsContent>
            </Tabs>}
          </div>
        </section>

        <aside className="order-3 flex min-h-[620px] flex-col overflow-hidden rounded-[28px] border border-[#dbe3eb] bg-white shadow-[0_10px_40px_rgba(54,76,110,.06)] lg:order-none lg:sticky lg:top-[92px] lg:h-[calc(100vh-112px)]">
          <div className="flex items-center gap-3 border-b border-[#e2e8f0] px-5 py-4"><span className="relative grid size-10 place-items-center rounded-xl bg-[#eaf2ff] text-[#155eef]"><Bot className="size-5" /><i className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-[#22a06b]" /></span><div><h2 className="font-bold tracking-[-0.02em]">Ask Myra</h2><p className="text-xs text-[#718096]">Trip-aware AI companion</p></div></div>
          <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-[15px] leading-6 ${message.role === "user" ? "rounded-br-md bg-[#155eef] text-white" : "rounded-bl-md bg-[#eef3f8] text-[#3d4a5f]"}`}>{message.content}</div></div>)}{loading && <div className="flex items-center gap-2 text-sm text-[#6d7a8e]"><LoaderCircle className="size-4 animate-spin" /> Myra is thinking…</div>}</div>
          <div className="border-t border-[#e2e8f0] p-3">{stage === "plan" && <div className="mb-2 flex gap-2 overflow-x-auto pb-1">{["Make it cheaper", "Is Day 2 realistic?", "Add vegetarian food"].map((suggestion) => <button key={suggestion} onClick={() => setPrompt(suggestion)} className="shrink-0 rounded-full border border-[#d8e0e9] bg-white px-3 py-1.5 text-xs font-semibold text-[#526178] hover:border-[#9db9ee]">{suggestion}</button>)}</div>}<div className="flex items-end gap-2 rounded-2xl border border-[#d5dee8] bg-[#fbfcfe] p-2 focus-within:border-[#7fa7f5] focus-within:ring-4 focus-within:ring-[#155eef]/8"><Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void askMyra(); } }} placeholder="Ask about this trip…" className="min-h-[48px] resize-none border-0 bg-transparent text-[15px] shadow-none focus-visible:ring-0" aria-label="Message Myra" /><Button onClick={() => void askMyra()} disabled={!prompt.trim() || loading} size="icon" className="size-10 shrink-0 rounded-xl bg-[#155eef] hover:bg-[#0f4fd6]" aria-label="Send message"><Send /></Button></div><p className="mt-2 text-center text-[11px] text-[#8b97a8]">AI suggestions · live prices and availability require verification</p></div>
        </aside>
      </div>
    </main>
  );
}
