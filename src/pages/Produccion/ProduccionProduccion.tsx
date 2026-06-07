import { useEffect, useState } from "react";

const API = "http://localhost:8000/api";

interface Lote {
  id: string;          // "LOT-001" (display)
  id_raw: number;      // id_produccion real para editar/eliminar
  id_producto: number;
  producto: string;
  cantidad: number;
  fecha: string | null;
  empleado: string;
}

interface Producto {
  id: number;
  nombre: string;
}

interface FormData {
  id_producto: string;
  fecha: string;
  cantidad: string;
}

const FORM_VACIO: FormData = { id_producto: "", fecha: "", cantidad: "" };

function getTurno(fecha: string | null) {
  if (!fecha) return { turno: "Mañana", inicio: "06:00", fin: "14:00" };
  const hora = new Date(fecha).getHours();
  if (hora < 14) return { turno: "Mañana", inicio: "06:00", fin: "14:00" };
  if (hora < 22) return { turno: "Tarde",  inicio: "14:00", fin: "22:00" };
  return              { turno: "Noche",  inicio: "22:00", fin: "06:00" };
}

export default function ProduccionProduccion() {
  const [lotes, setLotes]           = useState<Lote[]>([]);
  const [productos, setProductos]   = useState<Producto[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEditar, setModoEditar]     = useState(false);
  const [loteEditando, setLoteEditando] = useState<Lote | null>(null);
  const [form, setForm]                 = useState<FormData>(FORM_VACIO);
  const [guardando, setGuardando]       = useState(false);

  // Confirmación eliminar
  const [confirmarId, setConfirmarId] = useState<number | null>(null);

  const idEmpleado = localStorage.getItem("id_empleado") ?? "";

  // ── Carga inicial ──────────────────────────────────────────────
  const cargarLotes = () => {
    if (!idEmpleado) { setError("Sin sesión"); setLoading(false); return; }
    setLoading(true);
    fetch(`${API}/empleado-produccion/${idEmpleado}/`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setLotes(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarLotes();
    fetch(`${API}/productos/`)
      .then((r) => r.json())
      .then(setProductos)
      .catch(console.error);
  }, []);

  // ── Abrir modal ────────────────────────────────────────────────
  const abrirCrear = () => {
    setModoEditar(false);
    setLoteEditando(null);
    setForm(FORM_VACIO);
    setModalAbierto(true);
  };

  const abrirEditar = (l: Lote) => {
    setModoEditar(true);
    setLoteEditando(l);
    setForm({
      id_producto: String(l.id_producto),
      fecha:       l.fecha ?? "",
      cantidad:    String(l.cantidad),
    });
    setModalAbierto(true);
  };

  // ── Guardar (crear o editar) ───────────────────────────────────
  const guardar = async () => {
    if (!form.id_producto || !form.fecha || !form.cantidad) return;
    setGuardando(true);
    try {
      if (modoEditar && loteEditando) {
        await fetch(`${API}/produccion/editar/${loteEditando.id_raw}/`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            id_producto: Number(form.id_producto),
            fecha:       form.fecha,
            cantidad:    Number(form.cantidad),
          }),
        });
      } else {
        await fetch(`${API}/produccion/crear/`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            id_producto: Number(form.id_producto),
            id_empleado: Number(idEmpleado),
            fecha:       form.fecha,
            cantidad:    Number(form.cantidad),
          }),
        });
      }
      setModalAbierto(false);
      cargarLotes();
    } catch (e) {
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };

  // ── Eliminar ───────────────────────────────────────────────────
  const eliminar = async (id: number) => {
    try {
      await fetch(`${API}/produccion/eliminar/${id}/`, { method: "DELETE" });
      setConfirmarId(null);
      cargarLotes();
    } catch (e) {
      console.error(e);
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  if (loading) return <div className="p-6 text-amber-600 dark:text-[#e8b87a]">Cargando...</div>;
  if (error)   return <div className="p-6 text-red-400">Error: {error}</div>;

  return (
    <div className="p-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Producción</h1>
          <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Lotes de producción activos</p>
        </div>
        <button
          onClick={abrirCrear}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
        >
          + Nuevo lote
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {[
          { label: "En proceso",  value: lotes.length },
          { label: "Completados", value: 0 },
          { label: "Pendientes",  value: 0 },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{k.label}</p>
            <h2 className="mt-2 text-2xl font-bold text-amber-600 dark:text-[#e8b87a]">{k.value}</h2>
          </div>
        ))}
      </div>

      {/* Lista de lotes */}
      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        {lotes.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-[#7a5a3a] text-center py-8">
            No hay lotes registrados para este empleado.
          </p>
        ) : (
          <div className="space-y-3">
            {lotes.map((l) => {
              const t = getTurno(l.fecha);
              return (
                <div key={l.id} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-amber-600 dark:text-[#e8b87a]">{l.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-950 text-blue-400">
                          EN PROCESO
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 dark:text-[#f5deb3]">{l.producto}</p>
                      <p className="text-xs text-gray-400 dark:text-[#7a5a3a] mt-0.5">
                        Turno {t.turno} · {t.inicio} – {t.fin}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-[#7a5a3a]">
                        Fecha: {l.fecha ?? "—"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="text-lg font-bold text-amber-600 dark:text-[#e8b87a]">{l.cantidad} und</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => abrirEditar(l)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-100 dark:bg-[#2a1a0d] text-amber-700 dark:text-[#e8b87a] hover:bg-amber-200 dark:hover:bg-[#3a2a1a] transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmarId(l.id_raw)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal crear / editar ── */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1e140a] shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-[#f5deb3] mb-5">
              {modoEditar ? "Editar lote" : "Nuevo lote"}
            </h2>

            <div className="space-y-4">
              {/* Producto */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-[#9a7a5a] mb-1">Producto</label>
                <select
                  value={form.id_producto}
                  onChange={(e) => setForm({ ...form, id_producto: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#18110d] text-gray-800 dark:text-[#f5deb3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Seleccionar producto...</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-[#9a7a5a] mb-1">Fecha</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#18110d] text-gray-800 dark:text-[#f5deb3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-[#9a7a5a] mb-1">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={form.cantidad}
                  onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                  placeholder="Ej: 200"
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#18110d] text-gray-800 dark:text-[#f5deb3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-[#9a7a5a] hover:bg-gray-100 dark:hover:bg-[#2a1a0d] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando || !form.id_producto || !form.fecha || !form.cantidad}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {guardando ? "Guardando..." : modoEditar ? "Guardar cambios" : "Crear lote"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmar eliminar ── */}
      {confirmarId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1e140a] shadow-xl p-6 text-center">
            <p className="text-gray-800 dark:text-[#f5deb3] font-semibold mb-2">¿Eliminar este lote?</p>
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmarId(null)}
                className="px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-[#9a7a5a] hover:bg-gray-100 dark:hover:bg-[#2a1a0d] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminar(confirmarId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}