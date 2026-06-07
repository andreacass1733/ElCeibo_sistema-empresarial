const entregas = [
  { id: "ENT-001", cliente: "Supermercado Central", direccion: "Av. 6 de Agosto 1200", productos: 3, hora: "08:30", estado: "ENTREGADO",  firma: true },
  { id: "ENT-002", cliente: "Tienda Dulce Vida",    direccion: "C. Loayza 450",         productos: 1, hora: "09:15", estado: "ENTREGADO",  firma: true },
  { id: "ENT-003", cliente: "Hotel Europa",          direccion: "Av. Arce 2799",         productos: 2, hora: "10:00", estado: "EN_CAMINO",  firma: false },
  { id: "ENT-004", cliente: "Cafetería Aromas",      direccion: "C. Sagárnaga 300",      productos: 1, hora: "11:30", estado: "PENDIENTE",  firma: false },
  { id: "ENT-005", cliente: "Repostería La Paz",     direccion: "Av. Buenos Aires 890",  productos: 4, hora: "13:00", estado: "PENDIENTE",  firma: false },
];

const estadoStyle: Record<string, string> = {
  ENTREGADO: "bg-emerald-950 text-emerald-400",
  EN_CAMINO: "bg-blue-950 text-blue-400",
  PENDIENTE: "bg-amber-950 text-amber-400",
};

export default function RepartidorEntregas() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Mis Entregas</h1>
        <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Seguimiento de entregas del día</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Entregados", value: entregas.filter((e) => e.estado === "ENTREGADO").length },
          { label: "En camino",  value: entregas.filter((e) => e.estado === "EN_CAMINO").length },
          { label: "Pendientes", value: entregas.filter((e) => e.estado === "PENDIENTE").length },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{k.label}</p>
            <h2 className="mt-2 text-2xl font-bold text-amber-600 dark:text-[#e8b87a]">{k.value}</h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <div className="space-y-3">
          {entregas.map((e) => (
            <div key={e.id} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-amber-600 dark:text-[#e8b87a]">{e.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoStyle[e.estado]}`}>{e.estado.replace("_", " ")}</span>
                    {e.firma && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-300">✓ Firmado</span>}
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-[#f5deb3]">{e.cliente}</p>
                  <p className="text-xs text-gray-400 dark:text-[#7a5a3a] mt-0.5">{e.direccion}</p>
                  <p className="text-xs text-gray-400 dark:text-[#7a5a3a]">{e.productos} producto(s) · Hora: {e.hora}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}