import { inquiryStatusLabel } from '@/lib/meta';
import { cn } from '@/lib/utils';
import type { Inquiry } from '@/types/domain';

interface IdeaConstellationProps {
  inquiries: Inquiry[];
  onSelect: (id: string) => void;
}

const GOLDEN_ANGLE = 137.5 * (Math.PI / 180);

// 175 keeps nodes clear of each other's text at any idea count — see layout math below.
const RADIUS_STEP = 175;

function layout(index: number) {
  const radius = index === 0 ? 0 : RADIUS_STEP * Math.sqrt(index);
  const angle = index * GOLDEN_ANGLE;
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle) * 0.82, // slightly flattened — reads better in a wide viewport
  };
}

export function IdeaConstellation({ inquiries, onSelect }: IdeaConstellationProps) {
  const sorted = [...inquiries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const maxRadius = RADIUS_STEP * Math.sqrt(Math.max(sorted.length - 1, 0));
  const size = Math.max(560, maxRadius * 2 + 320);

  return (
    <div className="flex justify-center overflow-auto px-8 py-12">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size * 0.75 }}>
        {sorted.map((inquiry, index) => {
          const { x, y } = layout(index);
          const isCritReady = inquiry.status === 'ready';
          const isRecent = index < 3;

          return (
            <button
              key={inquiry.id}
              type="button"
              onClick={() => onSelect(inquiry.id)}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                animationDelay: `${Math.min(index * 50, 400)}ms`,
                animationDuration: '400ms',
                animationFillMode: 'backwards',
              }}
              className={cn(
                'animate-in fade-in zoom-in-95 motion-reduce:animate-none',
                'absolute w-[13rem] -translate-x-1/2 -translate-y-1/2 text-center transition-[color,transform] duration-200 hover:scale-[1.03]',
                isRecent ? 'headings-h4-regular' : 'paragraph-regular-primary',
                isCritReady
                  ? 'text-brand-accents-qb-accent'
                  : 'text-fg-secondary hover:text-fg-primary',
              )}>
              <span className="line-clamp-2">{inquiry.proposition}</span>
              {isCritReady && (
                <span className="label-small-primary text-brand-accents-qb-accent mt-1 block uppercase">
                  {inquiryStatusLabel[inquiry.status]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
