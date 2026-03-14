import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import BottomSheet from "@/components/corae/BottomSheet";

export default function ObservationModal({
  family,
  user,
  activePatient,
  type = "observation",
  title = "Registrar observação",
  onClose,
  onSaved,
}) {
  const [text, setText] = useState("");
  const [extra, setExtra] = useState({ sys: "", dia: "", pulse: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const isBloodPressure = type === "blood_pressure";

  async function handleSave() {
    if (!family?.id || !user?.email) return;

    if (!isBloodPressure && !text.trim()) return;
    if (isBloodPressure && (!extra.sys || !extra.dia)) return;

    setLoading(true);

    try {
      const now = new Date().toISOString();

      const payload = {
        family_id: family.id,
        patient_id: activePatient?.id || null,
        record_type: type,
        actual_time: now,
        recorded_by_name: user.full_name || user.email,
        recorded_by_email: user.email,
        is_system: false,
        notes: isBloodPressure ? (text.trim() || null) : text.trim(),
        details: isBloodPressure
          ? {
              sys: extra.sys,
              dia: extra.dia,
              pulse: extra.pulse || null,
            }
          : null,
      };

      const { error } = await supabase.from("care_records").insert([payload]);

      if (error) throw error;

      setDone(true);

      setTimeout(() => {
        onSaved?.();
        onClose?.();
      }, 1200);
    } catch (err) {
      console.error("Erro ao salvar observação:", err);
      alert(err?.message || "Erro ao salvar registro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BottomSheet open={true} title={title} onClose={onClose}>
      {done ? (
        <div className="flex flex-col items-center py-8 gap-3">
          <CheckCircle size={48} style={{ color: "var(--success)" }} />
          <p
            className="text-base font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Registrado com sucesso!
          </p>
        </div>
      ) : (
        <>
          {isBloodPressure && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label
                  className="text-sm font-medium block mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Sistólica
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={extra.sys}
                  onChange={(e) =>
                    setExtra((prev) => ({ ...prev, sys: e.target.value }))
                  }
                  className="w-full p-3 rounded-2xl border text-sm outline-none"
                  style={{
                    background: "var(--warm)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label
                  className="text-sm font-medium block mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Diastólica
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={extra.dia}
                  onChange={(e) =>
                    setExtra((prev) => ({ ...prev, dia: e.target.value }))
                  }
                  className="w-full p-3 rounded-2xl border text-sm outline-none"
                  style={{
                    background: "var(--warm)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label
                  className="text-sm font-medium block mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Pulso
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={extra.pulse}
                  onChange={(e) =>
                    setExtra((prev) => ({ ...prev, pulse: e.target.value }))
                  }
                  className="w-full p-3 rounded-2xl border text-sm outline-none"
                  style={{
                    background: "var(--warm)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {isBloodPressure ? "Observação (opcional)" : "Observação"}
            </label>

            <textarea
              className="w-full p-3 rounded-2xl border text-sm resize-none outline-none"
              style={{
                background: "var(--warm)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              rows={isBloodPressure ? 3 : 4}
              placeholder={
                isBloodPressure
                  ? "Ex: paciente estava em repouso..."
                  : "Digite a observação..."
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={
              loading ||
              (isBloodPressure ? !extra.sys || !extra.dia : !text.trim())
            }
            className="w-full h-14 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
            style={{
              background:
                !loading &&
                (isBloodPressure ? extra.sys && extra.dia : text.trim())
                  ? "var(--sage-dark)"
                  : "#C5BDB5",
            }}
          >
            {loading ? "Salvando..." : "Confirmar registro"}
          </button>
        </>
      )}
    </BottomSheet>
  );
}
