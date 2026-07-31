import { useState, useRef, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------
   VISION CLAIM COPILOT — web app prototype
   Responsive: two-column workspace on desktop, single column on mobile.
   Wire to Spring Boot by replacing the two spots marked "API HOOK".
-------------------------------------------------------------------*/

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

const UIPATH_AGENT_URL =
  import.meta.env.VITE_UIPATH_AGENT_URL ??
  "https://cloud.uipath.com/uipathlabstraining/VSP_Hackathon_Intro_Lab_20260629/autopilotforeveryone_/conversational-agents/?agentId=138436&mode=embedded";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

.vc, .vc *, .vc *::before, .vc *::after { box-sizing:border-box; }
.vc {
  --ink:#101820; --slate:#5A6B7B; --mute:#8B99A5;
  --bg:#F1F4F3; --card:#FFFFFF; --line:#DDE3E2;
  --lens:#0E7A6E; --lens-soft:#E2F1EE;
  --agent:#4B45C6; --agent-soft:#EDECFB;
  --amber:#A96A0C; --amber-soft:#FBEEDA;
  --r:16px;
  font-family:'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif;
  color:var(--ink); background:var(--bg); min-height:100vh;
  font-size:15px; line-height:1.45;
}
.vc .wrap { max-width:1120px; margin:0 auto; padding:0 24px; width:100%; }
@media (max-width:640px){ .vc .wrap { padding:0 16px; } }

/* ---------- type ---------- */
.vc h1 { font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:clamp(32px,5vw,54px);
  line-height:1.0; letter-spacing:-.035em; margin:0; }
.vc h2 { font-family:'Bricolage Grotesque',sans-serif; font-weight:700; font-size:20px;
  letter-spacing:-.02em; margin:0; }
.vc h3 { font-size:14px; font-weight:700; margin:0; letter-spacing:-.01em; }
.vc .eyebrow { font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.2em;
  text-transform:uppercase; color:var(--lens); font-weight:500; }
.vc .sub { font-size:16px; line-height:1.55; color:var(--slate); margin:14px 0 0; max-width:44ch; }
.vc .stats { display:flex; gap:22px; margin-top:26px; flex-wrap:wrap; }
.vc .stat { text-align:center; min-width:0; }
.vc .stat-n { font-size:21px; font-weight:600; letter-spacing:-.02em; line-height:1.2; }
.vc .stat-l { margin-top:4px; }
.vc .mono { font-family:'IBM Plex Mono',monospace; font-variant-numeric:tabular-nums; }
.vc .k { font-size:12.5px; color:var(--mute); }
.vc .v { font-size:14px; font-weight:600; }

/* ---------- app bar ---------- */
.vc .bar { background:#fff; border-bottom:1px solid var(--line); position:sticky; top:0; z-index:20; }
.vc .bar .wrap { display:flex; align-items:center; justify-content:space-between; height:62px; gap:16px; }
.vc .mark { display:flex; align-items:center; gap:9px; font-weight:700; font-size:15px; letter-spacing:-.015em; }
.vc .iris { width:22px; height:22px; border-radius:50%; border:2.5px solid var(--ink); display:grid; place-items:center; }
.vc .iris i { width:6px; height:6px; border-radius:50%; background:var(--lens); display:block; }
.vc .stepper { display:flex; gap:20px; list-style:none; margin:0; padding:0; }
.vc .stepper li { display:flex; align-items:center; gap:7px; font-size:12.5px; color:var(--mute); font-weight:500; }
.vc .stepper .n { width:20px; height:20px; border-radius:50%; border:1.5px solid #CFD8D7;
  display:grid; place-items:center; font-family:'IBM Plex Mono',monospace; font-size:10px; }
.vc .stepper li.on { color:var(--ink); font-weight:600; }
.vc .stepper li.on .n { background:var(--ink); border-color:var(--ink); color:#fff; }
.vc .stepper li.past .n { background:var(--lens); border-color:var(--lens); color:#fff; }
.vc .acct { font-size:12.5px; color:var(--slate); display:flex; align-items:center; gap:8px; }
.vc .av { width:28px; height:28px; border-radius:50%; background:var(--agent-soft); color:var(--agent);
  display:grid; place-items:center; font-size:11px; font-weight:700; }
@media (max-width:860px){ .vc .stepper { display:none; } .vc .acct span { display:none; } }

/* mobile progress bars */
.vc .mbars { display:none; gap:5px; padding:12px 16px 0; }
.vc .mbars span { height:3px; flex:1; border-radius:2px; background:#D9E0DF; }
.vc .mbars span.on { background:var(--ink); }
@media (max-width:860px){ .vc .mbars { display:flex; } }

/* ---------- layout ---------- */
.vc .page { padding:34px 0 70px; }
.vc .grid { display:grid; grid-template-columns:minmax(0,1fr) 396px; gap:26px; align-items:start; }
.vc .hero { display:grid; grid-template-columns:1.02fr .98fr; gap:46px; align-items:center; padding:20px 0 8px; }
@media (max-width:900px){
  .vc .grid, .vc .hero { grid-template-columns:minmax(0,1fr); gap:22px; }
  .vc .page { padding:20px 0 40px; }
}
@media (max-width:640px){
  .vc .hero-copy { text-align:center; }
  .vc .hero-copy .sub { margin-left:auto; margin-right:auto; }
  .vc .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px 10px; width:100%; margin-top:22px; }
  .vc .stat-n { font-size:19px; }
  .vc .drop { padding:22px 16px 18px; border-radius:18px; }
  .vc .btn { padding:15px 16px; min-height:48px; }
  .vc .payout .big { font-size:38px; }
  .vc .card { padding:16px; }
  .vc .chip { padding:10px 14px; min-height:44px; }
  .vc .field-edit input { max-width:none; }
  .vc .field-val { flex-wrap:wrap; }
}
.vc .side { position:sticky; top:86px; }
@media (max-width:900px){ .vc .side { position:static; } }

/* ---------- cards ---------- */
.vc .card { background:var(--card); border:1px solid var(--line); border-radius:var(--r); padding:18px; }
.vc .card + .card { margin-top:14px; }
.vc .row { display:flex; justify-content:space-between; gap:12px; align-items:baseline; }
.vc .field { align-items:center; padding:8px 0; }
.vc .field-val { display:flex; align-items:center; gap:6px; justify-content:flex-end; text-align:right; flex:1; min-width:0; }
.vc .field-edit { display:flex; gap:6px; align-items:center; flex:1; min-width:0; justify-content:flex-end; }
.vc .field-edit input { flex:1; min-width:0; max-width:240px; border:1px solid var(--line); border-radius:8px;
  padding:7px 10px; font-family:inherit; font-size:14px; font-weight:600; color:var(--ink); background:#fff; }
.vc .field-edit input:focus { outline:2px solid var(--agent); outline-offset:1px; }
.vc .field-save { border:0; background:var(--ink); color:#fff; border-radius:8px; padding:7px 11px;
  font-family:inherit; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap; flex-shrink:0; }
.vc .editbtn { border:0; background:transparent; color:var(--mute); cursor:pointer; padding:5px;
  border-radius:7px; display:grid; place-items:center; flex-shrink:0; line-height:0; }
.vc .editbtn:hover { color:var(--agent); background:var(--agent-soft); }
.vc .cardhead { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }

/* ---------- drop zone ---------- */
.vc .drop {
  background:#fff; border:1px solid var(--line); border-radius:22px; padding:30px 24px 22px;
  position:relative; transition:border-color .18s, box-shadow .18s, transform .18s;
}
.vc .drop.over { border-color:var(--lens); box-shadow:0 0 0 4px var(--lens-soft); transform:translateY(-2px); }
.vc .brackets { position:absolute; inset:12px; pointer-events:none; }
.vc .brackets i { position:absolute; width:24px; height:24px; border:2px solid var(--lens); opacity:.5; }
.vc .brackets i:nth-child(1){ top:0; left:0; border-right:0; border-bottom:0; border-radius:7px 0 0 0; }
.vc .brackets i:nth-child(2){ top:0; right:0; border-left:0; border-bottom:0; border-radius:0 7px 0 0; }
.vc .brackets i:nth-child(3){ bottom:0; left:0; border-right:0; border-top:0; border-radius:0 0 0 7px; }
.vc .brackets i:nth-child(4){ bottom:0; right:0; border-left:0; border-top:0; border-radius:0 0 7px 0; }

/* ---------- buttons ---------- */
.vc .btn { border:0; border-radius:13px; font-family:inherit; font-size:15px; font-weight:600;
  padding:14px 18px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; }
.vc .btn.primary { background:var(--ink); color:#fff; width:100%; }
.vc .btn.go { background:var(--lens); color:#fff; width:100%; font-size:16px; font-weight:700; padding:16px; }
.vc .btn.go[disabled] { background:#C4CFCD; cursor:not-allowed; }
.vc .btn.line { background:#fff; border:1px solid var(--line); color:var(--ink); width:100%; margin-top:10px; text-align:center; }
.vc .btn.sample { justify-content:center; }
.vc .btn:active { transform:translateY(1px); }
.vc .linkbtn { background:none; border:0; font-family:'IBM Plex Mono',monospace; font-size:11px;
  letter-spacing:.09em; text-transform:uppercase; color:var(--agent); cursor:pointer; padding:14px 0 0; width:100%; }

/* ---------- receipt ---------- */
.vc .receipt { background:#fff; border-radius:10px; padding:18px 16px; font-family:'IBM Plex Mono',monospace;
  font-size:11px; line-height:1.7; color:#2A3640; position:relative; box-shadow:0 6px 24px rgba(16,24,32,.10); }
.vc .receipt .hr { border-top:1px dashed #C9D2D1; margin:9px 0; }
.vc .receipt .rr { display:flex; justify-content:space-between; gap:10px; }
.vc .scanwrap { position:relative; border-radius:12px; overflow:hidden; }
.vc .sweep { position:absolute; left:0; right:0; height:150px; pointer-events:none;
  background:linear-gradient(180deg,rgba(14,122,110,0),rgba(14,122,110,.18) 55%,rgba(14,122,110,.85) 99%);
  animation:sweep 1.7s cubic-bezier(.5,0,.5,1) infinite; }
@keyframes sweep { 0%{ top:-150px } 100%{ top:100% } }
.vc .shot { width:100%; display:block; border-radius:12px; max-height:420px; object-fit:cover; }

/* ---------- pipeline ---------- */
.vc .pipe { list-style:none; margin:0; padding:0; }
.vc .pipe li { display:flex; gap:12px; align-items:flex-start; padding:9px 0; font-size:14px; color:var(--mute); }
.vc .pipe .dot { width:17px; height:17px; border-radius:50%; border:1.5px solid #CFD8D7; margin-top:2px;
  flex:0 0 auto; display:grid; place-items:center; font-size:9px; color:#fff; }
.vc .pipe li.done { color:var(--ink); }
.vc .pipe li.done .dot { background:var(--lens); border-color:var(--lens); }
.vc .pipe li.live { color:var(--ink); font-weight:600; }
.vc .pipe li.live .dot { border-color:var(--agent); border-right-color:transparent; animation:spin .8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg) } }
.vc .pipe small { display:block; font-weight:400; font-size:11.5px; color:var(--mute);
  font-family:'IBM Plex Mono',monospace; margin-top:2px; }

/* ---------- focus pull (signature) ---------- */
.vc .resolve { animation:focuspull .55s cubic-bezier(.2,.7,.3,1) both; }
@keyframes focuspull { from{ filter:blur(7px); opacity:0; letter-spacing:.06em } to{ filter:blur(0); opacity:1; letter-spacing:normal } }

/* ---------- pills ---------- */
.vc .pill { display:inline-flex; align-items:center; gap:5px; font-family:'IBM Plex Mono',monospace;
  font-size:10px; letter-spacing:.09em; text-transform:uppercase; padding:4px 8px; border-radius:6px; white-space:nowrap; }
.vc .pill.ok { background:var(--lens-soft); color:var(--lens); }
.vc .pill.need { background:var(--amber-soft); color:var(--amber); }
.vc .pill.ai { background:var(--agent-soft); color:var(--agent); }

/* ---------- chat ---------- */
.vc .panel { background:#fff; border:1px solid var(--line); border-radius:var(--r); overflow:hidden; display:flex; flex-direction:column; }
.vc .panel .ph { padding:15px 18px; border-bottom:1px solid var(--line); display:flex;
  justify-content:space-between; align-items:center; background:#fff; }
.vc .thread { display:flex; flex-direction:column; gap:10px; padding:18px; overflow-y:auto; max-height:46vh; }
@media (max-width:900px){ .vc .thread { max-height:none; } }
.vc .msg { max-width:88%; font-size:14px; line-height:1.5; padding:11px 14px; border-radius:16px; }
.vc .msg.bot { background:var(--bg); border-bottom-left-radius:5px; align-self:flex-start; }
.vc .msg.me { background:var(--ink); color:#fff; border-bottom-right-radius:5px; align-self:flex-end; }
.vc .msg.note { background:var(--agent-soft); border:1px solid #DCDAF7; color:#332F8A; font-size:13px;
  align-self:stretch; max-width:100%; border-radius:12px; }
.vc .chips { display:flex; flex-wrap:wrap; gap:8px; padding:0 18px 4px; }
.vc .chip { border:1.5px solid var(--ink); background:#fff; border-radius:999px; padding:9px 14px;
  font-family:inherit; font-size:13.5px; font-weight:600; cursor:pointer; color:var(--ink); }
.vc .chip:hover { background:var(--ink); color:#fff; }
.vc .typing { display:flex; gap:4px; align-items:center; padding:13px 15px; }
.vc .typing i { width:6px; height:6px; border-radius:50%; background:#B6C2C1; animation:blink 1.1s infinite; }
.vc .typing i:nth-child(2){ animation-delay:.18s } .vc .typing i:nth-child(3){ animation-delay:.36s }
@keyframes blink { 0%,60%,100%{ opacity:.28 } 30%{ opacity:1 } }
.vc .composer { display:flex; gap:8px; padding:14px 18px; border-top:1px solid var(--line); }
.vc .composer input { flex:1; border:1px solid var(--line); border-radius:11px; padding:11px;
  font-family:inherit; font-size:14px; background:#fff; color:var(--ink); min-width:0; }
.vc .composer input:focus { outline:2px solid var(--agent); outline-offset:1px; }
.vc .composer button { border:0; background:var(--ink); color:#fff; border-radius:11px; padding:0 16px;
  font-family:inherit; font-weight:600; cursor:pointer; }

/* ---------- UiPath agent embed ---------- */
.vc .agent-panel { min-height:560px; }
.vc .agent-frame { flex:1; min-height:520px; background:#fff; }
.vc .agent-frame iframe { width:100%; height:100%; min-height:520px; border:0; display:block; }
@media (max-width:900px){ .vc .agent-frame, .vc .agent-frame iframe { min-height:480px; } }

/* ---------- money ---------- */
.vc .line { display:flex; justify-content:space-between; gap:12px; padding:11px 0; border-bottom:1px solid #EDF1F0; font-size:14px; }
.vc .line:last-child { border-bottom:0; }
.vc .line .amt { font-family:'IBM Plex Mono',monospace; font-variant-numeric:tabular-nums; font-weight:500; }
.vc .line.excl > span:first-child { color:var(--mute); }
.vc .line.excl .amt { color:var(--mute); text-decoration:line-through; }
.vc .payout { background:var(--ink); color:#fff; border-radius:var(--r); padding:22px; }
.vc .payout .big { font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:46px;
  letter-spacing:-.04em; font-variant-numeric:tabular-nums; line-height:1; margin-top:6px; }
.vc .payout .k { color:#93A5A2; }
.vc .bar2 { height:5px; border-radius:3px; background:#E4EAE9; overflow:hidden; margin-top:10px; }
.vc .bar2 i { display:block; height:100%; background:var(--lens); border-radius:3px; }

/* ---------- tracker ---------- */
.vc .track { list-style:none; margin:0; padding:0; }
.vc .track li { display:flex; gap:14px; padding-bottom:18px; position:relative; }
.vc .track li:last-child { padding-bottom:0; }
.vc .track li:not(:last-child)::before { content:''; position:absolute; left:8px; top:19px; bottom:0; width:1.5px; background:#DCE3E2; }
.vc .track li.on:not(:last-child)::before { background:var(--lens); }
.vc .track .node { width:17px; height:17px; border-radius:50%; background:#fff; border:2px solid #D4DCDB; flex:0 0 auto; z-index:1; }
.vc .track li.on .node { border-color:var(--lens); background:var(--lens); }
.vc .track .t { font-size:14px; font-weight:600; }
.vc .track .d { font-size:12px; color:var(--mute); font-family:'IBM Plex Mono',monospace; }
.vc .track li:not(.on) .t { color:var(--mute); font-weight:500; }

.vc .nudge { background:linear-gradient(140deg,#15343A,#0E7A6E); color:#fff; border-radius:var(--r); padding:22px; }
.vc .nudge h2 { color:#fff; }
.vc .nudge p { font-size:14px; line-height:1.55; color:#C7E3DD; margin:10px 0 0; }
.vc .nudge button { margin-top:16px; width:100%; background:#fff; color:#0E4E48; border:0;
  border-radius:12px; padding:13px; font-family:inherit; font-weight:700; font-size:14.5px; cursor:pointer; }
.vc .save { font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8FCFC3; letter-spacing:.08em; }

.vc .claims { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:14px; margin-top:14px; }
.vc .foot { text-align:center; color:var(--mute); font-size:12.5px; padding:34px 0 0; }
.vc button:focus-visible, .vc [tabindex]:focus-visible { outline:2.5px solid var(--agent); outline-offset:2px; }
@media (prefers-reduced-motion:reduce){ .vc *,.vc *::before,.vc *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; } }
`;

/* ---------------- demo data ---------------- */
const MEMBER = { name: "Maya Chen", initials: "MC", id: "VSP-8842-01" };

const LINES = [
  { d: "Comprehensive eye exam", c: 145, ok: true, why: "Covered · exam benefit" },
  { d: "Single-vision lenses + AR coating", c: 210, ok: true, why: "Covered · lens benefit" },
  { d: "Frame — Bellamy 47-21", c: 245, ok: true, why: "Covered · frame allowance" },
  { d: "Lens cleaning kit", c: 18, ok: false, why: "Not covered — left off the claim" },
];
const CHARGED = LINES.reduce((s, l) => s + l.c, 0);
const ELIGIBLE = LINES.filter((l) => l.ok).reduce((s, l) => s + l.c, 0);
const ALLOW = [
  { d: "Exam", a: 60 },
  { d: "Lenses", a: 80 },
  { d: "Frame", a: 120 },
];
const PAYOUT = ALLOW.reduce((s, a) => s + a.a, 0);

const DEFAULT_CLAIM = {
  provider: "Bayview Eye Care · NPI 1487203355",
  dateOfService: "July 24, 2026",
  patient: "",
  visitType: "",
  payment: "",
};

const CLAIM_FIELD = { patient: "patient", reason: "visitType", paid: "payment" };

const PIPELINE = [
  { t: "Reading the image", s: "OCR · 1,412 characters" },
  { t: "Identifying the provider", s: "Matched NPI 1487203355" },
  { t: "Itemizing services", s: "4 line items found" },
  { t: "Checking your plan", s: "Out-of-network · Choice" },
  { t: "Building your claim", s: "Ready for review" },
];

const QUESTIONS = [
  {
    id: "patient",
    q: "The receipt only says “M. Chen.” Who was seen?",
    chips: [
      { label: "Maya — that's me", v: "Maya Chen · member" },
      { label: "Marcus — son, 14", v: "Marcus Chen · dependent" },
    ],
    ack: (v) => `Set. Filing under ${v.split(" ·")[0]}.`,
  },
  {
    id: "reason",
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

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function ReceiptPaper() {
  return (
    <div className="receipt">
      <div style={{ textAlign: "center", fontWeight: 600, letterSpacing: ".12em" }}>BAYVIEW EYE CARE</div>
      <div style={{ textAlign: "center", color: "#7A8890" }}>
        1188 Alameda Ave, San Jose CA
        <br />
        (408) 555-0139 · NPI 1487203355
      </div>
      <div className="hr" />
      <div className="rr"><span>DATE</span><span>07/24/2026 4:12 PM</span></div>
      <div className="rr"><span>PATIENT</span><span>M. CHEN</span></div>
      <div className="hr" />
      {LINES.map((l) => (
        <div className="rr" key={l.d}>
          <span style={{ maxWidth: "64%" }}>{l.d.toUpperCase()}</span>
          <span>{l.c.toFixed(2)}</span>
        </div>
      ))}
      <div className="hr" />
      <div className="rr" style={{ fontWeight: 600 }}><span>TOTAL</span><span>{CHARGED.toFixed(2)}</span></div>
      <div className="rr"><span>VISA ****4471</span><span>APPROVED</span></div>
      <div className="hr" />
      <div style={{ textAlign: "center", color: "#7A8890" }}>THANK YOU — SEE YOU IN A YEAR</div>
    </div>
  );
}

/* ---------------- app ---------------- */
export default function VisionClaimCopilot() {
  const [screen, setScreen] = useState("home");
  const [photo, setPhoto] = useState(null);
  const [step, setStep] = useState(0);
  const [drag, setDrag] = useState(false);
  const [elapsed, setElapsed] = useState(null);
  const [claimDetails, setClaimDetails] = useState(DEFAULT_CLAIM);
  const startedAt = useRef(null);
  const fileRef = useRef(null);

  const go = useCallback(() => {
    startedAt.current = Date.now();
    setStep(0);
    setScreen("scan");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const pick = useCallback((f) => { setPhoto(URL.createObjectURL(f)); go(); }, [go]);

  /* paste a screenshot straight into the page */
  useEffect(() => {
    if (screen !== "home") return;
    const onPaste = (e) => {
      const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
      if (item) pick(item.getAsFile());
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [screen, pick]);

  /* agent pipeline */
  useEffect(() => {
    if (screen !== "scan") return;
    // API HOOK — swap for: fetch(`${API_BASE}/claims/parse`, { method:"POST", body: formData })
    const id = setInterval(() => setStep((s) => s + 1), 750);
    return () => clearInterval(id);
  }, [screen]);

  const startReview = useCallback(() => {
    setScreen("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (screen === "scan" && step > PIPELINE.length) {
      const t = setTimeout(startReview, 500);
      return () => clearTimeout(t);
    }
  }, [step, screen, startReview]);

  const submit = () => {
    // API HOOK — POST `${API_BASE}/claims` with { lines: LINES, claimDetails, memberId: MEMBER.id }
    setElapsed(Math.max(12, Math.round((Date.now() - (startedAt.current || Date.now())) / 1000)));
    setScreen("sent");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setScreen("home"); setPhoto(null); setStep(0);
    setElapsed(null); setClaimDetails(DEFAULT_CLAIM);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateClaimDetail = (key, val) => setClaimDetails((d) => ({ ...d, [key]: val }));

  const idx = { home: 0, scan: 0, review: 1, sent: 2 }[screen];

  return (
    <div className="vc">
      <style>{CSS}</style>

      <header className="bar">
        <div className="wrap">
          <div className="mark">
            <span className="iris"><i /></span>
            Vision Claim Copilot
          </div>
          <ol className="stepper">
            {["Capture", "Confirm", "Submit"].map((s, i) => (
              <li key={s} className={i === idx ? "on" : i < idx ? "past" : ""}>
                <span className="n">{i < idx ? "✓" : i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <div className="acct">
            <span>{MEMBER.name}</span>
            <span className="av">{MEMBER.initials}</span>
          </div>
        </div>
      </header>

      <div className="mbars">
        {[0, 1, 2].map((i) => <span key={i} className={i <= idx ? "on" : ""} />)}
      </div>

      <main className="wrap page">
        {screen === "home" && (
          <Home
            drag={drag} setDrag={setDrag} onSample={go} fileRef={fileRef}
            onBrowse={() => fileRef.current?.click()} onPicked={pick}
          />
        )}
        {screen === "scan" && <Scan photo={photo} step={step} onSkip={startReview} />}
        {screen === "review" && (
          <Review
            claimDetails={claimDetails}
            onUpdateClaimDetail={updateClaimDetail}
            onSubmit={submit}
          />
        )}
        {screen === "sent" && <Sent onNew={reset} elapsed={elapsed} />}

        <p className="foot">
          Prototype with sample data. Amounts shown are estimates, not a benefits determination.
        </p>
      </main>
    </div>
  );
}

/* ---------------- screens ---------------- */
function Home({ drag, setDrag, onSample, onBrowse, onPicked, fileRef }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Out-of-network claim</span>
          <h1 style={{ marginTop: 12 }}>
            Don't fill out
            <br />
            the form.
          </h1>
          <p className="sub">
            Drop in the receipt from your visit. I'll read it, pull out everything your plan needs,
            ask about anything I can't make out, and file the claim for you.
          </p>
          <div className="stats">
            {[["~50s", "average to file"], ["0", "fields to type"], ["5–7 days", "to reimbursement"]].map(
              ([n, l]) => (
                <div className="stat" key={l}>
                  <div className="mono stat-n">{n}</div>
                  <div className="k stat-l">{l}</div>
                </div>
              )
            )}
          </div>
        </div>

        <div
          className={"drop" + (drag ? " over" : "")}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault(); setDrag(false);
            const f = e.dataTransfer.files?.[0];
            if (f) onPicked(f);
          }}
        >
          <div className="brackets"><i /><i /><i /><i /></div>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--mute)", letterSpacing: ".14em" }}>
              RECEIPT · INVOICE · EOB
            </div>
            <div style={{ fontSize: 15, color: "var(--slate)", marginTop: 8 }}>
              {drag ? "Let go — I've got it." : "Drag a file here, paste a screenshot, or:"}
            </div>
          </div>
          <input
            ref={fileRef} type="file" accept="image/*,application/pdf"
            style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && onPicked(e.target.files[0])}
          />
          <button className="btn primary" onClick={onBrowse}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.4" />
            </svg>
            Take a photo or choose a file
          </button>
          <button className="btn line sample" onClick={onSample}>Use the sample receipt</button>
          <button className="linkbtn" onClick={onSample}>▸ Skip to the demo</button>
        </div>
      </section>

      <section style={{ marginTop: 44 }}>
        <div className="row">
          <h2>Claims in progress</h2>
          <span className="k">2 open</span>
        </div>
        <div className="claims">
          <div className="card">
            <div className="row">
              <div>
                <div className="v">Contacts · Marcus</div>
                <div className="k mono" style={{ marginTop: 3 }}>VC-4821 · filed Jul 21</div>
              </div>
              <span className="pill ai">In review</span>
            </div>
            <div className="bar2"><i style={{ width: "45%" }} /></div>
            <div className="k mono" style={{ marginTop: 8 }}>Day 2 of 5–7 · {money(88)} expected</div>
          </div>
          <div className="card">
            <div className="row">
              <div>
                <div className="v">Eye exam · Maya</div>
                <div className="k mono" style={{ marginTop: 3 }}>VC-4655 · filed Jun 30</div>
              </div>
              <span className="pill ok">Paid</span>
            </div>
            <div className="bar2"><i style={{ width: "100%" }} /></div>
            <div className="k mono" style={{ marginTop: 8 }}>Deposited Jul 8 · {money(60)}</div>
          </div>
        </div>
      </section>
    </>
  );
}

function Scan({ photo, step, onSkip }) {
  return (
    <div className="grid">
      <div>
        <span className="eyebrow">Reading</span>
        <h2 style={{ margin: "8px 0 18px", fontSize: 26 }}>Hold on — I'm going through it.</h2>
        <div className="scanwrap">
          {photo ? <img className="shot" src={photo} alt="Your receipt" /> : <ReceiptPaper />}
          {step <= PIPELINE.length && <div className="sweep" />}
        </div>
      </div>

      <aside className="side">
        <div className="card">
          <div className="cardhead">
            <h3>Agent</h3>
            <span className="pill ai">working</span>
          </div>
          <ul className="pipe">
            {PIPELINE.map((p, i) => (
              <li key={p.t} className={step > i ? "done" : step === i ? "live" : ""}>
                <span className="dot">{step > i ? "✓" : ""}</span>
                <span>
                  {p.t}
                  {step > i && <small className="resolve">{p.s}</small>}
                </span>
              </li>
            ))}
          </ul>
          <button className="linkbtn" style={{ textAlign: "left" }} onClick={onSkip}>Skip ahead ▸</button>
        </div>
      </aside>
    </div>
  );
}

function UiPathCopilot({ src }) {
  return (
    <div className="panel agent-panel">
      <div className="ph">
        <h3>Copilot</h3>
        <span className="pill ai">UiPath agent</span>
      </div>
      <div className="agent-frame">
        <iframe
          src={src}
          title="Vision Claim Copilot"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
}

function Review({ claimDetails, onUpdateClaimDetail, onSubmit }) {
  const providerName = claimDetails.provider.split(" · ")[0] || claimDetails.provider;

  return (
    <div className="grid">
      <div>
        <span className="eyebrow">Draft claim · VC-4907</span>
        <h2 style={{ margin: "8px 0 4px", fontSize: 26 }}>{providerName}</h2>
        <p className="k">{claimDetails.dateOfService} · San Jose, CA · out-of-network</p>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="cardhead">
            <h3>Claim details</h3>
            <span className="pill ok">read from receipt</span>
          </div>
          <Field label="Provider" value={claimDetails.provider} onChange={(v) => onUpdateClaimDetail("provider", v)} />
          <Field label="Date of service" value={claimDetails.dateOfService} onChange={(v) => onUpdateClaimDetail("dateOfService", v)} />
          <Field label="Patient" value={claimDetails.patient} pending="Who was seen?" onChange={(v) => onUpdateClaimDetail("patient", v)} />
          <Field label="Visit type" value={claimDetails.visitType} pending="Routine or medical?" onChange={(v) => onUpdateClaimDetail("visitType", v)} />
          <Field label="Payment" value={claimDetails.payment} pending="Who paid?" onChange={(v) => onUpdateClaimDetail("payment", v)} />
        </div>

        <div className="card">
          <div className="cardhead">
            <h3>What you were charged</h3>
            <span className="pill ai">4 items found</span>
          </div>
          {LINES.map((l) => (
            <div key={l.d} className={"line" + (l.ok ? "" : " excl")}>
              <span>
                {l.d}
                <br />
                <span className="mono" style={{ fontSize: 11, color: l.ok ? "var(--lens)" : "var(--mute)", display: "inline-block", marginTop: 3 }}>
                  {l.why}
                </span>
              </span>
              <span className="amt">{money(l.c)}</span>
            </div>
          ))}
          <div className="line" style={{ borderTop: "1px solid var(--line)", fontWeight: 700 }}>
            <span>Eligible charges</span>
            <span className="amt">{money(ELIGIBLE)}</span>
          </div>
        </div>

        <div className="payout resolve" style={{ marginTop: 14 }}>
          <div className="k">Estimated reimbursement</div>
          <div className="big">{money(PAYOUT)}</div>
          <div style={{ marginTop: 16, display: "grid", gap: 7 }}>
            {ALLOW.map((a) => (
              <div className="row" key={a.d} style={{ fontSize: 13 }}>
                <span style={{ color: "#93A5A2" }}>{a.d} allowance</span>
                <span className="mono">{money(a.a)}</span>
              </div>
            ))}
          </div>
          <p className="save" style={{ marginTop: 16, lineHeight: 1.5 }}>
            Paid by direct deposit, typically 5–7 days after approval.
          </p>
        </div>
      </div>

      <aside className="side">
        <UiPathCopilot src={UIPATH_AGENT_URL} />

        <button className="btn go" style={{ marginTop: 14 }} onClick={onSubmit}>
          {`Send claim · get ${money(PAYOUT)} back`}
        </button>
      </aside>
    </div>
  );
}

function Field({ label, value, pending, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEdit = () => {
    setDraft(value || "");
    setEditing(true);
  };

  const save = () => {
    const next = draft.trim();
    if (next) onChange(next);
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  return (
    <div className="row field">
      <span className="k">{label}</span>
      <div className="field-val">
        {editing ? (
          <div className="field-edit">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); save(); }
                if (e.key === "Escape") cancel();
              }}
              aria-label={`Edit ${label}`}
            />
            <button type="button" className="field-save" onClick={save}>Save</button>
          </div>
        ) : (
          <>
            {value ? <span className="v resolve">{value}</span> : pending ? <span className="pill need">{pending}</span> : null}
            <button type="button" className="editbtn" onClick={startEdit} aria-label={`Edit ${label}`}>
              <PencilIcon />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Sent({ onNew, elapsed }) {
  return (
    <>
      <div style={{ maxWidth: 620 }}>
        <span className="eyebrow">Sent · claim VC-4907</span>
        <h1 style={{ marginTop: 12, fontSize: "clamp(30px,4.4vw,46px)" }}>
          Filed in {elapsed ?? 48} seconds.
          <br />
          No form, no printer.
        </h1>
        <p className="sub">
          We'll text you at ···· 0182 the moment it's approved. There's nothing else for you to do.
        </p>
      </div>

      <div className="grid" style={{ marginTop: 30 }}>
        <div className="card">
          <div className="cardhead"><h3>Where your claim is</h3><span className="pill ai">2 of 4</span></div>
          <ul className="track">
            <li className="on"><span className="node" /><span><span className="t">Received</span><br /><span className="d">Today, 4:58 PM</span></span></li>
            <li className="on"><span className="node" /><span><span className="t">Documents checked</span><br /><span className="d">Complete — nothing missing</span></span></li>
            <li><span className="node" /><span><span className="t">Benefits review</span><br /><span className="d">Expected by Aug 1</span></span></li>
            <li><span className="node" /><span><span className="t">Paid — {money(PAYOUT)}</span><br /><span className="d">Direct deposit ····3390</span></span></li>
          </ul>
        </div>

        <aside className="side">
          <div className="nudge">
            <span className="save">BEFORE YOUR NEXT VISIT</span>
            <h2 style={{ marginTop: 8 }}>You paid {money(CHARGED - PAYOUT)} out of pocket.</h2>
            <p>
              Willow Optical is 1.2 miles away, carries the same frame brands, and is in your network.
              The same visit there runs about {money(95)} — and there's no claim to file at all.
            </p>
            <button onClick={onNew}>Find in-network doctors near me</button>
          </div>
          <button className="btn line" style={{ marginTop: 14 }} onClick={onNew}>Start another claim</button>
        </aside>
      </div>
    </>
  );
}
