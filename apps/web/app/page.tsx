"use client";

import { useEffect, useState } from "react";
import { api, setToken } from "../src/lib/api";

export default function Home() {
  const [email, setEmail] = useState("student@istem.edu");
  const [password, setPassword] = useState("ChangeMe12345!");
  const [msg, setMsg] = useState<string>("");
  const [courses, setCourses] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  async function login() {
    setMsg("Logueando...");
    try {
      const out = await api<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setToken(out.token);
      setMsg("✅ Login ok. Cargando dashboard...");
      await load();
    } catch (e: any) {
      setMsg("❌ No login: " + e.message);
    }
  }

  async function register() {
    setMsg("Registrando...");
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name: "Student" })
      });
      setMsg("✅ Registrado. Ahora login.");
    } catch (e: any) {
      setMsg("❌ No register: " + e.message);
    }
  }

  async function load() {
    const c = await api<any[]>("/courses");
    setCourses(c);
    const myLabs = await api<any[]>("/labs/instances/me");
    setLabs(myLabs);
    const tpls = await api<any[]>("/labs/templates");
    setTemplates(tpls);
  }

  async function launchFirstTemplate() {
    if (templates.length === 0) return setMsg("No hay templates todavía.");
    const tpl = templates[0];
    setMsg("Creando lab...");
    const inst = await api<any>("/labs/instances", { method: "POST", body: JSON.stringify({ templateId: tpl.id }) });
    setMsg("✅ Lab creado: " + inst.id);
    await load();
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto" }}>
      <h1>SupBunker</h1>
      <p style={{ opacity: 0.8 }}>Panel MVP: auth + cursos + templates + labs (colas).</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" style={{ flex: 1, padding: 8 }} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" style={{ flex: 1, padding: 8 }} />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button onClick={register} style={{ padding: "8px 12px" }}>Register</button>
        <button onClick={login} style={{ padding: "8px 12px" }}>Login</button>
        <button onClick={() => load().catch(() => setMsg("No token todavía."))} style={{ padding: "8px 12px" }}>Refresh</button>
        <button onClick={() => launchFirstTemplate().catch((e) => setMsg("❌ " + e.message))} style={{ padding: "8px 12px" }}>
          Launch lab (1er template)
        </button>
      </div>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10, marginBottom: 16 }}>
        <b>Status:</b> {msg || "—"}
      </div>

      <section style={{ marginBottom: 20 }}>
        <h2>Templates</h2>
        <pre style={{ background: "#fafafa", padding: 12, borderRadius: 10, overflowX: "auto" }}>
{JSON.stringify(templates, null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>Cursos</h2>
        <pre style={{ background: "#fafafa", padding: 12, borderRadius: 10, overflowX: "auto" }}>
{JSON.stringify(courses, null, 2)}
        </pre>
      </section>

      <section>
        <h2>Mis Labs</h2>
        <pre style={{ background: "#fafafa", padding: 12, borderRadius: 10, overflowX: "auto" }}>
{JSON.stringify(labs, null, 2)}
        </pre>
      </section>
    </main>
  );
}
