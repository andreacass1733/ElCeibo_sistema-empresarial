const salidas = [
  { id: "SAL-001", producto: "Cacao en Grano",   cantidad: 50,  unidad: "kg",  destino: "Producción",  motivo: "Orden ORD-012", fecha: "2025-06-01", entrego: "Verónica Lazo" },
  { id: "SAL-002", producto: "Azúcar Blanca",    cantidad: 30,  unidad: "kg",  destino: "Producción",  motivo: "Orden ORD-012", fecha: "2025-06-01", entrego: "César Poma" },
  { id: "SAL-003", producto: "Chocolate 70%",    cantidad: 50,  unidad: "und", destino: "Ventas",      motivo: "Pedido V-001",  fecha: "2025-06-02", entrego: "Verónica Lazo" },
  { id: "SAL-004", producto: "Bombones Premium", cantidad: 20,  unidad: "caj", destino: "Ventas",      motivo: "Pedido V-002",  fecha: "2025-06-03", entrego: "César Poma" },
  { id: "SAL-005", producto: "Leche en Polvo",   cantidad: 20,  unidad: "kg",  destino: "Producción",  motivo: "Orden ORD-013", fecha: "2025-06-04", entrego: "Verónica Lazo" },
];

const destinoStyle: Record<string, string> = {
  Producción: "bg-blue-950 text-blue-400",
  Ventas:     "bg-amber-950 text-amber-400",
};

export default function AlmaceneroSalidas() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Salidas de Almacén</h1>
        <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Registro de salidas de materiales y productos</p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <div className="space-y-3">
          {salidas.map((s) => (
            <div key={s.id} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-amber-600 dark:text-[#e8b87a]">{s.id}</span>
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-950 text-red-400">SALIDA</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${destinoStyle[s.destino]}`}>{s.destino}</span>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-[#f5deb3]">{s.producto}</p>
                  <p className="text-xs text-gray-400 dark:text-[#7a5a3a] mt-0.5">
                    Motivo: {s.motivo} · Entregó: {s.entrego} · {s.fecha}
                  </p>
                </div>
                <p className="text-lg font-bold text-red-400">-{s.cantidad} {s.unidad}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}