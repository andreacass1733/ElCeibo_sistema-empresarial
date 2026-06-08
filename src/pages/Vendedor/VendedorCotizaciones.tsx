// VendedorCotizaciones.tsx
import { useState } from "react";

interface Cotizacion {
  id:        string;
  cliente:   string;
  productos: number;
  total:     number;
  fecha:     string;
  vence:     string;
  estado:    "BORRADOR" | "ENVIADA" | "ACEPTADA" | "RECHAZADA";
}

interface FormData {
  cliente:   string;
  productos: string;
  total:     string;
  fecha:     string;
  vence:     string;
}

const FORM_VACIO: FormData = { cliente: "", productos: "", total: "", fecha: "", vence: "" };

const estadoStyle: Record<string, string> = {
  BORRADOR:  "bg-gray-800 text-gray-300",
  ENVIADA:   "bg-blue-950 text-blue-400",
  ACEPTADA:  "bg-emerald-950 text-emerald-400",
  RECHAZADA: "bg-red-950 text-red-400",
};

const ESTADOS = ["TODAS", "BORRADOR", "ENVIADA", "ACEPTADA", "RECHAZADA"] as const;

let nextId = 6;

const INICIAL: Cotizacion[] = [
  { id: "COT-001", cliente: "Hotel Europa",         productos: 3, total: 1200, fecha: "2025-06-01", vence: "2025-06-15", estado: "ENVIADA"   },
  { id: "COT-002", cliente: "Tienda Dulce Vida",    productos: 1, total: 380,  fecha: "2025-06-02", vence: "2025-06-16", estado: "ACEPTADA"  },
  { id: "COT-003", cliente: "Supermercado Central", productos: 5, total: 2300, fecha: "2025-06-03", vence: "2025-06-17", estado: "ENVIADA"   },
  { id: "COT-004", cliente: "Cafetería Aromas",     productos: 2, total: 650,  fecha: "2025-06-04", vence: "2025-06-10", estado: "RECHAZADA" },
  { id: "COT-005", cliente: "Repostería La Paz",    productos: 4, total: 910,  fecha: "2025-06-05", vence: "2025-06-19", estado: "BORRADOR"  },
];

