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
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responsibleName, setResponsibleName] = useState("");

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

    if (!responsibleName.trim()) {
        setError("Informe o nome do responsável.");
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
            user_name: responsibleName.trim(),
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

      await refreshFamily();
      navigate("/home", { replace: true });
    } catch (e) {
      console.error("Erro ao criar família:", e);
      setError(e?.message || "Erro ao criar família. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f1eb] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-[28px] border border-[#e7dfd4] shadow-sm px-8 py-10">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[#dcead9] flex items-center justify-center shadow-md mb-8">
            <Heart className="w-11 h-11 text-[#6b7d6b] fill-[#6b7d6b]" />
          </div>

          <h1 className="text-[2rem] leading-tight font-bold text-[#243424]">
            Criar família
          </h1>

          <p className="mt-3 text-[1.05rem] text-[#7a887a]">
            Você será o Responsável Principal
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-[#556555] mb-2">
              Seu nome
            </label>
            <input
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
              placeholder="Nome"
              className="w-full h-14 rounded-2xl border border-[#ddd6ca] bg-[#fcfbf8] px-4 text-[#394739] placeholder:text-[#a3aea3] outline-none focus:border-[#b8cab8] focus:ring-2 focus:ring-[#dcead9]"
              required
            />
          </div> 

          <div>
            <label className="block text-sm font-medium text-[#556555] mb-2">
              Nome da família / Equipe
            </label>
            <input
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Ex: Família Silva"
              className="w-full h-14 rounded-2xl border border-[#ddd6ca] bg-[#fcfbf8] px-4 text-[#394739] placeholder:text-[#a3aea3] outline-none focus:border-[#b8cab8] focus:ring-2 focus:ring-[#dcead9]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#556555] mb-2">
              Nome do paciente
            </label>
            <input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Ex: Maria"
              className="w-full h-14 rounded-2xl border border-[#ddd6ca] bg-[#fcfbf8] px-4 text-[#394739] placeholder:text-[#a3aea3] outline-none focus:border-[#b8cab8] focus:ring-2 focus:ring-[#dcead9]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#556555] mb-2">
              Criar PIN (4 dígitos)
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="w-full h-14 rounded-2xl border border-[#ddd6ca] bg-[#fcfbf8] px-4 text-[#394739] placeholder:text-[#a3aea3] outline-none tracking-widest focus:border-[#b8cab8] focus:ring-2 focus:ring-[#dcead9]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#556555] mb-2">
              Confirmar PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin2}
              onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="w-full h-14 rounded-2xl border border-[#ddd6ca] bg-[#fcfbf8] px-4 text-[#394739] placeholder:text-[#a3aea3] outline-none tracking-widest focus:border-[#b8cab8] focus:ring-2 focus:ring-[#dcead9]"
              required
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-[#516451] text-white font-semibold text-base hover:opacity-95 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Criando..." : "Criar família"}
          </button>
        </form>
      </div>
    </div>
  );
}