
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
    <Layout>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/atendente"
          element={
            role === "attendant" ? <AttendantDashboard /> : <Navigate to="/" />
          }
        />

        <Route
          path="/cozinha"
          element={role === "kitchen" ? <KitchenDashboard /> : <Navigate to="/" />}
        />

        <Route
          path="/gerencia"
          element={role === "manager" ? <ManagerDashboard /> : <Navigate to="/" />}
        />

          <Route
          path="/login"
          element={role === "login" ? <Login /> : <Navigate to="/" />}
        />
      </Routes>
    </Layout>
  );
}
