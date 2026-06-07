import { useState } from "react";

export default function CajeroCaja() {
  const [abierta] = useState(true);

  const resumen = [
    { label: "Saldo Inicial",    value: "Bs 500.00" },
    { label: "Total Ingresos",   value: "Bs 3,240.00" },
    { label: "Total Egresos",    value: "Bs 120.00" },
    { label: "Saldo Actual",     value: "Bs 3,620.00" },
  ];

  const movimientos = [
    { hora: "08:15", desc: "Apertura de caja",          tipo: "APERTURA", monto: 500 },
    { hora: "08:42", desc: "Venta - Chocolate 70%",     tipo: "INGRESO",  monto: 85  },
    { hora: "09:10", desc: "Venta - Bombones x10",      tipo: "INGRESO",  monto: 210 },
    { hora: "10:05", desc: "Venta - Caja Regalo",       tipo: "INGRESO",  monto: 340 },
    { hora: "10:30", desc: "Pago servicio mensajería",  tipo: "EGRESO",   monto: -60 },
    { hora: "11:20", desc: "Venta - Cobertura 5kg",     tipo: "INGRESO",  monto: 390 },
    { hora: "12:00", desc: "Gastos limpieza",           tipo: "EGRESO",   monto: -60 },
  ];

  const tipoStyle: Record<string, string> = {
    APERTURA: "bg-blue-950 text-blue-400",
    INGRESO:  "bg-emerald-950 text-emerald-400",
    EGRESO:   "bg-red-950 text-red-400",
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Mi Caja</h1>
          <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Estado al {new Date().toLocaleDateString("es-BO")}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${abierta ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"}`}>
          {abierta ? "● Caja Abierta" : "● Caja Cerrada"}
        </span>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {resumen.map((r) => (
          <div key={r.label} className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{r.label}</p>
            <h2 className="mt-2 text-xl font-bold text-amber-600 dark:text-[#e8b87a]">{r.value}</h2>
          </div>
        ))}
      </div>

      {/* Movimientos del día */}
      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <h2 className="mb-4 font-semibold text-gray-700 dark:text-[#f5deb3]">Movimientos de hoy</h2>
        <div className="space-y-3">
          {movimientos.map((m, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-[#2e2119] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 dark:text-[#7a5a3a] font-mono">{m.hora}</span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${tipoStyle[m.tipo]}`}>
                  {m.tipo}
                </span>
                <span className="text-sm text-gray-700 dark:text-[#f5deb3]">{m.desc}</span>
              </div>
              <span className={`font-bold text-sm ${m.monto < 0 ? "text-red-400" : "text-emerald-400"}`}>
                {m.monto < 0 ? "-" : "+"}Bs {Math.abs(m.monto)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}