import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const emps = await prisma.employeeProfile.findMany();
  console.log("Employees in DB:", emps.map(e => ({ id: e.id, slug: e.slug, name: `${e.firstName} ${e.lastName}`, designation: e.designation, avatarUrl: e.avatarUrl })));

  const attractions = await prisma.attraction.findMany({ select: { id: true, slug: true, nameEn: true, nameAr: true, heroMediaUrl: true, heroFallbackUrl: true, heroThumbnailUrl: true, heroMediaType: true, taglineEn: true } });
  console.log("Attractions in DB:", attractions);
}

main().finally(() => prisma.$disconnect());
