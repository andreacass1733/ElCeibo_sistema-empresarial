import { useState } from "react";

const cobros = [
  { id: "CB-001", cliente: "Hotel Europa",        monto: 680, metodo: "Transferencia", fecha: "2025-06-05", estado: "COBRADO" },
  { id: "CB-002", cliente: "Tienda Dulce Vida",   monto: 420, metodo: "Efectivo",      fecha: "2025-06-05", estado: "COBRADO" },
  { id: "CB-003", cliente: "Supermercado Central",monto: 850, metodo: "QR",            fecha: "2025-06-04", estado: "PENDIENTE" },
  { id: "CB-004", cliente: "Cafetería Aromas",    monto: 510, metodo: "Efectivo",      fecha: "2025-06-03", estado: "PENDIENTE" },
  { id: "CB-005", cliente: "Repostería La Paz",   monto: 390, metodo: "Tarjeta",       fecha: "2025-06-02", estado: "COBRADO" },
];

const estadoStyle: Record<string, string> = {
  COBRADO:  "bg-emerald-950 text-emerald-400",
  PENDIENTE:"bg-amber-950 text-amber-400",
};

const metodoStyle: Record<string, string> = {
  Efectivo:      "bg-gray-800 text-gray-300",
  Transferencia: "bg-blue-950 text-blue-400",
  QR:            "bg-purple-950 text-purple-400",
  Tarjeta:       "bg-indigo-950 text-indigo-400",
};

export default function CajeroCobros() {
  const pendientes = cobros.filter((c) => c.estado === "PENDIENTE").reduce((a, c) => a + c.monto, 0);
  const cobrado    = cobros.filter((c) => c.estado === "COBRADO").reduce((a, c) => a + c.monto, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Cobros</h1>
        <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Registro de cobros realizados</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Por cobrar (Bs)", value: pendientes.toLocaleString(), color: "text-amber-500" },
          { label: "Cobrado (Bs)",    value: cobrado.toLocaleString(),    color: "text-emerald-500" },
          { label: "Total registros", value: cobros.length,               color: "text-amber-600 dark:text-[#e8b87a]" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{k.label}</p>
            <h2 className={`mt-2 text-2xl font-bold ${k.color}`}>{k.value}</h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <div className="space-y-3">
          {cobros.map((c) => (
            <div key={c.id} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-amber-600 dark:text-[#e8b87a]">{c.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoStyle[c.estado]}`}>{c.estado}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${metodoStyle[c.metodo]}`}>{c.metodo}</span>
                  </div>
                  <p className="font-medium text-gray-800 dark:text-[#f5deb3]">{c.cliente}</p>
                  <p className="text-xs text-gray-400 dark:text-[#7a5a3a] mt-0.5">{c.fecha}</p>
                </div>
                <p className="text-xl font-bold text-amber-600 dark:text-[#e8b87a]">Bs {c.monto.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}