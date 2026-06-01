import { useState, useEffect } from "react";

// ─── Tipos ────────────────────────────────────────────────
type Estado = "INSCRITO" | "COMPLETADO" | "ABANDONADO";

type Empleado = {
  id: number;
  nombre: string;
  cargo: string;
  estado: Estado;
  calificacion: number | null;
  fecha_asistencia: string;
};

type Capacitacion = {
  id: number;
  nombre: string;
  descripcion: string;
  instructor: string;
  fecha_inicio: string;
  fecha_fin: string;
  costo: number;
  categoria: string;
  empleados: Empleado[];
};

// ─── Tipo que devuelve Django (id_capacitacion en vez de id) ──
type CapacitacionAPI = {
  id_capacitacion: number;
  nombre: string;
  descripcion: string;
  instructor: string;
  fecha_inicio: string;
  fecha_fin: string;
  costo: number;
  empleados: Array<{
    id: number;
    nombre: string;
    cargo: string;
    estado: Estado;
    calificacion: number | null;
    fecha_asistencia: string;
  }>;
};

// ─── URL base de la API ───────────────────────────────────
// Crea un archivo .env en la raíz de tu proyecto React con:
//   VITE_API_URL=http://localhost:8000/api
const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? "http://127.0.0.1:8000/api";

// ─── Función para inferir categoría desde el nombre ───────
// Mientras no tengas columna "categoria" en tu tabla Capacitacion,
// esta función la deduce automáticamente del nombre del curso.
// Cuando agregues la columna en MySQL, Django la devolverá directo
// y podrás eliminar esta función.
function inferirCategoria(nombre: string): string {
  const n = nombre.toLowerCase();
  if (n.includes("venta") || n.includes("cliente") || n.includes("negociaci"))
    return "Ventas";
  if (n.includes("marketing") || n.includes("digital") || n.includes("redes"))
    return "Marketing";
  if (
    n.includes("producci") ||
    n.includes("calidad") ||
    n.includes("higiene")
  )
    return "Producción";
  return "Gestión";
}

// ─── Servicio: llama a Django REST Framework ──────────────
async function getCapacitaciones(): Promise<Capacitacion[]> {
  const res = await fetch(`${BASE_URL}/capacitaciones/`);
  if (!res.ok) throw new Error(`Error ${res.status}: no se pudo cargar las capacitaciones`);
  const data: CapacitacionAPI[] = await res.json();

  // Normaliza la respuesta de Django al tipo que usa el componente
  return data.map((c) => ({
    id: c.id_capacitacion,
    nombre: c.nombre,
    descripcion: c.descripcion ?? "",
    instructor: c.instructor ?? "",
    fecha_inicio: c.fecha_inicio,
    fecha_fin: c.fecha_fin,
    costo: Number(c.costo),
    categoria: inferirCategoria(c.nombre),
    empleados: c.empleados.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      cargo: e.cargo,
      estado: e.estado,
      calificacion: e.calificacion !== null ? Number(e.calificacion) : null,
      fecha_asistencia: e.fecha_asistencia,
    })),
  }));
}

// ─── Helpers ──────────────────────────────────────────────
const categoriaColor: Record<string, string> = {
  Ventas:
    "bg-[#f3e4cf] text-[#8b5e2a] dark:bg-[#3a2010] dark:text-[#e8b87a]",
  Marketing:
    "bg-[#ede0d0] text-[#9b6a3c] dark:bg-[#2f1d12] dark:text-[#d6a46b]",
  Producción:
    "bg-[#f0dfc8] text-[#8a5a2b] dark:bg-[#352114] dark:text-[#d9a066]",
  Gestión:
    "bg-[#eadbc8] text-[#7b5327] dark:bg-[#2d1c11] dark:text-[#cfa06a]",
};

