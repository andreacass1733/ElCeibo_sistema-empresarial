const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export type Categoria = "ventas" | "produccion" | "empleados" | "inventario" | "compras";
export type Estado = "listo" | "pendiente" | "error";

export type ReporteAPI = {
  id: number;
  nombre: string;
  cat: Categoria;
  fecha: string;
  estado: Estado;
  detalle: {
    stats: { n: string; l: string }[];
    section: string;
    headers: string[];
    rows: string[][];
  };
};

export async function getReportes(): Promise<ReporteAPI[]> {
  const res = await fetch(`${BASE_URL}/reportes/`);
  if (!res.ok) throw new Error(`Error ${res.status}: no se pudo cargar los reportes`);
  return res.json();
}
