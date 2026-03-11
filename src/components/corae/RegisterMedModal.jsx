import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import { format, differenceInMinutes } from "date-fns";

export default function RegisterMedModal({
  medications,
  family,
  user,
  activePatient,
  onClose,
  onSaved,
}) {
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const pending = medications.filter((m) => m.is_active);

  async function handleSave() {
    if (!selected || !family?.id || !user?.email) return;

    setLoading(true);

    try {
      const now = new Date();

      let scheduledTime = null;
      let status = "on_time";
      let delayMinutes = 0;

      if (selected.type === "fixed" && selected.fixed_times?.length > 0) {
        const today = format(now, "yyyy-MM-dd");
        const times = selected.fixed_times
          .map((t) => new Date(`${today}T${t}:00`))
          .filter((d) => !isNaN(d.getTime()));

        if (times.length > 0) {
          const closest = times.reduce((prev, curr) =>
            Math.abs(curr - now) < Math.abs(prev - now) ? curr : prev
          );

          scheduledTime = closest.toISOString();
          delayMinutes = Math.max(0, differenceInMinutes(now, closest));
          status = delayMinutes > 60 ? "delayed" : "on_time";
        }
      }

      const adminPayload = {
        family_id: family.id,
        patient_id: activePatient?.id || null,
        medication_id: selected.id,
        medication_name: selected.name,
        medication_dosage: selected.dosage || "",
        scheduled_datetime: scheduledTime || now.toISOString(),
        actual_datetime: now.toISOString(),
        status,
        delay_minutes: delayMinutes,
        recorded_by_name: user.full_name || user.email,
        recorded_by_email: user.email,
        is_system_generated: false,
      };

      const { error: adminError } = await supabase
        .from("administration_records")
        .insert([adminPayload]);

      if (adminError) throw adminError;

      const carePayload = {
        family_id: family.id,
        patient_id: activePatient?.id || null,
        record_type: "administered",
        actual_time: now.toISOString(),
        recorded_by_name: user.full_name || user.email,
        recorded_by_email: user.email,
        is_system: false,
        notes: notes.trim() || null,
        details: {
          medication_id: selected.id,
          medication_name: selected.name,
          medication_dosage: selected.dosage || "",
          scheduled_time: scheduledTime,
          status,
          delay_minutes: delayMinutes,
        },
      };

      const { error: careError } = await supabase
        .from("care_records")
        .insert([carePayload]);

      if (careError) throw careError;

      if (selected.type === "interval") {
        const { data: nextDose, error: nextDoseFetchError } = await supabase
          .from("next_doses")
          .select("*")
          .eq("family_id", family.id)
          .eq("patient_id", activePatient.id)
          .eq("medication_id", selected.id)
          .eq("status", "pendente")
          .order("id", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (nextDoseFetchError) throw nextDoseFetchError;

        if (nextDose?.id) {
          const { error: updateNextDoseError } = await supabase
            .from("next_doses")
            .update({ status: "concluida" })
            .eq("id", nextDose.id);

          if (updateNextDoseError) throw updateNextDoseError;
        }

        const nextDueAt = new Date(
          now.getTime() + Number(selected.interval_hours || 0) * 3600000
        );

        const { error: createNextDoseError } = await supabase
          .from("next_doses")
          .insert([
            {
              family_id: family.id,
              patient_id: activePatient?.id || null,
              medication_id: selected.id,
              medication_name: selected.name,
              due_at: nextDueAt.toISOString(),
              status: "pendente",
              is_first_dose: false,
            },
          ]);

        if (createNextDoseError) throw createNextDoseError;
      }

      setDone(true);
      setTimeout(() => {
        onSaved?.();
        onClose?.();
      }, 1200);
    } catch (err) {
      console.error("Erro ao registrar medicamento:", err);
      alert(err?.message || "Erro ao registrar administração.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Registrar medicamento
          </h2>
          <button onClick={onClose}>
            <X size={20} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

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
            {pending.length === 0 ? (
              <p
                className="text-sm text-center py-6"
                style={{ color: "var(--text-secondary)" }}
              >
                Nenhum medicamento ativo encontrado.
              </p>
            ) : (
              <div className="space-y-2 mb-4">
                <p
                  className="text-sm font-medium mb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Selecione o medicamento:
                </p>

                {pending.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className="w-full p-4 rounded-2xl text-left transition-all active:scale-98"
                    style={{
                      background:
                        selected?.id === m.id
                          ? "var(--sage-light)"
                          : "var(--warm)",
                      border: `2px solid ${
                        selected?.id === m.id
                          ? "var(--sage-dark)"
                          : "var(--border)"
                      }`,
                    }}
                  >
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {m.name}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {m.dosage}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <div className="mb-4">
              <label
                className="text-sm font-medium block mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Observação (opcional)
              </label>
              <textarea
                className="w-full p-3 rounded-2xl border text-sm resize-none outline-none"
                style={{
                  background: "var(--warm)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                rows={2}
                placeholder="Ex: paciente estava bem..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!selected || loading}
              className="w-full h-14 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
              style={{
                background:
                  selected && !loading ? "var(--sage-dark)" : "#C5BDB5",
              }}
            >
              {loading ? "Registrando..." : "Confirmar administração"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}