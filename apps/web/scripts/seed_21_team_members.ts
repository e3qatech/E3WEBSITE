import db from '../src/lib/db';

async function seed21TeamMembers() {
  const members = [
    {
      slug: 'mohamed-chakib-djerfaf',
      firstName: 'Mohamed Chakib',
      lastName: 'Djerfaf',
      firstNameAr: 'محمد شكيب',
      lastNameAr: 'جرفاف',
      designation: 'Creative Strategist & Spatial Designer',
      designationAr: 'استراتيجي إبداعي ومصمم تجارب مكانية',
      department: 'Creative, Brand & Growth',
      departmentAr: 'الإبداع والهوية والنمو',
      yearsOfExperience: 10,
      tagline: 'Crafting brand narratives into transformative spatial encounters.',
      taglineAr: 'صياغة روايات العلامة التجارية وتحويلها إلى تجارب مكانية ملهمة.',
      aboutSummary: 'Chakib specializes in spatial concept architecture, multisensory brand storytelling, and high-impact immersive design.',
      aboutSummaryAr: 'يتخصص شكيب في الهندسة المفاهيمية المكانية، وسرد القصص التفاعلي، والتصميم التجريبي عالي التأثير.',
      careerJourney: '10+ years in international experiential design and spatial branding.',
      keyStrengths: 'Spatial Design, Creative Strategy, Narrative Architecture',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      isActive: true,
      showOnTeamPage: true,
      order: 18,
      displayOrder: 18,
      projects: [{ name: 'Spatial Brand Worlds', year: '2024', role: 'Creative Lead' }],
      projectsAr: [{ name: 'عوالم العلامات المكانية', year: '2024', role: 'قائد إبداعي' }],
      expertiseTags: ['Spatial Design', 'Creative Strategy', '3D Architecture'],
      expertiseTagsAr: ['التصميم المكاني', 'الاستراتيجية الإبداعية', 'الهندسة ثلاثية الأبعاد'],
      coreCompetencies: ['Spatial Architecture', 'Storytelling'],
      coreCompetenciesAr: ['العمارة المكانية', 'السرد القصصي'],
      experience: [],
      certifications: [],
      education: [],
      awards: [],
      skillsMatrix: [{ skill: '__presentation_group__', level: 'imagine' }],
      mediaGallery: [],
      testimonials: []
    },
    {
      slug: 'reycie-memije',
      firstName: 'Reycie Mia',
      lastName: 'Cenizal Memije',
      firstNameAr: 'ريسي ميا',
      lastNameAr: 'سينيزال ميميجي',
      designation: 'Finance & Corporate Enablement Lead',
      designationAr: 'مسؤول الشؤون المالية والتمكين المؤسسي',
      department: 'Corporate Enablement',
      departmentAr: 'التمكين المؤسسي',
      yearsOfExperience: 12,
      tagline: 'Empowering organizational excellence, governance, and institutional financial governance.',
      taglineAr: 'تمكين التميز المؤسسي والحوكمة والرقابة المالية الاستراتيجية.',
      aboutSummary: 'Reycie leads corporate enablement, corporate compliance, and resource governance across E3 operations.',
      aboutSummaryAr: 'تقود ريسي برامج التمكين المؤسسي والامتثال وحوكمة الموارد المالية عبر مشاريع إي ثري.',
      careerJourney: '12+ years in corporate finance and business enablement.',
      keyStrengths: 'Financial Governance, Corporate Compliance, Operations Enablement',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
      isActive: true,
      showOnTeamPage: true,
      order: 19,
      displayOrder: 19,
      projects: [{ name: 'Enterprise Governance Framework', year: '2024', role: 'Lead' }],
      projectsAr: [{ name: 'إطار الحوكمة المؤسسية', year: '2024', role: 'مسؤول' }],
      expertiseTags: ['Corporate Enablement', 'Financial Governance', 'Compliance'],
      expertiseTagsAr: ['التمكين المؤسسي', 'الحوكمة المالية', 'الامتثال'],
      coreCompetencies: ['Institutional Governance', 'Financial Oversight'],
      coreCompetenciesAr: ['الحوكمة المؤسسية', 'الرقابة المالية'],
      experience: [],
      certifications: [],
      education: [],
      awards: [],
      skillsMatrix: [{ skill: '__presentation_group__', level: 'corporate-enablement' }],
      mediaGallery: [],
      testimonials: []
    },
    {
      slug: 'mohammed-abdulla',
      firstName: 'Mohammed',
      lastName: 'Abdulla',
      firstNameAr: 'محمد',
      lastNameAr: 'عبدالله',
      designation: 'Operations & Government Relations Officer',
      designationAr: 'مسؤول العمليات والعلاقات الحكومية',
      department: 'Corporate Enablement',
      departmentAr: 'التمكين المؤسسي',
      yearsOfExperience: 11,
      tagline: 'Facilitating high-level governmental coordination, permits, and sovereign stakeholder liaison.',
      taglineAr: 'تسهيل التنسيق الحكومي رفيع المستوى والتصاريح والتواصل مع الجهات الرسمية.',
      aboutSummary: 'Mohammed orchestrates government relations, municipal approvals, and institutional stakeholder synergy for major Qatar events.',
      aboutSummaryAr: 'يتولى محمد إدارة العلاقات الحكومية والتراخيص البلدية والتنسيق مع الشركاء الرسميين للفعاليات الكبرى في قطر.',
      careerJourney: '11+ years in government relations and public sector liaison in Qatar.',
      keyStrengths: 'Government Relations, Regulatory Permitting, Strategic Stakeholder Liaison',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      isActive: true,
      showOnTeamPage: true,
      order: 20,
      displayOrder: 20,
      projects: [{ name: 'Sovereign Regulatory Alignment', year: '2024', role: 'Liaison Lead' }],
      projectsAr: [{ name: 'المواءمة التنظيمية الحكومية', year: '2024', role: 'مسؤول التنسيق' }],
      expertiseTags: ['Government Relations', 'Regulatory Compliance', 'Event Permitting'],
      expertiseTagsAr: ['العلاقات الحكومية', 'الامتثال التنظيمي', 'تصاريح الفعاليات'],
      coreCompetencies: ['Public Sector Liaison', 'Municipal Approvals'],
      coreCompetenciesAr: ['التنسيق الحكومي', 'الموافقات الرسمية'],
      experience: [],
      certifications: [],
      education: [],
      awards: [],
      skillsMatrix: [{ skill: '__presentation_group__', level: 'corporate-enablement' }],
      mediaGallery: [],
      testimonials: []
    }
  ];

  for (const m of members) {
    const res = await db.employeeProfile.upsert({
      where: { slug: m.slug },
      update: m,
      create: m
    });
    console.log('Upserted profile:', res.slug, `(${res.firstName} ${res.lastName})`);
  }

  const all = await db.employeeProfile.findMany({
    where: { isActive: true, showOnTeamPage: true },
    select: { slug: true, firstName: true, lastName: true }
  });
  console.log('TOTAL ACTIVE TEAM PROFILES IN DB:', all.length);
}

seed21TeamMembers()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
    process.exit(0);
  });
