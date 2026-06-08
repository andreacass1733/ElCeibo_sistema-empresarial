"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router";

// ─── Tipos ────────────────────────────────────────────────
type Estado = "COMPLETADO" | "INSCRITO" | "ABANDONADO";
type Filtro = "todos" | "INSCRITO" | "COMPLETADO" | "ABANDONADO";

interface CapacitacionAPI {
  nombre: string;
  instructor: string;
  estado: Estado;
  calificacion: number | null;
  fecha_fin: string; // "YYYY-MM-DD"
}

interface EmpleadoAPI {
  id: number;
  nombre: string;
  cargo: string;
}

interface DashboardResponse {
  empleado: EmpleadoAPI | null;
  capacitaciones: CapacitacionAPI[];
}

// ─── Helpers ──────────────────────────────────────────────
function estadoLabel(e: Estado) {
  return { COMPLETADO: "Completado", INSCRITO: "En curso", ABANDONADO: "Abandonado" }[e];
}

function estadoColor(e: Estado) {
  return {
    COMPLETADO: "bg-emerald-950 text-emerald-400",
    INSCRITO: "bg-amber-950 text-amber-400",
    ABANDONADO: "bg-red-950 text-red-400",
  }[e];
}

function barColor(e: Estado) {
  return {
    COMPLETADO: "bg-emerald-500",
    INSCRITO: "bg-amber-500 dark:bg-[#c87941]",
    ABANDONADO: "bg-red-800",
  }[e];
}

// Para cursos sin progreso exacto en la API, lo inferimos del estado
function progresoEstimado(e: Estado): number {
  return { COMPLETADO: 100, INSCRITO: 50, ABANDONADO: 0 }[e];
}

