"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router";

// ─── Tipos ────────────────────────────────────────────────
type Mes = { mes: string; valor: number };
type Metrica = {
  id: string;
  label: string;
  valor: number;
  meta: number;
  descripcion: string;
  historico: Mes[];
  icono: string;
};

interface EmpleadoAPI {
  id: number;
  nombre: string;
  cargo: string;
}

// ─── Métricas base (se personalizan con datos reales cuando estén disponibles) ──
const METRICAS_BASE: Metrica[] = [
  {
    id: "productividad",
    label: "Productividad",
    valor: 87, meta: 85,
    descripcion: "Relación entre tareas realizadas y objetivo mensual asignado.",
    icono: "⚡",
    historico: [
      { mes: "Ene", valor: 78 }, { mes: "Feb", valor: 80 },
      { mes: "Mar", valor: 83 }, { mes: "Abr", valor: 85 }, { mes: "May", valor: 87 },
    ],
  },
  {
    id: "puntualidad",
    label: "Puntualidad",
    valor: 95, meta: 90,
    descripcion: "Porcentaje de días en que el empleado llegó a tiempo a su turno.",
    icono: "🕐",
    historico: [
      { mes: "Ene", valor: 88 }, { mes: "Feb", valor: 90 },
      { mes: "Mar", valor: 92 }, { mes: "Abr", valor: 94 }, { mes: "May", valor: 95 },
    ],
  },
  {
    id: "equipo",
    label: "Trabajo en equipo",
    valor: 91, meta: 80,
    descripcion: "Evaluación de colaboración con compañeros.",
    icono: "🤝",
    historico: [
      { mes: "Ene", valor: 82 }, { mes: "Feb", valor: 84 },
      { mes: "Mar", valor: 87 }, { mes: "Abr", valor: 89 }, { mes: "May", valor: 91 },
    ],
  },
  {
    id: "atencion",
    label: "Atención al cliente",
    valor: 94, meta: 88,
    descripcion: "Calificación promedio recibida de clientes atendidos en el mes.",
    icono: "⭐",
    historico: [
      { mes: "Ene", valor: 85 }, { mes: "Feb", valor: 88 },
      { mes: "Mar", valor: 90 }, { mes: "Abr", valor: 92 }, { mes: "May", valor: 94 },
    ],
  },
  {
    id: "capacitacion",
    label: "Avance en capacitaciones",
    valor: 75, meta: 100,
    descripcion: "Porcentaje de cursos obligatorios completados en el semestre.",
    icono: "📚",
    historico: [
      { mes: "Ene", valor: 20 }, { mes: "Feb", valor: 40 },
      { mes: "Mar", valor: 60 }, { mes: "Abr", valor: 60 }, { mes: "May", valor: 75 },
    ],
  },
  {
    id: "objetivos",
    label: "Cumplimiento de objetivos",
    valor: 80, meta: 100,
    descripcion: "Porcentaje de objetivos personales completados o en buen avance.",
    icono: "🎯",
    historico: [
      { mes: "Ene", valor: 50 }, { mes: "Feb", valor: 60 },
      { mes: "Mar", valor: 65 }, { mes: "Abr", valor: 72 }, { mes: "May", valor: 80 },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────
function getColor(val: number, meta: number) {
  const ratio = val / meta;
  if (ratio >= 1)    return { bar: "bg-green-500",              text: "text-green-600 dark:text-green-400",   label: "Meta alcanzada ✓" };
  if (ratio >= 0.85) return { bar: "bg-amber-500 dark:bg-[#c87941]", text: "text-amber-600 dark:text-[#e8b87a]",  label: "Buen avance" };
  return               { bar: "bg-red-400",                    text: "text-red-500 dark:text-red-400",       label: "Por mejorar" };
}

function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

// ─── Sparkline ────────────────────────────────────────────
function Sparkline({ data, colorKey }: { data: Mes[]; colorKey: "green" | "amber" | "red" }) {
  const w = 100, h = 36, pad = 4;
  const vals = data.map((d) => d.valor);
  const min = Math.min(...vals) - 2, max = Math.max(...vals) + 2;
  const px = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const py = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const d = data.map((p, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(p.valor)}`).join(" ");
  const area = `${d} L ${px(data.length - 1)} ${h} L ${px(0)} ${h} Z`;
  const stroke = colorKey === "green" ? "#22c55e" : colorKey === "red" ? "#f87171" : "#f59e0b";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`sg-${colorKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${colorKey})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={px(data.length - 1)} cy={py(data[data.length - 1].valor)} r="3" fill={stroke} />
    </svg>
  );
}

// ─── Círculo de progreso ──────────────────────────────────
function CircleProgress({ val, size = 80 }: { val: number; size?: number }) {
  const r = size * 0.38, circ = 2 * Math.PI * r;
  const fill = (Math.min(val, 100) / 100) * circ;
  const color = val >= 90 ? "#22c55e" : val >= 75 ? "#f59e0b" : "#f87171";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3e8d0" strokeWidth={size * 0.075} className="dark:stroke-[#2a1a0d]" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size * 0.075}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.22} fontWeight="800" fill={color}>{val}%</text>
    </svg>
  );
}

// ─── Modal métrica ────────────────────────────────────────
function ModalMetrica({ m, onClose }: { m: Metrica; onClose: () => void }) {
  const c = getColor(m.valor, m.meta);
  const colorKey = m.valor >= m.meta ? "green" : m.valor / m.meta >= 0.85 ? "amber" : "red";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-[#18110d] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a1a0d]">
          <div className="flex items-center gap-2">
            <span className="text-xl">{m.icono}</span>
            <h2 className="text-lg font-bold text-gray-800 dark:text-[#f5deb3]">{m.label}</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a1a0d] transition-colors">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{m.descripcion}</p>

          {/* Círculo + valores */}
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <CircleProgress val={Math.min(m.valor, 100)} size={100} />
              <p className={`text-xs font-semibold mt-1 ${c.text}`}>{c.label}</p>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl bg-gray-50 dark:bg-[#120c08] px-4 py-2.5">
                <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">Valor actual</p>
                <p className={`text-2xl font-black ${c.text}`}>{m.valor}%</p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-[#120c08] px-4 py-2.5">
                <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">Meta</p>
                <p className="text-2xl font-black text-gray-700 dark:text-[#cbb08b]">{m.meta}%</p>
              </div>
            </div>
          </div>

          {/* Histórico */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-[#9a7a5a] uppercase tracking-wide mb-2">
              Evolución últimos 5 meses
            </p>
            <div className="rounded-xl bg-gray-50 dark:bg-[#120c08] px-4 py-3 flex items-end gap-4">
              <Sparkline data={m.historico} colorKey={colorKey} />
              <div className="flex gap-3 flex-wrap">
                {m.historico.map((h) => (
                  <div key={h.mes} className="text-center">
                    <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">{h.mes}</p>
                    <p className="text-xs font-bold text-gray-700 dark:text-[#cbb08b]">{h.valor}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Barra */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 dark:text-[#9a7a5a]">Progreso hacia meta ({m.meta}%)</span>
              <span className={`font-bold ${c.text}`}>{Math.round((m.valor / m.meta) * 100)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d]">
              <div className={`h-full rounded-full ${c.bar} transition-all`}
                style={{ width: `${Math.min((m.valor / m.meta) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
function SkeletonPerfil() {
  return (
    <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex items-center gap-5 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-[#2a1a0d]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-[#2a1a0d]" />
        <div className="h-3 w-24 rounded bg-gray-100 dark:bg-[#1e1408]" />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function EmpleadoDesempeno() {
  const { id } = useParams<{ id: string }>();
  const empleadoId = parseInt(id ?? "1", 10);

  const [empleado, setEmpleado] = useState<EmpleadoAPI | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [selected, setSelected] = useState<Metrica | null>(null);

  // Las métricas usan datos base por ahora; cuando tengas el endpoint
  // de métricas reales, reemplaza METRICAS_BASE con los datos del fetch.
  const metricas = METRICAS_BASE;

  useEffect(() => {
    fetch(`http://localhost:8000/api/empleado-actual/${empleadoId}/`)
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then((data) => setEmpleado(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [empleadoId]);

  const global = Math.round(
    metricas.reduce((a, m) => a + Math.min(m.valor, 100), 0) / metricas.length
  );

  const mesActual = new Date().toLocaleString("es-BO", { month: "long", year: "numeric" });

  return (
    <div className="p-6">
      {selected && <ModalMetrica m={selected} onClose={() => setSelected(null)} />}

      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">Mi Desempeño</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-[#9a7a5a] capitalize">
        Seguimiento de indicadores personales — {mesActual}.
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          No se pudo cargar el perfil: {error}
        </div>
      )}

      {/* ── Perfil + puntaje global ── */}
      {loading ? <SkeletonPerfil /> : empleado && (
        <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-[#3a2010] flex items-center justify-center text-xl font-bold text-amber-700 dark:text-[#e8b87a] shrink-0">
            {iniciales(empleado.nombre)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 dark:text-[#f5deb3] text-lg">{empleado.nombre}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a] font-medium">
              {empleado.cargo}
            </span>
          </div>
          <div className="shrink-0 text-center">
            <CircleProgress val={global} size={88} />
            <p className="text-xs text-gray-400 dark:text-[#7a5c3a] mt-1">Puntaje global</p>
          </div>
        </div>
      )}      

      {/* ── Grid de métricas ── */}
      <div className="mt-5">
        <h2 className="text-xs font-bold text-gray-500 dark:text-[#9a7a5a] uppercase tracking-wide mb-3">
          Indicadores del mes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metricas.map((m) => {
            const c = getColor(m.valor, m.meta);
            const colorKey = m.valor >= m.meta ? "green" : m.valor / m.meta >= 0.85 ? "amber" : "red";
            const pctMeta = Math.min((m.valor / m.meta) * 100, 100);
            return (
              <button key={m.id} onClick={() => setSelected(m)}
                className="text-left rounded-2xl bg-white dark:bg-[#18110d] p-5 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-lg">{m.icono}</span>
                    <p className="mt-1 text-sm font-semibold text-gray-600 dark:text-[#cbb08b]">{m.label}</p>
                  </div>
                  <Sparkline data={m.historico} colorKey={colorKey} />
                </div>

                <p className={`mt-2 text-4xl font-black ${c.text}`}>{m.valor}%</p>

                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 dark:text-[#7a5c3a]">Meta: {m.meta}%</span>
                    <span className={`font-semibold ${c.text}`}>{c.label}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d]">
                    <div className={`h-full rounded-full ${c.bar} transition-all`}
                      style={{ width: `${pctMeta}%` }} />
                  </div>
                </div>

                <p className="mt-3 text-xs text-amber-600 dark:text-[#e8b87a] group-hover:underline">
                  Ver detalle →
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}