import { useEffect, useState } from "react";

// ─── Config ───────────────────────────────────────────────
const API_URL      = "http://127.0.0.1:8000/api/dashboard/kpis/";
const API_PRED_URL = "http://127.0.0.1:8000/api/dashboard/predicciones/";

// ─── Tipos KPI (original) ─────────────────────────────────
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

type KPIResponse = {
    ingresos: number; costos: number; utilidad: number; margen_bruto: number;
    ventas_registradas: number; ticket_promedio: number; producto_top: string; sucursal_top: string;
    produccion: number; ordenes_produccion: number; producto_produccion_top: string;
    empleados_produccion: number; promedio_diario: number;
    stock: number; productos_stock: number; stock_critico: number;
    ultimo_reabastecimiento: string; sucursales_abastecidas: number;
    compras: number; gasto_compras: number; materia_top: string;
    proveedor_top: string; proveedores_activos: number;
    empleados: number; capacitaciones: number; capacitaciones_activas: number;
    empleados_inscritos: number; empleados_completaron: number; calificacion_promedio: number;
    ventas_por_empleado: number; empleado_destaque: string; ausentismo: number | null;
    ventas_mensuales: { mes: string; valor: number }[];
};

// ─── Tipos Predicciones (nuevo) ───────────────────────────
type Semaforo  = "optimo" | "riesgo" | "critico";
type Tendencia = "positiva" | "estable" | "negativa";

type PredResponse = {
    ventas:       { valor_predicho: number; crecimiento: number; tendencia: Tendencia; score: number; semaforo: Semaforo; historico: ChartPoint[] };
    produccion:   { valor_predicho: number; crecimiento: number; tendencia: Tendencia; score: number; semaforo: Semaforo; historico: ChartPoint[] };
    inventario:   { stock_actual: number; semanas_stock: number; estado: string; score: number; semaforo: Semaforo };
    capacitaciones: { tasa_actual: number; tasa_predicha: number; crecimiento: number; tendencia: Tendencia; score: number; semaforo: Semaforo };
    empleados:    { rendimiento_actual: number; rendimiento_predicho: number; crecimiento: number; tendencia: Tendencia; score: number; semaforo: Semaforo };
    indice_global: { valor: number; semaforo: Semaforo; pesos: Record<string, number>; scores: Record<string, number> };
    alertas:      { tipo: "optimo" | "riesgo" | "critico"; area: string; mensaje: string }[];
    recomendaciones: string[];
    tendencias:   { ventas: ({ mes: string; valor: number; tipo: "historico" | "prediccion" })[]; produccion: ({ mes: string; valor: number; tipo: "historico" | "prediccion" })[] };
};

// ─── Colores KPI (original) ───────────────────────────────
const colorMap = {
    green:  { text: "text-[#8b5e2a] dark:text-[#f5deb3]",  badge: "bg-[#f3e2c7] text-[#8b5e2a] dark:bg-[#2a1a0d] dark:text-[#f5deb3]",  bar: "bg-[#8b5e2a]" },
    blue:   { text: "text-[#a06e35] dark:text-[#e8b87a]",  badge: "bg-[#f1dcc0] text-[#a06e35] dark:bg-[#332012] dark:text-[#e8b87a]",  bar: "bg-[#a06e35]" },
    yellow: { text: "text-[#c28a3d] dark:text-[#f0c78a]",  badge: "bg-[#f6e7d1] text-[#b67b2d] dark:bg-[#3a2412] dark:text-[#f0c78a]",  bar: "bg-[#c28a3d]" },
    red:    { text: "text-[#b06b4f] dark:text-[#d9a58d]",  badge: "bg-[#f2ddd2] text-[#a65f43] dark:bg-[#3a2018] dark:text-[#d9a58d]",  bar: "bg-[#b06b4f]" },
};

const trendIcon  = { up: "↑", down: "↓", neutral: "→" };
const trendColor = {
    up:      "text-[#8b5e2a] dark:text-[#f5deb3]",
    down:    "text-[#b06b4f] dark:text-[#d9a58d]",
    neutral: "text-[#7a5c3a] dark:text-[#b08a60]",
};

