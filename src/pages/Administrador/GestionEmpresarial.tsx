import { useState } from "react";

// ─── Tipos ────────────────────────────────────────────────
type EstadoObj = "COMPLETADO" | "EN_PROGRESO" | "PENDIENTE" | "EN_RIESGO";

type Objetivo = {
  id: number;
  titulo: string;
  descripcion: string;
  area: string;
  estado: EstadoObj;
  progreso: number;
  responsable: string;
  fecha_limite: string;
};

type AlertaItem = {
  id: number;
  tipo: "warning" | "info" | "danger";
  mensaje: string;
  area: string;
};

// ─── Datos simulados ──────────────────────────────────────
const objetivos: Objetivo[] = [
  { id: 1, titulo: "Ampliar red de distribución", descripcion: "Abrir 2 nuevos puntos de venta en zonas sur y norte de la ciudad.", area: "Ventas", estado: "COMPLETADO", progreso: 100, responsable: "Ana Quispe", fecha_limite: "2026-04-30" },
  { id: 2, titulo: "Reducir merma de producción", descripcion: "Bajar el desperdicio de materia prima de un 8% a un 4%.", area: "Producción", estado: "EN_PROGRESO", progreso: 65, responsable: "David Choque", fecha_limite: "2026-07-31" },
  { id: 3, titulo: "Certificación de calidad ISO", descripcion: "Obtener certificación ISO 22000 en inocuidad alimentaria.", area: "Producción", estado: "EN_RIESGO", progreso: 40, responsable: "Patricia Loza", fecha_limite: "2026-06-30" },
  { id: 4, titulo: "Campaña de marketing digital", descripcion: "Lanzar campaña en redes sociales con 50k alcance mensual.", area: "Marketing", estado: "COMPLETADO", progreso: 100, responsable: "María Condori", fecha_limite: "2026-05-15" },
  { id: 5, titulo: "Capacitar al 100% del personal", descripcion: "Que todos los empleados completen al menos 1 curso este semestre.", area: "RRHH", estado: "EN_PROGRESO", progreso: 72, responsable: "Carlos Mamani", fecha_limite: "2026-06-30" },
  { id: 6, titulo: "Implementar sistema de inventario", descripcion: "Digitalizar el control de stock en todas las sucursales.", area: "Logística", estado: "COMPLETADO", progreso: 100, responsable: "Luis Flores", fecha_limite: "2026-03-31" },
  { id: 7, titulo: "Aumentar ventas mayoristas", descripcion: "Incrementar ventas a distribuidores en un 20%.", area: "Ventas", estado: "EN_PROGRESO", progreso: 55, responsable: "Jorge Tito", fecha_limite: "2026-08-31" },
  { id: 8, titulo: "Lanzar línea premium de chocolates", descripcion: "Desarrollar y comercializar 3 nuevos productos premium.", area: "Producción", estado: "PENDIENTE", progreso: 10, responsable: "Elena Vargas", fecha_limite: "2026-09-30" },
  { id: 9, titulo: "Reducir costos operativos 10%", descripcion: "Optimizar procesos para reducir gastos fijos mensuales.", area: "Gestión", estado: "EN_RIESGO", progreso: 30, responsable: "Ana Quispe", fecha_limite: "2026-06-30" },
  { id: 10, titulo: "Expansión a mercado regional", descripcion: "Exportar productos a al menos 2 departamentos vecinos.", area: "Ventas", estado: "PENDIENTE", progreso: 5, responsable: "Carlos Mamani", fecha_limite: "2026-12-31" },
];

const alertas: AlertaItem[] = [
  { id: 1, tipo: "danger", mensaje: "Certificación ISO en riesgo: faltan documentos clave.", area: "Producción" },
  { id: 2, tipo: "warning", mensaje: "Objetivo de costos operativos por debajo del ritmo esperado.", area: "Gestión" },
  { id: 3, tipo: "info", mensaje: "Campaña de marketing superó el objetivo de alcance en un 18%.", area: "Marketing" },
  { id: 4, tipo: "warning", mensaje: "3 empleados aún no inscritos en ninguna capacitación.", area: "RRHH" },
];

