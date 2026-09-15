import { useEffect, useMemo, useRef, useState } from 'react';

import { inquiryStatusLabel } from '@/lib/meta';
import type { Inquiry } from '@/types/domain';

interface IdeaConstellationProps {
  inquiries: Inquiry[];
  onSelect: (id: string) => void;
}

interface FieldIdea {
  id: string;
  proposition: string;
  isCritReady: boolean;
  statusLabel: string;
  z: number;
  baseX: number;
  baseY: number;
  phase: number;
}

const GOLDEN_ANGLE = 137.5 * (Math.PI / 180);
const LAT_RADIUS_STEP = 190;

// One idea "deep" per SPACING units of virtual scroll. FOCAL controls how
// quickly things shrink/fade with distance — tuned together so roughly one
// idea is near the front at a time, with the next couple visible small and
// dim in the surrounding field.
const SPACING = 620;
const FOCAL = 820;
const FAR_FADE = 1700;
const BEHIND_FADE = 260;
const MIN_SCALE = 0.2;
const MAX_SCALE = 1.25;
// Small on purpose: the scroll bound should stop just as the outermost idea
// is fading, not sail past it into an empty void with nothing to look at.
const EDGE_SLACK = BEHIND_FADE * 0.6;

const WHEEL_SENSITIVITY = 0.8;
const DRAG_SENSITIVITY = 1;
const FLING_MULTIPLIER = 6;
const MAX_FLING = 500;
const CLICK_DISTANCE_THRESHOLD = 6;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function project(distance: number) {
  const rawScale = FOCAL / (FOCAL + Math.max(distance, -FOCAL * 0.55));
  const scale = clamp(rawScale, MIN_SCALE, MAX_SCALE);
  const opacity = clamp(
    distance >= 0 ? 1 - distance / FAR_FADE : 1 - Math.abs(distance) / BEHIND_FADE,
    0,
    1,
  );
  const prominence = clamp(1 - Math.abs(distance) / FOCAL, 0, 1);
  return { scale, opacity, prominence };
}

