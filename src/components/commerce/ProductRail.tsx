'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Icon from '@/components/ui/Icon';

export default function ProductRail({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    const node = scroller.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    setCanPrev(node.scrollLeft > 1);
    setCanNext(max > 1 && node.scrollLeft < max - 1);
  }, []);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    node.scrollLeft = 0;
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    node.addEventListener('scroll', sync, { passive: true });
    const id = window.requestAnimationFrame(() => {
      node.scrollLeft = 0;
      sync();
    });
    return () => {
      window.cancelAnimationFrame(id);
      observer.disconnect();
      node.removeEventListener('scroll', sync);
    };
  }, [children, sync]);

  function stepSize() {
    const node = scroller.current;
    if (!node) return 438;
    const card = node.querySelector<HTMLElement>('.product-window, .bike-card');
    const gap = Number.parseFloat(getComputedStyle(node).columnGap) || 28;
    return (card?.getBoundingClientRect().width || 410) + gap;
  }

  function move(dir: -1 | 1) {
    scroller.current?.scrollBy({ left: dir * stepSize(), behavior: 'smooth' });
  }

  return (
    <section className="product-rail">
      <div className="product-rail-head">
        <h2 className="fs-32 fw-regular c-black-80">{title}</h2>
        <div className="product-rail-nav">
          <button
            type="button"
            className="product-rail-arrow"
            aria-label="Previous"
            disabled={!canPrev}
            onClick={() => move(-1)}
          >
            <Icon name="arrow-left" size={24} />
          </button>
          <button
            type="button"
            className="product-rail-arrow"
            aria-label="Next"
            disabled={!canNext}
            onClick={() => move(1)}
          >
            <Icon name="arrow-right" size={24} />
          </button>
        </div>
      </div>
      <div className="product-rail-track" ref={scroller}>
        <div className="product-rail-gutter" aria-hidden />
        {children}
        <div className="product-rail-gutter" aria-hidden />
      </div>
    </section>
  );
}
