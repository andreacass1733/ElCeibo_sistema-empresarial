import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 bg-[#ede7df] dark:bg-[#111111] p-6 sm:p-0">
      <div className="relative flex h-screen w-full flex-col justify-center lg:flex-row">

        {/* FORMULARIO */}
        <div className="flex w-full items-center justify-center bg-[#ede7df] dark:bg-[#111111] lg:w-1/2">
          {children}
        </div>

        {/* PANEL DERECHO */}
        <div className="relative hidden h-full w-full overflow-hidden lg:grid lg:w-1/2">
          
          {/* FONDO */}
          <GridShape />

          {/* CONTENIDO */}
          <div className="relative z-20 flex items-center justify-center">
            <div className="flex max-w-sm flex-col items-center px-10">

              {/* LOGO */}
              <Link to="/" className="mb-8 block">
                <img
                  width={220}
                  height={48}
                  src="/images/logo/auth-logo.svg"
                  alt="Logo"
                  className="opacity-95"
                />
              </Link>

              {/* TITULO */}
              <h1 className="mb-4 text-center text-4xl font-bold text-[#f2dfc2]">
                El Ceibo
              </h1>

              {/* TEXTO */}
              <p className="text-center leading-7 text-[#cbb08b]">
                Sistema de gestión estratégica empresarial
              </p>

              {/* DECORACION */}
              <div className="mt-10 flex gap-3">
                <div className="h-2 w-2 rounded-full bg-[#c89b63]" />
                <div className="h-2 w-2 rounded-full bg-[#8b6b45]" />
                <div className="h-2 w-2 rounded-full bg-[#f7e7ce]" />
              </div>
            </div>
          </div>
        </div>

        {/* BOTON DARK/LIGHT */}
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}