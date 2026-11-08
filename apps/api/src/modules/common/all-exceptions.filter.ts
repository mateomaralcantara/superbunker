import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

/**
 * Normaliza todos los errores a una respuesta JSON consistente.
 * - ZodError            -> 400 con el detalle de validación
 * - Prisma P2002        -> 409 (recurso duplicado)
 * - Prisma P2025        -> 404 (no encontrado)
 * - HttpException        -> se respeta su status
 * - cualquier otro       -> 500 genérico (sin filtrar detalles internos)
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("Exceptions");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: Record<string, unknown> = { statusCode: status, error: "Internal Server Error", message: "Error interno" };

    if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      body = { statusCode: status, error: "Bad Request", message: "Datos inválidos", issues: exception.flatten() };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const r = exception.getResponse();
      body = typeof r === "string" ? { statusCode: status, message: r } : { statusCode: status, ...(r as object) };
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === "P2002") {
        status = HttpStatus.CONFLICT;
        body = { statusCode: status, error: "Conflict", message: "El recurso ya existe" };
      } else if (exception.code === "P2025") {
        status = HttpStatus.NOT_FOUND;
        body = { statusCode: status, error: "Not Found", message: "Recurso no encontrado" };
      } else {
        status = HttpStatus.BAD_REQUEST;
        body = { statusCode: status, error: "Bad Request", message: "Operación inválida" };
      }
    }

    if (status >= 500) {
      this.logger.error(`${req.method} ${req.url}`, exception instanceof Error ? exception.stack : String(exception));
    }

    res.status(status).json(body);
  }
}
