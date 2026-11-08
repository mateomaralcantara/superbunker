"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sectionLabel } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

export function ConsoleTop() {
  const pathname = usePathname();
  return (
    <div className="console-top">
      <span className="crumb">Consola / {sectionLabel(pathname)}</span>
      <div className="bar-sp" />
      <Link href="/" className="btn btn-ghost btn-sm">Panel MVP</Link>
      <ThemeToggle />
    </div>
  );
}
