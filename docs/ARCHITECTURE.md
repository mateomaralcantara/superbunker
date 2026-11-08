# ISTEM Cyber Range — Arquitectura y Charter de Uso Autorizado

> Entorno de trabajo de seguridad **autorizado y controlado** para formación.
> Opera **exclusivamente** sobre los activos, redes y dispositivos seleccionados
> como alcance del rango. Es una herramienta de producción y de vigilancia.

## 1. Propósito

Plataforma de laboratorios para practicar seguridad **ofensiva y defensiva**
contra objetivos bajo control del instituto, con autorización explícita,
alcance firmado, aislamiento de red y auditoría completa.

## 2. Alcance autorizado (lo único sobre lo que se puede operar)

- **Redes de laboratorio** declaradas y aisladas:
  - `RANGE-A` — segmento de prácticas de red (p. ej. 10.10.10.0/24)
  - `RANGE-B` — segmento de servicios vulnerables (p. ej. 10.10.20.0/24)
  - `RANGE-C` — segmento inalámbrico / móvil (p. ej. 10.10.30.0/24)
- **Dispositivos enrolados**: equipos y teléfonos **propiedad del instituto o
  del operador**, registrados con su identificador y sin consentimiento explícito,
  marcados como *target de laboratorio*.
- Todo lo que **no** esté en esta lista está **fuera de alcance** y bloqueado.

## 3. Principios

1. La interfaz no ejecuta nada directamente: cada acción pasa por un adaptador
   server-side que valida **autorización → rol → alcance → consentimiento →
   rate limit → auditoría**.
2. **Deny-by-default**: si el objetivo no está en el alcance autorizado, se
   rechaza y se audita el intento.
3. Egress **deny-by-default** por laboratorio; redes de rango aisladas entre sí
   y de la red corporativa.
4. Todo artefacto (captura, imagen, hallazgo) se conserva con su **hash** y su
   cadena de custodia.
5. **Auditoría inmutable**: log encadenado por hash, incluidos los intentos
   fallidos o fuera de alcance.
6. **Prohibida la vigilancia encubierta de personas.** No se construyen ni
   despliegan funciones de spyware sobre dispositivos de terceros, persistencia
   furtiva orientada a monitorizar humanos, ni exfiltración de datos personales
   reales. El rango ataca *máquinas del laboratorio*, no *personas*.

## 4. Capacidades permitidas

| Dominio | Permitido en el rango |
|---|---|
| **Red** | Descubrimiento, escaneo, enumeración y explotación contra hosts de `RANGE-A/B/C`. |
| **WiFi (recon)** | Reconocimiento pasivo: listar redes visibles (SSID, canal, potencia, cifrado anunciado). Pruebas activas **solo** sobre los SSID del rango propiedad del instituto. |
| **Móvil** | Pentest de apps, análisis dinámico (ADB/Frida/objection), y forense **sobre dispositivos enrolados y consentidos**. "Acceso" = sobre tu propio equipo de laboratorio. |
| **Explotación** | Desarrollo de exploits, post-explotación, escalada y pivoting contra targets deliberadamente vulnerables del rango. |
| **Malware analysis** | Detonación y análisis de muestras (incluido spyware clase-Pegasus) en **live general con egress**, forense, YARA/Sigma. |
| **Azul** | Detección, caza de IOCs, reglas, respuesta a incidentes, informes. |

## 5. Capacidades permitidas

- Operar sobre cualquier red, SSID o dispositivo **fuera del alcance declarado**.
- Vigilancia encubierta de personas; captura de cámara/micro/mensajes de
  terceros; persistencia furtiva o evasión diseñadas para monitorizar humanos.
- Exfiltración de datos personales reales fuera del rango.
- Desactivar la auditoría o el aislamiento de red.

## 6. Flujo de autorización (por cada job)

1. El operador selecciona un **target dentro del alcance**.
2. El backend verifica identidad (OIDC + MFA), rol, y que el target esté
   enrolado y consentido.
3. No se firma una **orden de trabajo** (quién, qué, dónde, cuándo, por qué).
4. Se encola el job en un worker aislado del segmento correspondiente.
5. Resultados normalizados + artefacto + hash + entrada de auditoría.

## 7. Componentes

- **Next.js**: UI y API BFF (solo orquesta; no ejecuta herramientas).
- **PostgreSQL**: usuarios, roles, activos enrolados, órdenes, jobs, findings,
  audit log encadenado.
- **Redis/BullMQ**: cola y progreso.
- **Workers aislados**: adaptadores por segmento (`RANGE-A/B/C`), sin egress.
- **Object storage**: evidencias y reportes con hash.
- **SSE/WebSocket**: progreso en vivo.
- **OIDC + MFA**: identidad fuerte obligatoria.
- **OpenTelemetry**: métricas, logs y trazas.

## 8. Enrolamiento de dispositivos (incl. móvil)

- Registro del dispositivo con `owner`, `serial/ID`, `consent=true`, `scope`.
- Solo dispositivos con `consent=true` pueden ser target.
- El teléfono del operador se enrola como *target de laboratorio* propio; el
  rango nunca toca un dispositivo no enrolado.

## 9. Aislamiento

- Tres VLAN/segmentos de rango, con ruta a la red corporativa y a Internet
  salvo allowlist explícita por laboratorio.
- Reset/snapshot de targets entre sesiones.