import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router";

import {
  GridIcon,
  UserCircleIcon,
  TaskIcon,
  PieChartIcon,
  DocsIcon,
  DollarLineIcon,
  GroupIcon,
  BoxIcon,
  BoltIcon,
  ArrowRightIcon,
  ListIcon,
  ShootingStarIcon,
} from "../icons";

import { useSidebar } from "../context/SidebarContext";

type Cargo =
  | "Vendedor"
  | "Cajero"
  | "Almacenero"
  | "Produccion"
  | "Repartidor"
  | "Operario"
  | "Supervisor";

interface Empleado {
  id: number;
  nombre: string;
  cargo: Cargo;
}

interface SubItem {
  name: string;
  path: string;
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
}

function getNavItems(id: string, cargo: Cargo): NavItem[] {
  const comunes: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Mi Dashboard",
      path: `/empleado/${id}`,
    },
    {
      icon: <TaskIcon />,
      name: "Capacitaciones",
      subItems: [
        { name: "Mis Cursos", path: `/empleado/${id}/capacitaciones` },
        { name: "Historial", path: `/empleado/${id}/capacitaciones/historial` },
      ],
    },
    {
      icon: <PieChartIcon />,
      name: "Mi Desempeño",
      subItems: [
        { name: "Indicadores", path: `/empleado/${id}/desempeno` },
        { name: "Objetivos", path: `/empleado/${id}/objetivos` },
      ],
    },
    {
      icon: <DocsIcon />,
      name: "Reportes",
      subItems: [
        { name: "Mis Reportes", path: `/empleado/${id}/reportes` },
        { name: "Constancias", path: `/empleado/${id}/constancias` },
      ],
    },
    {
      icon: <UserCircleIcon />,
      name: "Mi Perfil",
      path: `/empleado/${id}/perfil`,
    },
  ];

  const extras: Record<Cargo, NavItem[]> = {
    Vendedor: [
      {
        icon: <DollarLineIcon />,
        name: "Ventas",
        subItems: [
          { name: "Ventas", path: `/empleado/${id}/ventas` },
          { name: "Clientes", path: `/empleado/${id}/clientes` },
          { name: "Cotizaciones", path: `/empleado/${id}/cotizaciones` },
        ],
      },
    ],
    Cajero: [
      {
        icon: <ShootingStarIcon />,
        name: "Caja",
        subItems: [
          { name: "Caja", path: `/empleado/${id}/caja` },
          { name: "Cobros", path: `/empleado/${id}/cobros` },
          { name: "Transacciones", path: `/empleado/${id}/transacciones` },
        ],
      },
    ],
    Almacenero: [
      {
        icon: <BoxIcon />,
        name: "Almacén",
        subItems: [
          { name: "Inventario", path: `/empleado/${id}/inventario` },
          { name: "Stock", path: `/empleado/${id}/stock` },
          { name: "Entradas", path: `/empleado/${id}/entradas` },
          { name: "Salidas", path: `/empleado/${id}/salidas` },
        ],
      },
    ],
    Produccion: [
      {
        icon: <BoltIcon />,
        name: "Producción",
        subItems: [
          { name: "Producción", path: `/empleado/${id}/produccion` },
          { name: "Órdenes", path: `/empleado/${id}/ordenes` },
          { name: "Control", path: `/empleado/${id}/control` },
        ],
      },
    ],
    Repartidor: [
      {
        icon: <ArrowRightIcon />,
        name: "Logística",
        subItems: [
          { name: "Rutas", path: `/empleado/${id}/rutas` },
          { name: "Entregas", path: `/empleado/${id}/entregas` },
        ],
      },
    ],
    Operario: [
      {
        icon: <ListIcon />,
        name: "Operaciones",
        subItems: [
          { name: "Tareas", path: `/empleado/${id}/tareas` },
          { name: "Actividades", path: `/empleado/${id}/actividades` },
        ],
      },
    ],
    Supervisor: [
      {
        icon: <GroupIcon />,
        name: "Supervisión",
        subItems: [
          { name: "Personal", path: `/empleado/${id}/personal` },
          { name: "Evaluaciones", path: `/empleado/${id}/evaluaciones` },
          { name: "Incidencias", path: `/empleado/${id}/incidencias` },
        ],
      },
    ],
  };

  return [...comunes, ...(extras[cargo] ?? [])];
}

