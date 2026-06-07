import { useEffect, useState } from "react";

const API = "http://localhost:8000/api";

interface StockItem { nombre: string; tipo: string; actual: number; maximo: number; unidad: string; }

export default function AlmaceneroStock({ idSucursal }: { idSucursal: number }) {
  const [items,   setItems]   = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/stock/`)
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then((data) => { setItems(data); setLoading(false); })
      .catch((e)  => { setError(e.message); setLoading(false); });
  }, [idSucursal]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5deb3]">Stock</h1>
        <p className="text-sm text-gray-500 dark:text-[#9a7a5a] mt-1">Niveles de stock por producto</p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#18110d] shadow-sm p-5">
        {loading && (
          <div className="flex items-center justify-center py-12 text-amber-500">
            <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando stock...
          </div>
        )}
        {error && <div className="rounded-xl bg-red-950 px-4 py-3 text-sm text-red-400">Error: {error}</div>}

        {!loading && !error && (
          <div className="space-y-5">
            {items.map((item) => {
              const pct   = Math.min(Math.round((item.actual / item.maximo) * 100), 100);
              const color = pct < 30 ? "bg-red-500" : pct < 60 ? "bg-amber-500" : "bg-emerald-500";
              return (
                <div key={item.nombre}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-[#f5deb3]">{item.nombre}</span>
                    <span className="text-xs text-gray-400 dark:text-[#9a7a5a]">
                      {item.actual} / {item.maximo} {item.unidad} ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 dark:bg-[#2e2119]">
                    <div className={`h-3 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }}/>
                  </div>
                </div>
              );
            })}
            {items.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">Sin productos en esta sucursal.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}