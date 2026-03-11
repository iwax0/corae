import { useState } from "react";
import { X } from "lucide-react";

export default function PinModal({ family, onConfirm, onClose, title = "Confirmar com PIN" }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function handleDigit(d) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => verify(next), 100);
    }
  }

  function verify(p) {
    if (p === family?.pin) {
      onConfirm();
    } else {
      setError("PIN incorreto. Tente novamente.");
      setPin("");
    }
  }

  function handleDelete() {
    setPin(p => p.slice(0, -1));
    setError("");
  }

  const digits = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full" style={{ color: "var(--text-secondary)" }}>
            <X size={20} />
          </button>
        </div>

        <p className="text-sm mb-6 text-center" style={{ color: "var(--text-secondary)" }}>
          Digite o PIN do Responsável Principal
        </p>

        {/* Dots */}
        <div className="flex justify-center gap-4 mb-6">
          {[0,1,2,3].map(i => (
            <div
              key={i}
              className="w-4 h-4 rounded-full border-2 transition-all"
              style={{
                background: i < pin.length ? "var(--sage-dark)" : "transparent",
                borderColor: i < pin.length ? "var(--sage-dark)" : "var(--border)"
              }}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm mb-4" style={{ color: "var(--error)" }}>{error}</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {digits.map((d, i) => (
            <button
              key={i}
              onClick={() => d === "⌫" ? handleDelete() : d !== "" ? handleDigit(d) : null}
              className={`h-14 rounded-2xl text-xl font-medium transition-all active:scale-95 ${d === "" ? "pointer-events-none" : ""}`}
              style={{
                background: d === "" ? "transparent" : d === "⌫" ? "var(--warm-dark)" : "var(--warm)",
                color: "var(--text-primary)"
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}