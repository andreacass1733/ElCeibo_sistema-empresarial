const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export type EstadoEmpleado = "INSCRITO" | "COMPLETADO" | "ABANDONADO";

export type EmpleadoAPI = {
  id: number;
  nombre: string;
  cargo: string;
  estado: EstadoEmpleado;
  calificacion: number | null;
  fecha_asistencia: string;
};

export type CapacitacionAPI = {
  id_capacitacion: number;
  nombre: string;
  descripcion: string;
  instructor: string;
  fecha_inicio: string;
  fecha_fin: string;
  costo: number;
  empleados: EmpleadoAPI[];
};

export async function getCapacitaciones(): Promise<CapacitacionAPI[]> {
  const res = await fetch(`${BASE_URL}/capacitaciones/`);
  if (!res.ok) throw new Error("Error al cargar capacitaciones");
  return res.json();
}