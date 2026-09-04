export type InterviewFormat = 'VIRTUAL' | 'IN_PERSON';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'RESCHEDULE_REQUESTED' | 'CANCELLED';

export interface InterviewRecord {
  id: string;
  applicationId: string;
  jobTitle: string;
  department?: string;
  roundName: string; // e.g., 'Initial Screening', 'Technical AV Assessment', 'Executive Panel'
  format: InterviewFormat;
  scheduledAt: string; // ISO 8601
  durationMinutes: number;
  meetingUrl?: string; // Google Meet / Teams link
  location?: string; // e.g., 'E3 Qatar HQ - Level 24, Lusail Marina, Doha'
  interviewers: string[]; // Names of interviewers
  notes?: string;
  status: InterviewStatus;
  rescheduleReason?: string;
  rescheduleRequestedAt?: string;
  createdAt: string;
}

export interface TimelineMilestone {
  stage: number;
  key: 'SUBMITTED' | 'REVIEWING' | 'INTERVIEW' | 'DECISION';
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  statusColor: string;
}

/**
 * Extracts and flattens all interview records associated with a candidate's applications.
 */
export function extractCandidateInterviews(applications: any[]): InterviewRecord[] {
  const interviews: InterviewRecord[] = [];

  for (const app of applications || []) {
    const parsed = (app.cvParsedData as any) || {};
    const rawInterviews = Array.isArray(parsed.interviews) ? parsed.interviews : [];

    for (const raw of rawInterviews) {
      interviews.push({
        id: raw.id || `int-${Math.random().toString(36).slice(2, 9)}`,
        applicationId: app.id,
        jobTitle: app.jobTitle || 'Event Professional',
        department: app.department || undefined,
        roundName: raw.roundName || 'Interview Round',
        format: raw.format === 'IN_PERSON' ? 'IN_PERSON' : 'VIRTUAL',
        scheduledAt: raw.scheduledAt || new Date(Date.now() + 86400000 * 2).toISOString(),
        durationMinutes: raw.durationMinutes || 45,
        meetingUrl: raw.meetingUrl || (raw.format !== 'IN_PERSON' ? 'https://meet.google.com/e3q-hr-interview' : undefined),
        location: raw.location || (raw.format === 'IN_PERSON' ? 'E3 Qatar HQ - Lusail Marina, Doha' : undefined),
        interviewers: Array.isArray(raw.interviewers) && raw.interviewers.length > 0 ? raw.interviewers : ['HR Talent Lead', 'Production Director'],
        notes: raw.notes || undefined,
        status: (raw.status as InterviewStatus) || 'SCHEDULED',
        rescheduleReason: raw.rescheduleReason || undefined,
        rescheduleRequestedAt: raw.rescheduleRequestedAt || undefined,
        createdAt: raw.createdAt || app.createdAt || new Date().toISOString(),
      });
    }

    // Auto-generate virtual interview record if status is INTERVIEW but no specific interview object exists
    const statusUpper = (app.status || '').toUpperCase();
    if ((statusUpper === 'INTERVIEW' || statusUpper === 'SHORTLISTED') && rawInterviews.length === 0) {
      interviews.push({
        id: `auto-int-${app.id.slice(-6)}`,
        applicationId: app.id,
        jobTitle: app.jobTitle,
        department: app.department || undefined,
        roundName: 'Technical & Domain Assessment',
        format: 'VIRTUAL',
        scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        durationMinutes: 45,
        meetingUrl: 'https://meet.google.com/e3q-hr-interview',
        interviewers: ['HR Recruitment Lead', 'Department Supervisor'],
        notes: 'Please join 5 minutes prior to test your audio, camera, and prepare your project portfolio.',
        status: 'SCHEDULED',
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Sort upcoming interviews first
  return interviews.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

/**
 * Builds a 4-step canonical milestone progression for a candidate application.
 */
export function buildApplicationTimeline(application: any): TimelineMilestone[] {
  const status = (application?.status || 'NEW').toUpperCase();

  let currentStep = 1;
  if (status === 'UNDER_REVIEW' || status === 'REVIEWING') currentStep = 2;
  else if (status === 'INTERVIEW' || status === 'SHORTLISTED') currentStep = 3;
  else if (status === 'HIRED' || status === 'ACCEPTED' || status === 'REJECTED' || status === 'WITHDRAWN') currentStep = 4;

  const createdAt = application?.createdAt ? new Date(application.createdAt).toISOString() : undefined;
  const updatedAt = application?.updatedAt ? new Date(application.updatedAt).toISOString() : undefined;

  return [
    {
      stage: 1,
      key: 'SUBMITTED',
      titleEn: 'Application Submitted',
      titleAr: 'تم استلام الطلب',
      descEn: 'Candidate CV and credentials encrypted and verified.',
      descAr: 'تم تسجيل وتشفير ملف السيرة الذاتية بنجاح.',
      timestamp: createdAt,
      isCompleted: currentStep >= 1,
      isCurrent: currentStep === 1,
      statusColor: 'emerald',
    },
    {
      stage: 2,
      key: 'REVIEWING',
      titleEn: 'Technical & Domain Screening',
      titleAr: 'التقييم الفني والمراجعة',
      descEn: 'Qualifications evaluated by E3 Talent Acquisition.',
      descAr: 'مراجعة المهارات والمؤهلات من قبل فريق التوظيف.',
      timestamp: currentStep >= 2 ? updatedAt : undefined,
      isCompleted: currentStep >= 2,
      isCurrent: currentStep === 2,
      statusColor: 'amber',
    },
    {
      stage: 3,
      key: 'INTERVIEW',
      titleEn: 'Interview Round',
      titleAr: 'مرحلة المقابلة الشخصية',
      descEn: 'Domain assessment with E3 operations & production leads.',
      descAr: 'مقابلة فنية وتخصصية مع قيادة الإنتاج والعمليات.',
      timestamp: currentStep >= 3 ? updatedAt : undefined,
      isCompleted: currentStep >= 3,
      isCurrent: currentStep === 3,
      statusColor: 'purple',
    },
    {
      stage: 4,
      key: 'DECISION',
      titleEn: status === 'REJECTED' ? 'Application Concluded' : status === 'WITHDRAWN' ? 'Application Withdrawn' : status === 'HIRED' ? 'Offer & Onboarding' : 'Final Decision',
      titleAr: status === 'REJECTED' ? 'اكتمال الإجراء (غير مستوفٍ)' : status === 'WITHDRAWN' ? 'تم سحب الطلب' : status === 'HIRED' ? 'العرض والتعيين' : 'القرار النهائي',
      descEn: status === 'HIRED' ? 'Welcome to E3 Qatar Pioneers!' : status === 'REJECTED' ? 'Candidate not selected for this opening.' : 'Final candidate status concluded.',
      descAr: status === 'HIRED' ? 'مرحباً بك في فريق رواد الفعاليات بإي ثري!' : status === 'REJECTED' ? 'لم يتم اختيار المترشح لهذه الوظيفة.' : 'اكتمال مراحل إجراءات التوظيف.',
      timestamp: currentStep === 4 ? updatedAt : undefined,
      isCompleted: currentStep === 4,
      isCurrent: currentStep === 4,
      statusColor: status === 'HIRED' ? 'emerald' : status === 'REJECTED' ? 'zinc' : 'blue',
    },
  ];
}

/**
 * Generates human-readable time remaining until an interview.
 */
export function formatInterviewCountdown(scheduledAt: string, isAr = false): {
  isPast: boolean;
  label: string;
} {
  const target = new Date(scheduledAt).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return {
      isPast: true,
      label: isAr ? 'انتهت أو جارية الآن' : 'Past or In Progress',
    };
  }

  const hoursTotal = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hoursTotal / 24);
  const hours = hoursTotal % 24;
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return {
      isPast: false,
      label: isAr
        ? `خلال ${days} يوم و ${hours} ساعة`
        : `In ${days}d ${hours}h`,
    };
  }

  if (hours > 0) {
    return {
      isPast: false,
      label: isAr
        ? `خلال ${hours} ساعة و ${minutes} دقيقة`
        : `In ${hours}h ${minutes}m`,
    };
  }

  return {
    isPast: false,
    label: isAr
      ? `خلال ${minutes} دقيقة`
      : `In ${minutes}m`,
  };
}

/**
 * Creates an iCalendar (.ics) string for an interview.
 */
export function generateIcsCalendar(interview: InterviewRecord): string {
  const start = new Date(interview.scheduledAt);
  const end = new Date(start.getTime() + (interview.durationMinutes || 45) * 60000);

  const formatIcsDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const title = `E3 Qatar Interview: ${interview.jobTitle} - ${interview.roundName}`;
  const description = `Interview for ${interview.jobTitle} at E3 Qatar.\\nFormat: ${interview.format}\\nInterviewers: ${interview.interviewers.join(', ')}${interview.meetingUrl ? `\\nMeeting Link: ${interview.meetingUrl}` : ''}${interview.location ? `\\nLocation: ${interview.location}` : ''}`;
  const location = interview.format === 'IN_PERSON' ? (interview.location || 'E3 Qatar HQ, Lusail Marina, Doha') : (interview.meetingUrl || 'Virtual Video Call');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//E3 Qatar//Candidate Portal//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:e3-interview-${interview.id}@e3-qatar.com`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

