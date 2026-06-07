// ProduccionOrdenes.tsx
// Sin tabla en BD → mock tipado, listo para reemplazar con fetch
import { useEffect, useState } from "react";

interface Orden {
  id: string;
  producto: string;
  cantidad: number;
  solicitante: string;
  fecha: string;
  entrega: string;
  prioridad: "ALTA" | "MEDIA" | "BAJA";
  estado: "EN_PROCESO" | "COMPLETADA" | "PENDIENTE";
}

const MOCK_ORDENES: Orden[] = [
  { id: "ORD-010", producto: "Chocolate 70% Barra",  cantidad: 500, solicitante: "Ventas",      fecha: "2025-06-01", entrega: "2025-06-07", prioridad: "ALTA",  estado: "EN_PROCESO" },
  { id: "ORD-011", producto: "Bombones Premium",      cantidad: 100, solicitante: "Ventas",      fecha: "2025-06-02", entrega: "2025-06-08", prioridad: "MEDIA", estado: "PENDIENTE"  },
  { id: "ORD-012", producto: "Chocolate con Leche",   cantidad: 300, solicitante: "Exportación", fecha: "2025-06-01", entrega: "2025-06-06", prioridad: "ALTA",  estado: "COMPLETADA" },
  { id: "ORD-013", producto: "Cobertura Oscura 5kg",  cantidad: 50,  solicitante: "Ventas",      fecha: "2025-06-03", entrega: "2025-06-09", prioridad: "BAJA",  estado: "PENDIENTE"  },
];

const prioridadStyle: Record<string, string> = {
  ALTA:  "bg-red-950 text-red-400",
  MEDIA: "bg-amber-950 text-amber-400",
  BAJA:  "bg-gray-800 text-gray-300",
};

const estadoStyle: Record<string, string> = {
  EN_PROCESO: "bg-blue-950 text-blue-400",
  COMPLETADA: "bg-emerald-950 text-emerald-400",
  PENDIENTE:  "bg-amber-950 text-amber-300",
};

export default function ProduccionOrdenes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: reemplazar por fetch cuando exista la tabla OrdenProduccion
    // const idEmpleado = localStorage.getItem("id_empleado");
    // fetch(`http://localhost:8000/api/ordenes-produccion/${idEmpleado}/`)
    //   .then(r => r.json()).then(setOrdenes);
    setOrdenes(MOCK_ORDENES);
    setLoading(false);
  }, []);

  if (loading) return <div className="p-6 text-amber-600 dark:text-[#e8b87a]">Cargando...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Órdenes de Producción</h1>
        <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Órdenes asignadas a mi área</p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <div className="space-y-3">
          {ordenes.map((o) => (
            <div key={o.id} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-amber-600 dark:text-[#e8b87a]">{o.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prioridadStyle[o.prioridad]}`}>
                      Prioridad {o.prioridad}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoStyle[o.estado]}`}>
                      {o.estado.replace("_", " ")}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-[#f5deb3]">{o.producto}</p>
                  <p className="text-xs text-gray-400 dark:text-[#7a5a3a] mt-0.5">
                    Solicitante: {o.solicitante} · Entrega: {o.entrega}
                  </p>
                </div>
                <p className="text-lg font-bold text-amber-600 dark:text-[#e8b87a]">{o.cantidad} und</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}