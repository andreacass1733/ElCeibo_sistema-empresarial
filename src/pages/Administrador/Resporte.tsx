"use client";

import { useState } from "react";

// ——— Tipos ———
type Categoria = "ventas" | "produccion" | "empleados" | "inventario" | "compras";
type Estado = "listo" | "pendiente" | "error";

interface Reporte {
  id: number;
  nombre: string;
  cat: Categoria;
  fecha: string;
  estado: Estado;
}

interface ModalData {
  stats: { n: string; l: string }[];
  section: string;
  headers: string[];
  rows: string[][];
}

// ——— Datos simulados (reemplaza con fetch a tu API/DB) ———
const reportes: Reporte[] = [
  { id: 1, nombre: "Ventas por sucursal — mayo 2026", cat: "ventas", fecha: "28/05/2026", estado: "listo" },
  { id: 2, nombre: "Producción mensual de chocolates", cat: "produccion", fecha: "27/05/2026", estado: "listo" },
  { id: 3, nombre: "Rendimiento de empleados", cat: "empleados", fecha: "25/05/2026", estado: "listo" },
  { id: 4, nombre: "Inventario por sucursal", cat: "inventario", fecha: "24/05/2026", estado: "listo" },
  { id: 5, nombre: "Capacitaciones completadas", cat: "empleados", fecha: "22/05/2026", estado: "listo" },
  { id: 6, nombre: "Compras a proveedores — Q2 2026", cat: "compras", fecha: "20/05/2026", estado: "listo" },
  { id: 7, nombre: "Top productos más vendidos", cat: "ventas", fecha: "18/05/2026", estado: "pendiente" },
  { id: 8, nombre: "Envíos entre sucursales", cat: "inventario", fecha: "15/05/2026", estado: "listo" },
];

const modalesData: Record<number, ModalData> = {
  1: {
    stats: [{ n: "Bs 48,720", l: "Total vendido" }, { n: "312", l: "Unidades" }, { n: "3", l: "Sucursales" }, { n: "5", l: "Empleados" }],
    section: "Ventas por sucursal",
    headers: ["Sucursal", "Empleado", "Productos", "Total (Bs)"],
    rows: [
      ["Sucursal Central", "Carlos Mamani", "Trufas, Bombones", "18,400"],
      ["Sucursal Norte", "Ana Quispe", "Tabletas, Trufas", "16,220"],
      ["Sucursal Sur", "Luis Flores", "Bombones", "14,100"],
    ],
  },
  2: {
    stats: [{ n: "2,840", l: "Unidades prod." }, { n: "6", l: "Productos" }, { n: "8", l: "Empleados" }, { n: "22", l: "Días activos" }],
    section: "Producción por producto",
    headers: ["Producto", "Tipo", "Cantidad", "Empleado encargado"],
    rows: [
      ["Trufa de maracuyá", "Trufa", "640", "Pedro Condori"],
      ["Tableta 70%", "Tableta", "800", "María Ticona"],
      ["Bombón relleno", "Bombón", "520", "Juan Mamani"],
      ["Chocolate blanco", "Tableta", "880", "Ana Quispe"],
    ],
  },
  3: {
    stats: [{ n: "12", l: "Empleados" }, { n: "3", l: "Cargos" }, { n: "4.2", l: "Calif. prom." }, { n: "85%", l: "Puntualidad" }],
    section: "Empleados activos",
    headers: ["Nombre", "Cargo", "Capacitaciones", "Estado"],
    rows: [
      ["Carlos Mamani", "Vendedor", "3", "Activo"],
      ["Ana Quispe", "Producción", "2", "Activo"],
      ["Luis Flores", "Vendedor", "1", "Activo"],
      ["Pedro Condori", "Administrador", "4", "Activo"],
      ["María Ticona", "Producción", "2", "Permiso"],
    ],
  },
  4: {
    stats: [{ n: "4,210", l: "Unidades total" }, { n: "3", l: "Sucursales" }, { n: "8", l: "Productos" }, { n: "12%", l: "Stock bajo" }],
    section: "Inventario actual",
    headers: ["Producto", "Sucursal", "Stock", "Alerta"],
    rows: [
      ["Trufa de maracuyá", "Central", "380", "OK"],
      ["Tableta 70%", "Norte", "120", "Bajo"],
      ["Bombón relleno", "Sur", "560", "OK"],
      ["Chocolate blanco", "Central", "45", "Crítico"],
    ],
  },
  5: {
    stats: [{ n: "8", l: "Capacitaciones" }, { n: "24", l: "Participantes" }, { n: "87%", l: "Completado" }, { n: "Bs 4,200", l: "Inversión" }],
    section: "Detalle capacitaciones",
    headers: ["Capacitación", "Instructor", "Empleados", "Estado"],
    rows: [
      ["Manipulación de chocolate", "Ing. Rojas", "6", "Completado"],
      ["Atención al cliente", "Lic. Vargas", "8", "Completado"],
      ["Seguridad alimentaria", "Ing. Paz", "5", "En curso"],
      ["Control de calidad", "Ing. Rojas", "5", "Completado"],
    ],
  },
  6: {
    stats: [{ n: "Bs 28,400", l: "Total compras" }, { n: "5", l: "Proveedores" }, { n: "12", l: "Materias primas" }, { n: "8", l: "Órdenes" }],
    section: "Compras a proveedores",
    headers: ["Proveedor", "Materia prima", "Cantidad", "Monto (Bs)"],
    rows: [
      ["Cacao del Norte", "Cacao en grano", "500 kg", "8,200"],
      ["Azúcares Andinos", "Azúcar refinada", "300 kg", "3,600"],
      ["Dairy Bolivia", "Leche en polvo", "200 kg", "5,400"],
      ["Frutas Tropicales", "Maracuyá", "150 kg", "2,800"],
      ["Cacao del Norte", "Manteca de cacao", "180 kg", "8,400"],
    ],
  },
  7: {
    stats: [{ n: "Top 5", l: "Productos" }, { n: "980", l: "Unidades" }, { n: "Bs 32,100", l: "Ingreso" }, { n: "mayo", l: "Período" }],
    section: "Productos más vendidos",
    headers: ["Producto", "Unidades", "Ingreso (Bs)", "Participación"],
    rows: [
      ["Tableta 70%", "320", "10,240", "32.7%"],
      ["Trufa de maracuyá", "280", "9,800", "30.5%"],
      ["Bombón relleno", "180", "5,580", "17.4%"],
      ["Chocolate blanco", "120", "4,080", "12.7%"],
      ["Kit regalo", "80", "2,400", "7.5%"],
    ],
  },
  8: {
    stats: [{ n: "18", l: "Envíos" }, { n: "3", l: "Rutas" }, { n: "1,240", l: "Unidades" }, { n: "Bs 420", l: "Costo logística" }],
    section: "Envíos entre sucursales",
    headers: ["Origen", "Destino", "Producto", "Unidades"],
    rows: [
      ["Planta Central", "Sucursal Norte", "Tabletas 70%", "220"],
      ["Planta Central", "Sucursal Sur", "Bombones rellenos", "180"],
      ["Sucursal Norte", "Sucursal Sur", "Trufas maracuyá", "150"],
      ["Planta Central", "Sucursal Norte", "Chocolate blanco", "90"],
    ],
  },
};

