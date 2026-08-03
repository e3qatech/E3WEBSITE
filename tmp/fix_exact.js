const fs = require('fs');

function fixLine(file, lineNum, oldStr, newStr) {
  const fullPath = `A:\\.gemini\\antigravity\\scratch\\E3 WEBSITE\\e3-qatar\\${file}`;
  if (!fs.existsSync(fullPath)) return;
  const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
  const lineIdx = lineNum - 1;
  if (lines[lineIdx].includes(oldStr)) {
    lines[lineIdx] = lines[lineIdx].replace(oldStr, newStr);
    fs.writeFileSync(fullPath, lines.join('\n'));
    console.log(`Fixed ${file}:${lineNum}`);
  } else {
    console.log(`Mismatch on ${file}:${lineNum} - Expected to find "${oldStr}" in: ${lines[lineIdx]}`);
  }
}

// apps/web/prisma/seed-events.ts
fixLine('apps/web/prisma/seed-events.ts', 228, 'const { startDate, endDate, status, ...rest }', 'const { ...rest }');
fixLine('apps/web/prisma/seed-events.ts', 249, 'const { eventId, ...catData } = ec;', 'const { eventId: _eventId, ...catData } = ec;');

// apps/web/server.js
fixLine('apps/web/server.js', 37, '} catch(e) {', '} catch {');
fixLine('apps/web/server.js', 46, '} catch(err) {', '} catch {');

// apps/web/src/app/[locale]/b2b/case-studies/page.tsx
fixLine('apps/web/src/app/[locale]/b2b/case-studies/page.tsx', 115, 'studies.map((study, i)', 'studies.map((study)');

// apps/web/src/app/[locale]/b2b/feedback/page.tsx
fixLine('apps/web/src/app/[locale]/b2b/feedback/page.tsx', 10, 'export default function B2BFeedbackPage({ params }: { params: any }) {', 'export default function B2BFeedbackPage() {');

// apps/web/src/app/[locale]/b2b/team/[slug]/page.tsx
fixLine('apps/web/src/app/[locale]/b2b/team/[slug]/page.tsx', 10, '  const { params } = props;', '');
fixLine('apps/web/src/app/[locale]/b2b/team/[slug]/page.tsx', 18, '  const { slug } = await props.params;', '  await props.params;');

// apps/web/src/app/[locale]/b2c/attractions/[slug]/page.tsx
fixLine('apps/web/src/app/[locale]/b2c/attractions/[slug]/page.tsx', 148, '  const { isRTL } = useLocale();', '  useLocale();');
fixLine('apps/web/src/app/[locale]/b2c/attractions/[slug]/page.tsx', 156, '  const { operations, gallery, offers, ...attractionData } = attraction;', '  const { operations: _o, gallery, offers, ...attractionData } = attraction;');

// apps/web/src/app/[locale]/b2c/attractions/page.tsx
fixLine('apps/web/src/app/[locale]/b2c/attractions/page.tsx', 197, '  const { isRTL } = useLocale();', '  useLocale();');

// apps/web/src/app/[locale]/b2c/contact/page.tsx
fixLine('apps/web/src/app/[locale]/b2c/contact/page.tsx', 12, "const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';", "");
fixLine('apps/web/src/app/[locale]/b2c/contact/page.tsx', 57, "} catch (e) {", "} catch {");

// apps/web/src/app/[locale]/layout.tsx
fixLine('apps/web/src/app/[locale]/layout.tsx', 10, '  const { locale } = await props.params;', '  await props.params;');

// apps/web/src/app/api/calendar/route.ts
fixLine('apps/web/src/app/api/calendar/route.ts', 76, "  const reqStart = searchParams.get('start');", "");
fixLine('apps/web/src/app/api/calendar/route.ts', 77, "  const reqEnd = searchParams.get('end');", "");

// apps/web/src/app/api/cases/[id]/route.ts
fixLine('apps/web/src/app/api/cases/[id]/route.ts', 48, '  const duration = Date.now() - startTime;', '');

// apps/web/src/app/api/cases/route.ts
fixLine('apps/web/src/app/api/cases/route.ts', 19, '  const duration = Date.now() - startTime;', '');

