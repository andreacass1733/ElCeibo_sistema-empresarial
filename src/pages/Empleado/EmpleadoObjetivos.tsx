"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router";

// ─── Tipos ────────────────────────────────────────────────
type EstadoObj = "EN_PROGRESO" | "COMPLETADO" | "PENDIENTE" | "EN_RIESGO";

interface Objetivo {
  id_objetivo: number;
  titulo: string;
  descripcion: string | null;
  area: string | null;
  estado: EstadoObj;
  progreso: number;
  responsable: string | null;
  fecha_limite: string | null;
}

interface EmpleadoAPI {
  id: number;
  nombre: string;
  cargo: string;
}

interface ObjetivosResponse {
  empleado: EmpleadoAPI | null;
  objetivos: Objetivo[];
}

// ─── Helpers ──────────────────────────────────────────────
const estadoStyle: Record<EstadoObj, string> = {
  EN_PROGRESO: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  COMPLETADO:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PENDIENTE:   "bg-gray-100 text-gray-500 dark:bg-[#2a1a0d] dark:text-[#9a7a5a]",
  EN_RIESGO:   "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const estadoLabel: Record<EstadoObj, string> = {
  EN_PROGRESO: "En progreso",
  COMPLETADO:  "Completado",
  PENDIENTE:   "Pendiente",
  EN_RIESGO:   "En riesgo",
};

const areaColor: Record<string, string> = {
  Ventas:      "bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a]",
  RRHH:        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Calidad:     "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Gestión:     "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  Producción:  "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Operaciones: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
};

function getBarColor(estado: EstadoObj, progreso: number) {
  if (estado === "COMPLETADO") return "bg-green-500";
  if (estado === "EN_RIESGO")  return "bg-red-400";
  if (progreso >= 75)          return "bg-amber-500 dark:bg-[#c87941]";
  return "bg-amber-400 dark:bg-[#a06e35]";
}

function getProgresoColor(estado: EstadoObj) {
  if (estado === "COMPLETADO") return "text-green-600 dark:text-green-400";
  if (estado === "EN_RIESGO")  return "text-red-500 dark:text-red-400";
  return "text-amber-600 dark:text-[#e8b87a]";
}

function formatFecha(f: string | null) {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" });
}

function diasRestantes(f: string | null) {
  if (!f) return null;
  return Math.ceil((new Date(f).getTime() - Date.now()) / 86400000);
}

function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

// ─── Círculo de progreso ──────────────────────────────────
function CircleProgress({ val }: { val: number }) {
  const size = 72, r = size * 0.38, circ = 2 * Math.PI * r;
  const capped = Math.min(val, 100);
  const fill = (capped / 100) * circ;
  const color = val >= 90 ? "#22c55e" : val >= 60 ? "#f59e0b" : "#f87171";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3e8d0" strokeWidth={size * 0.08} className="dark:stroke-[#2a1a0d]" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size * 0.08}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.22} fontWeight="800" fill={color}>{val}%</text>
    </svg>
  );
}

