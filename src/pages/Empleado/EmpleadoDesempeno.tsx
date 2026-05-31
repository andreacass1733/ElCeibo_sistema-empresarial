import { useState } from "react";

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

type Logro = {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  icono: string;
};

type Feedback = {
  id: number;
  autor: string;
  cargo: string;
  comentario: string;
  fecha: string;
  positivo: boolean;
};

// ─── Empleado ─────────────────────────────────────────────
const empleado = {
  nombre: "Luis Flores",
  cargo: "Vendedor",
  sucursal: "Sucursal Central",
  iniciales: "LF",
  ingreso: "2024-02-01",
};

// ─── Métricas ─────────────────────────────────────────────
const metricas: Metrica[] = [
  {
    id: "productividad",
    label: "Productividad",
    valor: 87,
    meta: 85,
    descripcion: "Relación entre ventas realizadas y objetivo mensual asignado.",
    icono: "⚡",
    historico: [
      { mes: "Ene", valor: 78 }, { mes: "Feb", valor: 80 },
      { mes: "Mar", valor: 83 }, { mes: "Abr", valor: 85 },
      { mes: "May", valor: 87 },
    ],
  },
  {
    id: "puntualidad",
    label: "Puntualidad",
    valor: 95,
    meta: 90,
    descripcion: "Porcentaje de días en que el empleado llegó a tiempo a su turno.",
    icono: "🕐",
    historico: [
      { mes: "Ene", valor: 88 }, { mes: "Feb", valor: 90 },
      { mes: "Mar", valor: 92 }, { mes: "Abr", valor: 94 },
      { mes: "May", valor: 95 },
    ],
  },
  {
    id: "equipo",
    label: "Trabajo en equipo",
    valor: 91,
    meta: 80,
    descripcion: "Evaluación de colaboración con compañeros y resolución conjunta de problemas.",
    icono: "🤝",
    historico: [
      { mes: "Ene", valor: 82 }, { mes: "Feb", valor: 84 },
      { mes: "Mar", valor: 87 }, { mes: "Abr", valor: 89 },
      { mes: "May", valor: 91 },
    ],
  },
  {
    id: "ventas",
    label: "Cumplimiento de ventas",
    valor: 112,
    meta: 100,
    descripcion: "Porcentaje del objetivo de ventas alcanzado en el mes actual.",
    icono: "💰",
    historico: [
      { mes: "Ene", valor: 95 }, { mes: "Feb", valor: 100 },
      { mes: "Mar", valor: 105 }, { mes: "Abr", valor: 108 },
      { mes: "May", valor: 112 },
    ],
  },
  {
    id: "atencion",
    label: "Atención al cliente",
    valor: 94,
    meta: 88,
    descripcion: "Calificación promedio recibida de clientes atendidos en el mes.",
    icono: "⭐",
    historico: [
      { mes: "Ene", valor: 85 }, { mes: "Feb", valor: 88 },
      { mes: "Mar", valor: 90 }, { mes: "Abr", valor: 92 },
      { mes: "May", valor: 94 },
    ],
  },
  {
    id: "capacitacion",
    label: "Avance en capacitaciones",
    valor: 75,
    meta: 100,
    descripcion: "Porcentaje de cursos obligatorios completados en el semestre.",
    icono: "📚",
    historico: [
      { mes: "Ene", valor: 20 }, { mes: "Feb", valor: 40 },
      { mes: "Mar", valor: 60 }, { mes: "Abr", valor: 60 },
      { mes: "May", valor: 75 },
    ],
  },
];

const logros: Logro[] = [
  { id: 1, titulo: "Vendedor del Mes",     descripcion: "Mayor volumen de ventas en abril 2026.",          fecha: "2026-04-30", icono: "🏆" },
  { id: 2, titulo: "100% de asistencia",   descripcion: "Sin ausencias durante marzo 2026.",               fecha: "2026-03-31", icono: "📅" },
  { id: 3, titulo: "Meta superada",        descripcion: "Superó el 110% del objetivo de ventas en mayo.",  fecha: "2026-05-30", icono: "🎯" },
];

