export default function CajeroHome() {
  const usuario = localStorage.getItem("usuario");
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-10 bg-white rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-stone-800">💰 Panel Cajero</h1>
        <p className="mt-3 text-stone-500">Bienvenido, <strong>{usuario}</strong></p>
      </div>
    </div>
  );
}