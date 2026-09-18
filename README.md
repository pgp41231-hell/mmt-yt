# Myra Trip Companion Demo

Interactive prototype of an AI-assisted MakeMyTrip journey that converts a Thailand travel reel into a verified, budget-aware and booking-ready trip.

## Demo flow

- Fixed Thailand reel inspiration
- Intent extraction and confirmation
- Verified day-by-day itinerary
- Full trip budget and optimisation
- Booking handoff and Travel Mode
- Trip-aware AI conversation through Groq, with a deterministic presentation fallback

## Local setup

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and provide a Groq API key to enable live AI responses:

```text
GROQ_API_KEY=your_key
GROQ_MODEL=openai/gpt-oss-120b
```

Without a key, the interface uses a safe scripted response so the demo remains presentation-ready.

## Production build

```bash
npm run build
```

The repository includes `vercel.json` so Vercel uses the native Next.js build
instead of the Cloudflare Sites build. This produces the `.next` deployment
manifests required by Vercel while preserving the Sites workflow locally.
