import { useEffect, useState } from "react";

const API = "http://localhost:8000/api";

const estadoStyle: Record<string, string> = {
  OK:      "bg-emerald-950 text-emerald-400",
  BAJO:    "bg-amber-950 text-amber-400",
  CRITICO: "bg-red-950 text-red-400",
};

const catStyle: Record<string, string> = {
  Tableta: "bg-blue-950 text-blue-400",
  Bombon:  "bg-purple-950 text-purple-400",
  Caja:    "bg-gray-800 text-gray-300",
};

interface Item {
  id: string; id_inv: number; nombre: string; categoria: string;
  stock: number; unidad: string; minimo: number; estado: string;
}

interface Producto { id: number; nombre: string; }
interface Sucursal { id: number; nombre: string; }

export default function AlmaceneroInventario() {
  const [items,     setItems]     = useState<Item[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [sucursales,setSucursales]= useState<Sucursal[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [buscar,    setBuscar]    = useState("");
  const [catFiltro, setCatFiltro] = useState("TODOS");

  // Modal
  const [modal, setModal] = useState<"crear" | "editar" | "eliminar" | null>(null);
  const [seleccionado, setSeleccionado] = useState<Item | null>(null);
  const [form, setForm] = useState({ id_producto: "", id_sucursal: "", stock: "" });
  const [guardando, setGuardando] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const cargar = () => {
    setLoading(true);
    fetch(`${API}/inventario/`)
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then((data) => { setItems(data); setLoading(false); })
      .catch((e)  => { setError(e.message); setLoading(false); });
  };

  useEffect(() => {
    cargar();
    Promise.all([
      fetch(`${API}/productos/`).then((r) => r.json()),
      fetch(`${API}/sucursales/`).then((r) => r.json()),
    ])
      .then(([productos, sucursales]) => {
        setProductos(productos);
        setSucursales(sucursales);
      })
      .catch(console.error);
  }, []);

  const categorias = ["TODOS", ...Array.from(new Set(items.map((i) => i.categoria)))];
  const filtrado = items.filter((item) => {
    const matchBuscar = item.nombre.toLowerCase().includes(buscar.toLowerCase()) || item.id.toLowerCase().includes(buscar.toLowerCase());
    const matchCat    = catFiltro === "TODOS" || item.categoria === catFiltro;
    return matchBuscar && matchCat;
  });
  const conteo = (e: string) => items.filter((i) => i.estado === e).length;

  const abrirCrear = () => {
    setForm({ id_producto: "", id_sucursal: "", stock: "" });
    setModalError(null);
    setModal("crear");
  };

  const abrirEditar = (item: Item) => {
    setSeleccionado(item);
    setForm({ id_producto: "", id_sucursal: "", stock: String(item.stock) });
    setModalError(null);
    setModal("editar");
  };

  const abrirEliminar = (item: Item) => {
    setSeleccionado(item);
    setModalError(null);
    setModal("eliminar");
  };

  const cerrar = () => { setModal(null); setSeleccionado(null); setModalError(null); };

  const guardarCrear = async () => {
    if (!form.id_producto || !form.id_sucursal || !form.stock) {
      setModalError("Todos los campos son requeridos."); return;
    }
    setGuardando(true);
    try {
      const r = await fetch(`${API}/inventario/crear/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_producto: Number(form.id_producto),
          id_sucursal: Number(form.id_sucursal),
          stock:       Number(form.stock),
        }),
      });
      const data = await r.json();
      if (!r.ok) { setModalError(data.error || "Error al crear."); return; }
      cerrar(); cargar();
    } catch { setModalError("Error de conexión."); }
    finally { setGuardando(false); }
  };

  const guardarEditar = async () => {
    if (!form.stock) { setModalError("El stock es requerido."); return; }
    setGuardando(true);
    try {
      const r = await fetch(`${API}/inventario/editar/${seleccionado!.id_inv}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: Number(form.stock) }),
      });
      const data = await r.json();
      if (!r.ok) { setModalError(data.error || "Error al editar."); return; }
      cerrar(); cargar();
    } catch { setModalError("Error de conexión."); }
    finally { setGuardando(false); }
  };

  const confirmarEliminar = async () => {
    setGuardando(true);
    try {
      await fetch(`${API}/inventario/eliminar/${seleccionado!.id_inv}/`, { method: "DELETE" });
      cerrar(); cargar();
    } catch { setModalError("Error de conexión."); }
    finally { setGuardando(false); }
  };

  const inputCls = "w-full rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#1e1408] px-4 py-2 text-sm text-gray-700 dark:text-[#f5deb3] outline-none focus:border-amber-500";
  const labelCls = "block text-xs text-gray-500 dark:text-[#9a7a5a] mb-1";

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Inventario</h1>
          <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Estado actual del almacén</p>
        </div>
        <button onClick={abrirCrear}
          className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-sm font-medium transition-colors">
          + Agregar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Ítems", value: items.length },
          { label: "Stock OK",    value: conteo("OK") },
          { label: "Stock Bajo",  value: conteo("BAJO") },
          { label: "Crítico",     value: conteo("CRITICO") },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{k.label}</p>
            <h2 className="mt-2 text-2xl font-bold text-amber-600 dark:text-[#e8b87a]">{k.value}</h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        {/* Filtros */}
        <div className="mb-4 flex flex-wrap gap-3">
          <input value={buscar} onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar ítem..."
            className="flex-1 min-w-[180px] rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#1e1408] px-4 py-2 text-sm text-gray-700 dark:text-[#f5deb3] outline-none focus:border-amber-500"
          />
          <div className="flex gap-2 flex-wrap">
            {categorias.map((c) => (
              <button key={c} onClick={() => setCatFiltro(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors
                  ${catFiltro === c
                    ? "bg-amber-600 text-white dark:bg-[#4B2E1E] dark:text-[#f5c16c]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1e1408] dark:text-[#9a7a5a]"
                  }`}
              >{c}</button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-amber-500">
            <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando...
          </div>
        )}
        {error && <div className="rounded-xl bg-red-950 px-4 py-3 text-sm text-red-400">Error: {error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#2e2119]">
                  {["Código","Nombre","Categoría","Stock","Mínimo","Estado",""].map((h) => (
                    <th key={h} className="pb-3 text-left font-medium text-gray-400 dark:text-[#9a7a5a]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrado.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 dark:border-[#1e1408] last:border-0 hover:bg-amber-50/30 dark:hover:bg-[#1e1408] transition-colors">
                    <td className="py-3 font-mono text-xs text-amber-600 dark:text-[#e8b87a]">{item.id}</td>
                    <td className="py-3 font-medium text-gray-700 dark:text-[#f5deb3]">{item.nombre}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catStyle[item.categoria] ?? "bg-gray-800 text-gray-300"}`}>
                        {item.categoria}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-gray-800 dark:text-[#e8c080]">{item.stock} {item.unidad}</td>
                    <td className="py-3 text-gray-400 dark:text-[#7a5a3a]">{item.minimo} {item.unidad}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoStyle[item.estado]}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => abrirEditar(item)}
                          className="rounded-lg bg-amber-100 dark:bg-[#2e1e0e] text-amber-700 dark:text-[#e8b87a] px-2 py-1 text-xs hover:bg-amber-200 transition-colors">
                          Editar
                        </button>
                        <button onClick={() => abrirEliminar(item)}
                          className="rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-2 py-1 text-xs hover:bg-red-200 transition-colors">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrado.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-sm text-gray-400">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL CREAR ── */}
      {modal === "crear" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#18110d] p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-[#f5deb3]">Agregar al inventario</h2>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Producto</label>
                <select value={form.id_producto} onChange={(e) => setForm({ ...form, id_producto: e.target.value })} className={inputCls}>
                  <option value="">Seleccionar...</option>
                  {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Sucursal</label>
                <select value={form.id_sucursal} onChange={(e) => setForm({ ...form, id_sucursal: e.target.value })} className={inputCls}>
                  <option value="">Seleccionar...</option>
                  {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Stock inicial</label>
                <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputCls} placeholder="0" />
              </div>
            </div>
            {modalError && <p className="mt-3 text-xs text-red-400">{modalError}</p>}
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={cerrar} className="rounded-xl px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2e2119] transition-colors">Cancelar</button>
              <button onClick={guardarCrear} disabled={guardando}
                className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50">
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDITAR ── */}
      {modal === "editar" && seleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#18110d] p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-bold text-gray-800 dark:text-[#f5deb3]">Editar stock</h2>
            <p className="mb-4 text-sm text-gray-400 dark:text-[#9a7a5a]">{seleccionado.nombre}</p>
            <div>
              <label className={labelCls}>Nuevo stock</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputCls} />
            </div>
            {modalError && <p className="mt-3 text-xs text-red-400">{modalError}</p>}
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={cerrar} className="rounded-xl px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2e2119] transition-colors">Cancelar</button>
              <button onClick={guardarEditar} disabled={guardando}
                className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50">
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ELIMINAR ── */}
      {modal === "eliminar" && seleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#18110d] p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-bold text-gray-800 dark:text-[#f5deb3]">¿Eliminar registro?</h2>
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">
              Se eliminará <span className="font-medium text-gray-700 dark:text-[#f5deb3]">{seleccionado.nombre}</span> del inventario. Esta acción no se puede deshacer.
            </p>
            {modalError && <p className="mt-3 text-xs text-red-400">{modalError}</p>}
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={cerrar} className="rounded-xl px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2e2119] transition-colors">Cancelar</button>
              <button onClick={confirmarEliminar} disabled={guardando}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50">
                {guardando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}