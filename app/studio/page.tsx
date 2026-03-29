'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/components/Providers';

type StudioStep = 'welcome' | 'expression' | 'space' | 'help' | 'finish' | 'submitted';

type SpaceOption =
  | 'Living room'
  | 'Bedroom'
  | 'Office'
  | 'Balcony'
  | 'Outdoor'
  | 'Gift'
  | 'Not sure';

type HelpOption =
  | 'Choosing the right piece'
  | 'Placement'
  | 'Sizing'
  | 'Styling'
  | 'Custom design'
  | 'Dream gift';

type StudioApiSuccess = {
  ok: true;
  brief: {
    id: string;
    createdAt: string;
    status: 'received';
    summary: string;
  };
  message: string;
};

type StudioApiError = {
  ok: false;
  error: string;
};

const SPACE_OPTIONS: SpaceOption[] = [
  'Living room',
  'Bedroom',
  'Office',
  'Balcony',
  'Outdoor',
  'Gift',
  'Not sure',
];

const HELP_OPTIONS: HelpOption[] = [
  'Choosing the right piece',
  'Placement',
  'Sizing',
  'Styling',
  'Custom design',
  'Dream gift',
];

export default function StudioPage() {
  const { isLoggedIn, setIsLoggedIn } = useStore();

  const [step, setStep] = useState<StudioStep>('welcome');

  const [message, setMessage] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [space, setSpace] = useState<SpaceOption | ''>('');
  const [helpType, setHelpType] = useState<HelpOption | ''>('');
  const [extraNote, setExtraNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedBriefId, setSubmittedBriefId] = useState('');
  const [submittedAt, setSubmittedAt] = useState('');
  const [submittedSummary, setSubmittedSummary] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const draft = sessionStorage.getItem('tulopots_studio_draft');
    if (!draft) return;

    try {
      const parsed = JSON.parse(draft) as {
        message?: string;
        imageFileName?: string;
        imagePreview?: string;
        referenceLink?: string;
        space?: SpaceOption;
        helpType?: HelpOption;
        extraNote?: string;
      };

      setMessage(parsed.message || '');
      setImageFileName(parsed.imageFileName || '');
      setImagePreview(parsed.imagePreview || '');
      setReferenceLink(parsed.referenceLink || '');
      setSpace(parsed.space || '');
      setHelpType(parsed.helpType || '');
      setExtraNote(parsed.extraNote || '');
    } catch {
      // ignore corrupt draft
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      'tulopots_studio_draft',
      JSON.stringify({
        message,
        imageFileName,
        imagePreview,
        referenceLink,
        space,
        helpType,
        extraNote,
      })
    );
  }, [message, imageFileName, imagePreview, referenceLink, space, helpType, extraNote]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const hasExpression = Boolean(
    message.trim() || referenceLink.trim() || imageFileName.trim()
  );

  const summaryLines = useMemo(() => {
    if (submittedSummary.trim()) {
      return submittedSummary
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    }

    const lines: string[] = [];

    if (message.trim()) lines.push(`What they shared: ${message.trim()}`);
    if (space) lines.push(`Space: ${space}`);
    if (helpType) lines.push(`Help needed: ${helpType}`);
    if (referenceLink.trim()) lines.push(`Reference link: ${referenceLink.trim()}`);
    if (imageFileName.trim()) lines.push(`Uploaded image: ${imageFileName.trim()}`);
    if (extraNote.trim()) lines.push(`Additional note: ${extraNote.trim()}`);

    return lines;
  }, [submittedSummary, message, space, helpType, referenceLink, imageFileName, extraNote]);

  function handleFileChange(file: File | null) {
    if (!file) return;

    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    const nextPreview = URL.createObjectURL(file);
    setImageFileName(file.name);
    setImagePreview(nextPreview);
    setSubmitError('');
  }

  function clearStudioDraft() {
    sessionStorage.removeItem('tulopots_studio_draft');
  }

  function resetStudio() {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    clearStudioDraft();
    setStep('welcome');
    setMessage('');
    setImageFileName('');
    setImagePreview('');
    setReferenceLink('');
    setSpace('');
    setHelpType('');
    setExtraNote('');
    setSubmitError('');
    setIsSubmitting(false);
    setSubmittedBriefId('');
    setSubmittedAt('');
    setSubmittedSummary('');
  }

  async function handleSubmitBrief() {
    setSubmitError('');

    if (!hasExpression) {
      setSubmitError('Please share at least a thought, an image, or a reference link.');
      return;
    }

    if (!space) {
      setSubmitError('Please tell us where this lives.');
      return;
    }

    if (!helpType) {
      setSubmitError('Please tell us what you need help with.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/studio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          imageFileName,
          imagePreview,
          referenceLink,
          space,
          helpType,
          extraNote,
        }),
      });

      const data = (await response.json()) as StudioApiSuccess | StudioApiError;

      if (!response.ok || !data.ok) {
        const errorMessage =
          'error' in data && data.error
            ? data.error
            : 'We could not save your studio brief right now.';
        setSubmitError(errorMessage);
        return;
      }

      setSubmittedBriefId(data.brief.id);
      setSubmittedAt(data.brief.createdAt);
      setSubmittedSummary(data.brief.summary);
      clearStudioDraft();
      setStep('submitted');
    } catch {
      setSubmitError('We could not save your studio brief right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <main
        className="relative min-h-screen overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at top, rgba(182,106,60,0.12), transparent 32%), linear-gradient(180deg, var(--tp-bg) 0%, color-mix(in srgb, var(--tp-bg) 88%, black 12%) 100%)',
          color: 'var(--tp-text)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.08]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'radial-gradient(circle at center, rgba(255,255,255,0.4) 0.8px, transparent 0.8px)',
              backgroundSize: '18px 18px',
            }}
          />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-16">
          <div
            className="w-full max-w-2xl rounded-[2rem] border p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.14)] md:p-12"
            style={{
              background: 'color-mix(in srgb, var(--tp-surface) 88%, transparent 12%)',
              borderColor: 'color-mix(in srgb, var(--tp-border) 82%, transparent 18%)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border text-sm tracking-[0.22em]"
              style={{
                borderColor: 'color-mix(in srgb, var(--tp-border) 78%, transparent 22%)',
                color: 'var(--tp-heading)',
              }}
            >
              STUDIO
            </div>

            <h1
              className="mx-auto max-w-xl text-3xl font-medium leading-tight md:text-5xl"
              style={{ color: 'var(--tp-heading)', fontFamily: 'Georgia, serif' }}
            >
              This space opens when you are signed in.
            </h1>

            <p
              className="mx-auto mt-5 max-w-xl text-sm leading-7 md:text-base"
              style={{ color: 'var(--tp-text)' }}
            >
              Studio is a private place for custom ideas, dream gifts, and pieces that are
              still hard to explain. Sign in first, then take your time.
            </p>

            <button
              type="button"
              onClick={() => setIsLoggedIn(true)}
              className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-full px-7 text-[11px] font-semibold uppercase tracking-[0.22em] transition duration-300 hover:-translate-y-0.5"
              style={{
                background: 'var(--tp-accent)',
                color: '#ffffff',
                boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
              }}
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at top, rgba(182,106,60,0.10), transparent 28%), radial-gradient(circle at 20% 20%, rgba(117,130,91,0.10), transparent 24%), linear-gradient(180deg, color-mix(in srgb, var(--tp-bg) 82%, black 18%) 0%, color-mix(in srgb, var(--tp-bg) 90%, black 10%) 100%)',
        color: 'var(--tp-text)',
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, rgba(255,255,255,0.45) 0.9px, transparent 0.9px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div
          className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(208,130,77,0.20) 0%, rgba(208,130,77,0.06) 42%, transparent 72%)',
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10 md:px-8 lg:px-12">
        <div className="grid w-full gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <section className="flex min-h-[560px] flex-col justify-center">
            <div className="max-w-2xl">
              <p
                className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: 'color-mix(in srgb, var(--tp-text) 70%, transparent 30%)' }}
              >
                TuloPots Studio
              </p>

              <h1
                className="text-4xl font-medium leading-[1.04] md:text-6xl xl:text-[4.8rem]"
                style={{ color: 'var(--tp-heading)', fontFamily: 'Georgia, serif' }}
              >
                A quiet place to say what you feel.
              </h1>

              <p
                className="mt-6 max-w-xl text-sm leading-7 md:text-base"
                style={{ color: 'color-mix(in srgb, var(--tp-text) 90%, transparent 10%)' }}
              >
                Art is not always easy to explain. Sometimes it begins as a feeling, a memory,
                a dream gift, a corner that does not yet feel complete. Start slowly. We are
                not rushing you.
              </p>

              <div className="mt-10 space-y-3">
                <ToneLine
                  active={step === 'welcome'}
                  title="Begin with what is on your mind"
                  body="No pressure. No perfect wording needed."
                />
                <ToneLine
                  active={step === 'expression'}
                  title="Show us, describe it, or do both"
                  body="A picture helps. A feeling helps too."
                />
                <ToneLine
                  active={step === 'space' || step === 'help'}
                  title="Let us understand where it belongs"
                  body="The right piece is shaped by place, mood, and purpose."
                />
                <ToneLine
                  active={step === 'finish' || step === 'submitted'}
                  title="We hold the thought gently"
                  body="So the dream can become something real."
                />
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div
              className="relative w-full max-w-[34rem] overflow-hidden rounded-[2rem] border shadow-[0_30px_90px_rgba(0,0,0,0.20)]"
              style={{
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--tp-surface) 86%, transparent 14%) 0%, color-mix(in srgb, var(--tp-card) 94%, black 6%) 100%)',
                borderColor: 'color-mix(in srgb, var(--tp-border) 72%, transparent 28%)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-24"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%)',
                }}
              />

              <div className="relative px-6 py-6 md:px-8 md:py-8">
                {step === 'welcome' && (
                  <StepShell
                    eyebrow="Step 1"
                    title="What are you trying to create?"
                    subtitle="It does not have to arrive fully formed. Begin where it hurts, where it hopes, or where it simply feels unfinished."
                  >
                    <div className="mt-8 flex flex-col items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setStep('expression')}
                        className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.24em] transition duration-300 hover:-translate-y-0.5"
                        style={{
                          background: 'var(--tp-accent)',
                          color: '#ffffff',
                          boxShadow: '0 16px 34px rgba(0,0,0,0.16)',
                        }}
                      >
                        Begin
                      </button>

                      <p
                        className="max-w-sm text-center text-xs leading-6"
                        style={{
                          color: 'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)',
                        }}
                      >
                        This space is here for custom ideas, meaningful gifts, or pieces you
                        can feel but cannot quite name yet.
                      </p>
                    </div>
                  </StepShell>
                )}

                {step === 'expression' && (
                  <StepShell
                    eyebrow="Step 2"
                    title="Show us what you see."
                    subtitle="Upload an image, paste a reference link, or simply describe the feeling. Any of the three is enough to begin."
                  >
                    <div className="mt-8 space-y-5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative flex min-h-[220px] w-full flex-col items-center justify-center rounded-[1.75rem] border px-6 py-8 text-center transition duration-300 hover:-translate-y-0.5"
                        style={{
                          borderColor:
                            'color-mix(in srgb, var(--tp-border) 76%, transparent 24%)',
                          background:
                            'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        }}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        />

                        {imagePreview ? (
                          <div className="w-full">
                            <div
                              className="mx-auto h-36 w-full overflow-hidden rounded-[1.25rem] border"
                              style={{
                                borderColor:
                                  'color-mix(in srgb, var(--tp-border) 70%, transparent 30%)',
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imagePreview}
                                alt="Uploaded inspiration preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <p
                              className="mt-4 text-xs uppercase tracking-[0.2em]"
                              style={{ color: 'var(--tp-heading)' }}
                            >
                              {imageFileName}
                            </p>
                          </div>
                        ) : (
                          <>
                            <div
                              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border text-lg"
                              style={{
                                borderColor:
                                  'color-mix(in srgb, var(--tp-border) 72%, transparent 28%)',
                                color: 'var(--tp-heading)',
                              }}
                            >
                              +
                            </div>
                            <p
                              className="text-sm font-medium"
                              style={{ color: 'var(--tp-heading)' }}
                            >
                              Upload an image
                            </p>
                            <p
                              className="mt-2 max-w-xs text-xs leading-6"
                              style={{
                                color:
                                  'color-mix(in srgb, var(--tp-text) 72%, transparent 28%)',
                              }}
                            >
                              A room, a texture, a flower, a gift idea, a sketch — anything
                              that helps us feel the direction.
                            </p>
                          </>
                        )}
                      </button>

                      <label className="block">
                        <span
                          className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em]"
                          style={{
                            color:
                              'color-mix(in srgb, var(--tp-text) 68%, transparent 32%)',
                          }}
                        >
                          Reference link
                        </span>
                        <input
                          value={referenceLink}
                          onChange={(e) => {
                            setReferenceLink(e.target.value);
                            setSubmitError('');
                          }}
                          placeholder="Paste a screenshot or inspiration link"
                          className="w-full rounded-[1.25rem] border px-5 py-4 text-sm outline-none transition"
                          style={{
                            borderColor:
                              'color-mix(in srgb, var(--tp-border) 76%, transparent 24%)',
                            background: 'rgba(255,255,255,0.03)',
                            color: 'var(--tp-text)',
                          }}
                        />
                      </label>

                      <label className="block">
                        <span
                          className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em]"
                          style={{
                            color:
                              'color-mix(in srgb, var(--tp-text) 68%, transparent 32%)',
                          }}
                        >
                          Say it in your own way
                        </span>
                        <textarea
                          value={message}
                          onChange={(e) => {
                            setMessage(e.target.value);
                            setSubmitError('');
                          }}
                          rows={5}
                          placeholder="Tell us what you are imagining, what it should feel like, or what you are struggling to find."
                          className="w-full resize-none rounded-[1.25rem] border px-5 py-4 text-sm leading-7 outline-none transition"
                          style={{
                            borderColor:
                              'color-mix(in srgb, var(--tp-border) 76%, transparent 24%)',
                            background: 'rgba(255,255,255,0.03)',
                            color: 'var(--tp-text)',
                          }}
                        />
                      </label>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <SoftButton onClick={() => setStep('welcome')} label="Back" />
                        <PrimaryButton
                          onClick={() => setStep('space')}
                          label="Continue"
                          disabled={!hasExpression}
                        />
                      </div>
                    </div>
                  </StepShell>
                )}

                {step === 'space' && (
                  <StepShell
                    eyebrow="Step 3"
                    title="Where does this live?"
                    subtitle="Place shapes meaning. A quiet office asks for one kind of presence. A gift asks for another."
                  >
                    <div className="mt-8 flex flex-wrap gap-3">
                      {SPACE_OPTIONS.map((option) => (
                        <ChoicePill
                          key={option}
                          label={option}
                          selected={space === option}
                          onClick={() => {
                            setSpace(option);
                            setSubmitError('');
                          }}
                        />
                      ))}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <SoftButton onClick={() => setStep('expression')} label="Back" />
                      <PrimaryButton
                        onClick={() => setStep('help')}
                        label="Continue"
                        disabled={!space}
                      />
                    </div>
                  </StepShell>
                )}

                {step === 'help' && (
                  <StepShell
                    eyebrow="Step 4"
                    title="What do you want us to help you with?"
                    subtitle="Choose the kind of guidance you need most. You can keep it simple."
                  >
                    <div className="mt-8 flex flex-wrap gap-3">
                      {HELP_OPTIONS.map((option) => (
                        <ChoicePill
                          key={option}
                          label={option}
                          selected={helpType === option}
                          onClick={() => {
                            setHelpType(option);
                            setSubmitError('');
                          }}
                        />
                      ))}
                    </div>

                    <label className="mt-6 block">
                      <span
                        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em]"
                        style={{
                          color:
                            'color-mix(in srgb, var(--tp-text) 68%, transparent 32%)',
                        }}
                      >
                        Anything else you want us to know
                      </span>
                      <textarea
                        value={extraNote}
                        onChange={(e) => {
                          setExtraNote(e.target.value);
                          setSubmitError('');
                        }}
                        rows={4}
                        placeholder="Optional — budget, colour restraint, mood, who it is for, what it should say without saying too much."
                        className="w-full resize-none rounded-[1.25rem] border px-5 py-4 text-sm leading-7 outline-none transition"
                        style={{
                          borderColor:
                            'color-mix(in srgb, var(--tp-border) 76%, transparent 24%)',
                          background: 'rgba(255,255,255,0.03)',
                          color: 'var(--tp-text)',
                        }}
                      />
                    </label>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <SoftButton onClick={() => setStep('space')} label="Back" />
                      <PrimaryButton
                        onClick={() => setStep('finish')}
                        label="Continue"
                        disabled={!helpType}
                      />
                    </div>
                  </StepShell>
                )}

                {step === 'finish' && (
                  <StepShell
                    eyebrow="Studio brief"
                    title="We hear the shape of it now."
                    subtitle="This is not final judgment. It is simply the beginning of a thoughtful brief."
                  >
                    <div
                      className="mt-8 rounded-[1.5rem] border p-5"
                      style={{
                        borderColor: 'color-mix(in srgb, var(--tp-border) 74%, transparent 26%)',
                        background: 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <div className="space-y-4">
                        {message.trim() && (
                          <DetailBlock label="What you shared" value={message.trim()} />
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                          <DetailBlock label="Space" value={space || 'Not specified'} />
                          <DetailBlock
                            label="Help needed"
                            value={helpType || 'Not specified'}
                          />
                        </div>

                        {referenceLink.trim() && (
                          <DetailBlock label="Reference link" value={referenceLink.trim()} />
                        )}

                        {imageFileName.trim() && (
                          <DetailBlock label="Uploaded image" value={imageFileName.trim()} />
                        )}

                        {extraNote.trim() && (
                          <DetailBlock label="Additional note" value={extraNote.trim()} />
                        )}
                      </div>
                    </div>

                    {submitError && (
                      <p
                        className="mt-5 text-sm leading-7"
                        style={{ color: '#e58f8f' }}
                      >
                        {submitError}
                      </p>
                    )}

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <SoftButton onClick={() => setStep('help')} label="Back" />
                      <PrimaryButton
                        onClick={handleSubmitBrief}
                        label={isSubmitting ? 'Holding your thought...' : 'Continue Brief'}
                        disabled={isSubmitting}
                      />
                    </div>
                  </StepShell>
                )}

                {step === 'submitted' && (
                  <StepShell
                    eyebrow="Held gently"
                    title="Your thought is with us now."
                    subtitle="Your studio brief has been received with care. The next layer can now turn this feeling into a guided custom direction."
                  >
                    <div
                      className="mt-8 rounded-[1.5rem] border p-5"
                      style={{
                        borderColor: 'color-mix(in srgb, var(--tp-border) 74%, transparent 26%)',
                        background: 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <div className="space-y-4">
                        <DetailBlock
                          label="Studio reference"
                          value={submittedBriefId || 'Being prepared'}
                        />
                        <DetailBlock
                          label="Received"
                          value={
                            submittedAt
                              ? new Date(submittedAt).toLocaleString()
                              : 'Just now'
                          }
                        />

                        <div>
                          <p
                            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                            style={{
                              color:
                                'color-mix(in srgb, var(--tp-text) 65%, transparent 35%)',
                            }}
                          >
                            Captured direction
                          </p>

                          <div className="mt-3 space-y-3">
                            {summaryLines.map((line, index) => (
                              <p
                                key={`${line}-${index}`}
                                className="text-sm leading-7"
                                style={{ color: 'var(--tp-text)' }}
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <SoftButton onClick={resetStudio} label="Start again" />
                      <PrimaryButton
                        onClick={() => setStep('finish')}
                        label="Review brief"
                      />
                    </div>
                  </StepShell>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function StepShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[34rem]">
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.26em]"
        style={{ color: 'color-mix(in srgb, var(--tp-text) 65%, transparent 35%)' }}
      >
        {eyebrow}
      </p>

      <h2
        className="mt-4 text-3xl font-medium leading-tight md:text-[2.55rem]"
        style={{ color: 'var(--tp-heading)', fontFamily: 'Georgia, serif' }}
      >
        {title}
      </h2>

      <p
        className="mt-4 max-w-xl text-sm leading-7 md:text-base"
        style={{ color: 'color-mix(in srgb, var(--tp-text) 88%, transparent 12%)' }}
      >
        {subtitle}
      </p>

      {children}
    </div>
  );
}

function ToneLine({
  active,
  title,
  body,
}: {
  active: boolean;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span
          className="mt-1 h-2.5 w-2.5 rounded-full transition duration-300"
          style={{
            background: active
              ? 'var(--tp-accent)'
              : 'color-mix(in srgb, var(--tp-border) 90%, transparent 10%)',
            boxShadow: active ? '0 0 0 8px rgba(208,130,77,0.10)' : 'none',
          }}
        />
        <span
          className="mt-2 h-full w-px"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--tp-border) 88%, transparent 12%) 0%, transparent 100%)',
          }}
        />
      </div>

      <div className="pb-5">
        <p
          className="text-sm font-medium"
          style={{ color: active ? 'var(--tp-heading)' : 'var(--tp-text)' }}
        >
          {title}
        </p>
        <p
          className="mt-1 text-sm leading-7"
          style={{ color: 'color-mix(in srgb, var(--tp-text) 76%, transparent 24%)' }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}

function ChoicePill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[48px] rounded-full px-5 text-sm transition duration-300 hover:-translate-y-0.5"
      style={{
        background: selected ? 'var(--tp-accent)' : 'rgba(255,255,255,0.04)',
        color: selected ? '#ffffff' : 'var(--tp-text)',
        border: `1px solid ${
          selected
            ? 'transparent'
            : 'color-mix(in srgb, var(--tp-border) 76%, transparent 24%)'
        }`,
        boxShadow: selected ? '0 14px 34px rgba(0,0,0,0.18)' : 'none',
      }}
    >
      {label}
    </button>
  );
}

function PrimaryButton({
  label,
  onClick,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.24em] transition duration-300"
      style={{
        background: disabled
          ? 'color-mix(in srgb, var(--tp-accent) 38%, transparent 62%)'
          : 'var(--tp-accent)',
        color: '#ffffff',
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 16px 34px rgba(0,0,0,0.16)',
      }}
    >
      {label}
    </button>
  );
}

function SoftButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.24em] transition duration-300 hover:-translate-y-0.5"
      style={{
        background: 'rgba(255,255,255,0.04)',
        color: 'var(--tp-text)',
        border: '1px solid color-mix(in srgb, var(--tp-border) 76%, transparent 24%)',
      }}
    >
      {label}
    </button>
  );
}

function DetailBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: 'color-mix(in srgb, var(--tp-text) 65%, transparent 35%)' }}
      >
        {label}
      </p>
      <p className="mt-2 text-sm leading-7" style={{ color: 'var(--tp-text)' }}>
        {value}
      </p>
    </div>
  );
}