// ─── Modal detalle ────────────────────────────────────────
function ModalObjetivo({ obj, onClose }: { obj: Objetivo; onClose: () => void }) {
  const dias = diasRestantes(obj.fecha_limite);
  const areaKey = obj.area ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#18110d] shadow-2xl">

        {/* Franja de color por estado */}
        <div className={`h-1.5 w-full rounded-t-2xl ${
          obj.estado === "COMPLETADO" ? "bg-green-500" :
          obj.estado === "EN_RIESGO"  ? "bg-red-400" :
          obj.estado === "PENDIENTE"  ? "bg-gray-300" : "bg-amber-400"
        }`} />

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#18110d] px-6 py-4 border-b border-gray-100 dark:border-[#2a1a0d]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {obj.area && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${areaColor[areaKey] ?? "bg-gray-100 text-gray-600"}`}>
                  {obj.area}
                </span>
              )}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoStyle[obj.estado]}`}>
                {estadoLabel[obj.estado]}
              </span>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a1a0d] transition-colors">
              ✕
            </button>
          </div>
          <h2 className="mt-2 text-lg font-bold text-gray-800 dark:text-[#f5deb3] leading-snug">{obj.titulo}</h2>
          {obj.descripcion && (
            <p className="mt-1 text-sm text-gray-500 dark:text-[#9a7a5a] leading-relaxed">{obj.descripcion}</p>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              obj.responsable ? { label: "Responsable",  value: obj.responsable } : null,
              obj.fecha_limite ? { label: "Fecha límite", value: formatFecha(obj.fecha_limite) } : null,
              dias !== null ? {
                label: "Días restantes",
                value: dias > 0 ? `${dias} días` : "⚠ Vencido",
              } : null,
              { label: "Progreso", value: `${obj.progreso}%` },
            ]
              .filter(Boolean)
              .map((item) => (
                <div key={item!.label} className="rounded-xl bg-gray-50 dark:bg-[#120c08] p-3">
                  <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">{item!.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-[#f5deb3]">{item!.value}</p>
                </div>
              ))}
          </div>

          {/* Círculo + barra */}
          <div className="flex items-center gap-5 rounded-xl bg-gray-50 dark:bg-[#120c08] px-5 py-4">
            <CircleProgress val={obj.progreso} />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500 dark:text-[#9a7a5a]">Progreso general</span>
                <span className={`font-bold ${getProgresoColor(obj.estado)}`}>{obj.progreso}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-[#2a1a0d]">
                <div
                  className={`h-full rounded-full transition-all ${getBarColor(obj.estado, obj.progreso)}`}
                  style={{ width: `${obj.progreso}%` }}
                />
              </div>
              <p className={`mt-1.5 text-xs font-semibold ${getProgresoColor(obj.estado)}`}>
                {obj.estado === "COMPLETADO" ? "✓ Objetivo alcanzado" :
                 obj.estado === "EN_RIESGO"  ? "⚠ Requiere atención" :
                 obj.estado === "PENDIENTE"  ? "⏳ Pendiente de inicio" : "En curso"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#18110d] p-5 shadow-sm animate-pulse space-y-3">
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-[#2a1a0d]" />
        <div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-[#2a1a0d]" />
      </div>
      <div className="h-4 w-48 rounded bg-gray-200 dark:bg-[#3a2a1a]" />
      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d]" />
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function EmpleadoObjetivos() {
  const { id } = useParams<{ id: string }>();
  const empleadoId = parseInt(id ?? "1", 10);

  const [empleado, setEmpleado]     = useState<EmpleadoAPI | null>(null);
  const [objetivos, setObjetivos]   = useState<Objetivo[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [selected, setSelected]     = useState<Objetivo | null>(null);
  const [filtro, setFiltro]         = useState<"Todos" | EstadoObj>("Todos");

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/api/empleado-objetivos/${empleadoId}/`)
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json() as Promise<ObjetivosResponse>; })
      .then((data) => { setEmpleado(data.empleado); setObjetivos(data.objetivos); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [empleadoId]);

  // ── Stats ──
  const completados   = objetivos.filter((o) => o.estado === "COMPLETADO").length;
  const enRiesgo      = objetivos.filter((o) => o.estado === "EN_RIESGO").length;
  const avanceGlobal  = objetivos.length
    ? Math.round(objetivos.reduce((a, o) => a + o.progreso, 0) / objetivos.length)
    : 0;

  const filtros: { key: "Todos" | EstadoObj; label: string }[] = [
    { key: "Todos",      label: "Todos" },
    { key: "EN_PROGRESO",label: "En progreso" },
    { key: "COMPLETADO", label: "Completados" },
    { key: "EN_RIESGO",  label: "En riesgo" },
    { key: "PENDIENTE",  label: "Pendientes" },
  ];

  const lista = filtro === "Todos" ? objetivos : objetivos.filter((o) => o.estado === filtro);

  return (
    <div className="p-6">
      {selected && <ModalObjetivo obj={selected} onClose={() => setSelected(null)} />}

      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">Mis Objetivos</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-[#9a7a5a]">
        Seguimiento de metas personales asignadas.
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          No se pudo cargar: {error}
        </div>
      )}

      {/* ── Perfil + avance global ── */}
      {!loading && empleado && (
        <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-[#3a2010] flex items-center justify-center text-lg font-bold text-amber-700 dark:text-[#e8b87a] shrink-0">
            {iniciales(empleado.nombre)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 dark:text-[#f5deb3]">{empleado.nombre}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a] font-medium">
              {empleado.cargo}
            </span>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-black text-amber-600 dark:text-[#e8b87a]">{avanceGlobal}%</p>
            <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">avance global</p>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Total",       val: loading ? "—" : objetivos.length, color: "text-gray-800 dark:text-[#f5deb3]",    bg: "bg-white dark:bg-[#18110d]" },
          { label: "Completados", val: loading ? "—" : completados,      color: "text-green-600 dark:text-green-400",   bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "En riesgo",   val: loading ? "—" : enRiesgo,         color: "text-red-500 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-900/20" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl ${s.bg} shadow-sm p-4 text-center`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-500 dark:text-[#9a7a5a] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Barra global ── */}
      {!loading && objetivos.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm px-5 py-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500 dark:text-[#9a7a5a]">
              {completados} de {objetivos.length} objetivos completados
            </span>
            <span className="font-bold text-amber-600 dark:text-[#e8b87a]">{avanceGlobal}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d]">
            <div className="h-full rounded-full bg-amber-500 dark:bg-[#c87941] transition-all"
              style={{ width: `${avanceGlobal}%` }} />
          </div>
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="mt-5 flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtro === f.key
                ? "bg-amber-500 dark:bg-[#8b5e2a] text-white"
                : "bg-white dark:bg-[#18110d] text-gray-600 dark:text-[#cbb08b] border border-gray-200 dark:border-[#3a2a1a] hover:border-amber-300"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Lista ── */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <><Skeleton /><Skeleton /><Skeleton /></>
        ) : lista.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#18110d] p-10 text-center shadow-sm">
            <p className="text-gray-400 dark:text-[#7a5c3a]">No hay objetivos en esta categoría.</p>
          </div>
        ) : (
          lista.map((obj) => {
            const dias = diasRestantes(obj.fecha_limite);
            return (
              <button key={obj.id_objetivo} onClick={() => setSelected(obj)}
                className="w-full text-left rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 hover:shadow-md transition-shadow group cursor-pointer">

                {/* Badges */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex gap-2 flex-wrap">
                    {obj.area && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${areaColor[obj.area] ?? "bg-gray-100 text-gray-600 dark:bg-[#2a1a0d] dark:text-[#9a7a5a]"}`}>
                        {obj.area}
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoStyle[obj.estado]}`}>
                      {estadoLabel[obj.estado]}
                    </span>
                  </div>
                  <span className="text-xs text-amber-600 dark:text-[#e8b87a] font-medium group-hover:underline shrink-0">
                    Ver detalle →
                  </span>
                </div>

                {/* Título */}
                <h2 className="mt-2.5 font-bold text-gray-800 dark:text-[#f5deb3]">{obj.titulo}</h2>
                {obj.descripcion && (
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-[#9a7a5a] line-clamp-1">{obj.descripcion}</p>
                )}

                {/* Barra */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-[#9a7a5a]">Progreso</span>
                    <span className={`font-bold ${getProgresoColor(obj.estado)}`}>{obj.progreso}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d]">
                    <div className={`h-full rounded-full transition-all ${getBarColor(obj.estado, obj.progreso)}`}
                      style={{ width: `${obj.progreso}%` }} />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-400 dark:text-[#7a5c3a]">
                  {obj.responsable && <span>👤 {obj.responsable}</span>}
                  {obj.fecha_limite && <span>📅 {formatFecha(obj.fecha_limite)}</span>}
                  {dias !== null && (
                    <span className={dias <= 5 && obj.estado !== "COMPLETADO" ? "text-red-400 font-semibold" : ""}>
                      {dias > 0 ? `⏱ ${dias} días` : "⚠ Vencido"}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}