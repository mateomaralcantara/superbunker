"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "../../../../src/lib/api";

type PortResult = { port: number; state: "open" | "closed" | "filtered" };
type ScanResult = { target: string; scanned: number; open: number[]; ports: PortResult[] };
type ScanJob = {
  id: string;
  target: string;
  ports: string;
  status: "PENDING" | "RUNNING" | "DONE" | "FAILED" | "DENIED";
  result: ScanResult | Record<string, never>;
  resultHash?: string | null;
  reason?: string | null;
  createdAt: string;
};

const SERVICES: Record<number, string> = {
  22: "ssh", 80: "http", 443: "https", 3000: "web", 4000: "api", 5432: "postgres", 6379: "redis"
};

export default function ScanNetworkPage() {
  const [target, setTarget] = useState("127.0.0.1");
  const [ports, setPorts] = useState("22,80,443,3000,4000,5432,6379");
  const [allowlist, setAllowlist] = useState<string[]>([]);
  const [jobs, setJobs] = useState<ScanJob[]>([]);
  const [msg, setMsg] = useState<{ text: string; kind: "ok" | "err" | "" }>({ text: "", kind: "" });
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const mine = await api<ScanJob[]>("/scan/me");
      setJobs(mine);
    } catch {}
  }

  useEffect(() => {
    const token = !!getToken();
    setAuthed(token);
    if (!token) return;
    api<{ allowlist: string[] }>("/scan/scope").then((s) => setAllowlist(s.allowlist)).catch(() => {});
    refresh();
  }, []);

  // Poll mientras haya un escaneo en curso.
  useEffect(() => {
    if (!jobs.some((j) => j.status === "PENDING" || j.status === "RUNNING")) return;
    const id = setInterval(refresh, 1500);
    return () => clearInterval(id);
  }, [jobs]);

  async function run() {
    setBusy(true);
    setMsg({ text: "Encolando escaneo…", kind: "" });
    try {
      await api("/scan/network", { method: "POST", body: JSON.stringify({ target, ports }) });
      setMsg({ text: "Escaneo autorizado y en cola. Esperando al worker…", kind: "ok" });
      await refresh();
    } catch (e: any) {
      setMsg({ text: e.message, kind: "err" });
    } finally {
      setBusy(false);
    }
  }

  const latest = jobs[0];
  const result = latest && latest.status === "DONE" ? (latest.result as ScanResult) : null;

  return (
    <>
      <header className="mod-head">
        <span className="eyebrow">ISTEM Cyber Range</span>
        <h1>Escaneo de red</h1>
        <p className="mod-lead">Prueba TCP-connect contra un objetivo dentro del alcance autorizado. Cada escaneo se valida, encola y audita.</p>
      </header>

      <div className="scope-note">
        Alcance autorizado (deny-by-default): {allowlist.length ? allowlist.join(", ") : "—"}. Fuera de esto, el escaneo se rechaza.
      </div>

      {!authed ? (
        <div className="panel"><div className="empty">Inicia sesión en el panel MVP para ejecutar escaneos.</div></div>
      ) : (
        <>
          <div className="panel">
            <div className="panel-h"><h2>Nueva prueba</h2><span className="eyebrow">tcp-connect</span></div>
            <div className="field">
              <label htmlFor="target">Objetivo (IPv4 o localhost)</label>
              <input id="target" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ports">Puertos (coma o rango, p. ej. 22,80,8000-8010)</label>
              <input id="ports" value={ports} onChange={(e) => setPorts(e.target.value)} />
            </div>
            <div className="row">
              <button className="btn btn-primary" onClick={run} disabled={busy}>Ejecutar prueba</button>
              <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={busy}>Refrescar</button>
            </div>
            {msg.text && <div className={"msg " + msg.kind}>{msg.text}</div>}
          </div>

          {result && (
            <div className="panel">
              <div className="panel-h">
                <h2>Resultado · {latest.target}</h2>
                <span className="eyebrow">{result.open.length} abiertos / {result.scanned}</span>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Puerto</th><th>Servicio</th><th>Estado</th></tr></thead>
                  <tbody>
                    {result.ports.map((p) => (
                      <tr key={p.port}>
                        <td className="tnum mono">{p.port}</td>
                        <td className="mono" style={{ color: "var(--muted)" }}>{SERVICES[p.port] ?? "—"}</td>
                        <td>
                          <span className={"badge " + (p.state === "open" ? "b-accent" : "b-muted")}>{p.state}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {latest.resultHash && <div className="hint">sha256: {latest.resultHash.slice(0, 32)}…</div>}
            </div>
          )}

          <div className="panel">
            <div className="panel-h"><h2>Historial</h2><span className="eyebrow">scan/me</span></div>
            {jobs.length === 0 ? (
              <div className="empty">Sin escaneos todavía.</div>
            ) : (
              jobs.map((j) => (
                <div className="card" key={j.id}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <h4 className="mono">{j.target} · {j.ports}</h4>
                    <span className={"badge " + (j.status === "DONE" ? "b-accent" : "b-muted")}>{j.status}</span>
                  </div>
                  <div className="meta">
                    {new Date(j.createdAt).toLocaleString("es")}
                    {j.status === "DENIED" && " · rechazado (fuera de alcance)"}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </>
  );
}
