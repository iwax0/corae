import { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  MapPin,
  FileText,
} from "lucide-react";
import { useApp } from "@/lib/AuthContext";

function CalendarContent() {
  const { user, family, member, activePatient } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (family?.id && activePatient?.id) {
        loadAppointments();
      }
    }, [family, activePatient]);

  async function loadAppointments() {
    if (!family?.id || !activePatient?.id) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("family_id", family.id)
        .eq("patient_id", activePatient.id)
        .order("datetime", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error("Erro ao carregar consultas:", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOfWeek = startOfMonth(currentMonth).getDay();

  function dayAppts(day) {
    return appointments.filter((a) => {
      try {
        return isSameDay(parseISO(a.datetime), day);
      } catch {
        return false;
      }
    });
  }

  const selectedAppts = selectedDay ? dayAppts(selectedDay) : [];

  if (!family) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Calendário
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--sage-dark)" }}
        >
          <Plus size={20} color="white" />
        </button>
      </div>

      <div className="flex items-center justify-between px-1">
        <button
          onClick={() =>
            setCurrentMonth(
              (m) => new Date(m.getFullYear(), m.getMonth() - 1)
            )
          }
        >
          <ChevronLeft size={22} style={{ color: "var(--text-secondary)" }} />
        </button>

        <span
          className="text-base font-semibold capitalize"
          style={{ color: "var(--text-primary)" }}
        >
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>

        <button
          onClick={() =>
            setCurrentMonth(
              (m) => new Date(m.getFullYear(), m.getMonth() + 1)
            )
          }
        >
          <ChevronRight size={22} style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium py-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array(firstDayOfWeek)
          .fill(null)
          .map((_, i) => (
            <div key={`e-${i}`} />
          ))}

        {days.map((day) => {
          const appts = dayAppts(day);
          const hasAppt = appts.length > 0;
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const today = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() =>
                setSelectedDay(
                  selectedDay && isSameDay(day, selectedDay) ? null : day
                )
              }
              className="flex flex-col items-center py-2 rounded-xl transition-all relative"
              style={{
                background: isSelected
                  ? "var(--sage-dark)"
                  : today
                  ? "var(--sage-light)"
                  : "transparent",
              }}
            >
              <span
                className="text-sm font-medium"
                style={{
                  color: isSelected
                    ? "white"
                    : today
                    ? "var(--sage-dark)"
                    : "var(--text-primary)",
                }}
              >
                {format(day, "d")}
              </span>

              {hasAppt && (
                <div
                  className="w-1.5 h-1.5 rounded-full mt-0.5"
                  style={{ background: isSelected ? "white" : "#C5584A" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div>
          <p
            className="text-sm font-semibold mb-3 capitalize"
            style={{ color: "var(--text-secondary)" }}
          >
            {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>

          {selectedAppts.length === 0 ? (
            <div
              className="p-4 rounded-2xl text-center bg-white"
              style={{ border: "1px solid var(--border)" }}
            >
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Nenhuma consulta neste dia.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-sm font-medium"
                style={{ color: "var(--sage-dark)" }}
              >
                + Adicionar consulta
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedAppts.map((a) => (
                <AppointmentCard key={a.id} appointment={a} />
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
          <AppointmentForm
            family={family}
            user={user}
            activePatient={activePatient}
            defaultDate={selectedDay}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              loadAppointments();
            }}
          />
      )}
    </div>
  );
}

function AppointmentCard({ appointment }) {
  return (
    <div
      className="p-4 rounded-2xl bg-white"
      style={{ border: "1px solid var(--border)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#FDE8E6" }}
        >
          <span style={{ color: "#C5584A", fontSize: 18 }}>🩺</span>
        </div>

        <div>
          <p
            className="font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {appointment.specialty}
          </p>

          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {format(parseISO(appointment.datetime), "HH:mm")}
          </p>

          {appointment.location && (
            <p
              className="text-xs mt-1 flex items-center gap-1"
              style={{ color: "var(--text-secondary)" }}
            >
              <MapPin size={11} /> {appointment.location}
            </p>
          )}

          {appointment.notes && (
            <p
              className="text-xs mt-1 flex items-center gap-1 italic"
              style={{ color: "var(--text-secondary)" }}
            >
              <FileText size={11} /> {appointment.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentForm({ family, user, activePatient, defaultDate, onClose, onSaved }) {
  const [specialty, setSpecialty] = useState("");
  const [date, setDate] = useState(
    defaultDate
      ? format(defaultDate, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd")
  );
  const [time, setTime] = useState("09:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!specialty.trim() || !family?.id || !activePatient?.id || !user) return;

    setLoading(true);

    try {
      const datetime = `${date}T${time}:00`;

      const { error: apptError } = await supabase.from("appointments").insert([
        {
          family_id: family.id,
          patient_id: activePatient.id,
          specialty: specialty.trim(),
          datetime,
          location: location.trim() || null,
          notes: notes.trim() || null,
        },
      ]);

      if (apptError) throw apptError;

      const { error: logError } = await supabase.from("care_records").insert([
        {
          family_id: family.id,
          patient_id: activePatient.id,
          record_type: "appointment",
          actual_time: new Date().toISOString(),
          recorded_by_name: user.full_name || user.email,
          recorded_by_email: user.email,
          is_system: false,
          notes: `Consulta registrada — ${specialty.trim()} — agendada para ${format(
            parseISO(datetime),
            "dd/MM/yyyy 'às' HH:mm"
          )}`,
        },
      ]);

      if (logError) throw logError;

      onSaved?.();
    } catch (err) {
      console.error("Erro ao salvar consulta:", err);
      alert(err?.message || "Erro ao agendar consulta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Agendar consulta
          </h2>
          <button onClick={onClose}>
            <X size={20} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <div className="space-y-4">
          {[
            {
              label: "Especialidade",
              value: specialty,
              set: setSpecialty,
              placeholder: "Ex: Cardiologia, Clínico Geral",
            },
            {
              label: "Local (opcional)",
              value: location,
              set: setLocation,
              placeholder: "Ex: Hospital XYZ",
            },
          ].map((f) => (
            <div key={f.label}>
              <label
                className="text-sm font-medium block mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {f.label}
              </label>
              <input
                className="w-full h-12 px-4 rounded-xl border text-base outline-none"
                style={{
                  background: "var(--warm)",
                  border: "1px solid var(--border)",
                }}
                placeholder={f.placeholder}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="text-sm font-medium block mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Data
              </label>
              <input
                type="date"
                className="w-full h-12 px-3 rounded-xl border text-sm outline-none"
                style={{
                  background: "var(--warm)",
                  border: "1px solid var(--border)",
                }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label
                className="text-sm font-medium block mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Hora
              </label>
              <input
                type="time"
                className="w-full h-12 px-3 rounded-xl border text-sm outline-none"
                style={{
                  background: "var(--warm)",
                  border: "1px solid var(--border)",
                }}
                value={time}
                onChange={(e) => setTime(e.target.value)}
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
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading || !specialty.trim()}
            className="w-full h-14 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
            style={{
              background:
                specialty.trim() && !loading ? "var(--sage-dark)" : "#C5BDB5",
            }}
          >
            {loading ? "Salvando..." : "Agendar consulta"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return <CalendarContent />;
}