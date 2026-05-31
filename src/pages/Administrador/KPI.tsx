import { useState } from "react";

// ─── Tipos ───────────────────────────────────────────────
type Trend = "up" | "down" | "neutral";

type KPICard = {
    id: string;
    label: string;
    value: string;
    subtitle: string;
    trend: Trend;
    trendLabel: string;
    color: "green" | "yellow" | "red" | "blue";
    detail: DetailItem[];
};

type DetailItem = { label: string; value: string | number };

type ChartPoint = { mes: string; valor: number };

// ─── Datos simulados (reemplaza con fetch a tu API) ──────
const kpiData: KPICard[] = [
    {
        id: "ventas",
        label: "Ingresos por Ventas",
        value: "Bs. 84,320",
        subtitle: "Total este mes",
        trend: "up",
        trendLabel: "+12% vs mes anterior",
        color: "green",
        detail: [
            { label: "Ventas registradas", value: 214 },
            { label: "Ticket promedio", value: "Bs. 394" },
            { label: "Sucursal top", value: "Sucursal Central" },
            { label: "Producto más vendido", value: "Pan de molde" },
        ],
    },
    {
        id: "produccion",
        label: "Producción",
        value: "3,840 u.",
        subtitle: "Unidades producidas este mes",
        trend: "up",
        trendLabel: "+7% vs mes anterior",
        color: "blue",
        detail: [
            { label: "Órdenes completadas", value: 48 },
            { label: "Empleados en producción", value: 6 },
            { label: "Producto más producido", value: "Croissant" },
            { label: "Promedio diario", value: "128 u." },
        ],
    },
    {
        id: "inventario",
        label: "Inventario",
        value: "91%",
        subtitle: "Nivel de stock promedio",
        trend: "neutral",
        trendLabel: "Estable este mes",
        color: "yellow",
        detail: [
            { label: "Productos en stock", value: 18 },
            { label: "Sucursales abastecidas", value: 3 },
            { label: "Productos críticos (<10 u.)", value: 2 },
            { label: "Último reabastecimiento", value: "28 May 2026" },
        ],
    },
    {
        id: "capacitaciones",
        label: "Capacitaciones",
        value: "74%",
        subtitle: "Tasa de completado",
        trend: "down",
        trendLabel: "-5% vs mes anterior",
        color: "red",
        detail: [
            { label: "Capacitaciones activas", value: 4 },
            { label: "Empleados inscritos", value: 12 },
            { label: "Empleados completaron", value: 9 },
            { label: "Calificación promedio", value: "8.3 / 10" },
        ],
    },
    {
        id: "compras",
        label: "Compras / Abastecimiento",
        value: "Bs. 21,500",
        subtitle: "Gasto en materia prima",
        trend: "down",
        trendLabel: "-3% vs mes anterior",
        color: "yellow",
        detail: [
            { label: "Órdenes de compra", value: 11 },
            { label: "Proveedores activos", value: 5 },
            { label: "Materia prima más comprada", value: "Harina de trigo" },
            { label: "Proveedor principal", value: "Molinos del Sur" },
        ],
    },
    {
        id: "empleados",
        label: "Rendimiento de Empleados",
        value: "89%",
        subtitle: "Productividad promedio",
        trend: "up",
        trendLabel: "+2% vs mes anterior",
        color: "green",
        detail: [
            { label: "Total empleados activos", value: 18 },
            { label: "Ventas por empleado (avg)", value: "Bs. 4,684" },
            { label: "Empleado destaque", value: "Ana Quispe" },
            { label: "Ausentismo", value: "2%" },
        ],
    },
];

// Datos para mini gráfico de línea (SVG sparkline)
const ventasMensuales: ChartPoint[] = [
    { mes: "Ene", valor: 62000 },
    { mes: "Feb", valor: 58000 },
    { mes: "Mar", valor: 71000 },
    { mes: "Abr", valor: 67000 },
    { mes: "May", valor: 84320 },
];

