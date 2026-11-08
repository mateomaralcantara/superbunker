import { ReactNode } from "react";

type Props = {
  title: string;
  lead: string;
  /** Pasos para construir el módulo (por defecto, el contrato del rango). */
  steps?: string[];
  children?: ReactNode;
};

const DEFAULT_STEPS = [
  "Conecta este módulo a la API server-side (NestJS); la UI nunca ejecuta herramientas.",
  "Aplica autorización por rol y restringe al alcance autorizado del rango.",
  "Renderiza datos reales con los componentes del sistema de diseño.",
  "Audita cada acción en el log inmutable."
];

export function ModuleScaffold({ title, lead, steps = DEFAULT_STEPS, children }: Props) {
  return (
    <>
      <header className="mod-head">
        <span className="eyebrow">ISTEM Cyber Range</span>
        <h1>{title}</h1>
        <p className="mod-lead">{lead}</p>
      </header>

      <div className="scope-note">
        Opera solo sobre los activos, redes y dispositivos declarados como alcance del rango.
      </div>

      {children}

      <div className="panel">
        <div className="panel-h"><h2>Qué construir aquí</h2><span className="eyebrow">todo</span></div>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={i}><b>{i + 1}</b><span>{s}</span></li>
          ))}
        </ol>
      </div>
    </>
  );
}
