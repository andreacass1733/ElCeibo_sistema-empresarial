import { useEffect, useState } from "react";
import { useParams } from "react-router";

// ── Tipos según tu BD ──────────────────────────────────────

interface Empleado {
  id: number;
  nombre: string;
  cargo: string;
}

interface EmpleadoCapacitacion {
  id_empleadocapacitacion: number;
  id_empleado: { id_empleado: number; nombre: string };
  id_capacitacion: {
    id_capacitacion: number;
    nombre: string;
    instructor: string;
    fecha_fin: string;
  };
  estado: "INSCRITO" | "COMPLETADO" | "ABANDONADO";
  calificacion: number | null;
}

interface Capacitacion {
  id_capacitacion: number;
  nombre: string;
  instructor: string;
  fecha_fin: string;
  empleadocapacitacion_set: EmpleadoCapacitacion[];
}

interface Objetivo {
  id_objetivo?: number;
  descripcion: string;
  meta: string;
  logrado: string;
  porcentaje: number;
}

interface Metrica {
  id_metrica?: number;
  nombre: string;
  valor: string | number;
  descripcion?: string;
}

// ── Helpers ────────────────────────────────────────────────

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

function estadoChip(estado: string) {
  const estilos: Record<string, string> = {
    COMPLETADO: "bg-emerald-950 text-emerald-400",
    INSCRITO:   "bg-amber-950 text-amber-400",
    ABANDONADO: "bg-red-950 text-red-400",
  };
  const labels: Record<string, string> = {
    COMPLETADO: "Completado",
    INSCRITO:   "En curso",
    ABANDONADO: "Abandonado",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${estilos[estado] ?? ""}`}>
      {labels[estado] ?? estado}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm dark:bg-[#18110d] ${className}`}>
      {children}
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 dark:bg-[#2e2119] ${className}`} />;
}

// ── Componente principal ───────────────────────────────────

type Tab = "capacitaciones" | "objetivos" | "metricas";

export default function EmpleadoHome() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("capacitaciones");

  const [empleado,      setEmpleado]      = useState<Empleado | null>(null);
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [objetivos,     setObjetivos]     = useState<Objetivo[]>([]);
  const [metricas,      setMetricas]      = useState<Metrica[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    Promise.all([
      fetch(`${API}/empleado-actual/${id}/`).then((r) => r.json()),
      fetch(`${API}/capacitaciones/`).then((r) => r.json()),
      fetch(`${API}/objetivos/`).then((r) => r.json()),
      fetch(`${API}/metricas/`).then((r) => r.json()),
    ])
      .then(([emp, caps, objs, mets]) => {
        setEmpleado(emp);
        setCapacitaciones(caps);
        setObjetivos(objs);
        setMetricas(mets);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Capacitaciones del empleado actual (filtradas en el front)
  const misCapacitaciones = capacitaciones.flatMap((cap) =>
    cap.empleadocapacitacion_set
      .filter((ec) => ec.id_empleado?.id_empleado === Number(id))
      .map((ec) => ({
        nombre:      cap.nombre,
        instructor:  cap.instructor,
        fecha_fin:   cap.fecha_fin,
        estado:      ec.estado,
        calificacion: ec.calificacion,
      }))
  );

  const completadas = misCapacitaciones.filter((c) => c.estado === "COMPLETADO").length;
  const enCurso     = misCapacitaciones.filter((c) => c.estado === "INSCRITO").length;
  const califProm   =
    misCapacitaciones.filter((c) => c.calificacion !== null).length > 0
      ? misCapacitaciones
          .filter((c) => c.calificacion !== null)
          .reduce((acc, c) => acc + (c.calificacion ?? 0), 0) /
        misCapacitaciones.filter((c) => c.calificacion !== null).length
      : 0;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "capacitaciones", label: "Mis Capacitaciones", icon: "🎓" },
    { key: "objetivos",      label: "Mis Objetivos",      icon: "🎯" },
    { key: "metricas",       label: "Mis Métricas",       icon: "📊" },
  ];

  return (
    <div className="p-6">

      {/* ── HEADER ── */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-800 dark:bg-[#4B2E1E] dark:text-[#f5c16c]">
          {empleado ? empleado.nombre.slice(0, 2).toUpperCase() : ".."}
        </div>
        <div>
          {loading ? (
            <>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">
                Bienvenido, {empleado?.nombre}
              </h1>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-[#cbb08b]">
                {empleado?.cargo}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-28 mb-3" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </Card>
          ))
        ) : (
          <>
            {[
              { title: "Cursos Activos",     value: enCurso.toString(),             sub: "en progreso" },
              { title: "Cursos Completados", value: completadas.toString(),          sub: "finalizados" },
              { title: "Calificación Prom.", value: `${califProm.toFixed(0)}%`,      sub: "en capacitaciones" },
              { title: "Métricas",           value: metricas.length.toString(),      sub: "registradas" },
            ].map((item) => (
              <Card key={item.title} className="p-5">
                <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{item.title}</p>
                <h2 className="mt-2 text-2xl font-bold text-amber-600 dark:text-[#e8b87a]">{item.value}</h2>
                <p className="mt-1 text-xs text-gray-400 dark:text-[#7a5a3a]">{item.sub}</p>
              </Card>
            ))}
          </>
        )}
      </div>

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

      {/* ── CONTENIDO ── */}
      <Card className="p-5">

        {/* CAPACITACIONES */}
        {tab === "capacitaciones" && (
          loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : misCapacitaciones.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Sin capacitaciones asignadas.</p>
          ) : (
            <div className="space-y-4">
              {misCapacitaciones.map((c, i) => (
                <div key={i} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-[#f5deb3]">{c.nombre}</p>
                      <p className="text-xs text-gray-400 dark:text-[#7a5a3a] mt-0.5">
                        Instructor: {c.instructor} · Finaliza: {c.fecha_fin}
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
                </div>
              ))}
            </div>
          )
        )}

        {/* OBJETIVOS */}
        {tab === "objetivos" && (
          loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : objetivos.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Sin objetivos registrados.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {objetivos.map((o, i) => (
                <div key={i} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-[#f5deb3]">{o.descripcion}</span>
                    <span className="text-xs font-semibold text-amber-600 dark:text-[#e8b87a]">{o.porcentaje}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-[#2e2119]">
                    <div
                      className="h-2 rounded-full bg-amber-500 dark:bg-[#c8804a] transition-all"
                      style={{ width: `${o.porcentaje}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] text-gray-400 dark:text-[#7a5a3a]">
                    <span>Logrado: {o.logrado}</span>
                    <span>Meta: {o.meta}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* MÉTRICAS */}
        {tab === "metricas" && (
          loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : metricas.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Sin métricas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#2e2119]">
                    {["Métrica", "Valor", "Descripción"].map((h) => (
                      <th key={h} className="pb-3 text-left font-medium text-gray-400 dark:text-[#9a7a5a]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metricas.map((m, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-[#1e1408] last:border-0 hover:bg-amber-50/50 dark:hover:bg-[#1e1408] transition-colors">
                      <td className="py-3 font-medium text-gray-700 dark:text-[#e8c080]">{m.nombre}</td>
                      <td className="py-3 font-bold text-amber-600 dark:text-[#e8b87a]">{m.valor}</td>
                      <td className="py-3 text-gray-400 dark:text-[#7a5a3a]">{m.descripcion ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

      </Card>
    </div>
  );
}