// ─── Colores ──────────────────────────────────────────────
const colorMap = {
    green: {
        text: "text-[#8b5e2a] dark:text-[#f5deb3]",
        badge:
            "bg-[#f3e2c7] text-[#8b5e2a] dark:bg-[#2a1a0d] dark:text-[#f5deb3]",
        bar: "bg-[#8b5e2a]",
        dot: "bg-[#8b5e2a]",
    },

    blue: {
        text: "text-[#a06e35] dark:text-[#e8b87a]",
        badge:
            "bg-[#f1dcc0] text-[#a06e35] dark:bg-[#332012] dark:text-[#e8b87a]",
        bar: "bg-[#a06e35]",
        dot: "bg-[#a06e35]",
    },

    yellow: {
        text: "text-[#c28a3d] dark:text-[#f0c78a]",
        badge:
            "bg-[#f6e7d1] text-[#b67b2d] dark:bg-[#3a2412] dark:text-[#f0c78a]",
        bar: "bg-[#c28a3d]",
        dot: "bg-[#c28a3d]",
    },

    red: {
        text: "text-[#b06b4f] dark:text-[#d9a58d]",
        badge:
            "bg-[#f2ddd2] text-[#a65f43] dark:bg-[#3a2018] dark:text-[#d9a58d]",
        bar: "bg-[#b06b4f]",
        dot: "bg-[#b06b4f]",
    },
};

const trendIcon = { up: "↑", down: "↓", neutral: "→" };
const trendColor = {
    up: "text-[#8b5e2a] dark:text-[#f5deb3]",
    down: "text-[#b06b4f] dark:text-[#d9a58d]",
    neutral: "text-[#7a5c3a] dark:text-[#b08a60]",
};

