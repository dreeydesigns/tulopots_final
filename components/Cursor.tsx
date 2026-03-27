'use client';

import { useEffect, useRef, useState } from 'react';

export default function CursorHalo() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [pressed, setPressed] = useState(false);

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (window.innerWidth < 1024) return;

    document.body.classList.add('cursor-halo-on');

    const move = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      setVisible(true);

      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
        dotRef.current.style.opacity = '1';
      }
    };

    const enter = () => setVisible(true);
    const leave = () => {
      setVisible(false);
      setActive(false);
      setPressed(false);
    };

    const down = () => setPressed(true);
    const up = () => setPressed(false);

    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'a, button, input, textarea, select, [role="button"], .cursor-hover'
      );

      setActive(Boolean(interactive));
    };

    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.18;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
        ringRef.current.style.opacity = visible ? '1' : '0';
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    window.addEventListener('mouseenter', enter);
    window.addEventListener('mouseleave', leave);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove('cursor-halo-on');

      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      window.removeEventListener('mouseenter', enter);
      window.removeEventListener('mouseleave', leave);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);

      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [visible]);

  return (
    <>
      <div
        ref={ringRef}
        className={`cursor-ring${active ? ' is-active' : ''}${pressed ? ' is-pressed' : ''}`}
      />
      <div
        ref={dotRef}
        className={`cursor-dot${active ? ' is-active' : ''}${pressed ? ' is-pressed' : ''}`}
      />
    </>
  );
}