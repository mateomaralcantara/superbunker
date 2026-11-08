# Arquitectura de ISTEM Cyber Platform

## Principios

1. La interfaz nunca ejecuta herramientas ni comandos directamente.
2. Cada integración vive detrás de un adaptador server-side.
3. Todo job exige autenticación, rol, alcance autorizado, validación, rate limit y auditoría.
4. Los trabajos largos usan cola y workers aislados.
5. Los resultados se normalizan, conservando el artefacto original y su hash.
6. Los modos de clase y demo usan objetivos deliberadamente vulnerables y redes aisladas.
7. No se implementan funciones de vigilancia encubierta, spyware, persistencia furtiva ni intrusión no autorizada.

## Componentes propuestos

- Next.js: UI y API BFF.
- PostgreSQL: usuarios, activos, jobs, findings, alerts, cases y audit log.
- Redis/BullMQ: cola y progreso.
- Object storage: evidencias y reportes.
- Workers: adaptadores para herramientas instaladas en el laboratorio.
- SSE/WebSocket: eventos y progreso en vivo.
- OIDC: identidad y MFA.
- OpenTelemetry: métricas, logs y trazas.
