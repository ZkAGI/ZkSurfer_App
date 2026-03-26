import { useState } from 'react';
import { CryptoNewsItem, MacroNewsItem } from '@/types/types';

export default function NewsCard({ item }: { item: CryptoNewsItem | MacroNewsItem }) {
  const [expanded, setExpanded] = useState(false);
  const max = 200;

  // Handle undefined rationale with fallback
  const txt = item.rationale || item.title || 'No description available';
  const needs = txt.length > max;
  const preview = needs && !expanded ? txt.slice(0, max) : txt;

  // Handle undefined reason with fallback
  const reason = item.reason || 'No additional information available';

  // Handle undefined sentimentTag with fallback
  const sentimentTag = item.sentimentTag || 'neutral';

  const sentimentColors = {
    bullish: { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)', text: '#34d399' },
    neutral: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#f59e0b' },
    bearish: { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)', text: '#f87171' },
  };

  const colors = sentimentColors[sentimentTag] || sentimentColors.neutral;

  return (
    <div
      className="relative rounded-xl p-4 cursor-pointer transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,106,247,0.15)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
      onClick={() => window.open(item.link, '_blank')}
    >
      {/* Info icon + popup */}
      <div className="absolute top-3 right-3 z-50 group">
        <svg className="w-3.5 h-3.5 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="rgba(100,116,139,0.6)" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div className="hidden group-hover:block absolute right-0 top-full mt-1 text-xs p-3 rounded-lg shadow-xl w-52 z-[60]" style={{
          background: '#0d1120',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#94a3b8',
        }}>
          {reason}
        </div>
      </div>

      <h4 className="font-semibold text-[13px] text-white pr-6 leading-snug" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {item.title}
      </h4>

      <p className="text-[11px] mt-2 leading-relaxed" style={{ color: '#64748b' }}>
        {preview}
        {needs && !expanded && '... '}
        {needs && (
          <button
            onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
            className="text-xs ml-1 font-medium transition-colors"
            style={{ color: '#a78bfa' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c4b5fd')}
            onMouseLeave={e => (e.currentTarget.style.color = '#a78bfa')}
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>

      {/* Sentiment tag */}
      <div className="mt-2.5">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full"
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            letterSpacing: '0.06em',
          }}
        >
          <span className="w-1 h-1 rounded-full" style={{ background: colors.text }} />
          {sentimentTag}
        </span>
      </div>
    </div>
  );
}
