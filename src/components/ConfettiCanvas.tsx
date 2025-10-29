import { useEffect, useRef } from "react";

interface ConfettiCanvasProps {
  durationMs?: number;
  count?: number;
}

export default function ConfettiCanvas({ durationMs = 3500, count = 60 }: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    type Particle = { 
      x: number; 
      y: number; 
      vx: number; 
      vy: number; 
      size: number; 
      color: string; 
      rot: number; 
      vr: number; 
      life: number; 
    };
    
    const colors = ["#EF4444","#F59E0B","#10B981","#06B6D4","#6366F1","#EC4899"];
    const particles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 2.5,
        vy: 1 + Math.random() * 3,
        size: 6 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
        life: 1
      });
    }

    let start = performance.now();
    let rafId: number;

    function draw(now: number) {
      const t = now - start;
      const progress = Math.min(1, t / durationMs);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (const p of particles) {
        p.vy += 0.02;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life = 1 - progress;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
        ctx.restore();
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(draw);
      } else {
        window.removeEventListener("resize", resize);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        cancelAnimationFrame(rafId);
      }
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [count, durationMs]);

  return null;
}
