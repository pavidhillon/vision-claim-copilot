# Vision Claim Copilot

Transforming vision claims from paperwork into a conversation.  

Upload a receipt, let AI extract the details, answer only the missing questions through an intelligent copilot, and submit your claim — eliminating tedious claim forms and simplifying the entire reimbursement process.


## View Live
Deployed at https://vision-claim-copilot.vercel.app/    (UiPath Log In required)


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

**Copilot chat (wired).** The review screen embeds the UiPath Conversational Agent:

```
https://cloud.uipath.com/uipathlabstraining/VSP_Hackathon_Intro_Lab_20260629/autopilotforeveryone_/conversational-agents/?agentId=138436&mode=embedded
```

Override with `VITE_UIPATH_AGENT_URL` in a `.env` file if the agent URL changes.

Users need a UiPath account with access to the agent (or anonymous auth configured in UiPath Admin).

Two more integration points in `src/App.jsx`, both marked `API HOOK`:

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
  body: JSON.stringify({ lines: LINES, claimDetails, memberId: MEMBER.id }),
});
```

Set `API_BASE` at the top of `App.jsx` to your Spring Boot host, and add
`@CrossOrigin(origins = "http://localhost:5173")` on the controller so the
browser lets the calls through during development.

## Demo data

`LINES`, `ALLOW`, `QUESTIONS`, and `MEMBER` at the top of `App.jsx` drive the whole
prototype. Amounts are illustrative, not real plan allowances.
