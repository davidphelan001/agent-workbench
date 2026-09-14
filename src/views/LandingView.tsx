import { useState } from 'react';

import { cn } from '@/lib/utils';

interface LandingViewProps {
  onExplore: () => void;
}

export function LandingView({ onExplore }: LandingViewProps) {
  const [exiting, setExiting] = useState(false);

  function handleExplore() {
    setExiting(true);
    window.setTimeout(onExplore, 300);
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-9 bg-black transition-opacity duration-300 ease-out',
        exiting ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}>
      <h1 className="font-sans text-[clamp(3rem,9vw,7rem)] leading-none font-light tracking-[-0.03em] text-white">
        Hephwerk
      </h1>
      <button
        type="button"
        onClick={handleExplore}
        className="paragraph-large-primary text-brand-accents-qb-accent underline decoration-1 underline-offset-[6px] transition-opacity duration-200 hover:opacity-70">
        Explore
      </button>
    </div>
  );
}
