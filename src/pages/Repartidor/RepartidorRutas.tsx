// ── RepartidorRutas.tsx ──────────────────────────────────────────────────────

const rutas = [
  { id: "RUT-001", nombre: "Zona Sur",      paradas: 5, km: 18, hora: "08:00", estado: "EN_RUTA",    vehiculo: "Toyota Hilux ABC-123" },
  { id: "RUT-002", nombre: "Zona Centro",   paradas: 4, km: 12, hora: "11:00", estado: "PENDIENTE",  vehiculo: "Toyota Hilux ABC-123" },
  { id: "RUT-003", nombre: "Zona Norte",    paradas: 3, km: 22, hora: "14:00", estado: "PENDIENTE",  vehiculo: "Toyota Hilux ABC-123" },
  { id: "RUT-004", nombre: "Zona Este",     paradas: 6, km: 25, hora: "08:00", estado: "COMPLETADA", vehiculo: "Moto DEF-456" },
];

const estadoStyle: Record<string, string> = {
  EN_RUTA:   "bg-blue-950 text-blue-400",
  PENDIENTE: "bg-amber-950 text-amber-400",
  COMPLETADA:"bg-emerald-950 text-emerald-400",
};

export function RepartidorRutas() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Mis Rutas</h1>
        <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Rutas de reparto asignadas</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "En ruta",    value: rutas.filter((r) => r.estado === "EN_RUTA").length },
          { label: "Pendientes", value: rutas.filter((r) => r.estado === "PENDIENTE").length },
          { label: "Completadas",value: rutas.filter((r) => r.estado === "COMPLETADA").length },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{k.label}</p>
            <h2 className="mt-2 text-2xl font-bold text-amber-600 dark:text-[#e8b87a]">{k.value}</h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <div className="space-y-3">
          {rutas.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-amber-600 dark:text-[#e8b87a]">{r.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoStyle[r.estado]}`}>{r.estado.replace("_", " ")}</span>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-[#f5deb3]">{r.nombre}</p>
                  <p className="text-xs text-gray-400 dark:text-[#7a5a3a] mt-0.5">
                    {r.paradas} paradas · {r.km} km · Salida: {r.hora}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-[#7a5a3a]">{r.vehiculo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RepartidorRutas;