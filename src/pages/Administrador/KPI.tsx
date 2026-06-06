import { useEffect, useState } from "react";

// ─── Config ───────────────────────────────────────────────
const API_URL = "http://127.0.0.1:8000/api/dashboard/kpis/";

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

// ─── Tipo de la respuesta del backend ─────────────────────
type KPIResponse = {
    // Resumen
    ingresos: number;
    costos: number;
    utilidad: number;
    margen_bruto: number;
    // Ventas
    ventas_registradas: number;
    ticket_promedio: number;
    producto_top: string;
    sucursal_top: string;           // query pendiente en backend
    // Producción
    produccion: number;
    ordenes_produccion: number;
    producto_produccion_top: string;
    empleados_produccion: number;   // query pendiente en backend
    promedio_diario: number;        // query pendiente en backend
    // Inventario
    stock: number;
    productos_stock: number;
    stock_critico: number;
    ultimo_reabastecimiento: string; // query pendiente en backend
    sucursales_abastecidas: number;  // query pendiente en backend
    // Compras
    compras: number;
    gasto_compras: number;
    materia_top: string;
    proveedor_top: string;           // query pendiente en backend
    proveedores_activos: number;     // query pendiente en backend
    // RRHH
    empleados: number;
    capacitaciones: number;
    capacitaciones_activas: number;  // query pendiente en backend
    empleados_inscritos: number;     // query pendiente en backend
    empleados_completaron: number;   // query pendiente en backend
    calificacion_promedio: number;   // query pendiente en backend
    ventas_por_empleado: number;     // query pendiente en backend
    empleado_destaque: string;       // query pendiente en backend
    ausentismo: number | null;
    // Histórico ventas (para sparkline)
    ventas_mensuales: { mes: string; valor: number }[];
};

// ─── Colores ──────────────────────────────────────────────
const colorMap = {
    green: {
        text: "text-[#8b5e2a] dark:text-[#f5deb3]",
        badge: "bg-[#f3e2c7] text-[#8b5e2a] dark:bg-[#2a1a0d] dark:text-[#f5deb3]",
        bar: "bg-[#8b5e2a]",
    },
    blue: {
        text: "text-[#a06e35] dark:text-[#e8b87a]",
        badge: "bg-[#f1dcc0] text-[#a06e35] dark:bg-[#332012] dark:text-[#e8b87a]",
        bar: "bg-[#a06e35]",
    },
    yellow: {
        text: "text-[#c28a3d] dark:text-[#f0c78a]",
        badge: "bg-[#f6e7d1] text-[#b67b2d] dark:bg-[#3a2412] dark:text-[#f0c78a]",
        bar: "bg-[#c28a3d]",
    },
    red: {
        text: "text-[#b06b4f] dark:text-[#d9a58d]",
        badge: "bg-[#f2ddd2] text-[#a65f43] dark:bg-[#3a2018] dark:text-[#d9a58d]",
        bar: "bg-[#b06b4f]",
    },
};

const trendIcon = { up: "↑", down: "↓", neutral: "→" };
const trendColor = {
    up: "text-[#8b5e2a] dark:text-[#f5deb3]",
    down: "text-[#b06b4f] dark:text-[#d9a58d]",
    neutral: "text-[#7a5c3a] dark:text-[#b08a60]",
};

