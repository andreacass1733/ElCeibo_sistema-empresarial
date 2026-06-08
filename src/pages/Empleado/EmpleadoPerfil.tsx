"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router";

// ─── Tipos ────────────────────────────────────────────────
interface EmpleadoAPI {
  id: number;
  nombre: string;
  cargo: string;
}

interface Resumen {
  cursos_completados: number;
  cursos_total: number;
  calificacion_prom: number | null;
  producciones_total: number;
  ventas_total: number;
}

interface CapacitacionAPI {
  nombre: string;
  estado: "COMPLETADO" | "INSCRITO" | "ABANDONADO";
  calificacion: number | null;
  fecha_fin: string | null;
}

interface ProduccionAPI {
  fecha: string | null;
  cantidad: number;
  producto: string;
}

interface VentaAPI {
  fecha: string | null;
  items: number;
  total: number;
  sucursal: string;
}

interface PerfilResponse {
  empleado: EmpleadoAPI;
  resumen: Resumen;
  capacitaciones: CapacitacionAPI[];
  producciones: ProduccionAPI[];
  ventas: VentaAPI[];
}

// ─── Helpers ──────────────────────────────────────────────
function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function formatFecha(f: string | null) {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-BO", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function estadoChip(estado: string) {
  const styles: Record<string, string> = {
    COMPLETADO: "bg-emerald-950 text-emerald-400",
    INSCRITO:   "bg-amber-950 text-amber-400",
    ABANDONADO: "bg-red-950 text-red-400",
    Activo:     "bg-emerald-950 text-emerald-400",
  };
  const labels: Record<string, string> = {
    COMPLETADO: "Completado", INSCRITO: "En curso",
    ABANDONADO: "Abandonado", Activo: "Activo",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${styles[estado] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[estado] ?? estado}
    </span>
  );
}

