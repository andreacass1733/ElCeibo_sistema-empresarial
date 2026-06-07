import { useEffect, useState } from "react";

const API = "http://localhost:8000/api";

interface Cliente {
  id:     number;
  nombre: string;
}

export default function VendedorClientes() {
  const [clientes,    setClientes]    = useState<Cliente[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [buscar,      setBuscar]      = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEditar,   setModoEditar]   = useState(false);
  const [clienteEdit,  setClienteEdit]  = useState<Cliente | null>(null);
  const [nombre,       setNombre]       = useState("");
  const [guardando,    setGuardando]    = useState(false);
  const [errorModal,   setErrorModal]   = useState<string | null>(null);
  const [confirmarId,  setConfirmarId]  = useState<number | null>(null);

  const cargarClientes = () => {
    setLoading(true);
    fetch(`${API}/clientes/`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClientes(data);
        else throw new Error(data.error);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargarClientes(); }, []);

  const filtrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  const abrirCrear = () => {
    setModoEditar(false);
    setClienteEdit(null);
    setNombre("");
    setErrorModal(null);
    setModalAbierto(true);
  };

  const abrirEditar = (c: Cliente) => {
    setModoEditar(true);
    setClienteEdit(c);
    setNombre(c.nombre);
    setErrorModal(null);
    setModalAbierto(true);
  };

  const guardar = async () => {
    if (!nombre.trim()) return;
    setGuardando(true);
    setErrorModal(null);
    try {
      const url    = modoEditar ? `${API}/cliente/editar/${clienteEdit!.id}/` : `${API}/cliente/crear/`;
      const method = modoEditar ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ nombre: nombre.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorModal(data.error ?? "Error al guardar"); return; }
      setModalAbierto(false);
      cargarClientes();
    } catch (e) {
      setErrorModal("Error de conexión");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: number) => {
    try {
      await fetch(`${API}/cliente/eliminar/${id}/`, { method: "DELETE" });
      setConfirmarId(null);
      cargarClientes();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-6 text-amber-600 dark:text-[#e8b87a]">Cargando...</div>;
  if (error)   return <div className="p-6 text-red-400">Error: {error}</div>;

  return (
    <div className="p-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Mis Clientes</h1>
          <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Directorio de clientes registrados</p>
        </div>
        <button
          onClick={abrirCrear}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
        >
          + Nuevo cliente
        </button>
      </div>

      {/* KPI */}
      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-[#2a1a0d] flex items-center justify-center">
          <svg className="w-6 h-6 text-amber-600 dark:text-[#e8b87a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">Total clientes</p>
          <h2 className="text-2xl font-bold text-amber-600 dark:text-[#e8b87a]">{clientes.length}</h2>
        </div>
      </div>

      {/* Lista */}
      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <div className="mb-4">
          <input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#1e1408] px-4 py-2 text-sm text-gray-700 dark:text-[#f5deb3] outline-none focus:border-amber-500"
          />
        </div>

        {filtrados.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-[#7a5a3a] text-center py-10">
            No se encontraron clientes.
          </p>
        ) : (
          <div className="grid gap-2">
            {filtrados.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-4 rounded-xl border border-gray-100 dark:border-[#2e2119] p-4 hover:bg-amber-50/30 dark:hover:bg-[#1e1408] transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-[#2a1a0d] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-amber-700 dark:text-[#e8b87a]">
                    {c.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-[#f5deb3] truncate">{c.nombre}</p>
                  <p className="text-xs text-gray-400 dark:text-[#7a5a3a]">
                    Cliente #{String(c.id).padStart(3, "0")}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
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
            ))}
          </div>
        )}
      </div>

      {/* Modal crear / editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1e140a] shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-[#f5deb3] mb-5">
              {modoEditar ? "Editar cliente" : "Nuevo cliente"}
            </h2>

            <div>
              <label className="block text-sm text-gray-600 dark:text-[#9a7a5a] mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); setErrorModal(null); }}
                placeholder="Ej: Supermercado Ketal"
                className="w-full rounded-xl border border-gray-200 dark:border-[#2e2119] bg-gray-50 dark:bg-[#18110d] text-gray-800 dark:text-[#f5deb3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {errorModal && (
                <p className="mt-2 text-xs text-red-400">{errorModal}</p>
              )}
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
                disabled={guardando || !nombre.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {guardando ? "Guardando..." : modoEditar ? "Guardar cambios" : "Crear cliente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmarId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1e140a] shadow-xl p-6 text-center">
            <p className="text-gray-800 dark:text-[#f5deb3] font-semibold mb-2">¿Eliminar este cliente?</p>
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mb-6">
              Esta acción no se puede deshacer.
            </p>
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