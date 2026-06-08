"use client";

import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import {
  getKpiMeta,
  getDashboardKpis,
  getObjetivos,
  getSucursales,
  getClientesActivos,
  type DashboardKpisResponse,
} from "../../services/gestionEmpresarial";
import { getCapacitaciones } from "../../services/capacitaciones";

// ─── tipos ───────────────────────────────────────────────
type AlertaTipo = "warning" | "danger" | "info" | "success";

type KpiPerspectiva = {
  label: string;
  valor: number;
  color: string;
  displayValue: string;
};

type CapacitacionUI = {
  nombre: string;
  progreso: number;
  estado: "Completado" | "En curso" | "Pendiente";
};

type ObjetivoUI = {
  label: string;
  pct: number;
};

// ─── datos simulados ──────────────────────────────────────

const kpiPerspectivas: KpiPerspectiva[] = [
  { label: "Financiero", valor: 88, color: "#c8804a", displayValue: "88%" },
  { label: "Clientes", valor: 74, color: "#d4a056", displayValue: "74%" },
  { label: "Procesos", valor: 91, color: "#b8845e", displayValue: "91%" },
  { label: "Aprendizaje", valor: 65, color: "#e0a060", displayValue: "65%" },
];

const alertas: { tipo: AlertaTipo; titulo: string; desc: string }[] = [
  { tipo: "danger",  titulo: "Stock crítico",         desc: "Chocolate Blanco: solo 45 unidades en Central." },
  { tipo: "warning", titulo: "Inventario bajo",        desc: "Tableta 70% en Sucursal Norte: 120 unidades." },
  { tipo: "warning", titulo: "KPI en riesgo",          desc: "Capacitación no alcanzó la meta mensual (65%)." },
  { tipo: "info",    titulo: "Envío en tránsito",      desc: "180 bombones hacia Sucursal Sur en camino." },
  { tipo: "success", titulo: "Meta de ventas lograda", desc: "Mayo superó el objetivo mensual en +12%." },
];

// ─── helpers ─────────────────────────────────────────────
function estadoChip(estado: string) {
  const map: Record<string, string> = {
    completado: "bg-emerald-950 text-emerald-400 dark:bg-emerald-950 dark:text-emerald-400",
    pendiente:  "bg-amber-950  text-amber-400  dark:bg-amber-950  dark:text-amber-400",
    cancelado:  "bg-red-950    text-red-400    dark:bg-red-950    dark:text-red-400",
  };
  const label: Record<string, string> = { completado: "Completado", pendiente: "Pendiente", cancelado: "Cancelado" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${map[estado] ?? ""}`}>
      {label[estado] ?? estado}
    </span>
  );
}

function alertaEstilo(tipo: AlertaTipo) {
  const map: Record<AlertaTipo, string> = {
    danger:  "border-red-300    bg-red-50    dark:border-red-900    dark:bg-red-950/30",
    warning: "border-yellow-300 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20",
    info:    "border-blue-300   bg-blue-50   dark:border-blue-900   dark:bg-blue-950/20",
    success: "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20",
  };
  const txt: Record<AlertaTipo, string> = {
    danger:  "text-red-800    dark:text-red-400",
    warning: "text-yellow-800 dark:text-yellow-400",
    info:    "text-blue-800   dark:text-blue-400",
    success: "text-emerald-800 dark:text-emerald-400",
  };
  const sub: Record<AlertaTipo, string> = {
    danger:  "text-red-700    dark:text-red-300",
    warning: "text-yellow-700 dark:text-yellow-300",
    info:    "text-blue-700   dark:text-blue-300",
    success: "text-emerald-700 dark:text-emerald-300",
  };
  return { border: map[tipo], title: txt[tipo], desc: sub[tipo] };
}

// ─── Card wrapper ─────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-[#d8c2ac] bg-[#fff8f1] p-6 shadow-lg dark:border-[#3a2a20] dark:bg-[#211811] ${className}`}>
      {children}
    </div>
  );
}

// ─── Sección KPI card ─────────────────────────────────────
function KpiCard({ label, value, sub, subColor, icon }: {
  label: string; value: string; sub: string; subColor: string; icon: string;
}) {
  return (
    <Card className="col-span-12 sm:col-span-6 xl:col-span-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#8B6A53] dark:text-[#C7A98A]">{label}</p>
          <h2 className="mt-2 text-3xl font-bold text-[#5C3B1E] dark:text-[#F0C9A4]">{value}</h2>
        </div>
        <div className="rounded-2xl bg-[#E5C7A9] p-4 dark:bg-[#4B2E1E]">
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      <p className={`mt-4 text-sm ${subColor}`}>{sub}</p>
    </Card>
  );
}

