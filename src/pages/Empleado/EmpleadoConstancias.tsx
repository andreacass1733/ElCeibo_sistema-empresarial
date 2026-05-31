import { useState } from "react";

// ─── Tipos ────────────────────────────────────────────────
type Constancia = {
  id: number;
  curso: string;
  categoria: string;
  instructor: string;
  fecha_emision: string;
  fecha_curso_inicio: string;
  fecha_curso_fin: string;
  calificacion: number;
  duracion_dias: number;
  codigo: string;
};

// ─── Datos del empleado ───────────────────────────────────
const empleado = {
  nombre: "Luis Flores",
  cargo: "Vendedor",
  ci: "7845231",
  sucursal: "Sucursal Central",
  iniciales: "LF",
};

const constancias: Constancia[] = [
  {
    id: 1,
    curso: "Atención al Cliente",
    categoria: "Ventas",
    instructor: "Lic. Carmen Vidal",
    fecha_emision: "2026-05-21",
    fecha_curso_inicio: "2026-05-05",
    fecha_curso_fin: "2026-05-20",
    calificacion: 95,
    duracion_dias: 15,
    codigo: "CONST-2026-001",
  },
  {
    id: 2,
    curso: "Marketing Digital para Chocolatería",
    categoria: "Marketing",
    instructor: "Ing. Sebastián Cruz",
    fecha_emision: "2026-03-16",
    fecha_curso_inicio: "2026-03-01",
    fecha_curso_fin: "2026-03-15",
    calificacion: 92,
    duracion_dias: 14,
    codigo: "CONST-2026-002",
  },
  {
    id: 3,
    curso: "Técnicas de Venta y Negociación",
    categoria: "Ventas",
    instructor: "Lic. Roberto Salinas",
    fecha_emision: "2026-04-26",
    fecha_curso_inicio: "2026-04-10",
    fecha_curso_fin: "2026-04-25",
    calificacion: 88,
    duracion_dias: 15,
    codigo: "CONST-2026-003",
  },
];

