"use client";

import { useState } from "react";

// ─── Tipos ────────────────────────────────────────────────
type Estado = "COMPLETADO" | "INSCRITO" | "ABANDONADO";
type Filtro = "todos" | "INSCRITO" | "COMPLETADO" | "ABANDONADO";

interface Curso {
  nombre: string;
  descripcion: string;
  instructor: string;
  fechaInicio: string;
  fechaFin: string;
  progreso: number;
  estado: Estado;
  calificacion: number | null;
  costo: number;
  modulos: { nombre: string; completado: boolean }[];
}

// ─── Datos simulados ──────────────────────────────────────
const cursos: Curso[] = [
  {
    nombre: "Atención al Cliente",
    descripcion: "Técnicas de servicio al cliente para el sector chocolatero y retail de lujo.",
    instructor: "Lic. Sandra Vargas",
    fechaInicio: "01/04/2026",
    fechaFin: "28/04/2026",
    progreso: 100,
    estado: "COMPLETADO",
    calificacion: 88,
    costo: 350,
    modulos: [
      { nombre: "Fundamentos del servicio", completado: true },
      { nombre: "Comunicación efectiva",    completado: true },
      { nombre: "Manejo de quejas",         completado: true },
      { nombre: "Fidelización de clientes", completado: true },
    ],
  },
  {
    nombre: "Ventas Estratégicas",
    descripcion: "Estrategias avanzadas de venta consultiva aplicadas a productos de chocolatería premium.",
    instructor: "Ing. Roberto Paz",
    fechaInicio: "05/05/2026",
    fechaFin: "30/06/2026",
    progreso: 45,
    estado: "INSCRITO",
    calificacion: null,
    costo: 520,
    modulos: [
      { nombre: "Psicología del comprador",  completado: true },
      { nombre: "Técnica SPIN Selling",      completado: true },
      { nombre: "Cierre de ventas",          completado: false },
      { nombre: "Seguimiento postventa",     completado: false },
      { nombre: "KPIs comerciales",          completado: false },
    ],
  },
  {
    nombre: "Manipulación de Chocolate",
    descripcion: "Normas de higiene, conservación y manipulación de productos de cacao y derivados.",
    instructor: "Ing. Carlos Rojas",
    fechaInicio: "10/02/2026",
    fechaFin: "10/03/2026",
    progreso: 100,
    estado: "COMPLETADO",
    calificacion: 95,
    costo: 280,
    modulos: [
      { nombre: "Normativa sanitaria",       completado: true },
      { nombre: "Temperatura y conservación",completado: true },
      { nombre: "Contaminación cruzada",     completado: true },
    ],
  },
  {
    nombre: "Seguridad Alimentaria",
    descripcion: "Certificación en buenas prácticas de manufactura para la industria alimenticia.",
    instructor: "Ing. María Paz",
    fechaInicio: "15/05/2026",
    fechaFin: "15/06/2026",
    progreso: 60,
    estado: "INSCRITO",
    calificacion: null,
    costo: 410,
    modulos: [
      { nombre: "Marco legal SENASAG",       completado: true },
      { nombre: "Análisis de riesgos HACCP", completado: true },
      { nombre: "Control de procesos",       completado: true },
      { nombre: "Auditorías internas",       completado: false },
      { nombre: "Certificación final",       completado: false },
    ],
  },
  {
    nombre: "Gestión de Tiempo",
    descripcion: "Productividad personal y organización del trabajo en entornos de alta demanda.",
    instructor: "Lic. Ana Torres",
    fechaInicio: "01/01/2026",
    fechaFin: "15/01/2026",
    progreso: 0,
    estado: "ABANDONADO",
    calificacion: null,
    costo: 180,
    modulos: [
      { nombre: "Matriz Eisenhower", completado: false },
      { nombre: "Técnica Pomodoro",  completado: false },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────
function estadoLabel(e: Estado) {
  return { COMPLETADO: "Completado", INSCRITO: "En curso", ABANDONADO: "Abandonado" }[e];
}

function estadoColor(e: Estado) {
  return {
    COMPLETADO: "bg-emerald-950 text-emerald-400",
    INSCRITO:   "bg-amber-950 text-amber-400",
    ABANDONADO: "bg-red-950 text-red-400",
  }[e];
}

function barColor(e: Estado) {
  return {
    COMPLETADO: "bg-emerald-500",
    INSCRITO:   "bg-amber-500 dark:bg-[#c87941]",
    ABANDONADO: "bg-red-800",
  }[e];
}

// ─── Modal detalle ────────────────────────────────────────
function Modal({ curso, onClose }: { curso: Curso; onClose: () => void }) {
  const completados = curso.modulos.filter((m) => m.completado).length;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#18110d] shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* cabecera */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-[#f5deb3]">{curso.nombre}</h2>
            <p className="text-xs text-gray-400 dark:text-[#7a5c3a] mt-1">{curso.descripcion}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-xs border rounded-lg px-3 py-1 cursor-pointer
              border-gray-200 text-gray-500 hover:bg-gray-100
              dark:border-[#2e2119] dark:text-[#9a7a5a] dark:hover:bg-[#2a1a0e]"
          >
            ✕
          </button>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { l: "Instructor",  v: curso.instructor.split(" ").slice(-1)[0] },
            { l: "Fecha fin",   v: curso.fechaFin },
            { l: "Costo",       v: `Bs ${curso.costo}` },
          ].map((s) => (
            <div key={s.l} className="rounded-xl bg-gray-50 dark:bg-[#120c08] p-3 text-center">
              <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">{s.l}</p>
              <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-[#f5deb3]">{s.v}</p>
            </div>
          ))}
        </div>

        {/* progreso */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 dark:text-[#7a5c3a] mb-1.5">
            <span>Progreso general</span>
            <span>{curso.progreso}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 dark:bg-[#2a1a0d]">
            <div className={`h-2.5 rounded-full ${barColor(curso.estado)}`} style={{ width: `${curso.progreso}%` }} />
          </div>
        </div>

        {/* calificación */}
        {curso.calificacion !== null && (
          <div className="mb-5 rounded-xl bg-amber-50 dark:bg-[#1e1408] px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-[#9a7a5a]">Calificación obtenida</span>
            <span className="text-xl font-bold text-amber-600 dark:text-[#e8b87a]">{curso.calificacion} / 100</span>
          </div>
        )}

        {/* módulos */}
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-[#7a5c3a] mb-3">
          Módulos ({completados}/{curso.modulos.length})
        </p>
        <div className="space-y-2">
          {curso.modulos.map((m, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-xl p-3 text-sm
                ${m.completado
                  ? "bg-emerald-50 dark:bg-emerald-950/20"
                  : "bg-gray-50 dark:bg-[#120c08]"
                }`}
            >
              <span className={m.completado ? "text-emerald-500" : "text-gray-300 dark:text-[#3a2a1a]"}>
                {m.completado ? "✓" : "○"}
              </span>
              <span className={m.completado ? "text-gray-700 dark:text-[#c8a870]" : "text-gray-400 dark:text-[#7a5c3a]"}>
                {m.nombre}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function EmpleadoCapacitaciones() {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [abierto, setAbierto] = useState<Curso | null>(null);

  const filtrados = filtro === "todos" ? cursos : cursos.filter((c) => c.estado === filtro);

  const completados = cursos.filter((c) => c.estado === "COMPLETADO").length;
  const enCurso     = cursos.filter((c) => c.estado === "INSCRITO").length;
  const califProm   = Math.round(
    cursos.filter((c) => c.calificacion !== null)
      .reduce((a, c) => a + (c.calificacion ?? 0), 0) /
    (cursos.filter((c) => c.calificacion !== null).length || 1)
  );

  const filtros: { key: Filtro; label: string }[] = [
    { key: "todos",      label: "Todos" },
    { key: "INSCRITO",   label: "En curso" },
    { key: "COMPLETADO", label: "Completados" },
    { key: "ABANDONADO", label: "Abandonados" },
  ];

  return (
    <div className="p-6">
      {abierto && <Modal curso={abierto} onClose={() => setAbierto(null)} />}

      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">Mis Capacitaciones</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-[#9a7a5a]">
        Seguimiento de tu formación profesional.
      </p>

      {/* ── KPIs ── */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total cursos",     value: cursos.length.toString(),   icon: "📚" },
          { label: "Completados",      value: completados.toString(),      icon: "✅" },
          { label: "En curso",         value: enCurso.toString(),          icon: "🔄" },
          { label: "Calificación prom.",value: `${califProm}/100`,         icon: "⭐" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white dark:bg-[#18110d] p-4 shadow-sm text-center">
            <span className="text-2xl">{k.icon}</span>
            <p className="mt-2 text-xl font-bold text-amber-600 dark:text-[#e8b87a]">{k.value}</p>
            <p className="text-xs text-gray-400 dark:text-[#7a5c3a] mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filtros ── */}
      <div className="mt-6 flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm cursor-pointer transition-colors
              ${filtro === f.key
                ? "bg-amber-600 text-white dark:bg-[#4B2E1E] dark:text-[#f5c16c]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1e1408] dark:text-[#9a7a5a] dark:hover:bg-[#2a1a0e]"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Lista cursos ── */}
      <div className="mt-4 space-y-4">
        {filtrados.map((curso) => {
          const completadosMod = curso.modulos.filter((m) => m.completado).length;
          return (
            <div
              key={curso.nombre}
              onClick={() => setAbierto(curso)}
              className="rounded-2xl bg-white dark:bg-[#18110d] p-5 shadow-sm cursor-pointer
                hover:shadow-md hover:bg-amber-50/40 dark:hover:bg-[#1e1408] transition-all"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-gray-800 dark:text-[#f5deb3]">{curso.nombre}</h2>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor(curso.estado)}`}>
                      {estadoLabel(curso.estado)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-[#7a5c3a] mt-1">
                    {curso.instructor} · {curso.fechaInicio} → {curso.fechaFin}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {curso.calificacion !== null
                    ? <p className="text-xl font-bold text-amber-600 dark:text-[#e8b87a]">{curso.calificacion}<span className="text-sm font-normal">/100</span></p>
                    : <p className="text-sm font-semibold text-amber-600 dark:text-[#e8b87a]">{curso.progreso}%</p>
                  }
                  <p className="text-[10px] text-gray-400 dark:text-[#7a5c3a]">
                    {completadosMod}/{curso.modulos.length} módulos
                  </p>
                </div>
              </div>

              {/* barra */}
              <div className="mt-4">
                <div className="h-2 rounded-full bg-gray-100 dark:bg-[#2a1a0d]">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(curso.estado)}`}
                    style={{ width: `${curso.progreso}%` }}
                  />
                </div>
              </div>

              {/* módulos mini */}
              <div className="mt-3 flex gap-1.5 flex-wrap">
                {curso.modulos.map((m, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${m.completado ? "bg-emerald-500" : "bg-gray-200 dark:bg-[#3a2a1a]"}`}
                    title={m.nombre}
                  />
                ))}
                <span className="text-[10px] text-gray-400 dark:text-[#7a5c3a] ml-1 self-center">
                  Ver detalle →
                </span>
              </div>
            </div>
          );
        })}

        {filtrados.length === 0 && (
          <div className="rounded-2xl bg-white dark:bg-[#18110d] p-10 text-center shadow-sm">
            <p className="text-gray-400 dark:text-[#7a5c3a]">No hay cursos en esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  );
}