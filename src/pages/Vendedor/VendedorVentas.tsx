// VendedorVentas.tsx
import { useEffect, useState } from "react";

const API = "http://localhost:8000/api";

interface Venta {
  id: string;
  id_raw: number;
  cliente: string;
  sucursal: string;
  fecha: string | null;
  id_cliente: number;
  id_sucursal: number;
}

interface Cliente  { id: number; nombre: string }
interface Sucursal { id: number; nombre: string; ubicacion: string }

interface FormData {
  id_cliente:  string;
  id_sucursal: string;
  fecha:       string;
}

const FORM_VACIO: FormData = { id_cliente: "", id_sucursal: "", fecha: "" };

export default function VendedorVentas() {
  const [ventas,       setVentas]       = useState<Venta[]>([]);
  const [clientes,     setClientes]     = useState<Cliente[]>([]);
  const [sucursales,   setSucursales]   = useState<Sucursal[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [buscar,       setBuscar]       = useState("");

  const [modalAbierto,  setModalAbierto]  = useState(false);
  const [modoEditar,    setModoEditar]    = useState(false);
  const [ventaEditando, setVentaEditando] = useState<Venta | null>(null);
  const [form,          setForm]          = useState<FormData>(FORM_VACIO);
  const [guardando,     setGuardando]     = useState(false);
  const [confirmarId,   setConfirmarId]   = useState<number | null>(null);

  const idEmpleado = localStorage.getItem("id_empleado") ?? "";

  // ── Carga ────────────────────────────────────────────────────
  const cargarVentas = () => {
    if (!idEmpleado) { setError("Sin sesión"); setLoading(false); return; }
    setLoading(true);
    fetch(`${API}/empleado-ventas/${idEmpleado}/`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setVentas(data);
        else throw new Error(data.error ?? "Error al cargar ventas");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarVentas();
    fetch(`${API}/clientes/`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setClientes(data); })
      .catch(console.error);
    fetch(`${API}/sucursales/`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSucursales(data); })
      .catch(console.error);
  }, []);

  // ── Filtro ────────────────────────────────────────────────────
  const filtradas = ventas.filter(
    (v) =>
      v.cliente.toLowerCase().includes(buscar.toLowerCase()) ||
      v.id.toLowerCase().includes(buscar.toLowerCase())
  );

  // ── Modales ───────────────────────────────────────────────────
  const abrirCrear = () => {
    setModoEditar(false);
    setVentaEditando(null);
    setForm(FORM_VACIO);
    setModalAbierto(true);
  };

  const abrirEditar = (v: Venta) => {
    setModoEditar(true);
    setVentaEditando(v);
    setForm({
      id_cliente:  String(v.id_cliente),
      id_sucursal: String(v.id_sucursal),
      fecha:       v.fecha ?? "",
    });
    setModalAbierto(true);
  };

  // ── Guardar ───────────────────────────────────────────────────
  const guardar = async () => {
    if (!form.id_cliente || !form.id_sucursal || !form.fecha) return;
    setGuardando(true);
    try {
      if (modoEditar && ventaEditando) {
        await fetch(`${API}/venta/editar/${ventaEditando.id_raw}/`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_cliente:  Number(form.id_cliente),
            id_sucursal: Number(form.id_sucursal),
            fecha:       form.fecha,
          }),
        });
      } else {
        await fetch(`${API}/venta/crear/`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_cliente:  Number(form.id_cliente),
            id_sucursal: Number(form.id_sucursal),
            id_empleado: Number(idEmpleado),
            fecha:       form.fecha,
          }),
        });
      }
      setModalAbierto(false);
      setForm(FORM_VACIO);
      cargarVentas();
    } catch (e) {
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };

  // ── Eliminar ──────────────────────────────────────────────────
  const eliminar = async (id: number) => {
    try {
      await fetch(`${API}/venta/eliminar/${id}/`, { method: "DELETE" });
      setConfirmarId(null);
      cargarVentas();
    } catch (e) {
      console.error(e);
    }
  };

  // ── Render ────────────────────────────────────────────────────
  if (loading) return <div className="p-6 text-amber-600 dark:text-[#e8b87a]">Cargando...</div>;
  if (error)   return <div className="p-6 text-red-400">Error: {error}</div>;

  const mesActual = new Date().toISOString().slice(0, 7);

  return (
    <div className="p-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Mis Ventas</h1>
          <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Historial de ventas realizadas</p>
        </div>
        <button
          onClick={abrirCrear}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
        >
          + Nueva venta
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total ventas",  value: ventas.length,                                                              sub: "registradas"     },
          { label: "Este mes",      value: ventas.filter((v) => v.fecha?.startsWith(mesActual)).length,                sub: "en el mes actual" },
          { label: "Sucursales",    value: new Set(ventas.map((v) => v.id_sucursal)).size,                             sub: "distintas"        },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{k.label}</p>
            <h2 className="mt-2 text-2xl font-bold text-amber-600 dark:text-[#e8b87a]">{k.value}</h2>
            <p className="mt-1 text-xs text-gray-400 dark:text-[#7a5a3a]">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <div className="mb-4">
          <input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por cliente o N°..."
            className="w-full rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#1e1408] px-4 py-2 text-sm text-gray-700 dark:text-[#f5deb3] outline-none focus:border-amber-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2e2119]">
                {["N° Venta", "Cliente", "Sucursal", "Fecha", "Acciones"].map((h) => (
                  <th key={h} className="pb-3 text-left font-medium text-gray-400 dark:text-[#9a7a5a]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-gray-400 dark:text-[#7a5a3a]">
                    No hay ventas registradas.
                  </td>
                </tr>
              ) : (
                filtradas.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-gray-50 dark:border-[#1e1408] last:border-0 hover:bg-amber-50/40 dark:hover:bg-[#1e1408] transition-colors"
                  >
                    <td className="py-3 font-mono text-xs text-amber-600 dark:text-[#e8b87a]">{v.id}</td>
                    <td className="py-3 font-medium text-gray-700 dark:text-[#f5deb3]">{v.cliente}</td>
                    <td className="py-3 text-gray-500 dark:text-[#9a7a5a]">{v.sucursal}</td>
                    <td className="py-3 text-gray-400 dark:text-[#7a5a3a]">{v.fecha ?? "—"}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => abrirEditar(v)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-100 dark:bg-[#2a1a0d] text-amber-700 dark:text-[#e8b87a] hover:bg-amber-200 dark:hover:bg-[#3a2a1a] transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmarId(v.id_raw)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear / editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1e140a] shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-[#f5deb3] mb-5">
              {modoEditar ? "Editar venta" : "Nueva venta"}
            </h2>

            <div className="space-y-4">
              {/* Cliente */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-[#9a7a5a] mb-1">Cliente</label>
                <select
                  value={form.id_cliente}
                  onChange={(e) => setForm({ ...form, id_cliente: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#18110d] text-gray-800 dark:text-[#f5deb3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Sucursal */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-[#9a7a5a] mb-1">Sucursal</label>
                <select
                  value={form.id_sucursal}
                  onChange={(e) => setForm({ ...form, id_sucursal: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#18110d] text-gray-800 dark:text-[#f5deb3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Seleccionar sucursal...</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
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
                disabled={guardando || !form.id_cliente || !form.id_sucursal || !form.fecha}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {guardando ? "Guardando..." : modoEditar ? "Guardar cambios" : "Registrar venta"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmarId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1e140a] shadow-xl p-6 text-center">
            <p className="text-gray-800 dark:text-[#f5deb3] font-semibold mb-2">¿Eliminar esta venta?</p>
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