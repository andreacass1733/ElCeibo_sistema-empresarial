"use client";

import { useState } from "react";

// ─── Datos del empleado logueado ──────────────────────────
const empleado = {
  nombre: "Luis Flores",
  cargo: "Vendedor Senior",
  sucursal: "Sucursal Sur",
  area: "Ventas",
  correo: "luis.flores@chocobeni.bo",
  telefono: "+591 70012345",
  fechaIngreso: "12/03/2024",
  estado: "Activo",
  avatar: "LF",
  antiguedad: "2 años 2 meses",
};

const resumen = [
  { label: "Ventas completadas", value: "38",       icon: "💰" },
  { label: "Cursos completados", value: "5",        icon: "🎓" },
  { label: "Calificación prom.", value: "91%",      icon: "⭐" },
  { label: "Meta cumplida",      value: "87%",      icon: "🎯" },
];

const capacitaciones = [
  { nombre: "Manipulación de chocolate", calificacion: 92, fecha: "10/04/2026", estado: "COMPLETADO" },
  { nombre: "Atención al cliente",       calificacion: 88, fecha: "28/04/2026", estado: "COMPLETADO" },
  { nombre: "Técnicas de venta",         calificacion: 95, fecha: "02/03/2026", estado: "COMPLETADO" },
  { nombre: "Seguridad alimentaria",     calificacion: null, fecha: "15/06/2026", estado: "INSCRITO"   },
  { nombre: "Control de calidad",        calificacion: null, fecha: "30/06/2026", estado: "INSCRITO"   },
];

const ventasRecientes = [
  { cliente: "Mercado Central",     monto: 4820, fecha: "28/05/2026" },
  { cliente: "Hotel Camino Real",   monto: 8900, fecha: "26/05/2026" },
  { cliente: "Tienda El Cacao",     monto: 2110, fecha: "23/05/2026" },
  { cliente: "Distribuidora Andes", monto: 3200, fecha: "19/05/2026" },
];

const logros = [
  { titulo: "Vendedor del mes",    desc: "Mayo 2026",   icon: "🏆" },
  { titulo: "100% puntualidad",    desc: "Q1 2026",     icon: "⏰" },
  { titulo: "Curso con distinción",desc: "Técnicas de venta", icon: "🎖️" },
];

