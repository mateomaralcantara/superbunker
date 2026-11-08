export default function DeteccinderedPage() {
  return (
    <main className="min-h-screen p-6">
      <header className="mb-6">
        <p className="text-sm opacity-70">ISTEM Cyber Platform</p>
        <h1 className="text-3xl font-semibold">Detección de red</h1>
      </header>
      <section className="rounded-xl border p-5">
        <p>Eventos procedentes de Zeek y Suricata.</p>
        <p className="mt-3 text-sm opacity-70">
          Módulo generado como esqueleto. Conéctelo a una API server-side,
          autorización por roles, alcance permitido, auditoría y datos reales.
        </p>
      </section>
    </main>
  );
}
