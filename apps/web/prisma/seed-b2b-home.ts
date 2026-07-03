import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding B2B Home Page...')

  const defaultContent = {
    hero: {
      title: "Ideas to Life",
      subtitle: "We design, build, operate, and scale immersive entertainment experiences across Qatar.",
      description: "From creative concepts to crowd flow, fabrication, ticketing, staffing, and live operations.",
      primaryCta: "Explore Services",
      primaryLink: "/b2b/services",
      secondaryCta: "Start a Project",
      secondaryLink: "/b2b/contact"
    },
    stats: [
      { value: '50+', label: 'Years Combined Experience' },
      { value: '9+', label: 'Core Specializations' },
      { value: '100%', label: 'Qatari Owned' },
      { value: '3+', label: 'Regional Markets' },
    ],
    wowAndHow: {
      title: "The WOW & The HOW",
      description: "Creative ideas need operational engineering. We don't just design experiences—we build, staff, operate, and monitor them.",
      wowBullets: [
        'Creative concepts', 
        'Immersive entertainment', 
        'Themed environments', 
        'Storytelling'
      ],
      howBullets: [
        'Feasibility & Safety', 
        'Fabrication & Staging', 
        'Crowd flow & Staffing', 
        'Live Operations & Ticketing'
      ]
    }
  }

  const defaultSeo = {
    title: "E3 Corporate | Ideas to Life",
    description: "We design, build, operate, and scale immersive entertainment experiences across Qatar."
  }

  const page = await prisma.pages.upsert({
    where: { slug: 'b2b-home' },
    update: {},
    create: {
      slug: 'b2b-home',
      title: "B2B Homepage",
      content: defaultContent,
      seo: defaultSeo,
      status: 'PUBLISHED',
      portal: 'B2B'
    }
  })

  console.log('✅ B2B Home Page seeded successfully:', page.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
