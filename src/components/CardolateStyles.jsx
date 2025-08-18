"use client";

export default function CardolateStyles() {
  return (
    <style jsx global>{`
      /* ---------- Base Layout ---------- */
      .root {
        min-height: 100svh;
        background: #070b12;
        color: #fff;
        position: relative;
        overflow: hidden;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      }
      .wrap {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
        display: grid;
        grid-template-columns: 1fr;
        gap: 32px;
      }
      @media (min-width: 1024px) {
        .wrap { grid-template-columns: 1fr 1fr; }
      }

      /* ---------- Controls ---------- */
      .controls { z-index: 2; }
      .title { font-size: 28px; font-weight: 600; margin: 0 0 4px; }
      .hint { opacity: .7; font-size: 13px; margin-bottom: 20px; }
      .field { display: grid; gap: 6px; margin: 12px 0; }
      .label { text-transform: uppercase; letter-spacing: .1em; font-size: 11px; color: #f7c34d; }
      .input {
        background: rgba(10,12,20,.6);
        border: 1px solid rgba(255,200,120,.35);
        border-radius: 12px;
        padding: 10px 12px;
        color: #fff;
        outline: none;
      }
      .textarea { min-height: 120px; }
      .buttons { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
      .btn {
        background: #121521;
        border: 1px solid #2b2f3f;
        color: #fff;
        border-radius: 12px;
        padding: 10px 14px;
        cursor: pointer;
      }
      .btn:hover { background: #1a1f2f; }
      .primary { background: #f7c34d; color: #1a1407; border-color: #f7c34d; }

      /* ---------- Stage / Card ---------- */
      .stage { display: flex; align-items: center; justify-content: center; }
      .captureArea { display: inline-block; }
      .persp { perspective: 1600px; }

      .card {
        position: relative;
        width: 720px;
        max-width: 92vw;
        height: 460px;
        transform-style: preserve-3d;
        transform-origin: 50% 50%;
        transition: transform .7s cubic-bezier(.22,.61,.36,1);
        cursor: pointer;
      }
      .card.open { transform: rotateY(180deg); }

      .panel {
        position: absolute; inset: 0;
        border-radius: 18px; overflow: hidden;
        backface-visibility: hidden;
        box-shadow: 0 10px 40px rgba(0,0,0,.55);
      }
      .front { border: 1px solid rgba(247,195,77,.5); }
      .back  { transform: rotateY(180deg); border: 1px solid rgba(247,195,77,.35); }

      /* ---------- Front Cover ---------- */
      .cover { position: absolute; inset: 0; background: #0b0f18; }
      .frame { position: absolute; inset: 12px; border: 1px solid rgba(247,195,77,.6); border-radius: 16px; }

      .clipBlock {
        position: absolute; inset: 28px;
        border-radius: 14px; overflow: hidden;
        background: #0c111d;
        outline: 1px solid rgba(247,195,77,.25);
      }
      .wash {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover; opacity: .9;
        mix-blend-mode: screen; filter: saturate(105%);
      }
      .center { position: absolute; inset: 0; display: grid; place-items: center; }
      .stack { position: relative; width: 470px; max-width: 88%; aspect-ratio: 1 / 1; }
      .ring { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
      .ringBoost { transform: scale(1.12); transform-origin: center; }
      .core { position: absolute; inset: 0; margin: auto; width: 84%; height: 84%; object-fit: contain; }
      .smallCore { width: 68%; height: 68%; }
      .footer { position: absolute; inset: auto 0 14px 0; text-align: center; color: #f7c34d; letter-spacing: .25em; font-size: 12px; }

      /* ---------- Inside / Message ---------- */
      .inside { position: absolute; inset: 0; background: linear-gradient(135deg, #0d1320, #0a0f19); }
      .columns { position: relative; display: grid; grid-template-columns: 1fr 1fr; height: 100%; }
      .col { position: relative; padding: 22px; }
      .col + .col { border-left: 1px solid rgba(247,195,77,.25); }

      .innerClip {
        position: absolute; inset: 22px;
        border-radius: 12px; overflow: hidden;
        outline: 1px solid rgba(247,195,77,.25);
        background: #0b101a;
      }
      .nebula { position: absolute; inset: 0; width: 120%; left: -10%; top: -6%; opacity: .9; mix-blend-mode: screen; }
      .dim { opacity: .7; }

      .stack { position: absolute; inset: 0; display: grid; place-items: center; opacity: .95; }
      .ring { position: absolute; width: 90%; height: 90%; object-fit: contain; opacity: .6; transform: scale(1.06); }
      .core { position: absolute; width: 66%; height: 66%; object-fit: contain; }
      .coreSm { width: 58%; height: 58%; }
      .to { position: relative; z-index: 1; color: #f7c34d; opacity: .95; padding: 12px; }
      .msg {
        position: relative; z-index: 1;
        margin: 4px 12px 0; padding: 14px; min-height: 200px;
        background: rgba(0,0,0,.32);
        border: 1px solid rgba(247,195,77,.2);
        border-radius: 12px;
        color: #eef0f5; line-height: 1.5; white-space: pre-wrap;
      }
      .from { position: absolute; right: 24px; bottom: 18px; color: #f7c34d; opacity: .95; }

      /* ---------- Starfield canvas ---------- */
      .starcanvas {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
      }

      /* ---------- Export-only adjustments ---------- */
      .export-mode .wash { mix-blend-mode: normal !important; opacity: 1 !important; }
      .export-mode .cover,
      .export-mode .inside { background: #0b0f18 !important; }

      /* ---------- Mobile tweaks ---------- */
      @media (max-width: 640px) {
        .wrap { gap: 20px; padding: 20px 14px; }
        .title { font-size: 22px; }
        .buttons .btn { padding: 9px 12px; font-size: 14px; }
        .card { width: 100%; height: auto; aspect-ratio: 720 / 460; }
        .footer { font-size: 11px; }
        .columns { grid-template-columns: 1fr; }
        .col + .col { border-left: none; border-top: 1px solid rgba(247,195,77,.25); }
        .msg { min-height: 160px; }
      }
    `}</style>
  );
}