function Campo({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-[#120c08] p-4">
      <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">{label}</p>
      <p className="mt-1 font-semibold text-gray-800 dark:text-[#f5deb3] text-sm">{value}</p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
function SkeletonBanner() {
  return (
    <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm overflow-hidden animate-pulse">
      <div className="h-24 bg-gray-200 dark:bg-[#2a1a0d]" />
      <div className="px-6 pb-6 pt-4 space-y-3">
        <div className="h-6 w-40 rounded bg-gray-200 dark:bg-[#2a1a0d]" />
        <div className="h-4 w-56 rounded bg-gray-100 dark:bg-[#1e1408]" />
      </div>
    </div>
  );
}

type Tab = "info" | "capacitaciones" | "actividad";

// ─── Componente principal ─────────────────────────────────
export default function EmpleadoPerfil() {
  const { id } = useParams<{ id: string }>();
  const empleadoId = parseInt(id ?? "1", 10);

  const [data, setData]       = useState<PerfilResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tab, setTab]         = useState<Tab>("info");

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/api/empleado-perfil/${empleadoId}/`)
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json() as Promise<PerfilResponse>; })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [empleadoId]);

  const emp = data?.empleado;
  const res = data?.resumen;

  // Tabs dinámicos según el rol: si tiene producciones → "Producción", si tiene ventas → "Ventas"
  const tieneProduccion = (data?.producciones?.length ?? 0) > 0;
  const tieneVentas     = (data?.ventas?.length ?? 0) > 0;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "info",          label: "Información",    icon: "👤" },
    { key: "capacitaciones",label: "Capacitaciones", icon: "🎓" },
    { key: "actividad",     label: tieneProduccion ? "Producción" : tieneVentas ? "Ventas" : "Actividad", icon: tieneProduccion ? "🏭" : "💰" },
  ];

  // KPIs según el cargo
  const kpis = res ? [
    { label: "Cursos completados", value: `${res.cursos_completados}/${res.cursos_total}`, icon: "🎓" },
    { label: "Calificación prom.", value: res.calificacion_prom !== null ? `${res.calificacion_prom}%` : "N/A", icon: "⭐" },
    { label: tieneProduccion ? "Unidades producidas" : "Ventas registradas",
      value: tieneProduccion ? res.producciones_total.toString() : res.ventas_total.toString(),
      icon: tieneProduccion ? "🏭" : "💰" },
  ] : [];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">Mi Perfil</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-[#9a7a5a]">
        Información personal y registro de actividad.
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          No se pudo cargar: {error}
        </div>
      )}

      {/* ── Banner + avatar ── */}
      {loading ? <SkeletonBanner /> : emp && (
        <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-amber-800 to-amber-600 dark:from-[#2e1408] dark:to-[#4B2E1E]" />
          <div className="px-6 pb-6">
            <div className="-mt-12 mb-4 flex items-end justify-between flex-wrap gap-3">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white dark:border-[#18110d] bg-amber-100 dark:bg-[#4B2E1E] text-2xl font-bold text-amber-800 dark:text-[#f5c16c]">
                {iniciales(emp.nombre)}
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400">
                Activo
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">{emp.nombre}</h2>
            <p className="text-gray-500 dark:text-[#9a7a5a] text-sm mt-0.5">{emp.cargo}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-[#2e1408] dark:text-[#e8b87a]">
                {emp.cargo}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── KPIs ── */}
      {!loading && kpis.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl bg-white dark:bg-[#18110d] p-4 shadow-sm text-center">
              <span className="text-2xl">{k.icon}</span>
              <p className="mt-2 text-xl font-bold text-amber-600 dark:text-[#e8b87a]">{k.value}</p>
              <p className="text-xs text-gray-400 dark:text-[#7a5c3a] mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm cursor-pointer transition-colors
              ${tab === t.key
                ? "bg-amber-600 text-white dark:bg-[#4B2E1E] dark:text-[#f5c16c]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1e1408] dark:text-[#9a7a5a]"
              }`}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ── Contenido tabs ── */}
      <div className="mt-4 rounded-2xl bg-white dark:bg-[#18110d] p-6 shadow-sm">

        {/* INFO */}
        {tab === "info" && emp && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Nombre completo" value={emp.nombre} />
            <Campo label="Cargo"           value={emp.cargo} />
            <Campo label="ID Empleado"     value={`#${emp.id}`} />
            <Campo label="Estado"          value={estadoChip("Activo")} />
          </div>
        )}

        {/* CAPACITACIONES */}
        {tab === "capacitaciones" && (
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-400 dark:text-[#7a5c3a]">Cargando...</p>
            ) : data?.capacitaciones.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-[#7a5c3a]">Sin capacitaciones registradas.</p>
            ) : (
              data?.capacitaciones.map((c, i) => (
                <div key={i} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-[#f5deb3] text-sm">{c.nombre}</p>
                      <p className="text-xs text-gray-400 dark:text-[#7a5c3a] mt-0.5">
                        {c.estado === "COMPLETADO" ? `Completado el ${formatFecha(c.fecha_fin)}` : `Finaliza: ${formatFecha(c.fecha_fin)}`}
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
                        <div className="h-1.5 w-2/5 rounded-full bg-amber-500 dark:bg-[#c8804a]" />
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-[#7a5c3a] mt-1">En progreso</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ACTIVIDAD — Producción o Ventas según rol */}
        {tab === "actividad" && (
          <>
            {loading ? (
              <p className="text-sm text-gray-400 dark:text-[#7a5c3a]">Cargando...</p>
            ) : tieneProduccion ? (
              /* PRODUCCIÓN */
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-[#2e2119]">
                        {["Producto", "Cantidad", "Fecha"].map((h) => (
                          <th key={h} className="pb-3 text-left font-medium text-gray-400 dark:text-[#9a7a5a]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data?.producciones.map((p, i) => (
                        <tr key={i} className="border-b border-gray-50 dark:border-[#1e1408] last:border-0 hover:bg-amber-50/50 dark:hover:bg-[#1e1408] transition-colors">
                          <td className="py-3 text-gray-700 dark:text-[#e8c080]">{p.producto}</td>
                          <td className="py-3 font-semibold text-gray-800 dark:text-[#f5deb3]">{p.cantidad} u.</td>
                          <td className="py-3 text-gray-400 dark:text-[#7a5c3a]">{formatFecha(p.fecha)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 rounded-xl bg-amber-50 dark:bg-[#1e1408] px-4 py-3 flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-[#9a7a5a]">Total producido</span>
                  <span className="font-bold text-amber-600 dark:text-[#e8b87a]">
                    {data?.producciones.reduce((a, p) => a + p.cantidad, 0)} unidades
                  </span>
                </div>
              </>
            ) : tieneVentas ? (
              /* VENTAS */
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-[#2e2119]">
                        {["Sucursal", "Items", "Total", "Fecha"].map((h) => (
                          <th key={h} className="pb-3 text-left font-medium text-gray-400 dark:text-[#9a7a5a]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data?.ventas.map((v, i) => (
                        <tr key={i} className="border-b border-gray-50 dark:border-[#1e1408] last:border-0 hover:bg-amber-50/50 dark:hover:bg-[#1e1408] transition-colors">
                          <td className="py-3 text-gray-700 dark:text-[#e8c080]">{v.sucursal}</td>
                          <td className="py-3 text-gray-600 dark:text-[#9a7a5a]">{v.items}</td>
                          <td className="py-3 font-semibold text-gray-800 dark:text-[#f5deb3]">Bs {v.total.toLocaleString()}</td>
                          <td className="py-3 text-gray-400 dark:text-[#7a5c3a]">{formatFecha(v.fecha)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 rounded-xl bg-amber-50 dark:bg-[#1e1408] px-4 py-3 flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-[#9a7a5a]">Total ventas</span>
                  <span className="font-bold text-amber-600 dark:text-[#e8b87a]">
                    Bs {data?.ventas.reduce((a, v) => a + v.total, 0).toLocaleString()}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 dark:text-[#7a5c3a]">Sin actividad registrada.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}