// ─── Sparkline SVG ────────────────────────────────────────
function Sparkline({ points }: { points: ChartPoint[] }) {
    const w = 120, h = 40, pad = 4;
    const vals = points.map((p) => p.valor);
    const min = Math.min(...vals), max = Math.max(...vals);
    const px = (i: number) => pad + (i / (points.length - 1)) * (w - pad * 2);
    const py = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
    const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(p.valor)}`).join(" ");
    const area = `${d} L ${px(points.length - 1)} ${h} L ${px(0)} ${h} Z`;

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c28a3d" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#c28a3d" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#sg)" />
            <path d={d} fill="none" stroke="#c28a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
                <circle key={i} cx={px(i)} cy={py(p.valor)} r="2.5" fill="#c28a3d" />
            ))}
        </svg>
    );
}

// ─── Modal de detalle ─────────────────────────────────────
function DetailModal({ kpi, onClose }: { kpi: KPICard; onClose: () => void }) {
    const c = colorMap[kpi.color];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-white dark:bg-[#18110d] shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#3a2a1a]">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-[#f5deb3]">{kpi.label}</h2>
                        <p className="text-sm text-gray-500 dark:text-[#cbb08b]">{kpi.subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#cbb08b] dark:hover:bg-[#2a1a0d] transition-colors"
                    >✕</button>
                </div>

                {/* Valor grande */}
                <div className="px-6 py-5 flex items-end gap-4">
                    <span className={`text-5xl font-bold ${c.text}`}>{kpi.value}</span>
                    <span className={`mb-1 text-sm font-semibold ${trendColor[kpi.trend]}`}>
                        {trendIcon[kpi.trend]} {kpi.trendLabel}
                    </span>
                </div>

                {/* Sparkline solo en ventas */}
                {kpi.id === "ventas" && (
                    <div className="px-6 pb-4">
                        <p className="text-xs text-gray-500 dark:text-[#cbb08b] mb-2">Tendencia últimos 5 meses</p>
                        <div className="flex items-end gap-3">
                            <Sparkline points={ventasMensuales} />
                            <div className="flex gap-2 flex-wrap">
                                {ventasMensuales.map((p) => (
                                    <div key={p.mes} className="text-center">
                                        <div className="text-xs text-gray-400 dark:text-[#7a5c3a]">{p.mes}</div>
                                        <div className="text-xs font-semibold text-gray-700 dark:text-[#cbb08b]">
                                            {(p.valor / 1000).toFixed(0)}k
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Detalles */}
                <div className="px-6 pb-6">
                    <div className="rounded-xl border border-gray-100 dark:border-[#3a2a1a] overflow-hidden">
                        {kpi.detail.map((d, i) => (
                            <div
                                key={i}
                                className={`flex items-center justify-between px-4 py-3 text-sm ${i % 2 === 0
                                    ? "bg-gray-50 dark:bg-[#120c08]"
                                    : "bg-white dark:bg-[#18110d]"
                                    } ${i > 0 ? "border-t border-gray-100 dark:border-[#2a1a0d]" : ""}`}
                            >
                                <span className="text-gray-600 dark:text-[#cbb08b]">{d.label}</span>
                                <span className="font-semibold text-gray-800 dark:text-[#f5deb3]">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Barra de progreso ────────────────────────────────────
function ProgressBar({ value, color }: { value: number; color: string }) {
    return (
        <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d] overflow-hidden">
            <div
                className={`h-full rounded-full ${color} transition-all`}
                style={{ width: `${Math.min(value, 100)}%` }}
            />
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────
export default function KPI() {
    const [selected, setSelected] = useState<KPICard | null>(null);

    // Extraer valor numérico para barra de progreso (solo los que son %)
    const getPercent = (v: string) => {
        const n = parseFloat(v);
        return isNaN(n) ? null : n;
    };

    const totalVentas = 84320;
    const totalCompras = 21500;
    const margen = (((totalVentas - totalCompras) / totalVentas) * 100).toFixed(1);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">
                Indicadores KPI
            </h1>
            <p className="mt-2 text-gray-600 dark:text-[#cbb08b]">
                Seguimiento de indicadores clave de rendimiento.
            </p>

            {/* Banner resumen */}
            <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex flex-wrap gap-6">
                <div>
                    <p className="text-xs text-gray-500 dark:text-[#cbb08b] uppercase tracking-wide">Ingresos netos</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Bs. 62,820</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-[#cbb08b] uppercase tracking-wide">Margen bruto</p>
                    <p className="text-2xl font-bold text-[#8b5e2a] dark:text-[#f5deb3]">{margen}%</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-[#cbb08b] uppercase tracking-wide">Unidades vendidas</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">3,210 u.</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-[#cbb08b] uppercase tracking-wide">Período</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Mayo 2026</p>
                </div>
            </div>

            {/* Grid de KPIs */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {kpiData.map((kpi) => {
                    const c = colorMap[kpi.color];
                    const pct = getPercent(kpi.value);
                    return (
                        <button
                            key={kpi.id}
                            onClick={() => setSelected(kpi)}
                            className="text-left rounded-2xl bg-white dark:bg-[#18110d] p-6 shadow-sm hover:shadow-md dark:hover:shadow-[#3a2a1a]/40 transition-shadow group cursor-pointer"
                        >
                            {/* Top row */}
                            <div className="flex items-start justify-between">
                                <h2 className="text-sm font-semibold text-gray-600 dark:text-[#cbb08b] uppercase tracking-wide">
                                    {kpi.label}
                                </h2>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                                    {trendIcon[kpi.trend]}
                                </span>
                            </div>

                            {/* Valor */}
                            <p className={`mt-3 text-4xl font-bold ${c.text}`}>{kpi.value}</p>

                            {/* Barra (solo si es %) */}
                            {pct !== null && <ProgressBar value={pct} color={c.bar} />}

                            {/* Trend */}
                            <p className={`mt-3 text-xs font-medium ${trendColor[kpi.trend]}`}>
                                {kpi.trendLabel}
                            </p>

                            {/* Subtitle + Ver detalle */}
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-gray-400 dark:text-[#7a5c3a]">{kpi.subtitle}</span>
                                <span className="text-xs font-medium text-amber-600 dark:text-[#e8b87a] group-hover:underline">
                                    Ver detalle →
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Modal */}
            {selected && (
                <DetailModal kpi={selected} onClose={() => setSelected(null)} />
            )}
        </div>
    );
}