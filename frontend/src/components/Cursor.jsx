import React, { useEffect, useRef, useState } from 'react';

const Cursor = () => {
  const [isBypassed, setIsBypassed] = useState(false);
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const coreRef = useRef(null);
  
  const mouseX = useRef(-100);
  const mouseY = useRef(-100);
  
  const isHovered = useRef(false);
  const particles = useRef([]);
  const rafIdRef = useRef(null);

  // 1. Device check: Bypass on touch/mobile devices
  useEffect(() => {
    const checkDevice = () => {
      const isTouch = window.matchMedia('(pointer: coarse)').matches || 
                      ('ontouchstart' in window) || 
                      navigator.maxTouchPoints > 0;
      setIsBypassed(isTouch);
    };
    checkDevice();
  }, []);

  // 2. Main Animation & Interaction Logic
  useEffect(() => {
    if (isBypassed) return;

    // Add active body class to hide OS pointer
    document.body.classList.add('custom-cursor-active');

    // Canvas init
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctxRef.current = canvas.getContext('2d');
    }

    // Create particles on mouse movement
    const createParticles = (x, y) => {
      const count = 2; // spawn 2 particles per mousemove for a nice dense trail
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        
        let color;
        if (isHovered.current) {
          // Spawn site primary (#22D3EE) and white (#FFFFFF) on hover
          color = Math.random() > 0.5 ? '#22D3EE' : '#FFFFFF';
        } else {
          // Spawn site primary cyan (#22D3EE) and blue (#3b82f6) in default state
          color = Math.random() > 0.5 ? '#22D3EE' : '#3b82f6';
        }

        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 3,
          alpha: 1.0,
          decay: Math.random() * 0.02 + 0.015,
          color,
        });
      }
    };

    // Event Handlers
    const handleMouseMove = (e) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
      createParticles(e.clientX, e.clientY);
    };

    const handleMouseOver = (e) => {
      const interactive = e.target.closest('a, button, input, select, textarea, [role="button"], [data-hover]');
      if (interactive) {
        isHovered.current = true;
        coreRef.current?.classList.add('hovered');
      } else {
        isHovered.current = false;
        coreRef.current?.classList.remove('hovered');
      }
    };

    const handleMouseLeave = () => {
      isHovered.current = false;
      coreRef.current?.classList.remove('hovered');
    };

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    // Attach listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);

    // RAF Animation Loop
    const loop = () => {
      const cv = canvasRef.current;
      const ctx = ctxRef.current;

      if (cv && ctx) {
        ctx.clearRect(0, 0, cv.width, cv.height);
        
        const activeParticles = [];
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < particles.current.length; i++) {
          const p = particles.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.size *= 0.96; // shrink in size
          p.alpha -= p.decay; // fade in opacity
          
          if (p.alpha > 0 && p.size > 0.1) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.fill();
            activeParticles.push(p);
          }
        }
        ctx.restore();
        particles.current = activeParticles;
      }

      // Core: exact screen coordinates with zero latency + hover scale
      if (coreRef.current) {
        const coreScale = isHovered.current ? 1.6 : 1.0;
        coreRef.current.style.transform = `translate3d(${mouseX.current}px, ${mouseY.current}px, 0) translate(-50%, -50%) scale(${coreScale})`;
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    // Cleanup event listeners and cancel animation frame on unmount
    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isBypassed]);

  if (isBypassed) return null;

  return (
    <div className="custom-cursor-container">
      <canvas ref={canvasRef} className="custom-cursor-canvas" />
      <div ref={coreRef} className="custom-cursor-core" />
    </div>
  );
};

export default Cursor;