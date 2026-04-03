'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useStore } from '@/components/Providers';
import { PotMark } from '@/components/PotMark';
import { GuideQuestion } from './GuideQuestion';
import { GuideTimer } from './GuideTimer';

const LOCAL_GUIDE_KEY = 'tulopots_guide_seen';
const SESSION_GUIDE_KEY = 'tulopots_guide_prompted';
const TIMER_SECONDS = 15;

const QUESTIONS = [
  {
    key: 'forWhom',
    label: 'This is for...',
    options: [
      { label: 'My home', value: 'home' },
      { label: 'A space I design for others', value: 'designer' },
      { label: 'A workplace or studio', value: 'workplace' },
      { label: 'A gift for someone', value: 'gift' },
    ],
  },
  {
    key: 'intent',
    label: 'I am looking for...',
    options: [
      { label: 'Something that grounds the space', value: 'grounds' },
      { label: 'A statement object', value: 'statement' },
      { label: 'Something that works with plants', value: 'plants' },
      { label: 'I will know it when I see it', value: 'discover' },
    ],
  },
  {
    key: 'placement',
    label: 'It will go in...',
    options: [
      { label: 'A living room or bedroom', value: 'living' },
      { label: 'An office or studio', value: 'office' },
      { label: 'An outdoor or open space', value: 'outdoor' },
      { label: 'I am not sure yet', value: 'unsure' },
    ],
  },
] as const;

type Answers = {
  forWhom?: string;
  intent?: string;
  placement?: string;
};

type Phase = 'hidden' | 'questions' | 'matching' | 'found' | 'closing';

