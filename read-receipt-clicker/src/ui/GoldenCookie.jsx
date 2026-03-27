export default function GoldenCookie({ gc, pos, onClick }) {
  if (!gc) return null;

  const bg =
    gc.type === 'mult5' ? 'linear-gradient(135deg, #ef4444, #f59e0b)' :
    gc.type === 'mult'  ? 'linear-gradient(135deg, #a78bfa, #818cf8)' :
                          'linear-gradient(135deg, #a3e635, #84cc16)';

  const shadow =
    gc.type === 'mult5' ? '0 0 20px rgba(239,68,68,.4), 0 0 60px rgba(239,68,68,.15)' :
    gc.type === 'mult'  ? '0 0 20px rgba(139,92,246,.4), 0 0 60px rgba(139,92,246,.15)' :
                          '0 0 20px rgba(163,230,53,.4), 0 0 60px rgba(163,230,53,.15)';

  return (
    <div
      onClick={onClick}
      onAnimationEnd={onClick}
      style={{
        position: 'fixed',
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        width: 40, height: 40,
        borderRadius: '50%',
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 19,
        cursor: 'pointer',
        zIndex: 250,
        boxShadow: shadow,
        animation: 'gcf 5s ease-in-out forwards',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        border: '1px solid rgba(255,255,255,.15)',
      }}
    >
      {gc.emoji}
    </div>
  );
}
