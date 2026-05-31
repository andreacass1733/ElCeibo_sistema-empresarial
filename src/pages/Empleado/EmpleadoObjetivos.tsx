import { useState } from "react";

// ─── Tipos ────────────────────────────────────────────────
type Prioridad = "ALTA" | "MEDIA" | "BAJA";
type EstadoObj = "EN_PROGRESO" | "COMPLETADO" | "PENDIENTE" | "EN_RIESGO";

type Tarea = {
  id: number;
  titulo: string;
  completada: boolean;
};

type Objetivo = {
  id: number;
  titulo: string;
  descripcion: string;
  avance: number;
  meta: number;
  prioridad: Prioridad;
  estado: EstadoObj;
  categoria: string;
  fecha_limite: string;
  responsable: string;
  tareas: Tarea[];
};

// ─── Datos ────────────────────────────────────────────────
const empleado = {
  nombre: "Luis Flores",
  cargo: "Vendedor",
  iniciales: "LF",
};

const initialObjetivos: Objetivo[] = [
  {
    id: 1,
    titulo: "Incrementar ventas mensuales",
    descripcion: "Alcanzar Bs. 18,000 en ventas personales durante el mes de mayo.",
    avance: 75,
    meta: 100,
    prioridad: "ALTA",
    estado: "EN_PROGRESO",
    categoria: "Ventas",
    fecha_limite: "2026-05-31",
    responsable: "Ana Quispe",
    tareas: [
      { id: 1, titulo: "Contactar 20 clientes nuevos",        completada: true },
      { id: 2, titulo: "Realizar seguimiento post-venta",     completada: true },
      { id: 3, titulo: "Cerrar 5 ventas mayoristas",          completada: false },
      { id: 4, titulo: "Registrar ventas en el sistema",      completada: false },
    ],
  },
  {
    id: 2,
    titulo: "Completar capacitaciones del semestre",
    descripcion: "Aprobar todos los cursos asignados con calificación mínima de 75/100.",
    avance: 60,
    meta: 100,
    prioridad: "MEDIA",
    estado: "EN_PROGRESO",
    categoria: "RRHH",
    fecha_limite: "2026-06-30",
    responsable: "Carlos Mamani",
    tareas: [
      { id: 1, titulo: "Completar curso Atención al Cliente",      completada: true },
      { id: 2, titulo: "Completar curso Marketing Digital",        completada: true },
      { id: 3, titulo: "Completar curso Técnicas de Venta",        completada: true },
      { id: 4, titulo: "Completar curso Liderazgo Empresarial",    completada: false },
      { id: 5, titulo: "Entregar reporte final al supervisor",     completada: false },
    ],
  },
  {
    id: 3,
    titulo: "Reducir devoluciones de productos",
    descripcion: "Bajar el índice de devoluciones de 5% a menos del 2% mejorando la asesoría al cliente.",
    avance: 90,
    meta: 100,
    prioridad: "ALTA",
    estado: "EN_PROGRESO",
    categoria: "Calidad",
    fecha_limite: "2026-05-31",
    responsable: "Ana Quispe",
    tareas: [
      { id: 1, titulo: "Capacitarse en descripción de productos",  completada: true },
      { id: 2, titulo: "Aplicar checklist de verificación",        completada: true },
      { id: 3, titulo: "Registrar cada devolución con motivo",     completada: true },
      { id: 4, titulo: "Revisar reporte con supervisor",           completada: false },
    ],
  },
  {
    id: 4,
    titulo: "Mejorar puntualidad en reportes",
    descripcion: "Entregar los reportes semanales de ventas antes del viernes a las 17:00.",
    avance: 100,
    meta: 100,
    prioridad: "BAJA",
    estado: "COMPLETADO",
    categoria: "Gestión",
    fecha_limite: "2026-05-30",
    responsable: "Carlos Mamani",
    tareas: [
      { id: 1, titulo: "Configurar recordatorio semanal",    completada: true },
      { id: 2, titulo: "Usar plantilla estándar de reporte", completada: true },
      { id: 3, titulo: "Enviar 4 reportes consecutivos",     completada: true },
    ],
  },
  {
    id: 5,
    titulo: "Captar clientes en zona norte",
    descripcion: "Prospectar y visitar al menos 15 negocios nuevos en la zona norte de la ciudad.",
    avance: 20,
    meta: 100,
    prioridad: "MEDIA",
    estado: "EN_RIESGO",
    categoria: "Ventas",
    fecha_limite: "2026-06-15",
    responsable: "Ana Quispe",
    tareas: [
      { id: 1, titulo: "Mapear negocios de la zona norte",   completada: true },
      { id: 2, titulo: "Visitar 15 negocios",                completada: false },
      { id: 3, titulo: "Registrar contactos en el sistema",  completada: false },
      { id: 4, titulo: "Cerrar al menos 3 contratos nuevos", completada: false },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────
const prioridadStyle: Record<Prioridad, string> = {
  ALTA:  "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  MEDIA: "bg-amber-100 text-amber-700 dark:bg-[#3a2010] dark:text-[#e8b87a]",
  BAJA:  "bg-gray-100 text-gray-600 dark:bg-[#2a1a0d] dark:text-[#9a7a5a]",
};

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

const categoriaColor: Record<string, string> = {
  Ventas:   "bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a]",
  RRHH:     "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Calidad:  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Gestión:  "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
};

function getBarColor(avance: number, estado: EstadoObj) {
  if (estado === "COMPLETADO") return "bg-green-500";
  if (estado === "EN_RIESGO")  return "bg-red-400";
  if (avance >= 75)            return "bg-amber-500 dark:bg-[#c87941]";
  return "bg-amber-400 dark:bg-[#a06e35]";
}

function getAvanceColor(avance: number, estado: EstadoObj) {
  if (estado === "COMPLETADO") return "text-green-600 dark:text-green-400";
  if (estado === "EN_RIESGO")  return "text-red-500 dark:text-red-400";
  return "text-amber-600 dark:text-[#e8b87a]";
}

function formatFecha(f: string) {
  return new Date(f).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" });
}

function diasRestantes(f: string) {
  return Math.ceil((new Date(f).getTime() - Date.now()) / 86400000);
}

// ─── Modal detalle ────────────────────────────────────────
function ModalObjetivo({
  obj,
  onToggleTarea,
  onClose,
}: {
  obj: Objetivo;
  onToggleTarea: (objId: number, tareaId: number) => void;
  onClose: () => void;
}) {
  const completadas = obj.tareas.filter(t => t.completada).length;
  const dias = diasRestantes(obj.fecha_limite);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#18110d] shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#18110d] px-6 py-4 border-b border-gray-200 dark:border-[#3a2a1a] z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoriaColor[obj.categoria] ?? ""}`}>
                {obj.categoria}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoStyle[obj.estado]}`}>
                {estadoLabel[obj.estado]}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${prioridadStyle[obj.prioridad]}`}>
                Prioridad {obj.prioridad}
              </span>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#cbb08b] dark:hover:bg-[#2a1a0d] transition-colors">✕</button>
          </div>
          <h2 className="mt-2 text-lg font-bold text-gray-800 dark:text-[#f5deb3]">{obj.titulo}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#9a7a5a]">{obj.descripcion}</p>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Responsable",    value: obj.responsable },
              { label: "Fecha límite",   value: formatFecha(obj.fecha_limite) },
              { label: "Días restantes", value: dias > 0 ? `${dias} días` : "⚠ Vencido" },
              { label: "Avance actual",  value: `${obj.avance}%` },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-gray-50 dark:bg-[#120c08] p-3">
                <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">{item.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-[#f5deb3]">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Barra de avance */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500 dark:text-[#9a7a5a]">Progreso general</span>
              <span className={`font-bold ${getAvanceColor(obj.avance, obj.estado)}`}>{obj.avance}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d]">
              <div className={`h-full rounded-full ${getBarColor(obj.avance, obj.estado)} transition-all`}
                style={{ width: `${obj.avance}%` }} />
            </div>
          </div>

          {/* Tareas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-700 dark:text-[#cbb08b]">Tareas</p>
              <span className="text-xs text-gray-500 dark:text-[#9a7a5a]">
                {completadas}/{obj.tareas.length} completadas
              </span>
            </div>
            <div className="space-y-2">
              {obj.tareas.map(tarea => (
                <button key={tarea.id}
                  onClick={() => onToggleTarea(obj.id, tarea.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                    tarea.completada
                      ? "bg-green-50 dark:bg-green-900/20"
                      : "bg-gray-50 dark:bg-[#120c08] hover:bg-gray-100 dark:hover:bg-[#1e1208]"
                  }`}>
                  <div className={`w-5 h-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                    tarea.completada
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300 dark:border-[#3a2a1a]"
                  }`}>
                    {tarea.completada && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${tarea.completada ? "line-through text-gray-400 dark:text-[#7a5c3a]" : "text-gray-700 dark:text-[#cbb08b]"}`}>
                    {tarea.titulo}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function EmpleadoObjetivos() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>(initialObjetivos);
  const [selected, setSelected]   = useState<Objetivo | null>(null);
  const [filtro, setFiltro]       = useState<string>("Todos");

  const handleToggleTarea = (objId: number, tareaId: number) => {
    setObjetivos(prev => prev.map(o => {
      if (o.id !== objId) return o;
      const tareas = o.tareas.map(t => t.id === tareaId ? { ...t, completada: !t.completada } : t);
      const completadas = tareas.filter(t => t.completada).length;
      const avance = Math.round((completadas / tareas.length) * 100);
      const estado: EstadoObj = avance === 100 ? "COMPLETADO" : o.estado === "EN_RIESGO" ? "EN_RIESGO" : "EN_PROGRESO";
      return { ...o, tareas, avance, estado };
    }));
    // Sync selected
    setSelected(prev => {
      if (!prev || prev.id !== objId) return prev;
      const tareas = prev.tareas.map(t => t.id === tareaId ? { ...t, completada: !t.completada } : t);
      const completadas = tareas.filter(t => t.completada).length;
      const avance = Math.round((completadas / tareas.length) * 100);
      const estado: EstadoObj = avance === 100 ? "COMPLETADO" : prev.estado === "EN_RIESGO" ? "EN_RIESGO" : "EN_PROGRESO";
      return { ...prev, tareas, avance, estado };
    });
  };

  const estados  = ["Todos", "EN_PROGRESO", "COMPLETADO", "EN_RIESGO", "PENDIENTE"];
  const lista    = filtro === "Todos" ? objetivos : objetivos.filter(o => o.estado === filtro);

  const completados = objetivos.filter(o => o.estado === "COMPLETADO").length;
  const enRiesgo    = objetivos.filter(o => o.estado === "EN_RIESGO").length;
  const avanceGlobal = Math.round(objetivos.reduce((a, o) => a + o.avance, 0) / objetivos.length);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">Mis Objetivos</h1>
      <p className="mt-2 text-gray-600 dark:text-[#cbb08b]">Seguimiento de metas personales asignadas.</p>

      {/* ── Perfil + resumen ── */}
      <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-[#3a2010] flex items-center justify-center text-lg font-bold text-amber-700 dark:text-[#e8b87a] flex-shrink-0">
          {empleado.iniciales}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 dark:text-[#f5deb3]">{empleado.nombre}</p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a] font-medium">
            {empleado.cargo}
          </span>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-3xl font-black text-amber-600 dark:text-[#e8b87a]">{avanceGlobal}%</p>
          <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">avance global</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Total",       val: objetivos.length, color: "text-gray-800 dark:text-[#f5deb3]",      bg: "bg-white dark:bg-[#18110d]" },
          { label: "Completados", val: completados,       color: "text-green-600 dark:text-green-400",     bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "En riesgo",   val: enRiesgo,          color: "text-red-500 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-900/20" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl ${s.bg} shadow-sm p-4 text-center`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-500 dark:text-[#9a7a5a] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Barra global ── */}
      <div className="mt-4 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm px-5 py-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-500 dark:text-[#9a7a5a]">{completados} de {objetivos.length} objetivos completados</span>
          <span className="font-bold text-amber-600 dark:text-[#e8b87a]">{avanceGlobal}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d]">
          <div className="h-full rounded-full bg-amber-500 dark:bg-[#c87941] transition-all"
            style={{ width: `${avanceGlobal}%` }} />
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="mt-5 flex flex-wrap gap-2">
        {estados.map(e => (
          <button key={e} onClick={() => setFiltro(e)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtro === e
                ? "bg-amber-500 dark:bg-[#8b5e2a] text-white"
                : "bg-white dark:bg-[#18110d] text-gray-600 dark:text-[#cbb08b] border border-gray-200 dark:border-[#3a2a1a] hover:border-amber-300 dark:hover:border-[#8b5e2a]"
            }`}>
            {e === "Todos" ? "Todos" : estadoLabel[e as EstadoObj]}
          </button>
        ))}
      </div>

      {/* ── Lista ── */}
      <div className="mt-4 space-y-3">
        {lista.map(obj => {
          const completadasT = obj.tareas.filter(t => t.completada).length;
          const dias = diasRestantes(obj.fecha_limite);
          return (
            <button key={obj.id} onClick={() => setSelected(obj)}
              className="w-full text-left rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 hover:shadow-md dark:hover:shadow-[#3a2a1a]/40 transition-shadow group cursor-pointer">

              {/* Top badges */}
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoriaColor[obj.categoria] ?? ""}`}>
                    {obj.categoria}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoStyle[obj.estado]}`}>
                    {estadoLabel[obj.estado]}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${prioridadStyle[obj.prioridad]}`}>
                    {obj.prioridad}
                  </span>
                </div>
                <span className="text-xs text-amber-600 dark:text-[#e8b87a] font-medium group-hover:underline flex-shrink-0">
                  Ver tareas →
                </span>
              </div>

              {/* Título */}
              <h2 className="mt-2.5 font-bold text-gray-800 dark:text-[#f5deb3]">{obj.titulo}</h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-[#9a7a5a] line-clamp-1">{obj.descripcion}</p>

              {/* Barra */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 dark:text-[#9a7a5a]">
                    ✅ {completadasT}/{obj.tareas.length} tareas
                  </span>
                  <span className={`font-bold ${getAvanceColor(obj.avance, obj.estado)}`}>
                    {obj.avance}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d]">
                  <div className={`h-full rounded-full ${getBarColor(obj.avance, obj.estado)} transition-all`}
                    style={{ width: `${obj.avance}%` }} />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400 dark:text-[#7a5c3a]">
                <span>📅 Límite: {formatFecha(obj.fecha_limite)}</span>
                <span className={dias <= 5 && obj.estado !== "COMPLETADO" ? "text-red-400 font-semibold" : ""}>
                  {dias > 0 ? `⏱ ${dias} días` : "⚠ Vencido"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {selected && (
        <ModalObjetivo
          obj={selected}
          onToggleTarea={handleToggleTarea}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}