// apps/web/src/app/api/crm/leads/route.ts
fixLine('apps/web/src/app/api/crm/leads/route.ts', 62, '        const { notes, ...leadData } = body;', '        const { notes: _n, ...leadData } = body;');

// apps/web/src/app/api/services/route.ts
fixLine('apps/web/src/app/api/services/route.ts', 11, '    const body = await req.json();', '    await req.json();');

// apps/web/src/app/api/upload/route.ts
fixLine('apps/web/src/app/api/upload/route.ts', 80, '    const tokenPayload = await verifyToken(token);', '    await verifyToken(token);');

// apps/web/src/app/dashboard/careers/[id]/page.tsx
fixLine('apps/web/src/app/dashboard/careers/[id]/page.tsx', 43, '              {candidate.timeline.map((item, i) => (', '              {candidate.timeline.map((_item, i) => (');

// apps/web/src/components/attractions/detail/LiveBookingCard.tsx
fixLine('apps/web/src/components/attractions/detail/LiveBookingCard.tsx', 31, '  schedule: any', '  _schedule: any');

// apps/web/src/components/b2b/CaseStudyDetailClient.tsx
fixLine('apps/web/src/components/b2b/CaseStudyDetailClient.tsx', 152, '  const { gallery, ...rest } = caseStudy;', '  const { gallery: _g, ...rest } = caseStudy;');

// apps/web/src/components/b2b/ServiceDetailClient.tsx
fixLine('apps/web/src/components/b2b/ServiceDetailClient.tsx', 22, '  const { scrollYProgress } = useScroll();', '  useScroll();');
fixLine('apps/web/src/components/b2b/ServiceDetailClient.tsx', 35, "  const [activeSection, setActiveSection] = useState('overview');", "  const [activeSection] = useState('overview');");
fixLine('apps/web/src/components/b2b/ServiceDetailClient.tsx', 60, '} catch(e) {', '} catch {');

// apps/web/src/components/b2b/detail/DynamicCTA.tsx
fixLine('apps/web/src/components/b2b/detail/DynamicCTA.tsx', 18, '  const { isRTL } = useLocale();', '  useLocale();');

// apps/web/src/components/b2b/detail/ServiceHero.tsx
fixLine('apps/web/src/components/b2b/detail/ServiceHero.tsx', 33, '  const [isVideoPlaying, setIsVideoPlaying] = useState(false);', '');
fixLine('apps/web/src/components/b2b/detail/ServiceHero.tsx', 33, '  const [isVideoPlaying, setIsVideoPlaying] = useState(false);', '');

// apps/web/src/components/b2b/detail/ServiceRichText.tsx
fixLine('apps/web/src/components/b2b/detail/ServiceRichText.tsx', 22, '  const { isRTL } = useLocale();', '  useLocale();');

// apps/web/src/components/b2b/detail/SimilarProjects.tsx
fixLine('apps/web/src/components/b2b/detail/SimilarProjects.tsx', 22, '  const { isRTL } = useLocale();', '  useLocale();');

// apps/web/src/components/b2c/ContactClient.tsx
fixLine('apps/web/src/components/b2c/ContactClient.tsx', 32, '  const { theme, isAr } = useThemeContext();', '  useThemeContext();');
fixLine('apps/web/src/components/b2c/ContactClient.tsx', 218, '  const { theme } = useThemeContext();', '  useThemeContext();');

// apps/web/src/components/b2c/DiscoverClient.tsx
fixLine('apps/web/src/components/b2c/DiscoverClient.tsx', 20, "import { ModelViewer } from '@/components/shared/ModelViewer';", "");
fixLine('apps/web/src/components/b2c/DiscoverClient.tsx', 34, '  const { theme } = useThemeContext();', '  useThemeContext();');
fixLine('apps/web/src/components/b2c/DiscoverClient.tsx', 382, "    const accentHex = theme === 'dark' ? '#8A2BE2' : '#6A5ACD';", "");

// apps/web/src/components/b2c/TeamClient.tsx
fixLine('apps/web/src/components/b2c/TeamClient.tsx', 51, '        {departments.map((department, i) => (', '        {departments.map((department) => (');