const estadoStyle: Record<Estado, string> = {
  COMPLETADO:
    "bg-[#e9dcc8] text-[#7a5428] dark:bg-[#3a2414] dark:text-[#e8b87a]",
  INSCRITO:
    "bg-[#f1e4d1] text-[#9b6a3c] dark:bg-[#2f1d12] dark:text-[#d6a46b]",
  ABANDONADO:
    "bg-[#2a1612] text-[#c78b6b] dark:bg-[#2a1612] dark:text-[#d49a7a]",
};

const estadoLabel: Record<Estado, string> = {
  COMPLETADO: "Completado",
  INSCRITO: "En curso",
  ABANDONADO: "Abandonado",
};

function formatFecha(f: string) {
  return new Date(f).toLocaleDateString("es-BO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getEstadoCap(cap: Capacitacion): "proxima" | "activa" | "finalizada" {
  const hoy = new Date();
  const ini = new Date(cap.fecha_inicio);
  const fin = new Date(cap.fecha_fin);
  if (hoy < ini) return "proxima";
  if (hoy > fin) return "finalizada";
  return "activa";
}

const capEstadoStyle = {
  proxima:
    "bg-[#ede0d0] text-[#9b6a3c] dark:bg-[#2f1d12] dark:text-[#d6a46b]",
  activa:
    "bg-[#e9dcc8] text-[#7a5428] dark:bg-[#3a2414] dark:text-[#e8b87a]",
  finalizada:
    "bg-[#1f140d] text-[#9a7a5a] dark:bg-[#1f140d] dark:text-[#9a7a5a]",
};
const capEstadoLabel = {
  proxima: "Próxima",
  activa: "Activa",
  finalizada: "Finalizada",
};

// ─── Spinner de carga ─────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
    </div>
  );
}

