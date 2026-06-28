import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const seedFile = path.join(__dirname, 'data', 'e3_team_seed.json');
  
  if (!fs.existsSync(seedFile)) {
    console.error(`Seed file not found: ${seedFile}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(seedFile, 'utf-8');
  const teamMembers = JSON.parse(fileContent);

  console.log(`Starting to seed ${teamMembers.length} team members...`);

  for (let i = 0; i < teamMembers.length; i++) {
    const member = teamMembers[i];
    const slug = member.slug;

    console.log(`Upserting team member: ${slug}`);

    await prisma.employeeProfile.upsert({
      where: { slug },
      update: {
        firstName: member.firstName,
        lastName: member.lastName,
        designation: member.designation,
        department: member.department,
        yearsOfExperience: member.yearsOfExp,
        profileImage: member.profileImageUrl || null,
        tagline: member.tagline,
        aboutSummary: member.aboutSummary,
        careerJourney: "",
        keyStrengths: "",
        expertiseTags: member.expertiseTags || [],
        coreCompetencies: [],
        experience: member.experienceTimeline || [],
        projects: member.projectsPortfolio || [],
        certifications: [],
        education: [],
        awards: [],
        skillsMatrix: [],
        mediaGallery: [],
        testimonials: [],
        contactEmail: member.contactEmail || null,
        linkedinUrl: member.linkedInUrl || null,
        isActive: member.active !== undefined ? member.active : true,
        order: i,
      },
      create: {
        slug,
        firstName: member.firstName,
        lastName: member.lastName,
        designation: member.designation,
        department: member.department,
        yearsOfExperience: member.yearsOfExp,
        profileImage: member.profileImageUrl || null,
        tagline: member.tagline,
        aboutSummary: member.aboutSummary,
        careerJourney: "",
        keyStrengths: "",
        expertiseTags: member.expertiseTags || [],
        coreCompetencies: [],
        experience: member.experienceTimeline || [],
        projects: member.projectsPortfolio || [],
        certifications: [],
        education: [],
        awards: [],
        skillsMatrix: [],
        mediaGallery: [],
        testimonials: [],
        contactEmail: member.contactEmail || null,
        linkedinUrl: member.linkedInUrl || null,
        isActive: member.active !== undefined ? member.active : true,
        order: i,
      },
    });
  }

  console.log("Team seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Team seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
