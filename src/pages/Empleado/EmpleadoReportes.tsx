import { useState } from "react";

// ─── Tipos ────────────────────────────────────────────────
type TipoReporte = "asistencia" | "productividad" | "capacitaciones";
type EstadoReporte = "listo" | "generando" | "pendiente";

type Reporte = {
  id: number;
  tipo: TipoReporte;
  titulo: string;
  descripcion: string;
  periodo: string;
  fecha_generado: string;
  estado: EstadoReporte;
  icono: string;
  paginas: number;
  resumen: ResumenItem[];
};

type ResumenItem = { label: string; valor: string };

// ─── Empleado ─────────────────────────────────────────────
const empleado = {
  nombre: "Luis Flores",
  cargo: "Vendedor",
  sucursal: "Sucursal Central",
  iniciales: "LF",
};

// ─── Reportes ─────────────────────────────────────────────
const reportes: Reporte[] = [
  {
    id: 1,
    tipo: "asistencia",
    titulo: "Reporte de Asistencia",
    descripcion: "Registro mensual de entradas, salidas, ausencias y tardanzas del empleado.",
    periodo: "Mayo 2026",
    fecha_generado: "2026-05-30",
    estado: "listo",
    icono: "📅",
    paginas: 3,
    resumen: [
      { label: "Días trabajados",  valor: "22 / 23" },
      { label: "Llegadas a tiempo", valor: "21 días" },
      { label: "Tardanzas",        valor: "1 día" },
      { label: "Ausencias",        valor: "0 días" },
      { label: "Horas extra",      valor: "4 hrs" },
      { label: "Puntualidad",      valor: "95%" },
    ],
  },
  {
    id: 2,
    tipo: "productividad",
    titulo: "Reporte de Productividad",
    descripcion: "Análisis de ventas realizadas, cumplimiento de metas y rendimiento mensual.",
    periodo: "Mayo 2026",
    fecha_generado: "2026-05-30",
    estado: "listo",
    icono: "⚡",
    paginas: 5,
    resumen: [
      { label: "Ventas realizadas",   valor: "Bs. 15,840" },
      { label: "Meta mensual",        valor: "Bs. 14,000" },
      { label: "Cumplimiento",        valor: "113%" },
      { label: "Clientes atendidos",  valor: "87" },
      { label: "Ticket promedio",     valor: "Bs. 182" },
      { label: "Devoluciones",        valor: "1.8%" },
    ],
  },
  {
    id: 3,
    tipo: "capacitaciones",
    titulo: "Reporte de Capacitaciones",
    descripcion: "Historial de cursos completados, calificaciones obtenidas y constancias emitidas.",
    periodo: "Enero – Mayo 2026",
    fecha_generado: "2026-05-28",
    estado: "listo",
    icono: "📚",
    paginas: 4,
    resumen: [
      { label: "Cursos completados",    valor: "3 / 4" },
      { label: "Calificación promedio", valor: "91.7 / 100" },
      { label: "Horas de formación",    valor: "44 hrs" },
      { label: "Constancias emitidas",  valor: "3" },
      { label: "Inversión empresa",     valor: "Bs. 3,000" },
      { label: "Estado general",        valor: "Aprobado" },
    ],
  },
  {
    id: 4,
    tipo: "productividad",
    titulo: "Reporte de Productividad",
    descripcion: "Análisis de ventas realizadas, cumplimiento de metas y rendimiento mensual.",
    periodo: "Abril 2026",
    fecha_generado: "2026-04-30",
    estado: "listo",
    icono: "⚡",
    paginas: 5,
    resumen: [
      { label: "Ventas realizadas",  valor: "Bs. 13,200" },
      { label: "Meta mensual",       valor: "Bs. 14,000" },
      { label: "Cumplimiento",       valor: "94%" },
      { label: "Clientes atendidos", valor: "74" },
      { label: "Ticket promedio",    valor: "Bs. 178" },
      { label: "Devoluciones",       valor: "2.4%" },
    ],
  },
  {
    id: 5,
    tipo: "asistencia",
    titulo: "Reporte de Asistencia",
    descripcion: "Registro mensual de entradas, salidas, ausencias y tardanzas del empleado.",
    periodo: "Abril 2026",
    fecha_generado: "2026-04-30",
    estado: "listo",
    icono: "📅",
    paginas: 3,
    resumen: [
      { label: "Días trabajados",   valor: "21 / 22" },
      { label: "Llegadas a tiempo", valor: "19 días" },
      { label: "Tardanzas",         valor: "2 días" },
      { label: "Ausencias",         valor: "1 día" },
      { label: "Horas extra",       valor: "0 hrs" },
      { label: "Puntualidad",       valor: "90%" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────
const tipoColor: Record<TipoReporte, string> = {
  asistencia:     "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  productividad:  "bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a]",
  capacitaciones: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

const tipoLabel: Record<TipoReporte, string> = {
  asistencia:     "Asistencia",
  productividad:  "Productividad",
  capacitaciones: "Capacitaciones",
};

const estadoBadge: Record<EstadoReporte, string> = {
  listo:      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  generando:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  pendiente:  "bg-gray-100 text-gray-500 dark:bg-[#2a1a0d] dark:text-[#9a7a5a]",
};

const estadoLabel: Record<EstadoReporte, string> = {
  listo:     "Listo",
  generando: "Generando...",
  pendiente: "Pendiente",
};

function formatFecha(f: string) {
  return new Date(f).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" });
}

const tiposUnicos = ["Todos", "asistencia", "productividad", "capacitaciones"] as const;

// ─── Vista previa modal ───────────────────────────────────
function ModalReporte({ rep, onClose }: { rep: Reporte; onClose: () => void }) {
  const [descargando, setDescargando] = useState(false);

  function handleDescargar() {
    setDescargando(true);
    setTimeout(() => {
      setDescargando(false);
      alert(`✓ ${rep.titulo} — ${rep.periodo} descargado.`);
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-auto">

        {/* Barra de acciones */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose}
            className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1">
            ← Volver
          </button>
          <button onClick={handleDescargar} disabled={descargando}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 dark:bg-[#8b5e2a] hover:bg-amber-600 dark:hover:bg-[#a06e35] disabled:opacity-60 text-white text-sm font-semibold transition-colors">
            {descargando ? "⏳ Descargando..." : "⬇ Descargar PDF"}
          </button>
        </div>

        {/* Documento simulado */}
        <div className="rounded-2xl bg-white dark:bg-[#f5ede0] shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto">
          {/* Franja */}
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
                <p className="text-sm font-bold text-amber-900">{formatFecha(rep.fecha_generado)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{rep.paginas} páginas</p>
              </div>
            </div>

            {/* Título del reporte */}
            <div className="text-center mb-6">
              <p className="text-xs font-bold tracking-[0.25em] text-amber-700 uppercase">{rep.periodo}</p>
              <h1 className="text-2xl font-black text-amber-900 mt-1">{rep.titulo}</h1>
              <p className="text-xs text-gray-500 mt-1">{rep.descripcion}</p>
            </div>

            {/* Datos del empleado */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 mb-5">
              <p className="text-xs text-amber-700 font-bold uppercase tracking-wide mb-2">Empleado</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Nombre</p>
                  <p className="font-bold text-amber-900">{empleado.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cargo</p>
                  <p className="font-bold text-amber-900">{empleado.cargo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Sucursal</p>
                  <p className="font-bold text-amber-900">{empleado.sucursal}</p>
                </div>
              </div>
            </div>

            {/* Resumen de datos */}
            <div className="mb-5">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-3">Resumen del período</p>
              <div className="grid grid-cols-2 gap-2.5">
                {rep.resumen.map((item, i) => (
                  <div key={i}
                    className={`rounded-xl px-4 py-3 ${i % 2 === 0 ? "bg-gray-50 border border-gray-200" : "bg-amber-50 border border-amber-200"}`}>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-base font-black text-amber-900">{item.valor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Firmas */}
            <div className="mt-6 flex justify-around">
              {["Recursos Humanos", "Supervisor directo"].map(f => (
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
                <p className="text-xs font-mono font-bold text-gray-700">
                  RPT-{rep.tipo.toUpperCase().slice(0, 3)}-{rep.fecha_generado.replace(/-/g, "")}-{String(rep.id).padStart(3, "0")}
                </p>
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

// ─── Componente principal ─────────────────────────────────
export default function EmpleadoReportes() {
  const [selected, setSelected]       = useState<Reporte | null>(null);
  const [filtro, setFiltro]           = useState<string>("Todos");
  const [descargandoId, setDescargandoId] = useState<number | null>(null);

  function handleDescargarDirecto(rep: Reporte, e: React.MouseEvent) {
    e.stopPropagation();
    setDescargandoId(rep.id);
    setTimeout(() => {
      setDescargandoId(null);
      alert(`✓ ${rep.titulo} — ${rep.periodo} descargado.`);
    }, 1500);
  }

  const lista = filtro === "Todos" ? reportes : reportes.filter(r => r.tipo === filtro);

  // Agrupar por período para mostrar sección
  const periodos = Array.from(new Set(lista.map(r => r.periodo)));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">Mis Reportes</h1>
      <p className="mt-2 text-gray-600 dark:text-[#cbb08b]">Documentos generados de tu actividad laboral.</p>

      {/* ── Perfil ── */}
      <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-[#3a2010] flex items-center justify-center text-lg font-bold text-amber-700 dark:text-[#e8b87a] flex-shrink-0">
          {empleado.iniciales}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 dark:text-[#f5deb3]">{empleado.nombre}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a] font-medium">
              {empleado.cargo}
            </span>
            <span className="text-xs text-gray-500 dark:text-[#9a7a5a]">📍 {empleado.sucursal}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-3xl font-black text-amber-600 dark:text-[#e8b87a]">{reportes.length}</p>
          <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">reportes</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Asistencia",     val: reportes.filter(r => r.tipo === "asistencia").length,     color: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Productividad",  val: reportes.filter(r => r.tipo === "productividad").length,  color: "text-amber-600 dark:text-[#e8b87a]",   bg: "bg-amber-50 dark:bg-[#2a1a0d]" },
          { label: "Capacitaciones", val: reportes.filter(r => r.tipo === "capacitaciones").length, color: "text-purple-600 dark:text-purple-400",  bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl ${s.bg} shadow-sm p-4 text-center`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-500 dark:text-[#9a7a5a] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filtros ── */}
      <div className="mt-5 flex flex-wrap gap-2">
        {tiposUnicos.map(t => (
          <button key={t} onClick={() => setFiltro(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtro === t
                ? "bg-amber-500 dark:bg-[#8b5e2a] text-white"
                : "bg-white dark:bg-[#18110d] text-gray-600 dark:text-[#cbb08b] border border-gray-200 dark:border-[#3a2a1a] hover:border-amber-300 dark:hover:border-[#8b5e2a]"
            }`}>
            {t === "Todos" ? "Todos" : tipoLabel[t]}
          </button>
        ))}
      </div>

      {/* ── Lista agrupada por período ── */}
      <div className="mt-5 space-y-6">
        {periodos.map(periodo => (
          <div key={periodo}>
            <p className="text-xs font-bold text-gray-500 dark:text-[#9a7a5a] uppercase tracking-widest mb-3">
              📆 {periodo}
            </p>
            <div className="space-y-3">
              {lista.filter(r => r.periodo === periodo).map(rep => (
                <div key={rep.id}
                  className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex items-center gap-4">

                  {/* Icono */}
                  <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-amber-50 dark:bg-[#2a1a0d] flex items-center justify-center text-2xl">
                    {rep.icono}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tipoColor[rep.tipo]}`}>
                        {tipoLabel[rep.tipo]}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoBadge[rep.estado]}`}>
                        {estadoLabel[rep.estado]}
                      </span>
                    </div>
                    <p className="font-bold text-gray-800 dark:text-[#f5deb3] truncate">{rep.titulo}</p>
                    <div className="flex flex-wrap gap-x-3 mt-0.5 text-xs text-gray-500 dark:text-[#9a7a5a]">
                      <span>🗓 {formatFecha(rep.fecha_generado)}</span>
                      <span>📄 {rep.paginas} páginas</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => setSelected(rep)}
                      className="px-4 py-1.5 rounded-xl border border-amber-300 dark:border-[#5a3a1a] text-amber-700 dark:text-[#e8b87a] text-xs font-semibold hover:bg-amber-50 dark:hover:bg-[#2a1a0d] transition-colors">
                      Vista previa
                    </button>
                    <button
                      onClick={(e) => handleDescargarDirecto(rep, e)}
                      disabled={descargandoId === rep.id}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 dark:bg-[#8b5e2a] hover:bg-amber-600 dark:hover:bg-[#a06e35] disabled:opacity-60 text-white text-xs font-semibold transition-colors">
                      {descargandoId === rep.id ? "⏳..." : "⬇ PDF"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && <ModalReporte rep={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}