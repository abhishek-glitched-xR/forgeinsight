import { useEffect, useRef } from "react";

export default function AIHeadCanvas({ className = "" }: { className?: string }) {
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

    let t = 0;

    // Head profile points — right-facing silhouette roughly centered-left
    function headPath(cx: number, cy: number, scale: number): [number, number][] {
      const pts: [number, number][] = [];
      // Forehead top → back of head → neck → chin → nose → forehead
      const raw: [number, number][] = [
        [0.05, -0.48], [0.10, -0.52], [0.18, -0.55], [0.26, -0.54],
        [0.32, -0.50], [0.36, -0.44], [0.38, -0.36], [0.37, -0.26],
        [0.35, -0.16], [0.34, -0.05], [0.34, 0.06], [0.32, 0.18],
        [0.28, 0.28], [0.22, 0.36], [0.14, 0.42], [0.06, 0.46],
        [0.00, 0.48], [-0.04, 0.44], [-0.06, 0.38], [-0.04, 0.30],
        [0.00, 0.22], [0.02, 0.14], // chin/jaw
        [0.00, 0.06], [-0.04, -0.02], [-0.06, -0.10], // neck top
        [-0.02, -0.18], [0.04, -0.26], [0.10, -0.34], // nose/cheek
        [0.08, -0.38], [0.05, -0.44], [0.05, -0.48],
      ];
      for (const [x, y] of raw) {
        pts.push([cx + x * scale, cy + y * scale]);
      }
      return pts;
    }

    // Particles along the head contour
    interface ContourPt { x: number; y: number; opacity: number; size: number; pulse: number; pulseSpeed: number }
    const cx = w * 0.42;
    const cy = h * 0.50;
    const scale = Math.min(w, h) * 0.72;
    const contourPoints = headPath(cx, cy, scale);

    const dots: ContourPt[] = contourPoints.map(([x, y]) => ({
      x, y,
      opacity: 0.3 + Math.random() * 0.5,
      size: 1.2 + Math.random() * 2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    }));

    // Interior face mesh dots
    interface MeshDot { x: number; y: number; opacity: number; size: number }
    const meshDots: MeshDot[] = [];
    for (let i = 0; i < 120; i++) {
      const px = cx - scale * 0.05 + (Math.random() - 0.5) * scale * 0.38;
      const py = cy - scale * 0.2 + Math.random() * scale * 0.65;
      meshDots.push({ x: px, y: py, opacity: 0.08 + Math.random() * 0.18, size: 0.8 + Math.random() * 1.2 });
    }

    // Data stream lines — flowing left from back of head
    interface StreamLine { y: number; length: number; speed: number; offset: number; opacity: number; dotX: number }
    const streams: StreamLine[] = [];
    for (let i = 0; i < 14; i++) {
      const yFrac = 0.15 + (i / 14) * 0.7;
      streams.push({
        y: cy - scale * 0.42 + yFrac * scale * 0.84,
        length: 80 + Math.random() * 160,
        speed: 0.4 + Math.random() * 0.6,
        offset: Math.random() * 200,
        opacity: 0.15 + Math.random() * 0.35,
        dotX: 0,
      });
    }

    // Background particles
    interface BgPt { x: number; y: number; vx: number; vy: number; opacity: number; size: number }
    const bgPts: BgPt[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      opacity: 0.05 + Math.random() * 0.15,
      size: 0.8 + Math.random() * 1.5,
    }));

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      // BG particles
      bgPts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 69, 29, ${p.opacity})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      });

      // Mesh interior dots
      meshDots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 69, 29, ${d.opacity})`;
        ctx.fill();
      });

      // Mesh connections (sparse)
      for (let i = 0; i < meshDots.length; i += 4) {
        for (let j = i + 1; j < Math.min(i + 8, meshDots.length); j++) {
          const dx = meshDots[i].x - meshDots[j].x;
          const dy = meshDots[i].y - meshDots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 48) {
            ctx.beginPath();
            ctx.moveTo(meshDots[i].x, meshDots[i].y);
            ctx.lineTo(meshDots[j].x, meshDots[j].y);
            ctx.strokeStyle = `rgba(248, 69, 29, ${0.06 * (1 - dist / 48)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      // Head contour path (glow outline)
      if (contourPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(contourPoints[0][0], contourPoints[0][1]);
        for (let i = 1; i < contourPoints.length; i++) {
          ctx.lineTo(contourPoints[i][0], contourPoints[i][1]);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(248, 69, 29, 0.30)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Contour dot pulses
      dots.forEach(d => {
        d.pulse += d.pulseSpeed;
        const alpha = d.opacity * (0.6 + Math.abs(Math.sin(d.pulse)) * 0.4);
        const size = d.size * (0.85 + Math.abs(Math.sin(d.pulse)) * 0.3);

        // glow
        const grd = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, size * 5);
        grd.addColorStop(0, `rgba(248, 69, 29, ${alpha * 0.5})`);
        grd.addColorStop(1, "rgba(248, 69, 29, 0)");
        ctx.beginPath();
        ctx.arc(d.x, d.y, size * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 69, 29, ${alpha})`;
        ctx.fill();
      });

      // Data stream lines flowing left
      streams.forEach((s, idx) => {
        const progress = ((t * s.speed + s.offset) % (s.length + w * 0.45)) / (s.length + w * 0.45);
        const headX = cx - scale * 0.08 - idx * 2;
        const endX = headX - s.length * progress;
        const tailX = Math.max(endX - 60, 0);

        const grad = ctx.createLinearGradient(headX, s.y, tailX, s.y);
        grad.addColorStop(0, `rgba(248, 69, 29, 0)`);
        grad.addColorStop(0.4, `rgba(248, 69, 29, ${s.opacity})`);
        grad.addColorStop(1, `rgba(248, 69, 29, 0)`);

        ctx.beginPath();
        ctx.moveTo(headX, s.y);
        ctx.lineTo(tailX, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Leading dot
        ctx.beginPath();
        ctx.arc(endX, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 69, 29, ${s.opacity * 0.9})`;
        ctx.fill();
      });

      t++;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    const ro = new ResizeObserver(() => {
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w; canvas.height = h;
    });
    ro.observe(canvas);
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className={`block w-full h-full ${className}`} />;
}
