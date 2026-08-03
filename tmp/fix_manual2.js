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

// 1: apps/web/prisma/seed-events.ts:228
applyFix('apps/web/prisma/seed-events.ts', 228, /const { startDate, endDate, status, \.\.\.rest }/, 'const { ...rest }');
// 4: apps/web/prisma/seed-events.ts:249
applyFix('apps/web/prisma/seed-events.ts', 249, /const { eventId, \.\.\.catData }/, 'const { eventId: _eventId, ...catData }');
// 5: apps/web/server.js:37
applyFix('apps/web/server.js', 37, /catch \(e\)/, 'catch');
// 6: apps/web/server.js:46
applyFix('apps/web/server.js', 46, /catch \(err\)/, 'catch');
// 7: apps/web/src/app/[locale]/b2b/case-studies/page.tsx:115
applyFix('apps/web/src/app/[locale]/b2b/case-studies/page.tsx', 115, /\(study, i\)/, '(study)');
// 8: apps/web/src/app/[locale]/b2b/feedback/page.tsx:10
applyFix('apps/web/src/app/[locale]/b2b/feedback/page.tsx', 10, /const { params } = props;/, '');
// 9: apps/web/src/app/[locale]/b2b/team/[slug]/page.tsx:10
applyFix('apps/web/src/app/[locale]/b2b/team/[slug]/page.tsx', 10, /const { params } = props;/, '');
// 10: apps/web/src/app/[locale]/b2b/team/[slug]/page.tsx:18
applyFix('apps/web/src/app/[locale]/b2b/team/[slug]/page.tsx', 18, /const { slug } = await props\.params;/, 'await props.params;');
// 11: apps/web/src/app/[locale]/b2c/attractions/[slug]/page.tsx:148
applyFix('apps/web/src/app/[locale]/b2c/attractions/[slug]/page.tsx', 148, /const { isRTL } = useLocale\(\);/, 'useLocale();');
// 12: apps/web/src/app/[locale]/b2c/attractions/[slug]/page.tsx:156
applyFix('apps/web/src/app/[locale]/b2c/attractions/[slug]/page.tsx', 156, /const { operations, gallery, offers, \.\.\.attractionData }/, 'const { operations: _o, gallery, offers, ...attractionData }');
// 13: apps/web/src/app/[locale]/b2c/attractions/page.tsx:197
applyFix('apps/web/src/app/[locale]/b2c/attractions/page.tsx', 197, /const { isRTL } = useLocale\(\);/, 'useLocale();');
// 14: apps/web/src/app/[locale]/b2c/contact/page.tsx:12
applyFix('apps/web/src/app/[locale]/b2c/contact/page.tsx', 12, /const baseUrl = process\.env\.NEXT_PUBLIC_APP_URL \|\| 'http:\/\/localhost:3000';/, '');
// 15: apps/web/src/app/[locale]/b2c/contact/page.tsx:57
applyFix('apps/web/src/app/[locale]/b2c/contact/page.tsx', 57, /catch \(e\)/, 'catch');
// 16: apps/web/src/app/[locale]/layout.tsx:10
applyFix('apps/web/src/app/[locale]/layout.tsx', 10, /const { locale } = await props\.params;/, 'await props.params;');
// 17: apps/web/src/app/api/b2c/calendar-settings/route.ts:5
applyFix('apps/web/src/app/api/b2c/calendar-settings/route.ts', 5, /_req: NextRequest/, '_req: NextRequest // eslint-disable-line @typescript-eslint/no-unused-vars');
// 18: apps/web/src/app/api/b2c/contact-settings/route.ts:5
applyFix('apps/web/src/app/api/b2c/contact-settings/route.ts', 5, /_req: NextRequest/, '_req: NextRequest // eslint-disable-line @typescript-eslint/no-unused-vars');
// 19: apps/web/src/app/api/calendar/route.ts:76
applyFix('apps/web/src/app/api/calendar/route.ts', 76, /const reqStart = searchParams\.get\('start'\);/, '');
// 20: apps/web/src/app/api/calendar/route.ts:77
applyFix('apps/web/src/app/api/calendar/route.ts', 77, /const reqEnd = searchParams\.get\('end'\);/, '');
// 21: apps/web/src/app/api/cases/[id]/route.ts:48
applyFix('apps/web/src/app/api/cases/[id]/route.ts', 48, /const duration = Date\.now\(\) - startTime;/, '');
// 22: apps/web/src/app/api/cases/route.ts:19
applyFix('apps/web/src/app/api/cases/route.ts', 19, /const duration = Date\.now\(\) - startTime;/, '');
// 23: apps/web/src/app/api/crm/leads/route.ts:62
applyFix('apps/web/src/app/api/crm/leads/route.ts', 62, /const { notes, \.\.\.leadData }/, 'const { notes: _n, ...leadData }');
// 24: apps/web/src/app/api/services/route.ts:11
applyFix('apps/web/src/app/api/services/route.ts', 11, /const body = await req\.json\(\);/, 'await req.json();');
// 25: apps/web/src/app/api/tickets/route.ts:5
applyFix('apps/web/src/app/api/tickets/route.ts', 5, /_req: NextRequest/, '_req: NextRequest // eslint-disable-line @typescript-eslint/no-unused-vars');
// 26: apps/web/src/app/api/upload/route.ts:80
applyFix('apps/web/src/app/api/upload/route.ts', 80, /const tokenPayload = await verifyToken\(token\);/, 'await verifyToken(token);');
// 27: apps/web/src/app/dashboard/careers/[id]/page.tsx:43
applyFix('apps/web/src/app/dashboard/careers/[id]/page.tsx', 43, /\(item, i\)/, '(_item, i)');
// 28: apps/web/src/components/attractions/detail/LiveBookingCard.tsx:31
applyFix('apps/web/src/components/attractions/detail/LiveBookingCard.tsx', 31, /schedule: any/, '_schedule: any');
// 29: apps/web/src/components/b2b/CaseStudyDetailClient.tsx:152
applyFix('apps/web/src/components/b2b/CaseStudyDetailClient.tsx', 152, /const { gallery, \.\.\.rest }/, 'const { gallery: _g, ...rest }');
// 30: apps/web/src/components/b2b/ServiceDetailClient.tsx:22
applyFix('apps/web/src/components/b2b/ServiceDetailClient.tsx', 22, /const { scrollYProgress } = useScroll\(\);/, 'useScroll();');
// 31: apps/web/src/components/b2b/ServiceDetailClient.tsx:35
applyFix('apps/web/src/components/b2b/ServiceDetailClient.tsx', 35, /const \[activeSection, setActiveSection\] = useState\('overview'\);/, 'const [activeSection] = useState(\'overview\');');
// 32: apps/web/src/components/b2b/ServiceDetailClient.tsx:60
applyFix('apps/web/src/components/b2b/ServiceDetailClient.tsx', 60, /catch \(e\)/, 'catch');
// 33: apps/web/src/components/b2b/detail/DynamicCTA.tsx:18
applyFix('apps/web/src/components/b2b/detail/DynamicCTA.tsx', 18, /const { isRTL } = useLocale\(\);/, 'useLocale();');
// 34: apps/web/src/components/b2b/detail/ServiceHero.tsx:33
applyFix('apps/web/src/components/b2b/detail/ServiceHero.tsx', 33, /const \[isVideoPlaying, setIsVideoPlaying\] = useState\(false\);/, '');
// 36: apps/web/src/components/b2b/detail/ServiceRichText.tsx:22
applyFix('apps/web/src/components/b2b/detail/ServiceRichText.tsx', 22, /const { isRTL } = useLocale\(\);/, 'useLocale();');
// 37: apps/web/src/components/b2b/detail/SimilarProjects.tsx:22
applyFix('apps/web/src/components/b2b/detail/SimilarProjects.tsx', 22, /const { isRTL } = useLocale\(\);/, 'useLocale();');
// 38: apps/web/src/components/b2c/ContactClient.tsx:32
applyFix('apps/web/src/components/b2c/ContactClient.tsx', 32, /const { theme, isAr } = useThemeContext\(\);/, 'useThemeContext();');
// 40: apps/web/src/components/b2c/ContactClient.tsx:218
applyFix('apps/web/src/components/b2c/ContactClient.tsx', 218, /const { theme } = useThemeContext\(\);/, 'useThemeContext();');
// 41: apps/web/src/components/b2c/DiscoverClient.tsx:20
applyFix('apps/web/src/components/b2c/DiscoverClient.tsx', 20, /import { ModelViewer } from '\@\/components\/shared\/ModelViewer';/, '');
// 42: apps/web/src/components/b2c/DiscoverClient.tsx:34
applyFix('apps/web/src/components/b2c/DiscoverClient.tsx', 34, /const { theme } = useThemeContext\(\);/, 'useThemeContext();');
// 43: apps/web/src/components/b2c/DiscoverClient.tsx:382
applyFix('apps/web/src/components/b2c/DiscoverClient.tsx', 382, /const accentHex = theme === 'dark' \? '#8A2BE2' : '#6A5ACD';/, '');
// 44: apps/web/src/components/b2c/TeamClient.tsx:51
applyFix('apps/web/src/components/b2c/TeamClient.tsx', 51, /\(department, i\)/, '(department)');
// 45: apps/web/src/components/b2c/TeamMemberClient.tsx:28
applyFix('apps/web/src/components/b2c/TeamMemberClient.tsx', 28, /const bgXSpring = useSpring\(mouseX, { stiffness: 100, damping: 30 }\);/, '');
// 46: apps/web/src/components/b2c/TeamMemberClient.tsx:29
applyFix('apps/web/src/components/b2c/TeamMemberClient.tsx', 29, /const bgYSpring = useSpring\(mouseY, { stiffness: 100, damping: 30 }\);/, '');
// 47: apps/web/src/components/calendar/CalendarView.tsx:41
applyFix('apps/web/src/components/calendar/CalendarView.tsx', 41, /const month = currentDate\.getMonth\(\);/, '');
// 48: apps/web/src/components/calendar/CalendarView.tsx:42
applyFix('apps/web/src/components/calendar/CalendarView.tsx', 42, /const year = currentDate\.getFullYear\(\);/, '');
// 49: apps/web/src/components/calendar/EventCard.tsx:32
applyFix('apps/web/src/components/calendar/EventCard.tsx', 32, /onSelectTickets,/, '');
// 50: apps/web/src/components/calendar/TicketSelectionModal.tsx:80
applyFix('apps/web/src/components/calendar/TicketSelectionModal.tsx', 80, /\(_, i\)/, '(_ign, i)');
// 51: apps/web/src/components/contact/ContactTabs.tsx:20
applyFix('apps/web/src/components/contact/ContactTabs.tsx', 20, /const { isRTL } = useLocale\(\);/, 'useLocale();');
// 52: apps/web/src/components/contact/FeedbackForm.tsx:20
applyFix('apps/web/src/components/contact/FeedbackForm.tsx', 20, /const { isRTL } = useLocale\(\);/, 'useLocale();');
// 53: apps/web/src/components/contact/SupportForm.tsx:27
applyFix('apps/web/src/components/contact/SupportForm.tsx', 27, /const { isRTL } = useLocale\(\);/, 'useLocale();');
// 54: apps/web/src/components/dashboard/KanbanBoard.tsx:58
applyFix('apps/web/src/components/dashboard/KanbanBoard.tsx', 58, /catch \(e\)/, 'catch');
// 55: apps/web/src/components/dashboard/KanbanBoard.tsx:128
applyFix('apps/web/src/components/dashboard/KanbanBoard.tsx', 128, /const \[isSyncing, setIsSyncing\] = useState\(false\);/, '');
// 56: apps/web/src/components/dashboard/SystemBroadcastBanner.tsx:21
applyFix('apps/web/src/components/dashboard/SystemBroadcastBanner.tsx', 21, /const { isConnected } = useSocket\(\);/, 'useSocket();');
// 57: apps/web/src/components/dashboard/b2b/CaseEditor.tsx:45
applyFix('apps/web/src/components/dashboard/b2b/CaseEditor.tsx', 45, /setTechnicalSpecs/, ''); // remove setter only? No, just match and replace
// wait, better: 
applyFix('apps/web/src/components/dashboard/b2b/CaseEditor.tsx', 45, /const \[technicalSpecs, setTechnicalSpecs\] = useState<string\[\]>\(caseStudy\?\.technicalSpecs \|\| \[\]\);/, 'const [technicalSpecs] = useState<string[]>(caseStudy?.technicalSpecs || []);');
applyFix('apps/web/src/components/dashboard/b2b/CaseEditor.tsx', 46, /const \[servicesUsed, setServicesUsed\] = useState<string\[\]>\(caseStudy\?\.servicesUsed \|\| \[\]\);/, 'const [servicesUsed] = useState<string[]>(caseStudy?.servicesUsed || []);');
// 59: apps/web/src/components/dashboard/b2c/AttractionEditForm.tsx:55
applyFix('apps/web/src/components/dashboard/b2c/AttractionEditForm.tsx', 55, /const \[offers, setOffers\] = useState<any\[\]>\(initialData\.offers \|\| \[\]\);/, 'const [offers] = useState<any[]>(initialData.offers || []);');
applyFix('apps/web/src/components/dashboard/b2c/AttractionEditForm.tsx', 61, /const \[socialLinks, setSocialLinks\] = useState<any>\(initialData\.socialLinks \|\| \{\}\);/, 'const [socialLinks] = useState<any>(initialData.socialLinks || {});');
applyFix('apps/web/src/components/dashboard/b2c/AttractionEditForm.tsx', 64, /const \[temporalRules, setTemporalRules\] = useState<any\[\]>\(initialData\.temporalRules \|\| \[\]\);/, 'const [temporalRules] = useState<any[]>(initialData.temporalRules || []);');
// 62: apps/web/src/components/dashboard/b2c/AttractionEditor.tsx:34
applyFix('apps/web/src/components/dashboard/b2c/AttractionEditor.tsx', 34, /const \[isFeatured, setIsFeatured\] = useState\(attraction\?\.isFeatured \|\| false\);/, 'const [isFeatured] = useState(attraction?.isFeatured || false);');
applyFix('apps/web/src/components/dashboard/b2c/AttractionEditor.tsx', 35, /const \[isHidden, setIsHidden\] = useState\(attraction\?\.isHidden \|\| false\);/, 'const [isHidden] = useState(attraction?.isHidden || false);');
// 64: apps/web/src/components/dashboard/crm/TalentDetail.tsx:33
applyFix('apps/web/src/components/dashboard/crm/TalentDetail.tsx', 33, /const \[talent, setTalent\] = useState<any>\(initialData\);/, 'const [talent] = useState<any>(initialData);');
// 65: apps/web/src/components/dashboard/crm/TalentTable.tsx:24
applyFix('apps/web/src/components/dashboard/crm/TalentTable.tsx', 24, /const \[data, setData\] = useState\(initialData\);/, 'const [data] = useState(initialData);');
// 66: apps/web/src/components/dashboard/ui/AdminSidebar.tsx:94
applyFix('apps/web/src/components/dashboard/ui/AdminSidebar.tsx', 94, /const { resolvedTheme } = useTheme\(\);/, 'useTheme();');
// 67: apps/web/src/components/home/PortalGateway.tsx:30
applyFix('apps/web/src/components/home/PortalGateway.tsx', 30, /const mounted = useMounted\(\);/, 'useMounted();');
// 68: apps/web/src/components/layout/PortalSwitcher.tsx:11
applyFix('apps/web/src/components/layout/PortalSwitcher.tsx', 11, /const t = useTranslations\('PortalSwitcher'\);/, 'useTranslations(\'PortalSwitcher\');');
// 69: apps/web/src/components/shared/ARScene.tsx:26
applyFix('apps/web/src/components/shared/ARScene.tsx', 26, /\( \{ isARMode \}: \{ isARMode: boolean \} \)/, '( _props: { isARMode: boolean } )');
applyFix('apps/web/src/components/shared/ARScene.tsx', 34, /const \[rotation, setRotation\] = useState\(0\);/, '');
// 71: apps/web/src/components/shared/ARViewer.tsx:27
applyFix('apps/web/src/components/shared/ARViewer.tsx', 27, /import { Loader } from 'lucide-react';/, '');
applyFix('apps/web/src/components/shared/ARViewer.tsx', 47, /catch \(error\)/, 'catch');
applyFix('apps/web/src/components/shared/ARViewer.tsx', 50, /catch \(errorInfo\)/, 'catch');
// 74: apps/web/src/components/shared/MeetingBookingForm.tsx:17
applyFix('apps/web/src/components/shared/MeetingBookingForm.tsx', 17, /serviceSlug, hostId,/, '');
applyFix('apps/web/src/components/shared/MeetingBookingForm.tsx', 18, /const { isRTL } = useLocale\(\);/, 'useLocale();');
// 77: apps/web/src/components/shared/SpatialHub.tsx:202
applyFix('apps/web/src/components/shared/SpatialHub.tsx', 202, /const currentLookAt = useRef<THREE\.Vector3>\(new THREE\.Vector3\(0, 1\.5, 0\)\);/, '');
applyFix('apps/web/src/components/shared/SpatialHub.tsx', 223, /const \[isLowEnd, setIsLowEnd\] = useState\(false\);/, '');
// 79: apps/web/src/components/shared/SpatialScene.tsx:27
applyFix('apps/web/src/components/shared/SpatialScene.tsx', 27, /const { size, gl } = useThree\(\);/, 'useThree();');
applyFix('apps/web/src/components/shared/SpatialScene.tsx', 84, /useFrame\(\(\_, delta\) => {/, 'useFrame(() => {');
// 82: apps/web/src/components/shared/TipTapEditor.tsx:121
applyFix('apps/web/src/components/shared/TipTapEditor.tsx', 121, /placeholder = 'Type here\.\.\.',/, '');
// 83: apps/web/src/components/tickets/AttractionTicketCard.tsx:34
applyFix('apps/web/src/components/tickets/AttractionTicketCard.tsx', 34, /const { isRTL } = useLocale\(\);/, 'useLocale();');
// 84: apps/web/src/components/ui/B2CThemeComponents.tsx:513
applyFix('apps/web/src/components/ui/B2CThemeComponents.tsx', 513, /const { isAr } = useThemeContext\(\);/, 'useThemeContext();');
applyFix('apps/web/src/components/ui/B2CThemeComponents.tsx', 674, /const locale = useLocaleState\(\);/, 'useLocaleState();');
applyFix('apps/web/src/components/ui/B2CThemeComponents.tsx', 790, /const startDateStr = format\(new Date\(event\.startDate\), "MMM d"\);/, '');
// 87: apps/web/src/components/ui/MediaUploader.tsx:20
applyFix('apps/web/src/components/ui/MediaUploader.tsx', 20, /const \[progress, setProgress\] = useState\(0\);/, 'const [, setProgress] = useState(0);');
// 88: apps/web/src/lib/images.tsx:8
applyFix('apps/web/src/lib/images.tsx', 8, /url: string,/, '');
// 89: apps/web/src/lib/socket.ts:89
applyFix('apps/web/src/lib/socket.ts', 89, /const emits = \(\) => {/, '() => {');