// apps/web/src/components/b2c/TeamMemberClient.tsx
fixLine('apps/web/src/components/b2c/TeamMemberClient.tsx', 28, '  const bgXSpring = useSpring(mouseX, { stiffness: 100, damping: 30 });', '');
fixLine('apps/web/src/components/b2c/TeamMemberClient.tsx', 29, '  const bgYSpring = useSpring(mouseY, { stiffness: 100, damping: 30 });', '');

// apps/web/src/components/calendar/CalendarView.tsx
fixLine('apps/web/src/components/calendar/CalendarView.tsx', 41, '  const month = currentDate.getMonth();', '');
fixLine('apps/web/src/components/calendar/CalendarView.tsx', 42, '  const year = currentDate.getFullYear();', '');

// apps/web/src/components/calendar/EventCard.tsx
fixLine('apps/web/src/components/calendar/EventCard.tsx', 32, '  onSelectTickets,', '');

// apps/web/src/components/calendar/TicketSelectionModal.tsx
fixLine('apps/web/src/components/calendar/TicketSelectionModal.tsx', 80, '                {Array.from({ length: count }).map((_, i) => (', '                {Array.from({ length: count }).map((_ign, i) => (');

// apps/web/src/components/contact/ContactTabs.tsx
fixLine('apps/web/src/components/contact/ContactTabs.tsx', 20, '  const { isRTL } = useLocale();', '  useLocale();');

// apps/web/src/components/contact/FeedbackForm.tsx
fixLine('apps/web/src/components/contact/FeedbackForm.tsx', 20, '  const { isRTL } = useLocale();', '  useLocale();');

// apps/web/src/components/contact/SupportForm.tsx
fixLine('apps/web/src/components/contact/SupportForm.tsx', 27, '  const { isRTL } = useLocale();', '  useLocale();');

// apps/web/src/components/dashboard/KanbanBoard.tsx
fixLine('apps/web/src/components/dashboard/KanbanBoard.tsx', 58, '    } catch (e) {', '    } catch {');
fixLine('apps/web/src/components/dashboard/KanbanBoard.tsx', 128, '  const [isSyncing, setIsSyncing] = useState(false);', '');

// apps/web/src/components/dashboard/SystemBroadcastBanner.tsx
fixLine('apps/web/src/components/dashboard/SystemBroadcastBanner.tsx', 21, '  const { isConnected } = useSocket();', '  useSocket();');

// apps/web/src/components/dashboard/b2b/CaseEditor.tsx
fixLine('apps/web/src/components/dashboard/b2b/CaseEditor.tsx', 46, '  const [servicesUsed, setServicesUsed] = useState<string[]>(caseStudy?.servicesUsed || []);', '  const [servicesUsed] = useState<string[]>(caseStudy?.servicesUsed || []);');

// apps/web/src/components/dashboard/b2c/AttractionEditForm.tsx
fixLine('apps/web/src/components/dashboard/b2c/AttractionEditForm.tsx', 55, '  const [offers, setOffers] = useState<any[]>(initialData.offers || []);', '  const [offers] = useState<any[]>(initialData.offers || []);');
fixLine('apps/web/src/components/dashboard/b2c/AttractionEditForm.tsx', 61, '  const [socialLinks, setSocialLinks] = useState<any>(initialData.socialLinks || {});', '  const [socialLinks] = useState<any>(initialData.socialLinks || {});');
fixLine('apps/web/src/components/dashboard/b2c/AttractionEditForm.tsx', 64, '  const [temporalRules, setTemporalRules] = useState<any[]>(initialData.temporalRules || []);', '  const [temporalRules] = useState<any[]>(initialData.temporalRules || []);');

// apps/web/src/components/dashboard/b2c/AttractionEditor.tsx
fixLine('apps/web/src/components/dashboard/b2c/AttractionEditor.tsx', 34, '  const [isFeatured, setIsFeatured] = useState(attraction?.isFeatured || false);', '  const [isFeatured] = useState(attraction?.isFeatured || false);');
fixLine('apps/web/src/components/dashboard/b2c/AttractionEditor.tsx', 35, '  const [isHidden, setIsHidden] = useState(attraction?.isHidden || false);', '  const [isHidden] = useState(attraction?.isHidden || false);');

// apps/web/src/components/dashboard/crm/TalentDetail.tsx
fixLine('apps/web/src/components/dashboard/crm/TalentDetail.tsx', 33, '  const [talent, setTalent] = useState<any>(initialData);', '  const [talent] = useState<any>(initialData);');

