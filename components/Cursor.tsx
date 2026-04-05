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
  const visibleRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const pointerMedia = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    let enabled = false;

    const syncSupport = () => {
      enabled = pointerMedia.matches && !reducedMotionMedia.matches;

      if (!enabled) {
        document.body.classList.remove('cursor-halo-on');
        visibleRef.current = false;
        setVisible(false);
        setActive(false);
        setPressed(false);
        if (dotRef.current) {
          dotRef.current.style.opacity = '0';
        }
        if (ringRef.current) {
          ringRef.current.style.opacity = '0';
        }
        return;
      }

      document.body.classList.add('cursor-halo-on');
    };

    const move = (e: PointerEvent) => {
      if (!enabled || e.pointerType !== 'mouse') return;

      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (!visibleRef.current) {
        ring.current.x = e.clientX;
        ring.current.y = e.clientY;
      }
      visibleRef.current = true;
      setVisible(true);

      if (dotRef.current) {
        dotRef.current.style.left = `${mouse.current.x}px`;
        dotRef.current.style.top = `${mouse.current.y}px`;
        dotRef.current.style.opacity = '1';
      }
    };

    const enter = (e?: PointerEvent) => {
      if (!enabled) return;
      if (e && e.pointerType !== 'mouse') return;
      visibleRef.current = true;
      setVisible(true);
    };
    const leave = () => {
      visibleRef.current = false;
      setVisible(false);
      setActive(false);
      setPressed(false);
      if (dotRef.current) {
        dotRef.current.style.opacity = '0';
      }
      if (ringRef.current) {
        ringRef.current.style.opacity = '0';
      }
    };

    const down = (e: PointerEvent) => {
      if (!enabled || e.pointerType !== 'mouse') return;
      setPressed(true);
    };
    const up = (e: PointerEvent) => {
      if (!enabled || e.pointerType !== 'mouse') return;
      setPressed(false);
    };

    const over = (e: PointerEvent) => {
      if (!enabled || e.pointerType !== 'mouse') return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'a, button, input, textarea, select, [role="button"], .cursor-hover'
      );

      setActive(Boolean(interactive));
    };

    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.32;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.32;

      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
        ringRef.current.style.opacity = visibleRef.current ? '1' : '0';
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    syncSupport();

    pointerMedia.addEventListener('change', syncSupport);
    reducedMotionMedia.addEventListener('change', syncSupport);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over);
    window.addEventListener('pointerenter', enter as EventListener);
    window.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('blur', leave);

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove('cursor-halo-on');
      pointerMedia.removeEventListener('change', syncSupport);
      reducedMotionMedia.removeEventListener('change', syncSupport);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      window.removeEventListener('pointerenter', enter as EventListener);
      window.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('blur', leave);

      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

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
