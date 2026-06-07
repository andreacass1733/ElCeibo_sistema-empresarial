const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export type EstadoObj = "COMPLETADO" | "EN_PROGRESO" | "PENDIENTE" | "EN_RIESGO";

export type ObjetivoAPI = {
  id_objetivo: number;
  titulo: string;
  descripcion: string;
  area: string;
  estado: EstadoObj;
  progreso: number;
  responsable: string;
  fecha_limite: string;
};

export type AlertaAPI = {
  id_alerta: number;
  tipo: "warning" | "info" | "danger";
  mensaje: string;
  area: string;
};

export type MetricaAPI = {
  id_metrica: number;
  label: string;
  valor: string;
  sub: string;
  pct: number | null;
  color: string;
  text_color: string;
};

export async function getObjetivos(): Promise<ObjetivoAPI[]> {
  const res = await fetch(`${BASE_URL}/objetivos/`);
  if (!res.ok) throw new Error("Error al cargar objetivos");
  return res.json();
}

export async function getAlertas(): Promise<AlertaAPI[]> {
  const res = await fetch(`${BASE_URL}/alertas/`);
  if (!res.ok) throw new Error("Error al cargar alertas");
  return res.json();
}

export async function getMetricas(): Promise<MetricaAPI[]> {
  const res = await fetch(`${BASE_URL}/metricas/`);
  if (!res.ok) throw new Error("Error al cargar métricas");
  return res.json();
}

export type KpiMetaAPI = {
  nombre: string;
  meta: number;
};

export async function getKpiMeta(): Promise<KpiMetaAPI[]> {
  const res = await fetch(`${BASE_URL}/dashboard/kpi-meta/`);
  if (!res.ok) throw new Error("Error al cargar metas KPI");
  return res.json();
}

export type DashboardKpisResponse = {
  ingresos: number;
  costos: number;
  utilidad: number;
  margen_bruto: number;
  ventas_registradas: number;
  ticket_promedio: number;
  producto_top: string;
  sucursal_top: string;
  produccion: number;
  ordenes_produccion: number;
  producto_produccion_top: string;
  empleados_produccion: number;
  promedio_diario: number;
  stock: number;
  productos_stock: number;
  stock_critico: number;
  sucursales_abastecidas: number;
  ultimo_reabastecimiento: string;
  compras: number;
  gasto_compras: number;
  materia_top: string;
  proveedor_top: string;
  proveedores_activos: number;
  capacitaciones: number;
  capacitaciones_activas: number;
  empleados_inscritos: number;
  empleados_completaron: number;
  calificacion_promedio: number;
  empleados: number;
  ventas_por_empleado: number;
  empleado_destaque: string;
  ausentismo: number | null;
  ventas_mensuales: Array<{ mes: string; valor: number }>;
};

export async function getDashboardKpis(): Promise<DashboardKpisResponse> {
  const res = await fetch(`${BASE_URL}/dashboard/kpis/`);
  if (!res.ok) throw new Error("Error al cargar KPIs del dashboard");
  return res.json();
}

export type UltimaVenta = {
  id: string;
  cliente: string;
  sucursal: string;
  fecha: string;
  monto: number;
  estado: string;
};

export async function getUltimasVentas(): Promise<UltimaVenta[]> {
  const res = await fetch(`${BASE_URL}/dashboard/ultimas-ventas/`);
  if (!res.ok) throw new Error("Error al cargar últimas ventas");
  return res.json();
}

export type ProduccionReciente = {
  id: number;
  producto: string;
  cantidad: number;
  empleado: string;
  fecha: string;
};

export async function getProduccionReciente(): Promise<ProduccionReciente[]> {
  const res = await fetch(`${BASE_URL}/dashboard/produccion-reciente/`);
  if (!res.ok) throw new Error("Error al cargar producción reciente");
  return res.json();
}

export async function getSucursales(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/dashboard/sucursales/`);
  if (!res.ok) throw new Error("Error al cargar sucursales");
  return res.json();
}

export async function getClientesActivos(): Promise<{ clientes_activos: number }> {
  const res = await fetch(`${BASE_URL}/dashboard/clientes-activos/`);
  if (!res.ok) throw new Error("Error al cargar clientes activos");
  return res.json();
}