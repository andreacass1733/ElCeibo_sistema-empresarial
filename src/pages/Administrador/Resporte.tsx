"use client";

import { useEffect, useState } from "react";
import { getReportes } from "../../services/reportes";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ——— Tipos ———
type Categoria = "ventas" | "produccion" | "empleados" | "inventario" | "compras";
type Estado = "listo" | "pendiente" | "error";

interface Reporte {
  id: number;
  nombre: string;
  cat: Categoria;
  fecha: string;
  estado: Estado;
  detalle: ModalData;
}

interface ModalData {
  stats: { n: string; l: string }[];
  section: string;
  headers: string[];
  rows: string[][];
}

// ——— Helpers de estilo ———
const catLabel: Record<Categoria, string> = {
  ventas: "Ventas",
  produccion: "Producción",
  empleados: "Empleados",
  inventario: "Inventario",
  compras: "Compras",
};

const catBadge: Record<Categoria, string> = {
  ventas:     "bg-[#3d1a06] text-[#f5c16c]",
  produccion: "bg-[#2a1a08] text-[#d4a056]",
  empleados:  "bg-[#1e1208] text-[#b8845e]",
  inventario: "bg-[#241408] text-[#e0a060]",
  compras:    "bg-[#1a1205] text-[#c8904a]",
};

const catBadgeLight: Record<Categoria, string> = {
  ventas:     "bg-amber-100 text-amber-900",
  produccion: "bg-orange-100 text-orange-900",
  empleados:  "bg-yellow-100 text-yellow-900",
  inventario: "bg-stone-200 text-stone-800",
  compras:    "bg-amber-200 text-amber-900",
};

// ——— Helper: carga el logo desde /public/images/ y lo convierte a base64 ———
async function getLogoBase64(): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No canvas context");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject("No se pudo cargar el logo");
    // Ajusta esta ruta si tu imagen está en otro lugar
    img.src = "/images/LogoCeibo.png";
  });
}

