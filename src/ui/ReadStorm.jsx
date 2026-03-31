import { useState, useEffect, useCallback, useRef } from "react";

const MESSAGES = [
  "你在嗎", "已讀", "回覆一下", "急！急！急！", "在嗎在嗎在嗎",
  "help", "老闆找你", "明天截止", "求回覆", "看到請回",
  "重要通知", "會議改期", "薪資單", "系統通知", "前任來電",
  "不要裝死", "趕快回", "!!!!", "在幹嘛", "你是不是死了",
];

const STORM_DURATION = 10;
const SPAWN_INTERVAL = 700; // ms between new bubbles

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

export default function ReadStorm({ active, onComplete, perSecond, onPerfect }) {
  const [bubbles, setBubbles] = useState([]);
  const [timeLeft, setTimeLeft] = useState(STORM_DURATION);
  const [earned, setEarned] = useState(0);
  const [floats, setFloats] = useState([]);
  const [phase, setPhase] = useState("idle"); // idle | storm | ending
  const [perfect, setPerfect] = useState(false);
  const floatId = useRef(0);
  const earnedRef = useRef(0);
  const perfectRef = useRef(false);
  const bubbleIdRef = useRef(0);
  const spawnTimerRef = useRef(null);

  // Spawn a single bubble at a random position
  const spawnOne = useCallback(() => {
    const id = ++bubbleIdRef.current;
    const value = Math.max(1, Math.floor(perSecond * 2));
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    const bubble = {
      id,
      msg,
      value,
      x: randomBetween(5, 80),
      y: randomBetween(12, 78),
      popped: false,
      spawnedAt: Date.now(),
    };
    setBubbles(prev => [...prev, bubble]);
  }, [perSecond]);

  // Start storm
  useEffect(() => {
    if (active && phase === "idle") {
      setBubbles([]);
      setTimeLeft(STORM_DURATION);
      setEarned(0);
      earnedRef.current = 0;
      perfectRef.current = false;
      bubbleIdRef.current = 0;
      setPerfect(false);
      setFloats([]);
      setPhase("storm");
    }
    if (!active && phase !== "idle") {
      setPhase("idle");
    }
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  // Staggered bubble spawning — one every SPAWN_INTERVAL ms
  useEffect(() => {
    if (phase !== "storm") {
      clearInterval(spawnTimerRef.current);
      return;
    }
    // Spawn first bubble immediately
    spawnOne();
    spawnTimerRef.current = setInterval(spawnOne, SPAWN_INTERVAL);
    return () => clearInterval(spawnTimerRef.current);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-expire old unpopped bubbles after 4s (they float away)
  useEffect(() => {
    if (phase !== "storm") return;
    const iv = setInterval(() => {
      const now = Date.now();
      setBubbles(prev => prev.filter(b => b.popped || (now - b.spawnedAt) < 4000));
    }, 500);
    return () => clearInterval(iv);
  }, [phase]);

  // Countdown timer
  useEffect(() => {
    if (phase !== "storm") return;
    if (timeLeft <= 0) {
      clearInterval(spawnTimerRef.current);
      setPhase("ending");
      return;
    }
    const t = setTimeout(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  // Check if all current bubbles are popped (perfect = pop all visible bubbles before time runs out)
  // For staggered mode, perfect = earned >= threshold
  useEffect(() => {
    if (phase !== "storm") return;
    const totalSpawned = bubbleIdRef.current;
    const totalPopped = bubbles.filter(b => b.popped).length;
    // Perfect if player has popped at least 12 bubbles
    if (totalPopped >= 12 && totalSpawned >= 12) {
      perfectRef.current = true;
      setPerfect(true);
      if (onPerfect) onPerfect();
    }
  }, [bubbles, phase, onPerfect]);

  // Ending phase: wait then call onComplete
  useEffect(() => {
    if (phase !== "ending") return;
    const delay = perfectRef.current ? 2200 : 1200;
    const t = setTimeout(() => {
      const bonus = perfectRef.current ? earnedRef.current * 2 : 0;
      const total = earnedRef.current + bonus;
      onComplete(total);
      setPhase("idle");
    }, delay);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  const popBubble = useCallback((id) => {
    setBubbles(prev => {
      const b = prev.find(x => x.id === id);
      if (!b || b.popped) return prev;
      earnedRef.current += b.value;
      setEarned(e => e + b.value);
      const fid = ++floatId.current;
      setFloats(f => [...f, { id: fid, x: b.x, y: b.y, value: b.value }]);
      setTimeout(() => setFloats(f => f.filter(x => x.id !== fid)), 900);
      return prev.map(x => (x.id === id ? { ...x, popped: true } : x));
    });
  }, []);

  if (phase === "idle") return null;

  const fading = phase === "ending";
  const activeBubbles = bubbles.filter(b => !b.popped);

  return (
    <>
      <style>{`
        @keyframes rs-float-in {
          0% { transform: translateY(30px) scale(0.3); opacity: 0; }
          60% { transform: translateY(-5px) scale(1.05); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes rs-idle-bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-6px) rotate(1.5deg); }
          75% { transform: translateY(4px) rotate(-1deg); }
        }
        @keyframes rs-expire {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-40px) scale(0.5); opacity: 0; }
        }
        @keyframes rs-pop {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes rs-float-up {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        @keyframes rs-fade-out {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes rs-toast {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          40% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; }
        }
        @keyframes rs-timer-pulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.08); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(99,102,241,.05)",
          pointerEvents: phase === "storm" ? "auto" : "none",
          animation: fading && !perfect ? "rs-fade-out 1s forwards" : undefined,
        }}
      >
        {/* Timer bar */}
        <div
          style={{
            position: "fixed",
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(255,255,255,0.95)",
            borderRadius: 16,
            padding: "8px 24px",
            boxShadow: "0 4px 20px rgba(99,102,241,.18)",
            border: "1px solid rgba(99,102,241,.15)",
            zIndex: 10001,
            animation: timeLeft <= 3 && phase === "storm" ? "rs-timer-pulse 0.5s ease-in-out infinite" : undefined,
          }}
        >
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 18, color: "#6366f1",
          }}>
            已讀風暴！
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700, fontSize: 22,
            color: timeLeft <= 3 ? "var(--error)" : "var(--purple-text)",
            minWidth: 32, textAlign: "center",
          }}>
            {timeLeft}s
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600, fontSize: 13, color: "var(--success)",
          }}>
            +{earned}
          </span>
        </div>

        {/* Bubbles — each floats in individually */}
        {bubbles.map(b => {
          const age = Date.now() - b.spawnedAt;
          const expiring = !b.popped && age > 3200; // start fading at 3.2s
          return (
            <div
              key={b.id}
              onClick={() => !b.popped && !fading && popBubble(b.id)}
              style={{
                position: "absolute",
                left: `${b.x}%`,
                top: `${b.y}%`,
                cursor: b.popped ? "default" : "pointer",
                animation: b.popped
                  ? "rs-pop 300ms forwards"
                  : `rs-float-in 0.4s ease-out both, rs-idle-bob ${2.5 + (b.id % 3) * 0.5}s 0.4s ease-in-out infinite`,
                opacity: expiring ? 0.4 : 1,
                transition: 'opacity 0.3s',
                pointerEvents: b.popped || fading ? "none" : "auto",
                userSelect: "none",
                zIndex: 10000,
              }}
            >
              <div style={{
                background: "#fff",
                borderRadius: 16,
                padding: "10px 18px",
                boxShadow: "0 4px 16px rgba(99,102,241,.12)",
                border: "1.5px solid rgba(99,102,241,.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                minWidth: 64,
              }}>
                <span style={{ fontSize: 15, whiteSpace: "nowrap", fontWeight: 600 }}>{b.msg}</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12, fontWeight: 700, color: "var(--amber-text)",
                }}>
                  +{b.value}
                </span>
              </div>
            </div>
          );
        })}

        {/* Float texts on pop */}
        {floats.map(f => (
          <div
            key={f.id}
            style={{
              position: "absolute",
              left: `${f.x}%`,
              top: `${f.y}%`,
              pointerEvents: "none",
              animation: "rs-float-up 800ms forwards",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700, fontSize: 20, color: "var(--purple-text)",
              zIndex: 10002,
              textShadow: "0 1px 4px rgba(99,102,241,.3)",
            }}
          >
            +{f.value}
          </div>
        ))}

        {/* Perfect bonus toast */}
        {perfect && phase === "ending" && (
          <div style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10003,
            animation: "rs-toast 2s forwards",
            textAlign: "center", pointerEvents: "none",
          }}>
            <div style={{
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              borderRadius: 20, padding: "20px 40px",
              boxShadow: "0 8px 40px rgba(245,158,11,.35)",
            }}>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800, fontSize: 32, color: "#fff",
                textShadow: "0 2px 8px rgba(0,0,0,.15)",
              }}>
                完美已讀！
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700, fontSize: 20, color: "#fff", marginTop: 6,
              }}>
                ×3 Bonus! +{earnedRef.current * 2}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
