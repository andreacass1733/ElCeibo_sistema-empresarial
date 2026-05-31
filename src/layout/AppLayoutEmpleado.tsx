import { Outlet } from "react-router";

import AppSidebarEmpleado from "../layout/AppSidebarEmpleado";
import Backdrop from "../layout/Backdrop";
import { SidebarProvider } from "../context/SidebarContext";

export default function AppLayoutEmpleado() {
  return (
    <SidebarProvider>
      <div className="min-h-screen xl:flex">

        <AppSidebarEmpleado />
        <Backdrop />

        <div className="flex-1 transition-all duration-300 ease-in-out lg:ml-[290px]">
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            <Outlet />
          </div>
        </div>

      </div>
    </SidebarProvider>
  );
}