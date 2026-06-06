"use client";

import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";

// ─── tipos ───────────────────────────────────────────────
type AlertaTipo = "warning" | "danger" | "info" | "success";

// ─── datos simulados ──────────────────────────────────────
const ventasMensuales = [
  { mes: "Ene", valor: 18200 },
  { mes: "Feb", valor: 21400 },
  { mes: "Mar", valor: 19800 },
  { mes: "Abr", valor: 23100 },
  { mes: "May", valor: 25430 },
  { mes: "Jun", valor: 22600 },
  { mes: "Jul", valor: 27800 },
  { mes: "Ago", valor: 24300 },
  { mes: "Sep", valor: 26100 },
  { mes: "Oct", valor: 28400 },
  { mes: "Nov", valor: 30200 },
  { mes: "Dic", valor: 32500 },
];

const kpiPerspectivas = [
  { label: "Financiero", valor: 88, color: "#c8804a" },
  { label: "Clientes", valor: 74, color: "#d4a056" },
  { label: "Procesos", valor: 91, color: "#b8845e" },
  { label: "Aprendizaje", valor: 65, color: "#e0a060" },
];

const ultimasVentas = [
  { id: "V-0041", cliente: "Mercado Central", sucursal: "Central", monto: 4820, fecha: "28/05/2026", estado: "completado" },
  { id: "V-0040", cliente: "Supermercados Norte", sucursal: "Norte", monto: 6340, fecha: "27/05/2026", estado: "completado" },
  { id: "V-0039", cliente: "Tienda El Cacao", sucursal: "Sur", monto: 2110, fecha: "27/05/2026", estado: "pendiente" },
  { id: "V-0038", cliente: "Hotel Camino Real", sucursal: "Central", monto: 8900, fecha: "26/05/2026", estado: "completado" },
  { id: "V-0037", cliente: "Distribuidora Andes", sucursal: "Norte", monto: 3200, fecha: "25/05/2026", estado: "cancelado" },
];

const produccionReciente = [
  { producto: "Tableta 70%", cantidad: 800, empleado: "María Ticona", fecha: "28/05/2026" },
  { producto: "Trufa maracuyá", cantidad: 640, empleado: "Pedro Condori", fecha: "27/05/2026" },
  { producto: "Bombón relleno", cantidad: 520, empleado: "Juan Mamani", fecha: "26/05/2026" },
  { producto: "Chocolate blanco", cantidad: 880, empleado: "Ana Quispe", fecha: "25/05/2026" },
];

const capacitaciones = [
  { nombre: "Manipulación de chocolate", progreso: 100, estado: "Completado" },
  { nombre: "Atención al cliente", progreso: 100, estado: "Completado" },
  { nombre: "Seguridad alimentaria", progreso: 60, estado: "En curso" },
  { nombre: "Control de calidad", progreso: 40, estado: "En curso" },
];

const alertas: { tipo: AlertaTipo; titulo: string; desc: string }[] = [
  { tipo: "danger",  titulo: "Stock crítico",         desc: "Chocolate Blanco: solo 45 unidades en Central." },
  { tipo: "warning", titulo: "Inventario bajo",        desc: "Tableta 70% en Sucursal Norte: 120 unidades." },
  { tipo: "warning", titulo: "KPI en riesgo",          desc: "Capacitación no alcanzó la meta mensual (65%)." },
  { tipo: "info",    titulo: "Envío en tránsito",      desc: "180 bombones hacia Sucursal Sur en camino." },
  { tipo: "success", titulo: "Meta de ventas lograda", desc: "Mayo superó el objetivo mensual en +12%." },
];

