import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { supabase } from "@/api/supabaseClient";

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

  async function handleSave() {
    if (!family?.id || !user?.email) return;

    if (type === "observation" && !text.trim()) return;

    if (type === "blood_pressure" && (!extra.sys || !extra.dia)) return;

    setLoading(true);

    try {
      const details =
        type === "blood_pressure"
          ? {
              sys: extra.sys || null,
              dia: extra.dia || null,
              pulse: extra.pulse || null,
              notes: text.trim() || null,
            }
          : null;

      const notes =
        type === "blood_pressure"
          ? `Pressão registrada${text.trim() ? `: ${text.trim()}` : ""}`
          : text.trim();

      const { error } = await supabase.from("care_records").insert([
        {
          family_id: family.id,
          patient_id: activePatient?.id || null,
          record_type: type,
          actual_time: new Date().toISOString(),
          recorded_by_name: user.full_name || user.email,
          recorded_by_email: user.email,
          is_system: false,
          notes,
          details,
        },
      ]);

      if (error) throw error;

      setDone(true);

      setTimeout(() => {
        onSaved?.();
      }, 900);
    } catch (err) {
      console.error("Erro ao salvar observação:", err);
      alert(err?.message || "Erro ao salvar observação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h2>
          <button onClick={onClose}>
            <X size={20} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        {done ? (
          <div className="py-8 text-center">
            <div
              className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3"
              style={{ background: "var(--sage-light)" }}
            >
              <CheckCircle size={28} style={{ color: "var(--sage-dark)" }} />
            </div>
            <p
              className="text-base font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Registro salvo com sucesso
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activePatient?.name && (
              <div
                className="p-3 rounded-xl"
                style={{ background: "var(--sage-light)" }}
              >
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--sage-dark)" }}
                >
                  Paciente
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {activePatient.name}
                </p>
              </div>
            )}

            {type === "blood_pressure" && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label
                      className="text-sm font-medium block mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Sistólica *
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      className="w-full h-12 px-3 rounded-xl border text-base outline-none"
                      style={{
                        background: "var(--warm)",
                        border: "1px solid var(--border)",
                      }}
                      placeholder="120"
                      value={extra.sys}
                      onChange={(e) =>
                        setExtra((prev) => ({ ...prev, sys: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label
                      className="text-sm font-medium block mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Diastólica *
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      className="w-full h-12 px-3 rounded-xl border text-base outline-none"
                      style={{
                        background: "var(--warm)",
                        border: "1px solid var(--border)",
                      }}
                      placeholder="80"
                      value={extra.dia}
                      onChange={(e) =>
                        setExtra((prev) => ({ ...prev, dia: e.target.value }))
                      }
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
                      className="w-full h-12 px-3 rounded-xl border text-base outline-none"
                      style={{
                        background: "var(--warm)",
                        border: "1px solid var(--border)",
                      }}
                      placeholder="72"
                      value={extra.pulse}
                      onChange={(e) =>
                        setExtra((prev) => ({ ...prev, pulse: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="text-sm font-medium block mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Observações (opcional)
                  </label>
                  <textarea
                    className="w-full p-3 rounded-xl border text-sm resize-none outline-none"
                    style={{
                      background: "var(--warm)",
                      border: "1px solid var(--border)",
                    }}
                    rows={3}
                    placeholder="Ex: medição após repouso, paciente com tontura..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              </>
            )}

            {type === "observation" && (
              <div>
                <label
                  className="text-sm font-medium block mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Observação *
                </label>
                <textarea
                  className="w-full p-3 rounded-xl border text-sm resize-none outline-none"
                  style={{
                    background: "var(--warm)",
                    border: "1px solid var(--border)",
                  }}
                  rows={5}
                  placeholder="Descreva o que aconteceu..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={
                loading ||
                (type === "observation" && !text.trim()) ||
                (type === "blood_pressure" && (!extra.sys || !extra.dia))
              }
              className="w-full h-14 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
              style={{
                background:
                  !loading &&
                  ((type === "observation" && text.trim()) ||
                    (type === "blood_pressure" && extra.sys && extra.dia))
                    ? "var(--sage-dark)"
                    : "#C5BDB5",
              }}
            >
              {loading ? "Salvando..." : "Salvar registro"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}