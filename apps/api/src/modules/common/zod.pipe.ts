import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

export function parseOrThrow<T>(schema: z.ZodType<T>, payload: unknown): T {
  const res = schema.safeParse(payload);
  if (!res.success) throw new BadRequestException(res.error.flatten());
  return res.data;
}
