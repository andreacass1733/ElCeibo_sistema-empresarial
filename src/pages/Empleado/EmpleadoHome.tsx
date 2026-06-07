import { useEffect, useState } from "react";
import { useParams } from "react-router";

/* =========================================================
   TIPOS
========================================================= */

interface Empleado {
  id: number;
  nombre: string;
  cargo: string;
}

interface CapacitacionEmpleado {
  nombre: string;
  instructor: string;
  fecha_fin: string;
  estado: "INSCRITO" | "COMPLETADO" | "ABANDONADO";
  calificacion: number | null;
}

interface Objetivo {
  descripcion: string;
  meta: string;
  logrado: string;
  porcentaje: number;
}

interface Metrica {
  nombre: string;
  valor: string | number;
  descripcion?: string;
}

/* =========================================================
   API
========================================================= */

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api";

/* =========================================================
   COMPONENTE
========================================================= */

type Tab = "Capacitaciones" | "Objetivos" | "Metricas";

export default function EmpleadoHome() {
  const { id } = useParams<{ id: string }>();

  const [tab, setTab] = useState<Tab>("Capacitaciones");
  const [dark, setDark] = useState(false);

  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [capacitaciones, setCapacitaciones] = useState<CapacitacionEmpleado[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [metricas, setMetricas] = useState<Metrica[]>([]);

  /* =========================================================
     FETCH
  ========================================================= */

  useEffect(() => {
    if (!id) return;

    fetch(`${API}/empleado-dashboard/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Error cargando dashboard");
        return res.json();
      })
      .then((data) => {
        setEmpleado(data.empleado);
        setCapacitaciones(data.capacitaciones || []);
        setObjetivos(data.objetivos || []);
        setMetricas(data.metricas || []);
      })
      .catch(console.error);
  }, [id]);

  /* =========================================================
     THEMES
  ========================================================= */

  const theme = {
    bg: dark ? "bg-[#1a120e]" : "bg-[#f7f3ee]",
    card: dark ? "bg-[#2a1c16]" : "bg-white",
    text: dark ? "text-[#f5deb3]" : "text-[#3a2a1f]",
    muted: dark ? "text-[#c9a27c]" : "text-[#7a5a3a]",
    border: dark ? "border-[#3a2416]" : "border-[#e5d5c5]",
    accent: dark ? "bg-[#7a4b2a]" : "bg-[#b7794b]",
  };

  /* =========================================================
     KPIs
  ========================================================= */

  const completadas =
    capacitaciones.filter((c) => c.estado === "COMPLETADO").length;

  const enCurso =
    capacitaciones.filter((c) => c.estado === "INSCRITO").length;

  const promedio =
    capacitaciones.length > 0
      ? capacitaciones
          .filter((c) => c.calificacion !== null)
          .reduce((a, b) => a + (b.calificacion || 0), 0) /
        capacitaciones.filter((c) => c.calificacion !== null).length
      : 0;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className={`${theme.bg} min-h-screen p-6 transition-all`}>

      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">

        <div>
          <h1 className={`text-2xl font-bold ${theme.text}`}>
            Bienvenido {empleado?.nombre || "..."}
          </h1>

          <p className={theme.muted}>
            {empleado?.cargo}
          </p>
        </div>

        {/* TOGGLE */}
        <button
          onClick={() => setDark(!dark)}
          className={`px-4 py-2 rounded-full text-sm border ${theme.border} ${theme.card}`}
        >
          {dark ? "☀️ Claro" : "🌙 Oscuro"}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">

        {[{
          title: "Activos",
          value: enCurso
        }, {
          title: "Completados",
          value: completadas
        }, {
          title: "Promedio",
          value: `${promedio.toFixed(0)}%`
        }, {
          title: "Métricas",
          value: metricas.length
        }].map((k) => (
          <div
            key={k.title}
            className={`p-4 rounded-xl border ${theme.border} ${theme.card}`}
          >
            <p className={theme.muted}>{k.title}</p>
            <p className={`text-xl font-bold ${theme.text}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-4">

        {["Capacitaciones", "Objetivos", "Metricas"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as Tab)}
            className={`px-4 py-2 rounded-full text-sm border transition
              ${theme.border}
              ${
                tab === t
                  ? `${theme.accent} text-white`
                  : `${theme.card} ${theme.text}`
              }
            `}
          >
            {t}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className={`p-5 rounded-2xl border ${theme.border} ${theme.card}`}>

        {/* CAPACITACIONES */}
        {tab === "Capacitaciones" && (
          <div className="space-y-3">

            {capacitaciones.map((c, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border ${theme.border}`}
              >
                <h3 className={theme.text}>{c.nombre}</h3>
                <p className={theme.muted}>{c.instructor}</p>
                <p className={theme.muted}>{c.fecha_fin}</p>

                <span className={`text-xs px-2 py-1 rounded-full inline-block mt-2 ${theme.accent} text-white`}>
                  {c.estado}
                </span>

                {c.calificacion !== null && (
                  <p className={theme.text}>
                    {c.calificacion}/100
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* OBJETIVOS */}
        {tab === "Objetivos" && (
          <div className="space-y-4">

            {objetivos.map((o, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm">
                  <span className={theme.text}>{o.descripcion}</span>
                  <span className={theme.muted}>{o.porcentaje}%</span>
                </div>

                <div className={`h-2 rounded-full ${dark ? "bg-[#3a2416]" : "bg-[#e7d7c8]"}`}>
                  <div
                    className={`h-2 rounded-full ${theme.accent}`}
                    style={{ width: `${o.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* METRICAS */}
        {tab === "Metricas" && (
          <table className="w-full text-sm">

            <thead>
              <tr className={theme.muted}>
                <th>Métrica</th>
                <th>Valor</th>
                <th>Descripción</th>
              </tr>
            </thead>

            <tbody>
              {metricas.map((m, i) => (
                <tr key={i} className={`border-t ${theme.border}`}>
                  <td className={theme.text}>{m.nombre}</td>
                  <td className={theme.text}>{m.valor}</td>
                  <td className={theme.muted}>{m.descripcion || "—"}</td>
                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>
    </div>
  );
}