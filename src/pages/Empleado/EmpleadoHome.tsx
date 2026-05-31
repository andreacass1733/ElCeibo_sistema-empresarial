"use client";

import { useState } from "react";

// ─── Tipos ────────────────────────────────────────────────
type EstadoCapacitacion = "COMPLETADO" | "INSCRITO" | "ABANDONADO";

interface Capacitacion {
  nombre: string;
  instructor: string;
  fechaFin: string;
  estado: EstadoCapacitacion;
  calificacion: number | null;
  progreso: number;
}

interface Venta {
  id: string;
  cliente: string;
  monto: number;
  fecha: string;
  estado: "completado" | "pendiente" | "cancelado";
}

interface Produccion {
  producto: string;
  cantidad: number;
  fecha: string;
}

// ─── Datos del empleado logueado (simula lo que vendría del backend) ──
const empleadoActual = {
  nombre: "Ana Quispe",
  cargo: "Producción",
  sucursal: "Sucursal Central",
  fechaIngreso: "12/03/2023",
  avatar: "AQ",
};

const misCapacitaciones: Capacitacion[] = [
  { nombre: "Manipulación de chocolate", instructor: "Ing. Rojas", fechaFin: "10/04/2026", estado: "COMPLETADO", calificacion: 92, progreso: 100 },
  { nombre: "Atención al cliente",       instructor: "Lic. Vargas", fechaFin: "28/04/2026", estado: "COMPLETADO", calificacion: 88, progreso: 100 },
  { nombre: "Seguridad alimentaria",     instructor: "Ing. Paz",    fechaFin: "15/06/2026", estado: "INSCRITO",   calificacion: null, progreso: 60 },
  { nombre: "Control de calidad",        instructor: "Ing. Rojas",  fechaFin: "30/06/2026", estado: "INSCRITO",   calificacion: null, progreso: 40 },
];

const misVentas: Venta[] = [
  { id: "V-0041", cliente: "Mercado Central",    monto: 4820, fecha: "28/05/2026", estado: "completado" },
  { id: "V-0038", cliente: "Hotel Camino Real",  monto: 8900, fecha: "26/05/2026", estado: "completado" },
  { id: "V-0035", cliente: "Tienda El Cacao",    monto: 2110, fecha: "23/05/2026", estado: "pendiente" },
  { id: "V-0031", cliente: "Distribuidora Andes",monto: 3200, fecha: "19/05/2026", estado: "cancelado" },
];

const miProduccion: Produccion[] = [
  { producto: "Chocolate blanco", cantidad: 880, fecha: "28/05/2026" },
  { producto: "Tableta 70%",      cantidad: 420, fecha: "25/05/2026" },
  { producto: "Trufa maracuyá",   cantidad: 310, fecha: "22/05/2026" },
  { producto: "Bombón relleno",   cantidad: 240, fecha: "18/05/2026" },
];

const objetivos = [
  { label: "Meta de producción mensual", pct: 85, meta: "2,000 u.", logrado: "1,850 u." },
  { label: "Capacitaciones completadas", pct: 50, meta: "4",        logrado: "2" },
  { label: "Calificación promedio",      pct: 90, meta: "100%",     logrado: "90%" },
];

// ─── Helpers ──────────────────────────────────────────────
function estadoChip(estado: string) {
  const map: Record<string, string> = {
    completado: "bg-emerald-950 text-emerald-400",
    pendiente:  "bg-amber-950 text-amber-400",
    cancelado:  "bg-red-950 text-red-400",
    COMPLETADO: "bg-emerald-950 text-emerald-400",
    INSCRITO:   "bg-amber-950 text-amber-400",
    ABANDONADO: "bg-red-950 text-red-400",
  };
  const label: Record<string, string> = {
    completado: "Completado", pendiente: "Pendiente", cancelado: "Cancelado",
    COMPLETADO: "Completado", INSCRITO: "En curso", ABANDONADO: "Abandonado",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${map[estado] ?? ""}`}>
      {label[estado] ?? estado}
    </span>
  );
}

// ─── Card wrapper ─────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm dark:bg-[#18110d] ${className}`}>
      {children}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────
type Tab = "capacitaciones" | "ventas" | "produccion";
const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: "capacitaciones", label: "Mis Capacitaciones", icon: "🎓" },
  { key: "ventas",         label: "Mis Ventas",         icon: "💰" },
  { key: "produccion",     label: "Mi Producción",      icon: "🏭" },
];

