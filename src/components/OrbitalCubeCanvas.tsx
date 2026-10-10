import { useEffect, useRef } from "react";

export default function OrbitalCubeCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w; canvas.height = h;

    let t = 0;

    // Background scatter dots
    const bgDots = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      size: 0.8 + Math.random() * 1.6,
      opacity: 0.06 + Math.random() * 0.18,
    }));

    // Orbital rings config
    const rings = [
      { rx: 0.18, ry: 0.07, speed: 0.006, dotCount: 1, opacity: 0.5, lw: 0.8 },
      { rx: 0.26, ry: 0.10, speed: -0.004, dotCount: 2, opacity: 0.40, lw: 0.7 },
      { rx: 0.35, ry: 0.14, speed: 0.003, dotCount: 1, opacity: 0.30, lw: 0.6 },
      { rx: 0.44, ry: 0.18, speed: -0.0025, dotCount: 2, opacity: 0.22, lw: 0.5 },
      { rx: 0.54, ry: 0.22, speed: 0.002, dotCount: 1, opacity: 0.16, lw: 0.45 },
      { rx: 0.64, ry: 0.26, speed: -0.0015, dotCount: 2, opacity: 0.10, lw: 0.4 },
    ];

    function drawCube(cx: number, cy: number, size: number, angle: number) {
      if (!ctx) return;
      // Isometric cube wireframe
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const s = size;
      // 8 vertices of a cube, rotated
      const verts3d: [number, number, number][] = [
        [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
        [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s],
      ];

      // Rotate around Y axis
      const rotated = verts3d.map(([x, y, z]) => {
        const nx = x * cos - z * sin;
        const nz = x * sin + z * cos;
        return [nx, y, nz] as [number, number, number];
      });

      // Project to 2D (simple orthographic, slight isometric tilt)
      const proj = rotated.map(([x, y, z]) => [
        cx + x + z * 0.5,
        cy + y * 0.86 + z * 0.25,
      ] as [number, number]);

      const edges = [
        [0,1],[1,2],[2,3],[3,0], // back face
        [4,5],[5,6],[6,7],[7,4], // front face
        [0,4],[1,5],[2,6],[3,7], // connecting edges
      ];

      edges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(proj[a][0], proj[a][1]);
        ctx.lineTo(proj[b][0], proj[b][1]);
        ctx.strokeStyle = "rgba(248, 69, 29, 0.70)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Vertex glows
      proj.forEach(([px, py]) => {
        const grd = ctx.createRadialGradient(px, py, 0, px, py, 6);
        grd.addColorStop(0, "rgba(248, 69, 29, 0.7)");
        grd.addColorStop(1, "rgba(248, 69, 29, 0)");
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 216, 204, 0.9)";
        ctx.fill();
      });
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.52;
      const cy = h * 0.50;
      const scale = Math.min(w, h);

      // BG dots
      bgDots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 69, 29, ${d.opacity})`;
        ctx.fill();
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = w; if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h; if (d.y > h) d.y = 0;
      });

      // Core glow
      const coreSize = scale * 0.06;
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 4);
      coreGlow.addColorStop(0, "rgba(248, 69, 29, 0.22)");
      coreGlow.addColorStop(0.5, "rgba(248, 69, 29, 0.06)");
      coreGlow.addColorStop(1, "rgba(248, 69, 29, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, coreSize * 4, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow;
      ctx.fill();

      // Orbital rings
      rings.forEach((ring, ri) => {
        const angle = t * ring.speed;
        const rx = scale * ring.rx;
        const ry = scale * ring.ry;

        ctx.save();
        ctx.translate(cx, cy);
        // slight overall tilt
        ctx.rotate(0.15);
        ctx.scale(1, ry / rx);

        // Ring ellipse
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(248, 69, 29, ${ring.opacity})`;
        ctx.lineWidth = ring.lw;
        ctx.stroke();

        // Dots on ring
        for (let d = 0; d < ring.dotCount; d++) {
          const da = angle + (d * Math.PI * 2) / ring.dotCount;
          const dx = rx * Math.cos(da);
          const dy = rx * Math.sin(da);

          ctx.save();
          ctx.scale(1, rx / ry); // undo ry scale for circular dots
          const dotR = 3 + ri * 0.3;
          const grd = ctx.createRadialGradient(dx, dy * (rx / ry), 0, dx, dy * (rx / ry), dotR * 4);
          grd.addColorStop(0, "rgba(255, 216, 204, 0.9)");
          grd.addColorStop(1, "rgba(248, 69, 29, 0)");
          ctx.beginPath();
          ctx.arc(dx, dy * (rx / ry), dotR * 4, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(dx, dy * (rx / ry), dotR, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 216, 204, 0.95)";
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      });

      // Rotating wireframe cube at center
      drawCube(cx, cy, scale * 0.055, t * 0.008);

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
