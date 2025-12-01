
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  const { role, logout } = useAuth();

  const roleLabel =
    role === "attendant"
      ? "Atendente"
      : role === "kitchen"
      ? "Cozinha"
      : role === "manager"
      ? "Gerência"
      : "";

  return (
    <div className="app">
      <header className="app-header" style={{ color: "#fff", backgroundColor: "#000" }}>
          <div className="Logo">
          <Link to="/login">
            <img src="/Logo.PNG" style={{ height: "180px" }} />
          </Link>
          </div>
        {role && (
          <div className="app-header-right">
            <span>{roleLabel}</span>
            <button onClick={logout}>Sair</button>
          </div>
        )}
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
