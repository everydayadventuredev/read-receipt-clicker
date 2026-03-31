import { useState, useEffect } from 'react';

export default function ReplyTrap({ trap, onReply, onIgnore }) {
  const [timeLeft, setTimeLeft] = useState(8);
  const [fading, setFading] = useState(false);

  // Countdown — trap disappears after 8 seconds
  useEffect(() => {
    if (!trap) return;
    setTimeLeft(8);
    setFading(false);
    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(iv);
          setFading(true);
          setTimeout(() => onIgnore(), 500);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [trap, onIgnore]);

  if (!trap) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 350, maxWidth: 380, width: '90vw',
      animation: fading ? 'fadeOut .5s ease-out forwards' : 'slideUp .4s cubic-bezier(.4,0,.2,1)',
    }}>
      <style>{`
        @keyframes slideUp { 0% { opacity:0;transform:translateX(-50%) translateY(40px) } 100% { opacity:1;transform:translateX(-50%) translateY(0) } }
        @keyframes fadeOut { 0% { opacity:1 } 100% { opacity:0;transform:translateX(-50%) translateY(20px) } }
        @keyframes urgentPulse { 0%,100% { box-shadow: 0 4px 20px rgba(239,68,68,.15) } 50% { box-shadow: 0 4px 30px rgba(239,68,68,.35) } }
      `}</style>

      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid rgba(239,68,68,.2)',
        overflow: 'hidden',
        animation: 'urgentPulse 2s ease-in-out infinite',
      }}>
        {/* Header */}
        <div style={{
          padding: '8px 14px',
          background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
          borderBottom: '1px solid rgba(239,68,68,.1)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 18 }}>{trap.emoji}</span>
          <div>
            <div style={{ fontSize: 10, color: 'var(--error)', fontWeight: 700, letterSpacing: 0.5 }}>
              新訊息
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
              {timeLeft}秒後消失...
            </div>
          </div>
          {/* Countdown bar */}
          <div style={{ flex: 1 }} />
          <div style={{
            width: 60, height: 4, background: '#fee2e2', borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', background: 'var(--error)', borderRadius: 2,
              transition: 'width 1s linear',
              width: `${(timeLeft / 8) * 100}%`,
            }} />
          </div>
        </div>

        {/* Message */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{
            fontSize: 15, color: 'var(--text)', fontWeight: 500,
            lineHeight: 1.5, marginBottom: 12,
          }}>
            {trap.msg}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onReply}
              style={{
                flex: 1, padding: '10px 0',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                transition: 'all .15s',
                fontFamily: 'inherit',
              }}
            >
              回覆 💬
            </button>
            <button
              onClick={() => { setFading(true); setTimeout(onIgnore, 400); }}
              style={{
                flex: 1, padding: '10px 0',
                background: 'var(--surface-hover)',
                color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 10,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                transition: 'all .15s',
                fontFamily: 'inherit',
              }}
            >
              已讀不回 😐
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
