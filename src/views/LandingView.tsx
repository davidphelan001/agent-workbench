import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface LandingViewProps {
  onExplore: () => void;
}

type ButtonMode = { kind: 'flow' } | { kind: 'follow'; x: number; y: number };

function restingPosition() {
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 + 130 };
}

export function LandingView({ onExplore }: LandingViewProps) {
  const [exiting, setExiting] = useState(false);
  // Starts in normal document flow (centred below the wordmark) so there's a
  // sensible resting spot before any pointer input — touch devices never
  // leave this mode. The first mousemove switches to fixed positioning and
  // the button starts trailing the cursor from then on.
  const [mode, setMode] = useState<ButtonMode>({ kind: 'flow' });
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      videoRef.current?.pause();
    }
  }, []);

  function handleExplore() {
    setExiting(true);
    window.setTimeout(onExplore, 300);
  }

  function handleMouseMove(e: React.MouseEvent) {
    setMode({ kind: 'follow', x: e.clientX, y: e.clientY });
  }

  function handleMouseLeave() {
    // Ease back to a resting spot rather than snapping back into flow layout.
    setMode(m => (m.kind === 'follow' ? { kind: 'follow', ...restingPosition() } : m));
  }

  const isFollowing = mode.kind === 'follow';

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'fixed inset-0 z-50 overflow-hidden bg-black transition-opacity duration-300 ease-out',
        exiting ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/hephwerk-hero.mov"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
      />
      {/* Scrim guarantees the wordmark/button stay legible regardless of the
          video's own brightness/content. */}
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative flex h-full flex-col items-center justify-center gap-9">
        <h1 className="font-headings text-[clamp(3rem,9vw,7rem)] leading-none font-normal tracking-[-0.02em] text-white">
          Hephwerk
        </h1>

        <button
          type="button"
          onClick={handleExplore}
          style={
            mode.kind === 'follow'
              ? {
                  position: 'fixed',
                  left: 0,
                  top: 0,
                  transform: `translate3d(${mode.x}px, ${mode.y}px, 0) translate(-50%, 44px)`,
                }
              : undefined
          }
          className={cn(
            'label-regular-primary flex items-center gap-1.5 rounded-full px-5 py-2.5 text-black backdrop-blur-md will-change-transform',
            'bg-[rgba(150,150,150,0.4)] hover:bg-[rgba(150,150,150,0.55)]',
            // A single transition-property list, not two stacked transition-*
            // utilities — those would fight over the same CSS property and
            // only one could win.
            isFollowing
              ? 'transition-[transform,background-color] duration-300 ease-out'
              : 'transition-colors duration-200',
          )}>
          Explore <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
