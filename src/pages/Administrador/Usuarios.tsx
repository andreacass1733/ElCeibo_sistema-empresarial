import { useEffect, useState } from "react";

// ---- Config ----
const API_BASE = "http://127.0.0.1:8000/api/empleados";

// ---- Tipos ----
type Empleado = {
  id_empleado: number;
  nombre: string;
  cargo: string;
};

type ModalMode = "list" | "add" | "edit";

// ---- API helpers ----
const api = {
  list: async (): Promise<Empleado[]> => {
    const res = await fetch(`${API_BASE}/`);
    if (!res.ok) throw new Error("Error al obtener empleados");
    return res.json();
  },
  create: async (data: Omit<Empleado, "id_empleado">): Promise<Empleado> => {
    const res = await fetch(`${API_BASE}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear empleado");
    return res.json();
  },
  update: async (
    id: number,
    data: Omit<Empleado, "id_empleado">
  ): Promise<Empleado> => {
    const res = await fetch(`${API_BASE}/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar empleado");
    return res.json();
  },
  remove: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/${id}/`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar empleado");
  },
};

// ---- Modal Component ----
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel — en móvil sube desde abajo como sheet, en desktop centrado */}
      <div className="relative z-10 w-full sm:max-w-2xl flex flex-col rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#151515] shadow-2xl max-h-[92dvh] sm:max-h-[85vh]">
        {/* Handle para móvil */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-[#6f4e37]" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-[#6f4e37] flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-[#f4e1c1]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#d6b98c] dark:hover:bg-[#22160f] transition-colors"
          >
            ✕
          </button>
        </div>
        {/* Body con scroll */}
        <div className="px-5 sm:px-6 py-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ---- Form de Empleado ----
function EmpleadoForm({
  initial,
  onSave,
  onCancel,
  cargoFijo,
  loading,
}: {
  initial?: Partial<Empleado>;
  onSave: (e: Omit<Empleado, "id_empleado">) => void;
  onCancel: () => void;
  cargoFijo?: string;
  loading?: boolean;
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [cargo, setCargo] = useState(initial?.cargo ?? cargoFijo ?? "");

  const cargos = [
    "Administrador",
    "Vendedor",
    "Cajero",
    "Almacenero",
    "Produccion",
    "Repartidor",
    "Operario",
    "Supervisor"
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-[#1f1208] mb-1">
          Nombre completo
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Juan Pérez"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#6f4e37] bg-gray-50 dark:bg-[#1b1b1b] text-gray-800 dark:text-[#f4e1c1] placeholder-gray-400 dark:placeholder-[#7a5c3a] focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-[#cbb08b] transition"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-[#d6b98c] mb-1">
          Cargo
        </label>
        {cargoFijo ? (
          <div className="px-3 py-2 rounded-lg border border-gray-300 dark:border-[#6f4e37] bg-gray-100 dark:bg-[#1f1208] text-gray-600 dark:text-[#9a7a5a]">
            {cargoFijo}
          </div>
        ) : (
          <select
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#6f4e37] bg-gray-50 dark:bg-[#1b1b1b] text-gray-800 dark:text-[#f4e1c1] focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-[#cbb08b] transition"
          >
            <option value="">Seleccionar cargo...</option>
            {cargos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex gap-3 pt-2">
        <button
          disabled={loading}
          onClick={() => {
            if (!nombre.trim() || !cargo.trim()) return;
            onSave({ nombre: nombre.trim(), cargo: cargoFijo ?? cargo });
          }}
          className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 dark:bg-[#8b5e2a] dark:hover:bg-[#a06e35] text-white font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button
          disabled={loading}
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-[#6f4e37] text-gray-600 dark:text-[#d6b98c] hover:bg-gray-50 dark:hover:bg-[#22160f] font-semibold transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ---- Lista de Empleados en Modal ----
function EmpleadosList({
  empleados,
  cargoFijo,
  onAdd,
  onEdit,
  onDelete,
}: {
  empleados: Empleado[];
  titulo: string;
  cargoFijo?: string;
  onAdd: (e: Omit<Empleado, "id_empleado">) => Promise<void>;
  onEdit: (id: number, e: Omit<Empleado, "id_empleado">) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [mode, setMode] = useState<ModalMode>("list");
  const [editing, setEditing] = useState<Empleado | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (data: Omit<Empleado, "id_empleado">) => {
    setLoading(true);
    setError(null);
    try {
      await onAdd(data);
      setMode("list");
    } catch {
      setError("No se pudo crear el empleado.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (data: Omit<Empleado, "id_empleado">) => {
    if (!editing) return;
    setLoading(true);
    setError(null);
    try {
      await onEdit(editing.id_empleado, data);
      setMode("list");
    } catch {
      setError("No se pudo actualizar el empleado.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await onDelete(id);
      setConfirmDelete(null);
    } catch {
      setError("No se pudo eliminar el empleado.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "add") {
    return (
      <div>
        <button
          onClick={() => { setMode("list"); setError(null); }}
          className="mb-4 text-sm text-gray-500 dark:text-[#9a7a5a] hover:underline flex items-center gap-1"
        >
          ← Volver
        </button>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-[#f4e1c1] mb-4">
          Nuevo {cargoFijo ?? "Empleado"}
        </h3>
        {error && (
          <p className="mb-3 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        <EmpleadoForm
          cargoFijo={cargoFijo}
          loading={loading}
          onSave={handleAdd}
          onCancel={() => { setMode("list"); setError(null); }}
        />
      </div>
    );
  }

  if (mode === "edit" && editing) {
    return (
      <div>
        <button
          onClick={() => { setMode("list"); setError(null); }}
          className="mb-4 text-sm text-gray-500 dark:text-[#9a7a5a] hover:underline flex items-center gap-1"
        >
          ← Volver
        </button>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-[#f4e1c1] mb-4">
          Editar {editing.nombre}
        </h3>
        {error && (
          <p className="mb-3 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        <EmpleadoForm
          initial={editing}
          cargoFijo={cargoFijo}
          loading={loading}
          onSave={handleEdit}
          onCancel={() => { setMode("list"); setError(null); }}
        />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-3 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500 dark:text-[#9a7a5a]">
          {empleados.length} registro{empleados.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={() => { setMode("add"); setError(null); }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 dark:bg-[#8b5e2a] dark:hover:bg-[#a06e35] text-white text-sm font-semibold transition-colors"
        >
          + Agregar
        </button>
      </div>

      {/* Tabla */}
      {empleados.length === 0 ? (
        <div className="py-12 text-center text-gray-400 dark:text-[#7a5c3a]">
          Sin registros actualmente.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#6f4e37]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#120c08]">
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-[#d6b98c]">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-[#d6b98c]">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-[#d6b98c]">Cargo</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-[#d6b98c]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((emp, i) => (
                <tr
                  key={emp.id_empleado}
                  className={`border-t border-gray-100 dark:border-[#2a1a0d] ${
                    i % 2 === 0
                      ? "bg-white dark:bg-[#151515]"
                      : "bg-gray-50/50 dark:bg-[#1a1209]"
                  }`}
                >
                  <td className="px-4 py-3 text-gray-500 dark:text-[#9a7a5a]">#{emp.id_empleado}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-[#f4e1c1]">{emp.nombre}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-[#3a2418] dark:text-[#e0b97d]">
                      {emp.cargo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        disabled={loading}
                        onClick={() => { setEditing(emp); setMode("edit"); setError(null); }}
                        className="px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-[#6f4e37] text-gray-600 dark:text-[#d6b98c] hover:bg-gray-100 dark:hover:bg-[#22160f] transition-colors disabled:opacity-40"
                      >
                        Editar
                      </button>
                      {confirmDelete === emp.id_empleado ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-red-500 dark:text-red-400 font-medium">¿Seguro?</span>
                          <button
                            disabled={loading}
                            onClick={() => handleDelete(emp.id_empleado)}
                            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-40"
                          >
                            {loading ? "..." : "Sí"}
                          </button>
                          <button
                            disabled={loading}
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-[#6f4e37] text-gray-600 dark:text-[#d6b98c] hover:bg-gray-100 dark:hover:bg-[#22160f] transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={loading}
                          onClick={() => setConfirmDelete(emp.id_empleado)}
                          className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600 text-white transition-colors disabled:opacity-40"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---- Página Principal ----
export default function Usuarios() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [errorPage, setErrorPage] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<"admins" | "empleados" | null>(null);

  // ---- Cargar al montar ----
  useEffect(() => {
    api.list()
      .then(setEmpleados)
      .catch(() => setErrorPage("No se pudo conectar con el servidor."))
      .finally(() => setLoadingPage(false));
  }, []);

  const admins = empleados.filter((e) => e.cargo === "Administrador");
  const noAdmins = empleados.filter((e) => e.cargo !== "Administrador");

  // ---- Handlers con fetch ----
  const handleAdd = async (nuevo: Omit<Empleado, "id_empleado">) => {
    const creado = await api.create(nuevo);
    setEmpleados((prev) => [...prev, creado]);
  };

  const handleEdit = async (id: number, datos: Omit<Empleado, "id_empleado">) => {
    const actualizado = await api.update(id, datos);
    setEmpleados((prev) =>
      prev.map((e) => (e.id_empleado === actualizado.id_empleado ? actualizado : e))
    );
  };

  const handleDelete = async (id: number) => {
    await api.remove(id);
    setEmpleados((prev) => prev.filter((e) => e.id_empleado !== id));
  };

  // ---- Render ----
  if (loadingPage) {
    return (
      <div className="p-6 flex items-center gap-3 text-gray-500 dark:text-[#9a7a5a]">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Cargando usuarios...
      </div>
    );
  }

  if (errorPage) {
    return (
      <div className="p-6">
        <p className="text-red-500 dark:text-red-400">{errorPage}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f4e1c1]">Usuarios</h1>
      <p className="mt-2 text-gray-600 dark:text-[#d6b98c]">
        Administración de usuarios del sistema.
      </p>

      {/* Cards */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Card Administradores */}
        <button
          onClick={() => setOpenModal("admins")}
          className="bg-[#f5ede3] dark:bg-[#16110d] text-left rounded-2xl p-6 shadow-sm hover:shadow-md dark:hover:shadow-[#3a2a1a]/40 transition-shadow group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold dark:text-[#f4e1c1]">Administradores</h2>
              <p className="mt-3 text-gray-600 dark:text-[#d6b98c]">
                {admins.length} usuario{admins.length !== 1 ? "s" : ""} registrado{admins.length !== 1 ? "s" : ""}.
              </p>
            </div>
            <div className="mt-1 flex -space-x-2">
              {admins.slice(0, 3).map((a) => (
                <div
                  key={a.id_empleado}
                  className="w-8 h-8 rounded-full bg-amber-100 dark:bg-[#3a2418] border-2 border-white dark:border-[#18110d] flex items-center justify-center text-xs font-bold text-amber-700 dark:text-[#e0b97d]"
                >
                  {a.nombre.charAt(0)}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-xs font-medium text-amber-600 dark:text-[#e0b97d] group-hover:underline">
            Ver todos →
          </div>
        </button>

        {/* Card Empleados */}
        <button
          onClick={() => setOpenModal("empleados")}
          className="bg-[#f5ede3] dark:bg-[#16110d] text-left rounded-2xl p-6 shadow-sm dark:bg-[#151515] hover:shadow-md dark:hover:shadow-[#3a2a1a]/40 transition-shadow group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold dark:text-[#f4e1c1]">Empleados</h2>
              <p className="mt-3 text-gray-600 dark:text-[#d6b98c]">
                {noAdmins.length === 0
                  ? "Sin registros actualmente."
                  : `${noAdmins.length} empleado${noAdmins.length !== 1 ? "s" : ""} registrado${noAdmins.length !== 1 ? "s" : ""}.`}
              </p>
            </div>
            <div className="mt-1 flex -space-x-2">
              {noAdmins.slice(0, 3).map((e) => (
                <div
                  key={e.id_empleado}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2a1a0d] border-2 border-white dark:border-[#18110d] flex items-center justify-center text-xs font-bold text-gray-600 dark:text-[#d6b98c]"
                >
                  {e.nombre.charAt(0)}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-xs font-medium text-amber-600 dark:text-[#e0b97d] group-hover:underline">
            Ver todos →
          </div>
        </button>
      </div>

      {/* Resumen rápido */}
      <div className="bg-[#f5ede3] dark:bg-[#16110d] mt-6 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold dark:text-[#f4e1c1] mb-4">Resumen de cargos</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(
            empleados.reduce(
              (acc, e) => {
                acc[e.cargo] = (acc[e.cargo] ?? 0) + 1;
                return acc;
              },
              {} as Record<string, number>
            )
          ).map(([cargo, count]) => (
            <div
              key={cargo}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#1b1b1b] border border-gray-200 dark:border-[#6f4e37]"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-[#f4e1c1]">{cargo}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-[#3a2418] text-amber-700 dark:text-[#e0b97d] font-bold">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Administradores */}
      {openModal === "admins" && (
        <Modal title="Administradores" onClose={() => setOpenModal(null)}>
          <EmpleadosList
            empleados={admins}
            titulo="Administradores"
            cargoFijo="Administrador"
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Modal>
      )}

      {/* Modal Empleados */}
      {openModal === "empleados" && (
        <Modal title="Empleados" onClose={() => setOpenModal(null)}>
          <EmpleadosList
            empleados={noAdmins}
            titulo="Empleados"
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Modal>
      )}
    </div>
  );
}