// ——— Helpers de estilo ———
const catLabel: Record<Categoria, string> = {
  ventas: "Ventas",
  produccion: "Producción",
  empleados: "Empleados",
  inventario: "Inventario",
  compras: "Compras",
};

const catBadge: Record<Categoria, string> = {
  ventas:    "bg-[#3d1a06] text-[#f5c16c]",
  produccion:"bg-[#2a1a08] text-[#d4a056]",
  empleados: "bg-[#1e1208] text-[#b8845e]",
  inventario:"bg-[#241408] text-[#e0a060]",
  compras:   "bg-[#1a1205] text-[#c8904a]",
};

// En modo claro usamos tonos cálidos oscuros sobre fondo crema
const catBadgeLight: Record<Categoria, string> = {
  ventas:    "bg-amber-100 text-amber-900",
  produccion:"bg-orange-100 text-orange-900",
  empleados: "bg-yellow-100 text-yellow-900",
  inventario:"bg-stone-200 text-stone-800",
  compras:   "bg-amber-200 text-amber-900",
};

function EstadoChip({ estado }: { estado: Estado }) {
  if (estado === "listo")
    return <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-950 text-emerald-400 dark:bg-emerald-950 dark:text-emerald-400 bg-emerald-100 text-emerald-800">Listo</span>;
  if (estado === "pendiente")
    return <span className="px-2 py-0.5 rounded-full text-xs bg-amber-950 text-amber-400 dark:bg-amber-950 dark:text-amber-400 bg-amber-100 text-amber-800">Pendiente</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs bg-red-950 text-red-400 dark:bg-red-950 dark:text-red-400 bg-red-100 text-red-800">Error</span>;
}

