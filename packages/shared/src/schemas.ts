import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  name: z.string().min(2)
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const CreateCourseSchema = z.object({
  title: z.string().min(3),
  level: z.enum(["FOUNDATION", "PRO", "ELITE"]).default("FOUNDATION"),
  tags: z.array(z.string()).default([])
});

export const CreateLabTemplateSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(0).default(""),
  kind: z.enum(["CONTAINER", "VM", "HYBRID"]).default("CONTAINER"),
  spec: z.record(z.any())
});

export const CreateLabInstanceSchema = z.object({
  templateId: z.string().uuid()
});

export const CreateSubmissionSchema = z.object({
  assignmentId: z.string().uuid(),
  content: z.string().min(1)
});

export const CreateScanSchema = z.object({
  target: z.string().min(1).max(255),
  ports: z.string().min(1).max(400).default("22,80,443,3000,4000,5432,6379")
});
