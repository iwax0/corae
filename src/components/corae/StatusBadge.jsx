import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

const configs = {
  on_time: { icon: CheckCircle, label: "No horário", bg: "#E8F5EE", color: "#4A8C6F" },
  delayed: { icon: Clock, label: "Com atraso", bg: "#FEF3E2", color: "#D4882A" },
  missed: { icon: XCircle, label: "Não registrada", bg: "#FDE8E6", color: "#C5584A" },
  incorrect: { icon: AlertTriangle, label: "Incorreto", bg: "#FEF3E2", color: "#D4882A" },
};

export default function StatusBadge({ status }) {
  const cfg = configs[status] || configs.on_time;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}