import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  // Demo users
  const studentEmail = "student@istem.edu";
  const instructorEmail = "instructor@istem.edu";
  const password = "ChangeMe12345!";

  const passwordHash = await argon2.hash(password);

  const student = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {},
    create: {
      email: studentEmail,
      name: "Student",
      passwordHash,
      roles: { create: [{ role: "STUDENT" }] }
    }
  });

  await prisma.user.upsert({
    where: { email: instructorEmail },
    update: {},
    create: {
      email: instructorEmail,
      name: "Instructor",
      passwordHash,
      roles: { create: [{ role: "INSTRUCTOR" }, { role: "RANGE_ADMIN" }] }
    }
  });

  const course = await prisma.course.create({
    data: { title: "SupBunker Foundations", level: "FOUNDATION", tags: ["network", "linux", "web"] }
  });

  const tpl = await prisma.labTemplate.create({
    data: {
      name: "Safe Nginx Lab",
      description: "Lab seguro para practicar observabilidad y hardening básico.",
      kind: "CONTAINER",
      spec: {
        version: "1",
        network: { egress: "deny-by-default" },
        resources: [
          { type: "container", name: "web", image: "nginx:alpine", ports: [{ container: 80, expose: "internal-only" }] }
        ],
        notes: "Sin vulnerabilidades intencionales."
      }
    }
  });

  const assignment = await prisma.assignment.create({
    data: { title: "Reporte de hardening básico", courseId: course.id }
  });

  console.log("✅ Seed listo");
  console.log("Student:", studentEmail, "password:", password);
  console.log("Instructor:", instructorEmail, "password:", password);
  console.log("Course:", course.id);
  console.log("LabTemplate:", tpl.id);
  console.log("Assignment:", assignment.id);

  // Create one initial lab instance for the student (optional)
  await prisma.labInstance.create({
    data: { templateId: tpl.id, userId: student.id, status: "PENDING" }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
