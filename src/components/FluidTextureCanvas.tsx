import { useEffect, useRef } from "react";

const IVORY = [255, 254, 242] as const;
const PALE_PEACH = [255, 233, 226] as const;
const PEACH = [255, 216, 204] as const;
const ORANGE = [248, 69, 29] as const;

const lerp = (a: number, b: number, amount: number) => a + (b - a) * amount;
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const normalized = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return normalized * normalized * (3 - 2 * normalized);
};

function hash(x: number, y: number) {
  let value = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function noise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);

  const top = lerp(hash(x0, y0), hash(x0 + 1, y0), sx);
  const bottom = lerp(hash(x0, y0 + 1), hash(x0 + 1, y0 + 1), sx);
  return lerp(top, bottom, sy);
}

function fbm(x: number, y: number, octaves: number) {
  let value = 0;
  let amplitude = 0.56;
  let frequency = 1;
  let total = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    value += noise(x * frequency, y * frequency) * amplitude;
    total += amplitude;
    frequency *= 1.92;
    amplitude *= 0.48;
  }

  return value / total;
}

function FluidTextureCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let imageData: ImageData;
    let lastFrame = 0;
    let targetIntensity = 1;
    let currentIntensity = 1;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let isVisible = !document.hidden;

    const intensityBySection: Record<string, number> = {
      "atmosphere-hero": 1,
      "atmosphere-vision": 0.52,
      "atmosphere-proof": 0.68,
      "atmosphere-digibot": 0.56,
      "atmosphere-services": 0.72,
      "atmosphere-process": 0.44,
      "atmosphere-tech": 0.88,
      "atmosphere-contact": 0.54,
      "atmosphere-footer": 0.34,
    };

    const resize = () => {
      const mobile = window.innerWidth < 768;
      const longEdge = mobile ? 156 : 256;
      const aspect = window.innerWidth / Math.max(window.innerHeight, 1);

      if (aspect >= 1) {
        width = longEdge;
        height = Math.max(112, Math.round(longEdge / aspect));
      } else {
        height = longEdge;
        width = Math.max(112, Math.round(longEdge * aspect));
      }

      canvas.width = width;
      canvas.height = height;
      imageData = context.createImageData(width, height);
    };

    const updateSectionIntensity = () => {
      const viewportCenter = window.scrollY + window.innerHeight * 0.5;
      const sections = document.querySelectorAll<HTMLElement>("section, footer");
      let closestDistance = Number.POSITIVE_INFINITY;
      let nextIntensity = 0.58;

      sections.forEach((section) => {
        const center = section.offsetTop + section.offsetHeight * 0.5;
        const distance = Math.abs(center - viewportCenter);
        if (distance >= closestDistance) return;

        closestDistance = distance;
        const atmosphereClass = Array.from(section.classList).find((name) => name.startsWith("atmosphere-"));
        nextIntensity = atmosphereClass ? (intensityBySection[atmosphereClass] ?? 0.58) : 0.58;
      });

      targetIntensity = nextIntensity;
    };

    const render = (elapsedSeconds: number) => {
      currentIntensity = lerp(currentIntensity, targetIntensity, reducedMotion ? 1 : 0.025);
      const mobileFactor = window.innerWidth < 768 ? 0.72 : 1;
      const intensity = currentIntensity * mobileFactor;
      const pixels = imageData.data;
      const aspect = width / height;
      let pixelIndex = 0;

      for (let y = 0; y < height; y += 1) {
        const normalizedY = y / height;
        for (let x = 0; x < width; x += 1) {
          const normalizedX = x / width;
          const px = normalizedX * 3.4 * aspect;
          const py = normalizedY * 3.4;

          const warpA = fbm(
            px * 0.58 + elapsedSeconds * 0.16,
            py * 0.58 - elapsedSeconds * 0.12,
            2,
          );
          const warpB = fbm(
            px * 0.66 - elapsedSeconds * 0.21 + 11.7,
            py * 0.66 + elapsedSeconds * 0.15 + 4.3,
            2,
          );

          const warpedX = px + (warpA - 0.5) * 2.46;
          const warpedY = py + (warpB - 0.5) * 2.24;
          const primary = fbm(
            warpedX + elapsedSeconds * 0.17,
            warpedY - elapsedSeconds * 0.13,
            4,
          );
          const secondary = fbm(
            warpedX * 1.7 - elapsedSeconds * 0.38 + 19.1,
            warpedY * 1.7 + elapsedSeconds * 0.29 + 7.6,
            3,
          );
          const localRipple =
            Math.sin(
              warpedX * 5.2 +
                warpedY * 4.1 +
                secondary * 7 +
                elapsedSeconds * 2.35,
            ) * 0.04;

          const centerX = (normalizedX - 0.5) / 0.32;
          const centerY = (normalizedY - 0.47) / 0.38;
          const distanceFromCenter = Math.sqrt(centerX * centerX + centerY * centerY);
          const quietCenter = lerp(0.34, 1, smoothstep(0.28, 1.08, distanceFromCenter));

          const organicField = primary * 0.74 + secondary * 0.22 + localRipple;
          const paleAmount =
            smoothstep(0.32, 0.78, organicField) * 0.46 * intensity * quietCenter;

          const movingContour =
            0.5 +
            (secondary - 0.5) * 0.18 +
            Math.sin(elapsedSeconds * 1.35 + warpA * 8) * 0.025;
          const contourDistance = Math.abs(primary - movingContour);
          const contour = Math.exp(-contourDistance * contourDistance * 260);
          const orangeAmount =
            contour *
            smoothstep(0.38, 0.78, secondary) *
            0.3 *
            intensity *
            quietCenter;

          const peachAmount =
            smoothstep(0.46, 0.74, organicField) *
            (0.18 + secondary * 0.18) *
            intensity *
            quietCenter;

          let red = lerp(IVORY[0], PALE_PEACH[0], paleAmount);
          let green = lerp(IVORY[1], PALE_PEACH[1], paleAmount);
          let blue = lerp(IVORY[2], PALE_PEACH[2], paleAmount);

          red = lerp(red, PEACH[0], peachAmount);
          green = lerp(green, PEACH[1], peachAmount);
          blue = lerp(blue, PEACH[2], peachAmount);

          red = lerp(red, ORANGE[0], orangeAmount);
          green = lerp(green, ORANGE[1], orangeAmount);
          blue = lerp(blue, ORANGE[2], orangeAmount);

          pixels[pixelIndex] = red;
          pixels[pixelIndex + 1] = green;
          pixels[pixelIndex + 2] = blue;
          pixels[pixelIndex + 3] = 255;
          pixelIndex += 4;
        }
      }

      context.putImageData(imageData, 0, 0);
    };

    const animate = (timestamp: number) => {
      if (!isVisible) {
        frame = requestAnimationFrame(animate);
        return;
      }

      const frameInterval = window.innerWidth < 768 ? 1000 / 30 : 1000 / 45;
      if (timestamp - lastFrame >= frameInterval) {
        lastFrame = timestamp;
        render(reducedMotion ? 8.4 : timestamp / 1000);
      }

      if (!reducedMotion) frame = requestAnimationFrame(animate);
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      cancelAnimationFrame(frame);
      render(8.4);
      if (!reducedMotion) frame = requestAnimationFrame(animate);
    };
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    const handleResize = () => {
      resize();
      render(reducedMotion ? 8.4 : performance.now() / 1000);
    };

    resize();
    updateSectionIntensity();
    render(8.4);
    if (!reducedMotion) frame = requestAnimationFrame(animate);

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", updateSectionIntensity, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateSectionIntensity);
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="fluid-texture" aria-hidden="true" />;
}

export default FluidTextureCanvas;
