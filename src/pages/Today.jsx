import { useState, useEffect } from "react";
import { format, parseISO, isToday } from "date-fns";
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
} from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import { useApp } from "@/lib/AuthContext";
import FAB from "@/components/corae/FAB";
import ObservationModal from "@/components/corae/ObservationModal";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

function TodayContent() {
  const { user, family, loading, activePatient, patients } = useApp();

  const [medications, setMedications] = useState([]);
  const [todayRecords, setTodayRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [registeringId, setRegisteringId] = useState(null);
  const [registerError, setRegisterError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [showObservationModal, setShowObservationModal] = useState(false);

  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [loading, family?.id, activePatient?.id]);

  async function loadData() {
    if (!family?.id) {
      setMedications([]);
      setTodayRecords([]);
      setAppointments([]);
      setPageLoading(false);
      return;
    }

    if (!activePatient?.id) {
      setMedications([]);
      setTodayRecords([]);
      setAppointments([]);
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

      const [medsRes, recordsRes, apptsRes] = await Promise.all([
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
          .order("datetime", { ascending: true })
      ]);

      if (medsRes.error) throw medsRes.error;
      if (recordsRes.error) throw recordsRes.error;
      if (apptsRes.error) throw apptsRes.error;

      setMedications(medsRes.data || []);
      setTodayRecords(recordsRes.data || []);
      setAppointments(apptsRes.data || []);
    } catch (err) {
      console.error("Erro ao carregar Today:", err);
      setMedications([]);
      setTodayRecords([]);
      setAppointments([]);
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
    return todayRecords.some(
      (record) =>
        record.record_type === "medication" &&
        record.medication_id === medication.id
    );
  }

  async function handleRegisterMedication(medication) {
    if (!user || !family?.id || !activePatient?.id) return;

    setRegisteringId(medication.id);
    setRegisterError("");

    try {
      const alreadyTaken = wasMedicationTakenToday(medication);

      if (alreadyTaken) {
        setRegisterError("Essa medicação já foi registrada hoje.");
        return;
      }

      const { error } = await supabase.from("care_records").insert([
        {
          family_id: family.id,
          patient_id: activePatient.id,
          medication_id: medication.id,
          record_type: "medication",
          actual_time: new Date().toISOString(),
          recorded_by_name: user.full_name || user.email,
          recorded_by_email: user.email,
          is_system: false,
          notes: `Medicamento administrado: ${medication.name}`,
          details: {
            medication_name: medication.name,
            dosage: medication.dosage || null,
            fixed_times: medication.fixed_times || [],
            interval_hours: medication.interval_hours || null,
          },
        },
      ]);

      if (error) throw error;

      await loadData();
    } catch (err) {
      console.error("Erro ao registrar medicação:", err);
      setRegisterError(err?.message || "Erro ao registrar medicação.");
    } finally {
      setRegisteringId(null);
    }
  }

  function formatHour(value) {
    if (!value) return "--:--";
    return value.slice(0, 5);
  }

  function formatDateTime(value) {
    if (!value) return "";
    try {
      return format(parseISO(value), "HH:mm", { locale: ptBR });
    } catch {
      return value;
    }
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
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
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
            Adicione um paciente na tela Família para começar a registrar cuidados.
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
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Acompanhando{" "}
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
            {activePatient.name}
          </span>
        </p>
      </div>

      <div
        className="p-4 rounded-2xl bg-white"
        style={{ border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Heart size={18} style={{ color: "var(--sage-dark)" }} />
          <p
            className="font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Resumo do dia
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          <div
            className="rounded-xl p-3"
            style={{ background: "var(--warm)" }}
          >
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Medicações
            </p>
            <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {medications.length}
            </p>
          </div>

          <div
            className="rounded-xl p-3"
            style={{ background: "var(--warm)" }}
          >
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Registros
            </p>
            <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {todayRecords.length}
            </p>
          </div>

          <div
            className="rounded-xl p-3"
            style={{ background: "var(--warm)" }}
          >
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Consultas
            </p>
            <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
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
                        {getMedicationScheduleLabel(medication)}
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
                      onClick={() => handleRegisterMedication(medication)}
                      disabled={registeringId === medication.id}
                      className="h-10 px-4 rounded-xl text-sm font-medium text-white"
                      style={{ background: "var(--sage-dark)" }}
                    >
                      {registeringId === medication.id ? "Salvando..." : "Registrar"}
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
            to={createPageUrl("Appointments")}
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
                    {appointment.title || "Consulta"}
                  </p>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {appointment.professional_name || appointment.location || "Sem detalhes"}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {formatDateTime(appointment.appointment_date)}
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
            to={createPageUrl("Records")}
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

      <FAB onObservation={() => setShowObservationModal(true)} />

      {showObservationModal && (
        <ObservationModal
          family={family}
          user={user}
          activePatient={activePatient}
          onClose={() => setShowObservationModal(false)}
          onSaved={async () => {
            setShowObservationModal(false);
            await loadData();
          }}
        />
      )}
    </div>
  );
}

export default function Today() {
  return <TodayContent />;
}