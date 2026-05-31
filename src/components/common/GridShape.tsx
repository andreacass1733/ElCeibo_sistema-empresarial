export default function GridShape() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      
      {/* Imagen */}
      <img
        src="/images/logo/auth-logo.jpg"
        alt="Background"
        className="
          h-full
          w-full
          object-cover
          opacity-30
          dark:opacity-20
          scale-105
        "
      />

      {/* Overlay más oscuro pero suave */}
      <div
        className="
          absolute inset-0
          bg-[#1b140f]/55
        "
      />
    </div>
  );
}