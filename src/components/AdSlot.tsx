import { useEffect, useRef } from 'react';
import { AD_DIMENSIONS, adMode, renderProvider, type AdSize } from '../config/ads';
import { useInView } from '../hooks/useInView';

interface Props {
  id: string;
  size: AdSize;
  className?: string;
}

/**
 * Network-agnostic ad slot. Always reserves its box so the layout never
 * shifts, is labelled "Advertisement", and never mimics VOLTARA controls.
 */
export function AdSlot({ id, size, className = '' }: Props) {
  const [ref, visible] = useInView<HTMLDivElement>('300px');
  const mounted = useRef(false);
  const dim = AD_DIMENSIONS[size];

  useEffect(() => {
    if (adMode !== 'provider' || !visible || mounted.current || !ref.current) return;
    mounted.current = true;
    renderProvider(ref.current, { id, size });
  }, [visible, id, size, ref]);

  if (adMode === 'off') return null;

  return (
    <aside className={`ad ad--${size} ${className}`} aria-label="Advertisement" data-ad-slot={id}>
      <span className="ad__label">Advertisement</span>
      <div ref={ref} className="ad__box" style={{ maxWidth: dim.w, aspectRatio: `${dim.w} / ${dim.h}` }}>
        {adMode === 'placeholder' && (
          <span className="ad__placeholder mono">
            {dim.w}×{dim.h}
          </span>
        )}
      </div>
    </aside>
  );
}