// ─── Métricas operativas ──────────────────────────────────
const metricas = [
  { label: "Producción mensual", valor: "3,840 u.", sub: "Rendimiento: 82%", pct: 82, color: "bg-amber-500 dark:bg-[#d4a15d]", textColor: "text-amber-600 dark:text-amber-400" },
  { label: "Ventas del mes", valor: "Bs. 84,320", sub: "+12% vs mes anterior", pct: null, color: "bg-green-500", textColor: "text-green-600 dark:text-green-400" },
  { label: "Satisfacción clientes", valor: "4.6 / 5", sub: "Basado en 128 reseñas", pct: 92, color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400" },
  { label: "Margen bruto", valor: "74.5%", sub: "Meta: 70% ✓", pct: 74.5, color: "bg-purple-500", textColor: "text-purple-600 dark:text-purple-400" },
  { label: "Rotación de inventario", valor: "18 días", sub: "Óptimo: < 21 días ✓", pct: null, color: "bg-teal-500", textColor: "text-teal-600 dark:text-teal-400" },
  { label: "Costo por unidad prod.", valor: "Bs. 4.20", sub: "-0.30 vs mes anterior", pct: null, color: "bg-orange-500", textColor: "text-orange-600 dark:text-orange-400" },
];

// ─── Helpers ──────────────────────────────────────────────
const estadoStyle: Record<EstadoObj, string> = {
  COMPLETADO:   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  EN_PROGRESO:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  PENDIENTE:    "bg-gray-100 text-gray-600 dark:bg-[#2a1a0d] dark:text-[#8b6b42]",
  EN_RIESGO:    "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};
const estadoLabel: Record<EstadoObj, string> = {
  COMPLETADO: "Completado", EN_PROGRESO: "En progreso", PENDIENTE: "Pendiente", EN_RIESGO: "En riesgo",
};

const areaColor: Record<string, string> = {
  Ventas:     "bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a]",
  Producción: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Marketing:  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  RRHH:       "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Logística:  "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  Gestión:    "bg-gray-100 text-gray-700 dark:bg-[#2a1a0d] dark:text-[#c9a46b]",
};

const alertaStyle = {
  danger:  { bar: "bg-red-500", badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: "🔴" },
  warning: { bar: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: "🟡" },
  info:    { bar: "bg-blue-400", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: "🔵" },
};

function formatFecha(f: string) {
  return new Date(f).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" });
}

function BarraProgreso({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d]">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

// ─── Modal Objetivo ───────────────────────────────────────
function ModalObjetivo({ obj, onClose }: { obj: Objetivo; onClose: () => void }) {
  const diasRestantes = Math.ceil((new Date(obj.fecha_limite).getTime() - Date.now()) / 86400000);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-[#18110d] shadow-2xl">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2b2b2b]">
          <div className="flex gap-2 flex-wrap pr-4">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${areaColor[obj.area] ?? ""}`}>{obj.area}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoStyle[obj.estado]}`}>{estadoLabel[obj.estado]}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#c9a46b] dark:hover:bg-[#1a1a1a] transition-colors">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-[#e8c48e]">{obj.titulo}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-[#8b6b42]">{obj.descripcion}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Responsable", value: obj.responsable },
              { label: "Fecha límite", value: formatFecha(obj.fecha_limite) },
              { label: "Días restantes", value: diasRestantes > 0 ? `${diasRestantes} días` : "Vencido" },
              { label: "Progreso", value: `${obj.progreso}%` },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-gray-50 dark:bg-[#120c08] p-3">
                <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">{item.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-[#e8c48e]">{item.value}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 dark:text-[#8b6b42]">Avance del objetivo</span>
              <span className="font-semibold text-gray-700 dark:text-[#c9a46b]">{obj.progreso}%</span>
            </div>
            <BarraProgreso pct={obj.progreso} color="bg-amber-500 dark:bg-[#d4a15d]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function GestionEmpresarial() {
  const [selectedObj, setSelectedObj] = useState<Objetivo | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [filtroArea, setFiltroArea]   = useState<string>("Todas");

  const completados  = objetivos.filter(o => o.estado === "COMPLETADO").length;
  const enProgreso   = objetivos.filter(o => o.estado === "EN_PROGRESO").length;
  const enRiesgo     = objetivos.filter(o => o.estado === "EN_RIESGO").length;
  const pendientes   = objetivos.filter(o => o.estado === "PENDIENTE").length;
  const pctGlobal    = Math.round(objetivos.reduce((a, o) => a + o.progreso, 0) / objetivos.length);

  const areas    = ["Todas", ...Array.from(new Set(objetivos.map(o => o.area)))];
  const estados  = ["Todos", "COMPLETADO", "EN_PROGRESO", "EN_RIESGO", "PENDIENTE"];

  const lista = objetivos.filter(o => {
    const okE = filtroEstado === "Todos" || o.estado === filtroEstado;
    const okA = filtroArea   === "Todas" || o.area   === filtroArea;
    return okE && okA;
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#e8c48e]">Gestión Empresarial</h1>
      <p className="mt-2 text-gray-600 dark:text-[#c9a46b]">Resumen general de procesos estratégicos.</p>

      {/* ── Métricas operativas ── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricas.map(m => (
          <div key={m.label} className="rounded-2xl bg-white dark:bg-[#18110d] p-5 shadow-sm">
            <p className="text-xs text-gray-400 dark:text-[#7a5c3a] uppercase tracking-wide">{m.label}</p>
            <p className={`mt-1 text-2xl font-bold ${m.textColor}`}>{m.valor}</p>
            <p className="text-xs text-gray-500 dark:text-[#8b6b42] mt-0.5">{m.sub}</p>
            {m.pct !== null && (
              <div className="mt-2">
                <BarraProgreso pct={m.pct} color={m.color} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Objetivos — resumen ── */}
      <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-[#e8c48e]">Objetivos Estratégicos</h2>
          <span className="text-sm text-gray-500 dark:text-[#8b6b42]">Avance global: <strong className="text-gray-800 dark:text-[#e8c48e]">{pctGlobal}%</strong></span>
        </div>

        {/* Conteo por estado */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Completados",  val: completados, color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-900/20" },
            { label: "En progreso",  val: enProgreso,  color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
            { label: "En riesgo",    val: enRiesgo,    color: "text-red-500 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-900/20" },
            { label: "Pendientes",   val: pendientes,  color: "text-gray-500 dark:text-[#8b6b42]",    bg: "bg-gray-50 dark:bg-[#120c08]" },
          ].map(s => (
            <div key={s.label} className={`rounded-xl ${s.bg} p-3 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-gray-500 dark:text-[#8b6b42]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Barra global */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500 dark:text-[#8b6b42]">{completados} de {objetivos.length} objetivos completados</span>
            <span className="font-semibold text-gray-700 dark:text-[#c9a46b]">{pctGlobal}%</span>
          </div>
          <BarraProgreso pct={pctGlobal} color="bg-amber-500 dark:bg-[#d4a15d]" />
        </div>
      </div>

      {/* ── Alertas ── */}
      <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-800 dark:text-[#e8c48e] mb-3">Alertas y Novedades</h2>
        <div className="space-y-3">
          {alertas.map(a => {
            const s = alertaStyle[a.tipo];
            return (
              <div key={a.id} className="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-[#120c08] overflow-hidden">
                <div className={`w-1 self-stretch flex-shrink-0 ${s.bar}`} />
                <div className="py-3 pr-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm">{s.icon}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${areaColor[a.area] ?? ""}`}>{a.area}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700 dark:text-[#c9a46b]">{a.mensaje}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Lista de objetivos ── */}
      <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-800 dark:text-[#e8c48e] mb-3">Todos los Objetivos</h2>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {estados.map(e => (
              <button key={e} onClick={() => setFiltroEstado(e)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filtroEstado === e
                    ? "bg-amber-500 dark:bg-[#b88646] text-white"
                    : "bg-gray-100 dark:bg-[#120c08] text-gray-600 dark:text-[#c9a46b] hover:bg-gray-200 dark:hover:bg-[#1a1a1a]"
                }`}>
                {e === "Todos" ? "Todos" : estadoLabel[e as EstadoObj]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {areas.map(a => (
              <button key={a} onClick={() => setFiltroArea(a)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filtroArea === a
                    ? "bg-gray-700 dark:bg-[#3a2a1a] text-white dark:text-[#e8c48e]"
                    : "bg-gray-100 dark:bg-[#120c08] text-gray-600 dark:text-[#c9a46b] hover:bg-gray-200 dark:hover:bg-[#1a1a1a]"
                }`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-xl border border-gray-100 dark:border-[#2b2b2b] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#120c08]">
                {["Objetivo", "Área", "Responsable", "Avance", "Estado", "Límite"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-[#8b6b42]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((o, i) => (
                <tr key={o.id}
                  onClick={() => setSelectedObj(o)}
                  className={`border-t border-gray-100 dark:border-[#1f1f1f] cursor-pointer transition-colors
                    ${i % 2 === 0 ? "bg-white dark:bg-[#18110d]" : "bg-gray-50/50 dark:bg-[#101010]"}
                    hover:bg-amber-50 dark:hover:bg-[#1a1a1a]`}>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-[#e8c48e] max-w-[180px]">
                    <span className="line-clamp-1">{o.titulo}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${areaColor[o.area] ?? ""}`}>{o.area}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-[#8b6b42]">{o.responsable}</td>
                  <td className="px-4 py-3 min-w-[100px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <BarraProgreso pct={o.progreso} color="bg-amber-500 dark:bg-[#d4a15d]" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-[#c9a46b] w-8 text-right">{o.progreso}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoStyle[o.estado]}`}>{estadoLabel[o.estado]}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-[#8b6b42]">{formatFecha(o.fecha_limite)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedObj && <ModalObjetivo obj={selectedObj} onClose={() => setSelectedObj(null)} />}
    </div>
  );
}