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