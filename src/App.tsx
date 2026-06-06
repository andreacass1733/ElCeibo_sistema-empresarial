import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router";

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";

import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

/* =========================
   ADMINISTRADOR
========================= */
import Home from "./pages/Dashboard/Home";
import GestionEmpresarial from "./pages/Administrador/GestionEmpresarial";
import KPI from "./pages/Administrador/KPI";
import Capacitacion from "./pages/Administrador/Capacitacion";
import Reporte from "./pages/Administrador/Resporte";
import Usuarios from "./pages/Administrador/Usuarios";

/* =========================
   EMPLEADO
========================= */
import AppLayoutEmpleado from "./layout/AppLayoutEmpleado";
import EmpleadoHome from "./pages/Empleado/EmpleadoHome";
import EmpleadoPerfil from "./pages/Empleado/EmpleadoPerfil";
import EmpleadoCapacitaciones from "./pages/Empleado/EmpleadoCapacitaciones";
import EmpleadoHistorial from "./pages/Empleado/EmpleadoHistorial";
import EmpleadoDesempeno from "./pages/Empleado/EmpleadoDesempeno";
import EmpleadoObjetivos from "./pages/Empleado/EmpleadoObjetivos";
import EmpleadoReportes from "./pages/Empleado/EmpleadoReportes";
import EmpleadoConstancias from "./pages/Empleado/EmpleadoConstancias";

/* =========================
   ROLES ESPECÍFICOS
========================= */
import CajeroHome from "./pages/Cajero/CajeroHome";
import AlmaceneroHome from "./pages/Almacenero/AlmaceneroHome";
import ProduccionHome from "./pages/Produccion/ProduccionHome";
import VendedorHome from "./pages/Vendedor/VendedorHome";

/* =========================
   GUARD DE RUTAS
========================= */
function PrivateRoute({ rolesPermitidos }: { rolesPermitidos: string[] }) {
  const rol = localStorage.getItem("rol");
  if (!rol) return <Navigate to="/signin" replace />;
  if (!rolesPermitidos.includes(rol)) return <Navigate to="/signin" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>

        {/* =========================================
            REDIRIGIR "/" AL LOGIN
        ========================================= */}
        <Route path="/" element={<Navigate to="/signin" replace />} />

        {/* =========================================
            AUTH
        ========================================= */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* =========================================
            ADMINISTRADOR
        ========================================= */}
        <Route element={<PrivateRoute rolesPermitidos={["Administrador"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/gestion_empresarial" element={<GestionEmpresarial />} />
            <Route path="/kpi" element={<KPI />} />
            <Route path="/capacitacion" element={<Capacitacion />} />
            <Route path="/reporte" element={<Reporte />} />
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>
        </Route>

        {/* =========================================
            EMPLEADO (rutas compartidas)
        ========================================= */}
        <Route element={<PrivateRoute rolesPermitidos={["Produccion", "Almacenero", "Vendedor", "Cajero"]} />}>
          <Route element={<AppLayoutEmpleado />}>
            <Route path="/empleado" element={<EmpleadoHome />} />
            <Route path="/empleado/perfil" element={<EmpleadoPerfil />} />
            <Route path="/empleado/capacitaciones" element={<EmpleadoCapacitaciones />} />
            <Route path="/empleado/capacitaciones/historial" element={<EmpleadoHistorial />} />
            <Route path="/empleado/desempeno" element={<EmpleadoDesempeno />} />
            <Route path="/empleado/objetivos" element={<EmpleadoObjetivos />} />
            <Route path="/empleado/reportes" element={<EmpleadoReportes />} />
            <Route path="/empleado/constancias" element={<EmpleadoConstancias />} />
          </Route>
        </Route>

        {/* =========================================
            CAJERO
        ========================================= */}
        <Route element={<PrivateRoute rolesPermitidos={["Cajero"]} />}>
          <Route path="/cajero" element={<CajeroHome />} />
        </Route>

        {/* =========================================
            ALMACENERO
        ========================================= */}
        <Route element={<PrivateRoute rolesPermitidos={["Almacenero"]} />}>
          <Route path="/almacenero" element={<AlmaceneroHome />} />
        </Route>

        {/* =========================================
            PRODUCCION
        ========================================= */}
        <Route element={<PrivateRoute rolesPermitidos={["Produccion"]} />}>
          <Route path="/produccion" element={<ProduccionHome />} />
        </Route>

        {/* =========================================
            VENDEDOR
        ========================================= */}
        <Route element={<PrivateRoute rolesPermitidos={["Vendedor"]} />}>
          <Route path="/vendedor" element={<VendedorHome />} />
        </Route>

        {/* =========================================
            NOT FOUND
        ========================================= */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}