"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router";

// ─── Tipos ────────────────────────────────────────────────
interface CapacitacionAPI {
  nombre: string;
  instructor: string;
  estado: string;
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
  capacitaciones: CapacitacionAPI[];
}

// ─── Helpers ──────────────────────────────────────────────
function formatFecha(f: string) {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-BO", {
    day: "numeric", month: "long", year: "numeric",
  });
}
function formatFechaCorta(f: string) {
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
function codigoConstancia(idx: number, fechaFin: string) {
  const year = fechaFin ? new Date(fechaFin).getFullYear() : new Date().getFullYear();
  return `CONST-${year}-${String(idx + 1).padStart(3, "0")}`;
}

// ─── Vista previa modal ───────────────────────────────────
function VistaConstancia({
  cap,
  empleado,
  codigo,
  onClose,
}: {
  cap: CapacitacionAPI;
  empleado: EmpleadoAPI;
  codigo: string;
  onClose: () => void;
}) {
  const nota = getNota(cap.calificacion ?? 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl">

        {/* Acciones */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors">
            ← Volver
          </button>
          <button onClick={() => alert(`Descargando: ${codigo}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 dark:bg-[#8b5e2a] hover:bg-amber-600 text-white text-sm font-semibold transition-colors">
            ⬇ Descargar PDF
          </button>
        </div>

        {/* Documento */}
        <div className="rounded-2xl bg-white dark:bg-[#f5ede0] shadow-2xl overflow-hidden max-h-[82vh] overflow-y-auto">
          <div className="h-3 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

          <div className="px-10 py-8">
            {/* Encabezado empresa */}
            <div className="text-center border-b-2 border-amber-200 pb-5 mb-6">
              <div className="flex items-center justify-center gap-3 mb-1">
                <span className="text-3xl">🍫</span>
                <div>
                  <p className="text-xs font-bold tracking-widest text-amber-700 uppercase">Chocolates</p>
                  <p className="text-2xl font-black text-amber-900 leading-none">DelCacao</p>
                </div>
              </div>
              <p className="text-xs text-amber-600 tracking-wide">Empresa Chocolatera — Gestión de Talento Humano</p>
            </div>

            {/* Título */}
            <div className="text-center mb-6">
              <p className="text-xs font-bold tracking-[0.3em] text-amber-700 uppercase mb-1">Otorga la presente</p>
              <h1 className="text-3xl font-black text-amber-900 uppercase tracking-wide">Constancia</h1>
              <p className="text-xs text-gray-500 mt-1">de Participación y Aprobación</p>
            </div>

            {/* Cuerpo */}
            <div className="text-center space-y-4 text-gray-700">
              <p className="text-sm">A quien corresponda, se hace constar que:</p>

              <div className="inline-block border-b-2 border-amber-400 pb-1">
                <p className="text-2xl font-black text-amber-900">{empleado.nombre}</p>
                <p className="text-xs text-gray-500">{empleado.cargo}</p>
              </div>

              <p className="text-sm leading-relaxed">
                participó y aprobó satisfactoriamente el curso de capacitación:
              </p>

              <div className="mx-auto max-w-sm rounded-xl bg-amber-50 border border-amber-200 px-6 py-4">
                <p className="text-lg font-black text-amber-900">"{cap.nombre}"</p>
                <p className="text-xs text-amber-700 mt-1">🎓 Instructor: {cap.instructor}</p>
              </div>

              <div className="flex justify-center gap-8 text-sm">
                {cap.duracion_dias != null && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Duración</p>
                    <p className="font-bold text-amber-900">{cap.duracion_dias} días</p>
                  </div>
                )}
                {cap.fecha_inicio && cap.fecha_fin && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Período</p>
                    <p className="font-bold text-amber-900">
                      {formatFechaCorta(cap.fecha_inicio)} – {formatFechaCorta(cap.fecha_fin)}
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Calificación</p>
                  <p className={`font-black text-lg ${nota.color}`}>{cap.calificacion}/100</p>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Emitido en La Paz, Bolivia, el {formatFecha(cap.fecha_fin)}.
              </p>
            </div>

            {/* Firmas */}
            <div className="mt-8 flex justify-around">
              {["Recursos Humanos", "Gerencia General"].map((firma) => (
                <div key={firma} className="text-center">
                  <div className="w-32 border-b border-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">{firma}</p>
                  <p className="text-xs font-semibold text-amber-900">Chocolates DelCacao</p>
                </div>
              ))}
            </div>

            {/* Código */}
            <div className="mt-6 flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5">
              <div>
                <p className="text-xs text-gray-400">Código de verificación</p>
                <p className="text-xs font-mono font-bold text-gray-700">{codigo}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Documento válido</p>
                <p className="text-xs text-green-600 font-semibold">✓ Autenticado</p>
              </div>
            </div>
          </div>

          <div className="h-3 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#18110d] p-5 shadow-sm animate-pulse flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#2a1a0d] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-gray-100 dark:bg-[#2a1a0d]" />
        <div className="h-4 w-48 rounded bg-gray-200 dark:bg-[#3a2a1a]" />
        <div className="h-3 w-36 rounded bg-gray-100 dark:bg-[#2a1a0d]" />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function EmpleadoConstancias() {
  const { id } = useParams<{ id: string }>();
  const empleadoId = parseInt(id ?? "1", 10);

  const [empleado, setEmpleado]       = useState<EmpleadoAPI | null>(null);
  const [constancias, setConstancias] = useState<CapacitacionAPI[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [vista, setVista]             = useState<{ cap: CapacitacionAPI; idx: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/api/empleado-dashboard/${empleadoId}/`)
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json() as Promise<DashboardResponse>; })
      .then((data) => {
        setEmpleado(data.empleado);
        // Solo cursos completados con calificación
        setConstancias(
          data.capacitaciones.filter(
            (c) => c.estado === "COMPLETADO" && c.calificacion !== null
          )
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [empleadoId]);

  return (
    <div className="p-6">
      {vista && empleado && (
        <VistaConstancia
          cap={vista.cap}
          empleado={empleado}
          codigo={codigoConstancia(vista.idx, vista.cap.fecha_fin)}
          onClose={() => setVista(null)}
        />
      )}

      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">Constancias</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-[#cbb08b]">
        Documentos de aprobación de capacitaciones.
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          No se pudo cargar: {error}
        </div>
      )}

      {/* Perfil */}
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
            <p className="text-2xl font-black text-amber-600 dark:text-[#e8b87a]">{constancias.length}</p>
            <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">constancias</p>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="mt-5 space-y-3">
        {loading ? (
          <><Skeleton /><Skeleton /><Skeleton /></>
        ) : constancias.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#18110d] p-10 text-center shadow-sm">
            <p className="text-gray-400 dark:text-[#7a5c3a]">No hay constancias disponibles aún.</p>
            <p className="text-xs text-gray-300 dark:text-[#5a3a2a] mt-1">
              Se generan al completar y aprobar un curso.
            </p>
          </div>
        ) : (
          constancias.map((c, idx) => {
            const nota = getNota(c.calificacion ?? 0);
            const codigo = codigoConstancia(idx, c.fecha_fin);
            return (
              <div key={idx}
                className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex items-center gap-4">

                {/* Medalla */}
                <div className="w-12 h-12 shrink-0 rounded-full bg-amber-50 dark:bg-[#2a1a0d] flex items-center justify-center">
                  <span className="text-xl">🎖</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono text-gray-400 dark:text-[#7a5c3a]">{codigo}</span>
                  </div>
                  <p className="font-bold text-gray-800 dark:text-[#f5deb3] truncate">{c.nombre}</p>
                  <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-gray-500 dark:text-[#9a7a5a]">
                    <span>🎓 {c.instructor}</span>
                    {c.fecha_fin && <span>📅 Emitida: {formatFechaCorta(c.fecha_fin)}</span>}
                    <span className={`font-semibold ${nota.color}`}>
                      ✓ {c.calificacion}/100 — {nota.label}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => setVista({ cap: c, idx })}
                    className="px-4 py-1.5 rounded-xl border border-amber-300 dark:border-[#5a3a1a] text-amber-700 dark:text-[#e8b87a] text-xs font-semibold hover:bg-amber-50 dark:hover:bg-[#2a1a0d] transition-colors">
                    Vista previa
                  </button>
                  <button
                    onClick={() => alert(`Descargando: ${codigo}`)}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 dark:bg-[#8b5e2a] hover:bg-amber-600 text-white text-xs font-semibold transition-colors">
                    ⬇ PDF
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}