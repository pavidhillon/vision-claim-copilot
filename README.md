# Vision Claim Copilot

Out-of-network vision claims without the form. Upload a receipt, an agent reads it,
a copilot asks only about what it couldn't determine, and the claim is filed.

## Run it

You need Node 18 or newer. Check with `node -v`.

```bash
npm install
npm run dev
```

Open http://localhost:5173

`npm run dev` also prints a Network address — open that on your phone (same wifi)
to demo the mobile layout and the camera capture.

## Build for the demo

```bash
npm run build
npm run preview
```

The `dist/` folder is a static site. It drops straight onto Vercel, Netlify, or
GitHub Pages if you want a live link on the submission form.

## Where things are

```
src/App.jsx      everything — screens, styles, mock data
src/main.jsx     React entry point
index.html       page shell
```

`App.jsx` is one file on purpose so the whole team can work fast without
hunting through a component tree. Sections are commented.

## Connecting the backend

Two places, both marked `API HOOK` in `src/App.jsx`.

**1. Parse the receipt.** Replace the `setInterval` inside the pipeline effect:

```js
const form = new FormData();
form.append("file", uploadedFile);
const res = await fetch(`${API_BASE}/claims/parse`, { method: "POST", body: form });
const parsed = await res.json();
```

Have the UiPath agent return line items plus a list of fields it is unsure about.
Map those unsure fields into the `QUESTIONS` array shape and the copilot chat
builds itself — no UI changes needed.

**2. Submit the claim.** Replace the body of `submit()`:

```js
await fetch(`${API_BASE}/claims`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ lines: LINES, answers, memberId: MEMBER.id }),
});
```

Set `API_BASE` at the top of `App.jsx` to your Spring Boot host, and add
`@CrossOrigin(origins = "http://localhost:5173")` on the controller so the
browser lets the calls through during development.

## Demo data

`LINES`, `ALLOW`, `QUESTIONS`, and `MEMBER` at the top of `App.jsx` drive the whole
prototype. Amounts are illustrative, not real plan allowances.
