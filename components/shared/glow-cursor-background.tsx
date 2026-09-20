"use client";

import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  age: number;
}

export function GlowCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let points: Point[] = [];
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };
    let lastMove = performance.now();
    let frame = 0;
    let running = true;

    const PRIMARY = "99, 179, 237";
    const SECONDARY = "56, 189, 248";
    const TRAIL_LENGTH = 34;
    const FOLLOW_SPEED = 0.16;
    const IDLE_TIMEOUT = 700;
    const FADE_DURATION = 900;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas!.width = width * window.devicePixelRatio;
      canvas!.height = height * window.devicePixelRatio;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      lastMove = performance.now();
    }

    function draw() {
      if (!running) return;
      frame++;
      ctx!.clearRect(0, 0, width, height);

      current.x += (target.x - current.x) * FOLLOW_SPEED;
      current.y += (target.y - current.y) * FOLLOW_SPEED;

      const idleElapsed = performance.now() - lastMove;
      let opacityFactor = 1;
      if (idleElapsed > IDLE_TIMEOUT) {
        opacityFactor = Math.max(
          0,
          1 - (idleElapsed - IDLE_TIMEOUT) / FADE_DURATION
        );
      }

      if (opacityFactor > 0) {
        points.unshift({ x: current.x, y: current.y, age: 0 });
      }
      points = points
        .map((pt) => ({ ...pt, age: pt.age + 1 }))
        .filter((pt) => pt.age < TRAIL_LENGTH);

      ctx!.globalCompositeOperation = "screen";

      points.forEach((pt, i) => {
        const lifeRatio = 1 - i / TRAIL_LENGTH;
        const radius = 10 + lifeRatio * 46;
        const pulse = 0.85 + Math.sin(frame * 0.05 + i) * 0.15;
        const alpha = lifeRatio * 0.22 * opacityFactor * pulse;

        const gradient = ctx!.createRadialGradient(
          pt.x,
          pt.y,
          0,
          pt.x,
          pt.y,
          radius
        );
        gradient.addColorStop(0, `rgba(${SECONDARY}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${PRIMARY}, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${PRIMARY}, 0)`);

        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        ctx!.fill();
      });

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    requestAnimationFrame(draw);

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
    />
  );
}