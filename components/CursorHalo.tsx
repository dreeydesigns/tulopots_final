'use client';

import { useEffect, useState } from 'react';

export function CursorHalo() {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.classList.add('cursor-halo-on');

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    const touchStart = () => {
      document.body.classList.remove('cursor-halo-on');
    };

    const enableHoverStates = () => {
      const selector =
        'a, button, input, textarea, select, [role="button"], .cursor-hover';

      const nodes = Array.from(document.querySelectorAll(selector));

      const onEnter = () => setActive(true);
      const onLeave = () => setActive(false);

      nodes.forEach((node) => {
        node.addEventListener('mouseenter', onEnter);
        node.addEventListener('mouseleave', onLeave);
      });

      return () => {
        nodes.forEach((node) => {
          node.removeEventListener('mouseenter', onEnter);
          node.removeEventListener('mouseleave', onLeave);
        });
      };
    };

    const cleanupHover = enableHoverStates();

    window.addEventListener('mousemove', move);
    window.addEventListener('touchstart', touchStart, { passive: true });

    return () => {
      cleanupHover();
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchstart', touchStart);
      document.body.classList.remove('cursor-halo-on');
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div
        className={`cursor-dot ${active ? 'is-active' : ''}`}
        style={{ left: pos.x, top: pos.y }}
      />
      <div
        className={`cursor-ring ${active ? 'is-active' : ''}`}
        style={{ left: pos.x, top: pos.y }}
      />
    </>
  );
}