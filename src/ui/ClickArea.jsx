import CheckIcon from './CheckIcon.jsx';

export default function ClickArea({ message, isRead, isFirstClick, popAnim, recentMessages, onClick }) {
  // Format current time for message timestamps
  const now = new Date();
  const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div style={{
      width: '100%',
      background: '#fff',
      borderRadius: 14,
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 12px rgba(0,0,0,.06)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Chat header */}
      <div style={{
        padding: '8px 12px',
        background: 'linear-gradient(135deg, #6366f1, #4338ca)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 14,
          background: 'rgba(255,255,255,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>💬</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>已讀收件匣</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.6)' }}>
            {recentMessages.length > 0 ? '對方正在輸入...' : '在線'}
          </div>
        </div>
        {/* Unread count */}
        {!isRead && (
          <div style={{
            marginLeft: 'auto',
            minWidth: 20, height: 20, borderRadius: 10,
            background: '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#fff',
            animation: 'pu 1.8s ease-in-out infinite',
          }}>1</div>
        )}
      </div>

      {/* Chat body */}
      <div style={{
        padding: '8px 10px',
        minHeight: 100,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        gap: 4,
        background: '#f8f9fb',
        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,.02) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
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
          已讀就好，不用回覆...
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: 14,
          background: 'linear-gradient(135deg, #6366f1, #4338ca)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, color: '#fff',
          opacity: 0.4,
        }}>➤</div>
      </div>
    </div>
  );
}
