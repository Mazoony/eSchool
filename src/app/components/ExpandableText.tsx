'use client';

import { useEffect, useRef, useState } from 'react';

interface ExpandableTextProps {
  text: string;
  className?: string;
  collapsedLines?: number;
}

export default function ExpandableText({
  text,
  className = '',
  collapsedLines = 5,
}: ExpandableTextProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [text]);

  useEffect(() => {
    const element = textRef.current;
    if (!element || expanded) return;

    const measureOverflow = () => {
      setHasOverflow(element.scrollHeight > element.clientHeight + 1);
    };

    measureOverflow();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measureOverflow);
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded, text, collapsedLines]);

  return (
    <div>
      <p
        ref={textRef}
        style={!expanded ? {
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: collapsedLines,
          overflow: 'hidden',
        } : undefined}
        className={`whitespace-pre-wrap break-words ${className}`}
      >
        {text}
      </p>
      {hasOverflow && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="mt-1 text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}
