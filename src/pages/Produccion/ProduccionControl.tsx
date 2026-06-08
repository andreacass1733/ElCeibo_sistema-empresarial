// ProduccionControl.tsx
// Sin tabla en BD → mock tipado, listo para reemplazar con fetch
import { useEffect, useState } from "react";

interface Control {
  id: string;
  lote: string;
  producto: string;
  inspector: string;
  fecha: string;
  resultado: "APROBADO" | "OBSERVADO" | "RECHAZADO";
  obs: string;
}

const MOCK_CONTROLES: Control[] = [
  { id: "CC-001", lote: "LOT-001", producto: "Chocolate 70%",    inspector: "Luis Quispe",   fecha: "2025-06-05", resultado: "APROBADO",  obs: "Sin observaciones" },
  { id: "CC-002", lote: "LOT-002", producto: "Bombones Premium", inspector: "María Condori", fecha: "2025-06-04", resultado: "APROBADO",  obs: "Peso dentro del rango" },
  { id: "CC-003", lote: "LOT-003", producto: "Choc. con Leche",  inspector: "Luis Quispe",   fecha: "2025-06-03", resultado: "OBSERVADO", obs: "Textura irregular en 3 unidades" },
  { id: "CC-004", lote: "LOT-004", producto: "Cobertura Oscura", inspector: "Pedro Huanca",  fecha: "2025-06-02", resultado: "RECHAZADO", obs: "Temperatura fuera de rango durante proceso" },
];

const resultadoStyle: Record<string, string> = {
  APROBADO:  "bg-emerald-950 text-emerald-400",
  OBSERVADO: "bg-amber-950 text-amber-400",
  RECHAZADO: "bg-red-950 text-red-400",
};

export default function ProduccionControl() {
  const [controles, setControles] = useState<Control[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    // TODO: reemplazar por fetch cuando exista la tabla ControlCalidad
    // const idEmpleado = localStorage.getItem("id_empleado");
    // fetch(`http://localhost:8000/api/control-calidad/${idEmpleado}/`)
    //   .then(r => r.json()).then(setControles);
    setControles(MOCK_CONTROLES);
    setLoading(false);
  }, []);

  if (loading) return <div className="p-6 text-amber-600 dark:text-[#e8b87a]">Cargando...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Control de Calidad</h1>
        <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Inspecciones de lotes de producción</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Aprobados",  value: controles.filter((c) => c.resultado === "APROBADO").length,  color: "text-emerald-500" },
          { label: "Observados", value: controles.filter((c) => c.resultado === "OBSERVADO").length, color: "text-amber-500"   },
          { label: "Rechazados", value: controles.filter((c) => c.resultado === "RECHAZADO").length, color: "text-red-400"     },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-[#9a7a5a]">{k.label}</p>
            <h2 className={`mt-2 text-2xl font-bold ${k.color}`}>{k.value}</h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        <div className="space-y-3">
          {controles.map((c) => (
            <div key={c.id} className="rounded-xl border border-gray-100 dark:border-[#2e2119] p-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-amber-600 dark:text-[#e8b87a]">{c.id}</span>
                    <span className="font-mono text-xs text-gray-400 dark:text-[#7a5a3a]">Lote: {c.lote}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${resultadoStyle[c.resultado]}`}>
                      {c.resultado}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-[#f5deb3]">{c.producto}</p>
                  <p className="text-xs text-gray-400 dark:text-[#7a5a3a] mt-0.5">
                    Inspector: {c.inspector} · {c.fecha}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[#9a7a5a] mt-1 italic">"{c.obs}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}