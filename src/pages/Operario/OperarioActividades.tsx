// ==========================================
// OperarioActividades.tsx
// ==========================================

const actividades = [
  {
    actividad: "Inicio de turno",
    hora: "08:00 AM",
  },
  {
    actividad: "Inspección de materiales",
    hora: "10:30 AM",
  },
  {
    actividad: "Reporte de producción",
    hora: "03:00 PM",
  },
];

export default function OperarioActividades() {
  return (
    <div className="p-6">

      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-white">
          Actividades
        </h1>

        <p className="text-gray-500 mt-2">
          Historial de actividades realizadas.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">

        <div className="space-y-4">
          {actividades.map((item, index) => (
            <div
              key={index}
              className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-4"
            >
              <p className="font-medium">
                {item.actividad}
              </p>

              <span className="text-gray-500">
                {item.hora}
              </span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}