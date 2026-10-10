import { useEffect, useRef } from "react";

export default function OrbAnimation({ className = "" }: { className?: string }) {
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

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Core orb glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.25);
      coreGrad.addColorStop(0, "rgba(248, 69, 29, 0.18)");
      coreGrad.addColorStop(0.5, "rgba(248, 69, 29, 0.06)");
      coreGrad.addColorStop(1, "rgba(248, 69, 29, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(w, h) * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Core sphere
      const sphereR = Math.min(w, h) * 0.08;
      const sphereGrad = ctx.createRadialGradient(cx - sphereR * 0.3, cy - sphereR * 0.3, 0, cx, cy, sphereR);
      sphereGrad.addColorStop(0, "rgba(255, 216, 204, 0.9)");
      sphereGrad.addColorStop(0.4, "rgba(248, 69, 29, 0.7)");
      sphereGrad.addColorStop(1, "rgba(248, 69, 29, 0.3)");
      ctx.beginPath();
      ctx.arc(cx, cy, sphereR, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // Orbital rings
      const rings = [
        { r: Math.min(w, h) * 0.18, tilt: 0.3, speed: 0.4, alpha: 0.25 },
        { r: Math.min(w, h) * 0.28, tilt: -0.5, speed: -0.25, alpha: 0.15 },
        { r: Math.min(w, h) * 0.38, tilt: 0.15, speed: 0.15, alpha: 0.1 },
      ];

      rings.forEach((ring) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * ring.speed * 0.01);
        ctx.scale(1, Math.sin(ring.tilt + t * 0.005));
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(248, 69, 29, ${ring.alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Small dot on ring
        const dotX = ring.r * Math.cos(t * ring.speed * 0.01);
        const dotY = ring.r * Math.sin(t * ring.speed * 0.01);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 69, 29, 0.8)`;
        ctx.fill();
        ctx.restore();
      });

      // Floating data fragments
      const fragments = [
        { angle: t * 0.008, dist: Math.min(w, h) * 0.42, size: 3 },
        { angle: t * 0.008 + 2.1, dist: Math.min(w, h) * 0.44, size: 2 },
        { angle: t * 0.008 + 4.2, dist: Math.min(w, h) * 0.41, size: 2.5 },
      ];

      fragments.forEach((f) => {
        const fx = cx + f.dist * Math.cos(f.angle);
        const fy = cy + f.dist * Math.sin(f.angle) * 0.4;
        ctx.beginPath();
        ctx.arc(fx, fy, f.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();
      });

      t++;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    const observer = new ResizeObserver(() => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={`block w-full h-full ${className}`} />;
}
