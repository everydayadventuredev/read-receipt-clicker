export default function GoldenCookie({ gc, pos, onClick }) {
  if (!gc) return null;

  const bg =
    gc.type === 'mult5' ? 'linear-gradient(135deg, #ef4444, #f59e0b)' :
    gc.type === 'mult'  ? 'linear-gradient(135deg, #6366f1, #4338ca)' :
                          'linear-gradient(135deg, #d97706, #b45309)';

  const shadow =
    gc.type === 'mult5' ? '0 0 20px rgba(239,68,68,.4), 0 0 60px rgba(239,68,68,.15)' :
    gc.type === 'mult'  ? '0 0 20px rgba(99,102,241,.4), 0 0 60px rgba(99,102,241,.15)' :
                          '0 0 20px rgba(217,119,6,.4), 0 0 60px rgba(217,119,6,.15)';

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
