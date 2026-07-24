import { useRef, useEffect, useCallback, useMemo, useState } from 'react';

const PARTICLE_COUNT = 800;
const MOUSE_REPEL_RADIUS = 120;
const MOUSE_REPEL_FORCE = 0.08;
const CLICK_DISPERSION_FORCE = 2.5;
const RETURN_EASE = 0.015;
const FLOAT_SPEED = 0.0003;
const DRIFT_SPEED = 0.0001;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function distance(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

function createParticle(width, height, index) {
  const x = Math.random() * width;
  const y = Math.random() * height;
  return {
    x,
    y,
    originX: x,
    originY: y,
    vx: 0,
    vy: 0,
    size: 0.5 + Math.random() * 2,
    baseSize: 0.5 + Math.random() * 2,
    opacity: 0.15 + Math.random() * 0.45,
    baseOpacity: 0.15 + Math.random() * 0.45,
    hue: 230 + Math.random() * 30,
    saturation: 60 + Math.random() * 30,
    lightness: 65 + Math.random() * 25,
    floatPhase: Math.random() * Math.PI * 2,
    floatSpeed: FLOAT_SPEED + Math.random() * FLOAT_SPEED * 0.5,
    floatAmplitude: 0.3 + Math.random() * 0.7,
    driftPhase: Math.random() * Math.PI * 2,
    driftSpeed: DRIFT_SPEED + Math.random() * DRIFT_SPEED * 0.5,
    driftAmplitude: 0.1 + Math.random() * 0.3,
    dispersionX: 0,
    dispersionY: 0,
    dispersionVx: 0,
    dispersionVy: 0,
    isDispersed: false,
    dispersionTime: 0,
  };
}

export default function ParticleHeroBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, isDown: false });
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const initParticles = useCallback((width, height) => {
    const count = Math.min(PARTICLE_COUNT, Math.floor((width * height) / 2000));
    particlesRef.current = Array.from({ length: count }, (_, i) =>
      createParticle(width, height, i)
    );
  }, []);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseRef.current.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  }, []);

  const handleMouseDown = useCallback((e) => {
    mouseRef.current.isDown = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dist = distance(mx, my, p.x, p.y);
      if (dist < MOUSE_REPEL_RADIUS * 2.5) {
        const angle = Math.atan2(p.y - my, p.x - mx);
        const force = (1 - dist / (MOUSE_REPEL_RADIUS * 2.5)) * CLICK_DISPERSION_FORCE;
        p.dispersionVx = Math.cos(angle) * force * (0.8 + Math.random() * 0.4);
        p.dispersionVy = Math.sin(angle) * force * (0.8 + Math.random() * 0.4);
        p.isDispersed = true;
        p.dispersionTime = 0;
      }
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    mouseRef.current.isDown = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.x = -9999;
    mouseRef.current.y = -9999;
    mouseRef.current.isDown = false;
  }, []);

  const render = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = Math.min((timestamp - lastTimeRef.current) / 16.667, 2);
    lastTimeRef.current = timestamp;
    timeRef.current += dt * 0.016;

    const time = timeRef.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      const floatX = Math.sin(time * p.floatSpeed * 60 + p.floatPhase) * p.floatAmplitude;
      const floatY = Math.cos(time * p.floatSpeed * 60 + p.floatPhase + 1) * p.floatAmplitude * 0.8;
      const driftX = Math.sin(time * p.driftSpeed * 30 + p.driftPhase) * p.driftAmplitude;
      const driftY = Math.cos(time * p.driftSpeed * 30 + p.driftPhase + 2) * p.driftAmplitude;

      const targetX = p.originX + floatX + driftX;
      const targetY = p.originY + floatY + driftY;

      const distToMouse = distance(mx, my, p.x, p.y);

      if (distToMouse < MOUSE_REPEL_RADIUS) {
        const angle = Math.atan2(p.y - my, p.x - mx);
        const force = (1 - distToMouse / MOUSE_REPEL_RADIUS) * MOUSE_REPEL_FORCE;
        p.vx -= Math.cos(angle) * force * dt;
        p.vy -= Math.sin(angle) * force * dt;
        p.size = lerp(p.size, p.baseSize * 1.5, 0.05 * dt);
        p.opacity = lerp(p.opacity, Math.min(p.baseOpacity * 1.8, 0.9), 0.08 * dt);
        p.lightness = lerp(p.lightness, 85, 0.05 * dt);
      } else {
        p.size = lerp(p.size, p.baseSize, 0.03 * dt);
        p.opacity = lerp(p.opacity, p.baseOpacity, 0.03 * dt);
        p.lightness = lerp(p.lightness, 65 + Math.random() * 25, 0.02 * dt);
      }

      if (p.isDispersed) {
        p.dispersionTime += dt * 0.016;
        p.x += p.dispersionVx * dt;
        p.y += p.dispersionVy * dt;
        p.dispersionVx *= 0.96;
        p.dispersionVy *= 0.96;

        const distFromOrigin = distance(p.x, p.y, targetX, targetY);
        if (distFromOrigin < 2 && Math.abs(p.dispersionVx) < 0.01 && Math.abs(p.dispersionVy) < 0.01) {
          p.isDispersed = false;
        }

        p.size = lerp(p.size, p.baseSize * (1.8 - Math.min(p.dispersionTime * 2, 1) * 0.8), 0.06 * dt);
        p.opacity = lerp(p.opacity, p.baseOpacity * (2 - Math.min(p.dispersionTime * 2, 1)), 0.06 * dt);
        p.hue = lerp(p.hue, 230 + Math.sin(p.dispersionTime * 5) * 20, 0.1 * dt);
      } else {
        p.x += (targetX - p.x) * RETURN_EASE * dt;
        p.y += (targetY - p.y) * RETURN_EASE * dt;
      }

      p.vx *= 0.92;
      p.vy *= 0.92;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const hue = p.hue;
      const sat = p.saturation;
      const light = p.lightness;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${p.opacity})`;
      ctx.fill();

      if (p.size > 1.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${p.opacity * 0.12})`;
        ctx.fill();
      }
    }

    animFrameRef.current = requestAnimationFrame(render);
  }, []);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    dimensionsRef.current = { width: width * dpr, height: height * dpr };

    if (particlesRef.current.length === 0) {
      initParticles(width * dpr, height * dpr);
    }
  }, [initParticles]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    if (!prefersReducedMotion) {
      animFrameRef.current = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [handleResize, render, prefersReducedMotion]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Canvas particle layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[1]"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'default' }}
      />

      {/* Animated gradient base */}
      <div
        className="absolute inset-0 z-[0] gradient-animated"
        style={{
          background: 'linear-gradient(135deg, #0f0f1a 0%, #0a0a14 25%, #0d0d1f 50%, #080818 75%, #0f0f1a 100%)',
          backgroundSize: '400% 400%',
          animation: 'heroGradient 20s ease infinite',
        }}
      />

      {/* Aurora glow layers */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.07]"
          style={{
            top: '10%',
            left: '15%',
            background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)',
            animation: 'auroraDrift1 25s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-[0.05]"
          style={{
            top: '60%',
            right: '10%',
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
            animation: 'auroraDrift2 30s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-[0.06]"
          style={{
            top: '40%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)',
            animation: 'auroraDrift3 22s ease-in-out infinite',
          }}
        />
      </div>

      {/* Light rays */}
      <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden opacity-[0.03]">
        <div
          className="absolute w-[2px] h-[200%] bg-gradient-to-b from-transparent via-white to-transparent"
          style={{
            left: '20%',
            top: '-50%',
            transform: 'rotate(15deg)',
            animation: 'lightRay 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[1px] h-[200%] bg-gradient-to-b from-transparent via-white to-transparent"
          style={{
            left: '45%',
            top: '-50%',
            transform: 'rotate(-8deg)',
            animation: 'lightRay 15s ease-in-out infinite 3s',
          }}
        />
        <div
          className="absolute w-[1.5px] h-[200%] bg-gradient-to-b from-transparent via-white to-transparent"
          style={{
            left: '75%',
            top: '-50%',
            transform: 'rotate(10deg)',
            animation: 'lightRay 18s ease-in-out infinite 6s',
          }}
        />
      </div>

      {/* Noise texture */}
      <div
        className="absolute inset-0 z-[4] pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Bottom fade for content readability */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-[5] pointer-events-none bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
    </div>
  );
}
