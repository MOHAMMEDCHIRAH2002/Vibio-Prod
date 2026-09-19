'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ringX = 0, ringY = 0;
    let mouseX = 0, mouseY = 0;
    let raf: number;
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    const onEnterLink = () => {
      if (dotRef.current) {
        dotRef.current.style.width = '12px';
        dotRef.current.style.height = '12px';
      }
      if (ringRef.current) {
        ringRef.current.style.width = '52px';
        ringRef.current.style.height = '52px';
        ringRef.current.style.borderColor = 'rgba(201,169,110,0.9)';
      }
    };

    const onLeaveLink = () => {
      if (dotRef.current) {
        dotRef.current.style.width = '8px';
        dotRef.current.style.height = '8px';
      }
      if (ringRef.current) {
        ringRef.current.style.width = '36px';
        ringRef.current.style.height = '36px';
        ringRef.current.style.borderColor = 'rgba(201,169,110,0.6)';
      }
    };

    // Use event delegation instead of attaching listeners to every link/button.
    const onDocumentOver = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest('a, button, [role="button"]');
      if (el) onEnterLink();
    };

    const onDocumentOut = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest('a, button, [role="button"]');
      if (el) onLeaveLink();
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onDocumentOver, { passive: true });
    document.addEventListener('mouseout', onDocumentOut, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onDocumentOver);
      document.removeEventListener('mouseout', onDocumentOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />
      <div ref={ringRef} className="cursor-ring" style={{ position: 'fixed', top: 0, left: 0, zIndex: 9998, pointerEvents: 'none' }} />
    </>
  );
}
