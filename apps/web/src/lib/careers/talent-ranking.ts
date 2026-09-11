export interface CategoryCandidateRank {
  candidateId: string;
  category: string;
  rank: number;
  totalCandidates: number;
  matchScore: number;
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

  if (summary.includes('software development') && summary.includes('proven experience in')) {
    return true;
  }
  if (education.includes('computer science') && skills.includes('react') && skills.includes('next.js')) {
    return true;
  }

  return false;
}

/**
 * Computes match score and category-relative rank for candidate applications
 * competing for the same category or target job opening.
 * Pure logic safe for both server and browser environments.
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
