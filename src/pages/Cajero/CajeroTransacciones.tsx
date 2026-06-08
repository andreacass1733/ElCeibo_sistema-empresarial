const transacciones = [
  { id: "TXN-001", tipo: "VENTA",     desc: "Chocolate 70% x50",     monto: 850,  metodo: "QR",            fecha: "2025-06-05 08:42" },
  { id: "TXN-002", tipo: "VENTA",     desc: "Bombones Premium x20",   monto: 420,  metodo: "Efectivo",      fecha: "2025-06-05 09:10" },
  { id: "TXN-003", tipo: "DEVOLUCION",desc: "Devolución parcial",     monto: -85,  metodo: "Efectivo",      fecha: "2025-06-05 09:45" },
  { id: "TXN-004", tipo: "VENTA",     desc: "Caja Regalo x10",        monto: 680,  metodo: "Transferencia", fecha: "2025-06-05 10:20" },
  { id: "TXN-005", tipo: "VENTA",     desc: "Cobertura Oscura 5kg",   monto: 390,  metodo: "Tarjeta",       fecha: "2025-06-05 11:05" },
  { id: "TXN-006", tipo: "EGRESO",    desc: "Pago mensajería",        monto: -60,  metodo: "Efectivo",      fecha: "2025-06-05 12:00" },
  { id: "TXN-007", tipo: "VENTA",     desc: "Chocolate con Leche x30",monto: 510,  metodo: "QR",            fecha: "2025-06-05 14:30" },
];

const tipoStyle: Record<string, string> = {
  VENTA:      "bg-emerald-950 text-emerald-400",
  DEVOLUCION: "bg-red-950 text-red-400",
  EGRESO:     "bg-amber-950 text-amber-400",
};

export default function CajeroTransacciones() {
  const totalVentas = transacciones.filter((t) => t.tipo === "VENTA").reduce((a, t) => a + t.monto, 0);
  const totalEgresos = transacciones.filter((t) => t.monto < 0).reduce((a, t) => a + t.monto, 0);
  const neto = totalVentas + totalEgresos;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Transacciones</h1>
        <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Registro completo del día</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Ventas brutas (Bs)", value: totalVentas.toLocaleString(),        color: "text-emerald-500" },
          { label: "Egresos/Dev. (Bs)",  value: Math.abs(totalEgresos).toLocaleString(), color: "text-red-400" },
          { label: "Neto (Bs)",          value: neto.toLocaleString(),               color: "text-amber-600 dark:text-[#e8b87a]" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{k.label}</p>
            <h2 className={`mt-2 text-2xl font-bold ${k.color}`}>{k.value}</h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2e2119]">
                {["ID", "Tipo", "Descripción", "Método", "Monto (Bs)", "Fecha/Hora"].map((h) => (
                  <th key={h} className="pb-3 text-left font-medium text-gray-400 dark:text-[#9a7a5a]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transacciones.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 dark:border-[#1e1408] last:border-0 hover:bg-amber-50/30 dark:hover:bg-[#1e1408] transition-colors">
                  <td className="py-3 font-mono text-xs text-amber-600 dark:text-[#e8b87a]">{t.id}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipoStyle[t.tipo]}`}>{t.tipo}</span>
                  </td>
                  <td className="py-3 text-gray-700 dark:text-[#f5deb3]">{t.desc}</td>
                  <td className="py-3 text-gray-500 dark:text-[#9a7a5a]">{t.metodo}</td>
                  <td className={`py-3 font-bold ${t.monto < 0 ? "text-red-400" : "text-emerald-500"}`}>
                    {t.monto < 0 ? "-" : "+"}Bs {Math.abs(t.monto).toLocaleString()}
                  </td>
                  <td className="py-3 text-gray-400 dark:text-[#7a5a3a] text-xs">{t.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}