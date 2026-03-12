import { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Activity,
  Calendar,
  Edit3,
} from "lucide-react";
import { useApp } from "@/lib/AuthContext";
import PinModal from "@/components/corae/PinModal";

function DiaryContent() {
  const { family, member, activePatient } = useApp();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMarkIncorrect, setShowMarkIncorrect] = useState(null);
  const [showPin, setShowPin] = useState(false);
  const [incorrectReason, setIncorrectReason] = useState("");

  useEffect(() => {
    if (family?.id && activePatient?.id) loadRecords();
  }, [family, activePatient]);

  async function loadRecords() {
    if (!family?.id || !activePatient?.id) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("care_records")
        .select("*")
        .eq("family_id", family.id)
        .eq("patient_id", activePatient.id)
        .order("actual_time", { ascending: false })
        .limit(100);

      if (error) throw error;

      setRecords(data || []);
    } catch (err) {
      console.error("Erro ao carregar diário:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  function groupByDay(items) {
    const groups = {};
    items.forEach((r) => {
      const day = r.actual_time?.substring(0, 10) || "unknown";
      if (!groups[day]) groups[day] = [];
      groups[day].push(r);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }

  function dayLabel(dateStr) {
    try {
      const d = parseISO(dateStr);
      if (isToday(d)) return "Hoje";
      if (isYesterday(d)) return "Ontem";
      return format(d, "EEEE, d 'de' MMMM", { locale: ptBR });
    } catch {
      return dateStr;
    }
  }

  function getMedicationName(r) {
    return (
      r.medication_name ||
      r.details?.medication_name ||
      null
    );
  }

  function getScheduledTime(r) {
    return (
      r.scheduled_time ||
      r.details?.scheduled_time ||
      null
    );
  }

  function getStatus(r) {
    return r.status || r.details?.status || null;
  }

  function getIncorrectReason(r) {
    return r.incorrect_reason || r.details?.incorrect_reason || null;
  }

  function getBloodPressure(r) {
    const sys = r.details?.sys ?? null;
    const dia = r.details?.dia ?? null;
    const pulse = r.details?.pulse ?? null;

    return { sys, dia, pulse };
  }
  
  function getIcon(type, status) {
    if (type === "administered" && status === "on_time") {
      return { Icon: CheckCircle, color: "var(--success)", bg: "#E8F5EE" };
    }
    if (type === "administered" && status === "delayed") {
      return { Icon: Clock, color: "var(--warning)", bg: "#FEF3E2" };
    }
    if (type === "administered" && status === "incorrect") {
      return { Icon: AlertTriangle, color: "var(--error)", bg: "#FDE8E6" };
    }
    if (type === "missed") {
      return { Icon: XCircle, color: "var(--error)", bg: "#FDE8E6" };
    }
    if (type === "observation") {
      return { Icon: FileText, color: "#7B6E9E", bg: "#EEE8F5" };
    }
    if (type === "blood_pressure") {
      return { Icon: Activity, color: "#9E7B6E", bg: "#F5EEE8" };
    }
    if (type === "appointment") {
      return { Icon: Calendar, color: "#C5584A", bg: "#FDE8E6" };
    }
    if (
      type === "change_suggested" ||
      type === "change_approved" ||
      type === "change_rejected"
    ) {
      return { Icon: Edit3, color: "#7B8B9E", bg: "#E8EEF5" };
    }
    return {
      Icon: CheckCircle,
      color: "var(--text-secondary)",
      bg: "var(--warm)",
    };
  }

  function getLabel(r) {
    const status = getStatus(r);

    const typeLabels = {
      administered:
        status === "delayed"
          ? "Administrado com atraso"
          : status === "incorrect"
          ? "Registrado como incorreto"
          : "Administrado",
      missed: "Dose não registrada",
      observation: "Observação",
      blood_pressure: "Pressão registrada",
      appointment: "Consulta agendada",
      change_suggested: "Alteração sugerida",
      change_approved: "Alteração aprovada",
      change_rejected: "Alteração rejeitada",
    };

    return typeLabels[r.record_type] || r.record_type;
  }

  async function markIncorrect(record, reason) {
    try {
      const currentDetails =
        record.details && typeof record.details === "object"
          ? record.details
          : {};

      const { error } = await supabase
        .from("care_records")
        .update({
          details: {
            ...currentDetails,
            status: "incorrect",
            incorrect_reason: reason || null,
          },
        })
        .eq("id", record.id);

      if (error) throw error;

      setShowMarkIncorrect(null);
      setIncorrectReason("");
      await loadRecords();
    } catch (err) {
      console.error("Erro ao marcar como incorreto:", err);
      alert(err?.message || "Erro ao atualizar registro.");
    }
  }

  const groups = groupByDay(records);

  if (!family) return null;

  return (
    <div className="p-4 space-y-6">
      <h1
        className="text-2xl font-semibold pt-2"
        style={{ color: "var(--text-primary)" }}
      >
        Diário
      </h1>

      {loading ? (
        <div className="flex justify-center py-10">
          <div
            className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--sage)" }}
          />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <p style={{ color: "var(--text-secondary)" }}>
            Nenhum registro ainda.
          </p>
        </div>
      ) : (
        groups.map(([day, dayRecords]) => (
          <div key={day}>
            <p
              className="text-sm font-semibold mb-3 capitalize"
              style={{ color: "var(--text-secondary)" }}
            >
              {dayLabel(day)}
            </p>

            <div className="space-y-2">
              {dayRecords.map((r) => {
                const status = getStatus(r);
                const medicationName = getMedicationName(r);
                const scheduledTime = getScheduledTime(r);
                const incorrectReasonValue = getIncorrectReason(r);
                const { Icon, color, bg } = getIcon(r.record_type, status);
                const { sys, dia, pulse } = getBloodPressure(r);

                return (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-white flex items-start gap-3"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: bg }}
                    >
                      <Icon size={18} style={{ color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className="font-medium text-sm"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {getLabel(r)}
                            {medicationName ? ` — ${medicationName}` : ""}
                          </p>

                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {r.is_system ? "Sistema" : r.recorded_by_name || "—"}
                            {r.actual_time
                              ? ` · ${format(parseISO(r.actual_time), "HH:mm")}`
                              : ""}
                            {scheduledTime
                              ? ` (previsto ${format(
                                  parseISO(scheduledTime),
                                  "HH:mm"
                                )})`
                              : ""}
                          </p>

                          {r.notes && (
                            <p
                              className="text-xs mt-1 italic"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {r.notes}
                            </p>
                          )}

                          {r.record_type === "blood_pressure" && (sys || dia || pulse) && (
                            <p
                              className="text-xs mt-1"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {sys || "—"}/{dia || "—"} mmHg
                              {pulse ? ` · Pulso ${pulse} bpm` : ""}
                            </p>
                          )}

                          {incorrectReasonValue && (
                            <p
                              className="text-xs mt-1"
                              style={{ color: "var(--error)" }}
                            >
                              Motivo: {incorrectReasonValue}
                            </p>
                          )}
                        </div>

                        {r.record_type === "administered" &&
                          status !== "incorrect" &&
                          member?.role === "principal" &&
                          !r.is_system && (
                            <button
                              onClick={() => setShowMarkIncorrect(r)}
                              className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                              style={{
                                color: "var(--error)",
                                border: "1px solid var(--error)",
                              }}
                            >
                              Incorreto
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {showMarkIncorrect && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          {!showPin ? (
            <div className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-10">
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Marcar como incorreto
              </h3>

              <p
                className="text-sm mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                O registro não será apagado. Informe o motivo:
              </p>

              <textarea
                className="w-full p-3 rounded-xl border text-sm resize-none outline-none mb-4"
                style={{
                  background: "var(--warm)",
                  border: "1px solid var(--border)",
                }}
                rows={3}
                placeholder="Descreva o motivo..."
                value={incorrectReason}
                onChange={(e) => setIncorrectReason(e.target.value)}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowMarkIncorrect(null);
                    setIncorrectReason("");
                  }}
                  className="flex-1 h-12 rounded-xl font-medium text-sm"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Cancelar
                </button>

                <button
                  onClick={() => setShowPin(true)}
                  className="flex-1 h-12 rounded-xl font-medium text-sm text-white"
                  style={{ background: "var(--error)" }}
                >
                  Continuar com PIN
                </button>
              </div>
            </div>
          ) : (
            <PinModal
              family={family}
              onConfirm={() => {
                setShowPin(false);
                markIncorrect(showMarkIncorrect, incorrectReason);
              }}
              onClose={() => setShowPin(false)}
              title="Confirmar marcação"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function Diary() {
  return <DiaryContent />;
}