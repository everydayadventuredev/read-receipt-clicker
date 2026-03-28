import { useState, useEffect, useCallback, useRef } from "react";

const MESSAGES = [
  "你在嗎", "已讀", "回覆一下", "急！急！急！", "在嗎在嗎在嗎",
  "help", "老闆找你", "明天截止", "求回覆", "看到請回",
  "重要通知", "會議改期", "薪資單", "系統通知", "前任來電",
];

const STORM_DURATION = 10;

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

function spawnBubbles(perSecond) {
  const count = Math.floor(randomBetween(8, 13));
  const value = Math.max(1, Math.floor(perSecond * 2));
  const used = new Set();
  const bubbles = [];
  for (let i = 0; i < count; i++) {
    let idx;
    do { idx = Math.floor(Math.random() * MESSAGES.length); } while (used.has(idx) && used.size < MESSAGES.length);
    used.add(idx);
    bubbles.push({
      id: i,
      msg: MESSAGES[idx],
      value,
      x: randomBetween(8, 78),
      y: randomBetween(15, 75),
      delay: randomBetween(0, 0.6),
      dur: randomBetween(2.5, 4),
      popped: false,
    });
  }
  return bubbles;
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

  // Start storm when active becomes true
  useEffect(() => {
    if (active && phase === "idle") {
      const b = spawnBubbles(perSecond);
      setBubbles(b);
      setTimeLeft(STORM_DURATION);
      setEarned(0);
      earnedRef.current = 0;
      perfectRef.current = false;
      setPerfect(false);
      setFloats([]);
      setPhase("storm");
    }
    if (!active && phase !== "idle") {
      setPhase("idle");
    }
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer
  useEffect(() => {
    if (phase !== "storm") return;
    if (timeLeft <= 0) {
      setPhase("ending");
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  // Check perfect clear (all bubbles popped while storm is active)
  useEffect(() => {
    if (phase === "storm" && bubbles.length > 0 && bubbles.every((b) => b.popped)) {
      perfectRef.current = true;
      setPerfect(true);
      if (onPerfect) onPerfect();
      setPhase("ending");
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
    setBubbles((prev) => {
      const b = prev.find((x) => x.id === id);
      if (!b || b.popped) return prev;
      earnedRef.current += b.value;
      setEarned((e) => e + b.value);
      const fid = ++floatId.current;
      setFloats((f) => [...f, { id: fid, x: b.x, y: b.y, value: b.value }]);
      setTimeout(() => setFloats((f) => f.filter((x) => x.id !== fid)), 900);
      return prev.map((x) => (x.id === id ? { ...x, popped: true } : x));
    });
  }, []);

  if (phase === "idle") return null;

  const fading = phase === "ending";

  return (
    <>
      <style>{`
        @keyframes rs-wobble {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(6px, -10px) rotate(2deg); }
          50% { transform: translate(-4px, 6px) rotate(-1.5deg); }
          75% { transform: translate(8px, 4px) rotate(1deg); }
        }
        @keyframes rs-pop {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
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
        @keyframes rs-entrance {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
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
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "#6366f1",
            }}
          >
            已讀風暴！
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: 22,
              color: timeLeft <= 3 ? "#ef4444" : "#4f46e5",
              minWidth: 32,
              textAlign: "center",
            }}
          >
            {timeLeft}s
          </span>
        </div>

        {/* Bubbles */}
        {bubbles.map((b) => (
          <div
            key={b.id}
            onClick={() => !b.popped && popBubble(b.id)}
            style={{
              position: "absolute",
              left: `${b.x}%`,
              top: `${b.y}%`,
              cursor: b.popped ? "default" : "pointer",
              animation: b.popped
                ? "rs-pop 300ms forwards"
                : fading
                  ? "rs-fade-out 600ms forwards"
                  : `rs-entrance 400ms ${b.delay}s both, rs-wobble ${b.dur}s ${b.delay + 0.4}s ease-in-out infinite`,
              pointerEvents: b.popped || fading ? "none" : "auto",
              userSelect: "none",
              zIndex: 10000,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "10px 16px",
                boxShadow: "0 2px 12px rgba(0,0,0,.08)",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                minWidth: 60,
              }}
            >
              <span style={{ fontSize: 15, whiteSpace: "nowrap" }}>{b.msg}</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#b45309",
                }}
              >
                +{b.value}
              </span>
            </div>
          </div>
        ))}

        {/* Float texts */}
        {floats.map((f) => (
          <div
            key={f.id}
            style={{
              position: "absolute",
              left: `${f.x}%`,
              top: `${f.y}%`,
              pointerEvents: "none",
              animation: "rs-float-up 800ms forwards",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: 18,
              color: "#4f46e5",
              zIndex: 10002,
              textShadow: "0 1px 4px rgba(99,102,241,.3)",
            }}
          >
            +{f.value}
          </div>
        ))}

        {/* Perfect bonus toast */}
        {perfect && phase === "ending" && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10003,
              animation: "rs-toast 2s forwards",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                borderRadius: 20,
                padding: "20px 40px",
                boxShadow: "0 8px 40px rgba(245,158,11,.35)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 800,
                  fontSize: 32,
                  color: "#fff",
                  textShadow: "0 2px 8px rgba(0,0,0,.15)",
                }}
              >
                完美已讀！
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  fontSize: 20,
                  color: "#fff",
                  marginTop: 6,
                }}
              >
                ×3 Bonus! +{earnedRef.current * 2}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
