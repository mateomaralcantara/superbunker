export type NavItem = { label: string; href: string };
export type NavGroup = { group: string; items: NavItem[] };

export const nav: NavGroup[] = [
  {
    group: "Operación",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Centro en vivo", href: "/live" },
      { label: "Incidentes", href: "/incidents" }
    ]
  },
  {
    group: "Activos & Intel",
    items: [
      { label: "Activos", href: "/assets" },
      { label: "Threat Intelligence", href: "/intel" }
    ]
  },
  {
    group: "Escaneo",
    items: [
      { label: "Escaneo de red", href: "/scan/network" },
      { label: "Testing web", href: "/scan/web" },
      { label: "Vulnerabilidades", href: "/scan/vulnerabilities" }
    ]
  },
  {
    group: "Detección",
    items: [
      { label: "Endpoints", href: "/detect/endpoint" },
      { label: "Detección de red", href: "/detect/network" }
    ]
  },
  {
    group: "Azul & Purple",
    items: [
      { label: "Forense", href: "/forensics" },
      { label: "Purple Team", href: "/purple" }
    ]
  },
  {
    group: "Gestión",
    items: [
      { label: "Reportes", href: "/reports" },
      { label: "Administración", href: "/admin" },
      { label: "Configuración", href: "/settings" }
    ]
  }
];

export function sectionLabel(pathname: string): string {
  for (const g of nav) {
    const hit = g.items.find((i) => i.href === pathname);
    if (hit) return hit.label;
  }
  return "Consola";
}