// ─── helpers ─────────────────────────────────────────────
function estadoChip(estado: string) {
  const map: Record<string, string> = {
    COMPLETADO: "bg-emerald-950 text-emerald-400",
    INSCRITO:   "bg-amber-950 text-amber-400",
    Activo:     "bg-emerald-950 text-emerald-400",
  };
  const label: Record<string, string> = { COMPLETADO: "Completado", INSCRITO: "En curso", Activo: "Activo" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${map[estado] ?? "bg-gray-100 text-gray-600"}`}>
      {label[estado] ?? estado}
    </span>
  );
}

function Campo({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-[#120c08] p-4">
      <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">{label}</p>
      <p className="mt-1 font-semibold text-gray-800 dark:text-[#f5deb3]">{value}</p>
    </div>
  );
}

type Tab = "info" | "capacitaciones" | "ventas" | "logros";

export default function EmpleadoPerfil() {
  const [tab, setTab] = useState<Tab>("info");
  const [editando, setEditando] = useState(false);
  const [telefono, setTelefono] = useState(empleado.telefono);
  const [correo, setCorreo]     = useState(empleado.correo);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "info",          label: "Información",    icon: "👤" },
    { key: "capacitaciones",label: "Capacitaciones", icon: "🎓" },
    { key: "ventas",        label: "Ventas",         icon: "💰" },
    { key: "logros",        label: "Logros",         icon: "🏆" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">
        Mi Perfil
      </h1>
      <p className="mt-2 text-gray-500 dark:text-[#9a7a5a] text-sm">
        Información personal y registro de actividad.
      </p>

      {/* ── BANNER + AVATAR ── */}
      <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm overflow-hidden">

        {/* franja café decorativa */}
        <div className="h-24 bg-gradient-to-r from-amber-800 to-amber-600 dark:from-[#2e1408] dark:to-[#4B2E1E]" />

        <div className="px-6 pb-6">
          {/* avatar flota sobre la franja */}
          <div className="-mt-12 mb-4 flex items-end justify-between flex-wrap gap-3">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white dark:border-[#18110d] bg-amber-100 dark:bg-[#4B2E1E] text-2xl font-bold text-amber-800 dark:text-[#f5c16c]">
              {empleado.avatar}
            </div>
            <button
              onClick={() => setEditando(!editando)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm cursor-pointer transition-colors
                ${editando
                  ? "bg-amber-600 text-white dark:bg-[#4B2E1E] dark:text-[#f5c16c]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1e1408] dark:text-[#9a7a5a]"
                }`}
            >
              {editando ? "✓ Guardar cambios" : "✏️ Editar perfil"}
            </button>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">{empleado.nombre}</h2>
          <p className="text-gray-500 dark:text-[#9a7a5a] text-sm mt-0.5">
            {empleado.cargo} · {empleado.sucursal}
          </p>

          {/* chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {estadoChip(empleado.estado)}
            <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-[#2e1408] dark:text-[#e8b87a]">
              {empleado.area}
            </span>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-[#1e1408] dark:text-[#9a7a5a]">
              {empleado.antiguedad} en la empresa
            </span>
          </div>
        </div>
      </div>

      {/* ── RESUMEN KPIs ── */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {resumen.map((r) => (
          <div key={r.label} className="rounded-2xl bg-white dark:bg-[#18110d] p-4 shadow-sm text-center">
            <span className="text-2xl">{r.icon}</span>
            <p className="mt-2 text-xl font-bold text-amber-600 dark:text-[#e8b87a]">{r.value}</p>
            <p className="text-xs text-gray-400 dark:text-[#7a5c3a] mt-0.5">{r.label}</p>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm cursor-pointer transition-colors
              ${tab === t.key
                ? "bg-amber-600 text-white dark:bg-[#4B2E1E] dark:text-[#f5c16c]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1e1408] dark:text-[#9a7a5a] dark:hover:bg-[#2a1a0e]"
              }`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ── CONTENIDO TABS ── */}
      <div className="mt-4 rounded-2xl bg-white dark:bg-[#18110d] p-6 shadow-sm">

        {/* INFO */}
        {tab === "info" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 dark:bg-[#120c08] p-4">
              <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">Correo electrónico</p>
              {editando
                ? <input value={correo} onChange={(e) => setCorreo(e.target.value)}
                    className="mt-1 w-full bg-transparent font-semibold text-gray-800 dark:text-[#f5deb3] border-b border-amber-400 outline-none text-sm" />
                : <p className="mt-1 font-semibold text-gray-800 dark:text-[#f5deb3] text-sm">{correo}</p>
              }
            </div>

            <div className="rounded-xl bg-gray-50 dark:bg-[#120c08] p-4">
              <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">Teléfono</p>
              {editando
                ? <input value={telefono} onChange={(e) => setTelefono(e.target.value)}
                    className="mt-1 w-full bg-transparent font-semibold text-gray-800 dark:text-[#f5deb3] border-b border-amber-400 outline-none text-sm" />
                : <p className="mt-1 font-semibold text-gray-800 dark:text-[#f5deb3] text-sm">{telefono}</p>
              }
            </div>

            <Campo label="Área / Departamento" value={empleado.area} />
            <Campo label="Sucursal"            value={empleado.sucursal} />
            <Campo label="Cargo"               value={empleado.cargo} />
            <Campo label="Fecha de ingreso"    value={empleado.fechaIngreso} />
            <Campo label="Antigüedad"          value={empleado.antiguedad} />
            <Campo label="Estado"              value={estadoChip(empleado.estado)} />
          </div>
        )}

        {/* CAPACITACIONES */}
        {tab === "capacitaciones" && (
          <div className="space-y-3">
            {capacitaciones.map((c, i) => (
              <div key={i} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-[#f5deb3] text-sm">{c.nombre}</p>
                    <p className="text-xs text-gray-400 dark:text-[#7a5c3a] mt-0.5">
                      {c.estado === "COMPLETADO" ? `Completado el ${c.fecha}` : `Finaliza: ${c.fecha}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.calificacion !== null && (
                      <span className="text-sm font-bold text-amber-600 dark:text-[#e8b87a]">{c.calificacion}/100</span>
                    )}
                    {estadoChip(c.estado)}
                  </div>
                </div>
                {c.estado === "INSCRITO" && (
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-[#2e2119]">
                      <div className="h-1.5 w-[40%] rounded-full bg-amber-500 dark:bg-[#c8804a]" />
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-[#7a5c3a] mt-1">40% completado</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VENTAS */}
        {tab === "ventas" && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#2e2119]">
                    {["Cliente", "Monto", "Fecha"].map((h) => (
                      <th key={h} className="pb-3 text-left font-medium text-gray-400 dark:text-[#9a7a5a]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ventasRecientes.map((v, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-[#1e1408] last:border-0 hover:bg-amber-50/50 dark:hover:bg-[#1e1408] transition-colors">
                      <td className="py-3 text-gray-700 dark:text-[#e8c080]">{v.cliente}</td>
                      <td className="py-3 font-semibold text-gray-800 dark:text-[#f5deb3]">Bs {v.monto.toLocaleString()}</td>
                      <td className="py-3 text-gray-400 dark:text-[#7a5c3a]">{v.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-xl bg-amber-50 dark:bg-[#1e1408] px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-[#9a7a5a]">Total del mes</span>
              <span className="font-bold text-amber-600 dark:text-[#e8b87a]">
                Bs {ventasRecientes.reduce((a, v) => a + v.monto, 0).toLocaleString()}
              </span>
            </div>
          </>
        )}

        {/* LOGROS */}
        {tab === "logros" && (
          <div className="grid gap-4 sm:grid-cols-3">
            {logros.map((l, i) => (
              <div key={i} className="rounded-xl border border-amber-100 dark:border-[#3a2010] bg-amber-50 dark:bg-[#1a0e06] p-5 text-center">
                <span className="text-4xl">{l.icon}</span>
                <p className="mt-3 font-semibold text-gray-800 dark:text-[#f5deb3] text-sm">{l.titulo}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-[#7a5c3a]">{l.desc}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}