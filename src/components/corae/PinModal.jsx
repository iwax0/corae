import { useState } from "react";
import BottomSheet from "@/components/corae/BottomSheet";

export default function PinModal({
  family,
  onConfirm,
  onClose,
  title = "Confirmar com PIN",
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function handleDigit(d) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError("");

    if (next.length === 4) {
      setTimeout(() => verify(next), 100);
    }
  }

  function verify(p) {
    if (p === family?.pin) {
      onConfirm?.();
    } else {
      setError("PIN incorreto. Tente novamente.");
      setPin("");
    }
  }

  function handleDelete() {
    setPin((p) => p.slice(0, -1));
    setError("");
  }

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <BottomSheet open={true} title={title} onClose={onClose}>
      <p
        className="text-sm mb-6 text-center"
        style={{ color: "var(--text-secondary)" }}
      >
        Digite o PIN do Responsável Principal
      </p>

      <div className="flex justify-center gap-4 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full border-2 transition-all"
            style={{
              background: i < pin.length ? "var(--sage-dark)" : "transparent",
              borderColor:
                i < pin.length ? "var(--sage-dark)" : "var(--border)",
            }}
          />
        ))}
      </div>

      {error && (
        <p
          className="text-center text-sm mb-4"
          style={{ color: "var(--error)" }}
        >
          {error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3">
        {digits.map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={() =>
              d === "⌫" ? handleDelete() : d !== "" ? handleDigit(d) : null
            }
            className={`h-14 rounded-2xl text-xl font-medium transition-all active:scale-95 ${
              d === "" ? "pointer-events-none" : ""
            }`}
            style={{
              background:
                d === ""
                  ? "transparent"
                  : d === "⌫"
                  ? "var(--warm-dark)"
                  : "var(--warm)",
              color: "var(--text-primary)",
            }}
          >
            {d}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}