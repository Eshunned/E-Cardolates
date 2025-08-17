"use client";
import { useEffect, useRef, useState } from "react";

const STAR_DENSITY_DIVISOR = 1000;
const STAR_CAP = 90000;
const GRAVITY_STRENGTH_NUM = 15;
const GRAVITY_STRENGTH_CAP = 0.2;
const DAMPING = 0.985;

export default function Page({
  initialTo = "",
  initialFrom = "",
  initialMessage = "Crazy bhai",
  readOnly = false,
  existingId = null,
} = {}) {
  const [to, setTo] = useState(initialTo);
  const [from, setFrom] = useState(initialFrom);
  const [message, setMessage] = useState(initialMessage);
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const captureRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (initialTo || initialFrom || initialMessage) return;
    const p = new URLSearchParams(window.location.search);
    p.get("to") && setTo(p.get("to"));
    p.get("from") && setFrom(p.get("from"));
    p.get("msg") && setMessage(p.get("msg"));
  }, [initialTo, initialFrom, initialMessage]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("to", to);
    url.searchParams.set("from", from);
    url.searchParams.set("msg", message);
    setShareUrl(url.toString());
  }, [to, from, message]);

  async function handleDownloadPng() {
    try {
      const { toPng } = await import("html-to-image");
      if (!captureRef.current) return;
      const clone = captureRef.current.cloneNode(true);
      clone.style.transform = "scaleX(-1)";
      clone.style.position = "fixed";
      clone.style.top = "-10000px";
      clone.style.left = "0";
      document.body.appendChild(clone);
      const dataUrl = await toPng(clone, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#070b12",
      });
      document.body.removeChild(clone);
      const a = document.createElement("a");
      a.download = "malhar-e-card.png";
      a.href = dataUrl;
      a.click();
    } catch {
      alert("Run once: npm i html-to-image");
    }
  }

  async function saveCard() {
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, from, message }),
    });
    if (!res.ok) return alert("Save failed");
    const card = await res.json();
    const url = `${window.location.origin}/card/${card.id}`;
    await navigator.clipboard.writeText(url);
    alert("Saved! Share link copied:\n" + url);
  }

  async function updateCard() {
    if (!existingId) return alert("No card ID");
    const res = await fetch(`/api/cards/${existingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, from, message }),
    });
    if (!res.ok) return alert("Update failed");
    alert("Updated");
  }

  return (
    <main className="root">
      <Starfield />

      <div className="wrap">
        <section className="controls">
          <h1 className="title">Malhar E-Cardolate</h1>
          <p className="hint">Aap message bhejo apne dost ko.</p>

          <label className="field">
            <span className="label">To</span>
            <input
              className="input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Receiver’s name"
              disabled={readOnly}
            />
          </label>

          <label className="field">
            <span className="label">Message</span>
            <textarea
              className="input textarea"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={readOnly}
            />
          </label>

          <label className="field">
            <span className="label">From</span>
            <input
              className="input"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Your name"
              disabled={readOnly}
            />
          </label>

          <div className="buttons">
            <button className="btn primary" onClick={() => setIsOpen((v) => !v)}>
              {isOpen ? "Close" : "Open"} card
            </button>
            <button className="btn" onClick={handleDownloadPng}>Download PNG</button>
            <button className="btn" onClick={() => navigator.clipboard.writeText(shareUrl)}>
              Copy share link
            </button>
            {!readOnly && !existingId && (
              <button className="btn" onClick={saveCard}>Save to cloud</button>
            )}
            {!readOnly && existingId && (
              <button className="btn" onClick={updateCard}>Update card</button>
            )}
          </div>
        </section>

        <section className="stage">
          <div ref={captureRef} className="captureArea">
            <div className="persp">
              <div
                ref={cardRef}
                className={`card ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen((v) => !v)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setIsOpen((v) => !v)}
                aria-pressed={isOpen}
                aria-label="Open or close card"
              >
                <div className="panel front">
                  <FrontCover />
                </div>
                <div className="panel back">
                  <InsideMessage to={to} from={from} message={message} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .root { min-height: 100svh; background:#070b12; color:#fff; position:relative; overflow:hidden; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
        .wrap { max-width:1200px; margin:0 auto; padding:40px 20px; display:grid; grid-template-columns:1fr; gap:32px; }
        @media (min-width:1024px){ .wrap{ grid-template-columns:1fr 1fr; } }
        .controls{ z-index:2; }
        .title{ font-size:28px; font-weight:600; margin:0 0 4px; }
        .hint{ opacity:.7; font-size:13px; margin-bottom:20px; }
        .field{ display:grid; gap:6px; margin:12px 0; }
        .label{ text-transform:uppercase; letter-spacing:.1em; font-size:11px; color:#f7c34d; }
        .input{ background:rgba(10,12,20,.6); border:1px solid rgba(255,200,120,.35); border-radius:12px; padding:10px 12px; color:#fff; outline:none; }
        .textarea{ min-height:120px; }
        .buttons{ display:flex; gap:10px; flex-wrap:wrap; margin-top:10px; }
        .btn{ background:#121521; border:1px solid #2b2f3f; color:#fff; border-radius:12px; padding:10px 14px; cursor:pointer; }
        .btn:hover{ background:#1a1f2f; }
        .primary{ background:#f7c34d; color:#1a1407; border-color:#f7c34d; }

        .stage{ display:flex; align-items:center; justify-content:center; }
        .captureArea{ display:inline-block; }
        .persp{ perspective:1600px; }
        .card{ position:relative; width:720px; max-width:92vw; height:460px; transform-style:preserve-3d; transform-origin:50% 50%; transition:transform .7s cubic-bezier(.22,.61,.36,1); cursor:pointer; }
        .card.open{ transform: rotateY(180deg); }
        .panel{ position:absolute; inset:0; border-radius:18px; overflow:hidden; backface-visibility:hidden; box-shadow:0 10px 40px rgba(0,0,0,.55); }
        .front{ border:1px solid rgba(247,195,77,.5); }
        .back{ transform: rotateY(180deg); border:1px solid rgba(247,195,77,.35); }
      `}</style>
    </main>
  );
}

function FrontCover() {
  return (
    <div className="cover">
      <div className="frame" />
      <div className="clipBlock">
        <img src="/malhar/Cloud.png" alt="cloud" className="wash" />
        <div className="center">
          <div className="stack">
            <img src="/malhar/Ring-2.png" className="ring ringBoost" alt="ring2" />
            <img src="/malhar/Ring-3.png" className="ring ringBoost" alt="ring3" />
            <img src="/malhar/Ring-4.png" className="ring ringBoost" alt="ring4" />
            <img src="/malhar/logo-core.png" className="core smallCore" alt="logo" />
          </div>
        </div>
      </div>
      <div className="footer">MALHAR 2025</div>

      <style jsx>{`
        .cover{ position:absolute; inset:0; background:#0b0f18; }
        .frame{ position:absolute; inset:12px; border:1px solid rgba(247,195,77,.6); border-radius:16px; }
        .clipBlock{ position:absolute; inset:28px; border-radius:14px; overflow:hidden; background:#0c111d; outline:1px solid rgba(247,195,77,.25); }
        .wash{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.9; mix-blend-mode:screen; filter:saturate(105%); }
        .center{ position:absolute; inset:0; display:grid; place-items:center; }
        .stack{ position:relative; width:470px; max-width:88%; aspect-ratio:1/1; }
        .ring{ position:absolute; inset:0; width:100%; height:100%; object-fit:contain; }
        .ringBoost{ transform:scale(1.12); transform-origin:center; }
        .core{ position:absolute; inset:0; margin:auto; width:84%; height:84%; object-fit:contain; }
        .smallCore{ width:68%; height:68%; }
        .footer{ position:absolute; inset:auto 0 14px 0; text-align:center; color:#f7c34d; letter-spacing:.25em; font-size:12px; }
      `}</style>
    </div>
  );
}

function InsideMessage({ to, from, message }) {
  return (
    <div className="inside">
      <div className="columns">
        <div className="col">
          <div className="innerClip">
            <img src="/malhar/Cloud.png" alt="nebula" className="nebula" />
            <div className="stack">
              <img src="/malhar/Ring-3.png" className="ring" alt="ring" />
              <img src="/malhar/logo-core.png" className="core coreSm" alt="logo" />
            </div>
          </div>
        </div>

        <div className="col rightSide">
          <div className="innerClip">
            <img src="/malhar/Cloud.png" alt="nebula" className="nebula dim" />
            <div className="to">To: <b>{to || "—"}</b></div>
            <div className="msg">{message || ""}</div>
            <div className="from">— {from || "—"}</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .inside{ position:absolute; inset:0; background:linear-gradient(135deg,#0d1320,#0a0f19); }
        .columns{ position:relative; display:grid; grid-template-columns:1fr 1fr; height:100%; }
        .col{ position:relative; padding:22px; }
        .col + .col{ border-left:1px solid rgba(247,195,77,.25); }
        .innerClip{ position:absolute; inset:22px; border-radius:12px; overflow:hidden; outline:1px solid rgba(247,195,77,.25); background:#0b101a; }
        .nebula{ position:absolute; inset:0; width:120%; left:-10%; top:-6%; opacity:.9; mix-blend-mode:screen; }
        .dim{ opacity:.7; }
        .stack{ position:absolute; inset:0; display:grid; place-items:center; opacity:.95; }
        .ring{ position:absolute; width:90%; height:90%; object-fit:contain; opacity:.6; transform:scale(1.06); }
        .core{ position:absolute; width:66%; height:66%; object-fit:contain; }
        .coreSm{ width:58%; height:58%; }
        .to{ position:relative; z-index:1; color:#f7c34d; opacity:.95; padding:12px; }
        .msg{ position:relative; z-index:1; margin:4px 12px 0; padding:14px; min-height:200px; background:rgba(0,0,0,.32); border:1px solid rgba(247,195,77,.2); border-radius:12px; color:#eef0f5; line-height:1.5; white-space:pre-wrap; }
        .from{ position:absolute; right:24px; bottom:18px; color:#f7c34d; opacity:.95; }
      `}</style>
    </div>
  );
}

function Starfield() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, raf = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(STAR_CAP, Math.floor((w * h) / STAR_DENSITY_DIVISOR));
    const stars = Array.from({ length: count }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05,
      r: Math.random() * 0.8 + 0.15,
      t: Math.random() * Math.PI * 2,
      ts: 0.02 + Math.random() * 0.03,
    }));

    const drawStar = (s) => {
      const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, Math.max(1.2, s.r * 6));
      glow.addColorStop(0, "rgba(255,223,128,0.95)");
      glow.addColorStop(0.4, "rgba(243,197,82,0.55)");
      glow.addColorStop(1, "rgba(243,197,82,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      const radius = Math.max(0.6, s.r * (1 + 0.7 * Math.sin(s.t)));
      ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const step = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const s of stars) {
        if (mouse.current.active) {
          const dx = mouse.current.x - s.x;
          const dy = mouse.current.y - s.y;
          const d2 = dx*dx + dy*dy + 0.01;
          const f = Math.min(GRAVITY_STRENGTH_CAP, GRAVITY_STRENGTH_NUM / d2);
          const inv = 1 / Math.sqrt(d2);
          s.vx += f * dx * inv;
          s.vy += f * dy * inv;
        }
        s.vx *= DAMPING; s.vy *= DAMPING;
        s.x += s.vx; s.y += s.vy;
        s.t += s.ts;

        if (s.x < -10) s.x = w + 10;
        if (s.x > w + 10) s.x = -10;
        if (s.y < -10) s.y = h + 10;
        if (s.y > h + 10) s.y = -10;

        drawStar(s);
      }
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    const onMove = (e) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; mouse.current.active = true; };
    const onLeave = () => { mouse.current.active = false; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="starcanvas" aria-hidden>
      <style jsx>{`
        .starcanvas { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
      `}</style>
    </canvas>
  );
}