const feedbacks: Feedback[] = [
  { id: 1, autor: "Ana Quispe",     cargo: "Administradora", comentario: "Luis demuestra excelente actitud con los clientes y siempre cumple sus metas.", fecha: "2026-05-15", positivo: true },
  { id: 2, autor: "Carlos Mamani", cargo: "Supervisor",      comentario: "Podría mejorar la puntualidad en la entrega de reportes semanales.",            fecha: "2026-05-10", positivo: false },
  { id: 3, autor: "Carmen Vidal",  cargo: "Instructora",     comentario: "Gran participación en el curso de atención al cliente. Muy proactivo.",         fecha: "2026-05-21", positivo: true },
];

// ─── Helpers ──────────────────────────────────────────────
function formatFecha(f: string) {
  return new Date(f).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" });
}

function getColor(val: number, meta: number) {
  const ratio = val / meta;
  if (ratio >= 1)   return { bar: "bg-green-500",  text: "text-green-600 dark:text-green-400",  label: "Meta alcanzada ✓" };
  if (ratio >= 0.85) return { bar: "bg-amber-500 dark:bg-[#c87941]", text: "text-amber-600 dark:text-[#e8b87a]", label: "Buen avance" };
  return              { bar: "bg-red-400",   text: "text-red-500 dark:text-red-400",    label: "Por mejorar" };
}

function puntajeGlobal() {
  return Math.round(metricas.reduce((a, m) => a + Math.min(m.valor, 100), 0) / metricas.length);
}