const AppSidebarEmpleado: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [loading, setLoading] = useState(true);

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<number, number>>({});
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"}/empleado-actual/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("No encontrado");
        return res.json();
      })
      .then((data: Empleado) => setEmpleado(data))
      .catch(() => setEmpleado(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (openSubmenu !== null && subMenuRefs.current[openSubmenu]) {
      setSubMenuHeight((prev) => ({
        ...prev,
        [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight ?? 0,
      }));
    }
  }, [openSubmenu]);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  function handleLogout() {
    localStorage.removeItem("rol");
    localStorage.removeItem("usuario");
    localStorage.removeItem("id_empleado");
    navigate("/signin", { replace: true });
  }

  const navItems: NavItem[] = empleado ? getNavItems(id!, empleado.cargo) : [];

  const isExpandedOrHovered = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0
        bg-[#4B2E1E] border-r border-[#6B4226] text-[#F5E6D3]
        dark:bg-[#0F0F0F] dark:border-[#C8A46B]/30 dark:text-[#E7C58F]
        h-screen transition-all duration-300 ease-in-out z-50
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LOGO */}
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to={`/empleado/${id}`}>
          {isExpandedOrHovered ? (
            <>
              <img className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={150} height={40} />
              <img className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" width={150} height={40} />
            </>
          ) : (
            <img src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>

      {/* NOMBRE Y CARGO */}
      {isExpandedOrHovered && (
        <div className="mb-6 px-1">
          {loading ? (
            <div className="h-10 rounded-lg bg-[#6B4226]/30 animate-pulse" />
          ) : empleado ? (
            <div className="rounded-lg bg-[#6B4226]/30 dark:bg-[#C8A46B]/10 px-3 py-2">
              <p className="text-sm font-semibold truncate">{empleado.nombre}</p>
              <p className="text-xs opacity-60 mt-0.5">{empleado.cargo}</p>
            </div>
          ) : null}
        </div>
      )}

      {/* MENÚ — scrollable */}
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden duration-300 ease-linear no-scrollbar">
        <nav className="mb-6 flex-1">
          {loading ? (
            <ul className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i}>
                  <div
                    className={`h-10 rounded-md bg-[#6B4226]/30 animate-pulse ${
                      !isExpanded && !isHovered ? "w-10 mx-auto" : "w-full"
                    }`}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="flex flex-col gap-4">
              {navItems.map((nav, index) => (
                <li key={nav.name}>
                  {nav.subItems ? (
                    <button
                      onClick={() =>
                        setOpenSubmenu((prev) => (prev === index ? null : index))
                      }
                      className={`menu-item group ${
                        openSubmenu === index ? "menu-item-active" : "menu-item-inactive"
                      } cursor-pointer ${
                        !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                      }`}
                    >
                      <span
                        className={`menu-item-icon-size ${
                          openSubmenu === index ? "menu-item-icon-active" : "menu-item-icon-inactive"
                        }`}
                      >
                        {nav.icon}
                      </span>
                      {isExpandedOrHovered && (
                        <span className="menu-item-text">{nav.name}</span>
                      )}
                    </button>
                  ) : (
                    nav.path && (
                      <Link
                        to={nav.path}
                        className={`menu-item group ${
                          isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                        }`}
                      >
                        <span
                          className={`menu-item-icon-size ${
                            isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                          }`}
                        >
                          {nav.icon}
                        </span>
                        {isExpandedOrHovered && (
                          <span className="menu-item-text">{nav.name}</span>
                        )}
                      </Link>
                    )
                  )}

                  {nav.subItems && isExpandedOrHovered && (
                    <div
                      ref={(el) => { subMenuRefs.current[index] = el; }}
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        height: openSubmenu === index ? `${subMenuHeight[index]}px` : "0px",
                      }}
                    >
                      <ul className="mt-2 space-y-1 ml-9">
                        {nav.subItems.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              to={sub.path}
                              className={`menu-dropdown-item ${
                                isActive(sub.path)
                                  ? "menu-dropdown-item-active"
                                  : "menu-dropdown-item-inactive"
                              }`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* CERRAR SESIÓN — pegado al fondo */}
        <div className="pb-6">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
              text-[#F5E6D3]/70 hover:text-[#F5E6D3] hover:bg-[#6B4226]/40
              dark:text-[#E7C58F]/60 dark:hover:text-[#E7C58F] dark:hover:bg-[#C8A46B]/10
              transition-colors cursor-pointer
              ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
          >
            {/* Ícono logout (SVG inline para no depender de imports) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {isExpandedOrHovered && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebarEmpleado;