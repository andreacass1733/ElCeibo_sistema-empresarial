// ── OperarioTareas.tsx ───────────────────────────────────────────────────────
import { useState } from "react";

const tareas = [
  { id: "TAR-001", titulo: "Limpieza de maquinaria templadora", area: "Producción", prioridad: "ALTA",  vence: "2025-06-05", estado: "EN_PROCESO" },
  { id: "TAR-002", titulo: "Mantenimiento preventivo mezcladora", area: "Mantenimiento", prioridad: "MEDIA", vence: "2025-06-07", estado: "PENDIENTE" },
  { id: "TAR-003", titulo: "Embolsado línea chocolate negro",   area: "Empaque",    prioridad: "ALTA",  vence: "2025-06-05", estado: "COMPLETADA" },
  { id: "TAR-004", titulo: "Revisión temperatura refrigeración",area: "Calidad",    prioridad: "BAJA",  vence: "2025-06-08", estado: "PENDIENTE" },
  { id: "TAR-005", titulo: "Etiquetado lote LOT-001",          area: "Empaque",    prioridad: "MEDIA", vence: "2025-06-06", estado: "EN_PROCESO" },
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

export function OperarioTareas() {
  const [filtro, setFiltro] = useState("TODAS");
  const estados = ["TODAS", "PENDIENTE", "EN_PROCESO", "COMPLETADA"];

  const filtradas = filtro === "TODAS" ? tareas : tareas.filter((t) => t.estado === filtro);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Mis Tareas</h1>
        <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Tareas asignadas a tu puesto</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: "Pendientes",  value: tareas.filter((t) => t.estado === "PENDIENTE").length },
          { label: "En proceso",  value: tareas.filter((t) => t.estado === "EN_PROCESO").length },
          { label: "Completadas", value: tareas.filter((t) => t.estado === "COMPLETADA").length },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{k.label}</p>
            <h2 className="mt-2 text-2xl font-bold text-amber-600 dark:text-[#e8b87a]">{k.value}</h2>
          </div>
        ))}
      </div>

      <div className="mb-3 flex gap-2 flex-wrap">
        {estados.map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors
              ${filtro === e
                ? "bg-amber-600 text-white dark:bg-[#4B2E1E] dark:text-[#f5c16c]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1e1408] dark:text-[#9a7a5a]"
              }`}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <div className="space-y-3">
          {filtradas.map((t) => (
            <div key={t.id} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-amber-600 dark:text-[#e8b87a]">{t.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prioridadStyle[t.prioridad]}`}>{t.prioridad}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoStyle[t.estado]}`}>{t.estado.replace("_"," ")}</span>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-[#f5deb3]">{t.titulo}</p>
                  <p className="text-xs text-gray-400 dark:text-[#7a5a3a] mt-0.5">Área: {t.area} · Vence: {t.vence}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OperarioTareas;