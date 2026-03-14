import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Heart,
  Loader2,
  Pill,
  FileText,
  ChevronDown,
  X,
  Check,
} from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import { useApp } from "@/lib/AuthContext";
import FAB from "@/components/corae/FAB";
import ObservationModal from "@/components/corae/ObservationModal";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RegisterMedModal from "@/components/corae/RegisterMedModal";

function TodayContent() {
  const {
    user,
    family,
    loading,
    activePatient,
    patients,
    selectPatient,
  } = useApp();

  const [medications, setMedications] = useState([]);
  const [todayRecords, setTodayRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [nextDoses, setNextDoses] = useState([]);
  const [registerError, setRegisterError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [showBloodPressureModal, setShowBloodPressureModal] = useState(false);
  const [showRegisterMedModal, setShowRegisterMedModal] = useState(false);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [selectedMedicationForModal, setSelectedMedicationForModal] = useState(null);

  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [loading, family?.id, activePatient?.id]);

  async function loadData() {
    if (!family?.id || !activePatient?.id) {
      setMedications([]);
      setTodayRecords([]);
      setAppointments([]);
      setNextDoses([]);
      setPageLoading(false);
      return;
    }

    setPageLoading(true);
    setRegisterError("");

    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const [medsRes, recordsRes, apptsRes, nextDosesRes] = await Promise.all([
        supabase
          .from("medications")
          .select("*")
          .eq("family_id", family.id)
          .eq("patient_id", activePatient.id)
          .eq("is_active", true)
          .order("id", { ascending: false }),

        supabase
          .from("care_records")
          .select("*")
          .eq("family_id", family.id)
          .eq("patient_id", activePatient.id)
          .gte("actual_time", todayStart.toISOString())
          .lte("actual_time", todayEnd.toISOString())
          .order("actual_time", { ascending: false }),

        supabase
          .from("appointments")
          .select("*")
          .eq("family_id", family.id)
          .eq("patient_id", activePatient.id)
          .gte("datetime", todayStart.toISOString())
          .lte("datetime", todayEnd.toISOString())
          .order("datetime", { ascending: true }),

        supabase
          .from("next_doses")
          .select("*")
          .eq("family_id", family.id)
          .eq("patient_id", activePatient.id)
          .eq("status", "pendente")
          .order("due_at", { ascending: true }),
      ]);

      if (medsRes.error) throw medsRes.error;
      if (recordsRes.error) throw recordsRes.error;
      if (apptsRes.error) throw apptsRes.error;
      if (nextDosesRes.error) throw nextDosesRes.error;

      setMedications(medsRes.data || []);
      setTodayRecords(recordsRes.data || []);
      setAppointments(apptsRes.data || []);
      setNextDoses(nextDosesRes.data || []);
    } catch (err) {
      console.error("Erro ao carregar Today:", err);
      setMedications([]);
      setTodayRecords([]);
      setAppointments([]);
      setNextDoses([]);
    } finally {
      setPageLoading(false);
    }
  }

  function getMedicationScheduleLabel(medication) {
    if (!medication) return "Sem horário";

    if (medication.type === "fixed") {
      const times = Array.isArray(medication.fixed_times)
        ? medication.fixed_times
        : [];
      return times.length ? times.join(", ") : "Sem horário definido";
    }

    if (medication.type === "interval") {
      return medication.interval_hours
        ? `A cada ${medication.interval_hours}h`
        : "Intervalo não definido";
    }

    return "Sem horário";
  }

  function wasMedicationTakenToday(medication) {
    return todayRecords.some((record) => {
      const detailsMedicationId = record?.details?.medication_id;

      return (
        record.record_type === "administered" &&
        detailsMedicationId === medication.id
      );
    });
  }

  function getPendingDoseForMedication(medication) {
    return nextDoses.find((dose) => dose.medication_id === medication.id) || null;
  }

  function getMedicationActionLabel(medication) {
    if (wasMedicationTakenToday(medication)) {
      return "Feito";
    }

    if (medication.type === "interval") {
      const pendingDose = getPendingDoseForMedication(medication);

      if (pendingDose?.is_first_dose) {
        return "1ª dose";
      }

      if (pendingDose) {
        return "Próxima dose";
      }
    }

    return "Registrar";
  }

  function formatDateTime(value) {
    if (!value) return "";
    try {
      return format(parseISO(value), "HH:mm", { locale: ptBR });
    } catch {
      return value;
    }
  }

  function handleSelectPatient(patient) {
    selectPatient(patient);
    setShowPatientPicker(false);
  }

  function openRegisterMedicationModal(medication = null) {
    setSelectedMedicationForModal(medication);
    setShowRegisterMedModal(true);
  }

  if (loading || pageLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2
          className="animate-spin"
          size={28}
          style={{ color: "var(--sage-dark)" }}
        />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="p-4">
        <div
          className="p-4 rounded-2xl bg-white text-sm"
          style={{
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          Nenhuma família encontrada.
        </div>
      </div>
    );
  }

  if (!patients?.length) {
    return (
      <div className="p-4 space-y-4">
        <h1
          className="text-2xl font-semibold pt-2"
          style={{ color: "var(--text-primary)" }}
        >
          Hoje
        </h1>

        <div
          className="p-5 rounded-2xl bg-white"
          style={{ border: "1px solid var(--border)" }}
        >
          <p
            className="font-medium mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Nenhum paciente ativo
          </p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Adicione um paciente na tela Família para começar a registrar
            cuidados.
          </p>
        </div>
      </div>
    );
  }

  if (!activePatient) {
    return (
      <div className="p-4 space-y-4">
        <h1
          className="text-2xl font-semibold pt-2"
          style={{ color: "var(--text-primary)" }}
        >
          Hoje
        </h1>

        <div
          className="p-5 rounded-2xl bg-white"
          style={{ border: "1px solid var(--border)" }}
        >
          <p
            className="font-medium mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Selecione um paciente
          </p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Vá até a tela Família e escolha o paciente que deseja acompanhar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 pb-24">
      <div>
        <h1
          className="text-2xl font-semibold pt-2"
          style={{ color: "var(--text-primary)" }}
        >
          Hoje
        </h1>

        <div className="mt-2 flex items-center gap-2">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Acompanhando
          </p>

          <button
            type="button"
            onClick={() => setShowPatientPicker(true)}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 transition"
            style={{
              background: "var(--warm)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <span className="text-sm font-medium">{activePatient.name}</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      <div
        className="p-4 rounded-2xl bg-white"
        style={{ border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Heart size={18} style={{ color: "var(--sage-dark)" }} />
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>
            Resumo do dia
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="rounded-xl p-3" style={{ background: "var(--warm)" }}>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Medicações
            </p>
            <p
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {medications.length}
            </p>
          </div>

          <div className="rounded-xl p-3" style={{ background: "var(--warm)" }}>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Registros
            </p>
            <p
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {todayRecords.length}
            </p>
          </div>

          <div className="rounded-xl p-3" style={{ background: "var(--warm)" }}>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Consultas
            </p>
            <p
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {appointments.length}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Medicações de hoje
          </p>

          <Link
            to={createPageUrl("Medications")}
            className="text-sm font-medium"
            style={{ color: "var(--sage-dark)" }}
          >
            Ver todas
          </Link>
        </div>

        <div className="space-y-3">
          {medications.map((medication) => {
            const taken = wasMedicationTakenToday(medication);
            const pendingDose = getPendingDoseForMedication(medication);
            const actionLabel = getMedicationActionLabel(medication);

            return (
              <div
                key={medication.id}
                className="p-4 rounded-2xl bg-white"
                style={{ border: "1px solid var(--border)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Pill size={16} style={{ color: "var(--sage-dark)" }} />
                      <p
                        className="font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {medication.name}
                      </p>
                    </div>

                    <p
                      className="text-sm mt-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {medication.dosage || "Dose não informada"}
                    </p>

                    <div
                      className="flex items-center gap-1 mt-2 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Clock size={13} />
                      {medication.type === "interval" && pendingDose?.due_at ? (
                        <>
                          <span>{getMedicationScheduleLabel(medication)}</span>
                          <span>|</span>
                          <span
                            style={{
                              color: "var(--text-primary)",
                              fontWeight: 500,
                            }}
                          >
                            Próxima: {formatDateTime(pendingDose.due_at)}
                          </span>
                        </>
                      ) : (
                        <span>{getMedicationScheduleLabel(medication)}</span>
                      )}
                    </div>
                  </div>

                  {taken ? (
                    <span
                      className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                      style={{
                        background: "var(--sage-light)",
                        color: "var(--sage-dark)",
                      }}
                    >
                      <CheckCircle size={13} />
                      Feito
                    </span>
                  ) : (
                    <button
                      onClick={() => openRegisterMedicationModal(medication)}
                      className="h-10 px-4 rounded-xl text-sm font-medium text-white"
                      style={{ background: "var(--sage-dark)" }}
                    >
                      {actionLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {medications.length === 0 && (
            <div
              className="p-5 rounded-2xl bg-white text-center"
              style={{ border: "1px solid var(--border)" }}
            >
              <p
                className="font-medium mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Nenhuma medicação ativa
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Cadastre medicamentos para este paciente na tela de medicações.
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Consultas de hoje
          </p>

          <Link
            to={createPageUrl("CalendarPage")}
            className="text-sm font-medium"
            style={{ color: "var(--sage-dark)" }}
          >
            Ver agenda
          </Link>
        </div>

        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="p-4 rounded-2xl bg-white"
              style={{ border: "1px solid var(--border)" }}
            >
              <div className="flex items-start gap-3">
                <Calendar size={18} style={{ color: "var(--sage-dark)" }} />
                <div className="min-w-0">
                  <p
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {appointment.specialty || "Consulta"}
                  </p>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {appointment.location || "Sem local informado"}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {formatDateTime(appointment.datetime)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {appointments.length === 0 && (
            <div
              className="p-5 rounded-2xl bg-white text-center"
              style={{ border: "1px solid var(--border)" }}
            >
              <p
                className="font-medium mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Nenhuma consulta hoje
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                As consultas marcadas para hoje aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Registros de hoje
          </p>

          <Link
            to={createPageUrl("Diary")}
            className="text-sm font-medium"
            style={{ color: "var(--sage-dark)" }}
          >
            Ver histórico
          </Link>
        </div>

        <div className="space-y-3">
          {todayRecords.map((record) => (
            <div
              key={record.id}
              className="p-4 rounded-2xl bg-white"
              style={{ border: "1px solid var(--border)" }}
            >
              <div className="flex items-start gap-3">
                <FileText size={18} style={{ color: "var(--sage-dark)" }} />
                <div className="min-w-0">
                  <p
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {record.notes || record.record_type}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {formatDateTime(record.actual_time)} ·{" "}
                    {record.recorded_by_name || "Sem identificação"}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {todayRecords.length === 0 && (
            <div
              className="p-5 rounded-2xl bg-white text-center"
              style={{ border: "1px solid var(--border)" }}
            >
              <p
                className="font-medium mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Nenhum registro hoje
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Observações e registros feitos hoje aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      </div>

      {registerError && (
        <div
          className="p-3 rounded-xl flex items-start gap-2"
          style={{ background: "#FDECEC" }}
        >
          <XCircle size={16} style={{ color: "var(--error)", marginTop: 1 }} />
          <p className="text-sm" style={{ color: "var(--error)" }}>
            {registerError}
          </p>
        </div>
      )}

      <FAB
        onRegisterMed={() => openRegisterMedicationModal(null)}
        onObservation={() => setShowObservationModal(true)}
        onBloodPressure={() => setShowBloodPressureModal(true)}
      />

      {showRegisterMedModal && (
        <RegisterMedModal
          medications={medications}
          family={family}
          user={user}
          activePatient={activePatient}
          initialMedication={selectedMedicationForModal}
          onClose={() => {
            setShowRegisterMedModal(false);
            setSelectedMedicationForModal(null);
          }}
          onSaved={async () => {
            setShowRegisterMedModal(false);
            setSelectedMedicationForModal(null);
            await loadData();
          }}
        />
      )}

      {showObservationModal && (
        <ObservationModal
          family={family}
          user={user}
          activePatient={activePatient}
          type="observation"
          title="Registrar observação"
          onClose={() => setShowObservationModal(false)}
          onSaved={async () => {
            setShowObservationModal(false);
            await loadData();
          }}
        />
      )}

      {showBloodPressureModal && (
        <ObservationModal
          family={family}
          user={user}
          activePatient={activePatient}
          type="blood_pressure"
          title="Registrar pressão"
          onClose={() => setShowBloodPressureModal(false)}
          onSaved={async () => {
            setShowBloodPressureModal(false);
            await loadData();
          }}
        />
      )}

      {showPatientPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Selecionar paciente
              </h2>

              <button onClick={() => setShowPatientPicker(false)}>
                <X size={20} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>

            <div className="space-y-2">
              {patients.map((patient) => {
                const isSelected = activePatient?.id === patient.id;

                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handleSelectPatient(patient)}
                    className="w-full p-4 rounded-2xl flex items-center justify-between text-left transition"
                    style={{
                      border: isSelected
                        ? "1px solid var(--sage-dark)"
                        : "1px solid var(--border)",
                      background: isSelected ? "var(--sage-light)" : "white",
                    }}
                  >
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {patient.name}
                      </p>

                      {patient.birth_date && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {patient.birth_date}
                        </p>
                      )}
                    </div>

                    {isSelected ? (
                      <Check size={18} style={{ color: "var(--sage-dark)" }} />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Today() {
  return <TodayContent />;
}