// ─── Gráfico de barras simple ─────────────────────────────
// ─── Radar/Barras horizontales KPI ───────────────────────
function KpiPerspectivas({ data }: { data: KpiPerspectiva[] }) {
  const maxValor = Math.max(...data.map((k) => k.valor), 1);
  return (
    <div className="space-y-4">
      {data.map((k) => (
        <div key={k.label}>
          <div className="mb-1.5 flex justify-between items-center">
            <span className="text-sm text-[#6E4E37] dark:text-[#D1B095]">{k.label}</span>
            <span className="text-sm font-semibold text-[#8B5E3C] dark:text-[#E7C9A9]">{k.displayValue}</span>
          </div>
          <div className="h-2.5 rounded-full bg-[#dbc7b4] dark:bg-[#3a2a20]">
            <div
              className="h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${Math.min((k.valor / maxValor) * 100, 100)}%`, backgroundColor: k.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Objetivos estratégicos ───────────────────────────────
function Objetivos({ data }: { data: ObjetivoUI[] }) {
  return (
    <div className="space-y-5">
      {data.map((o) => (
        <div key={o.label}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-[#6E4E37] dark:text-[#D1B095]">{o.label}</span>
            <span className="text-sm font-semibold text-[#8B5E3C] dark:text-[#E7C9A9]">{o.pct}%</span>
          </div>
          <div className="h-3 rounded-full bg-[#dbc7b4] dark:bg-[#3a2a20]">
            <div className="h-3 rounded-full bg-[#8B5E3C]" style={{ width: `${o.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Capacitaciones ───────────────────────────────────────
function Capacitaciones({ data }: { data: CapacitacionUI[] }) {
  return (
    <div className="space-y-4">
      {data.map((c, i) => (
        <div key={i}>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm text-[#6E4E37] dark:text-[#D1B095] truncate pr-2">{c.nombre}</span>
            <span className={`text-xs font-medium whitespace-nowrap px-2 py-0.5 rounded-full ${
              c.estado === "Completado"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
            }`}>
              {c.estado}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-[#dbc7b4] dark:bg-[#3a2a20]">
              <div
                className={`h-2 rounded-full ${c.progreso === 100 ? "bg-emerald-600" : "bg-[#8B5E3C]"}`}
                style={{ width: `${c.progreso}%` }}
              />
            </div>
            <span className="text-xs text-[#8B6A53] dark:text-[#9a6840] w-8 text-right">{c.progreso}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Alertas ──────────────────────────────────────────────
function Alertas() {
  const [visibles, setVisibles] = useState(alertas.map((_, i) => i));
  function cerrar(i: number) {
    setVisibles((v) => v.filter((x) => x !== i));
  }
  return (
    <div className="space-y-3">
      {visibles.length === 0 && (
        <p className="text-sm text-center py-4 text-[#8B6A53] dark:text-[#C7A98A]">Sin alertas activas ✓</p>
      )}
      {visibles.map((i) => {
        const a = alertas[i];
        const s = alertaEstilo(a.tipo);
        return (
          <div key={i} className={`rounded-2xl border p-4 flex items-start justify-between gap-3 ${s.border}`}>
            <div>
              <h4 className={`font-semibold text-sm ${s.title}`}>{a.titulo}</h4>
              <p className={`mt-1 text-xs ${s.desc}`}>{a.desc}</p>
            </div>
            <button
              onClick={() => cerrar(i)}
              className={`text-xs mt-0.5 shrink-0 opacity-60 hover:opacity-100 cursor-pointer ${s.title}`}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────
export default function Home() {
  const [kpiPerspectivasState, setKpiPerspectivasState] = useState<KpiPerspectiva[]>(kpiPerspectivas);
  const [dashboardStats, setDashboardStats] = useState<DashboardKpisResponse | null>(null);
  const [capacitacionesState, setCapacitacionesState] = useState<CapacitacionUI[]>([]);
  const [objetivosState, setObjetivosState] = useState<ObjetivoUI[]>([]);
  const [sucursalesState, setSucursalesState] = useState<string[]>([]);
  const [clientesActivosState, setClientesActivosState] = useState<number | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // ─── PRIMERA ONDA: datos críticos del dashboard (3 en paralelo) ───
        const [metaData, kpis, capacitacionesData] = await Promise.all([
          getKpiMeta(),
          getDashboardKpis(),
          getCapacitaciones(),
        ]);

        setKpiPerspectivasState(
          metaData.map((item) => {
            const label = item.nombre
              .replace(/^[a-z]/, (ch) => ch.toUpperCase());
            const displayValue = item.meta.toLocaleString("es-BO");
            const color =
              label === "Financiero"
                ? "#c8804a"
                : label === "Clientes"
                ? "#d4a056"
                : label === "Procesos"
                ? "#b8845e"
                : "#e0a060";
            return {
              label,
              valor: item.meta,
              color,
              displayValue,
            };
          })
        );

        setDashboardStats(kpis);

        // Transformar capacitaciones del backend al formato UI
        const capacitacionesTransformadas: CapacitacionUI[] = capacitacionesData.map((cap) => {
          const empleados = cap.empleados || [];
          const completados = empleados.filter((e) => e.estado === "COMPLETADO").length;
          const progreso = empleados.length > 0 ? Math.round((completados / empleados.length) * 100) : 0;
          
          let estado: "Completado" | "En curso" | "Pendiente" = "Pendiente";
          if (progreso === 100) {
            estado = "Completado";
          } else if (progreso > 0) {
            estado = "En curso";
          }

          return {
            nombre: cap.nombre,
            progreso,
            estado,
          };
        });

        setCapacitacionesState(capacitacionesTransformadas);

        // ─── SEGUNDA ONDA: datos complementarios (después de esperar la primera) ───
        try {
          const [objetivosData, sucursales, clientesActivos] = await Promise.all([
            getObjetivos(),
            getSucursales(),
            getClientesActivos(),
          ]);

          // Transformar objetivos del backend al formato UI
          const objetivosTransformados: ObjetivoUI[] = objetivosData.map((obj) => ({
            label: obj.titulo,
            pct: obj.progreso,
          }));

          setObjetivosState(objetivosTransformados);
          setSucursalesState(sucursales);
          setClientesActivosState(clientesActivos.clientes_activos);
        } catch (e) {
          // non-fatal: keep dashboard loading
          console.warn('No se pudieron cargar datos complementarios', e);
        }
      } catch (error) {
        setDashboardError(
          error instanceof Error ? error.message : "Error al cargar datos del dashboard"
        );
      }
    }

    loadDashboardData();
  }, []);

  function formatCurrency(value: number) {
    return `Bs ${value.toLocaleString("es-BO")}`;
  }

  const ventasTotalesValue = dashboardStats ? formatCurrency(dashboardStats.ingresos) : "Bs 25,430";
  const produccionValue = dashboardStats ? `${dashboardStats.produccion} u.` : "2,840 u.";
  const inventarioValue = dashboardStats ? `${dashboardStats.stock} u.` : "4,210 u.";
  const empleadosValue = dashboardStats ? `${dashboardStats.empleados}` : "12";
  const kpiCumplidosValue = dashboardStats ? `${dashboardStats.capacitaciones}%` : "82%";
  const comprasQ2Value = dashboardStats ? formatCurrency(dashboardStats.gasto_compras) : "Bs 28,400";
  const sucursalesValue = dashboardStats ? `${dashboardStats.sucursales_abastecidas}` : (sucursalesState.length ? `${sucursalesState.length}` : "3");
  const sucursalesSub = sucursalesState.length ? sucursalesState.join(", ") : "Central, Norte, Sur";
  const clientesActivosValue = clientesActivosState !== null ? `${clientesActivosState}` : (dashboardStats ? `${dashboardStats.ventas_registradas}` : "48");

  return (
    <>
      <PageMeta
        title="Sistema de Gestión Estratégica | Dashboard"
        description="Dashboard administrativo del Sistema de Gestión Estratégica"
      />

      <div className="min-h-screen rounded-3xl bg-[#f5ede3] p-4 dark:bg-[#16110d] md:p-6">

        {/* HEADER */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#4B2E1E] dark:text-[#E7C9A9]">
              Dashboard Estratégico
            </h1>
            <p className="mt-2 text-sm text-[#7A5C46] dark:text-[#B89B84]">
              Monitoreo de indicadores KPI, ventas, producción y desempeño organizacional.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#8B6A53] dark:text-[#C7A98A]">Última actualización</p>
            <p className="text-sm font-medium text-[#5C3B1E] dark:text-[#F0C9A4]">28/05/2026 — 09:45</p>
          </div>
        </div>
        {dashboardError && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300">
            Error al cargar datos del backend: {dashboardError}
          </div>
        )}

        <div className="grid grid-cols-12 gap-5">

          {/* ── KPI CARDS ── */}
          <KpiCard label="Ventas Totales"  value={ventasTotalesValue}  sub="+12% respecto al mes anterior" subColor="text-green-700 dark:text-green-400"  icon="💰" />
          <KpiCard label="Producción"      value={produccionValue}      sub="85% cumplimiento mensual"       subColor="text-blue-700 dark:text-blue-400"   icon="🏭" />
          <KpiCard label="Inventario"      value={inventarioValue}      sub="1 producto en estado crítico"   subColor="text-red-700 dark:text-red-400"     icon="📦" />
          <KpiCard label="Empleados"       value={empleadosValue}       sub="3 cargos · 87% capacitados"     subColor="text-amber-700 dark:text-amber-400" icon="👥" />

          {/* segunda fila KPI */}
          <KpiCard label="KPI Cumplidos"   value={kpiCumplidosValue}   sub="Rendimiento óptimo"             subColor="text-green-700 dark:text-green-400"  icon="🎯" />
          <KpiCard label="Compras Q2"      value={comprasQ2Value}      sub="5 proveedores · 8 órdenes"      subColor="text-[#8B5E3C] dark:text-[#c8904a]" icon="🛒" />
          <KpiCard label="Sucursales"      value={sucursalesValue}      sub={sucursalesSub}            subColor="text-blue-700 dark:text-blue-400"   icon="🏪" />
          <KpiCard label="Clientes activos" value={clientesActivosValue} sub="+6 nuevos este mes"             subColor="text-green-700 dark:text-green-400"  icon="🤝" />

          {/* ── GRÁFICO VENTAS ── */}
          {/* ── OBJETIVOS ── */}
          <Card className="col-span-12 xl:col-span-4">
            <h3 className="mb-6 text-xl font-semibold text-[#4B2E1E] dark:text-[#E7C9A9]">Objetivos Estratégicos</h3>
            <Objetivos data={objetivosState} />
          </Card>

          {/* ── KPI PERSPECTIVAS ── */}
          <Card className="col-span-12 xl:col-span-5">
            <h3 className="mb-5 text-xl font-semibold text-[#4B2E1E] dark:text-[#E7C9A9]">Indicadores KPI</h3>
            <p className="mb-5 text-sm text-[#7A5C46] dark:text-[#B89B84]">Evaluación por perspectivas estratégicas.</p>
            <KpiPerspectivas data={kpiPerspectivasState} />
          </Card>

          {/* ── EMBED LOOKER / Data Studio ── */}
          <Card className="col-span-12 xl:col-span-7">
            <h3 className="mb-4 text-xl font-semibold text-[#4B2E1E] dark:text-[#E7C9A9]">Panel externo (Looker / Data Studio)</h3>
            <p className="mb-3 text-sm text-[#7A5C46] dark:text-[#B89B84]">Informe embebido desde Looker / Google Data Studio.</p>
            <div className="w-full">
              <div className="relative w-full pb-[75%] rounded-lg overflow-hidden border border-stone-200 dark:border-[#3a2a20]">
                <iframe
                  title="Looker Studio Report"
                  width="600"
                  height="450"
                  src="https://datastudio.google.com/embed/reporting/0793bc4e-523b-474f-ab29-3ce42e9b35f8/page/pBY0F"
                  className="absolute inset-0 w-full h-full"
                  frameBorder={0}
                  style={{ border: 0 }}
                  allowFullScreen
                  sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
            </div>
          </Card>

          {/* ── CAPACITACIONES ── */}
          <Card className="col-span-12 xl:col-span-7">
            <h3 className="mb-5 text-xl font-semibold text-[#4B2E1E] dark:text-[#E7C9A9]">Progreso de Capacitaciones</h3>
            <Capacitaciones data={capacitacionesState} />
          </Card>

          {/* ── ALERTAS ── */}
          <Card className="col-span-12 xl:col-span-5">
            <h3 className="mb-5 text-xl font-semibold text-[#4B2E1E] dark:text-[#E7C9A9]">Alertas Estratégicas</h3>
            <Alertas />
          </Card>

        </div>
      </div>
    </>
  );
}