import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import { useApp } from "@/lib/AuthContext";

export default function CreateFamily() {
  const navigate = useNavigate();
  const { user, refreshFamily } = useApp();

  const [familyName, setFamilyName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [responsibleName, setResponsibleName] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");

    if (!user) {
      setError("Usuário não autenticado.");
      return;
    }

    if (!familyName.trim()) {
      setError("Informe o nome da família.");
      return;
    }

    if (!patientName.trim()) {
      setError("Informe o nome do paciente.");
      return;
    }

    if (!responsibleName.trim()) {
      setError("Informe o nome do responsável.");
      return;
    }

    if (pin.length !== 4 || isNaN(Number(pin))) {
      setError("PIN deve ter 4 dígitos numéricos.");
      return;
    }

    if (pin !== pin2) {
      setError("Os PINs não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const authEmail = user?.email?.trim();
      const authName =
        user?.full_name?.trim() ||
        user?.user_metadata?.full_name?.trim() ||
        responsibleName.trim() ||
        authEmail;

      console.log("auth email:", authEmail);
      console.log("context user:", user);

      if (!authEmail) {
        setError("Usuário autenticado sem email. Verifique o login.");
        return;
      }

      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert([
          {
            name: familyName.trim(),
            patient_name: patientName.trim(),
            pin: pin.trim(),
            principal_email: authEmail,
            principal_name: authName,
          },
        ])
        .select()
        .single();

      console.log("family result:", family);
      console.log("familyError:", familyError);

      if (familyError) {
        if (familyError.code === "42501") {
          setError("Sem permissão para criar a família. Verifique login e políticas do Supabase.");
        } else {
          setError(familyError.message || "Erro ao criar família.");
        }
        return;
      }

      const { error: memberError } = await supabase
        .from("family_members")
        .insert([
          {
            family_id: family.id,
            user_email: authEmail,
            user_name: authName,
            role: "principal",
            is_active: true,
          },
        ]);

      console.log("memberError:", memberError);

      if (memberError) {
        await supabase.from("families").delete().eq("id", family.id);

        if (memberError.code === "42501") {
          setError("Família criada, mas sem permissão para criar o vínculo do membro.");
        } else {
          setError(memberError.message || "Erro ao vincular membro à família.");
        }
        return;
      }

      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .insert([
          {
            family_id: family.id,
            name: patientName.trim(),
            is_active: true,
          },
        ])
        .select()
        .single();

      console.log("patient result:", patient);
      console.log("patientError:", patientError);

      if (patientError) {
        await supabase.from("family_members").delete().eq("family_id", family.id);
        await supabase.from("families").delete().eq("id", family.id);

        setError(patientError.message || "Erro ao criar paciente.");
        return;
      }

      if (refreshFamily) {
        await refreshFamily();
      }

      navigate("/");
    } catch (err) {
      console.error("Erro ao criar família:", err);
      setError(err?.message || "Erro inesperado ao criar família.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f3ee] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-[#e8dfd3] p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#5d7357] flex items-center justify-center mb-3">
            <Heart className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-2xl font-semibold text-[#2f3a2f]">Criar família</h1>

          <p className="text-sm text-[#6b7280] mt-1 text-center">
            Cadastre a família principal para começar a usar o Corae.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Nome da família
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="w-full rounded-2xl border border-[#d8d2c8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#5d7357]"
              placeholder="Ex: Família Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Nome do paciente
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full rounded-2xl border border-[#d8d2c8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#5d7357]"
              placeholder="Ex: Maria Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Nome do responsável
            </label>
            <input
              type="text"
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
              className="w-full rounded-2xl border border-[#d8d2c8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#5d7357]"
              placeholder="Ex: Akira"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Criar PIN (4 dígitos)
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-2xl border border-[#d8d2c8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#5d7357]"
              placeholder="••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Confirmar PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin2}
              onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-2xl border border-[#d8d2c8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#5d7357]"
              placeholder="••••"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full rounded-2xl bg-[#5d7357] text-white font-medium py-3 disabled:opacity-60"
          >
            {loading ? "Criando..." : "Criar família"}
          </button>
        </div>
      </div>
    </div>
  );
}