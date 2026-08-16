import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const emps = await prisma.employeeProfile.findMany();
  console.log("Employees count:", emps.length);
  for (const e of emps) {
    console.log(`- [${e.id}] slug: ${e.slug}, name: ${e.firstName} ${e.lastName}, designation: ${e.designation} / ${e.designationAr}, avatar: ${e.avatarUrl}`);
  }
}

main().finally(() => prisma.$disconnect());
