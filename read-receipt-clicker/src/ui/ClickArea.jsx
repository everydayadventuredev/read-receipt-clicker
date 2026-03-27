import CheckIcon from './CheckIcon.jsx';

export default function ClickArea({ message, isRead, isFirstClick, popAnim, recentMessages, onClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {isFirstClick && !isRead && (
        <div style={{
          textAlign: 'center', fontSize: 13, color: 'rgba(163,230,53,.6)',
          marginBottom: 10, animation: 'hf 4s ease-out forwards',
          fontWeight: 500,
        }}>
          👆 點擊訊息來已讀
        </div>
      )}
      <div
        onClick={onClick}
        style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent', userSelect: 'none', width: '100%', maxWidth: 300 }}
      >
        <div style={{
          position: 'relative',
          background: isRead
            ? 'rgba(255,255,255,.03)'
            : 'linear-gradient(145deg, rgba(139,92,246,.25) 0%, rgba(99,102,241,.15) 50%, rgba(59,130,246,.1) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          padding: '24px 28px',
          transition: 'all .15s cubic-bezier(.4,0,.2,1)',
          transform: isRead ? 'scale(.96)' : 'scale(1)',
          opacity: isRead ? 0.3 : 1,
          border: isRead
            ? '1px solid rgba(255,255,255,.04)'
            : '1px solid rgba(167,139,250,.25)',
          boxShadow: isRead
            ? 'none'
            : '0 0 40px rgba(139,92,246,.12), 0 8px 32px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.06)',
          animation: !isRead && !isFirstClick ? 'ib 2.5s ease-in-out infinite' : 'none',
        }}>
          {/* Notification badge */}
          {!isRead && (
            <div style={{
              position: 'absolute', top: -8, right: -8,
              minWidth: 22, height: 22, borderRadius: 11,
              background: 'linear-gradient(135deg, #ef4444, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, color: '#fff', padding: '0 6px',
              animation: 'pu 1.8s ease-in-out infinite',
              boxShadow: '0 2px 8px rgba(239,68,68,.4)',
            }}>1</div>
          )}

          {/* Message text */}
          <div style={{
            color: isRead ? '#4b5563' : '#f0f4f8',
            fontSize: 16, lineHeight: 1.6, fontWeight: 500,
            letterSpacing: 0.3,
          }}>
            {message}
          </div>

          {/* Read checkmark */}
          {isRead && (
            <div style={{ position: 'absolute', bottom: 8, right: 14, animation: 'ci .3s ease-out' }}>
              <CheckIcon size={16} color="#a78bfa" />
            </div>
          )}
        </div>
      </div>

      {/* Recent messages trail */}
      {recentMessages.length > 0 && (
        <div style={{ marginTop: 10, width: '100%', maxWidth: 300 }}>
          {recentMessages.slice(0, 3).map((m, i) => (
            <div key={i} style={{
              fontSize: 11, color: 'rgba(167,139,250,.3)', opacity: 1 - i * 0.3,
              padding: '2px 0', display: 'flex', alignItems: 'center', gap: 5,
              overflow: 'hidden',
            }}>
              <CheckIcon size={9} color={`rgba(167,139,250,${0.25 - i * 0.07})`} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
