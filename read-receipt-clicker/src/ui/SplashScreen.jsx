/**
 * SplashScreen — brand entry for first-time players.
 *
 * Shows ✓✓ mark + theme line "已讀，不回。" + minimal onboarding hint.
 * Auto-dismisses after 2.2s, or on tap. Only shown once per device
 * (gated via localStorage 'rrc-seen-splash').
 */
import { useState, useEffect } from 'react';

export default function SplashScreen({ onDismiss }) {
  const [phase, setPhase] = useState(0); // 0: mark, 1: title, 2: hint, 3: fadeOut

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1100);
    const t3 = setTimeout(() => setPhase(3), 2400);
    const t4 = setTimeout(() => onDismiss?.(), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDismiss]);

  return (
    <div
      onClick={() => { setPhase(3); setTimeout(() => onDismiss?.(), 350); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0f172a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        opacity: phase >= 3 ? 0 : 1,
        transition: 'opacity .4s ease-out',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <style>{`
        @keyframes splashMark {
          0%   { opacity: 0; transform: scale(.7); }
          60%  { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes splashFadeUp {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashPulse {
          0%, 100% { opacity: .55; }
          50%      { opacity: .9; }
        }
      `}</style>

      {/* ✓✓ brand mark */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2,
        animation: 'splashMark .7s cubic-bezier(.34,1.56,.64,1) forwards',
        marginBottom: 28,
      }}>
        <svg width="88" height="88" viewBox="0 0 64 64" style={{ display: 'block' }}>
          <g fill="none" stroke="#3b82f6" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="10,34 22,46 40,20" />
            <polyline points="26,34 38,46 56,20" />
          </g>
        </svg>
      </div>

      {/* Title */}
      <div style={{
        fontSize: 36, fontWeight: 900, color: '#f8fafc',
        letterSpacing: 4, lineHeight: 1.1,
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity .5s ease-out, transform .5s ease-out',
        fontFamily: "'Noto Sans TC', -apple-system, sans-serif",
      }}>
        已讀，不回。
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: 13, fontWeight: 500, color: '#64748b',
        letterSpacing: 2, marginTop: 8,
        opacity: phase >= 1 ? 0.85 : 0,
        transition: 'opacity .6s ease-out .15s',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        Read. Receipt. Clicker.
      </div>

      {/* First-time hint */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0,
        textAlign: 'center',
        fontSize: 12, color: '#475569',
        opacity: phase >= 2 ? 1 : 0,
        transition: 'opacity .5s ease-out',
        animation: phase >= 2 ? 'splashPulse 1.8s ease-in-out infinite' : 'none',
      }}>
        點一下訊息 · 開始已讀
      </div>
    </div>
  );
}
