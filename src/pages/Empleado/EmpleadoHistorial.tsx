import { useState } from "react";

// ─── Tipos ────────────────────────────────────────────────
type Estado = "COMPLETADO" | "INSCRITO" | "ABANDONADO";

type Curso = {
  id: number;
  nombre: string;
  categoria: string;
  instructor: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: Estado;
  calificacion: number | null;
  descripcion: string;
  duracion_dias: number;
  costo: number;
};

// ─── Datos del empleado ───────────────────────────────────
const empleado = {
  nombre: "Luis Flores",
  cargo: "Vendedor",
  sucursal: "Sucursal Central",
  foto_inicial: "LF",
};

const cursos: Curso[] = [
  {
    id: 1,
    nombre: "Marketing Digital para Chocolatería",
    categoria: "Marketing",
    instructor: "Ing. Sebastián Cruz",
    fecha_inicio: "2026-03-01",
    fecha_fin: "2026-03-15",
    estado: "COMPLETADO",
    calificacion: 92,
    descripcion: "Estrategias de redes sociales, fotografía de producto y campañas digitales para chocolates artesanales.",
    duracion_dias: 14,
    costo: 1200,
  },
  {
    id: 2,
    nombre: "Técnicas de Venta y Negociación",
    categoria: "Ventas",
    instructor: "Lic. Roberto Salinas",
    fecha_inicio: "2026-04-10",
    fecha_fin: "2026-04-25",
    estado: "COMPLETADO",
    calificacion: 88,
    descripcion: "Métodos de cierre de ventas, manejo de objeciones y negociación con clientes mayoristas.",
    duracion_dias: 15,
    costo: 950,
  },
  {
    id: 3,
    nombre: "Atención al Cliente",
    categoria: "Ventas",
    instructor: "Lic. Carmen Vidal",
    fecha_inicio: "2026-05-05",
    fecha_fin: "2026-05-20",
    estado: "COMPLETADO",
    calificacion: 95,
    descripcion: "Técnicas de trato amable, resolución de quejas y fidelización en puntos de venta.",
    duracion_dias: 15,
    costo: 850,
  },
  {
    id: 4,
    nombre: "Liderazgo Empresarial",
    categoria: "Gestión",
    instructor: "Dr. Álvaro Méndez",
    fecha_inicio: "2026-05-15",
    fecha_fin: "2026-05-30",
    estado: "INSCRITO",
    calificacion: null,
    descripcion: "Habilidades de gestión de equipos, comunicación asertiva y toma de decisiones.",
    duracion_dias: 15,
    costo: 1800,
  },
  {
    id: 5,
    nombre: "Control de Calidad en Producción",
    categoria: "Producción",
    instructor: "Ing. Patricia Loza",
    fecha_inicio: "2026-02-01",
    fecha_fin: "2026-02-20",
    estado: "ABANDONADO",
    calificacion: null,
    descripcion: "Normas de higiene y estándares de calidad en la elaboración de chocolates.",
    duracion_dias: 19,
    costo: 1400,
  },
];

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

const categoriaColor: Record<string, string> = {
  Ventas:     "bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a]",
  Marketing:  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Producción: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Gestión:    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

function formatFecha(f: string) {
  return new Date(f).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" });
}

function getNota(n: number) {
  if (n >= 90) return { label: "Excelente", color: "text-green-600 dark:text-green-400" };
  if (n >= 75) return { label: "Bueno",     color: "text-amber-600 dark:text-amber-400" };
  return             { label: "Regular",    color: "text-red-500 dark:text-red-400" };
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
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 13 }}
          className={i <= stars ? "text-amber-400" : "text-gray-200 dark:text-[#2a1a0d]"}>★</span>
      ))}
    </div>
  );
}

