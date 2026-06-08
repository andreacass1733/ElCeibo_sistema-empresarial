import { useState } from "react";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

export default function SignInForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        /* =========================
           GUARDAR DATOS
        ========================= */
        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol);
        localStorage.setItem("usuario", data.usuario);
        localStorage.setItem(
          "id_empleado",
          data.id_empleado.toString()
        );

        /* =========================
           RUTAS SEGÚN ROL
        ========================= */
        const rutas: Record<string, string> = {
          // ADMIN
          Administrador: "/dashboard",

          // EMPLEADOS
          Produccion: "/empleado",
          Vendedor: "/empleado",
          Cajero: "/empleado",
          Almacenero: "/empleado",
          Repartidor: "/empleado",
          Operario: "/empleado",
          Supervisor: "/empleado",
        };

        /* =========================
           REDIRECCIONAR
        ========================= */
        navigate(rutas[data.rol] || "/signin");
      } else {
        setError(data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F5F1EC] dark:bg-[#0F0F0F]">
      <div className="flex items-center justify-center flex-1 px-5 py-10">
        <div className="w-full max-w-md">

          {/* CARD */}
          <div className="overflow-hidden border shadow-2xl rounded-3xl border-stone-300 bg-white dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">

            {/* HEADER */}
            <div className="px-8 pt-10 pb-6 border-b border-stone-200 dark:border-[#2A2A2A]">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#C8A46B] shadow-lg">
                <span className="text-2xl font-bold text-black">
                  MIS
                </span>
              </div>

              <h1 className="text-3xl font-bold text-center text-stone-800 dark:text-[#F5F5F5]">
                Iniciar Sesión
              </h1>

              <p className="mt-3 text-sm leading-6 text-center text-stone-500 dark:text-[#A1A1AA]">
                Sistema de Gestión Estratégica Empresarial
              </p>
            </div>

            {/* FORM */}
            <div className="p-8">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">

                  {/* ERROR */}
                  {error && (
                    <div className="px-4 py-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-xl dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                      {error}
                    </div>
                  )}

                  {/* USUARIO */}
                  <div>
                    <Label>
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        Usuario
                      </span>
                    </Label>

                    <Input
                      placeholder="ej: admin1, prod1, ven1..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="border-stone-300 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:border-[#C8A46B] dark:border-[#2A2A2A] dark:bg-[#141414] dark:text-[#F5F5F5]"
                    />
                  </div>

                  {/* PASSWORD */}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-stone-300 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:border-[#C8A46B] dark:border-[#2A2A2A] dark:bg-[#141414] dark:text-[#F5F5F5]"
                      />

                      <span
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
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

                  {/* CHECKBOX */}
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isChecked}
                      onChange={setIsChecked}
                    />

                    <span className="text-sm text-stone-600 dark:text-[#A1A1AA]">
                      Recordarme
                    </span>
                  </div>

                  {/* BOTON */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#C8A46B] hover:bg-[#B8935F] text-black rounded-xl h-12 text-sm font-semibold shadow-lg transition-all duration-200 disabled:opacity-60"
                    >
                      {loading
                        ? "Ingresando..."
                        : "Ingresar al Sistema"}
                    </button>
                  </div>

                </div>
              </form>
            </div>
          </div>

          {/* FOOTER */}
          <p className="mt-6 text-xs text-center text-stone-500 dark:text-[#6B7280]">
            © 2026 Sistema de Gestión Estratégica Empresarial
          </p>

        </div>
      </div>
    </div>
  );
}