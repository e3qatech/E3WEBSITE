const fs = require('fs');

function applyFix(filePath, lineNum, searchRegex, replaceWith) {
  const fullPath = `A:\\.gemini\\antigravity\\scratch\\E3 WEBSITE\\e3-qatar\\${filePath}`;
  if (!fs.existsSync(fullPath)) return;
  const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
  const lineStr = lines[lineNum - 1];
  if (lineStr.match(searchRegex)) {
    lines[lineNum - 1] = lineStr.replace(searchRegex, replaceWith);
    fs.writeFileSync(fullPath, lines.join('\n'));
    console.log(`Fixed ${filePath}:${lineNum}`);
  }
}

// apps/web/prisma/seed-events.ts
applyFix('apps/web/prisma/seed-events.ts', 228, /const { startDate, endDate, status, \.\.\.rest }/, 'const { ...rest }');
applyFix('apps/web/prisma/seed-events.ts', 249, /const { eventId, \.\.\.catData }/, 'const { eventId: _eventId, ...catData }'); // destructure exclusion

// apps/web/prisma/seed.ts
applyFix('apps/web/prisma/seed.ts', 28, /const chairman = await prisma/, 'await prisma');
applyFix('apps/web/prisma/seed.ts', 58, /const gm = await prisma/, 'await prisma');
applyFix('packages/prisma/src/seed.ts', 267, /const service1 = await prisma/, 'await prisma');
applyFix('packages/prisma/src/seed.ts', 282, /const service2 = await prisma/, 'await prisma');
applyFix('packages/prisma/src/seed.ts', 298, /const attraction = await prisma/, 'await prisma');

// apps/web/server.js
applyFix('apps/web/server.js', 37, /catch \(e\)/, 'catch');
applyFix('apps/web/server.js', 46, /catch \(err\)/, 'catch');

