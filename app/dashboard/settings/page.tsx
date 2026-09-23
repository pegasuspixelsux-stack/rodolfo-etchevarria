export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Configuración</h1>
        <p className="mt-1 text-sm text-slate-500">
          Administra la configuración general de tu concesionario.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Configuración general</h2>
        <p className="mt-1 text-sm text-slate-500">
          Las opciones de configuración estarán disponibles aquí.
        </p>
      </section>
    </div>
  );
}