// ─── Sparkline SVG ────────────────────────────────────────
function Sparkline({ data, color }: { data: Mes[]; color: string }) {
  const w = 100, h = 36, pad = 4;
  const vals = data.map(d => d.valor);
  const min = Math.min(...vals) - 2;
  const max = Math.max(...vals) + 2;
  const px = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const py = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const d = data.map((p, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(p.valor)}`).join(" ");
  const area = `${d} L ${px(data.length - 1)} ${h} L ${px(0)} ${h} Z`;
  const stroke = color === "green" ? "#22c55e" : color === "red" ? "#f87171" : "#f59e0b";
  const fill   = color === "green" ? "#22c55e" : color === "red" ? "#f87171" : "#f59e0b";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.25" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={px(data.length - 1)} cy={py(data[data.length - 1].valor)} r="3" fill={stroke} />
    </svg>
  );
}

// ─── Círculo de progreso ──────────────────────────────────
function CircleProgress({ val, size = 80 }: { val: number; size?: number }) {
  const r = size * 0.38, circ = 2 * Math.PI * r;
  const capped = Math.min(val, 100);
  const fill = (capped / 100) * circ;
  const color = val >= 90 ? "#22c55e" : val >= 75 ? "#f59e0b" : "#f87171";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3e8d0" strokeWidth={size * 0.075} className="dark:stroke-[#2a1a0d]" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size * 0.075}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.22} fontWeight="800" fill={color}>
        {val}%
      </text>
    </svg>
  );
}

// ─── Modal detalle métrica ────────────────────────────────
function ModalMetrica({ m, onClose }: { m: Metrica; onClose: () => void }) {
  const c = getColor(m.valor, m.meta);
  const colorKey = m.valor >= m.meta ? "green" : m.valor / m.meta >= 0.85 ? "amber" : "red";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-[#18110d] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#3a2a1a]">
          <div className="flex items-center gap-2">
            <span className="text-xl">{m.icono}</span>
            <h2 className="text-lg font-bold text-gray-800 dark:text-[#f5deb3]">{m.label}</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#cbb08b] dark:hover:bg-[#2a1a0d] transition-colors">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{m.descripcion}</p>

          {/* Círculo grande + meta */}
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
              <Sparkline data={m.historico} color={colorKey} />
              <div className="flex gap-3 flex-wrap">
                {m.historico.map(h => (
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

// ─── Componente principal ─────────────────────────────────
export default function EmpleadoDesempeno() {
  const [selected, setSelected] = useState<Metrica | null>(null);
  const global = puntajeGlobal();
  const mesesEmpleo = Math.floor((Date.now() - new Date(empleado.ingreso).getTime()) / (1000 * 60 * 60 * 24 * 30));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">Mi Desempeño</h1>
      <p className="mt-2 text-gray-600 dark:text-[#cbb08b]">Seguimiento de indicadores personales — Mayo 2026.</p>

      {/* ── Perfil + puntaje global ── */}
      <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-[#3a2010] flex items-center justify-center text-xl font-bold text-amber-700 dark:text-[#e8b87a] flex-shrink-0">
          {empleado.iniciales}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 dark:text-[#f5deb3] text-lg">{empleado.nombre}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a] font-medium">
              {empleado.cargo}
            </span>
            <span className="text-xs text-gray-500 dark:text-[#9a7a5a]">📍 {empleado.sucursal}</span>
            <span className="text-xs text-gray-500 dark:text-[#9a7a5a]">🗓 {mesesEmpleo} meses en la empresa</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <CircleProgress val={global} size={88} />
          <p className="text-xs text-center text-gray-400 dark:text-[#7a5c3a] mt-1">Puntaje global</p>
        </div>
      </div>

      {/* ── Logros ── */}
      <div className="mt-5">
        <h2 className="text-sm font-bold text-gray-600 dark:text-[#cbb08b] uppercase tracking-wide mb-3">
          Logros recientes
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {logros.map(l => (
            <div key={l.id}
              className="flex-shrink-0 w-52 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-4 border border-amber-100 dark:border-[#3a2010]">
              <span className="text-2xl">{l.icono}</span>
              <p className="mt-2 font-bold text-gray-800 dark:text-[#f5deb3] text-sm leading-tight">{l.titulo}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-[#9a7a5a] leading-snug">{l.descripcion}</p>
              <p className="mt-2 text-xs text-amber-600 dark:text-[#e8b87a]">{formatFecha(l.fecha)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Métricas ── */}
      <div className="mt-5">
        <h2 className="text-sm font-bold text-gray-600 dark:text-[#cbb08b] uppercase tracking-wide mb-3">
          Indicadores del mes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metricas.map(m => {
            const c = getColor(m.valor, m.meta);
            const colorKey = m.valor >= m.meta ? "green" : m.valor / m.meta >= 0.85 ? "amber" : "red";
            const pctMeta = Math.min((m.valor / m.meta) * 100, 100);

            return (
              <button key={m.id} onClick={() => setSelected(m)}
                className="text-left rounded-2xl bg-white dark:bg-[#18110d] p-5 shadow-sm hover:shadow-md dark:hover:shadow-[#3a2a1a]/40 transition-shadow group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-lg">{m.icono}</span>
                    <p className="mt-1 text-sm font-semibold text-gray-600 dark:text-[#cbb08b]">{m.label}</p>
                  </div>
                  <Sparkline data={m.historico} color={colorKey} />
                </div>

                <p className={`mt-2 text-4xl font-black ${c.text}`}>{m.valor}%</p>

                {/* Barra hacia meta */}
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

      {/* ── Feedback de supervisores ── */}
      <div className="mt-6">
        <h2 className="text-sm font-bold text-gray-600 dark:text-[#cbb08b] uppercase tracking-wide mb-3">
          Retroalimentación
        </h2>
        <div className="space-y-3">
          {feedbacks.map(f => (
            <div key={f.id}
              className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex gap-4">
              <div className={`flex-shrink-0 w-1 rounded-full ${f.positivo ? "bg-green-400" : "bg-amber-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm">{f.positivo ? "💬" : "📝"}</span>
                  <p className="font-semibold text-gray-800 dark:text-[#f5deb3] text-sm">{f.autor}</p>
                  <span className="text-xs text-gray-400 dark:text-[#7a5c3a]">{f.cargo}</span>
                  <span className="text-xs text-gray-400 dark:text-[#7a5c3a] ml-auto">{formatFecha(f.fecha)}</span>
                </div>
                <p className="mt-1.5 text-sm text-gray-600 dark:text-[#cbb08b] leading-relaxed">"{f.comentario}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selected && <ModalMetrica m={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}