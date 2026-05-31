import { useState } from "react";

// ---- Tipos ----
type Empleado = {
  id_empleado: number;
  nombre: string;
  cargo: string;
};

type ModalMode = "list" | "add" | "edit";

// ---- Datos de ejemplo (reemplaza con fetch a tu API/DB) ----
const initialEmpleados: Empleado[] = [
  { id_empleado: 1, nombre: "Carlos Mamani", cargo: "Administrador" },
  { id_empleado: 2, nombre: "Ana Quispe", cargo: "Administrador" },
  { id_empleado: 3, nombre: "Luis Flores", cargo: "Vendedor" },
  { id_empleado: 4, nombre: "María Condori", cargo: "Cajero" },
  { id_empleado: 5, nombre: "Pedro Huanca", cargo: "Almacenero" },
];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl bg-white dark:bg-[#151515] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#6f4e37]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-[#f4e1c1]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#d6b98c] dark:hover:bg-[#22160f] transition-colors"
          >
            ✕
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-4">{children}</div>
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
}: {
  initial?: Partial<Empleado>;
  onSave: (e: Omit<Empleado, "id_empleado">) => void;
  onCancel: () => void;
  cargoFijo?: string;
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
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-[#d6b98c] mb-1">
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
          onClick={() => {
            if (!nombre.trim() || !cargo.trim()) return;
            onSave({ nombre: nombre.trim(), cargo: cargoFijo ?? cargo });
          }}
          className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 dark:bg-[#8b5e2a] dark:hover:bg-[#a06e35] text-white font-semibold transition-colors"
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-[#6f4e37] text-gray-600 dark:text-[#d6b98c] hover:bg-gray-50 dark:hover:bg-[#22160f] font-semibold transition-colors"
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
  onAdd: (e: Omit<Empleado, "id_empleado">) => void;
  onEdit: (id: number, e: Omit<Empleado, "id_empleado">) => void;
  onDelete: (id: number) => void;
}) {
  const [mode, setMode] = useState<ModalMode>("list");
  const [editing, setEditing] = useState<Empleado | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  if (mode === "add") {
    return (
      <div>
        <button
          onClick={() => setMode("list")}
          className="mb-4 text-sm text-gray-500 dark:text-[#9a7a5a] hover:underline flex items-center gap-1"
        >
          ← Volver
        </button>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-[#f4e1c1] mb-4">
          Nuevo {cargoFijo ?? "Empleado"}
        </h3>
        <EmpleadoForm
          cargoFijo={cargoFijo}
          onSave={(e) => {
            onAdd(e);
            setMode("list");
          }}
          onCancel={() => setMode("list")}
        />
      </div>
    );
  }

  if (mode === "edit" && editing) {
    return (
      <div>
        <button
          onClick={() => setMode("list")}
          className="mb-4 text-sm text-gray-500 dark:text-[#9a7a5a] hover:underline flex items-center gap-1"
        >
          ← Volver
        </button>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-[#f4e1c1] mb-4">
          Editar {editing.nombre}
        </h3>
        <EmpleadoForm
          initial={editing}
          cargoFijo={cargoFijo}
          onSave={(e) => {
            onEdit(editing.id_empleado, e);
            setMode("list");
          }}
          onCancel={() => setMode("list")}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500 dark:text-[#9a7a5a]">
          {empleados.length} registro{empleados.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={() => setMode("add")}
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
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-[#d6b98c]">
                  ID
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-[#d6b98c]">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-[#d6b98c]">
                  Cargo
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-[#d6b98c]">
                  Acciones
                </th>
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
                  <td className="px-4 py-3 text-gray-500 dark:text-[#9a7a5a]">
                    #{emp.id_empleado}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-[#f4e1c1]">
                    {emp.nombre}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-[#3a2418] dark:text-[#e0b97d]">
                      {emp.cargo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(emp);
                          setMode("edit");
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-300 dark:border-[#6f4e37] text-gray-600 dark:text-[#d6b98c] hover:bg-gray-100 dark:hover:bg-[#22160f] transition-colors"
                      >
                        Editar
                      </button>
                      {confirmDelete === emp.id_empleado ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-red-500 dark:text-red-400">
                            ¿Seguro?
                          </span>
                          <button
                            onClick={() => {
                              onDelete(emp.id_empleado);
                              setConfirmDelete(null);
                            }}
                            className="px-2 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-[#6f4e37] text-gray-600 dark:text-[#d6b98c] hover:bg-gray-100 dark:hover:bg-[#22160f] transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(emp.id_empleado)}
                          className="px-3 py-1 rounded-lg text-xs font-medium border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
  const [empleados, setEmpleados] = useState<Empleado[]>(initialEmpleados);
  const [openModal, setOpenModal] = useState<"admins" | "empleados" | null>(
    null
  );

  const admins = empleados.filter((e) => e.cargo === "Administrador");
  const noAdmins = empleados.filter((e) => e.cargo !== "Administrador");

  const handleAdd = (nuevo: Omit<Empleado, "id_empleado">) => {
    const id = Math.max(...empleados.map((e) => e.id_empleado), 0) + 1;
    setEmpleados([...empleados, { id_empleado: id, ...nuevo }]);
  };

  const handleEdit = (id: number, datos: Omit<Empleado, "id_empleado">) => {
    setEmpleados(
      empleados.map((e) => (e.id_empleado === id ? { ...e, ...datos } : e))
    );
  };

  const handleDelete = (id: number) => {
    setEmpleados(empleados.filter((e) => e.id_empleado !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f4e1c1]">
        Usuarios
      </h1>
      <p className="mt-2 text-gray-600 dark:text-[#d6b98c]">
        Administración de usuarios del sistema.
      </p>

      {/* Cards */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Card Administradores */}
        <button
          onClick={() => setOpenModal("admins")}
          className="text-left rounded-2xl bg-white p-6 shadow-sm dark:bg-[#151515] hover:shadow-md dark:hover:shadow-[#3a2a1a]/40 transition-shadow group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold dark:text-[#f4e1c1]">
                Administradores
              </h2>
              <p className="mt-3 text-gray-600 dark:text-[#d6b98c]">
                {admins.length} usuario{admins.length !== 1 ? "s" : ""}{" "}
                registrado{admins.length !== 1 ? "s" : ""}.
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
          className="text-left rounded-2xl bg-white p-6 shadow-sm dark:bg-[#151515] hover:shadow-md dark:hover:shadow-[#3a2a1a]/40 transition-shadow group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold dark:text-[#f4e1c1]">
                Empleados
              </h2>
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
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-[#151515]">
        <h2 className="text-lg font-semibold dark:text-[#f4e1c1] mb-4">
          Resumen de cargos
        </h2>
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
              <span className="text-sm font-medium text-gray-700 dark:text-[#f4e1c1]">
                {cargo}
              </span>
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