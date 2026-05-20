'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import tippy, { type Instance, type Placement } from 'tippy.js';

type TippyProps = {
  content: string;
  placement?: Placement;
  disabled?: boolean;
  children: React.ReactElement;
  className?: string;
  interactive?: boolean;
  zIndex?: number;
  offset?: [number, number];
};

export default function Tippy({
  content,
  placement = 'top',
  disabled = false,
  children,
  className,
  interactive = false,
  zIndex = 50,
  offset = [0, 8],
}: TippyProps) {
  const hostRef = useRef<HTMLSpanElement | null>(null);
  const instanceRef = useRef<Instance | null>(null);

  const options = useMemo(
    () => ({
      content,
      placement,
      arrow: true,
      allowHTML: false,
      interactive,
      zIndex,
      offset,
      appendTo: () => document.body,
    }),
    [content, placement, interactive, zIndex, offset]
  );

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    instanceRef.current?.destroy();
    instanceRef.current = null;

    if (disabled) return;

    instanceRef.current = tippy(el as Element, options as unknown as Parameters<typeof tippy>[1]);

    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [disabled, options]);

  return (
    <span ref={hostRef} className={className ? `inline-flex ${className}` : 'inline-flex'}>
      {children}
    </span>
  );
}