// ─── Helpers ──────────────────────────────────────────────
const categoriaColor: Record<string, string> = {
  Ventas:     "bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a]",
  Marketing:  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Producción: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Gestión:    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

function formatFecha(f: string) {
  return new Date(f).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" });
}
function formatFechaCorta(f: string) {
  return new Date(f).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" });
}

function getNota(n: number) {
  if (n >= 90) return { label: "Excelente", color: "text-green-600 dark:text-green-400" };
  if (n >= 75) return { label: "Bueno",     color: "text-amber-600 dark:text-amber-400" };
  return             { label: "Regular",    color: "text-red-500 dark:text-red-400" };
}

// ─── Vista previa de constancia (modal) ──────────────────
function VistaConstancia({ c, onClose }: { c: Constancia; onClose: () => void }) {
  const nota = getNota(c.calificacion);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl">
        {/* Botones de acción */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors">
            ← Volver
          </button>
          <button
            onClick={() => alert(`Descargando: ${c.codigo}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 dark:bg-[#8b5e2a] hover:bg-amber-600 dark:hover:bg-[#a06e35] text-white text-sm font-semibold transition-colors">
            ⬇ Descargar PDF
          </button>
        </div>

        {/* Constancia */}
        <div className="rounded-2xl bg-white dark:bg-[#f5ede0] shadow-2xl overflow-hidden">
          {/* Franja superior decorativa */}
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
                <p className="text-xs text-gray-500">C.I. {empleado.ci} — {empleado.cargo}</p>
              </div>

              <p className="text-sm leading-relaxed">
                participó y aprobó satisfactoriamente el curso de capacitación:
              </p>

              <div className="mx-auto max-w-sm rounded-xl bg-amber-50 border border-amber-200 px-6 py-4">
                <p className="text-lg font-black text-amber-900">"{c.curso}"</p>
                <p className="text-xs text-amber-700 mt-1">🎓 Instructor: {c.instructor}</p>
              </div>

              <div className="flex justify-center gap-8 text-sm">
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Duración</p>
                  <p className="font-bold text-amber-900">{c.duracion_dias} días</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Período</p>
                  <p className="font-bold text-amber-900">{formatFechaCorta(c.fecha_curso_inicio)} – {formatFechaCorta(c.fecha_curso_fin)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Calificación</p>
                  <p className={`font-black text-lg ${nota.color}`}>{c.calificacion}/100</p>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Emitido en La Paz, Bolivia, el {formatFecha(c.fecha_emision)}.
              </p>
            </div>

            {/* Firmas */}
            <div className="mt-8 flex justify-around">
              {["Recursos Humanos", "Gerencia General"].map(firma => (
                <div key={firma} className="text-center">
                  <div className="w-32 border-b border-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">{firma}</p>
                  <p className="text-xs font-semibold text-amber-900">Chocolates DelCacao</p>
                </div>
              ))}
            </div>

            {/* Código de verificación */}
            <div className="mt-6 flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5">
              <div>
                <p className="text-xs text-gray-400">Código de verificación</p>
                <p className="text-xs font-mono font-bold text-gray-700">{c.codigo}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Documento válido</p>
                <p className="text-xs text-green-600 font-semibold">✓ Autenticado</p>
              </div>
            </div>
          </div>

          {/* Franja inferior */}
          <div className="h-3 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function EmpleadoConstancias() {
  const [vista, setVista] = useState<Constancia | null>(null);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">Constancias</h1>
      <p className="mt-2 text-gray-600 dark:text-[#cbb08b]">
        Documentos de aprobación de capacitaciones.
      </p>

      {/* Perfil */}
      <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-[#3a2010] flex items-center justify-center text-lg font-bold text-amber-700 dark:text-[#e8b87a] flex-shrink-0">
          {empleado.iniciales}
        </div>
        <div>
          <p className="font-bold text-gray-800 dark:text-[#f5deb3]">{empleado.nombre}</p>
          <div className="flex gap-2 mt-0.5 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-[#3a2010] dark:text-[#e8b87a] font-medium">
              {empleado.cargo}
            </span>
            <span className="text-xs text-gray-500 dark:text-[#9a7a5a]">📍 {empleado.sucursal}</span>
            <span className="text-xs text-gray-500 dark:text-[#9a7a5a]">C.I. {empleado.ci}</span>
          </div>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-black text-amber-600 dark:text-[#e8b87a]">{constancias.length}</p>
          <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">constancias</p>
        </div>
      </div>

      {/* Lista */}
      <div className="mt-5 space-y-3">
        {constancias.map(c => {
          const nota = getNota(c.calificacion);
          return (
            <div key={c.id}
              className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex items-center gap-4">

              {/* Medalla */}
              <div className="w-12 h-12 flex-shrink-0 rounded-full bg-amber-50 dark:bg-[#2a1a0d] flex items-center justify-center">
                <span className="text-xl">🎖</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoriaColor[c.categoria] ?? ""}`}>
                    {c.categoria}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-[#7a5c3a] font-mono">{c.codigo}</span>
                </div>
                <p className="font-bold text-gray-800 dark:text-[#f5deb3] truncate">{c.curso}</p>
                <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-gray-500 dark:text-[#9a7a5a]">
                  <span>🎓 {c.instructor}</span>
                  <span>📅 Emitida: {formatFechaCorta(c.fecha_emision)}</span>
                  <span className={`font-semibold ${nota.color}`}>✓ {c.calificacion}/100 — {nota.label}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => setVista(c)}
                  className="px-4 py-1.5 rounded-xl border border-amber-300 dark:border-[#5a3a1a] text-amber-700 dark:text-[#e8b87a] text-xs font-semibold hover:bg-amber-50 dark:hover:bg-[#2a1a0d] transition-colors">
                  Vista previa
                </button>
                <button
                  onClick={() => alert(`Descargando: ${c.codigo}`)}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 dark:bg-[#8b5e2a] hover:bg-amber-600 dark:hover:bg-[#a06e35] text-white text-xs font-semibold transition-colors">
                  ⬇ Descargar PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vista previa modal */}
      {vista && <VistaConstancia c={vista} onClose={() => setVista(null)} />}
    </div>
  );
}