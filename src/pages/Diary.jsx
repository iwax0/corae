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
import BottomSheet from "@/components/corae/BottomSheet";
import { motion, AnimatePresence } from "framer-motion";
import {
  getRecordBloodPressure,
  getRecordIncorrectReason,
  getRecordLabel,
  getRecordMedicationName,
  getRecordScheduledTime,
  getRecordStatus,
  getRecordDetails,
} from "@/utils/careRecordHelpers";

function DiaryContent() {
  const { family, member, activePatient } = useApp();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMarkIncorrect, setShowMarkIncorrect] = useState(null);
  const [incorrectStep, setIncorrectStep] = useState("reason");
  const [incorrectReason, setIncorrectReason] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

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

  function openIncorrectFlow(record) {
    setShowMarkIncorrect(record);
    setIncorrectStep("reason");
    setIncorrectReason("");
    setPin("");
    setPinError("");
  }

  function closeIncorrectFlow() {
    setShowMarkIncorrect(null);
    setIncorrectStep("reason");
    setIncorrectReason("");
    setPin("");
    setPinError("");
  }

  async function markIncorrect(record, reason) {
    try {
      const currentDetails = getRecordDetails(record);

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

      closeIncorrectFlow();
      await loadRecords();
    } catch (err) {
      console.error("Erro ao marcar como incorreto:", err);
      alert(err?.message || "Erro ao atualizar registro.");
    }
  }

  function verifyPin(p) {
    if (p === family?.pin) {
      markIncorrect(showMarkIncorrect, incorrectReason);
    } else {
      setPinError("PIN incorreto. Tente novamente.");
      setPin("");
    }
  }

  function handleDigit(d) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setPinError("");

    if (next.length === 4) {
      setTimeout(() => verifyPin(next), 100);
    }
  }

  function handleDelete() {
    setPin((p) => p.slice(0, -1));
    setPinError("");
  }

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
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
                const status = getRecordStatus(r);
                const medicationName = getRecordMedicationName(r);
                const scheduledTime = getRecordScheduledTime(r);
                const incorrectReasonValue = getRecordIncorrectReason(r);
                const { Icon, color, bg } = getIcon(r.record_type, status);
                const { sys, dia, pulse } = getRecordBloodPressure(r);

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
                            {getRecordLabel(r)}
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

                          {r.record_type === "blood_pressure" &&
                            (sys || dia || pulse) && (
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
                              onClick={() => openIncorrectFlow(r)}
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
        <BottomSheet
          open={!!showMarkIncorrect}
          title={
            incorrectStep === "reason"
              ? "Marcar como incorreto"
              : "Confirmar com PIN"
          }
          onClose={closeIncorrectFlow}
        >
          <AnimatePresence mode="wait">
            {incorrectStep === "reason" ? (
              <motion.div
                key="reason-step"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
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
                    onClick={closeIncorrectFlow}
                    className="flex-1 h-12 rounded-xl font-medium text-sm"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={() => {
                      setIncorrectStep("pin");
                      setPin("");
                      setPinError("");
                    }}
                    className="flex-1 h-12 rounded-xl font-medium text-sm text-white"
                    style={{ background: "var(--error)" }}
                  >
                    Continuar com PIN
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="pin-step"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
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
                        background:
                          i < pin.length ? "var(--sage-dark)" : "transparent",
                        borderColor:
                          i < pin.length ? "var(--sage-dark)" : "var(--border)",
                      }}
                    />
                  ))}
                </div>

                {pinError && (
                  <p
                    className="text-center text-sm mb-4"
                    style={{ color: "var(--error)" }}
                  >
                    {pinError}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {digits.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        d === "⌫"
                          ? handleDelete()
                          : d !== ""
                          ? handleDigit(d)
                          : null
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

                <button
                  type="button"
                  onClick={() => {
                    setIncorrectStep("reason");
                    setPin("");
                    setPinError("");
                  }}
                  className="w-full h-12 rounded-xl font-medium text-sm"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Voltar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </BottomSheet>
      )}
    </div>
  );
}

export default function Diary() {
  return <DiaryContent />;
}