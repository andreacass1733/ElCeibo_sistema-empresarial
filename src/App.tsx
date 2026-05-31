import { BrowserRouter as Router, Routes, Route } from "react-router";

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

export default function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>

        {/* =========================================
            ADMINISTRADOR
        ========================================= */}
        <Route element={<AppLayout />}>

          <Route index path="/" element={<Home />} />
          <Route
            path="/gestion_empresarial"
            element={<GestionEmpresarial />}
          />
          <Route path="/kpi" element={<KPI />} />
          <Route
            path="/capacitacion"
            element={<Capacitacion />}
          />
          <Route path="/reporte" element={<Reporte />} />
          <Route path="/usuarios" element={<Usuarios />} />
        </Route>

        {/* =========================================
            EMPLEADO
        ========================================= */}

        <Route element={<AppLayoutEmpleado />}>
          <Route
            path="/empleado"
            element={<EmpleadoHome />}
          />
          <Route
            path="/empleado/perfil"
            element={<EmpleadoPerfil />}
          />
          <Route
            path="/empleado/capacitaciones"
            element={<EmpleadoCapacitaciones />}
          />
          <Route
            path="/empleado/capacitaciones/historial"
            element={<EmpleadoHistorial />}
          />
          <Route
            path="/empleado/desempeno"
            element={<EmpleadoDesempeno />}
          />
          <Route
            path="/empleado/objetivos"
            element={<EmpleadoObjetivos />}
          />
          <Route
            path="/empleado/reportes"
            element={<EmpleadoReportes />}
          />
          <Route
            path="/empleado/constancias"
            element={<EmpleadoConstancias />}
          />
        </Route>

        {/* =========================================
            AUTH
        ========================================= */}

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* =========================================
            NOT FOUND
        ========================================= */}

        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}