function buildField(inquiries: Inquiry[]): FieldIdea[] {
  const sorted = [...inquiries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return sorted.map((inquiry, index) => {
    // sqrt(index + 1), not sqrt(index): nothing should sit at radius 0, or
    // that idea stays pinned dead-centre at every depth, colliding with
    // whatever else is passing through the front at the time.
    const radius = LAT_RADIUS_STEP * Math.sqrt(index + 1);
    const angle = index * GOLDEN_ANGLE;
    return {
      id: inquiry.id,
      proposition: inquiry.proposition,
      isCritReady: inquiry.status === 'ready',
      statusLabel: inquiryStatusLabel[inquiry.status],
      z: index * SPACING,
      baseX: radius * Math.cos(angle),
      baseY: radius * Math.sin(angle) * 0.75,
      phase: index * 1.7,
    };
  });
}

export function IdeaConstellation({ inquiries, onSelect }: IdeaConstellationProps) {
  const field = useMemo(() => buildField(inquiries), [inquiries]);
  const bounds = useMemo(() => {
    const maxZ = field.length > 0 ? field[field.length - 1].z : 0;
    return { min: -EDGE_SLACK, max: maxZ + EDGE_SLACK };
  }, [field]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // `position` is what's rendered; `target` is where input wants it to be.
  // Position eases toward target every frame — that lag is the entire
  // source of inertia, and because target is always clamped and moves only
  // by bounded, input-proportional amounts, position can never run away.
  const positionRef = useRef(0);
  const targetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const lastPointerY = useRef(0);
  const lastPointerT = useRef(0);
  const dragVelocitySample = useRef(0);

  const [showHint, setShowHint] = useState(true);
  const hintDismissedRef = useRef(false);

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );
  const ease = prefersReducedMotion ? 0.6 : 0.14;
  const bobAmplitude = prefersReducedMotion ? 0 : 5;

  function setTarget(next: number) {
    targetRef.current = clamp(next, bounds.min, bounds.max);
  }

  function dismissHint() {
    if (!hintDismissedRef.current) {
      hintDismissedRef.current = true;
      setShowHint(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(dismissHint, 4000);
    return () => window.clearTimeout(timer);
  }, []);

  // Animation loop: eases position toward target, applies a quiet idle bob,
  // and writes transform/opacity straight to each node — bypassing React so
  // per-frame updates stay cheap regardless of idea count.
  useEffect(() => {
    let rafId: number;
    let lastT = performance.now();

    function tick(t: number) {
      const dt = Math.min(t - lastT, 48);
      lastT = t;
      const frames = dt / 16.67;

      if (!isDraggingRef.current) {
        const catchUp = 1 - Math.pow(1 - ease, frames);
        positionRef.current += (targetRef.current - positionRef.current) * catchUp;
      }

      for (const idea of field) {
        const el = nodeRefs.current.get(idea.id);
        if (!el) continue;

        const distance = idea.z - positionRef.current;
        const { scale, opacity, prominence } = project(distance);
        const bob = Math.sin(t * 0.0007 + idea.phase) * bobAmplitude * scale;
        const x = idea.baseX * scale;
        const y = idea.baseY * scale + bob;

        el.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.pointerEvents = opacity < 0.05 ? 'none' : 'auto';
        el.style.fontWeight = String(Math.round(400 + prominence * 200));
        el.style.color = idea.isCritReady
          ? `color-mix(in oklch, var(--color-fg-tertiary), var(--color-brand-accents-qb-accent) ${Math.round(prominence * 100)}%)`
          : `color-mix(in oklch, var(--color-fg-tertiary), var(--color-fg-primary) ${Math.round(prominence * 100)}%)`;
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [field, ease, bobAmplitude]);

  // Wheel must be a non-passive native listener — React's synthetic onWheel
  // is passive by default, which silently ignores preventDefault().
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      dismissHint();
      setTarget(targetRef.current + e.deltaY * WHEEL_SENSITIVITY);
    }

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounds]);

  // Drag tracking deliberately avoids setPointerCapture: capturing the
  // pointer on the container retargets the browser's resulting click event
  // to the container itself (per the Pointer Events spec), so it would
  // never reach the idea button underneath — breaking every click. Window
  // listeners track the gesture just as robustly (even once the pointer
  // leaves the container) without touching click targeting at all.
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    dragVelocitySample.current = 0;
    lastPointerY.current = e.clientY;
    lastPointerT.current = performance.now();
    dismissHint();

    function handleMove(ev: PointerEvent) {
      const dy = ev.clientY - lastPointerY.current;
      const now = performance.now();
      const dt = Math.max(now - lastPointerT.current, 1);

      dragDistanceRef.current += Math.abs(dy);
      const next = clamp(targetRef.current - dy * DRAG_SENSITIVITY, bounds.min, bounds.max);
      targetRef.current = next;
      positionRef.current = next; // 1:1 tracking while actively dragging — no lag
      dragVelocitySample.current = (-dy / dt) * 16.67;
      lastPointerY.current = ev.clientY;
      lastPointerT.current = now;
    }

    function handleUp() {
      isDraggingRef.current = false;
      const fling = clamp(dragVelocitySample.current * FLING_MULTIPLIER, -MAX_FLING, MAX_FLING);
      setTarget(targetRef.current + fling);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    }

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      setTarget(targetRef.current + SPACING);
      dismissHint();
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      setTarget(targetRef.current - SPACING);
      dismissHint();
    }
  }

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Ideas. Scroll, drag, or use arrow keys to browse; press Enter to open an idea."
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      className="relative h-full w-full overflow-hidden"
      style={{ touchAction: 'none' }}>
      {field.map(idea => {
        const initial = project(idea.z - positionRef.current);
        const x = idea.baseX * initial.scale;
        const y = idea.baseY * initial.scale;
        return (
          <button
            key={idea.id}
            ref={el => {
              if (el) nodeRefs.current.set(idea.id, el);
              else nodeRefs.current.delete(idea.id);
            }}
            type="button"
            onClick={e => {
              // Keyboard-triggered activation (Enter/Space on a button) reports
              // detail === 0 — always honour it. Only pointer clicks need the
              // drag-distance guard, since a stale value from an earlier mouse
              // drag must never suppress a later keyboard selection.
              if (e.detail !== 0 && dragDistanceRef.current > CLICK_DISTANCE_THRESHOLD) return;
              onSelect(idea.id);
            }}
            onFocus={() => {
              setTarget(idea.z);
              dismissHint();
            }}
            style={{
              left: '50%',
              top: '50%',
              width: 300,
              transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${initial.scale})`,
              opacity: initial.opacity,
              pointerEvents: initial.opacity < 0.05 ? 'none' : 'auto',
            }}
            className="absolute text-center font-sans will-change-transform">
            <span className="line-clamp-3 text-[22px] leading-[28px] tracking-[-0.01em]">
              {idea.proposition}
            </span>
            {idea.isCritReady && (
              <span className="label-small-primary text-brand-accents-qb-accent mt-1.5 block uppercase">
                {idea.statusLabel}
              </span>
            )}
          </button>
        );
      })}

      <p
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-10 text-center transition-opacity duration-700 ${
          showHint ? 'opacity-100' : 'opacity-0'
        } paragraph-small-primary text-fg-tertiary`}>
        Scroll or drag to explore
      </p>
    </div>
  );
}
