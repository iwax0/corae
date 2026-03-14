import { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { Heart } from "lucide-react";

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [familyName, setFamilyName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (pin.length !== 4 || isNaN(Number(pin))) {
      setError("PIN deve ter 4 dígitos numéricos.");
      return;
    }

    if (pin !== pin2) {
      setError("Os PINs não coincidem.");
      return;
    }

    if (!familyName.trim() || !patientName.trim()) {
      setError("Preencha todos os campos.");
      return;
    }

    if (!user?.email) {
      setError("Usuário não identificado.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert([
          {
            name: familyName.trim(),
            patient_name: patientName.trim(),
            pin,
            principal_email: user.email,
          },
        ])
        .select()
        .single();

      if (familyError) throw familyError;

      const { error: memberError } = await supabase
        .from("family_members")
        .insert([
          {
            family_id: family.id,
            user_email: user.email,
            user_name: user.full_name || user.email,
            role: "principal",
            joined_at: new Date().toISOString(),
          },
        ]);

      if (memberError) throw memberError;

      const { error: patientError } = await supabase
        .from("patients")
        .insert([
          {
            family_id: family.id,
            name: patientName.trim(),
            birthdate: null,
          },
        ]);

      if (patientError) throw patientError;

      onComplete();
    } catch (e) {
      console.error("Erro ao criar família:", e);
      setError(e?.message || "Erro ao criar família. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (step === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 py-8"
        style={{ background: "var(--warm)" }}
      >
        <div className="w-full max-w-md text-center">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6 mx-auto"
            style={{ background: "var(--sage-light)" }}
          >
            <Heart size={32} style={{ color: "var(--sage-dark)" }} />
          </div>

          <h1
            className="text-3xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Bem-vindo ao Corae
          </h1>

          <p
            className="text-base mb-8 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Organize os cuidados em família com simplicidade e carinho.
          </p>

          <div
            className="w-full p-4 rounded-2xl mb-8"
            style={{
              background: "white",
              border: "1px solid #B8D4C0",
            }}
          >
            <p
              className="text-sm text-center"
              style={{ color: "var(--text-primary)" }}
            >
              ⚕️ O Corae organiza registros e não substitui orientação médica.
            </p>
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full h-14 rounded-2xl font-semibold text-base transition-all active:scale-95"
            style={{
              background: "#2F6F57",
              color: "white",
            }}
          >
            Começar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-8"
      style={{ background: "var(--warm)" }}
    >
      <div className="w-full max-w-md">
        <h2
          className="text-2xl font-semibold mb-2 text-center"
          style={{ color: "var(--text-primary)" }}
        >
          Criar família
        </h2>

        <p
          className="text-sm mb-8 text-center"
          style={{ color: "var(--text-secondary)" }}
        >
          Você será o Responsável Principal.
        </p>

        <div className="space-y-4 w-full">
          <div>
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Nome da família / equipe
            </label>
            <input
              className="w-full h-14 px-4 rounded-2xl border text-base outline-none"
              style={{
                background: "white",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder="Ex: Família Silva"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
            />
          </div>

          <div>
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Nome do paciente
            </label>
            <input
              className="w-full h-14 px-4 rounded-2xl border text-base outline-none"
              style={{
                background: "white",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder="Ex: Maria"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>

          <div>
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Criar PIN (4 dígitos)
            </label>
            <input
              className="w-full h-14 px-4 rounded-2xl border text-base outline-none tracking-widest"
              style={{
                background: "white",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder="••••"
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div>
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Confirmar PIN
            </label>
            <input
              className="w-full h-14 px-4 rounded-2xl border text-base outline-none tracking-widest"
              style={{
                background: "white",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder="••••"
              type="password"
              maxLength={4}
              value={pin2}
              onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--error)" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full h-14 rounded-2xl font-semibold text-base transition-all active:scale-95 mt-4"
            style={{
              background: loading ? "#7FA594" : "#2F6F57",
              color: "white",
            }}
          >
            {loading ? "Criando..." : "Criar família"}
          </button>
        </div>
      </div>
    </div>
  );
}