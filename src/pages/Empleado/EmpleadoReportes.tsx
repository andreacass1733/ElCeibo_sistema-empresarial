"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router";

// ─── Tipos ────────────────────────────────────────────────
type StatItem = { label?: string; valor?: string | number; l?: string; n?: string | number };

type DetalleJSON = {
  section?: string;
  headers?: string[];
  rows?: (string | number)[][];
  stats?: StatItem[];
  [key: string]: unknown;
};

interface ReporteAPI {
  id_reporte: number;
  nombre: string;
  categoria: string | null;
  fecha: string | null;
  estado: string;
  detalle: DetalleJSON | string | null;
}

interface EmpleadoAPI {
  id: number;
  nombre: string;
  cargo: string;
}

// ─── Helpers ──────────────────────────────────────────────
function formatFecha(f: string | null) {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-BO", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function parseDetalle(detalle: DetalleJSON | string | null): DetalleJSON | null {
  if (!detalle) return null;
  if (typeof detalle === "string") {
    try { return JSON.parse(detalle); } catch { return null; }
  }
  return detalle;
}

const estadoBadge: Record<string, string> = {
  listo:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  generando: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  pendiente: "bg-gray-100 text-gray-500 dark:bg-[#2a1a0d] dark:text-[#9a7a5a]",
  LISTO:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  GENERANDO: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  PENDIENTE: "bg-gray-100 text-gray-500 dark:bg-[#2a1a0d] dark:text-[#9a7a5a]",
};

const categoriaColor: Record<string, string> = {
  asistencia:     "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  productividad:  "bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a]",
  capacitaciones: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  ventas:         "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  general:        "bg-gray-100 text-gray-700 dark:bg-[#2a1a0d] dark:text-[#9a7a5a]",
};

const categoriaIcono: Record<string, string> = {
  asistencia: "📅", productividad: "⚡", capacitaciones: "📚",
  ventas: "💰", general: "📋",
};

function getIcono(c: string | null) {
  return categoriaIcono[(c ?? "").toLowerCase()] ?? "📄";
}
function getCategoriaBadge(c: string | null) {
  return categoriaColor[(c ?? "").toLowerCase()] ?? "bg-gray-100 text-gray-600 dark:bg-[#2a1a0d] dark:text-[#9a7a5a]";
}