// ─── Modal detalle curso ──────────────────────────────────
function ModalCurso({ curso, onClose }: { curso: Curso; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-[#18110d] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-[#3a2a1a]">
          <div className="flex gap-2 flex-wrap pr-4">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoriaColor[curso.categoria] ?? ""}`}>
              {curso.categoria}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoStyle[curso.estado]}`}>
              {estadoLabel[curso.estado]}
            </span>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#cbb08b] dark:hover:bg-[#2a1a0d] transition-colors">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-[#f5deb3]">{curso.nombre}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-[#9a7a5a]">{curso.descripcion}</p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Instructor",   value: curso.instructor },
              { label: "Duración",     value: `${curso.duracion_dias} días` },
              { label: "Inicio",       value: formatFecha(curso.fecha_inicio) },
              { label: "Fin",          value: formatFecha(curso.fecha_fin) },
              { label: "Costo",        value: `Bs. ${curso.costo.toLocaleString()}` },
              { label: "Participante", value: empleado.nombre },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-gray-50 dark:bg-[#120c08] p-3">
                <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">{item.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-[#f5deb3]">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Calificación */}
          {curso.calificacion !== null ? (
            <div className="flex items-center gap-4 rounded-xl bg-gray-50 dark:bg-[#120c08] px-4 py-3">
              <CircleScore val={curso.calificacion} />
              <div>
                <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">Calificación obtenida</p>
                <p className={`text-lg font-bold ${getNota(curso.calificacion).color}`}>
                  {curso.calificacion} / 100 — {getNota(curso.calificacion).label}
                </p>
                <Stars val={curso.calificacion} />
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-gray-50 dark:bg-[#120c08] px-4 py-3 text-sm text-gray-400 dark:text-[#7a5c3a]">
              {curso.estado === "INSCRITO" ? "⏳ Aún en curso — calificación pendiente." : "❌ No se registró calificación."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function EmpleadoHistorial() {
  const [selected, setSelected] = useState<Curso | null>(null);
  const [filtro, setFiltro]     = useState<string>("Todos");

  const completados  = cursos.filter(c => c.estado === "COMPLETADO");
  const promedio     = completados.length
    ? Math.round(completados.reduce((a, c) => a + (c.calificacion ?? 0), 0) / completados.length)
    : 0;
  const mejorCurso   = completados.reduce<Curso | null>((best, c) =>
    !best || (c.calificacion ?? 0) > (best.calificacion ?? 0) ? c : best, null);

  const categorias   = ["Todos", ...Array.from(new Set(cursos.map(c => c.categoria)))];
  const lista        = filtro === "Todos" ? cursos : cursos.filter(c => c.categoria === filtro);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">Historial de Cursos</h1>
      <p className="mt-2 text-gray-600 dark:text-[#cbb08b]">Seguimiento personal de capacitaciones.</p>

      {/* ── Perfil del empleado ── */}
      <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-[#3a2010] flex items-center justify-center text-xl font-bold text-amber-700 dark:text-[#e8b87a] flex-shrink-0">
          {empleado.foto_inicial}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 dark:text-[#f5deb3]">{empleado.nombre}</h2>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a] font-medium">
              {empleado.cargo}
            </span>
            <span className="text-xs text-gray-500 dark:text-[#9a7a5a]">📍 {empleado.sucursal}</span>
          </div>
        </div>
        {/* Score circular del empleado */}
        {promedio > 0 && (
          <div className="text-center flex-shrink-0">
            <CircleScore val={promedio} />
            <p className="text-xs text-gray-400 dark:text-[#7a5c3a] mt-1">Promedio</p>
          </div>
        )}
      </div>

      {/* ── Resumen estadístico ── */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Cursos totales",   val: cursos.length,                         color: "text-gray-800 dark:text-[#f5deb3]",       bg: "bg-white dark:bg-[#18110d]" },
          { label: "Completados",      val: completados.length,                    color: "text-green-600 dark:text-green-400",       bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "En curso",         val: cursos.filter(c=>c.estado==="INSCRITO").length,   color: "text-yellow-600 dark:text-yellow-400",     bg: "bg-yellow-50 dark:bg-yellow-900/20" },
          { label: "Abandonados",      val: cursos.filter(c=>c.estado==="ABANDONADO").length, color: "text-red-500 dark:text-red-400",           bg: "bg-red-50 dark:bg-red-900/20" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl ${s.bg} shadow-sm p-4 text-center`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-500 dark:text-[#9a7a5a] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Mejor curso ── */}
      {mejorCurso && (
        <div className="mt-4 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-4 flex items-center gap-4">
          <div className="text-2xl">🏆</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 dark:text-[#7a5c3a] uppercase tracking-wide">Mejor calificación</p>
            <p className="font-bold text-gray-800 dark:text-[#f5deb3] truncate">{mejorCurso.nombre}</p>
            <Stars val={mejorCurso.calificacion!} />
          </div>
          <div className={`text-2xl font-bold ${getNota(mejorCurso.calificacion!).color}`}>
            {mejorCurso.calificacion}
          </div>
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="mt-5 flex flex-wrap gap-2">
        {categorias.map(cat => (
          <button key={cat} onClick={() => setFiltro(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtro === cat
                ? "bg-amber-500 dark:bg-[#8b5e2a] text-white"
                : "bg-white dark:bg-[#18110d] text-gray-600 dark:text-[#cbb08b] border border-gray-200 dark:border-[#3a2a1a] hover:border-amber-300 dark:hover:border-[#8b5e2a]"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* ── Lista de cursos ── */}
      <div className="mt-4 space-y-3">
        {lista.map(curso => (
          <button key={curso.id} onClick={() => setSelected(curso)}
            className="w-full text-left rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 hover:shadow-md dark:hover:shadow-[#3a2a1a]/40 transition-shadow group cursor-pointer">
            <div className="flex items-start gap-4">
              {/* Score o estado */}
              <div className="flex-shrink-0 mt-0.5">
                {curso.calificacion !== null
                  ? <CircleScore val={curso.calificacion} />
                  : (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#2a1a0d]">
                      <span className="text-xl">{curso.estado === "INSCRITO" ? "⏳" : "❌"}</span>
                    </div>
                  )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoriaColor[curso.categoria] ?? ""}`}>
                    {curso.categoria}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoStyle[curso.estado]}`}>
                    {estadoLabel[curso.estado]}
                  </span>
                </div>

                <h3 className="mt-1.5 font-bold text-gray-800 dark:text-[#f5deb3] leading-tight">{curso.nombre}</h3>

                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-[#9a7a5a]">
                  <span>🎓 {curso.instructor}</span>
                  <span>📅 {formatFecha(curso.fecha_inicio)} → {formatFecha(curso.fecha_fin)}</span>
                  <span>⏱ {curso.duracion_dias} días</span>
                </div>

                {curso.calificacion !== null && (
                  <div className="mt-2">
                    <Stars val={curso.calificacion} />
                  </div>
                )}
              </div>

              <span className="flex-shrink-0 text-xs font-medium text-amber-600 dark:text-[#e8b87a] group-hover:underline self-center">
                Ver →
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Modal */}
      {selected && <ModalCurso curso={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}