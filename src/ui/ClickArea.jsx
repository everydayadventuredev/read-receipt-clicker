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
        @keyframes guiltPulseBorder {
          0%, 100% { border-color: rgba(239,68,68,0.3); }
          50% { border-color: rgba(239,68,68,0.6); }
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
        {/* Chat body — header now in phone frame (App.jsx) */}
        <div style={{
          padding: '8px 10px',
          minHeight: 160,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          gap: 4,
          background: bg,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,.02) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          transition: 'background .5s ease',
        }}>
          {/* Old messages (read, fading out) */}
          {recentMessages.slice(0, 4).reverse().map((m, i, arr) => {
            const age = arr.length - i;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-end', gap: 4,
                opacity: Math.max(0.2, 0.7 - age * 0.15),
              }}>
                {/* Incoming message bubble */}
                <div style={{
                  maxWidth: '80%',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px 12px 12px 4px',
                  padding: '5px 10px',
                  fontSize: 12, color: '#64748b', lineHeight: 1.4,
                }}>
                  {m}
                </div>
                {/* Read receipt */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  <CheckIcon size={8} color="#6366f1" />
                  <span style={{ fontSize: 8, color: '#94a3b8' }}>
                    {now.getHours()}:{(now.getMinutes() - age).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            );
          })}

          {/* First click hint */}
          {isFirstClick && !isRead && (
            <div style={{
              textAlign: 'center', padding: '4px 0',
              animation: 'hf 4s ease-out forwards',
            }}>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                👇 點一下訊息已讀
              </div>
            </div>
          )}

          {/* Current message — the clickable one */}
          <div
            onClick={onClick}
            style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}
          >
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: 4,
            }}>
              <div style={{
                maxWidth: '85%',
                background: isRead
                  ? '#f1f5f9'
                  : 'linear-gradient(145deg, rgba(99,102,241,.1), rgba(99,102,241,.05))',
                border: isRead
                  ? '1px solid #e2e8f0'
                  : '1px solid rgba(99,102,241,.2)',
                borderRadius: '14px 14px 14px 4px',
                padding: '10px 14px',
                transition: 'all .15s cubic-bezier(.4,0,.2,1)',
                transform: isRead ? 'scale(.97)' : 'scale(1)',
                boxShadow: isRead
                  ? 'none'
                  : '0 2px 8px rgba(99,102,241,.08)',
                animation: !isRead && !isFirstClick ? 'ib 2.5s ease-in-out infinite' : 'none',
                position: 'relative',
              }}>
                <div style={{
                  color: isRead ? '#94a3b8' : '#1e293b',
                  fontSize: 15, lineHeight: 1.5, fontWeight: 500,
                }}>
                  {message}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  gap: 3, marginTop: 2,
                }}>
                  <span style={{ fontSize: 9, color: '#94a3b8' }}>{timeStr}</span>
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
          background: '#fff',
        }}>
          <div style={{
            flex: 1, padding: '6px 12px',
            background: '#f1f5f9', borderRadius: 16,
            fontSize: 11, color: '#94a3b8',
            border: '1px solid #e2e8f0',
          }}>
            {inputText}
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: 14,
            background: headerGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: '#fff',
            opacity: 0.4,
            transition: 'background .5s ease',
          }}>➤</div>
        </div>
      </div>
    </>
  );
}
