import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Loader2, Mail, Lock } from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import { useApp } from "@/lib/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user, family, initialize } = useApp();

  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user || user) {
        if (family) {
          navigate("/home", { replace: true });
        } else {
          navigate("/create-family", { replace: true });
        }
        return;
      }

      setChecking(false);
    }

    checkSession();
  }, [navigate, user, family]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) throw error;
      }

      await initialize();
    } catch (err) {
      setError(err?.message || `Não foi possível ${mode === "login" ? "entrar" : "criar a conta"}.`);
      setLoading(false);
      return;
    }

    setLoading(false);

    if (mode === "signup") {
      navigate("/create-family", { replace: true });
      return;
    }

    navigate(family ? "/home" : "/create-family", { replace: true });
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f1eb] px-6">
        <div className="flex items-center gap-2 text-[#6b7d6b]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Verificando sessão...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1eb] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-[28px] border border-[#e7dfd4] shadow-sm px-8 py-10">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[#dcead9] flex items-center justify-center shadow-md mb-8">
            <Heart className="w-11 h-11 text-[#6b7d6b] fill-[#6b7d6b]" />
          </div>

          <h1 className="text-[2rem] leading-tight font-bold text-[#243424]">
            {mode === "login" ? "Bem-vindo ao Corae" : "Crie sua conta"}
          </h1>

          <p className="mt-3 text-[1.05rem] text-[#7a887a]">
            {mode === "login" ? "Entre para continuar" : "Cadastre-se para começar"}
          </p>
        </div>

        <div className="mt-8">
          <button
            type="button"
            disabled
            className="w-full h-14 rounded-2xl border border-[#d8d3c8] bg-white text-[#6e7b6e] font-medium flex items-center justify-center gap-3 opacity-70 cursor-not-allowed"
          >
            <span className="text-lg">G</span>
            Continuar com Google
          </button>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px flex-1 bg-[#e5e0d6]" />
            <span className="text-sm font-semibold text-[#9aa39a]">OU</span>
            <div className="h-px flex-1 bg-[#e5e0d6]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#556555] mb-2">
                E-mail
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 text-[#91a091] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className="w-full h-14 rounded-2xl border border-[#ddd6ca] bg-[#fcfbf8] pl-11 pr-4 text-[#394739] placeholder:text-[#a3aea3] outline-none focus:border-[#b8cab8] focus:ring-2 focus:ring-[#dcead9]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#556555] mb-2">
                Senha
              </label>

              <div className="relative">
                <Lock className="w-4 h-4 text-[#91a091] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 rounded-2xl border border-[#ddd6ca] bg-[#fcfbf8] pl-11 pr-4 text-[#394739] placeholder:text-[#a3aea3] outline-none focus:border-[#b8cab8] focus:ring-2 focus:ring-[#dcead9]"
                  required
                  minLength={6}
                />
              </div>
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
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === "login" ? "Entrando..." : "Criando conta..."}
                </>
              ) : mode === "login" ? (
                "Entrar"
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm text-[#7f8b7f]">
            <button
              type="button"
              className="hover:text-[#516451] transition"
            >
              Esqueceu a senha?
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setMode((prev) => (prev === "login" ? "signup" : "login"));
              }}
              className="hover:text-[#516451] transition"
            >
              {mode === "login" ? "Criar conta" : "Já tenho conta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}