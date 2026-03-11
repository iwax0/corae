import { useState } from "react";
import { Plus, X, Pill, FileText, Activity } from "lucide-react";

export default function FAB({ onRegisterMed, onObservation, onBloodPressure }) {
  const [open, setOpen] = useState(false);

  function handle(fn) {
    setOpen(false);
    fn();
  }

  const actions = [
    { icon: Pill, label: "Registrar medicamento", fn: onRegisterMed, color: "var(--sage-dark)" },
    { icon: FileText, label: "Registrar observação", fn: onObservation, color: "#7B6E9E" },
    { icon: Activity, label: "Registrar pressão", fn: onBloodPressure, color: "#9E7B6E" },
  ];

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setOpen(false)} />
      )}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3">
        {open && actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <button
              key={i}
              onClick={() => handle(a.fn)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg bg-white transition-all active:scale-95"
              style={{ border: "1px solid var(--border)" }}
            >
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{a.label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: a.color }}>
                <Icon size={18} color="white" />
              </div>
            </button>
          );
        })}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95"
          style={{ background: "var(--sage-dark)" }}
        >
          {open ? <X size={24} color="white" /> : <Plus size={26} color="white" />}
        </button>
      </div>
    </>
  );
}