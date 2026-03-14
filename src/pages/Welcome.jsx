import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

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
          onClick={() => navigate("/login")}
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