// ─── helpers ─────────────────────────────────────────────
const maxVenta = Math.max(...ventasMensuales.map((v) => v.valor));

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
function BarChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-1.5 h-48 w-full">
      {ventasMensuales.map((v, i) => {
        const pct = (v.valor / maxVenta) * 100;
        const isHov = hovered === i;
        return (
          <div
            key={i}
            className="flex flex-col items-center flex-1 gap-1 cursor-pointer group"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {isHov && (
              <span className="text-xs font-medium text-[#8B5E3C] dark:text-[#f5c16c] whitespace-nowrap">
                Bs {v.valor.toLocaleString()}
              </span>
            )}
            <div
              className="w-full rounded-t-lg transition-all duration-200"
              style={{
                height: `${pct}%`,
                background: isHov
                  ? "linear-gradient(to top, #8B5E3C, #c8904a)"
                  : "linear-gradient(to top, #5C3B1E, #8B5E3C)",
                opacity: hovered !== null && !isHov ? 0.5 : 1,
              }}
            />
            <span className="text-[10px] text-[#8B6A53] dark:text-[#9a6840]">{v.mes}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Radar/Barras horizontales KPI ───────────────────────
function KpiPerspectivas() {
  return (
    <div className="space-y-4">
      {kpiPerspectivas.map((k) => (
        <div key={k.label}>
          <div className="mb-1.5 flex justify-between items-center">
            <span className="text-sm text-[#6E4E37] dark:text-[#D1B095]">{k.label}</span>
            <span className="text-sm font-semibold text-[#8B5E3C] dark:text-[#E7C9A9]">{k.valor}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-[#dbc7b4] dark:bg-[#3a2a20]">
            <div
              className="h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${k.valor}%`, backgroundColor: k.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Objetivos estratégicos ───────────────────────────────
const objetivos = [
  { label: "Incrementar Ventas", pct: 90 },
  { label: "Mejorar Producción", pct: 78 },
  { label: "Capacitación",       pct: 65 },
  { label: "Retención Clientes", pct: 83 },
];

function Objetivos() {
  return (
    <div className="space-y-5">
      {objetivos.map((o) => (
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

// ─── Tabla últimas ventas ─────────────────────────────────
function TablaVentas() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#d8c2ac] dark:border-[#3a2a20]">
            {["ID", "Cliente", "Sucursal", "Monto", "Fecha", "Estado"].map((h) => (
              <th key={h} className="pb-3 text-left font-medium text-[#8B6A53] dark:text-[#C7A98A]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ultimasVentas.map((v, i) => (
            <tr key={i} className="border-b border-[#ede0d4] dark:border-[#2a1e14] last:border-0 hover:bg-[#f0e6dc] dark:hover:bg-[#2a1810] transition-colors">
              <td className="py-3 font-mono text-xs text-[#8B5E3C] dark:text-[#c8904a]">{v.id}</td>
              <td className="py-3 text-[#4B2E1E] dark:text-[#E7C9A9]">{v.cliente}</td>
              <td className="py-3 text-[#7A5C46] dark:text-[#B89B84]">{v.sucursal}</td>
              <td className="py-3 font-semibold text-[#5C3B1E] dark:text-[#F0C9A4]">Bs {v.monto.toLocaleString()}</td>
              <td className="py-3 text-[#7A5C46] dark:text-[#B89B84]">{v.fecha}</td>
              <td className="py-3">{estadoChip(v.estado)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tabla producción reciente ────────────────────────────
function TablaProduccion() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#d8c2ac] dark:border-[#3a2a20]">
            {["Producto", "Unidades", "Responsable", "Fecha"].map((h) => (
              <th key={h} className="pb-3 text-left font-medium text-[#8B6A53] dark:text-[#C7A98A]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {produccionReciente.map((p, i) => (
            <tr key={i} className="border-b border-[#ede0d4] dark:border-[#2a1e14] last:border-0 hover:bg-[#f0e6dc] dark:hover:bg-[#2a1810] transition-colors">
              <td className="py-3 text-[#4B2E1E] dark:text-[#E7C9A9]">{p.producto}</td>
              <td className="py-3 font-semibold text-[#5C3B1E] dark:text-[#F0C9A4]">{p.cantidad}</td>
              <td className="py-3 text-[#7A5C46] dark:text-[#B89B84]">{p.empleado}</td>
              <td className="py-3 text-[#7A5C46] dark:text-[#B89B84]">{p.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Capacitaciones ───────────────────────────────────────
function Capacitaciones() {
  return (
    <div className="space-y-4">
      {capacitaciones.map((c, i) => (
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

        <div className="grid grid-cols-12 gap-5">

          {/* ── KPI CARDS ── */}
          <KpiCard label="Ventas Totales"  value="Bs 25,430" sub="+12% respecto al mes anterior" subColor="text-green-700 dark:text-green-400"  icon="💰" />
          <KpiCard label="Producción"      value="2,840 u."  sub="85% cumplimiento mensual"       subColor="text-blue-700 dark:text-blue-400"   icon="🏭" />
          <KpiCard label="Inventario"      value="4,210 u."  sub="1 producto en estado crítico"   subColor="text-red-700 dark:text-red-400"     icon="📦" />
          <KpiCard label="Empleados"       value="12"        sub="3 cargos · 87% capacitados"     subColor="text-amber-700 dark:text-amber-400" icon="👥" />

          {/* segunda fila KPI */}
          <KpiCard label="KPI Cumplidos"   value="82%"       sub="Rendimiento óptimo"             subColor="text-green-700 dark:text-green-400"  icon="🎯" />
          <KpiCard label="Compras Q2"      value="Bs 28,400" sub="5 proveedores · 8 órdenes"      subColor="text-[#8B5E3C] dark:text-[#c8904a]" icon="🛒" />
          <KpiCard label="Sucursales"      value="3"         sub="Central, Norte, Sur"            subColor="text-blue-700 dark:text-blue-400"   icon="🏪" />
          <KpiCard label="Clientes activos" value="48"       sub="+6 nuevos este mes"             subColor="text-green-700 dark:text-green-400"  icon="🤝" />

          {/* ── GRÁFICO VENTAS ── */}
          <Card className="col-span-12 xl:col-span-8">
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-[#4B2E1E] dark:text-[#E7C9A9]">Ventas Mensuales</h3>
              <p className="mt-1 text-sm text-[#7A5C46] dark:text-[#B89B84]">Seguimiento del rendimiento comercial 2026.</p>
            </div>
            <BarChart />
          </Card>

          {/* ── OBJETIVOS ── */}
          <Card className="col-span-12 xl:col-span-4">
            <h3 className="mb-6 text-xl font-semibold text-[#4B2E1E] dark:text-[#E7C9A9]">Objetivos Estratégicos</h3>
            <Objetivos />
          </Card>

          {/* ── KPI PERSPECTIVAS ── */}
          <Card className="col-span-12 xl:col-span-5">
            <h3 className="mb-5 text-xl font-semibold text-[#4B2E1E] dark:text-[#E7C9A9]">Indicadores KPI</h3>
            <p className="mb-5 text-sm text-[#7A5C46] dark:text-[#B89B84]">Evaluación por perspectivas estratégicas.</p>
            <KpiPerspectivas />
          </Card>

          {/* ── EMBED LOOKER / Data Studio ── */}
          <Card className="col-span-12 xl:col-span-7">
            <h3 className="mb-4 text-xl font-semibold text-[#4B2E1E] dark:text-[#E7C9A9]">Panel externo (Looker / Data Studio)</h3>
            <p className="mb-3 text-sm text-[#7A5C46] dark:text-[#B89B84]">Informe embebido desde Looker / Google Data Studio.</p>
            <div className="w-full">
              <div className="relative w-full pb-[75%] rounded-lg overflow-hidden border border-stone-200 dark:border-[#3a2a20]">
                <iframe
                  title="Looker Studio Report"
                  src="https://datastudio.google.com/embed/reporting/54f7277e-8b49-490a-8c37-48e88d155fa8/page/VoS0F"
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
            <Capacitaciones />
          </Card>

          {/* ── ALERTAS ── */}
          <Card className="col-span-12 xl:col-span-5">
            <h3 className="mb-5 text-xl font-semibold text-[#4B2E1E] dark:text-[#E7C9A9]">Alertas Estratégicas</h3>
            <Alertas />
          </Card>

          {/* ── ÚLTIMAS VENTAS ── */}
          <Card className="col-span-12 xl:col-span-7">
            <h3 className="mb-5 text-xl font-semibold text-[#4B2E1E] dark:text-[#E7C9A9]">Últimas Ventas</h3>
            <TablaVentas />
          </Card>

          {/* ── PRODUCCIÓN RECIENTE ── */}
          <Card className="col-span-12">
            <h3 className="mb-5 text-xl font-semibold text-[#4B2E1E] dark:text-[#E7C9A9]">Producción Reciente</h3>
            <TablaProduccion />
          </Card>

        </div>
      </div>
    </>
  );
}