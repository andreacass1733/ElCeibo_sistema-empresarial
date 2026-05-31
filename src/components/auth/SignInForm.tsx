import { useState } from "react";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";

import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F5F1EC] dark:bg-[#0F0F0F]">
      {/* Header */}

      {/* Content */}
      <div className="flex items-center justify-center flex-1 px-5 py-10">
        <div className="w-full max-w-md">
          <div className="overflow-hidden border shadow-2xl rounded-3xl border-stone-300 bg-white dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
            {/* Top */}
            <div className="px-8 pt-10 pb-6 border-b border-stone-200 dark:border-[#2A2A2A]">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#C8A46B] shadow-lg">
                <span className="text-2xl font-bold text-black">MIS</span>
              </div>

              <h1 className="text-3xl font-bold text-center text-stone-800 dark:text-[#F5F5F5]">
                Iniciar Sesión
              </h1>

              <p className="mt-3 text-sm leading-6 text-center text-stone-500 dark:text-[#A1A1AA]">
                Sistema de Gestión Estratégica Empresarial
              </p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form>
                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <Label>
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        Correo Electrónico
                      </span>
                    </Label>

                    <Input
                      placeholder="admin@empresa.com"
                      className="border-stone-300 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:border-[#C8A46B] dark:border-[#2A2A2A] dark:bg-[#141414] dark:text-[#F5F5F5] dark:placeholder:text-[#6B7280]"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <Label>
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        Contraseña
                      </span>
                    </Label>

                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Ingrese su contraseña"
                        className="border-stone-300 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:border-[#C8A46B] dark:border-[#2A2A2A] dark:bg-[#141414] dark:text-[#F5F5F5] dark:placeholder:text-[#6B7280]"
                      />

                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 cursor-pointer right-4 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="size-5 fill-stone-500 dark:fill-[#A1A1AA]" />
                        ) : (
                          <EyeCloseIcon className="size-5 fill-stone-500 dark:fill-[#A1A1AA]" />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isChecked}
                        onChange={setIsChecked}
                      />

                      <span className="text-sm text-stone-600 dark:text-[#A1A1AA]">
                        Recordarme
                      </span>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="pt-2">
                    <Button
                      className="w-full !bg-[#C8A46B] hover:!bg-[#B8935F] !border-0 !text-black rounded-xl h-12 text-sm font-semibold shadow-lg transition-all duration-200"
                      size="sm"
                    >
                      Ingresar al Sistema
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-xs text-center text-stone-500 dark:text-[#6B7280]">
            © 2026 Sistema de Gestión Estratégica Empresarial
          </p>
        </div>
      </div>
    </div>
  );
}