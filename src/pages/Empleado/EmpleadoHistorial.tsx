"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router";

// ─── Tipos ────────────────────────────────────────────────
type Estado = "COMPLETADO" | "INSCRITO" | "ABANDONADO";

interface Curso {
  nombre: string;
  instructor: string;
  estado: Estado;
  calificacion: number | null;
  fecha_fin: string;
  fecha_inicio: string;
  descripcion: string | null;
  costo: number | null;
  duracion_dias: number | null;
}

interface EmpleadoAPI {
  id: number;
  nombre: string;
  cargo: string;
}

interface DashboardResponse {
  empleado: EmpleadoAPI | null;
  capacitaciones: Curso[];
}

// ─── Helpers ──────────────────────────────────────────────
const estadoStyle: Record<Estado, string> = {
  COMPLETADO: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  INSCRITO:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ABANDONADO: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};
const estadoLabel: Record<Estado, string> = {
  COMPLETADO: "Completado",
  INSCRITO:   "En curso",
  ABANDONADO: "Abandonado",
};

function formatFecha(f: string) {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-BO", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function getNota(n: number) {
  if (n >= 90) return { label: "Excelente", color: "text-green-600 dark:text-green-400" };
  if (n >= 75) return { label: "Bueno",     color: "text-amber-600 dark:text-amber-400" };
  return             { label: "Regular",    color: "text-red-500 dark:text-red-400" };
}

function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

// ─── Barra circular de nota ───────────────────────────────
function CircleScore({ val }: { val: number }) {
  const r = 28, circ = 2 * Math.PI * r;
  const fill = (val / 100) * circ;
  const { color } = getNota(val);
  const stroke = val >= 90 ? "#22c55e" : val >= 75 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5"
          className="text-gray-100 dark:text-[#2a1a0d]" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={stroke} strokeWidth="5"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className={`absolute text-sm font-bold ${color}`}>{val}</span>
    </div>
  );
}

// ─── Estrellas ────────────────────────────────────────────
function Stars({ val }: { val: number }) {
  const stars = Math.round((val / 100) * 5);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ fontSize: 13 }}
          className={i <= stars ? "text-amber-400" : "text-gray-200 dark:text-[#2a1a0d]"}>★</span>
      ))}
    </div>
  );
}

// ─── Barra de progreso horizontal (para timeline) ─────────
function MiniBar({ estado }: { estado: Estado }) {
  const pct = estado === "COMPLETADO" ? 100 : estado === "INSCRITO" ? 50 : 15;
  const color = estado === "COMPLETADO" ? "bg-green-500" : estado === "INSCRITO" ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d] mt-2">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Modal detalle ────────────────────────────────────────