// apps/web/src/app/[locale]/b2b/case-studies/page.tsx
applyFix('apps/web/src/app/[locale]/b2b/case-studies/page.tsx', 115, /map\(\(study, i\)/, 'map((study)');

// apps/web/src/app/[locale]/b2b/team/[slug]/page.tsx
applyFix('apps/web/src/app/[locale]/b2b/team/[slug]/page.tsx', 10, /const { params } = props;/, '');
applyFix('apps/web/src/app/[locale]/b2b/team/[slug]/page.tsx', 18, /const { slug } = await props\.params;/, 'await props.params;');

// apps/web/src/app/[locale]/b2c/attractions/[slug]/page.tsx
applyFix('apps/web/src/app/[locale]/b2c/attractions/[slug]/page.tsx', 148, /const { isRTL } = useLocale\(\);/, 'useLocale();');
applyFix('apps/web/src/app/[locale]/b2c/attractions/[slug]/page.tsx', 156, /const { operations, gallery, offers, \.\.\.attractionData }/, 'const { operations: _o, gallery, offers, ...attractionData }');

// apps/web/src/app/[locale]/b2c/attractions/page.tsx
applyFix('apps/web/src/app/[locale]/b2c/attractions/page.tsx', 197, /const { isRTL } = useLocale\(\);/, 'useLocale();');

// apps/web/src/app/[locale]/b2c/contact/page.tsx
applyFix('apps/web/src/app/[locale]/b2c/contact/page.tsx', 12, /const baseUrl = process\.env\.NEXT_PUBLIC_APP_URL || 'http:\/\/localhost:3000';/, '');
applyFix('apps/web/src/app/[locale]/b2c/contact/page.tsx', 57, /catch \(e\)/, 'catch');

// apps/web/src/app/[locale]/layout.tsx
applyFix('apps/web/src/app/[locale]/layout.tsx', 10, /const { locale } = await props\.params;/, 'await props.params;');

// Next.js route API params
applyFix('apps/web/src/app/api/b2c/calendar-settings/route.ts', 5, /\(req: NextRequest\)/, '(_req: NextRequest)');
applyFix('apps/web/src/app/api/b2c/contact-settings/route.ts', 5, /\(req: NextRequest\)/, '(_req: NextRequest)');
applyFix('apps/web/src/app/api/tickets/route.ts', 5, /\(req: NextRequest\)/, '(_req: NextRequest)');

// apps/web/src/app/api/calendar/route.ts
applyFix('apps/web/src/app/api/calendar/route.ts', 4, /const QATAR_TZ = 'Asia\/Qatar';/, '');
applyFix('apps/web/src/app/api/calendar/route.ts', 76, /const reqStart = searchParams\.get\('start'\);/, '');
applyFix('apps/web/src/app/api/calendar/route.ts', 77, /const reqEnd = searchParams\.get\('end'\);/, '');

// apps/web/src/app/api/cases/[id]/route.ts
applyFix('apps/web/src/app/api/cases/[id]/route.ts', 48, /const duration = Date\.now\(\) - startTime;/, '');
applyFix('apps/web/src/app/api/cases/route.ts', 19, /const duration = Date\.now\(\) - startTime;/, '');

// apps/web/src/app/api/crm/leads/route.ts
applyFix('apps/web/src/app/api/crm/leads/route.ts', 62, /const { notes, \.\.\.leadData }/, 'const { notes: _notes, ...leadData }');

// apps/web/src/app/api/services/route.ts
applyFix('apps/web/src/app/api/services/route.ts', 11, /const body = await req\.json\(\);/, 'await req.json();');

// apps/web/src/app/api/upload/route.ts
applyFix('apps/web/src/app/api/upload/route.ts', 80, /const tokenPayload = await verifyToken\(token\);/, 'await verifyToken(token);');

// apps/web/src/app/dashboard/careers/[id]/page.tsx
applyFix('apps/web/src/app/dashboard/careers/[id]/page.tsx', 43, /map\(\(item, i\)/, 'map((_item, i)');

// apps/web/src/components/attractions/detail/LiveBookingCard.tsx
applyFix('apps/web/src/components/attractions/detail/LiveBookingCard.tsx', 31, /schedule: any/, '_schedule: any');

// apps/web/src/components/b2b/CaseStudyDetailClient.tsx
applyFix('apps/web/src/components/b2b/CaseStudyDetailClient.tsx', 152, /const { gallery, \.\.\.rest }/, 'const { gallery: _g, ...rest }');

// apps/web/src/components/b2b/ServiceDetailClient.tsx
applyFix('apps/web/src/components/b2b/ServiceDetailClient.tsx', 22, /const { scrollYProgress } = useScroll\(\);/, 'useScroll();');
applyFix('apps/web/src/components/b2b/ServiceDetailClient.tsx', 35, /const \[activeSection, setActiveSection\] = useState\('overview'\);/, 'const [activeSection] = useState(\'overview\');');
applyFix('apps/web/src/components/b2b/ServiceDetailClient.tsx', 60, /catch \(e\)/, 'catch');

// apps/web/src/components/b2b/detail/DynamicCTA.tsx
applyFix('apps/web/src/components/b2b/detail/DynamicCTA.tsx', 18, /const { isRTL } = useLocale\(\);/, 'useLocale();');

// apps/web/src/components/b2b/detail/ServiceHero.tsx
applyFix('apps/web/src/components/b2b/detail/ServiceHero.tsx', 33, /const \[isVideoPlaying, setIsVideoPlaying\] = useState\(false\);/, ''); // Entire state is unused

// apps/web/src/components/b2b/detail/ServiceRichText.tsx
applyFix('apps/web/src/components/b2b/detail/ServiceRichText.tsx', 22, /const { isRTL } = useLocale\(\);/, 'useLocale();');

// apps/web/src/components/b2b/detail/SimilarProjects.tsx
applyFix('apps/web/src/components/b2b/detail/SimilarProjects.tsx', 22, /const { isRTL } = useLocale\(\);/, 'useLocale();');

// apps/web/src/components/b2b/layout/B2BLayout.tsx
applyFix('apps/web/src/components/b2b/layout/B2BLayout.tsx', 17, /const mounted = useMounted\(\);/, 'useMounted();');

// apps/web/src/components/b2c/ContactClient.tsx
applyFix('apps/web/src/components/b2c/ContactClient.tsx', 32, /const { theme, isAr } = useThemeContext\(\);/, 'useThemeContext();');
applyFix('apps/web/src/components/b2c/ContactClient.tsx', 218, /const { theme } = useThemeContext\(\);/, 'useThemeContext();');

// apps/web/src/components/b2c/DiscoverClient.tsx
applyFix('apps/web/src/components/b2c/DiscoverClient.tsx', 20, /import { ModelViewer } from '\@\/components\/shared\/ModelViewer';/, '');
applyFix('apps/web/src/components/b2c/DiscoverClient.tsx', 34, /const { theme } = useThemeContext\(\);/, 'useThemeContext();');
applyFix('apps/web/src/components/b2c/DiscoverClient.tsx', 382, /const accentHex = theme === 'dark' \? '#8A2BE2' : '#6A5ACD';/, '');

// apps/web/src/components/b2c/TeamClient.tsx
applyFix('apps/web/src/components/b2c/TeamClient.tsx', 51, /map\(\(department, i\)/, 'map((department)');

// apps/web/src/components/b2c/TeamMemberClient.tsx
applyFix('apps/web/src/components/b2c/TeamMemberClient.tsx', 28, /const bgXSpring = useSpring\(mouseX, { stiffness: 100, damping: 30 }\);/, '');
applyFix('apps/web/src/components/b2c/TeamMemberClient.tsx', 29, /const bgYSpring = useSpring\(mouseY, { stiffness: 100, damping: 30 }\);/, '');

// apps/web/src/components/calendar/CalendarView.tsx
applyFix('apps/web/src/components/calendar/CalendarView.tsx', 41, /const month = currentDate\.getMonth\(\);/, '');
applyFix('apps/web/src/components/calendar/CalendarView.tsx', 42, /const year = currentDate\.getFullYear\(\);/, '');

// apps/web/src/components/calendar/EventCard.tsx
applyFix('apps/web/src/components/calendar/EventCard.tsx', 32, /onSelectTickets,/, '');

// apps/web/src/components/calendar/TicketSelectionModal.tsx
applyFix('apps/web/src/components/calendar/TicketSelectionModal.tsx', 80, /Array\.from\({ length: count }\)\.map\(\(\_, i\)/, 'Array.from({ length: count }).map((_ignore, i)');

// apps/web/src/components/contact/ContactTabs.tsx
applyFix('apps/web/src/components/contact/ContactTabs.tsx', 20, /const { isRTL } = useLocale\(\);/, 'useLocale();');

// apps/web/src/components/contact/FeedbackForm.tsx
applyFix('apps/web/src/components/contact/FeedbackForm.tsx', 20, /const { isRTL } = useLocale\(\);/, 'useLocale();');

// apps/web/src/components/contact/SupportForm.tsx
applyFix('apps/web/src/components/contact/SupportForm.tsx', 27, /const { isRTL } = useLocale\(\);/, 'useLocale();');

// apps/web/src/components/dashboard/KanbanBoard.tsx
applyFix('apps/web/src/components/dashboard/KanbanBoard.tsx', 58, /catch \(e\)/, 'catch');
applyFix('apps/web/src/components/dashboard/KanbanBoard.tsx', 128, /const \[isSyncing, setIsSyncing\] = useState\(false\);/, '');

// apps/web/src/components/dashboard/SystemBroadcastBanner.tsx
applyFix('apps/web/src/components/dashboard/SystemBroadcastBanner.tsx', 21, /const { isConnected } = useSocket\(\);/, 'useSocket();');

// apps/web/src/components/dashboard/b2b/CaseEditor.tsx
applyFix('apps/web/src/components/dashboard/b2b/CaseEditor.tsx', 45, /const \[technicalSpecs, setTechnicalSpecs\] = useState<string\[\]>\(caseStudy\?\.technicalSpecs \|\| \[\]\);/, 'const [technicalSpecs] = useState<string[]>(caseStudy?.technicalSpecs || []);');
applyFix('apps/web/src/components/dashboard/b2b/CaseEditor.tsx', 46, /const \[servicesUsed, setServicesUsed\] = useState<string\[\]>\(caseStudy\?\.servicesUsed \|\| \[\]\);/, 'const [servicesUsed] = useState<string[]>(caseStudy?.servicesUsed || []);');

// apps/web/src/components/dashboard/b2c/AttractionEditForm.tsx
applyFix('apps/web/src/components/dashboard/b2c/AttractionEditForm.tsx', 55, /const \[offers, setOffers\] = useState<any\[\]>\(initialData\.offers \|\| \[\]\);/, 'const [offers] = useState<any[]>(initialData.offers || []);');
applyFix('apps/web/src/components/dashboard/b2c/AttractionEditForm.tsx', 61, /const \[socialLinks, setSocialLinks\] = useState<any>\(initialData\.socialLinks \|\| {}\);/, 'const [socialLinks] = useState<any>(initialData.socialLinks || {});');
applyFix('apps/web/src/components/dashboard/b2c/AttractionEditForm.tsx', 64, /const \[temporalRules, setTemporalRules\] = useState<any\[\]>\(initialData\.temporalRules \|\| \[\]\);/, 'const [temporalRules] = useState<any[]>(initialData.temporalRules || []);');

// apps/web/src/components/dashboard/b2c/AttractionEditor.tsx
applyFix('apps/web/src/components/dashboard/b2c/AttractionEditor.tsx', 34, /const \[isFeatured, setIsFeatured\] = useState\(attraction\?\.isFeatured \|\| false\);/, 'const [isFeatured] = useState(attraction?.isFeatured || false);');
applyFix('apps/web/src/components/dashboard/b2c/AttractionEditor.tsx', 35, /const \[isHidden, setIsHidden\] = useState\(attraction\?\.isHidden \|\| false\);/, 'const [isHidden] = useState(attraction?.isHidden || false);');

// apps/web/src/components/dashboard/crm/TalentDetail.tsx
applyFix('apps/web/src/components/dashboard/crm/TalentDetail.tsx', 33, /const \[talent, setTalent\] = useState<any>\(initialData\);/, 'const [talent] = useState<any>(initialData);');

// apps/web/src/components/dashboard/crm/TalentTable.tsx
applyFix('apps/web/src/components/dashboard/crm/TalentTable.tsx', 24, /const \[data, setData\] = useState\(initialData\);/, 'const [data] = useState(initialData);');

// apps/web/src/components/dashboard/ui/AdminSidebar.tsx
applyFix('apps/web/src/components/dashboard/ui/AdminSidebar.tsx', 94, /const { resolvedTheme } = useTheme\(\);/, 'useTheme();');

// apps/web/src/components/home/PortalGateway.tsx
applyFix('apps/web/src/components/home/PortalGateway.tsx', 30, /const mounted = useMounted\(\);/, 'useMounted();');

// apps/web/src/components/layout/PortalSwitcher.tsx
applyFix('apps/web/src/components/layout/PortalSwitcher.tsx', 11, /const t = useTranslations\('PortalSwitcher'\);/, 'useTranslations(\'PortalSwitcher\');');

// apps/web/src/components/shared/ARScene.tsx
applyFix('apps/web/src/components/shared/ARScene.tsx', 26, /\( \{ isARMode \}: \{ isARMode: boolean \} \)/, '( _props: { isARMode: boolean } )');
applyFix('apps/web/src/components/shared/ARScene.tsx', 34, /const \[rotation, setRotation\] = useState\(0\);/, ''); // unused state

// apps/web/src/components/shared/ARViewer.tsx
applyFix('apps/web/src/components/shared/ARViewer.tsx', 27, /import { Loader } from 'lucide-react';/, '');

// apps/web/src/components/shared/MeetingBookingForm.tsx
applyFix('apps/web/src/components/shared/MeetingBookingForm.tsx', 17, /{ serviceSlug, hostId,/, '{');
applyFix('apps/web/src/components/shared/MeetingBookingForm.tsx', 18, /const { isRTL } = useLocale\(\);/, 'useLocale();');

// apps/web/src/components/shared/SpatialHub.tsx
applyFix('apps/web/src/components/shared/SpatialHub.tsx', 202, /const currentLookAt = useRef<THREE\.Vector3>\(new THREE\.Vector3\(0, 1\.5, 0\)\);/, '');
applyFix('apps/web/src/components/shared/SpatialHub.tsx', 223, /const \[isLowEnd, setIsLowEnd\] = useState\(false\);/, '');

// apps/web/src/components/shared/SpatialScene.tsx
applyFix('apps/web/src/components/shared/SpatialScene.tsx', 27, /const { size, gl } = useThree\(\);/, 'useThree();');
applyFix('apps/web/src/components/shared/SpatialScene.tsx', 84, /useFrame\(\(\_, delta\) => {/, 'useFrame(() => {');

// apps/web/src/components/shared/TipTapEditor.tsx
applyFix('apps/web/src/components/shared/TipTapEditor.tsx', 121, /placeholder = 'Type here\.\.\.',/, '');

// apps/web/src/components/tickets/AttractionTicketCard.tsx
applyFix('apps/web/src/components/tickets/AttractionTicketCard.tsx', 34, /const { isRTL } = useLocale\(\);/, 'useLocale();');

// apps/web/src/components/ui/B2CThemeComponents.tsx
applyFix('apps/web/src/components/ui/B2CThemeComponents.tsx', 513, /const { isAr } = useThemeContext\(\);/, 'useThemeContext();');
applyFix('apps/web/src/components/ui/B2CThemeComponents.tsx', 621, /const \[hovered, setHovered\] = useState\(false\);/, 'const [, setHovered] = useState(false);');
applyFix('apps/web/src/components/ui/B2CThemeComponents.tsx', 674, /const locale = useLocaleState\(\);/, 'useLocaleState();');
applyFix('apps/web/src/components/ui/B2CThemeComponents.tsx', 790, /const startDateStr = format\(new Date\(event\.startDate\), "MMM d"\);/, '');

// apps/web/src/components/ui/MediaUploader.tsx
applyFix('apps/web/src/components/ui/MediaUploader.tsx', 20, /const \[progress, setProgress\] = useState\(0\);/, 'const [, setProgress] = useState(0);');
applyFix('apps/web/src/components/ui/MediaUploader.tsx', 21, /const \[error, setError\] = useState<string \| null>\(null\);/, 'const [, setError] = useState<string | null>(null);');

// apps/web/src/lib/images.tsx
applyFix('apps/web/src/lib/images.tsx', 8, /url: string,/, '');

// apps/web/src/lib/socket.ts
applyFix('apps/web/src/lib/socket.ts', 89, /const emits = \(\) => {/, '() => {');

