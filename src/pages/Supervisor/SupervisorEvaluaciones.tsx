// ==========================================
// SupervisorEvaluaciones.tsx
// ==========================================

const evaluaciones = [
  {
    empleado: "Carlos Mendoza",
    puntuacion: "92%",
    estado: "Excelente",
  },
  {
    empleado: "Luis Vargas",
    puntuacion: "76%",
    estado: "Regular",
  },
  {
    empleado: "Ana Flores",
    puntuacion: "88%",
    estado: "Bueno",
  },
];

export default function SupervisorEvaluaciones() {
  return (
    <div className="p-6">

      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-white">
          Evaluaciones
        </h1>

        <p className="text-gray-500 mt-2">
          Seguimiento del rendimiento del personal.
        </p>
      </div>

      <div className="space-y-4">
        {evaluaciones.map((evaluacion, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {evaluacion.empleado}
              </h2>

              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm">
                {evaluacion.estado}
              </span>
            </div>

            <p className="text-gray-500 mt-3">
              Rendimiento: {evaluacion.puntuacion}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}