// ─── Helpers ──────────────────────────────────────────────
const bs       = (n: number | null | undefined) => n != null ? `Bs. ${n.toLocaleString("es-BO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—";
const pct      = (n: number | null | undefined) => n != null ? `${n.toFixed(1)}%` : "—";
const fallback = (v: string | number | undefined | null, fb = "Sin datos") => v !== undefined && v !== null && v !== "" ? String(v) : fb;

// ─── buildKPICards (original) ─────────────────────────────
function buildKPICards(d: KPIResponse): KPICard[] {
    return [
        {
            id: "ventas", label: "Ingresos por Ventas", value: bs(d.ingresos),
            subtitle: "Total acumulado", trend: "up",
            trendLabel: `${d.ventas_registradas} ventas registradas`, color: "green",
            detail: [
                { label: "Ventas registradas",   value: d.ventas_registradas },
                { label: "Ticket promedio",       value: bs(d.ticket_promedio) },
                { label: "Sucursal top",          value: fallback(d.sucursal_top) },
                { label: "Producto más vendido",  value: fallback(d.producto_top) },
            ],
        },
        {
            id: "produccion", label: "Producción", value: `${d.produccion.toLocaleString()} u.`,
            subtitle: "Unidades producidas", trend: "up",
            trendLabel: `${d.ordenes_produccion} órdenes completadas`, color: "blue",
            detail: [
                { label: "Órdenes completadas",    value: d.ordenes_produccion },
                { label: "Empleados en producción",value: fallback(d.empleados_produccion, "—") },
                { label: "Producto más producido", value: fallback(d.producto_produccion_top) },
                { label: "Promedio diario",        value: fallback(d.promedio_diario ? `${d.promedio_diario} u.` : null, "—") },
            ],
        },
        {
            id: "inventario", label: "Inventario", value: `${d.stock.toLocaleString()} u.`,
            subtitle: "Stock total disponible",
            trend: d.stock_critico > 0 ? "down" : "neutral",
            trendLabel: d.stock_critico > 0 ? `${d.stock_critico} producto(s) en nivel crítico` : "Stock en niveles normales",
            color: d.stock_critico > 0 ? "yellow" : "green",
            detail: [
                { label: "Productos en stock",          value: d.productos_stock },
                { label: "Sucursales abastecidas",      value: fallback(d.sucursales_abastecidas, "—") },
                { label: "Productos críticos (<10 u.)", value: d.stock_critico },
                { label: "Último reabastecimiento",     value: fallback(d.ultimo_reabastecimiento) },
            ],
        },
        {
            id: "capacitaciones", label: "Capacitaciones", value: pct(d.capacitaciones),
            subtitle: "Tasa de completado",
            trend: d.capacitaciones >= 80 ? "up" : d.capacitaciones >= 60 ? "neutral" : "down",
            trendLabel: d.capacitaciones >= 80 ? "Buen rendimiento" : d.capacitaciones >= 60 ? "Progreso aceptable" : "Requiere atención",
            color: d.capacitaciones >= 75 ? "green" : d.capacitaciones >= 50 ? "yellow" : "red",
            detail: [
                { label: "Capacitaciones activas", value: fallback(d.capacitaciones_activas, "—") },
                { label: "Empleados inscritos",    value: fallback(d.empleados_inscritos, "—") },
                { label: "Empleados completaron",  value: fallback(d.empleados_completaron, "—") },
                { label: "Calificación promedio",  value: d.calificacion_promedio ? `${d.calificacion_promedio} / 10` : "—" },
            ],
        },
        {
            id: "compras", label: "Compras / Abastecimiento", value: bs(d.gasto_compras),
            subtitle: "Gasto en materia prima", trend: "neutral",
            trendLabel: `${d.compras} órdenes de compra`, color: "yellow",
            detail: [
                { label: "Órdenes de compra",          value: d.compras },
                { label: "Proveedores activos",        value: fallback(d.proveedores_activos, "—") },
                { label: "Materia prima más comprada", value: fallback(d.materia_top) },
                { label: "Proveedor principal",        value: fallback(d.proveedor_top) },
            ],
        },
        {
            id: "empleados", label: "Rendimiento de Empleados", value: `${d.empleados} emp.`,
            subtitle: "Total empleados activos", trend: "neutral",
            trendLabel: d.ventas_por_empleado != null ? `Bs. ${d.ventas_por_empleado.toFixed(0)} ventas/empleado` : "Sin datos de rendimiento",
            color: "green",
            detail: [
                { label: "Total empleados activos",  value: d.empleados },
                { label: "Ventas por empleado (avg)",value: d.ventas_por_empleado ? bs(d.ventas_por_empleado) : "—" },
                { label: "Empleado destaque",        value: fallback(d.empleado_destaque) },
                { label: "Ausentismo",               value: pct(d.ausentismo) },
            ],
        },
    ];
}

// ─── Sparkline SVG (original) ─────────────────────────────
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
                    <stop offset="0%"   stopColor="#c28a3d" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#c28a3d" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#sg)" />
            <path d={d} fill="none" stroke="#c28a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => <circle key={i} cx={px(i)} cy={py(p.valor)} r="2.5" fill="#c28a3d" />)}
        </svg>
    );
}

// ─── Modal de detalle (original) ──────────────────────────
function DetailModal({ kpi, onClose, sparkData }: { kpi: KPICard; onClose: () => void; sparkData: ChartPoint[] }) {
    const c = colorMap[kpi.color];
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full sm:max-w-lg flex flex-col rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#18110d] shadow-2xl max-h-[92dvh] sm:max-h-[85vh]">
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-[#6f4e37]" />
                </div>
                <div className="flex items-center justify-between px-5 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-[#3a2a1a] flex-shrink-0">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-[#f5deb3]">{kpi.label}</h2>
                        <p className="text-sm text-gray-500 dark:text-[#cbb08b]">{kpi.subtitle}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#cbb08b] dark:hover:bg-[#2a1a0d] transition-colors">✕</button>
                </div>
                <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-4">
                    <div className="flex items-end gap-4 mb-4">
                        <span className={`text-4xl sm:text-5xl font-bold ${c.text}`}>{kpi.value}</span>
                        <span className={`mb-1 text-sm font-semibold ${trendColor[kpi.trend]}`}>{trendIcon[kpi.trend]} {kpi.trendLabel}</span>
                    </div>
                    {kpi.id === "ventas" && sparkData.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 dark:text-[#cbb08b] mb-2">Tendencia últimos meses</p>
                            <div className="flex items-end gap-3">
                                <Sparkline points={sparkData} />
                                <div className="flex gap-2 flex-wrap">
                                    {sparkData.map((p) => (
                                        <div key={p.mes} className="text-center">
                                            <div className="text-xs text-gray-400 dark:text-[#7a5c3a]">{p.mes}</div>
                                            <div className="text-xs font-semibold text-gray-700 dark:text-[#cbb08b]">{(p.valor / 1000).toFixed(0)}k</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="rounded-xl border border-gray-100 dark:border-[#3a2a1a] overflow-hidden">
                        {kpi.detail.map((d, i) => (
                            <div key={i} className={`flex items-center justify-between px-4 py-3 text-sm ${i % 2 === 0 ? "bg-gray-50 dark:bg-[#120c08]" : "bg-white dark:bg-[#18110d]"} ${i > 0 ? "border-t border-gray-100 dark:border-[#2a1a0d]" : ""}`}>
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

// ─── ProgressBar (original) ───────────────────────────────
function ProgressBar({ value, color }: { value: number; color: string }) {
    return (
        <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d] overflow-hidden">
            <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
        </div>
    );
}

// ─── Skeleton (original) ──────────────────────────────────
function Skeleton() {
    return (
        <div className="animate-pulse rounded-2xl bg-white dark:bg-[#18110d] p-6 shadow-sm h-44">
            <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-[#2a1a0d] mb-4" />
            <div className="h-8 w-1/2 rounded bg-gray-200 dark:bg-[#2a1a0d] mb-3" />
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#2a1a0d]" />
        </div>
    );
}

// ══════════════════════════════════════════════════════════
// COMPONENTES NUEVOS — Módulo Predictivo
// ══════════════════════════════════════════════════════════

const SP = {
    optimo:  { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800", bar: "bg-emerald-500", label: "Óptimo"  },
    riesgo:  { dot: "bg-amber-500",   text: "text-amber-600 dark:text-amber-400",     badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",           bar: "bg-amber-500",   label: "Riesgo"  },
    critico: { dot: "bg-rose-500",    text: "text-rose-600 dark:text-rose-400",       badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",                 bar: "bg-rose-500",    label: "Crítico" },
};

function TrendArrow({ t }: { t: Tendencia }) {
    return <span className={t === "positiva" ? "text-emerald-500" : t === "negativa" ? "text-rose-500" : "text-amber-500"}>
        {t === "positiva" ? "↑" : t === "negativa" ? "↓" : "→"}
    </span>;
}

// Mini sparkline para tarjetas predictivas
function MiniSpark({ points }: { points: ChartPoint[] }) {
    if (points.length < 2) return null;
    const w = 72, h = 24, pad = 2;
    const vals = points.map(p => p.valor);
    const min = Math.min(...vals), max = Math.max(...vals);
    const range = max - min || 1;
    const px = (i: number) => pad + (i / (vals.length - 1)) * (w - pad * 2);
    const py = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);
    const d = vals.map((v, i) => `${i === 0 ? "M" : "L"} ${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-70">
            <path d={d} fill="none" stroke="#c28a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={px(vals.length - 1)} cy={py(vals[vals.length - 1])} r="2.5" fill="#c28a3d" />
        </svg>
    );
}

