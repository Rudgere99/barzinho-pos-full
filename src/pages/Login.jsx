
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const GERENCIA_PASSWORD = "1234";

export default function Login() {
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role, path) => {
    if (role === "manager") {
      const password = window.prompt("Digite a senha da Gerência:");
      if (!password) return;
      if (password !== GERENCIA_PASSWORD) {
        alert("Senha incorreta!");
        return;
      }
    }
    loginAs(role);
    navigate(path);
  };

  return (
    <div className="card perfil-card">
      <h2 style={{ textAlign: "center" }}>Escolha o perfil</h2>
      <div className="role-buttons">
        <button onClick={() => handleLogin("attendant", "/atendente")}>
          Atendente
        </button>
        <button onClick={() => handleLogin("kitchen", "/cozinha")}>
          Cozinha
        </button>
        <button onClick={() => handleLogin("manager", "/gerencia")}>
          Gerência
        </button>
      </div>
    </div>
  );
}
