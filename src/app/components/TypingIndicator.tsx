'use client';

import { useEffect, useMemo, useState } from 'react';

export default function TypingIndicator({
  rotating = false,
  messages = ['Gondolkodom…', 'Források összegyűjtése…', 'Makrók és kalóriák kalkulálása…', 'Válasz formázása…'],
  intervalMs = 1400,
}: {
  rotating?: boolean;
  messages?: string[];
  intervalMs?: number;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!rotating) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % messages.length), intervalMs);
    return () => clearInterval(id);
  }, [rotating, messages.length, intervalMs]);

  // Dot animation uses CSS keyframes (defined below or via Tailwind classes)
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-end gap-1">
        <span className="dot dot-1" />
        <span className="dot dot-2" />
        <span className="dot dot-3" />
      </div>
      <div className="text-sm text-[#AAAAAA]">{rotating ? messages[idx] : 'Válasz generálása…'}</div>
      <style jsx>{`
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background-color: #ffd700;
          display: inline-block;
          animation: bounce 1.2s infinite ease-in-out;
          opacity: 0.9;
        }
        .dot-1 {
          animation-delay: 0ms;
        }
        .dot-2 {
          animation-delay: 150ms;
        }
        .dot-3 {
          animation-delay: 300ms;
        }
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          40% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