function formatFecha(fecha: string) {
  if (!fecha) return "—";
  // "YYYY-MM-DD" → "DD/MM/YYYY"
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

// ─── Modal detalle ────────────────────────────────────────
function Modal({
  cap,
  onClose,
}: {
  cap: CapacitacionAPI;
  onClose: () => void;
}) {
  const progreso = progresoEstimado(cap.estado);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#18110d] shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* cabecera */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-[#f5deb3]">
              {cap.nombre}
            </h2>
            <p className="text-xs text-gray-400 dark:text-[#7a5c3a] mt-1">
              Instructor: {cap.instructor}
            </p>
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
            { l: "Instructor", v: cap.instructor.split(" ").slice(-1)[0] },
            { l: "Fecha fin", v: formatFecha(cap.fecha_fin) },
            {
              l: "Estado",
              v: estadoLabel(cap.estado),
            },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-xl bg-gray-50 dark:bg-[#120c08] p-3 text-center"
            >
              <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">{s.l}</p>
              <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-[#f5deb3]">
                {s.v}
              </p>
            </div>
          ))}
        </div>

        {/* progreso */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 dark:text-[#7a5c3a] mb-1.5">
            <span>Progreso estimado</span>
            <span>{progreso}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 dark:bg-[#2a1a0d]">
            <div
              className={`h-2.5 rounded-full ${barColor(cap.estado)}`}
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {/* calificación */}
        {cap.calificacion !== null && (
          <div className="rounded-xl bg-amber-50 dark:bg-[#1e1408] px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-[#9a7a5a]">
              Calificación obtenida
            </span>
            <span className="text-xl font-bold text-amber-600 dark:text-[#e8b87a]">
              {cap.calificacion} / 100
            </span>
          </div>
        )}

        {cap.calificacion === null && cap.estado !== "ABANDONADO" && (
          <div className="rounded-xl bg-gray-50 dark:bg-[#120c08] px-4 py-3 text-center">
            <span className="text-sm text-gray-400 dark:text-[#7a5c3a]">
              Calificación pendiente al completar el curso
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#18110d] p-5 shadow-sm animate-pulse">
      <div className="flex justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 rounded bg-gray-200 dark:bg-[#2a1a0d]" />
          <div className="h-3 w-56 rounded bg-gray-100 dark:bg-[#1e1408]" />
        </div>
        <div className="h-7 w-12 rounded bg-gray-200 dark:bg-[#2a1a0d]" />
      </div>
      <div className="mt-4 h-2 rounded-full bg-gray-100 dark:bg-[#2a1a0d]" />
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function EmpleadoCapacitaciones() {
  const { id } = useParams<{ id: string }>();
  const empleadoId = parseInt(id ?? "1", 10);

  const [empleado, setEmpleado] = useState<EmpleadoAPI | null>(null);
  const [capacitaciones, setCapacitaciones] = useState<CapacitacionAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [abierto, setAbierto] = useState<CapacitacionAPI | null>(null);

  // ── Fetch ──
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:8000/api/empleado-dashboard/${empleadoId}/`)
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json() as Promise<DashboardResponse>;
      })
      .then((data) => {
        setEmpleado(data.empleado);
        setCapacitaciones(data.capacitaciones);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [empleadoId]);

  // ── Derived ──
  const filtrados =
    filtro === "todos"
      ? capacitaciones
      : capacitaciones.filter((c) => c.estado === filtro);

  const completados = capacitaciones.filter(
    (c) => c.estado === "COMPLETADO"
  ).length;
  const enCurso = capacitaciones.filter((c) => c.estado === "INSCRITO").length;
  const conCalif = capacitaciones.filter((c) => c.calificacion !== null);
  const califProm =
    conCalif.length > 0
      ? Math.round(
          conCalif.reduce((a, c) => a + (c.calificacion ?? 0), 0) /
            conCalif.length
        )
      : null;

  const filtros: { key: Filtro; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "INSCRITO", label: "En curso" },
    { key: "COMPLETADO", label: "Completados" },
    { key: "ABANDONADO", label: "Abandonados" },
  ];

  return (
    <div className="p-6">
      {abierto && <Modal cap={abierto} onClose={() => setAbierto(null)} />}

      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">
          Mis Capacitaciones
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-[#9a7a5a]">
          {empleado
            ? `${empleado.nombre} · ${empleado.cargo}`
            : "Seguimiento de tu formación profesional."}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          No se pudo cargar la información: {error}
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total cursos",
            value: loading ? "—" : capacitaciones.length.toString(),
            icon: "📚",
          },
          {
            label: "Completados",
            value: loading ? "—" : completados.toString(),
            icon: "✅",
          },
          {
            label: "En curso",
            value: loading ? "—" : enCurso.toString(),
            icon: "🔄",
          },
          {
            label: "Calificación prom.",
            value: loading ? "—" : califProm !== null ? `${califProm}/100` : "N/A",
            icon: "⭐",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl bg-white dark:bg-[#18110d] p-4 shadow-sm text-center"
          >
            <span className="text-2xl">{k.icon}</span>
            <p className="mt-2 text-xl font-bold text-amber-600 dark:text-[#e8b87a]">
              {k.value}
            </p>
            <p className="text-xs text-gray-400 dark:text-[#7a5c3a] mt-0.5">
              {k.label}
            </p>
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
              ${
                filtro === f.key
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
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filtrados.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#18110d] p-10 text-center shadow-sm">
            <p className="text-gray-400 dark:text-[#7a5c3a]">
              No hay cursos en esta categoría.
            </p>
          </div>
        ) : (
          filtrados.map((cap, idx) => {
            const progreso = progresoEstimado(cap.estado);
            return (
              <div
                key={idx}
                onClick={() => setAbierto(cap)}
                className="rounded-2xl bg-white dark:bg-[#18110d] p-5 shadow-sm cursor-pointer
                  hover:shadow-md hover:bg-amber-50/40 dark:hover:bg-[#1e1408] transition-all"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-gray-800 dark:text-[#f5deb3]">
                        {cap.nombre}
                      </h2>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor(cap.estado)}`}
                      >
                        {estadoLabel(cap.estado)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-[#7a5c3a] mt-1">
                      {cap.instructor} · Hasta {formatFecha(cap.fecha_fin)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {cap.calificacion !== null ? (
                      <p className="text-xl font-bold text-amber-600 dark:text-[#e8b87a]">
                        {cap.calificacion}
                        <span className="text-sm font-normal">/100</span>
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-amber-600 dark:text-[#e8b87a]">
                        {progreso}%
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 dark:text-[#7a5c3a]">
                      {cap.estado === "COMPLETADO"
                        ? "Finalizado"
                        : cap.estado === "INSCRITO"
                        ? "En progreso"
                        : "Abandonado"}
                    </p>
                  </div>
                </div>

                {/* barra */}
                <div className="mt-4">
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-[#2a1a0d]">
                    <div
                      className={`h-full rounded-full transition-all ${barColor(cap.estado)}`}
                      style={{ width: `${progreso}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-end">
                  <span className="text-[10px] text-gray-400 dark:text-[#7a5c3a]">
                    Ver detalle →
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}