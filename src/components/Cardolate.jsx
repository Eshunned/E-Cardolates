"use client";
import { useEffect, useRef, useState } from "react";
import CardolateStyles from "@/components/CardolateStyles";
import LZString from "lz-string";

/* ---------- Star Background Variables ---------- */
const STAR_DENSITY = 1200;          
const STAR_CAP_DESKTOP = 120000;    
const STAR_CAP_MOBILE = 6000;       
const STAR_DAMPING = 0.985;         
const GRAVITY_NUMERATOR = 15;       
const GRAVITY_LIMIT = 0.2;          

export default function CardolateMain({
  initialTo = "",
  initialFrom = "",
  initialMessage = "Crazy bhai",
  readOnly = false,
  existingId = null,
  onlyCard = false,
} = {}) {
  const [to, setTo] = useState(initialTo);
  const [from, setFrom] = useState(initialFrom);
  const [message, setMessage] = useState(initialMessage);
  const [isOpen, setIsOpen] = useState(onlyCard);

  const captureRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (initialTo || initialFrom || initialMessage) return;
    const qs = new URLSearchParams(window.location.search);
    const qTo = qs.get("to");
    const qFrom = qs.get("from");
    const qMsg = qs.get("msg");
    if (qTo) setTo(qTo);
    if (qFrom) setFrom(qFrom);
    if (qMsg) setMessage(qMsg);
  }, [initialTo, initialFrom, initialMessage]);

  /* This part I CHATGPTed */
  const decodeAllImages = async (rootEl) => {
    const imgs = Array.from(rootEl.querySelectorAll("img"));
    await Promise.all(
      imgs.map((img) =>
        (img.decode?.() ||
          new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          })
        ).catch(() => {})
      )
    );
  };

  const downloadDataUrl = (dataUrl, filename) => {
    const a = document.createElement("a");
    a.download = filename;
    a.href = dataUrl;
    a.click();
  };

  async function saveStatically() {
  // Compress and encode message safely for URL
  const compressedMsg = LZString.compressToEncodedURIComponent(message);

  const url = `${window.location.origin}/share/${encodeURIComponent(to)}/${encodeURIComponent(from)}/${compressedMsg}`;

  await navigator.clipboard.writeText(url);
  alert("Share link copied:\n" + url);
}

  async function handleDownloadPng() {
    try {
      const { toPng } = await import("html-to-image");
      const src = captureRef.current;
      if (!src) return;

      // Mirrored the cloned cardolate here for proper png download, since a flipped image was being downloaded
      const rect = src.getBoundingClientRect();
      const clone = src.cloneNode(true);
      Object.assign(clone.style, {
        position: "fixed",
        left: "-10000px",
        top: "0",
        width: rect.width + "px",
        height: rect.height + "px",
        transform: "scaleX(-1)",
      });
      clone.classList.add("export-mode");
      document.body.appendChild(clone);

      await decodeAllImages(clone);

      const dataUrl = await toPng(clone, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#070b12",
        filter: (el) => {
          const tag = el?.nodeName?.toLowerCase?.();
          if (tag === "canvas") return false;
          if (el?.classList?.contains("starcanvas")) return false;
          return true;
        },
      });

      document.body.removeChild(clone);
      downloadDataUrl(dataUrl, "malhar-e-card.png");
    } catch (e) {
      console.error(e);
      alert("Run once: npm i html-to-image");
    }
  }

  async function saveCardAndCopyLink() {
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, from, message }),
    });
    if (!res.ok) return alert("Save failed");
    const card = await res.json();
    const url = `${window.location.origin}/card/${card.id}`;
    await navigator.clipboard.writeText(url);
    alert("Share link copied:\n" + url);
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
      <CardolateStyles />
      <Starfield />

      <div className="wrap">
        {!onlyCard && (
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
              {!readOnly && !existingId && (
                <button className="btn" onClick={saveCardAndCopyLink}>Get share link</button>
              )}
              {!readOnly && !existingId && (
                <button className="btn" onClick={saveStatically}>Get Static Share link</button>
              )}
              {!readOnly && existingId && (
                <button className="btn" onClick={updateCard}>Update card</button>
              )}
            </div>
          </section>
        )}

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
                <div className="panel front"><FrontCover /></div>
                <div className="panel back"><InsideMessage to={to} from={from} message={message} /></div>
              </div>
            </div>
          </div>

          {onlyCard && (
            <div className="viewerActions">
              <button className="btn" onClick={handleDownloadPng}>Download PNG</button>
              <a className="btn" href="/">Create your own Cardolate</a>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .root{
          min-height:100svh;background:#070b12;color:#fff;position:relative;overflow:hidden;
          font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;
        }
        .wrap{
          max-width:1200px;margin:0 auto;padding:20px 14px;display:grid;grid-template-columns:1fr;gap:20px;
        }
        @media (min-width:1024px){
          .wrap{padding:40px 20px;grid-template-columns:${onlyCard ? "1fr" : "1fr 1fr"};gap:32px;}
        }
        .controls{z-index:2;}
        .title{font-size:22px;font-weight:600;margin:0 0 4px;}
        @media (min-width:640px){.title{font-size:28px;}}
        .hint{opacity:.7;font-size:12px;margin-bottom:20px;}
        .field{display:grid;gap:6px;margin:12px 0;}
        .label{text-transform:uppercase;letter-spacing:.1em;font-size:11px;color:#f7c34d;}
        .input{
          background:rgba(10,12,20,.6);border:1px solid rgba(255,200,120,.35);
          border-radius:12px;padding:12px 14px;color:#fff;outline:none;font-size:16px;
        }
        .textarea{min-height:120px;}
        .buttons{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;}
        .btn{
          background:#121521;border:1px solid #2b2f3f;color:#fff;border-radius:12px;
          padding:12px 14px;cursor:pointer;font-size:15px;text-decoration:none;display:inline-flex;align-items:center;
        }
        .btn:hover{background:#1a1f2f;}
        .primary{background:#f7c34d;color:#1a1407;border-color:#f7c34d;}

        .stage{display:flex;align-items:center;justify-content:center;position:relative;}
        .viewerActions{position:absolute;bottom:-56px;width:100%;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;}
        .captureArea{display:inline-block;}
        .persp{perspective:1600px;}
        .card{
          position:relative;width:min(92vw,720px);height:calc(min(92vw,720px)*0.64);
          transform-style:preserve-3d;transform-origin:50% 50%;
          transition:transform .7s cubic-bezier(.22,.61,.36,1);cursor:pointer;
        }
        .card.open{transform:rotateY(180deg);}
        @media (prefers-reduced-motion:reduce){.card{transition:none;}}
        .panel{position:absolute;inset:0;border-radius:18px;overflow:hidden;backface-visibility:hidden;box-shadow:0 10px 40px rgba(0,0,0,.55);}
        .front{border:1px solid rgba(247,195,77,.5);}
        .back{transform:rotateY(180deg);border:1px solid rgba(247,195,77,.35);}
      `}</style>
    </main>
  );
}

/* Front Cover ka things */
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
        .cover{position:absolute;inset:0;background:#0b0f18;}
        .frame{position:absolute;inset:12px;border:1px solid rgba(247,195,77,.6);border-radius:16px;}

        .clipBlock{
          position:absolute;inset:28px;border-radius:14px;overflow:hidden;
          background:#0c111d;outline:1px solid rgba(247,195,77,.25);
        }
        .wash{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.9;mix-blend-mode:screen;filter:saturate(105%);}

        .center{position:absolute;inset:0;display:grid;place-items:center;}
        .stack{
          position:relative;width:min(84%, 400px);aspect-ratio:1/1;margin:0 auto;
        }
        .ring{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;}
        .ringBoost{transform:scale(1.08);transform-origin:center;}
        .core{position:absolute;inset:0;margin:auto;width:50%;height:50%;object-fit:contain;}
        .smallCore{width:62%;height:62%;}
        .footer{position:absolute;inset:auto 0 14px 0;text-align:center;color:#f7c34d;letter-spacing:.25em;font-size:12px;}
      `}</style>
    </div>
  );
}

/* Back Cover ka things */
function InsideMessage({ to, from, message }) {
  return (
    <div className="inside">
      <div className="columns">
        <div className="col">
          <div className="innerClip leftClip">
            <img src="/malhar/Cloud.png" alt="nebula" className="nebula" />
            <div className="leftArt">
              <div className="stack">
                <img src="/malhar/Ring-3.png" className="ring" alt="ring" />
                <img src="/malhar/logo-core.png" className="core coreSm" alt="logo" />
              </div>
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
        .inside{position:absolute;inset:0;background:linear-gradient(135deg,#0d1320,#0a0f19);}
        .columns{position:relative;display:grid;grid-template-columns:1fr;height:100%;}
        @media (min-width:640px){.columns{grid-template-columns:1fr 1fr;}}

        .col{position:relative;padding:18px;}
        @media (min-width:640px){.col{padding:22px;}}
        .col + .col{border-top:1px solid rgba(247,195,77,.25);}
        @media (min-width:640px){.col + .col{border-top:0;border-left:1px solid rgba(247,195,77,.25);}}

        .innerClip{
          position:absolute;inset:18px;border-radius:12px;overflow:hidden;
          outline:1px solid rgba(247,195,77,.25);background:#0b101a;
        }
        @media (min-width:640px){.innerClip{inset:22px;}}

        .nebula{position:absolute;inset:0;width:120%;left:-10%;top:-6%;opacity:.9;mix-blend-mode:screen;}
        .dim{opacity:.7;}

        /* Center the art stack within the left page */
        .leftClip{display:grid;place-items:center;}
        .leftArt{width:min(90%, 400px);aspect-ratio:1/1;position:relative;}
        .stack{position:absolute;inset:0;display:grid;place-items:center;}

        .ring{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:.65;}
        .core{position:absolute;width:36%;height:46%;object-fit:contain;}
        .coreSm{width:68%;height:68%;}

        /* small horizontal nudge (tweak px as you like) */
        .leftArt{ transform: translateX(8px); }

        .to{position:relative;z-index:1;color:#f7c34d;opacity:.95;padding:10px;}
        .msg{
          position:relative;z-index:1;margin:4px 10px 40px;padding:14px;min-height:140px;
          background:rgba(0,0,0,.32);border:1px solid rgba(247,195,77,.2);border-radius:12px;
          color:#eef0f5;line-height:1.5;white-space:pre-wrap;
        }
        @media (min-width:640px){.msg{margin:4px 12px 0;min-height:200px;}}
        .from{position:absolute;right:14px;bottom:12px;color:#f7c34d;opacity:.95;}
        @media (min-width:640px){.from{right:24px;bottom:18px;}}
      `}</style>
    </div>
  );
}

/*Star Background ke functions*/
function Starfield() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const base = Math.floor((w * h) / STAR_DENSITY);
    const cap = w < 640 ? STAR_CAP_MOBILE : STAR_CAP_DESKTOP;
    const count = Math.min(cap, Math.max(250, base));

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
          const d2 = dx * dx + dy * dy + 0.01;
          const f = Math.min(GRAVITY_LIMIT, GRAVITY_NUMERATOR / d2);
          const inv = 1 / Math.sqrt(d2);
          s.vx += f * dx * inv;
          s.vy += f * dy * inv;
        }
        s.vx *= STAR_DAMPING; s.vy *= STAR_DAMPING;
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

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
      mouse.current.active = true;
    };
    const onLeave = () => { mouse.current.active = false; };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="starcanvas" aria-hidden>
      <style jsx>{`
        .starcanvas{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;}
      `}</style>
    </canvas>
  );
}
