# SuperBunker — ISTEM Cyber Range

Plataforma de laboratorios de ciberseguridad en **entorno controlado y autorizado**.
Monorepo con API (NestJS), Web (Next.js), Workers (BullMQ) y paquetes compartidos.

> Alcance, principios y límites de uso: ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
> La plataforma opera **exclusivamente** sobre los activos, redes y dispositivos
> declarados como alcance del rango.

## Requisitos

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm i -g pnpm`)
- **Docker** + Docker Compose (para Postgres, Redis, etc.)

## Estructura

```
apps/
  api/        NestJS — API BFF (auth, cursos, labs, submissions, auditoría)
  web/        Next.js — panel
  workers/    BullMQ — provisioning y grading (stubs seguros)
packages/
  shared/     Esquemas Zod y tipos compartidos
infra/
  docker-compose.yml   Postgres, Redis, NATS, MinIO
docs/
  ARCHITECTURE.md      Charter de uso autorizado
```

## Puesta en marcha

```bash
# 1. Instalar dependencias (todo el workspace)
pnpm install

# 2. Variables de entorno
cp .env.example .env
#   edita .env y genera un JWT_SECRET real:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Infraestructura local (Postgres + Redis) — requiere Docker Desktop abierto
pnpm infra:up

# 4. Base de datos: generar cliente, aplicar migraciones y sembrar datos demo
pnpm prisma:generate
pnpm prisma:migrate
pnpm db:seed

# 5. Levantar API + Web en paralelo
pnpm dev
```

- API: http://localhost:4000/api (health en `/api/health`)
- Web: http://localhost:3000

`pnpm dev` levanta solo **API + Web** (más ligero de RAM). Los **workers** se
levantan aparte, y solo hacen falta para que los labs pasen de `PENDING` a
`RUNNING`:

```bash
pnpm dev:workers
```

Si quieres los tres a la vez (API + Web + Workers): `pnpm dev:all`.

## Usuarios demo (tras `pnpm db:seed`)

| Rol | Email | Password |
|---|---|---|
| Student | `student@istem.edu` | `ChangeMe12345!` |
| Instructor / Range Admin | `instructor@istem.edu` | `ChangeMe12345!` |

> Cambia estas credenciales antes de cualquier despliegue.

## Scripts útiles

| Comando | Qué hace |
|---|---|
| `pnpm dev` | API + Web en paralelo (compila `shared` primero) |
| `pnpm dev:workers` | Solo los workers (para provisioning/grading de labs) |
| `pnpm dev:all` | API + Web + Workers a la vez |
| `pnpm build` | Build de producción de todas las apps |
| `pnpm typecheck` | Chequeo de tipos en todo el workspace |
| `pnpm lint` | Lint en todo el workspace |
| `pnpm test` | Tests en todo el workspace |
| `pnpm infra:up` / `infra:down` | Arranca/para la infraestructura Docker |

## Notas

- Hay **una sola `.env` en la raíz** del repo. Todas las apps la cargan vía
  `dotenv-cli` (`dotenv -e ../../.env -- ...`), así que no necesitas copias por
  paquete. Nunca la comitees (está en `.gitignore`).
- La **API usa el Nest CLI** (`nest start` / `nest build`), no `tsx`, porque
  NestJS necesita los metadatos de decoradores que emite `tsc` para inyección de
  dependencias. Los Workers y el seed sí usan `tsx` (no dependen de esos
  metadatos).
- `packages/shared` se compila a `dist/` y lo consumen API y Workers; `pnpm dev`,
  `pnpm build` y `pnpm typecheck` lo construyen primero automáticamente.
- El directorio `src/app/` en la raíz contiene páginas sueltas de un panel SOC
  que **aún no están integradas** en `apps/web`. Pendiente de integrar o retirar.
