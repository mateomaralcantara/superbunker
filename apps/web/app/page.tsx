"use client";

import { useEffect, useState } from "react";
import { api, setToken, getToken } from "../src/lib/api";

type Msg = { text: string; kind: "ok" | "err" | "" };

export default function Home() {
  const [email, setEmail] = useState("student@istem.edu");
  const [password, setPassword] = useState("ChangeMe12345!");
  const [msg, setMsg] = useState<Msg>({ text: "", kind: "" });
  const [authed, setAuthed] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);

  useEffect(() => {
    let saved: "dark" | "light" | null = null;
    try {
      const v = localStorage.getItem("sb-theme");
      if (v === "dark" || v === "light") saved = v;
    } catch {}
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    setTheme(saved);
    setAuthed(!!getToken());
    load().catch(() => {});
  }, []);

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark"
      || (theme === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("sb-theme", next); } catch {}
    setTheme(next);
  }

  async function login() {
    setMsg({ text: "Autenticando…", kind: "" });
    try {
      const out = await api<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setToken(out.token);
      setAuthed(true);
      setMsg({ text: "Sesión iniciada. Cargando panel…", kind: "ok" });
      await load();
    } catch (e: any) {
      setMsg({ text: "No se pudo iniciar sesión: " + e.message, kind: "err" });
    }
  }

  async function register() {
    setMsg({ text: "Registrando…", kind: "" });
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name: "Student" })
      });
      setMsg({ text: "Usuario creado. Ya puedes iniciar sesión.", kind: "ok" });
    } catch (e: any) {
      setMsg({ text: "No se pudo registrar: " + e.message, kind: "err" });
    }
  }

  async function load() {
    const c = await api<any[]>("/courses");
    setCourses(c);
    try {
      const myLabs = await api<any[]>("/labs/instances/me");
      setLabs(myLabs);
    } catch { setLabs([]); }
    const tpls = await api<any[]>("/labs/templates");
    setTemplates(tpls);
  }

  async function launchFirstTemplate() {
    if (templates.length === 0) return setMsg({ text: "Aún no hay plantillas.", kind: "" });
    const tpl = templates[0];
    setMsg({ text: "Aprovisionando laboratorio…", kind: "" });
    try {
      const inst = await api<any>("/labs/instances", {
        method: "POST",
        body: JSON.stringify({ templateId: tpl.id })
      });
      setMsg({ text: "Laboratorio creado: " + inst.id, kind: "ok" });
      await load();
    } catch (e: any) {
      setMsg({ text: "Error al crear el lab: " + e.message, kind: "err" });
    }
  }

  return (
    <>
      <header className="bar">
        <div className="wrap bar-in">
          <div className="brand">
            <svg className="mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path d="M20 2.5 34.5 10v12c0 9.2-6.3 14.3-14.5 16.5C11.8 36.3 5.5 31.2 5.5 22V10L20 2.5Z"
                    fill="color-mix(in oklab, var(--accent) 16%, transparent)" stroke="var(--accent)" strokeWidth="1.4" />
              <path d="M13 20.5l4.8 4.8L28 15" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <b>SuperBunker</b>
              <small>ISTEM Cyber Range</small>
            </div>
          </div>
          <div className="bar-sp" />
          <div className="status-pill">
            <span className={"dot" + (authed ? "" : " off")} />
            {authed ? email : "sin sesión"}
          </div>
          <button className="theme-btn" onClick={toggleTheme} aria-label="Cambiar tema" title="Tema claro / oscuro">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </button>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <span className="eyebrow">Panel de operaciones</span>
          <h1>Laboratorios de seguridad en <em>entorno controlado</em>.</h1>
          <p>Autentícate para ver tus cursos, las plantillas de laboratorio disponibles y lanzar instancias aisladas. Cada acción se audita.</p>
        </section>

        <div className="grid cols-3">
          {/* Auth */}
          <div className="panel" style={{ gridColumn: "span 1" }}>
            <div className="panel-h"><h2>Acceso</h2><span className="eyebrow">auth</span></div>
            <div className="field">
              <label htmlFor="email">Correo institucional</label>
              <input id="email" type="email" value={email} autoComplete="username"
                     onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="pass">Contraseña</label>
              <input id="pass" type="password" value={password} autoComplete="current-password"
                     onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <button className="btn btn-ghost btn-sm" onClick={register}>Registrarse</button>
              <button className="btn btn-primary" onClick={login}>Iniciar sesión</button>
            </div>
            <div className="row">
              <button className="btn btn-ghost btn-sm" onClick={() => load().catch(() => setMsg({ text: "Sin sesión todavía.", kind: "" }))}>Refrescar</button>
              <button className="btn btn-ghost btn-sm" onClick={launchFirstTemplate}>Lanzar lab (1ª plantilla)</button>
            </div>
            {msg.text && <div className={"msg " + msg.kind}>{msg.text}</div>}
          </div>

          {/* Templates */}
          <div className="panel" style={{ gridColumn: "span 2" }}>
            <div className="panel-h"><h2>Plantillas de laboratorio</h2><span className="eyebrow">templates</span></div>
            {templates.length === 0
              ? <div className="empty">No hay plantillas. Inicia sesión como instructor para crearlas.</div>
              : <div className="grid cols-2">
                  {templates.map((t) => (
                    <div className="card" key={t.id}>
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <h4>{t.name}</h4>
                        <span className="badge b-accent">{t.kind}</span>
                      </div>
                      <div className="meta">{t.id?.slice(0, 8)}</div>
                      {t.description && <p>{t.description}</p>}
                    </div>
                  ))}
                </div>}
          </div>
        </div>

        <div className="grid cols-2" style={{ marginTop: 16 }}>
          {/* Courses */}
          <div className="panel">
            <div className="panel-h"><h2>Cursos</h2><span className="eyebrow">courses</span></div>
            {courses.length === 0
              ? <div className="empty">Sin cursos cargados.</div>
              : courses.map((c) => (
                  <div className="card" key={c.id}>
                    <div className="row" style={{ justifyContent: "space-between" }}>
                      <h4>{c.title}</h4>
                      <span className="badge b-muted">{c.level}</span>
                    </div>
                    {Array.isArray(c.tags) && c.tags.length > 0 &&
                      <div className="tags">{c.tags.map((tag: string) => <span className="tag" key={tag}>{tag}</span>)}</div>}
                  </div>
                ))}
          </div>

          {/* Labs */}
          <div className="panel">
            <div className="panel-h"><h2>Mis laboratorios</h2><span className="eyebrow">instances</span></div>
            {labs.length === 0
              ? <div className="empty">{authed ? "No tienes laboratorios activos." : "Inicia sesión para ver tus labs."}</div>
              : labs.map((l) => (
                  <div className={"lab " + (l.status || "")} key={l.id}>
                    <h4>{l.templateId?.slice(0, 8) || "lab"}</h4>
                    <div className="meta">{l.id?.slice(0, 8)} · {new Date(l.createdAt).toLocaleString("es")}</div>
                    <div className="st"><b />{l.status}</div>
                  </div>
                ))}
          </div>
        </div>
      </main>

      <footer className="wrap">
        SuperBunker · ISTEM Cyber Range — entorno controlado. Toda acción requiere autorización, alcance y auditoría.
      </footer>
    </>
  );
}