// Ring de score
function ScoreRing({ value, sem }: { value: number; sem: Semaforo }) {
    const r = 26, cx = 34, cy = 34, circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    const color  = sem === "optimo" ? "#10b981" : sem === "riesgo" ? "#f59e0b" : "#f43f5e";
    return (
        <svg width={68} height={68} viewBox="0 0 68 68">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" className="dark:stroke-[#2a1a0d]" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="5"
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dashoffset 1s ease" }} />
            <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="700" fill={color}>{value.toFixed(0)}</text>
            <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="#9ca3af">/100</text>
        </svg>
    );
}

// Tarjeta predictiva individual
type PCardProps = {
    icon: string; titulo: string; valorPrincipal: string; subtitulo: string;
    semaforo: Semaforo; tendencia?: Tendencia; crecimiento?: number;
    score: number; sparkPoints?: ChartPoint[];
    extra?: { label: string; value: string }[];
};
function PredCard(p: PCardProps) {
    const s = SP[p.semaforo];
    return (
        <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex flex-col gap-3 border border-gray-100 dark:border-[#2a1a0d]">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#cbb08b]">{p.titulo}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${s.badge}`}>{s.label}</span>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">{p.valorPrincipal}</p>
                    <p className="text-xs text-gray-500 dark:text-[#7a5c3a] mt-0.5">{p.subtitulo}</p>
                    {p.tendencia && (
                        <p className="text-xs mt-1 font-medium text-gray-600 dark:text-[#cbb08b]">
                            <TrendArrow t={p.tendencia} />{" "}
                            {p.crecimiento !== undefined
                                ? `${p.crecimiento > 0 ? "+" : ""}${p.crecimiento.toFixed(1)}% vs periodo anterior`
                                : p.tendencia}
                        </p>
                    )}
                </div>
                <div className="flex flex-col items-center gap-1">
                    <ScoreRing value={p.score} sem={p.semaforo} />
                    {p.sparkPoints && <MiniSpark points={p.sparkPoints} />}
                </div>
            </div>
            {p.extra && (
                <div className="pt-2 border-t border-gray-100 dark:border-[#2a1a0d] grid grid-cols-2 gap-x-4 gap-y-1">
                    {p.extra.map((e, i) => (
                        <div key={i}>
                            <p className="text-[10px] text-gray-400 dark:text-[#7a5c3a]">{e.label}</p>
                            <p className="text-xs font-semibold text-gray-700 dark:text-[#f5deb3]">{e.value}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Gráfico de tendencia histórica + punto predicho
function TrendChart({ points, formatter }: {
    points: { mes: string; valor: number; tipo: "historico" | "prediccion" }[];
    formatter: (v: number) => string;
}) {
    if (points.length === 0) return null;
    const vals = points.map(p => p.valor);
    const min = Math.min(...vals) * 0.85, max = Math.max(...vals) * 1.1;
    const range = max - min || 1;
    const W = 340, H = 110, pL = 8, pR = 8, pT = 14, pB = 26;
    const n = points.length;
    const px = (i: number) => pL + (i / (n - 1)) * (W - pL - pR);
    const py = (v: number) => pT + (1 - (v - min) / range) * (H - pT - pB);
    const histN = points.filter(p => p.tipo === "historico").length;
    const pathH = points.slice(0, histN).map((p, i) => `${i === 0 ? "M" : "L"} ${px(i).toFixed(1)} ${py(p.valor).toFixed(1)}`).join(" ");
    const pathP = `M ${px(histN - 1).toFixed(1)} ${py(points[histN - 1].valor).toFixed(1)} L ${px(n - 1).toFixed(1)} ${py(points[n - 1].valor).toFixed(1)}`;
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full max-w-full">
            <path d={pathH} fill="none" stroke="#c28a3d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={pathP} fill="none" stroke="#8b5e2a" strokeWidth="2" strokeDasharray="5,4" strokeLinecap="round" />
            {points.map((p, i) => (
                <g key={i}>
                    <circle cx={px(i)} cy={py(p.valor)} r={p.tipo === "prediccion" ? 5 : 3.5}
                        fill={p.tipo === "prediccion" ? "#8b5e2a" : "#c28a3d"} stroke="white" strokeWidth="1.5" />
                    {p.tipo === "prediccion" && (
                        <text x={px(i)} y={py(p.valor) - 10} textAnchor="middle" fontSize="9" fontWeight="700" fill="#8b5e2a">
                            {formatter(p.valor)}
                        </text>
                    )}
                </g>
            ))}
            {points.map((p, i) => (
                <text key={i} x={px(i)} y={H - 6} textAnchor="middle" fontSize="9"
                    fill={p.tipo === "prediccion" ? "#8b5e2a" : "#9a7a5a"}
                    fontWeight={p.tipo === "prediccion" ? "700" : "400"}>
                    {p.mes.split(" ")[0]}
                </text>
            ))}
        </svg>
    );
}

// Skeleton predicciones
function PredSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl bg-white dark:bg-[#18110d] p-5 border border-gray-100 dark:border-[#2a1a0d] space-y-3 h-44">
            <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-[#2a1a0d]" />
            <div className="h-7 w-1/2 rounded bg-gray-100 dark:bg-[#2a1a0d]" />
            <div className="h-2 w-full rounded bg-gray-100 dark:bg-[#2a1a0d]" />
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────
export default function KPI() {
    // ── Estado original ────────────────────────────────────
    const [kpiCards,  setKpiCards]  = useState<KPICard[]>([]);
    const [sparkData, setSparkData] = useState<ChartPoint[]>([]);
    const [summary,   setSummary]   = useState<Pick<KPIResponse, "ingresos" | "utilidad" | "margen_bruto"> | null>(null);
    const [selected,  setSelected]  = useState<KPICard | null>(null);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState<string | null>(null);

    // ── Estado nuevo — predicciones ────────────────────────
    const [predData,    setPredData]    = useState<PredResponse | null>(null);
    const [predLoading, setPredLoading] = useState(true);
    const [predError,   setPredError]   = useState<string | null>(null);
    const [showTrend,   setShowTrend]   = useState<"ventas" | "produccion">("ventas");

    // ── Fetch original ─────────────────────────────────────
    useEffect(() => {
        fetch(API_URL)
            .then(r => { if (!r.ok) throw new Error("Error al conectar con el servidor"); return r.json() as Promise<KPIResponse>; })
            .then(data => {
                setKpiCards(buildKPICards(data));
                setSparkData(data.ventas_mensuales ?? []);
                setSummary({ ingresos: data.ingresos, utilidad: data.utilidad, margen_bruto: data.margen_bruto });
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    // ── Fetch nuevo — predicciones ─────────────────────────
    useEffect(() => {
        fetch(API_PRED_URL)
            .then(r => { if (!r.ok) throw new Error("Error al cargar predicciones"); return r.json() as Promise<PredResponse>; })
            .then(setPredData)
            .catch(e => setPredError(e.message))
            .finally(() => setPredLoading(false));
    }, []);

    const getPercent = (v: string) => { const n = parseFloat(v); return isNaN(n) ? null : n; };

    if (error) return <div className="p-6"><p className="text-red-500 dark:text-red-400">⚠ {error}</p></div>;

    const ig    = predData?.indice_global;
    const igSem: Semaforo = ig?.semaforo ?? "riesgo";
    const igS   = SP[igSem];

    return (
        <div className="p-6">
            {/* ════════════════════════════════════════════════
                SECCIÓN ORIGINAL — KPIs actuales
            ════════════════════════════════════════════════ */}
            <h1 className="text-3xl font-bold text-gray-800 dark:text-[#f5deb3]">Indicadores KPI</h1>
            <p className="mt-2 text-gray-600 dark:text-[#cbb08b]">Seguimiento de indicadores clave de rendimiento.</p>

            {/* Banner resumen */}
            <div className="mt-6 rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5 flex flex-wrap gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                            <div className="h-2 w-24 rounded bg-gray-200 dark:bg-[#2a1a0d] mb-2" />
                            <div className="h-7 w-28 rounded bg-gray-200 dark:bg-[#2a1a0d]" />
                        </div>
                    ))
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

            {/* Grid KPI cards */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
                    : kpiCards.map(kpi => {
                        const c = colorMap[kpi.color];
                        const p = getPercent(kpi.value);
                        return (
                            <button key={kpi.id} onClick={() => setSelected(kpi)}
                                className="text-left rounded-2xl bg-white dark:bg-[#18110d] p-6 shadow-sm hover:shadow-md dark:hover:shadow-[#3a2a1a]/40 transition-shadow group cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <h2 className="text-sm font-semibold text-gray-600 dark:text-[#cbb08b] uppercase tracking-wide">{kpi.label}</h2>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{trendIcon[kpi.trend]}</span>
                                </div>
                                <p className={`mt-3 text-4xl font-bold ${c.text}`}>{kpi.value}</p>
                                {p !== null && <ProgressBar value={p} color={c.bar} />}
                                <p className={`mt-3 text-xs font-medium ${trendColor[kpi.trend]}`}>{kpi.trendLabel}</p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs text-gray-400 dark:text-[#7a5c3a]">{kpi.subtitle}</span>
                                    <span className="text-xs font-medium text-amber-600 dark:text-[#e8b87a] group-hover:underline">Ver detalle →</span>
                                </div>
                            </button>
                        );
                    })}
            </div>

            {/* Modal */}
            {selected && <DetailModal kpi={selected} sparkData={sparkData} onClose={() => setSelected(null)} />}


            {/* ════════════════════════════════════════════════
                SECCIÓN NUEVA — Módulo Predictivo Estratégico
            ════════════════════════════════════════════════ */}
            <div className="mt-12">
                {/* Divisor */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px flex-1 bg-gray-200 dark:bg-[#2a1a0d]" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-[#f5deb3] flex items-center gap-2">
                        🔮 Módulo Predictivo Estratégico
                    </h2>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-[#2a1a0d]" />
                </div>
                <p className="text-sm text-gray-500 dark:text-[#cbb08b] mb-6 -mt-3">
                    Proyecciones para el próximo periodo basadas en regresión lineal sobre datos históricos.
                </p>

                {predError && (
                    <p className="text-rose-500 dark:text-rose-400 mb-4">⚠ {predError}</p>
                )}

                {/* ── Índice global ─────────────────────────────── */}
                <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm border border-gray-100 dark:border-[#2a1a0d] p-5 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        {/* Ring grande */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                            {predLoading ? (
                                <div className="animate-pulse w-20 h-20 rounded-full bg-gray-100 dark:bg-[#2a1a0d]" />
                            ) : (
                                <svg width={84} height={84} viewBox="0 0 84 84">
                                    {(() => {
                                        const r = 34, cx = 42, cy = 42, circ = 2 * Math.PI * r;
                                        const offset = circ - ((ig?.valor ?? 0) / 100) * circ;
                                        const color  = igSem === "optimo" ? "#10b981" : igSem === "riesgo" ? "#f59e0b" : "#f43f5e";
                                        return <>
                                            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" className="dark:stroke-[#2a1a0d]" />
                                            <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
                                                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                                                transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dashoffset 1.2s ease" }} />
                                            <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight="800" fill={color}>{(ig?.valor ?? 0).toFixed(0)}</text>
                                            <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#9ca3af">/100</text>
                                        </>;
                                    })()}
                                </svg>
                            )}
                            <div>
                                <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-[#cbb08b] font-semibold">Índice Global de Desempeño</p>
                                {predLoading ? (
                                    <div className="animate-pulse h-6 w-44 rounded bg-gray-100 dark:bg-[#2a1a0d] mt-1" />
                                ) : (
                                    <>
                                        <p className={`text-xl font-bold mt-0.5 ${igS.text}`}>
                                            {igSem === "optimo" ? "🟢 Desempeño Óptimo" : igSem === "riesgo" ? "🟡 Desempeño en Riesgo" : "🔴 Desempeño Crítico"}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-[#7a5c3a] mt-0.5">Proyección empresarial del próximo periodo</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Barras de contribución */}
                        {!predLoading && ig && (
                            <div className="flex-1 grid grid-cols-5 gap-2 sm:ml-4">
                                {Object.entries(ig.pesos).map(([area, peso]) => {
                                    const score = ig.scores[area] ?? 0;
                                    const sem: Semaforo = score >= 80 ? "optimo" : score >= 60 ? "riesgo" : "critico";
                                    const lbl: Record<string, string> = { ventas: "Ventas", produccion: "Prod.", inventario: "Inv.", capacitaciones: "Capac.", empleados: "RRHH" };
                                    return (
                                        <div key={area} className="text-center">
                                            <p className="text-[9px] font-bold text-gray-500 dark:text-[#cbb08b] uppercase">{lbl[area]}</p>
                                            <p className={`text-sm font-bold ${SP[sem].text}`}>{score.toFixed(0)}</p>
                                            <div className="mt-1 h-1.5 rounded-full bg-gray-100 dark:bg-[#2a1a0d]">
                                                <div className={`h-full rounded-full ${SP[sem].bar}`} style={{ width: `${score}%`, transition: "width 1s ease" }} />
                                            </div>
                                            <p className="text-[9px] text-gray-400 dark:text-[#7a5c3a] mt-0.5">peso {peso}%</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Grid predicciones individuales ────────────── */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
                    {predLoading ? Array.from({ length: 5 }).map((_, i) => <PredSkeleton key={i} />) : predData ? (
                        <>
                            <PredCard icon="📈" titulo="Ventas estimadas"
                                valorPrincipal={bs(predData.ventas.valor_predicho)}
                                subtitulo="Próximo periodo"
                                semaforo={predData.ventas.semaforo} tendencia={predData.ventas.tendencia}
                                crecimiento={predData.ventas.crecimiento} score={predData.ventas.score}
                                sparkPoints={predData.ventas.historico}
                                extra={[
                                    { label: "Crecimiento histórico", value: `${predData.ventas.crecimiento > 0 ? "+" : ""}${predData.ventas.crecimiento.toFixed(1)}%` },
                                    { label: "Score", value: `${predData.ventas.score.toFixed(0)} / 100` },
                                ]} />
                            <PredCard icon="🏭" titulo="Producción proyectada"
                                valorPrincipal={`${predData.produccion.valor_predicho.toLocaleString()} u.`}
                                subtitulo="Unidades esperadas"
                                semaforo={predData.produccion.semaforo} tendencia={predData.produccion.tendencia}
                                crecimiento={predData.produccion.crecimiento} score={predData.produccion.score}
                                sparkPoints={predData.produccion.historico}
                                extra={[
                                    { label: "Crecimiento histórico", value: `${predData.produccion.crecimiento > 0 ? "+" : ""}${predData.produccion.crecimiento.toFixed(1)}%` },
                                    { label: "Score", value: `${predData.produccion.score.toFixed(0)} / 100` },
                                ]} />
                            <PredCard icon="📦" titulo="Inventario futuro"
                                valorPrincipal={`${predData.inventario.stock_actual.toLocaleString()} u.`}
                                subtitulo={predData.inventario.estado}
                                semaforo={predData.inventario.semaforo} score={predData.inventario.score}
                                extra={[
                                    { label: "Stock actual", value: `${predData.inventario.stock_actual.toLocaleString()} u.` },
                                    { label: "Duración estimada", value: `${predData.inventario.semanas_stock} semanas` },
                                ]} />
                            <PredCard icon="📚" titulo="Capacitaciones esperadas"
                                valorPrincipal={pct(predData.capacitaciones.tasa_predicha)}
                                subtitulo="Tasa de completado proyectada"
                                semaforo={predData.capacitaciones.semaforo} tendencia={predData.capacitaciones.tendencia}
                                crecimiento={predData.capacitaciones.crecimiento} score={predData.capacitaciones.score}
                                extra={[
                                    { label: "Tasa actual",    value: pct(predData.capacitaciones.tasa_actual) },
                                    { label: "Tasa predicha",  value: pct(predData.capacitaciones.tasa_predicha) },
                                ]} />
                            <PredCard icon="👨‍💼" titulo="Rendimiento empleados"
                                valorPrincipal={bs(predData.empleados.rendimiento_predicho)}
                                subtitulo="Por empleado · próximo periodo"
                                semaforo={predData.empleados.semaforo} tendencia={predData.empleados.tendencia}
                                crecimiento={predData.empleados.crecimiento} score={predData.empleados.score}
                                extra={[
                                    { label: "Rendimiento actual",   value: bs(predData.empleados.rendimiento_actual) },
                                    { label: "Rendimiento predicho", value: bs(predData.empleados.rendimiento_predicho) },
                                ]} />
                        </>
                    ) : null}
                </div>

                {/* ── Gráfico de tendencias ─────────────────────── */}
                <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm border border-gray-100 dark:border-[#2a1a0d] p-5 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-[#f5deb3]">
                            📊 Análisis de Tendencias
                        </h3>
                        <div className="flex gap-1">
                            {(["ventas", "produccion"] as const).map(k => (
                                <button key={k} onClick={() => setShowTrend(k)}
                                    className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${showTrend === k ? "bg-[#8b5e2a] text-white" : "bg-gray-100 text-gray-600 dark:bg-[#2a1a0d] dark:text-[#cbb08b]"}`}>
                                    {k === "ventas" ? "Ventas" : "Producción"}
                                </button>
                            ))}
                        </div>
                    </div>
                    {predLoading ? (
                        <div className="animate-pulse h-28 rounded-lg bg-gray-100 dark:bg-[#2a1a0d]" />
                    ) : predData ? (
                        <>
                            <TrendChart
                                points={predData.tendencias[showTrend]}
                                formatter={showTrend === "ventas" ? v => `${(v / 1000).toFixed(0)}k` : v => `${v.toLocaleString()}`}
                            />
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-0.5 bg-[#c28a3d]" />
                                    <span className="text-[10px] text-gray-400 dark:text-[#7a5c3a]">Histórico</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-5 border-t-2 border-dashed border-[#8b5e2a]" />
                                    <span className="text-[10px] text-gray-400 dark:text-[#7a5c3a]">Predicción</span>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* ── Alertas + Recomendaciones ─────────────────── */}
                <div className="grid gap-4 sm:grid-cols-2 mb-6">
                    {/* Alertas */}
                    <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm border border-gray-100 dark:border-[#2a1a0d] p-5">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-[#f5deb3] mb-3">🚨 Alertas Predictivas</h3>
                        {predLoading ? (
                            <div className="space-y-2">{[1, 2].map(i => <div key={i} className="animate-pulse h-12 rounded-xl bg-gray-100 dark:bg-[#2a1a0d]" />)}</div>
                        ) : predData?.alertas.map((a, i) => {
                            const s   = SP[a.tipo];
                            const ico = a.tipo === "optimo" ? "✅" : a.tipo === "riesgo" ? "⚠️" : "🔴";
                            return (
                                <div key={i} className={`flex gap-3 p-3 rounded-xl border mb-2 ${s.badge}`}>
                                    <span className="flex-shrink-0">{ico}</span>
                                    <div>
                                        <p className="text-xs font-bold">{a.area}</p>
                                        <p className="text-xs mt-0.5 opacity-90">{a.mensaje}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recomendaciones */}
                    <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm border border-gray-100 dark:border-[#2a1a0d] p-5">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-[#f5deb3] mb-3">💡 Recomendaciones Estratégicas</h3>
                        {predLoading ? (
                            <div className="space-y-2">{[1, 2].map(i => <div key={i} className="animate-pulse h-10 rounded-xl bg-gray-100 dark:bg-[#2a1a0d]" />)}</div>
                        ) : predData?.recomendaciones.map((r, i) => (
                            <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-[#fdf8f2] dark:bg-[#120c08] border border-[#f3e2c7] dark:border-[#2a1a0d] mb-2">
                                <span className="text-[#c28a3d] font-bold text-sm flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                <p className="text-xs text-gray-700 dark:text-[#cbb08b] leading-relaxed">{r}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Semáforo resumen ──────────────────────────── */}
                {!predLoading && predData && (
                    <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm border border-gray-100 dark:border-[#2a1a0d] p-5">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-[#f5deb3] mb-4">🚦 Semáforo Inteligente</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {[
                                { area: "Ventas",         icon: "📈", sem: predData.ventas.semaforo,         score: predData.ventas.score },
                                { area: "Producción",     icon: "🏭", sem: predData.produccion.semaforo,     score: predData.produccion.score },
                                { area: "Inventario",     icon: "📦", sem: predData.inventario.semaforo,     score: predData.inventario.score },
                                { area: "Capacitaciones", icon: "📚", sem: predData.capacitaciones.semaforo, score: predData.capacitaciones.score },
                                { area: "Empleados",      icon: "👨‍💼", sem: predData.empleados.semaforo,      score: predData.empleados.score },
                            ].map(({ area, icon, sem, score }) => {
                                const s = SP[sem as Semaforo];
                                return (
                                    <div key={area} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-[#120c08]">
                                        <span className="text-xl">{icon}</span>
                                        <div className={`w-3 h-3 rounded-full ${s.dot}`} />
                                        <p className="text-xs font-semibold text-gray-700 dark:text-[#cbb08b] text-center">{area}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badge}`}>{s.label} · {score.toFixed(0)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <p className="text-center text-[10px] text-gray-400 dark:text-[#5a3e2a] mt-4">
                    Predicciones generadas mediante regresión lineal sobre datos históricos · Solo orientativo
                </p>
            </div>
        </div>
    );
}