// ——— Modal ———
function Modal({ reporte, onClose }: { reporte: Reporte; onClose: () => void }) {
  const data = modalesData[reporte.id];
  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[80vh] overflow-y-auto rounded-2xl border
          bg-white border-stone-200
          dark:bg-[#18110d] dark:border-[#5a3010]
          p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-medium text-gray-800 dark:text-[#f5c57a]">
              {reporte.nombre}
            </h2>
            <p className="text-xs mt-1 text-gray-500 dark:text-[#a07840]">
              {reporte.fecha} ·{" "}
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${catBadgeLight[reporte.cat]} dark:${catBadge[reporte.cat]}`}>
                {catLabel[reporte.cat]}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs border rounded-lg px-3 py-1 cursor-pointer
              border-stone-300 text-stone-600 hover:bg-stone-100
              dark:border-[#5a3010] dark:text-[#c8904a] dark:hover:bg-[#2e1a0a]"
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {data.stats.map((s, i) => (
            <div
              key={i}
              className="rounded-xl border p-3 text-center
                bg-stone-50 border-stone-200
                dark:bg-[#0e0702] dark:border-[#3d1e08]"
            >
              <p className="text-xl font-medium text-amber-700 dark:text-[#f5c16c]">{s.n}</p>
              <p className="text-xs mt-0.5 text-stone-500 dark:text-[#8a6030]">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Sección de tabla */}
        <p className="text-xs font-medium uppercase tracking-wide mb-2
          text-stone-400 dark:text-[#9a6030]">
          {data.section}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-100 dark:bg-[#0e0702]">
                {data.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-medium
                    text-stone-600 border-b border-stone-200
                    dark:text-[#c8904a] dark:border-[#3d1e08]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-stone-100 dark:border-[#1e1005]">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-stone-700 dark:text-[#d4a870]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ——— Componente principal ———
export default function Reporte() {
  const [filtro, setFiltro] = useState<Categoria | "all">("all");
  const [modalReporte, setModalReporte] = useState<Reporte | null>(null);

  const filtrados = filtro === "all" ? reportes : reportes.filter((r) => r.cat === filtro);

  const filtros: { key: Categoria | "all"; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "ventas", label: "Ventas" },
    { key: "produccion", label: "Producción" },
    { key: "empleados", label: "Empleados" },
    { key: "inventario", label: "Inventario" },
    { key: "compras", label: "Compras" },
  ];

  return (
    <div className="p-6">
      {/* Modal */}
      {modalReporte && (
        <Modal reporte={modalReporte} onClose={() => setModalReporte(null)} />
      )}

      {/* Encabezado */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">
        Reportes
      </h1>
      <p className="mt-2 text-gray-600 dark:text-[#cbb08b]">
        Visualización de reportes empresariales.
      </p>

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm cursor-pointer transition-colors
              ${filtro === f.key
                ? "bg-amber-700 text-amber-50 dark:bg-[#2e1408] dark:text-[#f5c16c] dark:border dark:border-[#7a3e10]"
                : "bg-stone-100 text-stone-600 dark:bg-transparent dark:text-[#a07840] dark:border dark:border-[#3d1e08]"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="mt-5 overflow-hidden rounded-2xl
        bg-white shadow-sm border border-stone-100
        dark:bg-[#120a04] dark:border-[#3d1e08]">
        <table className="w-full">
          <thead className="bg-stone-50 dark:bg-[#1e0e06]">
            <tr>
              <th className="p-4 text-left text-sm font-medium text-stone-600 dark:text-[#c8904a]">
                Reporte
              </th>
              <th className="p-4 text-left text-sm font-medium text-stone-600 dark:text-[#c8904a]">
                Categoría
              </th>
              <th className="p-4 text-left text-sm font-medium text-stone-600 dark:text-[#c8904a]">
                Fecha
              </th>
              <th className="p-4 text-left text-sm font-medium text-stone-600 dark:text-[#c8904a]">
                Estado
              </th>
              <th className="p-4 text-right text-sm font-medium text-stone-600 dark:text-[#c8904a]">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((r) => (
              <tr
                key={r.id}
                className="border-t cursor-pointer
                  border-stone-100 hover:bg-stone-50
                  dark:border-[#1e1005] dark:hover:bg-[#1e0d05]
                  transition-colors"
                onClick={() => setModalReporte(r)}
              >
                <td className="p-4 text-gray-700 dark:text-[#e8c080]">
                  {r.nombre}
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${catBadgeLight[r.cat]} dark:${catBadge[r.cat]}`}>
                    {catLabel[r.cat]}
                  </span>
                </td>
                <td className="p-4 text-sm text-stone-500 dark:text-[#a07840]">
                  {r.fecha}
                </td>
                <td className="p-4">
                  <EstadoChip estado={r.estado} />
                </td>
                <td className="p-4 text-right">
                  <span className="text-sm text-amber-600 dark:text-[#c8804a]">
                    Ver detalle →
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}