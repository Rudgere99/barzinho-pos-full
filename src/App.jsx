import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import AttendantDashboard from "./pages/AttendantDashboard.jsx";
import KitchenDashboard from "./pages/KitchenDashboard.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import Layout from "./components/Layout.jsx";

export default function App() {
  const { role } = useAuth();

  return (
    <Routes>
      {/* Tela de login SEM layout (sem header) */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Rotas internas COM layout */}
      <Route
        path="/atendente"
        element={
          role === "attendant" ? (
            <Layout>
              <AttendantDashboard />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/cozinha"
        element={
          role === "kitchen" ? (
            <Layout>
              <KitchenDashboard />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/gerencia"
        element={
          role === "manager" ? (
            <Layout>
              <ManagerDashboard />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
}
