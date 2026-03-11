import { Clock, RefreshCw, Calendar, ChevronRight } from "lucide-react";

const COLORS = ["#7B9E87", "#9E7B8B", "#7B8B9E", "#9E9E7B", "#8B9E7B"];

function getColor(id) {
  const str = String(id || "");
  const hash = str ? str.charCodeAt(0) % COLORS.length : 0;
  return COLORS[hash];
}

export default function MedicationCard({ medication, onPress }) {
  const color = medication.color || getColor(medication.id);

  const scheduleLabel = () => {
    if (medication.type === "fixed") {
      return (medication.fixed_times || []).join(" · ");
    }
    return `A cada ${medication.interval_hours}h`;
  };

  const durationLabel = () => {
    if (medication.duration_type === "continuous") return "Uso contínuo";
    if (medication.duration_type === "days") return `Por ${medication.duration_days} dias`;
    return "Apenas uma vez";
  };

  return (
    <button
      onClick={onPress}
      className="w-full p-4 rounded-2xl text-left transition-all active:scale-98 bg-white"
      style={{ border: "1px solid var(--border)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
          style={{ background: color }}
        />
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold text-base leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {medication.name}
          </p>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            {medication.dosage}
          </p>

          <div className="flex flex-wrap gap-3 mt-2">
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {medication.type === "fixed" ? (
                <Clock size={12} />
              ) : (
                <RefreshCw size={12} />
              )}
              {scheduleLabel()}
            </span>

            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              <Calendar size={12} />
              {durationLabel()}
            </span>
          </div>

          {medication.instructions && (
            <p
              className="text-xs mt-2 italic"
              style={{ color: "var(--text-secondary)" }}
            >
              {medication.instructions}
            </p>
          )}
        </div>

        <ChevronRight
          size={18}
          style={{ color: "var(--text-secondary)" }}
          className="flex-shrink-0 mt-1"
        />
      </div>
    </button>
  );
}