// ─── Renderizador del detalle JSON ────────────────────────
function DetalleReporte({ detalle }: { detalle: DetalleJSON }) {
  return (
    <div className="mb-5 space-y-4">
      {/* Sección / título del bloque */}
      {detalle.section && (
        <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
          {detalle.section}
        </p>
      )}

      {/* Stats: array de {label, valor} */}
      {detalle.stats && detalle.stats.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          {detalle.stats.map((s, i) => (
            <div key={i}
              className={`rounded-xl px-4 py-3 ${i % 2 === 0 ? "bg-gray-50 border border-gray-200" : "bg-amber-50 border border-amber-200"}`}>
              <p className="text-xs text-gray-400">{s.label ?? s.l}</p>
              <p className="text-base font-black text-amber-900">{String(s.valor ?? s.n)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabla: headers + rows */}
      {detalle.headers && detalle.rows && detalle.rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-amber-50 border-b border-amber-200">
                {detalle.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-bold text-amber-800 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detalle.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Campos clave-valor simples (cualquier otro campo string/number) */}
      {(() => {
        const simples = Object.entries(detalle).filter(
          ([k, v]) => !["section", "headers", "rows", "stats"].includes(k) && typeof v !== "object"
        );
        if (simples.length === 0) return null;
        return (
          <div className="grid grid-cols-2 gap-2.5">
            {simples.map(([label, valor], i) => (
              <div key={label}
                className={`rounded-xl px-4 py-3 ${i % 2 === 0 ? "bg-gray-50 border border-gray-200" : "bg-amber-50 border border-amber-200"}`}>
                <p className="text-xs text-gray-400 capitalize">{label}</p>
                <p className="text-sm font-bold text-amber-900">{String(valor)}</p>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

// ─── Modal vista previa ───────────────────────────────────
function ModalReporte({ rep, empleado, onClose }: {
  rep: ReporteAPI; empleado: EmpleadoAPI; onClose: () => void;
}) {
  const [descargando, setDescargando] = useState(false);
  const detalle = parseDetalle(rep.detalle);
  const codigoDoc = rep.id_reporte ? `RPT-${String(rep.id_reporte).padStart(3, "0")}-${(rep.fecha ?? "").replace(/-/g, "")}` : "RPT-000";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-auto">

        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="text-sm text-white/80 hover:text-white transition-colors">
            ← Volver
          </button>
          <button onClick={() => { setDescargando(true); setTimeout(() => { setDescargando(false); alert(`✓ ${rep.nombre} descargado.`); }, 1500); }}
            disabled={descargando}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 dark:bg-[#8b5e2a] hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
            {descargando ? "⏳ Descargando..." : "⬇ Descargar PDF"}
          </button>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#f5ede0] shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto">
          <div className="h-3 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700" />

          <div className="px-8 py-7">
            {/* Encabezado empresa */}
            <div className="flex items-center justify-between border-b-2 border-amber-200 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🍫</span>
                <div>
                  <p className="text-xs font-black tracking-widest text-amber-700 uppercase">Chocolates</p>
                  <p className="text-xl font-black text-amber-900 leading-none">DelCacao</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Generado el</p>
                <p className="text-sm font-bold text-amber-900">{formatFecha(rep.fecha)}</p>
              </div>
            </div>

            {/* Título */}
            <div className="text-center mb-6">
              {rep.categoria && (
                <p className="text-xs font-bold tracking-[0.25em] text-amber-700 uppercase capitalize">
                  {rep.categoria}
                </p>
              )}
              <h1 className="text-2xl font-black text-amber-900 mt-1">{rep.nombre}</h1>
            </div>

            {/* Empleado */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 mb-5">
              <p className="text-xs text-amber-700 font-bold uppercase tracking-wide mb-2">Empleado</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Nombre</p>
                  <p className="font-bold text-amber-900">{empleado.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cargo</p>
                  <p className="font-bold text-amber-900">{empleado.cargo}</p>
                </div>
              </div>
            </div>

            {/* Detalle inteligente */}
            {detalle ? (
              <>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-3">
                  Resumen del reporte
                </p>
                <DetalleReporte detalle={detalle} />
              </>
            ) : (
              <div className="mb-5 rounded-xl bg-gray-50 border border-gray-200 px-4 py-4 text-center">
                <p className="text-sm text-gray-400">Sin datos de resumen disponibles.</p>
              </div>
            )}

            {/* Firmas */}
            <div className="mt-6 flex justify-around">
              {["Recursos Humanos", "Supervisor directo"].map((f) => (
                <div key={f} className="text-center">
                  <div className="w-28 border-b border-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">{f}</p>
                  <p className="text-xs font-bold text-amber-900">Chocolates DelCacao</p>
                </div>
              ))}
            </div>

            {/* Código */}
            <div className="mt-5 rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Código de documento</p>
                <p className="text-xs font-mono font-bold text-gray-700">{codigoDoc}</p>
              </div>
              <p className="text-xs text-green-600 font-semibold">✓ Verificado</p>
            </div>
          </div>

          <div className="h-3 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700" />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#18110d] p-5 shadow-sm animate-pulse flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-[#2a1a0d] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-20 rounded-full bg-gray-100 dark:bg-[#2a1a0d]" />
        <div className="h-4 w-48 rounded bg-gray-200 dark:bg-[#3a2a1a]" />
        <div className="h-3 w-32 rounded bg-gray-100 dark:bg-[#2a1a0d]" />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function EmpleadoReportes() {
  const { id } = useParams<{ id: string }>();
  const empleadoId = parseInt(id ?? "1", 10);

  const [empleado, setEmpleado]     = useState<EmpleadoAPI | null>(null);
  const [reportes, setReportes]     = useState<ReporteAPI[]>([]);
  const [loadingEmp, setLoadingEmp] = useState(true);
  const [loadingRep, setLoadingRep] = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [selected, setSelected]     = useState<ReporteAPI | null>(null);
  const [filtro, setFiltro]         = useState("Todos");
  const [descargandoId, setDescargandoId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/empleado-actual/${empleadoId}/`)
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then(setEmpleado)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingEmp(false));
  }, [empleadoId]);

  useEffect(() => {
    fetch(`http://localhost:8000/api/reportes/`)
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then((data: ReporteAPI[]) => setReportes(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingRep(false));
  }, []);

  const loading = loadingEmp || loadingRep;
  const categorias = ["Todos", ...Array.from(new Set(reportes.map((r) => r.categoria ?? "general")))];
  const lista = filtro === "Todos" ? reportes : reportes.filter((r) => (r.categoria ?? "general") === filtro);
  const periodos = Array.from(new Set(
    lista.map((r) => r.fecha
      ? new Date(r.fecha).toLocaleDateString("es-BO", { month: "long", year: "numeric" })
      : "Sin fecha"
    )
  ));

  return (
    <div className="p-6">
      {selected && empleado && (
        <ModalReporte rep={selected} empleado={empleado} onClose={() => setSelected(null)} />
      )}

      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">Mis Reportes</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-[#cbb08b]">
        Documentos generados de actividad laboral.
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          No se pudo cargar: {error}
        </div>
      )}

      {/* Perfil */}
      {!loadingEmp && empleado && (
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
            <p className="text-3xl font-black text-amber-600 dark:text-[#e8b87a]">
              {loading ? "—" : reportes.length}
            </p>
            <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">reportes</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      {!loading && (
        <div className="mt-5 flex flex-wrap gap-2">
          {categorias.map((cat) => (
            <button key={cat} onClick={() => setFiltro(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                filtro === cat
                  ? "bg-amber-500 dark:bg-[#8b5e2a] text-white"
                  : "bg-white dark:bg-[#18110d] text-gray-600 dark:text-[#cbb08b] border border-gray-200 dark:border-[#3a2a1a] hover:border-amber-300"
              }`}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Lista agrupada por período */}
      <div className="mt-5 space-y-6">
        {loading ? (
          <><Skeleton /><Skeleton /><Skeleton /></>
        ) : lista.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#18110d] p-10 text-center shadow-sm">
            <p className="text-gray-400 dark:text-[#7a5c3a]">No hay reportes disponibles.</p>
          </div>
        ) : (
          periodos.map((periodo) => (
            <div key={periodo}>
              <p className="text-xs font-bold text-gray-500 dark:text-[#9a7a5a] uppercase tracking-widest mb-3 capitalize">
                📆 {periodo}
              </p>
              <div className="space-y-3">
                {lista
                  .filter((r) => {
                    const p = r.fecha
                      ? new Date(r.fecha).toLocaleDateString("es-BO", { month: "long", year: "numeric" })
                      : "Sin fecha";
                    return p === periodo;
                  })
                  .map((rep) => (
                    <div key={rep.id_reporte}
                      className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex items-center gap-4">
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-amber-50 dark:bg-[#2a1a0d] flex items-center justify-center text-2xl">
                        {getIcono(rep.categoria)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {rep.categoria && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${getCategoriaBadge(rep.categoria)}`}>
                              {rep.categoria}
                            </span>
                          )}
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoBadge[rep.estado] ?? "bg-gray-100 text-gray-500"}`}>
                            {rep.estado}
                          </span>
                        </div>
                        <p className="font-bold text-gray-800 dark:text-[#f5deb3] truncate">{rep.nombre}</p>
                        <p className="text-xs text-gray-500 dark:text-[#9a7a5a] mt-0.5">
                          🗓 {formatFecha(rep.fecha)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => setSelected(rep)}
                          className="px-4 py-1.5 rounded-xl border border-amber-300 dark:border-[#5a3a1a] text-amber-700 dark:text-[#e8b87a] text-xs font-semibold hover:bg-amber-50 dark:hover:bg-[#2a1a0d] transition-colors">
                          Vista previa
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDescargandoId(rep.id_reporte); setTimeout(() => { setDescargandoId(null); alert(`✓ ${rep.nombre} descargado.`); }, 1500); }}
                          disabled={descargandoId === rep.id_reporte}
                          className="px-4 py-1.5 rounded-xl bg-amber-500 dark:bg-[#8b5e2a] hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-semibold transition-colors">
                          {descargandoId === rep.id_reporte ? "⏳..." : "⬇ PDF"}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}