// ─── Componente principal ─────────────────────────────────
export default function EmpleadoHome() {
  const [tab, setTab] = useState<Tab>("capacitaciones");

  const totalVentas = misVentas
    .filter((v) => v.estado === "completado")
    .reduce((acc, v) => acc + v.monto, 0);

  const califProm =
    misCapacitaciones
      .filter((c) => c.calificacion !== null)
      .reduce((acc, c) => acc + (c.calificacion ?? 0), 0) /
    (misCapacitaciones.filter((c) => c.calificacion !== null).length || 1);

  return (
    <div className="p-6">

      {/* ── HEADER PERSONAL ── */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-800 dark:bg-[#4B2E1E] dark:text-[#f5c16c]">
          {empleadoActual.avatar}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">
            Bienvenida, {empleadoActual.nombre}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-[#cbb08b]">
            {empleadoActual.cargo} · {empleadoActual.sucursal} · Desde {empleadoActual.fechaIngreso}
          </p>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Cursos Activos",      value: misCapacitaciones.filter((c) => c.estado === "INSCRITO").length.toString(),   sub: "en progreso" },
          { title: "Cursos Completados",  value: misCapacitaciones.filter((c) => c.estado === "COMPLETADO").length.toString(), sub: "este año" },
          { title: "Calificación Prom.",  value: `${califProm.toFixed(0)}%`,  sub: "en capacitaciones" },
          { title: "Ventas del Mes",      value: `Bs ${totalVentas.toLocaleString()}`, sub: `${misVentas.filter((v) => v.estado === "completado").length} ventas completadas` },
        ].map((item) => (
          <Card key={item.title} className="p-5">
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{item.title}</p>
            <h2 className="mt-2 text-2xl font-bold text-amber-600 dark:text-[#e8b87a]">{item.value}</h2>
            <p className="mt-1 text-xs text-gray-400 dark:text-[#7a5a3a]">{item.sub}</p>
          </Card>
        ))}
      </div>

      {/* ── OBJETIVOS PERSONALES ── */}
      <Card className="mb-6 p-5">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-[#f5deb3]">
          Mis Objetivos
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {objetivos.map((o) => (
            <div key={o.label}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-[#9a7a5a]">{o.label}</span>
                <span className="text-xs font-semibold text-amber-600 dark:text-[#e8b87a]">{o.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-[#2e2119]">
                <div
                  className="h-2 rounded-full bg-amber-500 dark:bg-[#c8804a]"
                  style={{ width: `${o.pct}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-gray-400 dark:text-[#7a5a3a]">
                <span>Logrado: {o.logrado}</span>
                <span>Meta: {o.meta}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── TABS ── */}
      <div className="mb-4 flex gap-2 flex-wrap">
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

      {/* ── CONTENIDO TAB ── */}
      <Card className="p-5">

        {/* CAPACITACIONES */}
        {tab === "capacitaciones" && (
          <div className="space-y-4">
            {misCapacitaciones.map((c, i) => (
              <div key={i} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-[#f5deb3]">{c.nombre}</p>
                    <p className="text-xs text-gray-400 dark:text-[#7a5a3a] mt-0.5">
                      Instructor: {c.instructor} · Finaliza: {c.fechaFin}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.calificacion !== null && (
                      <span className="text-sm font-bold text-amber-600 dark:text-[#e8b87a]">
                        {c.calificacion}/100
                      </span>
                    )}
                    {estadoChip(c.estado)}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 dark:text-[#7a5a3a] mb-1">
                    <span>Progreso</span>
                    <span>{c.progreso}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-[#2e2119]">
                    <div
                      className={`h-2 rounded-full transition-all ${c.estado === "COMPLETADO" ? "bg-emerald-500" : "bg-amber-500 dark:bg-[#c8804a]"}`}
                      style={{ width: `${c.progreso}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VENTAS */}
        {tab === "ventas" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#2e2119]">
                  {["ID", "Cliente", "Monto", "Fecha", "Estado"].map((h) => (
                    <th key={h} className="pb-3 text-left font-medium text-gray-400 dark:text-[#9a7a5a]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {misVentas.map((v, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-[#1e1408] last:border-0 hover:bg-amber-50/50 dark:hover:bg-[#1e1408] transition-colors">
                    <td className="py-3 font-mono text-xs text-amber-600 dark:text-[#c8904a]">{v.id}</td>
                    <td className="py-3 text-gray-700 dark:text-[#e8c080]">{v.cliente}</td>
                    <td className="py-3 font-semibold text-gray-800 dark:text-[#f5deb3]">Bs {v.monto.toLocaleString()}</td>
                    <td className="py-3 text-gray-400 dark:text-[#7a5a3a]">{v.fecha}</td>
                    <td className="py-3">{estadoChip(v.estado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 rounded-xl bg-amber-50 dark:bg-[#1e1408] px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-[#9a7a5a]">Total ventas completadas</span>
              <span className="font-bold text-amber-600 dark:text-[#e8b87a]">Bs {totalVentas.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* PRODUCCIÓN */}
        {tab === "produccion" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#2e2119]">
                  {["Producto", "Unidades", "Fecha"].map((h) => (
                    <th key={h} className="pb-3 text-left font-medium text-gray-400 dark:text-[#9a7a5a]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {miProduccion.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-[#1e1408] last:border-0 hover:bg-amber-50/50 dark:hover:bg-[#1e1408] transition-colors">
                    <td className="py-3 text-gray-700 dark:text-[#e8c080]">{p.producto}</td>
                    <td className="py-3 font-semibold text-gray-800 dark:text-[#f5deb3]">{p.cantidad} u.</td>
                    <td className="py-3 text-gray-400 dark:text-[#7a5a3a]">{p.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 rounded-xl bg-amber-50 dark:bg-[#1e1408] px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-[#9a7a5a]">Total unidades producidas</span>
              <span className="font-bold text-amber-600 dark:text-[#e8b87a]">
                {miProduccion.reduce((a, p) => a + p.cantidad, 0)} u.
              </span>
            </div>
          </div>
        )}

      </Card>
    </div>
  );
}