export function FindYourForm() {
  const router = useRouter();
  const { isLoggedIn, hasSeenGuide, setHasSeenGuide, theme } = useStore();
  const [phase, setPhase] = useState<Phase>('hidden');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const timers = useRef<number[]>([]);
  const startedAt = useRef(0);

  const activeQuestion = QUESTIONS[questionIndex];
  const isOpen = phase !== 'hidden';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedSeen = localStorage.getItem(LOCAL_GUIDE_KEY) === 'true';
    const sessionPrompted = sessionStorage.getItem(SESSION_GUIDE_KEY) === 'true';

    if (!isLoggedIn || hasSeenGuide || storedSeen || sessionPrompted || phase !== 'hidden') {
      return;
    }

    sessionStorage.setItem(SESSION_GUIDE_KEY, 'true');
    startedAt.current = Date.now();
    setSecondsLeft(TIMER_SECONDS);
    setQuestionIndex(0);
    setHasInteracted(false);
    setAnswers({});
    setPhase('questions');
  }, [hasSeenGuide, isLoggedIn, phase]);

  useEffect(() => {
    if (!isOpen || phase !== 'questions' || hasInteracted) {
      return;
    }

    const interval = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt.current) / 1000);
      const next = Math.max(0, TIMER_SECONDS - elapsedSeconds);
      setSecondsLeft(next);

      if (next <= 0) {
        window.clearInterval(interval);
        dismissGuide();
      }
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [hasInteracted, isOpen, phase]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const overlayStyle = useMemo(
    () => ({
      background:
        theme === 'dark' ? 'rgba(20, 12, 8, 0.65)' : 'rgba(247, 242, 234, 0.75)',
    }),
    [theme]
  );

  function rememberGuideSeen() {
    setHasSeenGuide(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_GUIDE_KEY, 'true');
    }
  }

  function dismissGuide() {
    rememberGuideSeen();
    setPhase('closing');

    timers.current.push(
      window.setTimeout(() => {
        setPhase('hidden');
      }, 300)
    );
  }

  function redirectToResults(nextAnswers: Answers) {
    rememberGuideSeen();
    setPhase('found');

    timers.current.push(
      window.setTimeout(() => {
        setPhase('hidden');
        const params = new URLSearchParams({
          guide: 'true',
          placement: nextAnswers.placement || 'unsure',
          intent: nextAnswers.intent || 'discover',
          for: nextAnswers.forWhom || 'home',
        });
        router.push(`/pots?${params.toString()}`);
      }, 780)
    );
  }

  function handleSelect(value: string) {
    setHasInteracted(true);
    const key = QUESTIONS[questionIndex].key;
    const nextAnswers = { ...answers, [key]: value } as Answers;

    setAnswers(nextAnswers);

    if (questionIndex < QUESTIONS.length - 1) {
      timers.current.push(
        window.setTimeout(() => {
          setQuestionIndex((current) => current + 1);
        }, 180)
      );
      return;
    }

    setPhase('matching');
    timers.current.push(
      window.setTimeout(() => {
        redirectToResults(nextAnswers);
      }, 600)
    );
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[1000] flex items-end justify-center px-4 py-4 md:items-center md:px-6 ${
          phase === 'closing' ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-300`}
        style={overlayStyle}
      >
        <div className="absolute inset-0 backdrop-blur-[12px]" />

        <section
          className={`relative w-full overflow-hidden ${
            phase === 'questions'
              ? 'translate-y-0 opacity-100'
              : phase === 'closing'
              ? 'translate-y-5 opacity-0'
              : 'translate-y-0 opacity-100'
          } min-h-[calc(100vh-2rem)] border border-[var(--tp-accent)] px-6 py-7 shadow-[0_24px_60px_rgba(0,0,0,0.3)] transition-all duration-300 md:min-h-0 md:max-w-[480px] md:rounded-[16px]`}
          style={{
            background: theme === 'dark' ? '#1A100A' : '#F7F2EA',
            color: theme === 'dark' ? 'var(--tp-heading)' : 'var(--tp-text)',
          }}
        >
          <div className="mx-auto flex max-w-[420px] flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="w-10" />
              <div className="flex justify-center">
                <PotMark className="h-10 w-10 text-[var(--tp-accent)]" />
              </div>
              <button
                type="button"
                onClick={dismissGuide}
                aria-label="Close Find Your Form"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition"
                style={{
                  borderColor: 'color-mix(in srgb, var(--tp-accent) 28%, transparent 72%)',
                  background:
                    theme === 'dark'
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(20,12,8,0.03)',
                  color: 'var(--tp-accent)',
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {phase === 'questions' ? (
              <>
                <p className="mt-4 text-center serif-display text-xl italic text-[var(--tp-accent)]">
                  Let us help you find the right form for your space.
                </p>

                <div className="mt-6 flex justify-center gap-2">
                  {QUESTIONS.map((question, index) => (
                    <span
                      key={question.key}
                      className="h-2 w-2 rounded-full transition-all duration-300"
                      style={{
                        background:
                          index === questionIndex
                            ? 'var(--tp-accent)'
                            : 'color-mix(in srgb, var(--tp-accent) 24%, transparent 76%)',
                        transform: index === questionIndex ? 'scale(1.12)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>

                <div className="mt-8 flex-1">
                  <GuideQuestion
                    key={activeQuestion.key}
                    label={activeQuestion.label}
                    options={activeQuestion.options}
                    selectedValue={answers[activeQuestion.key as keyof Answers]}
                    onSelect={handleSelect}
                  />
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={dismissGuide}
                    className="text-sm underline underline-offset-4 tp-text-soft"
                  >
                    I know what I want
                  </button>

                  <GuideTimer
                    secondsLeft={secondsLeft}
                    duration={TIMER_SECONDS}
                    paused={hasInteracted}
                  />
                </div>
              </>
            ) : (
              <div className="flex min-h-[60vh] flex-col items-center justify-center text-center md:min-h-[360px]">
                <PotMark
                  className={`h-12 w-12 text-[var(--tp-accent)] ${
                    phase === 'matching' ? 'animate-[tp-pot-spin_600ms_linear_infinite]' : ''
                  }`}
                />
                <p className="mt-6 serif-display text-2xl italic text-[var(--tp-accent)]">
                  Here is what we found for you.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes tp-guide-fade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes tp-pot-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
