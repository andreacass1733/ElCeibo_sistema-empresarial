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
   VENDEDOR
========================= */
import VendedorVentas from "./pages/Vendedor/VendedorVentas";
import VendedorClientes from "./pages/Vendedor/VendedorClientes";
import VendedorCotizaciones from "./pages/Vendedor/VendedorCotizaciones";

/* =========================
   CAJERO
========================= */
import CajeroCaja from "./pages/Cajero/CajeroCaja";
import CajeroCobros from "./pages/Cajero/CajeroCobros";
import CajeroTransacciones from "./pages/Cajero/CajeroTransacciones";

/* =========================
   ALMACENERO
========================= */
import AlmaceneroInventario from "./pages/Almacenero/AlmaceneroInventario";
import AlmaceneroStock from "./pages/Almacenero/AlmaceneroStock";
import AlmaceneroEntradas from "./pages/Almacenero/AlmaceneroEntradas";
import AlmaceneroSalidas from "./pages/Almacenero/AlmaceneroSalida";

/* =========================
   PRODUCCION
========================= */
import ProduccionProduccion from "./pages/Produccion/ProduccionProduccion";
import ProduccionOrdenes from "./pages/Produccion/ProduccionOrdenes";
import ProduccionControl from "./pages/Produccion/ProduccionControl";

/* =========================
   REPARTIDOR
========================= */
import RepartidorRutas from "./pages/Repartidor/RepartidorRutas";
import RepartidorEntregas from "./pages/Repartidor/RepartidorEntregas";

/* =========================
   OPERARIO
========================= */
import OperarioTareas from "./pages/Operario/OperarioTareas";
import OperarioActividades from "./pages/Operario/OperarioActividades";

/* =========================
   SUPERVISOR
========================= */
import SupervisorPersonal from "./pages/Supervisor/SupervisorPersonal";
import SupervisorEvaluaciones from "./pages/Supervisor/SupervisorEvaluaciones";
import SupervisorIncidencias from "./pages/Supervisor/SupervisorIncidencias";

/* =========================
   TODOS LOS ROLES DE EMPLEADO
========================= */
const ROLES_EMPLEADO = [
  "Produccion",
  "Almacenero",
  "Vendedor",
  "Cajero",
  "Repartidor",
  "Operario",
  "Supervisor",
];

/* =========================
   GUARD DE RUTAS
========================= */
function PrivateRoute({ rolesPermitidos }: { rolesPermitidos: string[] }) {
  const rol = localStorage.getItem("rol");
  if (!rol) return <Navigate to="/signin" replace />;
  if (!rolesPermitidos.includes(rol)) return <Navigate to="/signin" replace />;
  return <Outlet />;
}

/* =========================
   REDIRECT EMPLEADO
   Lee el id guardado en localStorage y redirige a /empleado/:id
========================= */
function EmpleadoRedirect() {
  const id = localStorage.getItem("id_empleado");
  if (!id) return <Navigate to="/signin" replace />;
  return <Navigate to={`/empleado/${id}`} replace />;
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
            TODOS LOS EMPLEADOS
        ========================================= */}
        <Route element={<PrivateRoute rolesPermitidos={ROLES_EMPLEADO} />}>
          <Route element={<AppLayoutEmpleado />}>

            {/* Redirect /empleado → /empleado/:id */}
            <Route path="/empleado" element={<EmpleadoRedirect />} />

            {/* ── COMUNES A TODOS ── */}
            <Route path="/empleado/:id"                          element={<EmpleadoHome />} />
            <Route path="/empleado/:id/perfil"                   element={<EmpleadoPerfil />} />
            <Route path="/empleado/:id/capacitaciones"           element={<EmpleadoCapacitaciones />} />
            <Route path="/empleado/:id/capacitaciones/historial" element={<EmpleadoHistorial />} />
            <Route path="/empleado/:id/desempeno"                element={<EmpleadoDesempeno />} />
            <Route path="/empleado/:id/objetivos"                element={<EmpleadoObjetivos />} />
            <Route path="/empleado/:id/reportes"                 element={<EmpleadoReportes />} />
            <Route path="/empleado/:id/constancias"              element={<EmpleadoConstancias />} />

            {/* ── VENDEDOR ── */}
            <Route element={<PrivateRoute rolesPermitidos={["Vendedor"]} />}>
              <Route path="/empleado/:id/ventas"       element={<VendedorVentas />} />
              <Route path="/empleado/:id/clientes"     element={<VendedorClientes />} />
              <Route path="/empleado/:id/cotizaciones" element={<VendedorCotizaciones />} />
            </Route>

            {/* ── CAJERO ── */}
            <Route element={<PrivateRoute rolesPermitidos={["Cajero"]} />}>
              <Route path="/empleado/:id/caja"         element={<CajeroCaja />} />
              <Route path="/empleado/:id/cobros"       element={<CajeroCobros />} />
              <Route path="/empleado/:id/transacciones" element={<CajeroTransacciones />} />
            </Route>

            {/* ── ALMACENERO ── */}
            <Route element={<PrivateRoute rolesPermitidos={["Almacenero"]} />}>
              <Route path="/empleado/:id/inventario" element={<AlmaceneroInventario />} />
              <Route path="/empleado/:id/stock"      element={<AlmaceneroStock />} />
              <Route path="/empleado/:id/entradas"   element={<AlmaceneroEntradas />} />
              <Route path="/empleado/:id/salidas"    element={<AlmaceneroSalidas />} />
            </Route>

            {/* ── PRODUCCION ── */}
            <Route element={<PrivateRoute rolesPermitidos={["Produccion"]} />}>
              <Route path="/empleado/:id/produccion" element={<ProduccionProduccion />} />
              <Route path="/empleado/:id/ordenes"    element={<ProduccionOrdenes />} />
              <Route path="/empleado/:id/control"    element={<ProduccionControl />} />
            </Route>

            {/* ── REPARTIDOR ── */}
            <Route element={<PrivateRoute rolesPermitidos={["Repartidor"]} />}>
              <Route path="/empleado/:id/rutas"    element={<RepartidorRutas />} />
              <Route path="/empleado/:id/entregas" element={<RepartidorEntregas />} />
            </Route>

            {/* ── OPERARIO ── */}
            <Route element={<PrivateRoute rolesPermitidos={["Operario"]} />}>
              <Route path="/empleado/:id/tareas"      element={<OperarioTareas />} />
              <Route path="/empleado/:id/actividades" element={<OperarioActividades />} />
            </Route>

            {/* ── SUPERVISOR ── */}
            <Route element={<PrivateRoute rolesPermitidos={["Supervisor"]} />}>
              <Route path="/empleado/:id/personal"     element={<SupervisorPersonal />} />
              <Route path="/empleado/:id/evaluaciones" element={<SupervisorEvaluaciones />} />
              <Route path="/empleado/:id/incidencias"  element={<SupervisorIncidencias />} />
            </Route>

          </Route>
        </Route>

        {/* =========================================
            NOT FOUND
        ========================================= */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}