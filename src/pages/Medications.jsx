import { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { Plus, AlertCircle } from "lucide-react";
import { useApp } from "@/lib/AuthContext";
import MedicationCard from "@/components/corae/MedicationCard";
import PinModal from "@/components/corae/PinModal";
import BottomSheet from "@/components/corae/BottomSheet";
import { format } from "date-fns";

function MedicationsContent() {
  const { user, family, member, activePatient } = useApp();
  const [medications, setMedications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [showPin, setShowPin] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    loadData();
  }, [family?.id, activePatient?.id]);

  async function loadData() {
    if (!family?.id) {
      setMedications([]);
      setMembers([]);
      setLoading(false);
      return;
    }

    if (!activePatient?.id) {
      setMedications([]);
      setLoading(false);

      try {
        const { data: memsData, error: memsError } = await supabase
          .from("family_members")
          .select("*")
          .eq("family_id", family.id);

        if (memsError) throw memsError;

        setMembers(memsData || []);
      } catch (err) {
        console.error("Erro ao carregar membros:", err);
        setMembers([]);
      }

      return;
    }

    setLoading(true);

    try {
      const [medsRes, memsRes] = await Promise.all([
        supabase
          .from("medications")
          .select("*")
          .eq("family_id", family.id)
          .eq("patient_id", activePatient.id)
          .order("id", { ascending: false }),

        supabase
          .from("family_members")
          .select("*")
          .eq("family_id", family.id),
      ]);

      if (medsRes.error) throw medsRes.error;
      if (memsRes.error) throw memsRes.error;

      setMedications(medsRes.data || []);
      setMembers(memsRes.data || []);
    } catch (err) {
      console.error("Erro ao carregar medicamentos:", err);
      setMedications([]);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  function needsPin() {
    return members.length >= 2;
  }

  function requestAction(action) {
    if (needsPin() && member?.role !== "principal") return;

    if (needsPin()) {
      setPendingAction(() => action);
      setShowPin(true);
    } else {
      action();
    }
  }

  function onPinConfirm() {
    setShowPin(false);
    if (pendingAction) pendingAction();
    setPendingAction(null);
  }

  const active = medications.filter((m) => m.is_active);
  const inactive = medications.filter((m) => !m.is_active);

  if (!family) return null;

  if (!activePatient) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between pt-2">
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Medicamentos
          </h1>
        </div>

        <div className="text-center py-12">
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            Selecione um paciente para visualizar os medicamentos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Medicamentos
        </h1>

        {member?.role === "principal" && (
          <button
            onClick={() =>
              requestAction(() => {
                setEditMed(null);
                setShowForm(true);
              })
            }
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{ background: "var(--sage-dark)" }}
          >
            <Plus size={20} color="white" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div
            className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--sage)" }}
          />
        </div>
      ) : (
        <>
          {active.length === 0 && (
            <div className="text-center py-12">
              <p className="text-base" style={{ color: "var(--text-secondary)" }}>
                Nenhum medicamento ativo.
              </p>

              {member?.role === "principal" && (
                <button
                  onClick={() =>
                    requestAction(() => {
                      setEditMed(null);
                      setShowForm(true);
                    })
                  }
                  className="mt-4 px-5 py-3 rounded-xl text-white font-medium"
                  style={{ background: "var(--sage-dark)" }}
                >
                  Adicionar medicamento
                </button>
              )}
            </div>
          )}

          <div className="space-y-3">
            {active.map((m) => (
              <MedicationCard
                key={m.id}
                medication={m}
                onPress={() => {
                  setEditMed(m);
                  setShowForm(true);
                }}
              />
            ))}
          </div>

          {inactive.length > 0 && (
            <div>
              <p
                className="text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Encerrados
              </p>
              <div className="space-y-2 opacity-60">
                {inactive.map((m) => (
                  <MedicationCard
                    key={m.id}
                    medication={m}
                    onPress={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showForm && (
        <MedForm
          med={editMed}
          family={family}
          user={user}
          member={member}
          activePatient={activePatient}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadData();
          }}
        />
      )}

      {showPin && (
        <PinModal
          family={family}
          onConfirm={onPinConfirm}
          onClose={() => {
            setShowPin(false);
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
}

function MedForm({
  med,
  family,
  user,
  member,
  activePatient,
  onClose,
  onSaved,
}) {
  const [name, setName] = useState(med?.name || "");
  const [dosage, setDosage] = useState(med?.dosage || "");
  const [type, setType] = useState(med?.type || "fixed");
  const [fixedTimes, setFixedTimes] = useState(med?.fixed_times?.join(", ") || "");
  const [intervalHours, setIntervalHours] = useState(med?.interval_hours || 8);
  const [durationType, setDurationType] = useState(
    med?.duration_type || "continuous"
  );
  const [durationDays, setDurationDays] = useState(med?.duration_days || 7);
  const [startDate, setStartDate] = useState(
    med?.start_date || format(new Date(), "yyyy-MM-dd")
  );
  const [instructions, setInstructions] = useState(med?.instructions || "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim() || !dosage.trim() || !family?.id || !activePatient?.id) {
      return;
    }

    setLoading(true);

    try {
      const data = {
        family_id: family.id,
        patient_id: activePatient?.id || null,
        name: name.trim(),
        dosage: dosage.trim(),
        type,
        fixed_times:
          type === "fixed"
            ? fixedTimes
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
        interval_hours: type === "interval" ? Number(intervalHours) : null,
        duration_type: durationType,
        duration_days: durationType === "days" ? Number(durationDays) : null,
        start_date: startDate,
        is_active: true,
        instructions: instructions.trim() || null,
      };

      if (durationType === "days") {
        const end = new Date(startDate);
        end.setDate(end.getDate() + Number(durationDays));
        data.end_date = format(end, "yyyy-MM-dd");
      } else {
        data.end_date = null;
      }

      if (med) {
        const { error } = await supabase
          .from("medications")
          .update(data)
          .eq("id", med.id);

        if (error) throw error;
      } else {
        const { data: newMed, error } = await supabase
          .from("medications")
          .insert([data])
          .select()
          .single();

        if (error) throw error;

        if (data.type === "interval") {
          const { error: nextDoseError } = await supabase
            .from("next_doses")
            .insert([
              {
                family_id: family.id,
                medication_id: newMed.id,
                medication_name: data.name,
                patient_id: activePatient?.id,
                due_at: null,
                status: "pendente",
                is_first_dose: true,
              },
            ]);

          if (nextDoseError) throw nextDoseError;
        }
      }

      onSaved();
    } catch (err) {
      console.error("Erro ao salvar medicamento:", err);
      alert(err?.message || "Erro ao salvar medicamento.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivate() {
    if (!med?.id) return;

    try {
      const { error } = await supabase
        .from("medications")
        .update({ is_active: false })
        .eq("id", med.id);

      if (error) throw error;

      onSaved();
    } catch (err) {
      console.error("Erro ao encerrar medicamento:", err);
      alert(err?.message || "Erro ao encerrar medicamento.");
    }
  }

  const isPrincipal = member?.role === "principal";

  return (
    <BottomSheet
      open={true}
      title={med ? "Medicamento" : "Novo medicamento"}
      onClose={onClose}
      scrollContent={false}
    >
      <div className="pb-6">
        {!isPrincipal && (
          <div
            className="mb-4 p-3 rounded-xl flex items-start gap-2"
            style={{ background: "#FEF3E2" }}
          >
            <AlertCircle
              size={16}
              style={{ color: "var(--warning)", marginTop: 2 }}
            />
            <p className="text-xs" style={{ color: "#8A5A1A" }}>
              Apenas o Responsável Principal pode editar medicamentos. Você pode
              sugerir uma alteração.
            </p>
          </div>
        )}

        <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
          <Field label="Nome do medicamento">
            <input
              className="w-full h-12 px-4 rounded-xl border text-base outline-none"
              style={{
                background: "var(--warm)",
                border: "1px solid var(--border)",
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isPrincipal}
            />
          </Field>

          <Field label="Dosagem">
            <input
              className="w-full h-12 px-4 rounded-xl border text-base outline-none"
              style={{
                background: "var(--warm)",
                border: "1px solid var(--border)",
              }}
              placeholder="Ex: 500mg, 1 comprimido"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              disabled={!isPrincipal}
            />
          </Field>

          {isPrincipal && (
            <>
              <Field label="Tipo de administração">
                <div className="flex gap-2">
                  {[
                    { v: "fixed", l: "Horário fixo" },
                    { v: "interval", l: "Intervalo" },
                  ].map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => setType(o.v)}
                      className="flex-1 h-11 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background:
                          type === o.v ? "var(--sage-dark)" : "var(--warm)",
                        color:
                          type === o.v ? "white" : "var(--text-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </Field>

              {type === "fixed" ? (
                <Field label="Horários (ex: 08:00, 20:00)">
                  <input
                    className="w-full h-12 px-4 rounded-xl border text-base outline-none"
                    style={{
                      background: "var(--warm)",
                      border: "1px solid var(--border)",
                    }}
                    value={fixedTimes}
                    onChange={(e) => setFixedTimes(e.target.value)}
                    placeholder="08:00, 20:00"
                  />
                </Field>
              ) : (
                <Field label="Intervalo (horas)">
                  <input
                    type="number"
                    className="w-full h-12 px-4 rounded-xl border text-base outline-none"
                    style={{
                      background: "var(--warm)",
                      border: "1px solid var(--border)",
                    }}
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(e.target.value)}
                  />
                </Field>
              )}

              <Field label="Duração">
                <div className="flex flex-col gap-2">
                  {[
                    { v: "continuous", l: "Uso contínuo" },
                    { v: "once", l: "Apenas uma vez" },
                    { v: "days", l: "Por X dias" },
                  ].map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => setDurationType(o.v)}
                      className="w-full h-11 rounded-xl text-sm font-medium transition-all text-left px-4"
                      style={{
                        background:
                          durationType === o.v
                            ? "var(--sage-dark)"
                            : "var(--warm)",
                        color:
                          durationType === o.v
                            ? "white"
                            : "var(--text-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {o.l}
                    </button>
                  ))}

                  {durationType === "days" && (
                    <input
                      type="number"
                      className="w-full h-12 px-4 rounded-xl border text-base outline-none mt-1"
                      style={{
                        background: "var(--warm)",
                        border: "1px solid var(--border)",
                      }}
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      placeholder="Número de dias"
                    />
                  )}
                </div>
              </Field>

              <Field label="Data de início">
                <input
                  type="date"
                  className="w-full h-12 px-4 rounded-xl border text-base outline-none"
                  style={{
                    background: "var(--warm)",
                    border: "1px solid var(--border)",
                  }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Field>

              <Field label="Instruções (opcional)">
                <textarea
                  className="w-full p-3 rounded-xl border text-sm resize-none outline-none"
                  style={{
                    background: "var(--warm)",
                    border: "1px solid var(--border)",
                  }}
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </Field>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full h-14 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
                style={{ background: "var(--sage-dark)" }}
              >
                {loading
                  ? "Salvando..."
                  : med
                  ? "Salvar alterações"
                  : "Adicionar medicamento"}
              </button>

              {med && (
                <button
                  onClick={handleDeactivate}
                  className="w-full h-12 rounded-2xl text-sm font-medium transition-all"
                  style={{
                    color: "var(--error)",
                    border: "1px solid var(--error)",
                    background: "transparent",
                  }}
                >
                  Encerrar medicamento
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label
        className="text-sm font-medium block mb-2"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Medications() {
  return <MedicationsContent />;
}