// ─── Mensaje de error ─────────────────────────────────────
function ErrorMsg({ mensaje, onRetry }: { mensaje: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center gap-3 text-center">
      <span className="text-3xl">⚠️</span>
      <p className="text-red-600 dark:text-red-400 font-medium">{mensaje}</p>
      <p className="text-xs text-red-400 dark:text-red-500">
        Verifica que el servidor Django esté corriendo en{" "}
        <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">{BASE_URL}</code>
      </p>
      <button
        onClick={onRetry}
        className="mt-1 px-4 py-1.5 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}

// ─── Barra de progreso ────────────────────────────────────
function ProgressBar({
  completados,
  total,
}: {
  completados: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((completados / total) * 100);
  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500 dark:text-[#9a7a5a]">
          {completados}/{total} completaron
        </span>
        <span className="font-semibold text-gray-700 dark:text-[#cbb08b]">
          {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d]">
        <div
          className="h-full rounded-full bg-amber-500 dark:bg-[#c87941] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Estrellas de calificación ────────────────────────────
function Stars({ val }: { val: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={
            i <= Math.round(val / 2)
              ? "text-[#d6a46b]"
              : "text-gray-200 dark:text-[#2a1a0d]"
          }
          style={{ fontSize: 12 }}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-xs font-semibold text-gray-700 dark:text-[#cbb08b]">
        {val}
      </span>
    </div>
  );
}

// ─── Modal detalle capacitación ───────────────────────────
function ModalDetalle({
  cap,
  onClose,
}: {
  cap: Capacitacion;
  onClose: () => void;
}) {
  const completados = cap.empleados.filter((e) => e.estado === "COMPLETADO");
  const inscritos = cap.empleados.filter((e) => e.estado === "INSCRITO");
  const abandonados = cap.empleados.filter((e) => e.estado === "ABANDONADO");
  const promCal = completados.length
    ? (
        completados.reduce((a, e) => a + (e.calificacion ?? 0), 0) /
        completados.length
      ).toFixed(1)
    : "—";
  const estado = getEstadoCap(cap);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#18110d] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#18110d] flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-[#3a2a1a] z-10">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  categoriaColor[cap.categoria] ?? ""
                }`}
              >
                {cap.categoria}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${capEstadoStyle[estado]}`}
              >
                {capEstadoLabel[estado]}
              </span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-gray-800 dark:text-[#f5deb3]">
              {cap.nombre}
            </h2>
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">
              {cap.descripcion}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#cbb08b] dark:hover:bg-[#2a1a0d] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Info general */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Instructor", value: cap.instructor },
              { label: "Inicio", value: formatFecha(cap.fecha_inicio) },
              { label: "Fin", value: formatFecha(cap.fecha_fin) },
              { label: "Costo", value: `Bs. ${cap.costo.toLocaleString()}` },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-gray-50 dark:bg-[#120c08] p-3"
              >
                <p className="text-xs text-gray-400 dark:text-[#7a5c3a]">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-[#f5deb3]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Stats rápidos */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[#f1e4d1] dark:bg-[#2f1d12] p-3 text-center">
              <p className="text-2xl font-bold text-[#8b5e2a] dark:text-[#e8b87a]">
                {completados.length}
              </p>
              <p className="text-xs text-[#8b5e2a] dark:text-[#cfa06a]">
                Completaron
              </p>
            </div>
            <div className="rounded-xl bg-[#ede0d0] dark:bg-[#2f1d12] p-3 text-center">
              <p className="text-2xl font-bold text-[#9b6a3c] dark:text-[#d6a46b]">
                {inscritos.length}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-500">
                En curso
              </p>
            </div>
            <div className="rounded-xl bg-[#2a1612] dark:bg-[#2a1612] p-3 text-center">
              <p className="text-2xl font-bold text-[#c78b6b] dark:text-[#d49a7a]">
                {abandonados.length}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Abandonaron
              </p>
            </div>
          </div>

          {/* Progreso */}
          <ProgressBar
            completados={completados.length}
            total={cap.empleados.length}
          />

          {/* Calificación promedio */}
          {completados.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-[#120c08] px-4 py-3">
              <span className="text-sm text-gray-600 dark:text-[#cbb08b]">
                Calificación promedio:
              </span>
              <Stars val={parseFloat(promCal)} />
            </div>
          )}

          {/* Tabla empleados */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-[#cbb08b] mb-2">
              Participantes
            </h3>
            <div className="rounded-xl border border-gray-100 dark:border-[#3a2a1a] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#120c08]">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-[#9a7a5a]">
                      Empleado
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-[#9a7a5a]">
                      Cargo
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-[#9a7a5a]">
                      Estado
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 dark:text-[#9a7a5a]">
                      Calificación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cap.empleados.map((e, i) => (
                    <tr
                      key={e.id}
                      className={`border-t border-gray-100 dark:border-[#2a1a0d] ${
                        i % 2 === 0
                          ? "bg-white dark:bg-[#18110d]"
                          : "bg-gray-50/50 dark:bg-[#1a1209]"
                      }`}
                    >
                      <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-[#f5deb3]">
                        {e.nombre}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 dark:text-[#9a7a5a]">
                        {e.cargo}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoStyle[e.estado]}`}
                        >
                          {estadoLabel[e.estado]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {e.calificacion !== null ? (
                          <Stars val={e.calificacion} />
                        ) : (
                          <span className="text-gray-300 dark:text-[#3a2a1a] text-xs">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Card de capacitación ─────────────────────────────────
function CapCard({
  cap,
  onClick,
}: {
  cap: Capacitacion;
  onClick: () => void;
}) {
  const completados = cap.empleados.filter(
    (e) => e.estado === "COMPLETADO"
  ).length;
  const estado = getEstadoCap(cap);

  return (
    <button
      onClick={onClick}
      className="text-left w-full rounded-2xl bg-white dark:bg-[#18110d] p-5 shadow-sm hover:shadow-md dark:hover:shadow-[#3a2a1a]/40 transition-shadow group cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              categoriaColor[cap.categoria] ?? ""
            }`}
          >
            {cap.categoria}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${capEstadoStyle[estado]}`}
          >
            {capEstadoLabel[estado]}
          </span>
        </div>
        <span className="text-xs text-amber-600 dark:text-[#e8b87a] font-medium group-hover:underline flex-shrink-0">
          Ver detalle →
        </span>
      </div>

      <h2 className="mt-3 font-bold text-gray-800 dark:text-[#f5deb3]">
        {cap.nombre}
      </h2>
      <p className="mt-1 text-xs text-gray-500 dark:text-[#9a7a5a] line-clamp-2">
        {cap.descripcion}
      </p>

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-[#9a7a5a]">
        <span>🎓 {cap.instructor}</span>
        <span>📅 {formatFecha(cap.fecha_inicio)}</span>
        <span>💰 Bs. {cap.costo.toLocaleString()}</span>
      </div>

      <div className="mt-3">
        <ProgressBar completados={completados} total={cap.empleados.length} />
      </div>
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function Capacitacion() {
  // ── Estado de datos desde la API ──────────────────────────
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Estado de UI ──────────────────────────────────────────
  const [selected, setSelected] = useState<Capacitacion | null>(null);
  const [filtro, setFiltro] = useState<string>("Todos");

  // ── Carga de datos desde Django ───────────────────────────
  const cargarDatos = () => {
    setLoading(true);
    setError(null);
    getCapacitaciones()
      .then((data) => setCapacitaciones(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ── Filtros y resumen ─────────────────────────────────────
  const categorias = [
    "Todos",
    ...Array.from(new Set(capacitaciones.map((c) => c.categoria))),
  ];
  const lista =
    filtro === "Todos"
      ? capacitaciones
      : capacitaciones.filter((c) => c.categoria === filtro);

  const totalEmpleados = capacitaciones.flatMap((c) => c.empleados);
  const totalCompletados = totalEmpleados.filter(
    (e) => e.estado === "COMPLETADO"
  ).length;
  const totalInscritos = totalEmpleados.filter(
    (e) => e.estado === "INSCRITO"
  ).length;
  const costoTotal = capacitaciones.reduce((a, c) => a + c.costo, 0);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">
        Capacitaciones
      </h1>
      <p className="mt-2 text-gray-600 dark:text-[#cbb08b]">
        Gestión de cursos y entrenamientos internos.
      </p>

      {/* Estado de carga */}
      {loading && <Spinner />}

      {/* Estado de error */}
      {!loading && error && (
        <div className="mt-6">
          <ErrorMsg mensaje={error} onRetry={cargarDatos} />
        </div>
      )}

      {/* Contenido principal (solo cuando hay datos) */}
      {!loading && !error && (
        <>
          {/* Banner resumen */}
          <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 dark:text-[#7a5c3a] uppercase tracking-wide">
                Cursos activos
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">
                {capacitaciones.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-[#7a5c3a] uppercase tracking-wide">
                Completaron
              </p>
              <p className="text-2xl font-bold text-[#8b5e2a] dark:text-[#e8b87a]">
                {totalCompletados}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-[#7a5c3a] uppercase tracking-wide">
                En curso
              </p>
              <p className="text-2xl font-bold text-[#9b6a3c] dark:text-[#d6a46b]">
                {totalInscritos}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-[#7a5c3a] uppercase tracking-wide">
                Inversión total
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">
                Bs. {costoTotal.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filtros por categoría */}
          <div className="mt-5 flex flex-wrap gap-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltro(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filtro === cat
                    ? "bg-amber-500 dark:bg-[#8b5e2a] text-white"
                    : "bg-white dark:bg-[#18110d] text-gray-600 dark:text-[#cbb08b] border border-gray-200 dark:border-[#3a2a1a] hover:border-amber-300 dark:hover:border-[#8b5e2a]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Lista de capacitaciones */}
          <div className="mt-5 space-y-4">
            {lista.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#18110d] p-10 text-center text-gray-400 dark:text-[#7a5c3a]">
                No hay capacitaciones en esta categoría.
              </div>
            ) : (
              lista.map((cap) => (
                <CapCard
                  key={cap.id}
                  cap={cap}
                  onClick={() => setSelected(cap)}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Modal detalle */}
      {selected && (
        <ModalDetalle cap={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}