// ——— Exportar PDF estético con logo ———
async function exportarPDF(reporte: Reporte) {
  const doc = new jsPDF();
  const data = reporte.detalle;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Cargar logo
  let logoDataUrl: string | null = null;
  try {
    logoDataUrl = await getLogoBase64();
  } catch {
    // Si falla la carga del logo, continúa sin él
    console.warn("Logo no disponible, generando PDF sin logo.");
  }

  // ── Franja de encabezado ────────────────────────────────────────────
  doc.setFillColor(48, 18, 4);
  doc.rect(0, 0, pageW, 42, "F");

  // Franja dorada decorativa inferior del header
  doc.setFillColor(120, 60, 10);
  doc.rect(0, 40, pageW, 2, "F");

  // Logo
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", 7, 3, 30, 30);
  }

  // Nombre empresa
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(245, 193, 108);
  doc.text("EL CEIBO", logoDataUrl ? 43 : 14, 17);

  // Subtítulo empresa
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 144, 74);
  doc.text("Productos · Alto Beni, Bolivia · Est. 1977", logoDataUrl ? 43 : 14, 25);

  // Etiqueta tipo doc
  doc.setFillColor(80, 35, 8);
  doc.roundedRect(logoDataUrl ? 43 : 14, 28, 48, 7, 1, 1, "F");
  doc.setFontSize(6.5);
  doc.setTextColor(245, 193, 108);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE EMPRESARIAL", logoDataUrl ? 46 : 17, 33);

  // Fecha de generación (esquina derecha del header)
  const fechaHoy = new Date().toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(160, 110, 50);
  doc.text(fechaHoy, pageW - 10, 35, { align: "right" });

  // ── Caja de info del reporte ────────────────────────────────────────
  doc.setFillColor(255, 248, 235);
  doc.setDrawColor(220, 160, 80);
  doc.setLineWidth(0.3);
  doc.roundedRect(8, 48, pageW - 16, 24, 2, 2, "FD");

  // Nombre del reporte
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(48, 18, 4);
  doc.text(reporte.nombre, 14, 58);

  // Meta-datos en fila
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 60, 20);

  // Categoría con bullet dorado
  doc.setTextColor(180, 110, 40);
  doc.text("●", 14, 67);
  doc.setTextColor(80, 45, 10);
  doc.text(`Categoría: ${catLabel[reporte.cat]}`, 19, 67);

  doc.setTextColor(180, 110, 40);
  doc.text("●", 80, 67);
  doc.setTextColor(80, 45, 10);
  doc.text(`Fecha: ${reporte.fecha}`, 85, 67);

  doc.setTextColor(180, 110, 40);
  doc.text("●", 140, 67);
  doc.setTextColor(80, 45, 10);
  doc.text(`Estado: ${reporte.estado.charAt(0).toUpperCase() + reporte.estado.slice(1)}`, 145, 67);

  // ── Sección Resumen ─────────────────────────────────────────────────
  // Título sección con línea
  doc.setFillColor(48, 18, 4);
  doc.rect(8, 78, 3, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(48, 18, 4);
  doc.text("RESUMEN ESTADÍSTICO", 14, 84);
  doc.setDrawColor(200, 150, 60);
  doc.setLineWidth(0.3);
  doc.line(14, 86, pageW - 8, 86);

  autoTable(doc, {
    startY: 89,
    head: [data.stats.map((s) => s.l)],
    body: [data.stats.map((s) => s.n)],
    styles: {
      halign: "center",
      fontSize: 12,
      fontStyle: "bold",
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [48, 18, 4],
      textColor: [245, 193, 108],
      fontSize: 7,
      fontStyle: "bold",
      cellPadding: 3,
    },
    bodyStyles: {
      fillColor: [255, 248, 235],
      textColor: [48, 18, 4],
    },
    margin: { left: 8, right: 8 },
    tableLineColor: [200, 150, 60],
    tableLineWidth: 0.2,
  });

  // ── Sección Detalle ──────────────────────────────────────────────────
  const afterStats = (doc as any).lastAutoTable.finalY + 10;

  doc.setFillColor(48, 18, 4);
  doc.rect(8, afterStats, 3, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(48, 18, 4);
  doc.text(data.section.toUpperCase(), 14, afterStats + 6);
  doc.setDrawColor(200, 150, 60);
  doc.setLineWidth(0.3);
  doc.line(14, afterStats + 8, pageW - 8, afterStats + 8);

  autoTable(doc, {
    startY: afterStats + 11,
    head: [data.headers],
    body: data.rows,
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [48, 18, 4],
      textColor: [245, 193, 108],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [255, 251, 242],
    },
    bodyStyles: {
      textColor: [30, 15, 3],
    },
    columnStyles: {
      0: { fontStyle: "bold" },
    },
    margin: { left: 8, right: 8 },
    tableLineColor: [220, 175, 100],
    tableLineWidth: 0.1,
  });

  // ── Pie de página ────────────────────────────────────────────────────
  doc.setFillColor(48, 18, 4);
  doc.rect(0, pageH - 14, pageW, 14, "F");

  // Línea dorada encima del footer
  doc.setFillColor(120, 60, 10);
  doc.rect(0, pageH - 15, pageW, 1, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(160, 110, 50);
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })} · El Ceibo © ${new Date().getFullYear()} · Todos los derechos reservados`,
    8,
    pageH - 5
  );

  doc.setTextColor(245, 193, 108);
  doc.text("www.elceibo.com", pageW - 10, pageH - 5, { align: "right" });

  doc.save(`ElCeibo_${reporte.nombre.replace(/\s+/g, "_")}.pdf`);
}

// ——— Exportar Excel estético ———
function exportarExcel(reporte: Reporte) {
  const data = reporte.detalle;
  const wb = XLSX.utils.book_new();

  // ── Hoja 1: Resumen ──────────────────────────────────────────────────
  const statsLabels = data.stats.map((s) => s.l);
  const statsValues = data.stats.map((s) => s.n);

  const resumenData = [
    ["EL CEIBO — Reporte Empresarial"],
    ["Productos · Alto Beni, Bolivia · Desde 1977"],
    [""],
    ["Nombre:", reporte.nombre],
    ["Categoría:", catLabel[reporte.cat]],
    ["Fecha:", reporte.fecha],
    ["Estado:", reporte.estado.charAt(0).toUpperCase() + reporte.estado.slice(1)],
    ["Generado:", new Date().toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })],
    [""],
    ["── RESUMEN ESTADÍSTICO ──"],
    statsLabels,
    statsValues,
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);

  // Anchos de columna
  const maxCols = Math.max(statsLabels.length, 2);
  wsResumen["!cols"] = Array.from({ length: maxCols }, (_, i) =>
    i === 0 ? { wch: 28 } : { wch: 22 }
  );

  // Merges para encabezados
  wsResumen["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: maxCols - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: maxCols - 1 } },
    { s: { r: 9, c: 0 }, e: { r: 9, c: maxCols - 1 } },
  ];

  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

  // ── Hoja 2: Detalle ──────────────────────────────────────────────────
  const numCols = data.headers.length;

  const detalleData = [
    ["EL CEIBO"],
    [`${reporte.nombre}`],
    [`${catLabel[reporte.cat]} · ${reporte.fecha} · Estado: ${reporte.estado}`],
    [""],
    [data.section],
    [""],
    data.headers,
    ...data.rows,
    [""],
    [`© El Ceibo ${new Date().getFullYear()} — www.elceibo.com`],
  ];

  const wsDetalle = XLSX.utils.aoa_to_sheet(detalleData);

  // Anchos de columna automáticos
  wsDetalle["!cols"] = data.headers.map((h) => ({
    wch: Math.max(h.length + 4, 16),
  }));

  // Merges encabezado detalle
  wsDetalle["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: numCols - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: numCols - 1 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: numCols - 1 } },
    { s: { r: detalleData.length - 1, c: 0 }, e: { r: detalleData.length - 1, c: numCols - 1 } },
  ];

  XLSX.utils.book_append_sheet(wb, wsDetalle, "Detalle");

  XLSX.writeFile(wb, `ElCeibo_${reporte.nombre.replace(/\s+/g, "_")}.xlsx`);
}

// ——— Botones de exportación ———
function ExportButtons({ reporte }: { reporte: Reporte }) {
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handlePdf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingPdf(true);
    try {
      await exportarPDF(reporte);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* PDF */}
      <button
        onClick={handlePdf}
        disabled={loadingPdf}
        title="Exportar PDF"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all
          bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50
          dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/70"
      >
        {loadingPdf ? (
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 15h1.5c.8 0 1.5-.4 1.5-1.2S10.3 12.8 9.5 12.8H8V15zm0 3V16h1.5c1.7 0 3-.9 3-2.2S11.2 11.5 9.5 11.5H7v6.5h1zm7-3.5h-1.5V11.5H15v3z" />
          </svg>
        )}
        {loadingPdf ? "..." : "PDF"}
      </button>

      {/* Excel */}
      <button
        onClick={(e) => { e.stopPropagation(); exportarExcel(reporte); }}
        title="Exportar Excel"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all
          bg-emerald-50 text-emerald-700 hover:bg-emerald-100
          dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/70"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM9.1 17l-1.6-2.8-1.6 2.8H4.4l2.5-4-2.4-4h1.6l1.5 2.7 1.5-2.7h1.6L8.7 13l2.5 4H9.1zm5.9 0h-1.5V11H15v6z" />
        </svg>
        Excel
      </button>
    </div>
  );
}

// ——— Estado chip ———
function EstadoChip({ estado }: { estado: Estado }) {
  if (estado === "listo")
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
        Listo
      </span>
    );
  if (estado === "pendiente")
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">
        Pendiente
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400">
      Error
    </span>
  );
}

// ——— Modal ———
function Modal({ reporte, onClose }: { reporte: Reporte; onClose: () => void }) {
  const data = reporte.detalle;
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
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs ${catBadgeLight[reporte.cat]} dark:${catBadge[reporte.cat]}`}
              >
                {catLabel[reporte.cat]}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButtons reporte={reporte} />
            <button
              onClick={onClose}
              className="text-xs border rounded-lg px-3 py-1 cursor-pointer
                border-stone-300 text-stone-600 hover:bg-stone-100
                dark:border-[#5a3010] dark:text-[#c8904a] dark:hover:bg-[#2e1a0a]"
            >
              ✕
            </button>
          </div>
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

        {/* Tabla */}
        <p className="text-xs font-medium uppercase tracking-wide mb-2 text-stone-400 dark:text-[#9a6030]">
          {data.section}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-100 dark:bg-[#0e0702]">
                {data.headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left font-medium
                      text-stone-600 border-b border-stone-200
                      dark:text-[#c8904a] dark:border-[#3d1e08]"
                  >
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
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Categoria | "all">("all");
  const [modalReporte, setModalReporte] = useState<Reporte | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getReportes()
      .then((data) => setReportes(data))
      .catch((err) => setError(err.message || "Error al cargar los reportes"))
      .finally(() => setLoading(false));
  }, []);

  const filtrados =
    filtro === "all" ? reportes : reportes.filter((r) => r.cat === filtro);

  const filtros: { key: Categoria | "all"; label: string }[] = [
    { key: "all",        label: "Todos" },
    { key: "ventas",     label: "Ventas" },
    { key: "produccion", label: "Producción" },
    { key: "empleados",  label: "Empleados" },
    { key: "inventario", label: "Inventario" },
    { key: "compras",    label: "Compras" },
  ];

  return (
    <div className="p-6">
      {modalReporte && (
        <Modal reporte={modalReporte} onClose={() => setModalReporte(null)} />
      )}

      {/* Encabezado */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">Reportes</h1>
      <p className="mt-2 text-gray-600 dark:text-[#cbb08b]">
        Visualización y exportación de reportes empresariales.
      </p>

      {/* Loading */}
      {loading && (
        <div className="mt-6 flex items-center justify-center p-8">
          <div className="w-10 h-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-6 rounded-2xl bg-red-50 dark:bg-red-900/20 p-6 text-red-700 dark:text-red-300">
          <p className="font-medium">Error al cargar los reportes</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Filtros */}
          <div className="mt-6 flex flex-wrap gap-2">
            {filtros.map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className={`px-4 py-1.5 rounded-full text-sm cursor-pointer transition-colors
                  ${
                    filtro === f.key
                      ? "bg-amber-700 text-amber-50 dark:bg-[#2e1408] dark:text-[#f5c16c] dark:border dark:border-[#7a3e10]"
                      : "bg-stone-100 text-stone-600 dark:bg-transparent dark:text-[#a07840] dark:border dark:border-[#3d1e08]"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Tabla */}
          <div
            className="mt-5 overflow-hidden rounded-2xl
              bg-white shadow-sm border border-stone-100
              dark:bg-[#120a04] dark:border-[#3d1e08]"
          >
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
                  <th className="p-4 text-center text-sm font-medium text-stone-600 dark:text-[#c8904a]">
                    Exportar
                  </th>
                  <th className="p-4 text-right text-sm font-medium text-stone-600 dark:text-[#c8904a]">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400 dark:text-[#6a4820]">
                      No hay reportes en esta categoría.
                    </td>
                  </tr>
                )}
                {filtrados.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t cursor-pointer
                      border-stone-100 hover:bg-stone-50
                      dark:border-[#1e1005] dark:hover:bg-[#1e0d05]
                      transition-colors"
                    onClick={() => setModalReporte(r)}
                  >
                    <td className="p-4 text-gray-700 dark:text-[#e8c080]">{r.nombre}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${catBadgeLight[r.cat]} dark:${catBadge[r.cat]}`}
                      >
                        {catLabel[r.cat]}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-stone-500 dark:text-[#a07840]">{r.fecha}</td>
                    <td className="p-4">
                      <EstadoChip estado={r.estado} />
                    </td>
                    <td className="p-4 flex justify-center">
                      <ExportButtons reporte={r} />
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
        </>
      )}
    </div>
  );
}