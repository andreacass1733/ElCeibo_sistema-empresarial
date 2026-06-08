// ==========================================
// SupervisorPersonal.tsx
// ==========================================

const personal = [
  {
    nombre: "Carlos Mendoza",
    cargo: "Operario",
    estado: "Activo",
  },
  {
    nombre: "Luis Vargas",
    cargo: "Operario",
    estado: "Vacación",
  },
  {
    nombre: "Ana Flores",
    cargo: "Operario",
    estado: "Activo",
  },
];

export default function SupervisorPersonal() {
  return (
    <div className="p-6">

      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-white">
          Personal
        </h1>

        <p className="text-gray-500 mt-2">
          Administración del personal asignado.
        </p>
      </div>

      <div className="space-y-4">
        {personal.map((empleado, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 border border-gray-200 dark:border-gray-700 flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold">
                {empleado.nombre}
              </h2>

              <p className="text-gray-500">
                {empleado.cargo}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm">
              {empleado.estado}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}