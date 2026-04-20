# Prism

A Chrome extension that fact-checks what's on your screen in real time. Prism extracts the content of any web page or X/Twitter post, searches the web for corroborating and opposing sources, assigns a verifiability score, and lets you challenge the argument on demand.

---

## IMPORTANT SETUP INFORMATION

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A [Claude API key](https://console.anthropic.com/) (Anthropic)
- A [Brave Search API key](https://api.search.brave.com/)
- A [Supabase](https://supabase.com/) project (only needed if you use the report/sharing features)

---

### 1. Clone the repo

```bash
git clone https://github.com/acebonkowski/PRISM.git
cd PRISM
```

### 2. Add your API keys

Create a `.env.local` file in the root of the project:

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in your keys:

```
CLAUDE_API_KEY=your_anthropic_key_here
BRAVE_API_KEY=your_brave_search_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SECRET_KEY=your_supabase_secret_key_here
```

### 3. Build the extension

This injects your keys into the extension bundle:

```bash
node build.js
```

You'll see: `✅  extension/background.js built from .env.local`

Run this again any time you update `.env.local`.

### 4. Load the extension in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder

The Prism icon will appear in your toolbar. Click it on any article or X/Twitter post to start an analysis.

---

### Webapp (optional)

The `webapp/` directory contains a React frontend for viewing shared reports. To run it locally:

```bash
cd webapp
npm install
npm run dev
```

It reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_SECRET_KEY` from `.env.local` automatically.

---

## Security Note

`.env.local` and the built `extension/background.js` are both gitignored — your keys never touch the repository. Never commit either file.

---

## 