function ModalCurso({
  curso,
  empleadoNombre,
  onClose,
}: {
  curso: Curso;
  empleadoNombre: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-[#18110d] shadow-2xl overflow-hidden">

        {/* Franja superior de color según estado */}
        <div className={`h-1.5 w-full ${
          curso.estado === "COMPLETADO" ? "bg-green-500" :
          curso.estado === "INSCRITO"   ? "bg-amber-400" : "bg-red-400"
        }`} />

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a1a0d]">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${estadoStyle[curso.estado]}`}>
            {estadoLabel[curso.estado]}
          </span>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a1a0d] transition-colors">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Título */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-[#f5deb3] leading-snug">
              {curso.nombre}
            </h2>
            {curso.descripcion && (
              <p className="mt-1.5 text-sm text-gray-500 dark:text-[#9a7a5a] leading-relaxed">
                {curso.descripcion}
              </p>
            )}
          </div>

          {/* Grid info */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Instructor",   value: curso.instructor },
              { label: "Participante", value: empleadoNombre },
              { label: "Inicio",       value: formatFecha(curso.fecha_inicio) },
              { label: "Fin",          value: formatFecha(curso.fecha_fin) },
              curso.duracion_dias != null
                ? { label: "Duración", value: `${curso.duracion_dias} días` }
                : null,
              curso.costo != null
                ? { label: "Costo", value: `Bs. ${curso.costo.toLocaleString()}` }
                : null,
            ]
              .filter(Boolean)
              .map((item) => (
                <div key={item!.label} className="rounded-xl bg-gray-50 dark:bg-[#120c08] p-3">
                  <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">{item!.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-[#f5deb3]">{item!.value}</p>
                </div>
              ))}
          </div>

          {/* Calificación */}
          {curso.calificacion !== null ? (
            <div className="flex items-center gap-4 rounded-xl bg-gray-50 dark:bg-[#120c08] px-4 py-3">
              <CircleScore val={curso.calificacion} />
              <div>
                <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">Calificación obtenida</p>
                <p className={`text-base font-bold ${getNota(curso.calificacion).color}`}>
                  {curso.calificacion} / 100 — {getNota(curso.calificacion).label}
                </p>
                <Stars val={curso.calificacion} />
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-gray-50 dark:bg-[#120c08] px-4 py-3 text-sm text-gray-400 dark:text-[#7a5c3a]">
              {curso.estado === "INSCRITO"
                ? "⏳ Aún en curso — calificación pendiente."
                : "❌ No se registró calificación."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#18110d] p-5 shadow-sm animate-pulse flex gap-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#2a1a0d] shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 w-32 rounded bg-gray-100 dark:bg-[#2a1a0d]" />
        <div className="h-4 w-48 rounded bg-gray-200 dark:bg-[#3a2a1a]" />
        <div className="h-3 w-40 rounded bg-gray-100 dark:bg-[#2a1a0d]" />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function EmpleadoHistorial() {
  const { id } = useParams<{ id: string }>();
  const empleadoId = parseInt(id ?? "1", 10);

  const [empleado, setEmpleado]           = useState<EmpleadoAPI | null>(null);
  const [capacitaciones, setCapacitaciones] = useState<Curso[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [selected, setSelected]           = useState<Curso | null>(null);
  const [filtroEstado, setFiltroEstado]   = useState<"todos" | Estado>("todos");

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/api/empleado-dashboard/${empleadoId}/`)
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json() as Promise<DashboardResponse>; })
      .then((data) => { setEmpleado(data.empleado); setCapacitaciones(data.capacitaciones); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [empleadoId]);

  // ── Stats ──
  const completados  = capacitaciones.filter((c) => c.estado === "COMPLETADO");
  const enCurso      = capacitaciones.filter((c) => c.estado === "INSCRITO");
  const abandonados  = capacitaciones.filter((c) => c.estado === "ABANDONADO");
  const conCalif     = completados.filter((c) => c.calificacion !== null);
  const promedio     = conCalif.length
    ? Math.round(conCalif.reduce((a, c) => a + (c.calificacion ?? 0), 0) / conCalif.length)
    : null;
  const mejorCurso   = conCalif.reduce<Curso | null>(
    (best, c) => (!best || (c.calificacion ?? 0) > (best.calificacion ?? 0) ? c : best), null
  );

  // ── Filtro ──
  const lista = filtroEstado === "todos"
    ? capacitaciones
    : capacitaciones.filter((c) => c.estado === filtroEstado);

  const filtros: { key: "todos" | Estado; label: string; count: number }[] = [
    { key: "todos",      label: "Todos",       count: capacitaciones.length },
    { key: "COMPLETADO", label: "Completados", count: completados.length },
    { key: "INSCRITO",   label: "En curso",    count: enCurso.length },
    { key: "ABANDONADO", label: "Abandonados", count: abandonados.length },
  ];

  return (
    <div className="p-6">
      {selected && empleado && (
        <ModalCurso curso={selected} empleadoNombre={empleado.nombre} onClose={() => setSelected(null)} />
      )}

      {/* Título */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">Historial de Cursos</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-[#9a7a5a]">
        Registro completo de capacitaciones y calificaciones obtenidas.
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          No se pudo cargar la información: {error}
        </div>
      )}

      {/* ── Perfil + promedio ── */}
      {!loading && empleado && (
        <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-[#3a2010] flex items-center justify-center text-xl font-bold text-amber-700 dark:text-[#e8b87a] shrink-0">
            {iniciales(empleado.nombre)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-800 dark:text-[#f5deb3]">{empleado.nombre}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a] font-medium">
              {empleado.cargo}
            </span>
          </div>
          {promedio !== null && (
            <div className="text-center shrink-0">
              <CircleScore val={promedio} />
              <p className="text-xs text-gray-400 dark:text-[#7a5c3a] mt-1">Promedio</p>
            </div>
          )}
        </div>
      )}

      {/* ── Stats ── */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total cursos",  val: loading ? "—" : capacitaciones.length, color: "text-gray-800 dark:text-[#f5deb3]",         bg: "bg-white dark:bg-[#18110d]" },
          { label: "Completados",   val: loading ? "—" : completados.length,    color: "text-green-600 dark:text-green-400",         bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "En curso",      val: loading ? "—" : enCurso.length,        color: "text-yellow-600 dark:text-yellow-400",       bg: "bg-yellow-50 dark:bg-yellow-900/20" },
          { label: "Abandonados",   val: loading ? "—" : abandonados.length,    color: "text-red-500 dark:text-red-400",             bg: "bg-red-50 dark:bg-red-900/20" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl ${s.bg} shadow-sm p-4 text-center`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-500 dark:text-[#9a7a5a] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Mejor curso ── */}
      {!loading && mejorCurso && (
        <div className="mt-4 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelected(mejorCurso)}>
          <span className="text-2xl">🏆</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 dark:text-[#7a5c3a] uppercase tracking-wide">Mejor calificación</p>
            <p className="font-bold text-gray-800 dark:text-[#f5deb3] truncate">{mejorCurso.nombre}</p>
            <Stars val={mejorCurso.calificacion!} />
          </div>
          <span className={`text-2xl font-bold ${getNota(mejorCurso.calificacion!).color}`}>
            {mejorCurso.calificacion}
          </span>
        </div>
      )}

      {/* ── Filtros con contadores ── */}
      <div className="mt-5 flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button key={f.key} onClick={() => setFiltroEstado(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filtroEstado === f.key
                ? "bg-amber-500 dark:bg-[#8b5e2a] text-white"
                : "bg-white dark:bg-[#18110d] text-gray-600 dark:text-[#cbb08b] border border-gray-200 dark:border-[#3a2a1a] hover:border-amber-300"
            }`}>
            {f.label}
            <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
              filtroEstado === f.key
                ? "bg-white/20 text-white"
                : "bg-gray-100 dark:bg-[#2a1a0d] text-gray-500 dark:text-[#9a7a5a]"
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Lista ── */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <><Skeleton /><Skeleton /><Skeleton /></>
        ) : lista.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#18110d] p-10 text-center shadow-sm">
            <p className="text-gray-400 dark:text-[#7a5c3a]">No hay cursos en esta categoría.</p>
          </div>
        ) : (
          lista.map((curso, idx) => (
            <button key={idx} onClick={() => setSelected(curso)}
              className="w-full text-left rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 hover:shadow-md transition-shadow group cursor-pointer">

              {/* Franja lateral de color */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  {curso.calificacion !== null ? (
                    <CircleScore val={curso.calificacion} />
                  ) : (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#2a1a0d]">
                      <span className="text-2xl">{curso.estado === "INSCRITO" ? "⏳" : "❌"}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoStyle[curso.estado]}`}>
                    {estadoLabel[curso.estado]}
                  </span>

                  <h3 className="mt-1.5 font-bold text-gray-800 dark:text-[#f5deb3] leading-tight">
                    {curso.nombre}
                  </h3>

                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-[#9a7a5a]">
                    <span>🎓 {curso.instructor}</span>
                    <span>📅 {formatFecha(curso.fecha_inicio)} → {formatFecha(curso.fecha_fin)}</span>
                    {curso.duracion_dias != null && <span>⏱ {curso.duracion_dias} días</span>}
                    {curso.costo != null && <span>💰 Bs. {curso.costo.toLocaleString()}</span>}
                  </div>

                  {curso.calificacion !== null && (
                    <div className="mt-2">
                      <Stars val={curso.calificacion} />
                    </div>
                  )}

                  <MiniBar estado={curso.estado} />
                </div>

                <span className="shrink-0 text-xs font-medium text-amber-600 dark:text-[#e8b87a] group-hover:underline self-center">
                  Ver →
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}