import CheckIcon from './CheckIcon.jsx';

const bgColors = {
  none: '#f8f9fb',
  low: '#fdf5f5',
  medium: '#fce8e8',
  high: '#fbe4e4',
  transcend: '#f0f9ff',
};

const headerGradients = {
  none: 'linear-gradient(135deg, #6366f1, #4338ca)',
  low: 'linear-gradient(135deg, #6366f1, #4338ca)',
  medium: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
  high: 'linear-gradient(135deg, #ef4444, #dc2626)',
  transcend: 'linear-gradient(135deg, #14b8a6, #0d9488)',
};

const bubbleBorders = {
  none: '1px solid var(--border)',
  low: '1px solid #fca5a5',
  medium: '1px solid #f87171',
  high: '2px solid #ef4444',
  transcend: '1px solid #5eead4',
};

const inputBarTexts = {
  none: '已讀就好，不用回覆...',
  low: '已讀就好，不用回覆...',
  medium: '要不要回一下...',
  high: '拜託回覆一下吧...',
  transcend: '🧊 冷漠即力量',
};

// Mini avatar component
function Avatar({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5, flexShrink: 0,
      border: '1px solid rgba(0,0,0,.06)',
    }}>👤</div>
  );
}

// Normalize message to { text, color } shape (supports legacy string)
function normalizeMsg(m) {
  if (typeof m === 'string') return { text: m, color: '#64748b' };
  if (m && typeof m === 'object') return { text: m.text ?? '', color: m.color ?? '#64748b' };
  return { text: '', color: '#64748b' };
}

// Convert a hex color to rgba with given alpha (accepts #RGB or #RRGGBB)
function hexToRgba(hex, alpha) {
  if (!hex || hex[0] !== '#') return `rgba(100,116,139,${alpha})`;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function ClickArea({ message, isRead, isFirstClick, popAnim, recentMessages, onClick, guilt = 0, guiltLevel = 'none' }) {
  const now = new Date();
  const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

  const bg = bgColors[guiltLevel] || bgColors.none;
  const headerGrad = headerGradients[guiltLevel] || headerGradients.none;
  const inputText = inputBarTexts[guiltLevel] || inputBarTexts.none;
  const bubbleBorder = bubbleBorders[guiltLevel] || bubbleBorders.none;
  const isHigh = guiltLevel === 'high';

  const cur = normalizeMsg(message);

  return (
    <>
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-2px); }
        }
        @keyframes msgSlideIn {
          0% { opacity: 0; transform: translateX(-12px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes guiltPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50% { box-shadow: 0 0 8px 2px rgba(239,68,68,.15); }
        }
      `}</style>
      <div style={{
        width: '100%',
        background: bg,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'background .5s',
        flex: 1,
      }}>
        {/* Chat body — messages grow from BOTTOM up */}
        <div style={{
          padding: '8px 10px',
          flex: 1, overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          gap: 6,
          backgroundColor: bg,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,.02) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          transition: 'background-color .5s ease',
        }}>
          {/* Spacer at TOP — pushes everything to the bottom */}
          <div style={{ flex: 1 }} />

          {/* First click hint */}
          {isFirstClick && !isRead && (
            <div style={{
              textAlign: 'center', padding: '8px 0',
              animation: 'hf 4s ease-out forwards',
            }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                👇 點一下訊息已讀
              </div>
            </div>
          )}

          {/* Old messages — oldest at top, newest just above CTA */}
          {recentMessages.slice(0, 20).reverse().map((rawMsg, i, arr) => {
            const age = arr.length - i;
            const m = normalizeMsg(rawMsg);
            const tintBg = hexToRgba(m.color, 0.06);
            const tintBorder = hexToRgba(m.color, 0.25);
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 6,
                opacity: Math.max(0.22, 0.9 - age * 0.08),
                animation: age <= 2 ? `msgSlideIn 0.3s ease-out` : 'none',
              }}>
                <Avatar size={20} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    maxWidth: '82%',
                    background: tintBg,
                    border: `1px solid ${tintBorder}`,
                    borderRadius: '4px 12px 12px 12px',
                    padding: '5px 10px',
                    fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4,
                    transition: 'border .5s ease',
                  }}>
                    {m.text}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
                    <CheckIcon size={7} color={m.color} />
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                      {now.getHours()}:{String(Math.max(0, now.getMinutes() - age)).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator — shows between messages */}
          {!isRead && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0',
            }}>
              <Avatar size={18} />
              <div style={{
                display: 'flex', gap: 3, padding: '6px 12px',
                background: '#fff', borderRadius: '4px 12px 12px 12px',
                border: bubbleBorder,
                transition: 'border .5s ease',
              }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: isHigh ? '#ef4444' : '#94a3b8',
                    animation: `typingDot 1.2s ease-in-out ${j * 0.15}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Current message — THE CTA, always at bottom */}
          <div
            onClick={onClick}
            style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}
          >
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 6,
            }}>
              <Avatar size={28} />
              <div style={{ flex: 1 }}>
                <div style={{
                  maxWidth: '90%',
                  background: isRead
                    ? 'var(--surface-hover)'
                    : `linear-gradient(145deg, ${hexToRgba(cur.color, 0.14)}, ${hexToRgba(cur.color, 0.05)})`,
                  border: isRead
                    ? '1px solid var(--border)'
                    : isHigh ? '2px solid rgba(239,68,68,.4)'
                    : `2px solid ${hexToRgba(cur.color, 0.35)}`,
                  borderRadius: '4px 16px 16px 16px',
                  padding: '12px 16px',
                  transition: 'all .15s cubic-bezier(.4,0,.2,1)',
                  transform: isRead ? 'scale(.97)' : 'scale(1)',
                  boxShadow: isRead
                    ? 'none'
                    : isHigh ? '0 4px 16px rgba(239,68,68,.15)'
                    : `0 4px 16px ${hexToRgba(cur.color, 0.14)}`,
                  animation: !isRead && isHigh ? 'guiltPulse 2s ease-in-out infinite'
                    : !isRead && !isFirstClick ? 'ib 2.5s ease-in-out infinite' : 'none',
                }}>
                  <div style={{
                    color: isRead ? 'var(--text-muted)' : 'var(--text)',
                    fontSize: 17, lineHeight: 1.5, fontWeight: 600,
                  }}>
                    {cur.text}
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 3, marginTop: 3,
                }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{timeStr}</span>
                  {isRead && (
                    <span style={{ animation: 'ci .3s ease-out' }}>
                      <CheckIcon size={10} color={cur.color} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input bar (decorative) */}
        <div style={{
          padding: '6px 10px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', flexShrink: 0,
        }}>
          <div style={{
            flex: 1, padding: '6px 12px',
            background: 'var(--surface-hover)', borderRadius: 16,
            fontSize: 12, color: 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}>
            {inputText}
          </div>
          <div style={{
            width: 30, height: 30, borderRadius: 15,
            background: headerGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: '#fff',
            opacity: 0.4,
            transition: 'background .5s ease',
          }}>➤</div>
        </div>
      </div>
    </>
  );
}
