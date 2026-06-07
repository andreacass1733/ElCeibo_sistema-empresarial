const entradas = [
  { id: "ENT-001", producto: "Cacao en Grano",   cantidad: 100, unidad: "kg",  proveedor: "Agro Bolivia", fecha: "2025-06-01", recibio: "Verónica Lazo" },
  { id: "ENT-002", producto: "Azúcar Blanca",    cantidad: 80,  unidad: "kg",  proveedor: "Ingenio Sur",  fecha: "2025-06-02", recibio: "César Poma" },
  { id: "ENT-003", producto: "Leche en Polvo",   cantidad: 30,  unidad: "kg",  proveedor: "Lácteos del Norte", fecha: "2025-06-03", recibio: "Verónica Lazo" },
  { id: "ENT-004", producto: "Cajas de Regalo",  cantidad: 200, unidad: "und", proveedor: "Empaques SA",  fecha: "2025-06-04", recibio: "César Poma" },
  { id: "ENT-005", producto: "Manteca de Cacao", cantidad: 25,  unidad: "kg",  proveedor: "Agro Bolivia", fecha: "2025-06-05", recibio: "Verónica Lazo" },
];

export default function AlmaceneroEntradas() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Entradas de Almacén</h1>
        <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Registro de ingresos de materiales</p>
      </div>

      <div className="mb-6 grid grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          { label: "Entradas este mes", value: entradas.length },
          { label: "Proveedores",       value: [...new Set(entradas.map((e) => e.proveedor))].length },
          { label: "Productos recibidos",value: [...new Set(entradas.map((e) => e.producto))].length },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{k.label}</p>
            <h2 className="mt-2 text-2xl font-bold text-amber-600 dark:text-[#e8b87a]">{k.value}</h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <div className="space-y-3">
          {entradas.map((e) => (
            <div key={e.id} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-amber-600 dark:text-[#e8b87a]">{e.id}</span>
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400">ENTRADA</span>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-[#f5deb3]">{e.producto}</p>
                  <p className="text-xs text-gray-400 dark:text-[#7a5a3a] mt-0.5">
                    Proveedor: {e.proveedor} · Recibió: {e.recibio} · {e.fecha}
                  </p>
                </div>
                <p className="text-lg font-bold text-emerald-500">+{e.cantidad} {e.unidad}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}