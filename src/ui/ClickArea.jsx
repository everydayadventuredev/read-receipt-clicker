import CheckIcon from './CheckIcon.jsx';

const bgColors = {
  none: '#f8f9fb',
  low: '#fdf2f2',
  medium: '#fce8e8',
  high: '#fbe4e4',
  transcend: '#f0f9ff',
};

const headerGradients = {
  none: 'linear-gradient(135deg, #6366f1, #4338ca)',
  low: 'linear-gradient(135deg, #6366f1, #4338ca)',
  medium: 'linear-gradient(135deg, #6366f1, #4338ca)',
  high: 'linear-gradient(135deg, #ef4444, #dc2626)',
  transcend: 'linear-gradient(135deg, #14b8a6, #0d9488)',
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

export default function ClickArea({ message, isRead, isFirstClick, popAnim, recentMessages, onClick, guilt = 0, guiltLevel = 'none' }) {
  const now = new Date();
  const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

  const bg = bgColors[guiltLevel] || bgColors.none;
  const headerGrad = headerGradients[guiltLevel] || headerGradients.none;
  const inputText = inputBarTexts[guiltLevel] || inputBarTexts.none;
  const isHigh = guiltLevel === 'high';

  return (
    <>
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-2px); }
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
          background: bg,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,.02) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          transition: 'background .5s ease',
        }}>
          {/* Spacer at TOP — pushes everything to the bottom */}
          <div style={{ flex: 1 }} />

          {/* First click hint */}
          {isFirstClick && !isRead && (
            <div style={{
              textAlign: 'center', padding: '8px 0',
              animation: 'hf 4s ease-out forwards',
            }}>
              <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
                👇 點一下訊息已讀
              </div>
            </div>
          )}

          {/* Old messages — oldest at top, newest just above CTA */}
          {recentMessages.slice(0, 10).reverse().map((m, i, arr) => {
            const age = arr.length - i;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 6,
                opacity: Math.max(0.22, 0.9 - age * 0.08),
              }}>
                <Avatar size={20} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    maxWidth: '82%',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px 12px 12px 12px',
                    padding: '5px 10px',
                    fontSize: 12, color: '#64748b', lineHeight: 1.4,
                  }}>
                    {m}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
                    <CheckIcon size={7} color="#6366f1" />
                    <span style={{ fontSize: 9, color: '#94a3b8' }}>
                      {now.getHours()}:{String(Math.max(0, now.getMinutes() - age)).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

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
                    ? '#f1f5f9'
                    : 'linear-gradient(145deg, rgba(99,102,241,.12), rgba(99,102,241,.05))',
                  border: isRead
                    ? '1px solid #e2e8f0'
                    : '2px solid rgba(99,102,241,.3)',
                  borderRadius: '4px 16px 16px 16px',
                  padding: '12px 16px',
                  transition: 'all .15s cubic-bezier(.4,0,.2,1)',
                  transform: isRead ? 'scale(.97)' : 'scale(1)',
                  boxShadow: isRead
                    ? 'none'
                    : '0 4px 16px rgba(99,102,241,.12)',
                  animation: !isRead && !isFirstClick ? 'ib 2.5s ease-in-out infinite' : 'none',
                }}>
                  <div style={{
                    color: isRead ? '#94a3b8' : '#1e293b',
                    fontSize: 17, lineHeight: 1.5, fontWeight: 600,
                  }}>
                    {message}
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 3, marginTop: 3,
                }}>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>{timeStr}</span>
                  {isRead && (
                    <span style={{ animation: 'ci .3s ease-out' }}>
                      <CheckIcon size={10} color="#6366f1" />
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
          borderTop: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', flexShrink: 0,
        }}>
          <div style={{
            flex: 1, padding: '6px 12px',
            background: '#f1f5f9', borderRadius: 16,
            fontSize: 12, color: '#94a3b8',
            border: '1px solid #e2e8f0',
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
