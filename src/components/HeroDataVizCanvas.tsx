import { useEffect, useRef } from "react";

export default function HeroDataVizCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const t0 = performance.now();

    // ─── helpers ────────────────────────────────────────────────────────────
    const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
    const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
    const easeInOut = (t: number) => {
      t = clamp(t, 0, 1);
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    function bez(t: number, x0: number, y0: number, cx1: number, cy1: number, cx2: number, cy2: number, x1: number, y1: number) {
      const m = 1 - t;
      return {
        x: m*m*m*x0 + 3*m*m*t*cx1 + 3*m*t*t*cx2 + t*t*t*x1,
        y: m*m*m*y0 + 3*m*m*t*cy1 + 3*m*t*t*cy2 + t*t*t*y1,
      };
    }

    // ─── layout constants (fractions of w/h) ────────────────────────────────
    const FLOOR = 0.80;   // floor y as fraction of h
    const TILT  = 10;     // isometric x-offset (px) applied to top edge

    // Bars: x = left edge fraction, bw = width fraction, bh = height fraction above floor
    const BARS = [
      { x: 0.17, bw: 0.022, bh: 0.14 },   // thin spike
      { x: 0.24, bw: 0.032, bh: 0.25 },   // narrow
      { x: 0.32, bw: 0.100, bh: 0.43 },   // medium panel
      { x: 0.45, bw: 0.130, bh: 0.67 },   // main panel (has dot grid)
      { x: 0.61, bw: 0.130, bh: 0.82 },   // tall main panel (has dot grid)
      { x: 0.78, bw: 0.048, bh: 0.92 },   // narrow tall
    ];

    // Side labels on the right (label, y-fraction)
    const LABELS = [
      { text: "INSIGHTS",   yf: 0.35 },
      { text: "STRATEGY",   yf: 0.47 },
      { text: "INNOVATION", yf: 0.59 },
      { text: "GROWTH",     yf: 0.71 },
    ];

    // ─── curve control points ───────────────────────────────────────────────
    function makeCurve() {
      return {
        x0: w * 0.03, y0: h * (FLOOR + 0.09),
        cx1: w * 0.22, cy1: h * (FLOOR + 0.04),
        cx2: w * 0.52, cy2: h * 0.22,
        x1: w * 0.83,  y1: h * 0.10,
      };
    }

    function curveLen(c: ReturnType<typeof makeCurve>) {
      let len = 0, prev = bez(0, c.x0, c.y0, c.cx1, c.cy1, c.cx2, c.cy2, c.x1, c.y1);
      for (let i = 1; i <= 300; i++) {
        const pt = bez(i/300, c.x0, c.y0, c.cx1, c.cy1, c.cx2, c.cy2, c.x1, c.y1);
        const dx = pt.x-prev.x, dy = pt.y-prev.y;
        len += Math.sqrt(dx*dx+dy*dy);
        prev = pt;
      }
      return len;
    }

    let C = makeCurve();
    let CL = curveLen(C);

    // ─── stable bg scatter ──────────────────────────────────────────────────
    const BG = Array.from({ length: 50 }, (_, i) => ({
      x: (Math.sin(i*127.1+1.3)*0.5+0.5) * w,
      y: (Math.sin(i*311.7+2.7)*0.5+0.5) * h,
      r: 0.6 + (Math.sin(i*45.6)*0.5+0.5)*1.2,
      ph: i * 0.73,
    }));

    // ─── timeline (ms) ──────────────────────────────────────────────────────
    const T_BARS_START  = 200;
    const T_BAR_STEP    = 140;
    const T_BAR_DUR     = 280;
    const T_CURVE_START = T_BARS_START + BARS.length * T_BAR_STEP + 200;
    const T_CURVE_DUR   = 950;
    const T_NODE_START  = T_CURVE_START + T_CURVE_DUR - 120;
    const T_NODE_DUR    = 380;
    const T_LABELS_START = T_CURVE_START + 200;
    const T_LABEL_STEP  = 80;

    // ─── draw ────────────────────────────────────────────────────────────────
    function draw() {
      if (!ctx) return;
      const ms = performance.now() - t0;
      ctx.clearRect(0, 0, w, h);

      const gFade = clamp(ms / 350, 0, 1);
      const floatY = Math.sin(ms * 0.00062) * 5;
      const floatX = Math.sin(ms * 0.00045) * 2.5;
      const floorY = h * FLOOR;

      // ── scatter bg dots ──
      BG.forEach(d => {
        const p = 0.3 + Math.abs(Math.sin(ms*0.0009+d.ph)) * 0.5;
        ctx.beginPath();
        ctx.arc(d.x + floatX*0.25, d.y + floatY*0.25, d.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(248, 69, 29,${gFade*p*0.22})`;
        ctx.fill();
      });

      // ── ambient floor glow ──
      const floorFade = clamp((ms - T_BARS_START) / 600, 0, 1);
      if (floorFade > 0) {
        // wide spread upward glow
        const fg2 = ctx.createRadialGradient(w*0.52, floorY, 0, w*0.52, floorY, w*0.60);
        fg2.addColorStop(0, `rgba(248, 69, 29,${floorFade*0.08})`);
        fg2.addColorStop(0.5, `rgba(248, 69, 29,${floorFade*0.03})`);
        fg2.addColorStop(1, "rgba(248, 69, 29,0)");
        ctx.fillStyle = fg2;
        ctx.fillRect(0, floorY - h*0.35, w, h*0.40);

        // floor line itself
        const fl = ctx.createLinearGradient(0, floorY, w, floorY);
        fl.addColorStop(0,    "rgba(248, 69, 29,0)");
        fl.addColorStop(0.15, `rgba(248, 69, 29,${floorFade*0.45})`);
        fl.addColorStop(0.55, `rgba(248, 69, 29,${floorFade*0.60})`);
        fl.addColorStop(0.85, `rgba(248, 69, 29,${floorFade*0.35})`);
        fl.addColorStop(1,    "rgba(248, 69, 29,0)");
        ctx.save();
        ctx.strokeStyle = fl;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(0, floorY + floatY*0.08);
        ctx.lineTo(w, floorY + floatY*0.08);
        ctx.stroke();
        ctx.restore();
      }

      // ── bars ──
      BARS.forEach((bar, i) => {
        const alpha = easeOut(clamp((ms - T_BARS_START - i*T_BAR_STEP) / T_BAR_DUR, 0, 1));
        if (alpha <= 0) return;

        const bx   = w * bar.x + floatX*(0.2 + i*0.05);
        const bw2  = w * bar.bw;
        const bh2  = h * bar.bh;
        const topY = floorY - bh2 + floatY*(0.15 + i*0.03);
        const botY = floorY + floatY*0.06;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Parallelogram path (isometric tilt on top)
        const tilt = TILT;
        ctx.beginPath();
        ctx.moveTo(bx + tilt,      topY);
        ctx.lineTo(bx + bw2 + tilt, topY);
        ctx.lineTo(bx + bw2,        botY);
        ctx.lineTo(bx,              botY);
        ctx.closePath();

        // Glass fill — vertical gradient
        const fillG = ctx.createLinearGradient(bx, topY, bx, botY);
        fillG.addColorStop(0,   "rgba(248, 69, 29,0.12)");
        fillG.addColorStop(0.4, "rgba(248, 69, 29,0.07)");
        fillG.addColorStop(1,   "rgba(248, 69, 29,0.02)");
        ctx.fillStyle = fillG;
        ctx.fill();

        // Subtle right-side shading (depth illusion)
        ctx.save();
        ctx.clip();
        const sideG = ctx.createLinearGradient(bx, 0, bx + bw2 + tilt, 0);
        sideG.addColorStop(0,    "rgba(0,0,0,0)");
        sideG.addColorStop(0.75, "rgba(0,0,0,0)");
        sideG.addColorStop(1,    "rgba(23, 18, 15,0.15)");
        ctx.fillStyle = sideG;
        ctx.fillRect(bx, topY, bw2 + tilt, botY - topY);
        ctx.restore();

        // Outline
        ctx.beginPath();
        ctx.moveTo(bx + tilt,      topY);
        ctx.lineTo(bx + bw2 + tilt, topY);
        ctx.lineTo(bx + bw2,        botY);
        ctx.lineTo(bx,              botY);
        ctx.closePath();
        ctx.strokeStyle = "rgba(248, 69, 29,0.20)";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Bright glowing top edge
        const topG = ctx.createLinearGradient(bx + tilt, topY, bx + bw2 + tilt, topY);
        topG.addColorStop(0,    "rgba(248, 69, 29,0)");
        topG.addColorStop(0.15, "rgba(248, 69, 29,0.85)");
        topG.addColorStop(0.85, "rgba(248, 69, 29,0.85)");
        topG.addColorStop(1,    "rgba(248, 69, 29,0)");
        ctx.beginPath();
        ctx.moveTo(bx + tilt,       topY);
        ctx.lineTo(bx + bw2 + tilt, topY);
        ctx.strokeStyle = topG;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = "rgba(248, 69, 29,0.6)";
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Dot grid (only for wider bars: index 3, 4)
        if (bar.bw > 0.08) {
          const cols = Math.floor(bw2 / 10);
          const rows = Math.floor(bh2 / 9);
          for (let ci = 1; ci < cols; ci++) {
            for (let ri = 1; ri < rows; ri++) {
              const frac = ri / rows;  // 0=top 1=bottom
              const dx = bx + tilt * (1 - frac) + ci * (bw2 / cols);
              const dy = topY + ri * (bh2 / rows);
              const pulse = 0.25 + Math.abs(Math.sin(ms*0.0009 + ci*0.5 + ri*0.07 + i)) * 0.45;
              ctx.beginPath();
              ctx.arc(dx, dy, 0.9, 0, Math.PI*2);
              ctx.fillStyle = `rgba(248, 69, 29,${pulse*0.50})`;
              ctx.fill();
            }
          }
        }

        // Floor contact glow
        const fg = ctx.createLinearGradient(bx, botY, bx, botY + 24);
        fg.addColorStop(0, `rgba(248, 69, 29,${0.10})`);
        fg.addColorStop(1, "rgba(248, 69, 29,0)");
        ctx.beginPath();
        ctx.moveTo(bx + tilt,       botY);
        ctx.lineTo(bx + bw2 + tilt, botY);
        ctx.lineTo(bx + bw2,        botY + 24);
        ctx.lineTo(bx,              botY + 24);
        ctx.closePath();
        ctx.fillStyle = fg;
        ctx.fill();

        ctx.restore();
      });

      // ── far-right vertical indicator bar ──
      if (floorFade > 0) {
        const vx = w * 0.90;
        const vTop = h * 0.15;
        ctx.save();
        ctx.globalAlpha = floorFade * 0.7;
        const vg = ctx.createLinearGradient(0, vTop, 0, floorY);
        vg.addColorStop(0, "rgba(248, 69, 29,0.55)");
        vg.addColorStop(1, "rgba(248, 69, 29,0.10)");
        ctx.strokeStyle = vg;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(vx, vTop);
        ctx.lineTo(vx, floorY);
        ctx.stroke();
        // small top cap
        ctx.beginPath();
        ctx.arc(vx, vTop, 2, 0, Math.PI*2);
        ctx.fillStyle = "rgba(248, 69, 29,0.8)";
        ctx.fill();
        ctx.restore();
      }

      // ── side labels ──
      LABELS.forEach((lbl, i) => {
        const la = easeOut(clamp((ms - T_LABELS_START - i*T_LABEL_STEP) / 300, 0, 1));
        if (la <= 0) return;
        const lx = w * 0.88;
        const ly = h * lbl.yf;

        ctx.save();
        ctx.globalAlpha = la * 0.65;
        // tick line
        ctx.strokeStyle = "rgba(248, 69, 29,0.55)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(lx + 6, ly);
        ctx.lineTo(lx + w * 0.09, ly);
        ctx.stroke();
        // label text
        ctx.font = "500 9px 'JetBrains Mono', monospace";
        ctx.letterSpacing = "0.2em";
        ctx.fillStyle = "rgba(255, 216, 204,0.80)";
        ctx.textAlign = "left";
        ctx.fillText(lbl.text, lx + 10, ly + 3.5);
        ctx.restore();
      });

      // ── trajectory curve ──
      const cp = easeInOut(clamp((ms - T_CURVE_START) / T_CURVE_DUR, 0, 1));
      if (cp > 0) {
        const drawn = cp * CL;
        const cy = C;

        ctx.save();
        ctx.setLineDash([drawn, CL + 20]);
        ctx.lineDashOffset = 0;

        // wide glow
        ctx.shadowColor = "rgba(248, 69, 29,0.50)";
        ctx.shadowBlur = 18;
        ctx.strokeStyle = "rgba(248, 69, 29,0.70)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cy.x0 + floatX*0.4, cy.y0 + floatY*0.12);
        ctx.bezierCurveTo(
          cy.cx1 + floatX*0.35, cy.cy1 + floatY*0.10,
          cy.cx2 + floatX*0.15, cy.cy2 + floatY*0.04,
          cy.x1  + floatX*0.05, cy.y1  + floatY*0.01
        );
        ctx.stroke();

        // tight bright core
        ctx.shadowBlur = 6;
        ctx.strokeStyle = "rgba(255, 216, 204,0.95)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();
      }

      // ── data points on curve ──
      if (cp > 0.05) {
        [0.10, 0.27, 0.46, 0.65, 0.82].forEach((pt, i) => {
          if (pt > cp) return;
          const { x: px, y: py } = bez(pt, C.x0, C.y0, C.cx1, C.cy1, C.cx2, C.cy2, C.x1, C.y1);
          const pulse = 0.55 + Math.abs(Math.sin(ms*0.0018 + i*1.5)) * 0.45;
          ctx.save();
          const gr = ctx.createRadialGradient(px+floatX*0.2, py+floatY*0.05, 0, px+floatX*0.2, py+floatY*0.05, 8);
          gr.addColorStop(0, `rgba(248, 69, 29,${pulse*0.6})`);
          gr.addColorStop(1, "rgba(248, 69, 29,0)");
          ctx.beginPath();
          ctx.arc(px+floatX*0.2, py+floatY*0.05, 8, 0, Math.PI*2);
          ctx.fillStyle = gr;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(px+floatX*0.2, py+floatY*0.05, 2, 0, Math.PI*2);
          ctx.fillStyle = `rgba(255, 216, 204,${pulse*0.95})`;
          ctx.fill();
          ctx.restore();
        });
      }

      // ── terminal node ──
      const na = easeOut(clamp((ms - T_NODE_START) / T_NODE_DUR, 0, 1));
      if (na > 0) {
        const nx = C.x1 + floatX*0.3;
        const ny = C.y1 + floatY*0.01;
        const pulse = 0.65 + Math.abs(Math.sin(ms*0.0022)) * 0.35;

        ctx.save();
        ctx.globalAlpha = na;

        // soft outer halo
        const halo = ctx.createRadialGradient(nx, ny, 0, nx, ny, 40*pulse);
        halo.addColorStop(0,   "rgba(248, 69, 29,0.18)");
        halo.addColorStop(0.45,"rgba(248, 69, 29,0.07)");
        halo.addColorStop(1,   "rgba(248, 69, 29,0)");
        ctx.beginPath();
        ctx.arc(nx, ny, 40*pulse, 0, Math.PI*2);
        ctx.fillStyle = halo;
        ctx.fill();

        // inner glow
        const inner = ctx.createRadialGradient(nx, ny, 0, nx, ny, 12);
        inner.addColorStop(0,    "rgba(255,255,255,0.95)");
        inner.addColorStop(0.30, "rgba(248, 69, 29,0.90)");
        inner.addColorStop(1,    "rgba(248, 69, 29,0)");
        ctx.beginPath();
        ctx.arc(nx, ny, 12, 0, Math.PI*2);
        ctx.fillStyle = inner;
        ctx.fill();

        // core
        ctx.beginPath();
        ctx.arc(nx, ny, 4.5, 0, Math.PI*2);
        ctx.fillStyle = "rgba(255,255,255,0.98)";
        ctx.fill();

        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    const ro = new ResizeObserver(() => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
      C = makeCurve();
      CL = curveLen(C);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={`block w-full h-full ${className}`} />;
}
