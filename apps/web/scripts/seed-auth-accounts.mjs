import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function runWithRetry(fn, maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`[DB ATTEMPT ${attempt} FAILED]:`, err.message);
      if (attempt === maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

async function main() {
  console.log('Seeding and verifying all authentication accounts with retries...');
  const salt = 10;
  const hashedPassword = await bcrypt.hash('Password123!', salt);

  const accounts = [
    {
      email: 'superadmin@eeeqa.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      customRole: 'SUPER_ADMIN',
    },
    {
      email: 'admin@e3.qa',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      customRole: 'SUPER_ADMIN',
    },
    {
      email: 'admin@e3qatar.com',
      name: 'System SuperAdmin',
      role: 'SUPER_ADMIN',
      customRole: 'SUPER_ADMIN',
    },
    {
      email: 'amaan@eeeqa.com',
      name: 'Amaan (Master Admin)',
      role: 'SUPER_ADMIN',
      customRole: 'SUPER_ADMIN',
    },
    {
      email: 'hr@eeeqa.com',
      name: 'HR & Talent Operations',
      role: 'STAFF',
      customRole: 'HR_ADMIN',
    },
    {
      email: 'sales@e3qatar.com',
      name: 'Sales Director',
      role: 'SALES_ADMIN',
      customRole: 'SALES_ADMIN',
    },
    {
      email: 'support@e3qatar.com',
      name: 'Support Manager',
      role: 'SUPPORT_ADMIN',
      customRole: 'SUPPORT_ADMIN',
    },
    {
      email: 'events@e3qatar.com',
      name: 'Events Experience Lead',
      role: 'SUPPORT_ADMIN',
      customRole: 'EVENTS_ADMIN',
    },
    {
      email: 'staff@e3qatar.com',
      name: 'Field Operations Staff',
      role: 'STAFF',
      customRole: 'STAFF',
    },
    {
      email: 'client@e3qatar.com',
      name: 'Corporate B2B Client',
      role: 'CLIENT',
      customRole: 'CLIENT',
    },
    {
      email: 'candidate@e3qatar.com',
      name: 'Talent Applicant',
      role: 'CANDIDATE',
      customRole: 'CANDIDATE',
    },
  ];

  const customRolesMap = {};

  for (const acc of accounts) {
    await runWithRetry(async () => {
      const user = await prisma.user.upsert({
        where: { email: acc.email },
        update: {
          name: acc.name,
          password: hashedPassword,
          role: acc.role,
          isActive: true,
        },
        create: {
          email: acc.email,
          name: acc.name,
          password: hashedPassword,
          role: acc.role,
          isActive: true,
          sessionVersion: 1,
        },
      });

      if (acc.customRole) {
        customRolesMap[acc.email.toLowerCase()] = acc.customRole;
        customRolesMap[user.id.toLowerCase()] = acc.customRole;
      }

      console.log(`Upserted: ${acc.email} (${acc.role} / ${acc.customRole})`);
    });
  }

  // Persist custom roles setting
  await runWithRetry(async () => {
    const existingSetting = await prisma.setting.findUnique({
      where: { key: 'rbac_custom_roles' },
    });
    const mergedMap = {
      ...(existingSetting?.value && typeof existingSetting.value === 'object' ? existingSetting.value : {}),
      ...customRolesMap,
    };

    await prisma.setting.upsert({
      where: { key: 'rbac_custom_roles' },
      update: {
        value: mergedMap,
      },
      create: {
        key: 'rbac_custom_roles',
        value: mergedMap,
        type: 'SECURITY',
      },
    });

    console.log('Saved rbac_custom_roles successfully:', mergedMap);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