// apps/web/src/components/dashboard/crm/TalentTable.tsx
fixLine('apps/web/src/components/dashboard/crm/TalentTable.tsx', 24, '  const [data, setData] = useState(initialData);', '  const [data] = useState(initialData);');

// apps/web/src/components/dashboard/ui/AdminSidebar.tsx
fixLine('apps/web/src/components/dashboard/ui/AdminSidebar.tsx', 94, '  const { resolvedTheme } = useTheme();', '  useTheme();');

// apps/web/src/components/home/PortalGateway.tsx
fixLine('apps/web/src/components/home/PortalGateway.tsx', 30, '  const mounted = useMounted();', '  useMounted();');

// apps/web/src/components/layout/PortalSwitcher.tsx
fixLine('apps/web/src/components/layout/PortalSwitcher.tsx', 11, "  const t = useTranslations('PortalSwitcher');", "  useTranslations('PortalSwitcher');");

// apps/web/src/components/shared/ARScene.tsx
fixLine('apps/web/src/components/shared/ARScene.tsx', 26, 'export function ARScene( { isARMode }: { isARMode: boolean } ) {', 'export function ARScene( _props: { isARMode: boolean } ) {');
fixLine('apps/web/src/components/shared/ARScene.tsx', 34, '  const [rotation, setRotation] = useState(0);', '');

// apps/web/src/components/shared/ARViewer.tsx
fixLine('apps/web/src/components/shared/ARViewer.tsx', 27, "import { Loader } from 'lucide-react';", "");
fixLine('apps/web/src/components/shared/ARViewer.tsx', 47, '    } catch (error) {', '    } catch {');
fixLine('apps/web/src/components/shared/ARViewer.tsx', 50, '    } catch (errorInfo) {', '    } catch {');

// apps/web/src/components/shared/MeetingBookingForm.tsx
fixLine('apps/web/src/components/shared/MeetingBookingForm.tsx', 18, '  const { isRTL } = useLocale();', '  useLocale();');

// apps/web/src/components/shared/SpatialHub.tsx
fixLine('apps/web/src/components/shared/SpatialHub.tsx', 202, '  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.5, 0));', '');
fixLine('apps/web/src/components/shared/SpatialHub.tsx', 223, '  const [isLowEnd, setIsLowEnd] = useState(false);', '');

// apps/web/src/components/shared/SpatialScene.tsx
fixLine('apps/web/src/components/shared/SpatialScene.tsx', 27, '  const { size, gl } = useThree();', '  useThree();');
fixLine('apps/web/src/components/shared/SpatialScene.tsx', 84, '  useFrame((_, delta) => {', '  useFrame(() => {');

// apps/web/src/components/shared/TipTapEditor.tsx
fixLine('apps/web/src/components/shared/TipTapEditor.tsx', 121, "      placeholder = 'Type here...',", "");

// apps/web/src/components/tickets/AttractionTicketCard.tsx
fixLine('apps/web/src/components/tickets/AttractionTicketCard.tsx', 34, '  const { isRTL } = useLocale();', '  useLocale();');

// apps/web/src/components/ui/B2CThemeComponents.tsx
fixLine('apps/web/src/components/ui/B2CThemeComponents.tsx', 513, '  const { isAr } = useThemeContext();', '  useThemeContext();');
fixLine('apps/web/src/components/ui/B2CThemeComponents.tsx', 674, '  const locale = useLocaleState();', '  useLocaleState();');
fixLine('apps/web/src/components/ui/B2CThemeComponents.tsx', 790, '  const startDateStr = format(new Date(event.startDate), "MMM d");', '');

// apps/web/src/components/ui/MediaUploader.tsx
fixLine('apps/web/src/components/ui/MediaUploader.tsx', 20, '  const [progress, setProgress] = useState(0);', '  const [, setProgress] = useState(0);');

// apps/web/src/lib/images.tsx
fixLine('apps/web/src/lib/images.tsx', 8, '  url: string,', '');

// apps/web/src/lib/socket.ts
fixLine('apps/web/src/lib/socket.ts', 89, '  const emits = () => {', '  () => {');
