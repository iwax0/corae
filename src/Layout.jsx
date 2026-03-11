import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Pill, BookOpen, Calendar, Users } from "lucide-react";
import { Toaster } from "sonner";

const tabs = [
  { name: "Today", label: "Hoje", icon: Home },
  { name: "Medications", label: "Medicamentos", icon: Pill },
  { name: "Diary", label: "Diário", icon: BookOpen },
  { name: "CalendarPage", label: "Calendário", icon: Calendar },
  { name: "Family", label: "Família", icon: Users },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--warm)", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        :root {
          --sage: #7B9E87;
          --sage-light: #E8F0EA;
          --sage-dark: #5A7A66;
          --warm: #F5F0EA;
          --warm-dark: #EDE5D8;
          --text-primary: #1A1A1A;
          --text-secondary: #6B6B6B;
          --border: #E5E0D8;
          --error: #C5584A;
          --warning: #D4882A;
          --success: #4A8C6F;
        }
        body { background: #F5F0EA; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E0D8]">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-xl font-semibold tracking-tight" style={{ color: "var(--sage-dark)" }}>
            Corae
          </span>
          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: "var(--sage-light)", color: "var(--sage-dark)" }}>
            {tabs.find(t => t.name === currentPageName)?.label || ""}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto max-w-lg mx-auto w-full pb-24">
        {children}
      </main>

      <Toaster position="top-center" richColors />
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-[#E5E0D8]" style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
        <div className="max-w-lg mx-auto flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPageName === tab.name;
            return (
              <Link
                key={tab.name}
                to={createPageUrl(tab.name)}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  style={{ color: isActive ? "var(--sage-dark)" : "var(--text-secondary)" }}
                />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: isActive ? "var(--sage-dark)" : "var(--text-secondary)" }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}