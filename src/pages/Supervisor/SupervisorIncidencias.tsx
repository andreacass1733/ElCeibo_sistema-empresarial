// ==========================================
// SupervisorIncidencias.tsx
// ==========================================

const incidencias = [
  {
    titulo: "Retraso en producción",
    fecha: "05/06/2026",
    estado: "Pendiente",
  },
  {
    titulo: "Falla de maquinaria",
    fecha: "04/06/2026",
    estado: "En revisión",
  },
  {
    titulo: "Ausencia de personal",
    fecha: "03/06/2026",
    estado: "Resuelto",
  },
];

export default function SupervisorIncidencias() {
  return (
    <div className="p-6">

      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-white">
          Incidencias
        </h1>

        <p className="text-gray-500 mt-2">
          Registro y control de incidencias.
        </p>
      </div>

      <div className="space-y-4">
        {incidencias.map((incidencia, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 border-l-4 border-red-500"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {incidencia.titulo}
              </h2>

              <span className="text-sm text-gray-500">
                {incidencia.fecha}
              </span>
            </div>

            <p className="mt-3 text-gray-500">
              Estado: {incidencia.estado}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}