'use client';

import { useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'tulopots_loading_seen';
const WORDMARK_START_MS = 1200;
const FORCE_READY_MS = 1800;
const EXIT_START_AFTER_READY_MS = 1600;
const REMOVE_AFTER_READY_MS = 2200;

function PotMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M33 20.5C33 18.567 34.567 17 36.5 17H83.5C85.433 17 87 18.567 87 20.5C87 26.764 81.925 31.839 75.661 31.839H44.339C38.075 31.839 33 26.764 33 20.5Z"
        fill="currentColor"
      />
      <path
        d="M42.239 33.666H77.761C82.127 33.666 85.884 36.758 86.726 41.042L95.722 86.819C97.415 95.435 90.812 103.5 82.031 103.5H37.969C29.188 103.5 22.585 95.435 24.278 86.819L33.274 41.042C34.116 36.758 37.873 33.666 42.239 33.666Z"
        fill="currentColor"
      />
      <path
        d="M46 46.5C46 44.843 47.343 43.5 49 43.5H71C72.657 43.5 74 44.843 74 46.5C74 48.157 72.657 49.5 71 49.5H49C47.343 49.5 46 48.157 46 46.5Z"
        fill="rgba(247,242,234,0.22)"
      />
    </svg>
  );
}

export function LoadingScreen() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const didStart = useRef(false);
  const startTime = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      return;
    }

    didStart.current = true;
    startTime.current = performance.now();
    setVisible(true);

    const clearTimers = () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };

    const beginReadyPhase = () => {
      if (!didStart.current) {
        return;
      }

      didStart.current = false;
      const elapsed = performance.now() - startTime.current;
      const delay = Math.max(WORDMARK_START_MS - elapsed, 0);

      timers.current.push(
        window.setTimeout(() => {
          setReady(true);

          timers.current.push(
            window.setTimeout(() => {
              setExiting(true);
            }, EXIT_START_AFTER_READY_MS)
          );

          timers.current.push(
            window.setTimeout(() => {
              sessionStorage.setItem(SESSION_KEY, 'true');
              setVisible(false);
            }, REMOVE_AFTER_READY_MS)
          );
        }, delay)
      );
    };

    const handleLoad = () => {
      beginReadyPhase();
    };

    if (document.readyState === 'complete') {
      beginReadyPhase();
    } else {
      window.addEventListener('load', handleLoad, { once: true });
      timers.current.push(window.setTimeout(beginReadyPhase, FORCE_READY_MS));
    }

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimers();
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <>
      <div
        aria-hidden="true"
        className={`tp-loading-screen ${ready ? 'is-ready' : ''} ${
          exiting ? 'is-exiting' : ''
        }`}
      >
        <div className="tp-loading-screen__glow" />
        <div className="tp-loading-screen__stage">
          <PotMark className="tp-loading-screen__icon" />
          <div className="tp-loading-screen__wordmark">TuloPots</div>
        </div>
      </div>

      <style jsx global>{`
        .tp-loading-screen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: var(--tp-bg);
          opacity: 1;
          transition: opacity 600ms ease;
        }

        .tp-loading-screen.is-exiting {
          opacity: 0;
        }

        .tp-loading-screen__glow {
          position: absolute;
          left: 50%;
          top: 50%;
          width: clamp(180px, 28vw, 320px);
          height: clamp(180px, 28vw, 320px);
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: radial-gradient(
            circle,
            rgba(182, 106, 60, 0.22) 0%,
            rgba(182, 106, 60, 0.1) 38%,
            rgba(182, 106, 60, 0) 72%
          );
          animation: tp-loading-glow 1800ms ease-in-out infinite;
          filter: blur(6px);
        }

        .tp-loading-screen__stage {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          transform: translateY(-4%);
        }

        .tp-loading-screen__icon {
          position: relative;
          z-index: 2;
          width: 80px;
          height: 80px;
          color: var(--tp-accent);
          transform-origin: center center;
          animation: tp-pot-rotate 2400ms ease-in-out infinite;
          filter: drop-shadow(0 18px 30px rgba(138, 78, 45, 0.18));
          transition:
            transform 800ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 800ms ease;
        }

        .tp-loading-screen.is-ready .tp-loading-screen__icon {
          animation: none;
          transform: perspective(420px) rotateY(0deg) rotateX(0deg) translateY(-6px);
          filter: drop-shadow(0 14px 26px rgba(138, 78, 45, 0.12));
        }

        .tp-loading-screen__wordmark {
          position: absolute;
          left: 50%;
          top: calc(100% - 2px);
          transform: translate(-50%, 34px);
          opacity: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 28px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          white-space: nowrap;
          background: linear-gradient(
            90deg,
            var(--tp-accent) 40%,
            #f0c98a 50%,
            var(--tp-accent) 60%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          will-change: transform, opacity, background-position;
        }

        .tp-loading-screen.is-ready .tp-loading-screen__wordmark {
          animation:
            tp-wordmark-rise 800ms cubic-bezier(0.22, 1, 0.36, 1) forwards,
            tp-wordmark-shimmer 600ms ease-in-out 600ms forwards;
        }

        @keyframes tp-pot-rotate {
          0% {
            transform: perspective(400px) rotateY(-15deg) rotateX(5deg);
          }
          25% {
            transform: perspective(400px) rotateY(0deg) rotateX(0deg);
          }
          50% {
            transform: perspective(400px) rotateY(15deg) rotateX(-3deg);
          }
          75% {
            transform: perspective(400px) rotateY(0deg) rotateX(0deg);
          }
          100% {
            transform: perspective(400px) rotateY(-15deg) rotateX(5deg);
          }
        }

        @keyframes tp-loading-glow {
          0%,
          100% {
            opacity: 0.45;
            transform: translate(-50%, -50%) scale(0.92);
          }
          50% {
            opacity: 0.85;
            transform: translate(-50%, -50%) scale(1.04);
          }
        }

        @keyframes tp-wordmark-rise {
          0% {
            opacity: 0;
            transform: translate(-50%, 34px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes tp-wordmark-shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @media (min-width: 768px) {
          .tp-loading-screen__icon {
            width: 100px;
            height: 100px;
          }

          .tp-loading-screen__wordmark {
            font-size: 36px;
          }
        }

        @media (min-width: 1280px) {
          .tp-loading-screen__icon {
            width: 120px;
            height: 120px;
          }

          .tp-loading-screen__wordmark {
            font-size: 48px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tp-loading-screen__glow,
          .tp-loading-screen__icon,
          .tp-loading-screen__wordmark {
            animation: none !important;
            transition: none !important;
          }

          .tp-loading-screen__wordmark {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </>
  );
}