// ─── Helpers ──────────────────────────────────────────────
const bs = (n: number | null | undefined) =>
    n != null ? `Bs. ${n.toLocaleString("es-BO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—";
const pct = (n: number | null | undefined) =>
    n != null ? `${n.toFixed(1)}%` : "—";
const fallback = (v: string | number | undefined | null, fb = "Sin datos") =>
    v !== undefined && v !== null && v !== "" ? String(v) : fb;

// ─── Construir KPI cards desde la respuesta de la API ─────
function buildKPICards(d: KPIResponse): KPICard[] {
    return [
        {
            id: "ventas",
            label: "Ingresos por Ventas",
            value: bs(d.ingresos),
            subtitle: "Total acumulado",
            trend: "up",
            trendLabel: `${d.ventas_registradas} ventas registradas`,
            color: "green",
            detail: [
                { label: "Ventas registradas", value: d.ventas_registradas },
                { label: "Ticket promedio", value: bs(d.ticket_promedio) },
                { label: "Sucursal top", value: fallback(d.sucursal_top) },
                { label: "Producto más vendido", value: fallback(d.producto_top) },
            ],
        },
        {
            id: "produccion",
            label: "Producción",
            value: `${d.produccion.toLocaleString()} u.`,
            subtitle: "Unidades producidas",
            trend: "up",
            trendLabel: `${d.ordenes_produccion} órdenes completadas`,
            color: "blue",
            detail: [
                { label: "Órdenes completadas", value: d.ordenes_produccion },
                { label: "Empleados en producción", value: fallback(d.empleados_produccion, "—") },
                { label: "Producto más producido", value: fallback(d.producto_produccion_top) },
                { label: "Promedio diario", value: fallback(d.promedio_diario ? `${d.promedio_diario} u.` : null, "—") },
            ],
        },
        {
            id: "inventario",
            label: "Inventario",
            value: `${d.stock.toLocaleString()} u.`,
            subtitle: "Stock total disponible",
            trend: d.stock_critico > 0 ? "down" : "neutral",
            trendLabel: d.stock_critico > 0
                ? `${d.stock_critico} producto(s) en nivel crítico`
                : "Stock en niveles normales",
            color: d.stock_critico > 0 ? "yellow" : "green",
            detail: [
                { label: "Productos en stock", value: d.productos_stock },
                { label: "Sucursales abastecidas", value: fallback(d.sucursales_abastecidas, "—") },
                { label: "Productos críticos (<10 u.)", value: d.stock_critico },
                { label: "Último reabastecimiento", value: fallback(d.ultimo_reabastecimiento) },
            ],
        },
        {
            id: "capacitaciones",
            label: "Capacitaciones",
            value: pct(d.capacitaciones),
            subtitle: "Tasa de completado",
            trend: d.capacitaciones >= 80 ? "up" : d.capacitaciones >= 60 ? "neutral" : "down",
            trendLabel: d.capacitaciones >= 80 ? "Buen rendimiento" : d.capacitaciones >= 60 ? "Progreso aceptable" : "Requiere atención",
            color: d.capacitaciones >= 75 ? "green" : d.capacitaciones >= 50 ? "yellow" : "red",
            detail: [
                { label: "Capacitaciones activas", value: fallback(d.capacitaciones_activas, "—") },
                { label: "Empleados inscritos", value: fallback(d.empleados_inscritos, "—") },
                { label: "Empleados completaron", value: fallback(d.empleados_completaron, "—") },
                { label: "Calificación promedio", value: d.calificacion_promedio ? `${d.calificacion_promedio} / 10` : "—" },
            ],
        },
        {
            id: "compras",
            label: "Compras / Abastecimiento",
            value: bs(d.gasto_compras),
            subtitle: "Gasto en materia prima",
            trend: "neutral",
            trendLabel: `${d.compras} órdenes de compra`,
            color: "yellow",
            detail: [
                { label: "Órdenes de compra", value: d.compras },
                { label: "Proveedores activos", value: fallback(d.proveedores_activos, "—") },
                { label: "Materia prima más comprada", value: fallback(d.materia_top) },
                { label: "Proveedor principal", value: fallback(d.proveedor_top) },
            ],
        },
        {
            id: "empleados",
            label: "Rendimiento de Empleados",
            value: `${d.empleados} emp.`,
            subtitle: "Total empleados activos",
            trend: "neutral",
            trendLabel: d.ventas_por_empleado != null ? `Bs. ${d.ventas_por_empleado.toFixed(0)} ventas/empleado` : "Sin datos de rendimiento",
            color: "green",
            detail: [
                { label: "Total empleados activos", value: d.empleados },
                { label: "Ventas por empleado (avg)", value: d.ventas_por_empleado ? bs(d.ventas_por_empleado) : "—" },
                { label: "Empleado destaque", value: fallback(d.empleado_destaque) },
                { label: "Ausentismo", value: pct(d.ausentismo) },
            ],
        },
    ];
}

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
function DetailModal({
    kpi,
    onClose,
    sparkData,
}: {
    kpi: KPICard;
    onClose: () => void;
    sparkData: ChartPoint[];
}) {
    const c = colorMap[kpi.color];
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full sm:max-w-lg flex flex-col rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#18110d] shadow-2xl max-h-[92dvh] sm:max-h-[85vh]">
                {/* Handle móvil */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-[#6f4e37]" />
                </div>
                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-[#3a2a1a] flex-shrink-0">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-[#f5deb3]">{kpi.label}</h2>
                        <p className="text-sm text-gray-500 dark:text-[#cbb08b]">{kpi.subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#cbb08b] dark:hover:bg-[#2a1a0d] transition-colors"
                    >✕</button>
                </div>

                {/* Body con scroll */}
                <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-4">
                    {/* Valor grande */}
                    <div className="flex items-end gap-4 mb-4">
                        <span className={`text-4xl sm:text-5xl font-bold ${c.text}`}>{kpi.value}</span>
                        <span className={`mb-1 text-sm font-semibold ${trendColor[kpi.trend]}`}>
                            {trendIcon[kpi.trend]} {kpi.trendLabel}
                        </span>
                    </div>

                    {/* Sparkline solo en ventas */}
                    {kpi.id === "ventas" && sparkData.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 dark:text-[#cbb08b] mb-2">Tendencia últimos meses</p>
                            <div className="flex items-end gap-3">
                                <Sparkline points={sparkData} />
                                <div className="flex gap-2 flex-wrap">
                                    {sparkData.map((p) => (
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

// ─── Skeleton loader ──────────────────────────────────────
function Skeleton() {
    return (
        <div className="animate-pulse rounded-2xl bg-white dark:bg-[#18110d] p-6 shadow-sm h-44">
            <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-[#2a1a0d] mb-4" />
            <div className="h-8 w-1/2 rounded bg-gray-200 dark:bg-[#2a1a0d] mb-3" />
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d]" />
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────
export default function KPI() {
    const [kpiCards, setKpiCards] = useState<KPICard[]>([]);
    const [sparkData, setSparkData] = useState<ChartPoint[]>([]);
    const [summary, setSummary] = useState<Pick<KPIResponse, "ingresos" | "utilidad" | "margen_bruto"> | null>(null);
    const [selected, setSelected] = useState<KPICard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(API_URL)
            .then((res) => {
                if (!res.ok) throw new Error("Error al conectar con el servidor");
                return res.json() as Promise<KPIResponse>;
            })
            .then((data) => {
                setKpiCards(buildKPICards(data));
                setSparkData(data.ventas_mensuales ?? []);
                setSummary({
                    ingresos: data.ingresos,
                    utilidad: data.utilidad,
                    margen_bruto: data.margen_bruto,
                });
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const getPercent = (v: string) => {
        const n = parseFloat(v);
        return isNaN(n) ? null : n;
    };

    if (error) {
        return (
            <div className="p-6">
                <p className="text-red-500 dark:text-red-400">⚠ {error}</p>
            </div>
        );
    }

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
                {loading ? (
                    <>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-2 w-24 rounded bg-gray-200 dark:bg-[#2a1a0d] mb-2" />
                                <div className="h-7 w-28 rounded bg-gray-200 dark:bg-[#2a1a0d]" />
                            </div>
                        ))}
                    </>
                ) : summary ? (
                    <>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-[#cbb08b] uppercase tracking-wide">Ingresos totales</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">{bs(summary.ingresos)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-[#cbb08b] uppercase tracking-wide">Utilidad neta</p>
                            <p className="text-2xl font-bold text-[#8b5e2a] dark:text-[#f5deb3]">{bs(summary.utilidad)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-[#cbb08b] uppercase tracking-wide">Margen bruto</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">{pct(summary.margen_bruto)}</p>
                        </div>
                    </>
                ) : null}
            </div>

            {/* Grid de KPIs */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
                    : kpiCards.map((kpi) => {
                        const c = colorMap[kpi.color];
                        const p = getPercent(kpi.value);
                        return (
                            <button
                                key={kpi.id}
                                onClick={() => setSelected(kpi)}
                                className="text-left rounded-2xl bg-white dark:bg-[#18110d] p-6 shadow-sm hover:shadow-md dark:hover:shadow-[#3a2a1a]/40 transition-shadow group cursor-pointer"
                            >
                                <div className="flex items-start justify-between">
                                    <h2 className="text-sm font-semibold text-gray-600 dark:text-[#cbb08b] uppercase tracking-wide">
                                        {kpi.label}
                                    </h2>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                                        {trendIcon[kpi.trend]}
                                    </span>
                                </div>
                                <p className={`mt-3 text-4xl font-bold ${c.text}`}>{kpi.value}</p>
                                {p !== null && <ProgressBar value={p} color={c.bar} />}
                                <p className={`mt-3 text-xs font-medium ${trendColor[kpi.trend]}`}>
                                    {kpi.trendLabel}
                                </p>
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
                <DetailModal
                    kpi={selected}
                    sparkData={sparkData}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}