export default function VendedorCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>(INICIAL);
  const [filtro,       setFiltro]       = useState<string>("TODAS");

  const [modalAbierto,  setModalAbierto]  = useState(false);
  const [modoEditar,    setModoEditar]    = useState(false);
  const [cotEdit,       setCotEdit]       = useState<Cotizacion | null>(null);
  const [form,          setForm]          = useState<FormData>(FORM_VACIO);
  const [confirmarId,   setConfirmarId]   = useState<string | null>(null);

  const filtradas = filtro === "TODAS"
    ? cotizaciones
    : cotizaciones.filter((c) => c.estado === filtro);

  // ── Modales ───────────────────────────────────────────────────
  const abrirCrear = () => {
    setModoEditar(false);
    setCotEdit(null);
    setForm(FORM_VACIO);
    setModalAbierto(true);
  };

  const abrirEditar = (c: Cotizacion) => {
    setModoEditar(true);
    setCotEdit(c);
    setForm({
      cliente:   c.cliente,
      productos: String(c.productos),
      total:     String(c.total),
      fecha:     c.fecha,
      vence:     c.vence,
    });
    setModalAbierto(true);
  };

  // ── Guardar ───────────────────────────────────────────────────
  const guardar = () => {
    if (!form.cliente || !form.productos || !form.total || !form.fecha || !form.vence) return;

    if (modoEditar && cotEdit) {
      setCotizaciones((prev) =>
        prev.map((c) =>
          c.id === cotEdit.id
            ? { ...c, cliente: form.cliente, productos: Number(form.productos), total: Number(form.total), fecha: form.fecha, vence: form.vence }
            : c
        )
      );
    } else {
      const nueva: Cotizacion = {
        id:        `COT-${String(nextId++).padStart(3, "0")}`,
        cliente:   form.cliente,
        productos: Number(form.productos),
        total:     Number(form.total),
        fecha:     form.fecha,
        vence:     form.vence,
        estado:    "BORRADOR",
      };
      setCotizaciones((prev) => [nueva, ...prev]);
    }
    setModalAbierto(false);
    setForm(FORM_VACIO);
  };

  // ── Cambiar estado ────────────────────────────────────────────
  const cambiarEstado = (id: string, estado: Cotizacion["estado"]) => {
    setCotizaciones((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado } : c))
    );
  };

  // ── Eliminar ──────────────────────────────────────────────────
  const eliminar = (id: string) => {
    setCotizaciones((prev) => prev.filter((c) => c.id !== id));
    setConfirmarId(null);
  };

  const totalAceptado = cotizaciones
    .filter((c) => c.estado === "ACEPTADA")
    .reduce((a, c) => a + c.total, 0);

  return (
    <div className="p-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Cotizaciones</h1>
          <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Gestión de cotizaciones a clientes</p>
        </div>
        <button
          onClick={abrirCrear}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
        >
          + Nueva cotización
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",      value: cotizaciones.length,                                          sub: "registradas",  color: "text-amber-600 dark:text-[#e8b87a]"   },
          { label: "Enviadas",   value: cotizaciones.filter((c) => c.estado === "ENVIADA").length,    sub: "en espera",    color: "text-blue-500"                         },
          { label: "Aceptadas",  value: cotizaciones.filter((c) => c.estado === "ACEPTADA").length,   sub: "confirmadas",  color: "text-emerald-500"                      },
          { label: "Monto (Bs)", value: totalAceptado.toLocaleString(),                               sub: "aceptado",     color: "text-amber-600 dark:text-[#e8b87a]"   },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{k.label}</p>
            <h2 className={`mt-2 text-2xl font-bold ${k.color}`}>{k.value}</h2>
            <p className="mt-1 text-xs text-gray-400 dark:text-[#7a5a3a]">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors
              ${filtro === e
                ? "bg-amber-600 text-white dark:bg-[#4B2E1E] dark:text-[#f5c16c]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1e1408] dark:text-[#9a7a5a] dark:hover:bg-[#2a1a0d]"
              }`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        {filtradas.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-[#7a5a3a] text-center py-10">
            No hay cotizaciones en esta categoría.
          </p>
        ) : (
          <div className="space-y-3">
            {filtradas.map((c) => (
              <div key={c.id} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
                <div className="flex items-start justify-between flex-wrap gap-3">

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs text-amber-600 dark:text-[#e8b87a]">{c.id}</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${estadoStyle[c.estado]}`}>
                        {c.estado}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-[#f5deb3] truncate">{c.cliente}</p>
                    <p className="text-xs text-gray-400 dark:text-[#7a5a3a] mt-0.5">
                      {c.productos} producto(s) · Emitida: {c.fecha} · Vence: {c.vence}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xl font-bold text-amber-600 dark:text-[#e8b87a]">
                      Bs {c.total.toLocaleString()}
                    </p>

                    {/* Cambiar estado rápido */}
                    <select
                      value={c.estado}
                      onChange={(e) => cambiarEstado(c.id, e.target.value as Cotizacion["estado"])}
                      className="rounded-lg border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#1e1408] text-gray-700 dark:text-[#f5deb3] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="BORRADOR">BORRADOR</option>
                      <option value="ENVIADA">ENVIADA</option>
                      <option value="ACEPTADA">ACEPTADA</option>
                      <option value="RECHAZADA">RECHAZADA</option>
                    </select>

                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirEditar(c)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-100 dark:bg-[#2a1a0d] text-amber-700 dark:text-[#e8b87a] hover:bg-amber-200 dark:hover:bg-[#3a2a1a] transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmarId(c.id)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal crear / editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1e140a] shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-[#f5deb3] mb-5">
              {modoEditar ? "Editar cotización" : "Nueva cotización"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-[#9a7a5a] mb-1">Cliente</label>
                <input
                  type="text"
                  value={form.cliente}
                  onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                  placeholder="Nombre del cliente"
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#18110d] text-gray-800 dark:text-[#f5deb3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-[#9a7a5a] mb-1">N° productos</label>
                  <input
                    type="number"
                    min={1}
                    value={form.productos}
                    onChange={(e) => setForm({ ...form, productos: e.target.value })}
                    placeholder="Ej: 3"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#18110d] text-gray-800 dark:text-[#f5deb3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-[#9a7a5a] mb-1">Total (Bs)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.total}
                    onChange={(e) => setForm({ ...form, total: e.target.value })}
                    placeholder="Ej: 1200"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#18110d] text-gray-800 dark:text-[#f5deb3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-[#9a7a5a] mb-1">Fecha emisión</label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#18110d] text-gray-800 dark:text-[#f5deb3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-[#9a7a5a] mb-1">Fecha vencimiento</label>
                  <input
                    type="date"
                    value={form.vence}
                    onChange={(e) => setForm({ ...form, vence: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#18110d] text-gray-800 dark:text-[#f5deb3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-[#9a7a5a] hover:bg-gray-100 dark:hover:bg-[#2a1a0d] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={!form.cliente || !form.productos || !form.total || !form.fecha || !form.vence}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {modoEditar ? "Guardar cambios" : "Crear cotización"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmarId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1e140a] shadow-xl p-6 text-center">
            <p className="text-gray-800 dark:text-[#f5deb3] font-semibold mb-2">¿Eliminar esta cotización?</p>
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