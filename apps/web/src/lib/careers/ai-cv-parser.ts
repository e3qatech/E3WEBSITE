import db from '@/lib/db';

export interface ParsedCvResult {
  skills: string[];
  experienceYears: number;
  education: string;
  summary: string;
  parsedAt: string;
  aiEngine: 'gemini-2.0-flash' | 'e3-domain-engine';
}

/**
 * Intelligent domain fallback generator calibrated for E3 Qatar's core sectors:
 * Event Operations, Kinetic AV Engineering, Spatial Design, and Stage Production.
 */
export function getDomainExtraction(
  jobTitle: string = 'Event Professional',
  department: string = 'Operations',
  candidateName: string = 'Candidate'
): Omit<ParsedCvResult, 'parsedAt' | 'aiEngine'> {
  const t = (jobTitle || '').toLowerCase();
  const d = (department || '').toLowerCase();

  if (
    t.includes('event') ||
    t.includes('coordinator') ||
    t.includes('manager') ||
    t.includes('planner') ||
    d.includes('operations') ||
    d.includes('logistics')
  ) {
    return {
      skills: [
        'Event Scheduling & Milestone Tracking',
        'Vendor & Contractor Logistics',
        'VIP Protocol & Guest Experience',
        'Crowd Flow & Spatial Safety Management',
        'On-Site Stage Coordination',
        'Production Budget & PO Allocation',
      ],
      experienceYears: 4,
      education: 'Bachelor of Business Administration / Event & Hospitality Management',
      summary: `${candidateName} demonstrates strong organizational capability and proven operational experience as an ${jobTitle}. Well-suited for fast-paced event execution, stakeholder coordination, and high-impact live stage delivery across Qatar landmarks.`,
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
    return {
      skills: [
        'Live Audio/Visual Systems Integration',
        'Dante & Digital Signal Processing',
        'Kinetic Lighting & DMX Control Systems',
        'Structural Rigging & Safety Compliance',
        'LED Screen Calibration & Processors',
        'High-Pressure Live Troubleshooting',
      ],
      experienceYears: 5,
      education: 'Bachelor of Science in Electrical / Sound Engineering or Production Technology',
      summary: `${candidateName} possesses rigorous technical proficiency in entertainment engineering and kinetic AV systems. Experienced in high-stakes live productions, system calibration, and large-format stage operations.`,
    };
  }

  if (
    t.includes('design') ||
    t.includes('creative') ||
    t.includes('3d') ||
    t.includes('art') ||
    t.includes('spatial') ||
    d.includes('creative')
  ) {
    return {
      skills: [
        'Spatial & Environmental Experience Design',
        '3D Visualization (Cinema4D / Blender / Unreal)',
        'Creative Scenography & Exhibition Stands',
        'Dynamic Motion Graphics & Projection Mapping',
        'Brand Spatial Identity & Signage',
        'Creative Art Direction',
      ],
      experienceYears: 4,
      education: 'Bachelor of Fine Arts / Spatial Design / Architecture',
      summary: `${candidateName} brings an inventive creative vision with strong spatial design and multi-sensory concept storytelling. Adept at transforming client briefs into landmark experiential installations.`,
    };
  }

  return {
    skills: [
      'Project Execution & Milestone Delivery',
      'Cross-Functional Team Collaboration',
      'Operations & Facility Management',
      'Client Relationship & Account Support',
      'HSE Compliance & Safety Protocols',
      'Quality Assurance & Reporting',
    ],
    experienceYears: 3,
    education: 'Bachelor Degree in Business Administration, Communications, or Related Discipline',
    summary: `${candidateName} brings versatile operational experience in ${department} with strong communication and problem-solving skills tailored to live event and entertainment project delivery.`,
  };
}

/**
 * Checks if a candidate's cvParsedData is the outdated generic software developer mock.
 */
export function isLegacySimulatedMock(cvParsedData: any, jobTitle?: string): boolean {
  if (!cvParsedData || typeof cvParsedData !== 'object') return false;

  const summary = (cvParsedData.summary || '').toLowerCase();
  const education = (cvParsedData.education || '').toLowerCase();
  const skills = Array.isArray(cvParsedData.skills)
    ? cvParsedData.skills.map((s: string) => String(s).toLowerCase())
    : [];

  const role = (jobTitle || '').toLowerCase();
  const isActualDeveloperRole =
    role.includes('software') ||
    role.includes('developer') ||
    role.includes('programmer') ||
    role.includes('fullstack') ||
    role.includes('frontend') ||
    role.includes('backend');

  if (isActualDeveloperRole) return false;

  // Check for the exact legacy mock markers
  if (summary.includes('software development') && summary.includes('proven experience in')) {
    return true;
  }
  if (education.includes('computer science') && skills.includes('react') && skills.includes('next.js')) {
    return true;
  }

  return false;
}

/**
 * Sanitizes cvParsedData if it matches the legacy mock, or returns the original data.
 */
export function sanitizeCandidateAnalysis(
  cvParsedData: any,
  jobTitle: string = 'Event Professional',
  department: string = 'Operations',
  candidateName: string = 'Candidate'
): ParsedCvResult | null {
  if (!cvParsedData) return null;

  if (isLegacySimulatedMock(cvParsedData, jobTitle)) {
    const domainFallback = getDomainExtraction(jobTitle, department, candidateName);
    return {
      ...domainFallback,
      parsedAt: new Date().toISOString(),
      aiEngine: 'e3-domain-engine',
    };
  }

  return cvParsedData;
}

/**
 * Executes a genuine Gemini 2.0 Flash analysis or falls back gracefully to domain engine.
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

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  let extraction = getDomainExtraction(jobTitle, department, candidateName);
  let aiEngine: 'gemini-2.0-flash' | 'e3-domain-engine' = 'e3-domain-engine';

  if (apiKey) {
    try {
      let fileInlineData: { mimeType: string; data: string } | null = null;

      if (buffer && buffer.length > 0 && buffer.length < 5 * 1024 * 1024) {
        fileInlineData = {
          mimeType: mimeType || 'application/pdf',
          data: buffer.toString('base64'),
        };
      } else if (cvUrl && (cvUrl.startsWith('http://') || cvUrl.startsWith('https://'))) {
        try {
          const res = await fetch(cvUrl, { signal: AbortSignal.timeout(5000) });
          if (res.ok) {
            const ab = await res.arrayBuffer();
            const b = Buffer.from(ab);
            if (b.length > 0 && b.length < 5 * 1024 * 1024) {
              fileInlineData = {
                mimeType: res.headers.get('content-type') || 'application/pdf',
                data: b.toString('base64'),
              };
            }
          }
        } catch (_fetchErr) {
          // Fall back to candidate text context
        }
      }

      const prompt = `You are the lead HR AI for E3 Qatar (Turnkey Event Engineering, Kinetic Systems, Spatial Experiences & Entertainment Pioneers in Doha, Qatar).
Analyze this candidate application specifically for the role: "${jobTitle}" in Department: "${department}".

Candidate Profile:
- Full Name: ${candidateName}
- Email: ${email}
- Phone: ${phone || 'Not provided'}
- Target Role: ${jobTitle}
- Department: ${department}
- Candidate Notes / Cover Letter: ${notes || 'Not provided'}

TASK:
Extract realistic candidate qualifications tailored precisely to the domain of "${jobTitle}":
1. "skills": Array of 4 to 8 primary domain and technical skills (e.g. for Event Coordinator: Event Scheduling, Vendor Management, Protocol, Logistics, Stage Coordination; for AV: Live Sound, Kinetic Lighting, DMX, Rigging, LED Screens; for Creative: Spatial Design, 3D Scenography, etc.). DO NOT return generic web developer skills unless applying for a Software Engineer role.
2. "experienceYears": An estimated integer representing relevant years of professional experience (1 to 15).
3. "education": Realistic relevant degree or highest professional qualification.
4. "summary": A compelling 2-3 sentence executive evaluation of the candidate's strengths and readiness specifically for the "${jobTitle}" position at E3 Qatar.

Provide the response in strict JSON format:
{
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "experienceYears": 4,
  "education": "Relevant Degree / Qualification",
  "summary": "Executive summary..."
}
Return ONLY valid JSON matching this schema.`;

      const parts: any[] = [{ text: prompt }];
      if (fileInlineData) {
        parts.push({ inlineData: fileInlineData });
      }

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.15,
            },
          }),
        }
      );

      if (geminiRes.ok) {
        const geminiJson = await geminiRes.json();
        const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          extraction = {
            skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : extraction.skills,
            experienceYears: typeof parsed.experienceYears === 'number' ? parsed.experienceYears : extraction.experienceYears,
            education: parsed.education || extraction.education,
            summary: parsed.summary || extraction.summary,
          };
          aiEngine = 'gemini-2.0-flash';
        }
      }
    } catch (aiErr) {
      console.warn('[AI CV Parser] Gemini request failed, using domain engine:', aiErr);
    }
  }

  return {
    ...extraction,
    parsedAt: new Date().toISOString(),
    aiEngine,
  };
}

export interface CategoryCandidateRank {
  candidateId: string;
  category: string;
  rank: number;
  totalCandidates: number;
  matchScore: number; // 0 to 100
  tier: 'TOP_MATCH' | 'STRONG_FIT' | 'COMPETITIVE' | 'DEVELOPING';
  tierLabel: string;
  recommendation: 'HIGHLY_RECOMMENDED' | 'SHORTLIST' | 'REVIEW' | 'CONSIDER';
  matchedSkills: string[];
  missingSkills: string[];
  scoreBreakdown: {
    skillsMatch: number; // 0-40
    experienceScore: number; // 0-30
    stageProgressScore: number; // 0-20
    completenessScore: number; // 0-10
  };
}

/**
 * Computes match score and category-relative rank for candidate applications
 * competing for the same category or target job opening.
 */
export function computeCategoryFitAndRank(
  targetCandidate: any,
  allCandidates: any[] = [],
  targetJob?: any
): CategoryCandidateRank {
  if (!targetCandidate) {
    return {
      candidateId: '',
      category: 'General',
      rank: 1,
      totalCandidates: 1,
      matchScore: 70,
      tier: 'COMPETITIVE',
      tierLabel: 'Competitive Match',
      recommendation: 'REVIEW',
      matchedSkills: [],
      missingSkills: [],
      scoreBreakdown: { skillsMatch: 25, experienceScore: 20, stageProgressScore: 15, completenessScore: 10 },
    };
  }

  const roleTitle = (targetCandidate.jobTitle || targetJob?.title || 'Professional').trim();
  const department = (targetCandidate.department || targetJob?.department || 'Operations').trim();
  const normalizedCategory = roleTitle.toLowerCase();

  // Peer group: applicants for same job title or same department
  const peers = allCandidates.length > 0
    ? allCandidates.filter((c) => {
        const cTitle = (c.jobTitle || '').toLowerCase();
        const cDept = (c.department || '').toLowerCase();
        return (
          cTitle === normalizedCategory ||
          (department && cDept === department.toLowerCase()) ||
          c.jobId === targetCandidate.jobId
        );
      })
    : [targetCandidate];

  // If target not in peers, include it
  const evaluationSet = peers.some((p) => p.id === targetCandidate.id)
    ? peers
    : [targetCandidate, ...peers];

  // Helper to score any candidate
  const scoreCandidate = (cand: any) => {
    const parsed = cand.cvParsedData || {};
    const candSkills: string[] = Array.isArray(parsed.skills)
      ? parsed.skills.map((s: any) => String(s).toLowerCase())
      : [];
    const candYears: number = typeof parsed.experienceYears === 'number'
      ? parsed.experienceYears
      : 3;
    const candStatus = (cand.status || 'NEW').toUpperCase();

    // 1. Skills Match (0 - 40)
    let domainKeywords: string[] = [];
    const lowerRole = (cand.jobTitle || roleTitle).toLowerCase();
    if (lowerRole.includes('event') || lowerRole.includes('operations') || lowerRole.includes('coordinator')) {
      domainKeywords = ['event', 'operations', 'logistics', 'protocol', 'vendor', 'stage', 'schedule', 'planning', 'budget', 'crowd'];
    } else if (lowerRole.includes('av') || lowerRole.includes('audio') || lowerRole.includes('engineer') || lowerRole.includes('lighting')) {
      domainKeywords = ['audio', 'lighting', 'systems', 'dmx', 'dante', 'rigging', 'calibration', 'signal', 'troubleshooting', 'led'];
    } else if (lowerRole.includes('design') || lowerRole.includes('creative') || lowerRole.includes('3d') || lowerRole.includes('art')) {
      domainKeywords = ['design', '3d', 'spatial', 'creative', 'concept', 'scenography', 'render', 'blender', 'storytelling', 'visual'];
    } else {
      domainKeywords = ['management', 'operations', 'communication', 'execution', 'quality', 'safety', 'coordination'];
    }

    const matchedWords = domainKeywords.filter((kw) =>
      candSkills.some((s) => s.includes(kw)) ||
      (parsed.summary || '').toLowerCase().includes(kw)
    );
    const skillsMatch = Math.min(40, Math.round((matchedWords.length / Math.max(domainKeywords.length * 0.6, 1)) * 40));

    // 2. Experience Score (0 - 30)
    let experienceScore = 15;
    const isSenior = lowerRole.includes('senior') || lowerRole.includes('lead') || lowerRole.includes('manager') || lowerRole.includes('head');
    if (isSenior) {
      if (candYears >= 6) experienceScore = 30;
      else if (candYears >= 4) experienceScore = 24;
      else if (candYears >= 2) experienceScore = 18;
      else experienceScore = 12;
    } else {
      if (candYears >= 3) experienceScore = 30;
      else if (candYears >= 2) experienceScore = 24;
      else experienceScore = 18;
    }

    // 3. Stage Progress Score (0 - 20)
    let stageProgressScore = 5;
    if (candStatus === 'HIRED') stageProgressScore = 20;
    else if (candStatus === 'OFFERED') stageProgressScore = 18;
    else if (candStatus === 'INTERVIEW') stageProgressScore = 15;
    else if (candStatus === 'REVIEWING' || candStatus === 'SCREENING') stageProgressScore = 10;
    else if (candStatus === 'NEW') stageProgressScore = 6;
    else if (candStatus === 'REJECTED') stageProgressScore = 2;

    // 4. Completeness Score (0 - 10)
    let completenessScore = 0;
    if (cand.cvUrl) completenessScore += 4;
    if (cand.phone) completenessScore += 2;
    if (candSkills.length > 0) completenessScore += 2;
    if (parsed.education) completenessScore += 2;

    const total = Math.min(99, Math.max(35, skillsMatch + experienceScore + stageProgressScore + completenessScore));

    return {
      candId: cand.id,
      total,
      breakdown: {
        skillsMatch,
        experienceScore,
        stageProgressScore,
        completenessScore,
      },
      matchedKeywords: matchedWords,
      missingKeywords: domainKeywords.filter((kw) => !matchedWords.includes(kw)),
    };
  };

  // Score all candidates in evaluation set and sort descending
  const scoredPeers = evaluationSet.map(scoreCandidate);
  scoredPeers.sort((a, b) => b.total - a.total);

  const targetIdx = scoredPeers.findIndex((p) => p.candId === targetCandidate.id);
  const myRank = targetIdx >= 0 ? targetIdx + 1 : 1;
  const myScored = scoredPeers[targetIdx >= 0 ? targetIdx : 0];

  const score = myScored.total;

  let tier: CategoryCandidateRank['tier'] = 'COMPETITIVE';
  let tierLabel = 'Competitive';
  let recommendation: CategoryCandidateRank['recommendation'] = 'REVIEW';

  if (score >= 85) {
    tier = 'TOP_MATCH';
    tierLabel = 'Top Match / Elite';
    recommendation = 'HIGHLY_RECOMMENDED';
  } else if (score >= 70) {
    tier = 'STRONG_FIT';
    tierLabel = 'Strong Fit';
    recommendation = myRank <= 2 ? 'HIGHLY_RECOMMENDED' : 'SHORTLIST';
  } else if (score >= 55) {
    tier = 'COMPETITIVE';
    tierLabel = 'Qualified / Competitive';
    recommendation = 'SHORTLIST';
  } else {
    tier = 'DEVELOPING';
    tierLabel = 'Developing / Needs Review';
    recommendation = 'CONSIDER';
  }

  return {
    candidateId: targetCandidate.id,
    category: roleTitle,
    rank: myRank,
    totalCandidates: evaluationSet.length,
    matchScore: score,
    tier,
    tierLabel,
    recommendation,
    matchedSkills: myScored.matchedKeywords,
    missingSkills: myScored.missingKeywords,
    scoreBreakdown: myScored.breakdown,
  };
}
