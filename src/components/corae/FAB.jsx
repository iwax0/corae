import { useState } from "react";
import { Plus, X, Pill, FileText, Activity } from "lucide-react";

export default function FAB({ onRegisterMed, onObservation, onBloodPressure }) {
  const [open, setOpen] = useState(false);

  function handle(fn) {
    if (typeof fn === "function") {
      fn();
    }
    setOpen(false);
  }

  const actions = [
    { icon: Pill, label: "Registrar medicamento", fn: onRegisterMed, color: "var(--sage-dark)" },
    { icon: FileText, label: "Registrar observação", fn: onObservation, color: "#7B6E9E" },
    { icon: Activity, label: "Registrar pressão", fn: onBloodPressure, color: "#9E7B6E" },
  ];

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-30 bg-black/20 transition-all duration-300 ${
          open ? "opacity-100 pointer-events-auto backdrop-blur-[1px]" : "opacity-0 pointer-events-none"
        }`}
      />

      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3">
        {actions.map((a, i) => {
          const Icon = a.icon;

          return (
            <button
              key={i}
              onClick={() => handle(a.fn)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg bg-white active:scale-95 transition-all ${
                open
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 translate-y-5 scale-95 pointer-events-none"
              }`}
              style={{
                border: "1px solid var(--border)",
                transformOrigin: "bottom right",
                transitionDuration: open ? "320ms" : "200ms",
                transitionTimingFunction: open
                  ? "cubic-bezier(0.22, 1, 0.36, 1)"
                  : "ease-in",
                transitionDelay: open
                  ? `${i * 70}ms`
                  : `${(actions.length - 1 - i) * 45}ms`,
              }}
            >
              <span
                className={`text-sm font-medium transition-all duration-300 ${
                  open ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
                }`}
                style={{ color: "var(--text-primary)" }}
              >
                {a.label}
              </span>

              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300"
                style={{ background: a.color }}
              >
                <Icon size={18} color="white" />
              </div>
            </button>
          );
        })}

        <button
          onClick={() => setOpen((o) => !o)}
          className={`w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-all duration-300 ${
            open ? "shadow-2xl scale-105" : "shadow-xl scale-100"
          }`}
          style={{
            background: "var(--sage-dark)",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div
            className="transition-transform duration-300"
            style={{
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            {open ? <X size={24} color="white" /> : <Plus size={26} color="white" />}
          </div>
        </button>
      </div>
    </>
  );
}