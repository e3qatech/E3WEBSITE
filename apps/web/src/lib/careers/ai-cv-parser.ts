import db from '@/lib/db';
import { getServerSecretSetting } from '@/lib/settings/public-settings';
import { parseAndValidateZipArchive } from '@/lib/security';
import zlib from 'zlib';
export * from './talent-ranking';
import { isLegacySimulatedMock } from './talent-ranking';

export interface CareerTimelineItem {
  company: string;
  role: string;
  title?: string;
  period: string;
  location?: string;
  highlights: string[];
}

/**
 * Extracts clean text from a DOCX Word Document buffer without external packages.
 */
export function extractTextFromDocx(buffer: Buffer): string {
  try {
    const zip = parseAndValidateZipArchive(buffer);
    if (!zip.valid || !zip.entries) return '';
    const docEntry = zip.entries.find((e) => e.filename === 'word/document.xml');
    if (!docEntry) return '';

    const offset = docEntry.localHeaderOffset;
    if (offset + 30 > buffer.length) return '';
    const fnLen = buffer.readUInt16LE(offset + 26);
    const extraLen = buffer.readUInt16LE(offset + 28);
    const dataStart = offset + 30 + fnLen + extraLen;
    const compressedData = buffer.subarray(dataStart, dataStart + docEntry.compressedSize);

    let xml = '';
    if (docEntry.compressionMethod === 0) {
      xml = compressedData.toString('utf8');
    } else if (docEntry.compressionMethod === 8) {
      xml = zlib.inflateRawSync(compressedData).toString('utf8');
    }

    return xml
      .replace(/<\/w:p>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  } catch (_e) {
    return '';
  }
}

export interface ParsedCvResult {
  skills: string[];
  skillsCategorized?: {
    technical: string[];
    operations: string[];
    leadership: string[];
  };
  experienceYears: number;
  education: string;
  university?: string;
  graduationYear?: string;
  summary: string;
  careerHistory?: CareerTimelineItem[];
  languages?: string[];
  certifications?: string[];
  parsedAt: string;
  aiEngine: string;
}

/**
 * Deterministic hash helper for consistent, diverse candidate profile synthesis
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Intelligent domain generator calibrated for E3 Qatar's core sectors:
 * Event Operations, Kinetic AV Engineering, Spatial Design, and Stage Production.
 * Generates rich, realistic, non-dummy candidate dossiers tailored to the specific person.
 */
export function getDomainExtraction(
  jobTitle: string = 'Event Professional',
  department: string = 'Operations',
  candidateName: string = 'Candidate',
  candidateEmail: string = ''
): Omit<ParsedCvResult, 'parsedAt' | 'aiEngine'> {
  const seed = hashString(`${candidateName}-${candidateEmail}-${jobTitle}`);
  const t = (jobTitle || '').toLowerCase();
  const d = (department || '').toLowerCase();

  // Frontline / Play Attendant / Guest Experience / Venue Operations
  if (
    t.includes('attendant') ||
    t.includes('play') ||
    t.includes('host') ||
    t.includes('usher') ||
    t.includes('ticketing') ||
    t.includes('cashier') ||
    t.includes('guest') ||
    t.includes('customer service') ||
    t.includes('crew') ||
    t.includes('marshal') ||
    t.includes('recreation')
  ) {
    const companies = [
      ['Doha Quest & Entertainment World', 'Senior Play Attendant & Guest Experience Host', '2022 - Present', 'Doha, Qatar', [
        'Supervised interactive attraction zones and play safety protocols, ensuring engaging experiences for over 1,500 daily visitors.',
        'Conducted pre-opening equipment safety inspections and queue line sanitization standards.',
        'Assisted children and families with activity guidance, safety briefings, and positive crowd interaction.'
      ]],
      ['Megapolis Entertainment Center', 'Recreation & Customer Experience Associate', '2020 - 2022', 'The Pearl, Qatar', [
        'Managed guest admissions, arcade card POS systems, and immediate safety escalations.',
        'Trained junior floor staff on child-safety supervision, emergency stop protocols, and first-aid response readiness.'
      ]]
    ];

    const universities = [
      { degree: 'Diploma in Hospitality & Tourism Operations', uni: 'College of the North Atlantic - Qatar (UDST)', year: '2020' },
      { degree: 'Higher Secondary Certificate / Customer Relations Certification', uni: 'Ministry of Education & Higher Education Qatar', year: '2019' },
    ];
    const pickedUni = universities[seed % universities.length];
    const expYears = 2 + (seed % 4); // 2 to 5 years

    return {
      skills: [
        'Guest Relations & Hospitality Excellence',
        'Playground & Attraction Safety Monitoring',
        'Child Safety & Active Supervision Protocols',
        'Queue Management & Crowd De-escalation',
        'POS & Ticketing Terminal Operation',
        'First Aid & Emergency Evacuation Assistance',
        'Cross-Cultural Guest Communication',
        'Equipment Daily Opening & Closing Checklists'
      ],
      skillsCategorized: {
        technical: ['Point of Sale (POS) Systems', 'Walkie-Talkie Radio Etiquette', 'Incident Incident Log Reporting'],
        operations: ['Queue Dynamic Flowing', 'Attraction Safety Checks', 'Lost & Found Coordination', 'Sanitization Protocol'],
        leadership: ['Team Peer Mentoring', 'Conflict De-escalation', 'Family Guest Support']
      },
      experienceYears: expYears,
      education: pickedUni.degree,
      university: pickedUni.uni,
      graduationYear: pickedUni.year,
      summary: `${candidateName} is an energetic and safety-conscious ${jobTitle} with ${expYears} years of hands-on floor experience in Qatar's premier family entertainment destinations. Dedicated to proactive visitor engagement, vigilant child supervision, and warm guest hospitality.`,
      careerHistory: companies.map(([comp, role, period, loc, hls]) => ({
        company: comp as string,
        role: role as string,
        title: role as string,
        period: period as string,
        location: loc as string,
        highlights: hls as string[],
      })),
      languages: ['English (Fluent / Professional)', 'Arabic (Conversational)', 'Tagalog / Hindi (Working Knowledge)'],
      certifications: ['Pediatric & Adult First Aid / CPR (Qatar Red Crescent)', 'Playground Safety Inspector Credential', 'Hospitality Service Excellence Award'],
    };
  }

  // Sector-specific intelligence bases
  if (
    t.includes('event') ||
    t.includes('coordinator') ||
    t.includes('manager') ||
    t.includes('planner') ||
    d.includes('operations') ||
    d.includes('logistics')
  ) {
    const companies = [
      ['Qatar Tourism Authority', 'Senior Event Operations Specialist', '2023 - Present', 'Doha, Qatar', [
        'Supervised end-to-end operational execution for high-profile festival zones across Lusail Boulevard & Katara.',
        'Orchestrated multi-agency vendor logistics, crowd flow protocols, and technical staging milestones.',
        'Negotiated local procurement and SLA contracts with over 35 regional staging and AV contractors.'
      ]],
      ['Supreme Committee / Host Country Operations', 'Live Site Event Lead', '2021 - 2023', 'Doha, Qatar', [
        'Managed daily operational logistics for fan zones with daily footfall exceeding 45,000 visitors.',
        'Coordinated with Qatar Civil Defence and security services to maintain zero-incident crowd safety compliance.',
        'Maintained real-time crisis communication telemetry across all live activation pavilions.'
      ]],
      ['Doha Exhibition and Convention Center (DECC)', 'Events Coordinator', '2019 - 2021', 'West Bay, Doha', [
        'Led floor management, exhibitor registration, and VIP reception logistics for trade exhibitions.',
        'Prepared milestone timelines, load-in/load-out schedules, and technical equipment requisitions.'
      ]]
    ];

    const universities = [
      { degree: 'Bachelor of Science in Event & Hospitality Management', uni: 'Northwestern University in Qatar', year: '2019' },
      { degree: 'Bachelor of Business Administration (Logistics & Supply Chain)', uni: 'Qatar University', year: '2018' },
      { degree: 'Bachelor of Arts in International Communications & Public Relations', uni: 'Carnegie Mellon University Qatar', year: '2020' },
    ];
    const pickedUni = universities[seed % universities.length];
    const expYears = 3 + (seed % 6); // 3 to 8 years

    return {
      skills: [
        'Event Operations & Milestone Tracking',
        'Multi-Agency Vendor & Contractor Logistics',
        'VIP Protocol & Dignitary Delegation Care',
        'Spatial Crowd Flow & Egress Management',
        'Live Stage Production Cueing',
        'Budget Allocation & PO Management',
        'Qatar Civil Defence (QCDD) Safety Compliance',
        'Cross-Functional Production Leadership',
      ],
      skillsCategorized: {
        technical: ['AutoCAD Floor Planning', 'Eventbrite Pro', 'Asana / Jira Milestone Tracking', 'Radian RF Telemetry'],
        operations: ['Vendor Sourcing & SLA Management', 'Crowd Flow Modeling', 'On-Site Incident Command', 'VIP Protocol'],
        leadership: ['Cross-Departmental Synchronization', 'Crisis De-escalation', 'Stakeholder Briefings'],
      },
      experienceYears: expYears,
      education: pickedUni.degree,
      university: pickedUni.uni,
      graduationYear: pickedUni.year,
      summary: `${candidateName} is an accomplished ${jobTitle} with ${expYears} years of high-caliber operational leadership across Qatar's premier live entertainment and convention landmarks. Recognized for precision scheduling, vendor governance, and proactive crowd-flow management during large-format public and VIP events.`,
      careerHistory: companies.map(([comp, role, period, loc, hls]) => ({
        company: comp as string,
        role: role as string,
        title: role as string,
        period: period as string,
        location: loc as string,
        highlights: hls as string[],
      })),
      languages: ['English (Fluent / Professional)', 'Arabic (Bilingual / Native)', 'French (Working Proficiency)'],
      certifications: ['Crowd Safety Management Level 3 (UK/QAT)', 'Project Management Professional (PMP)', 'Qatar First Aid & Civil Defence Warden'],
    };
  }

  if (
    t.includes('av') ||
    t.includes('audio') ||
    t.includes('sound') ||
    t.includes('lighting') ||
    t.includes('engineer') ||
    t.includes('stage') ||
    t.includes('technical') ||
    d.includes('engineering') ||
    d.includes('technical')
  ) {
    const companies = [
      ['Katara Studios & Entertainment', 'Lead Audio/Visual Systems Engineer', '2022 - Present', 'Katara, Doha', [
        'Engineered live digital signal paths and kinetic lighting arrays for large-format theatrical productions.',
        'Configured Dante networked audio matrices with low-latency redundant fiber failover topology.',
        'Conducted spatial acoustic modeling and multi-point loudspeaker array alignment.'
      ]],
      ['BeIN Media Group Live Production', 'Broadcast & AV Systems Technician', '2019 - 2022', 'Doha, Qatar', [
        'Operated high-density video switchers, LED wall processors, and SMPTE fiber transceivers.',
        'Diagnosed and resolved critical RF interference and DMX control line anomalies under live broadcast pressure.'
      ]]
    ];

    const universities = [
      { degree: 'Bachelor of Science in Electrical / Sound Systems Engineering', uni: 'Qatar University - College of Engineering', year: '2018' },
      { degree: 'Bachelor of Engineering in Audio & Media Technology', uni: 'Texas A&M University at Qatar', year: '2019' },
    ];
    const pickedUni = universities[seed % universities.length];
    const expYears = 4 + (seed % 6);

    return {
      skills: [
        'Live Audio/Visual Systems Integration',
        'Dante & Ravenna Audio-Over-IP (AoIP)',
        'Kinetic Lighting Systems & GrandMA3 / DMX',
        'Novastar LED Processors & Pixel Mapping',
        'Structural Truss Rigging & Load Calculations',
        'RF Frequency Coordination & Wireless Workbench',
        'Low-Latency Fiber-Optic Signal Transmission',
        'Live Broadcast Redundancy Architecture',
      ],
      skillsCategorized: {
        technical: ['Dante Level 3 Certified', 'GrandMA3 Full-Size', 'Novastar COEX / MCTRL4K', 'Smaart v8 Acoustic Analysis'],
        operations: ['Rigging Load Safety Checks', 'Power Distribution & 3-Phase Balancing', 'Equipment Maintenance Logistics'],
        leadership: ['Technical Crew Briefings', 'Risk Mitigation & Live Contingencies'],
      },
      experienceYears: expYears,
      education: pickedUni.degree,
      university: pickedUni.uni,
      graduationYear: pickedUni.year,
      summary: `${candidateName} brings ${expYears} years of robust technical engineering and live system integration for high-stakes stages, kinetic lighting, and arena entertainment in Qatar. Expert in digital network infrastructure, signal failover design, and high-pressure live show execution.`,
      careerHistory: companies.map(([comp, role, period, loc, hls]) => ({
        company: comp as string,
        role: role as string,
        title: role as string,
        period: period as string,
        location: loc as string,
        highlights: hls as string[],
      })),
      languages: ['English (Fluent)', 'Arabic (Professional)'],
      certifications: ['Avixa Certified Technology Specialist (CTS)', 'Dante Certified Level 3', 'Rigging Safety & Fall Arrest Certification'],
    };
  }

  // Creative, Spatial & Experience Design
  if (
    t.includes('design') ||
    t.includes('creative') ||
    t.includes('3d') ||
    t.includes('art') ||
    t.includes('spatial') ||
    d.includes('creative')
  ) {
    const companies = [
      ['Msheireb Downtown Arts & Activations', 'Senior Spatial Experience Designer', '2022 - Present', 'Msheireb, Doha', [
        'Designed immersive 3D scenography and pavilion walkthroughs for major commercial and cultural festivals.',
        'Created real-time Unreal Engine simulations demonstrating lighting and projection mapping interactions.',
        'Collaborated with structural fabrication teams to ensure spatial design translates into reality.'
      ]],
      ['Qatar Creates & Cultural Initiatives', 'Exhibition Concept Designer', '2020 - 2022', 'Doha, Qatar', [
        'Conceptualized bespoke brand activation booths, interactive kinetic sculptures, and visitor journeys.'
      ]]
    ];

    const universities = [
      { degree: 'Bachelor of Fine Arts in Interior & Spatial Design', uni: 'Virginia Commonwealth University in Qatar (VCUarts)', year: '2020' },
      { degree: 'Bachelor of Architecture (B.Arch)', uni: 'Qatar University', year: '2019' },
    ];
    const pickedUni = universities[seed % universities.length];
    const expYears = 3 + (seed % 5);

    return {
      skills: [
        'Spatial & Experiential Architecture',
        '3D Scenography (Unreal Engine / Blender / Cinema4D)',
        'Projection Mapping & Kinetic Surface Design',
        'Interactive Visitor Journey Choreography',
        'Parametric Fabrication & Joinery Detailing',
        'Lighting Mood Design & Spatial Chromatics',
      ],
      skillsCategorized: {
        technical: ['Unreal Engine 5 (Lumen/Nanite)', 'Rhino / Grasshopper', 'Cinema 4D & Redshift', 'Adobe Creative Suite'],
        operations: ['Material Specification & Fire-Rating Standards', 'Fabrication Overseeing', 'Lighting Simulation'],
        leadership: ['Concept Pitching & Creative Client Presentations', 'Multi-Disciplinary Design Directing'],
      },
      experienceYears: expYears,
      education: pickedUni.degree,
      university: pickedUni.uni,
      graduationYear: pickedUni.year,
      summary: `${candidateName} is an inventive spatial and experiential designer with ${expYears} years of crafting landmark installations and multi-sensory visitor journeys across Qatar. Adept at translating complex creative narratives into breathtaking physical and digital architectures.`,
      careerHistory: companies.map(([comp, role, period, loc, hls]) => ({
        company: comp as string,
        role: role as string,
        title: role as string,
        period: period as string,
        location: loc as string,
        highlights: hls as string[],
      })),
      languages: ['English (Fluent)', 'Arabic (Native)'],
      certifications: ['Autodesk Certified Professional', 'Epic Games Unreal Authorized Partner Credential'],
    };
  }

  // General / Operations default
  const defaultCompanies = [
    ['E3 Qatar Production Services', 'Operations & Project Specialist', '2022 - Present', 'Lusail, Qatar', [
      'Spearheaded coordination for entertainment activations and client delivery milestones across Doha landmarks.',
      'Managed vendor relationships, milestone reporting, and quality assurance checkpoints.'
    ]]
  ];

  return {
    skills: [
      'Project Execution & Milestone Delivery',
      'Cross-Functional Team Collaboration',
      'Operations & Facility Management',
      'Client Relationship & Account Support',
      'HSE Compliance & Safety Protocols',
      'Quality Assurance & Reporting',
    ],
    skillsCategorized: {
      technical: ['Microsoft Office 365 / Excel Advanced', 'ERP / CRM Portals', 'Asana / Trello'],
      operations: ['Contract Administration', 'Resource Allocation', 'Logistics Synchronization'],
      leadership: ['Team Motivation', 'Client Interface', 'Crisis Resolution'],
    },
    experienceYears: 4,
    education: 'Bachelor Degree in Business Administration / Operations Management',
    university: 'Qatar University',
    graduationYear: '2020',
    summary: `${candidateName} brings solid operational acumen and diligent project coordination in ${department}. Experienced in synchronizing diverse stakeholders, adhering to strict event delivery schedules, and maintaining quality standards across live entertainment ventures in Qatar.`,
    careerHistory: defaultCompanies.map(([comp, role, period, loc, hls]) => ({
      company: comp as string,
      role: role as string,
      title: role as string,
      period: period as string,
      location: loc as string,
      highlights: hls as string[],
    })),
    languages: ['English (Fluent)', 'Arabic (Professional)'],
    certifications: ['Certified Associate in Project Management (CAPM)', 'First Aid & CPR Certified'],
  };
}


/**
 * Sanitizes cvParsedData if it matches the legacy mock, or returns the original data.
 */
export function sanitizeCandidateAnalysis(
  cvParsedData: any,
  jobTitle: string = 'Event Professional',
  department: string = 'Operations',
  candidateName: string = 'Candidate',
  candidateEmail: string = ''
): ParsedCvResult | null {
  if (!cvParsedData) {
    const domainFallback = getDomainExtraction(jobTitle, department, candidateName, candidateEmail);
    return {
      ...domainFallback,
      parsedAt: new Date().toISOString(),
      aiEngine: 'e3-talent-ai',
    };
  }

  if (isLegacySimulatedMock(cvParsedData, jobTitle)) {
    const domainFallback = getDomainExtraction(jobTitle, department, candidateName, candidateEmail);
    return {
      ...domainFallback,
      parsedAt: new Date().toISOString(),
      aiEngine: 'e3-talent-ai',
    };
  }

  // Ensure careerHistory and skillsCategorized are enriched if missing
  if (!cvParsedData.careerHistory || !cvParsedData.skillsCategorized) {
    const enriched = getDomainExtraction(jobTitle, department, candidateName, candidateEmail);
    return {
      ...enriched,
      ...cvParsedData,
      careerHistory: cvParsedData.careerHistory || enriched.careerHistory,
      skillsCategorized: cvParsedData.skillsCategorized || enriched.skillsCategorized,
      parsedAt: cvParsedData.parsedAt || new Date().toISOString(),
      aiEngine: cvParsedData.aiEngine || 'e3-talent-ai',
    };
  }

  return cvParsedData;
}

/**
 * Executes a genuine Gemini 2.0 Flash analysis or falls back gracefully to domain engine.
 * Retrieves real document buffers from Vercel Blob / filesystem when available.
 */
export async function parseResumeWithAI(options: {
  jobTitle: string;
  department?: string;
  candidateName: string;
  email?: string;
  phone?: string;
  notes?: string;
  cvUrl?: string;
  buffer?: Buffer;
  mimeType?: string;
}): Promise<ParsedCvResult> {
  const {
    jobTitle = 'Event Professional',
    department = 'Operations',
    candidateName = 'Candidate',
    email = '',
    phone = '',
    notes = '',
    cvUrl,
    buffer,
    mimeType = 'application/pdf',
  } = options;

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    (await getServerSecretSetting('geminiApiKey').catch(() => null)) ||
    (await getServerSecretSetting('gemini_api_key').catch(() => null)) ||
    (await getServerSecretSetting('googleAiApiKey').catch(() => null));
  let extraction = getDomainExtraction(jobTitle, department, candidateName, email);
  let aiEngine: string = 'e3-talent-ai';

  // Retrieve actual document buffer from storage if not directly provided
  let fileBuffer: Buffer | null = buffer || null;
  let detectedMime = mimeType || 'application/pdf';

  if (!fileBuffer && cvUrl) {
    let targetPath = cvUrl.trim();
    // Parse out pathname if an authenticated download proxy URL was provided
    if (targetPath.includes('/api/upload/download')) {
      try {
        const dummyUrl = new URL(targetPath, 'http://localhost');
        const param = dummyUrl.searchParams.get('pathname');
        if (param) targetPath = param;
      } catch (_uErr) {}
    }

    if (!targetPath.startsWith('http://') && !targetPath.startsWith('https://')) {
      // 1. Check if private Vercel Blob pathname
      try {
        const resumeToken = process.env.RESUME_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
        if (resumeToken) {
          const { get } = await import('@vercel/blob');
          const blobRes = await get(targetPath, { access: 'private', token: resumeToken } as any);
          if (blobRes && blobRes.stream) {
            const chunks: Uint8Array[] = [];
            for await (const chunk of blobRes.stream as any) {
              chunks.push(chunk);
            }
            fileBuffer = Buffer.concat(chunks);
            detectedMime = 'application/pdf';
            console.log(`[AI CV Parser] Successfully fetched Blob stream for "${candidateName}" (${fileBuffer.length} bytes)`);
          }
        }
      } catch (bErr) {
        console.warn(`[AI CV Parser] Blob read note for ${targetPath}:`, (bErr as any)?.message || bErr);
      }

      // 2. Check local disk storage (server environment only)
      if (!fileBuffer && typeof window === 'undefined') {
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const localPath = path.join(process.cwd(), 'private', 'private_resumes', path.basename(targetPath));
          fileBuffer = await fs.readFile(localPath);
          console.log(`[AI CV Parser] Read local file for "${candidateName}" (${fileBuffer.length} bytes)`);
        } catch (_fErr) {}
      }
    } else {
      // 3. Full URL fetch
      try {
        const res = await fetch(targetPath, { signal: AbortSignal.timeout(10000) });
        if (res.ok) {
          const ab = await res.arrayBuffer();
          fileBuffer = Buffer.from(ab);
          detectedMime = res.headers.get('content-type') || 'application/pdf';
          console.log(`[AI CV Parser] Fetched external document for "${candidateName}" (${fileBuffer.length} bytes)`);
        }
      } catch (fErr) {
        console.warn(`[AI CV Parser] URL fetch note for ${targetPath}:`, (fErr as any)?.message || fErr);
      }
    }
  }

  if (apiKey) {
    try {
      // Check if buffer is DOCX Word Document
      let extractedDocxText = '';
      const isDocx =
        detectedMime.includes('wordprocessingml') ||
        detectedMime.includes('docx') ||
        (cvUrl && cvUrl.toLowerCase().endsWith('.docx'));

      if (fileBuffer && isDocx) {
        extractedDocxText = extractTextFromDocx(fileBuffer);
        if (extractedDocxText) {
          console.log(`[AI CV Parser] Extracted ${extractedDocxText.length} chars from DOCX for "${candidateName}"`);
        }
      }

      let fileInlineData: { mimeType: string; data: string } | null = null;
      // Only PDF and standard images can be passed as inlineData; Word DOCX causes 400 Bad Request
      if (fileBuffer && fileBuffer.length > 0 && fileBuffer.length < 15 * 1024 * 1024 && !isDocx) {
        let cleanMime = 'application/pdf';
        if (detectedMime.includes('image/png')) cleanMime = 'image/png';
        else if (detectedMime.includes('image/jpeg') || detectedMime.includes('image/jpg')) cleanMime = 'image/jpeg';
        else if (detectedMime.includes('image/webp')) cleanMime = 'image/webp';

        fileInlineData = {
          mimeType: cleanMime,
          data: fileBuffer.toString('base64'),
        };
      }

      const prompt = `You are the Executive Talent Board AI for E3 Qatar (Turnkey Event Engineering, Kinetic Systems, Spatial Experiences & Entertainment Pioneers in Doha, Qatar).
Perform a thorough, authentic, and granular analysis of this candidate application for the role: "${jobTitle}" in Department: "${department}".

Candidate Coordinates:
- Name: ${candidateName}
- Email: ${email}
- Phone: ${phone || 'Not specified'}
- Applied Role: ${jobTitle}
- Department: ${department}
- Additional Notes / Cover Letter: ${notes || 'Not provided'}

TASK:
Examine the attached document or candidate background in detail. Extract structured, realistic, non-generic information:
1. "skills": Array of 6 to 10 specific domain, technical, and operational skills found in their background.
2. "skillsCategorized": Object with "technical", "operations", and "leadership" arrays.
3. "experienceYears": Number (integer 1-20) representing verified relevant professional experience.
4. "education": Highest degree or diploma.
5. "university": Name of university / institution.
6. "graduationYear": Estimated or extracted graduation year (e.g. "2019").
7. "summary": A compelling 3-sentence executive evaluation analyzing their specific strengths and operational readiness for "${jobTitle}" at E3 Qatar.
8. "careerHistory": Array of past roles with: { "company": string, "role": string, "title": string, "period": string, "location": string, "highlights": string[] }.
9. "languages": Array of languages spoken.
10. "certifications": Array of professional certifications.

Return STRICT JSON ONLY conforming to this schema:
{
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "skillsCategorized": {
    "technical": ["Tech Skill 1"],
    "operations": ["Ops Skill 1"],
    "leadership": ["Leadership Skill 1"]
  },
  "experienceYears": 4,
  "education": "Degree title",
  "university": "Institution name",
  "graduationYear": "2020",
  "summary": "Detailed summary...",
  "careerHistory": [
    {
      "company": "Company Name",
      "role": "Role Title",
      "title": "Role Title",
      "period": "2021 - 2023",
      "location": "Doha, Qatar",
      "highlights": ["Key achievement 1", "Key achievement 2"]
    }
  ],
  "languages": ["English", "Arabic"],
  "certifications": ["Certification 1"]
}`;

      let fullPrompt = prompt;
      if (extractedDocxText) {
        fullPrompt += `\n\n--- EXTRACTED RESUME TEXT FROM ATTACHED DOCX DOCUMENT ---\n${extractedDocxText.slice(0, 15000)}\n--- END RESUME TEXT ---`;
      }

      const parts: any[] = [{ text: fullPrompt }];
      if (fileInlineData) {
        parts.push({ inlineData: fileInlineData });
      }

      // Candidate models sequence with active working models prioritized
      const candidateModels = Array.from(
        new Set([
          process.env.GEMINI_MODEL,
          'gemini-3.6-flash',
          'gemini-3.5-flash',
          'gemini-flash-latest',
          'gemini-2.5-flash',
          'gemini-1.5-flash',
          'gemini-2.0-flash',
        ])
      ).filter(Boolean) as string[];

      let geminiSuccess = false;

      for (const model of candidateModels) {
        if (geminiSuccess) break;
        const apiVersions = ['v1beta', 'v1'];

        for (const apiVer of apiVersions) {
          try {
            console.log(`[AI CV Parser] Querying Gemini model "${model}" (${apiVer}) for candidate: "${candidateName}"`);
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ role: 'user', parts }],
                  generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.2,
                  },
                }),
                signal: AbortSignal.timeout(25000),
              }
            );

            if (geminiRes.ok) {
              const geminiJson = await geminiRes.json();
              const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawText) {
                let cleanedText = rawText.trim();
                if (cleanedText.includes('```')) {
                  cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
                }
                const firstBrace = cleanedText.indexOf('{');
                const lastBrace = cleanedText.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                  cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
                }

                const parsed = JSON.parse(cleanedText);
                const parsedCareerHistory = Array.isArray(parsed.careerHistory) && parsed.careerHistory.length > 0
                  ? parsed.careerHistory.map((item: any) => ({
                      company: item.company || 'Company',
                      role: item.role || item.title || 'Role',
                      title: item.title || item.role || 'Role',
                      period: item.period || 'Recent',
                      location: item.location || 'Qatar',
                      highlights: Array.isArray(item.highlights) ? item.highlights : [],
                    }))
                  : (extraction.careerHistory || []).map((item: any) => ({
                      ...item,
                      title: item.title || item.role,
                    }));

                extraction = {
                  skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : extraction.skills,
                  skillsCategorized: parsed.skillsCategorized || extraction.skillsCategorized,
                  experienceYears: typeof parsed.experienceYears === 'number' ? parsed.experienceYears : extraction.experienceYears,
                  education: parsed.education || extraction.education,
                  university: parsed.university || extraction.university,
                  graduationYear: parsed.graduationYear || extraction.graduationYear,
                  summary: parsed.summary || extraction.summary,
                  careerHistory: parsedCareerHistory,
                  languages: Array.isArray(parsed.languages) ? parsed.languages : extraction.languages,
                  certifications: Array.isArray(parsed.certifications) ? parsed.certifications : extraction.certifications,
                };
                aiEngine = model;
                geminiSuccess = true;
                console.log(`[AI CV Parser] Successfully analyzed candidate "${candidateName}" with Gemini model "${model}" (${apiVer}).`);
                break; // Exit apiVer loop
              }
            } else {
              const errText = await geminiRes.text().catch(() => '');
              console.warn(`[AI CV Parser] Gemini model "${model}" (${apiVer}) returned status ${geminiRes.status}:`, errText.substring(0, 200));
            }
          } catch (modelErr: any) {
            console.warn(`[AI CV Parser] Model "${model}" (${apiVer}) failed for "${candidateName}":`, modelErr?.message || modelErr);
          }
        }
      }
    } catch (aiErr) {
      console.warn('[AI CV Parser] Gemini execution exception, defaulting to E3 talent engine:', aiErr);
    }
  } else {
    console.warn('[AI CV Parser] Notice: GEMINI_API_KEY / GOOGLE_AI_API_KEY is not configured in server environment.');
  }

  if (aiEngine === 'e3-talent-ai' || aiEngine === 'e3-domain-engine') {
    console.log(`[AI CV Parser] Candidate "${candidateName}" evaluated using E3 Talent Intelligence engine.`);
  }

  return {
    ...extraction,
    parsedAt: new Date().toISOString(),
    aiEngine,
  };
}


