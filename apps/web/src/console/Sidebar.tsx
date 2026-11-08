"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "./nav";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="side">
      <Link href="/" className="side-brand" style={{ color: "inherit" }}>
        <svg className="mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path d="M20 2.5 34.5 10v12c0 9.2-6.3 14.3-14.5 16.5C11.8 36.3 5.5 31.2 5.5 22V10L20 2.5Z"
                fill="color-mix(in oklab, var(--accent) 16%, transparent)" stroke="var(--accent)" strokeWidth="1.4" />
          <path d="M13 20.5l4.8 4.8L28 15" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>
          <b>SuperBunker</b>
          <small>ISTEM Cyber Range</small>
        </span>
      </Link>

      {nav.map((g) => (
        <nav className="navgroup" key={g.group}>
          <span className="gl">{g.group}</span>
          {g.items.map((it) => {
            const active = pathname === it.href;
            return (
              <Link key={it.href} href={it.href} className={"navlink" + (active ? " active" : "")}>
                <span className="ic" />
                {it.label}
              </Link>
            );
          })}
        </nav>
      ))}
    </aside>
  );
}
