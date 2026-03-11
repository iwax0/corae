import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { supabase } from "@/api/supabaseClient";

export default function Splash() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;

    setVisible(true);

    async function bootstrap() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setTimeout(() => {
          if (!active) return;
          navigate(session?.user ? "/home" : "/login", { replace: true });
        }, 1600);
      } catch (error) {
        console.error("Erro ao verificar sessão na Splash:", error);

        setTimeout(() => {
          if (!active) return;
          navigate("/login", { replace: true });
        }, 1600);
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f5f1eb] flex items-center justify-center px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-[#e8f1e6] blur-3xl opacity-70" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-[#efe7dc] blur-3xl opacity-80" />
      </div>

      <div
        className={`relative z-10 flex flex-col items-center text-center transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute w-36 h-36 rounded-full bg-[#dcead9] opacity-60 blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-[#dcead9] flex items-center justify-center shadow-[0_10px_30px_rgba(81,100,81,0.18)] border border-white/50">
            <Heart className="w-11 h-11 text-[#6b7d6b] fill-[#6b7d6b]" />
          </div>
        </div>

        <h1 className="mt-7 text-4xl font-bold tracking-tight text-[#243424]">
          Corae
        </h1>

        <p className="mt-2 text-base text-[#7a887a] font-medium">
          Cuidando com carinho
        </p>

        <p className="mt-6 max-w-xs text-sm leading-6 text-[#8b968b] text-center">
          Acompanhamos o cuidado com você.
          <br />
          O Corae não substitui orientação médica profissional.
        </p>

        <div className="mt-8 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6b7d6b] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#6b7d6b] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#6b7d6b] animate-bounce" />
        </div>

        <p className="mt-5 text-xs tracking-[0.18em] uppercase text-[#a0aaa0]">
          Abrindo 
        </p>
      </div>
    </div>
  );
}