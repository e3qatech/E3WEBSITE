import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractCandidateInterviews,
  buildApplicationTimeline,
  formatInterviewCountdown,
  generateIcsCalendar,
  InterviewRecord,
} from '@/lib/careers/candidate-portal';

describe('Candidate Portal Feature Suite', () => {
  describe('extractCandidateInterviews', () => {
    it('should extract explicitly scheduled interviews from application cvParsedData', () => {
      const mockApplications = [
        {
          id: 'app-1',
          jobTitle: 'Senior Audio Visual Lead',
          department: 'Technical Operations',
          status: 'INTERVIEW',
          cvParsedData: {
            interviews: [
              {
                id: 'int-123',
                roundName: 'Executive Panel',
                format: 'IN_PERSON',
                scheduledAt: '2026-10-15T10:00:00.000Z',
                durationMinutes: 60,
                location: 'E3 Lusail HQ, Level 24',
                interviewers: ['Chief Production Officer'],
                status: 'SCHEDULED',
              },
            ],
          },
        },
      ];

      const extracted = extractCandidateInterviews(mockApplications);
      expect(extracted).toHaveLength(1);
      expect(extracted[0].id).toBe('int-123');
      expect(extracted[0].format).toBe('IN_PERSON');
      expect(extracted[0].location).toBe('E3 Lusail HQ, Level 24');
      expect(extracted[0].jobTitle).toBe('Senior Audio Visual Lead');
    });

    it('should generate fallback virtual interview when application status is INTERVIEW but no interview array exists', () => {
      const mockApplications = [
        {
          id: 'app-2',
          jobTitle: 'Stage Lighting Designer',
          department: 'Creative Engineering',
          status: 'INTERVIEW',
          cvParsedData: {},
        },
      ];

      const extracted = extractCandidateInterviews(mockApplications);
      expect(extracted).toHaveLength(1);
      expect(extracted[0].roundName).toBe('Technical & Domain Assessment');
      expect(extracted[0].format).toBe('VIRTUAL');
      expect(extracted[0].meetingUrl).toBe('https://meet.google.com/e3q-hr-interview');
    });

    it('should return empty list when application is in SUBMITTED state without scheduled interviews', () => {
      const mockApplications = [
        {
          id: 'app-3',
          jobTitle: 'Operations Coordinator',
          status: 'NEW',
          cvParsedData: {},
        },
      ];

      const extracted = extractCandidateInterviews(mockApplications);
      expect(extracted).toHaveLength(0);
    });
  });

  describe('buildApplicationTimeline', () => {
    it('should build 4-stage milestones with step 1 current when status is NEW', () => {
      const app = {
        id: 'app-1',
        status: 'NEW',
        createdAt: '2026-09-01T12:00:00.000Z',
      };

      const timeline = buildApplicationTimeline(app);
      expect(timeline).toHaveLength(4);
      expect(timeline[0].isCurrent).toBe(true);
      expect(timeline[0].isCompleted).toBe(true);
      expect(timeline[1].isCurrent).toBe(false);
      expect(timeline[1].isCompleted).toBe(false);
    });

    it('should mark milestone 3 active when status is INTERVIEW', () => {
      const app = {
        id: 'app-2',
        status: 'INTERVIEW',
        createdAt: '2026-09-01T12:00:00.000Z',
        updatedAt: '2026-09-03T15:00:00.000Z',
      };

      const timeline = buildApplicationTimeline(app);
      expect(timeline[0].isCompleted).toBe(true);
      expect(timeline[1].isCompleted).toBe(true);
      expect(timeline[2].isCurrent).toBe(true);
      expect(timeline[2].isCompleted).toBe(true);
      expect(timeline[3].isCompleted).toBe(false);
    });

    it('should reflect HIRED offer state when status is HIRED', () => {
      const app = {
        id: 'app-3',
        status: 'HIRED',
        createdAt: '2026-09-01T12:00:00.000Z',
        updatedAt: '2026-09-04T12:00:00.000Z',
      };

      const timeline = buildApplicationTimeline(app);
      expect(timeline[3].isCurrent).toBe(true);
      expect(timeline[3].isCompleted).toBe(true);
      expect(timeline[3].titleEn).toContain('Offer');
    });
  });

  describe('formatInterviewCountdown', () => {
    it('should return human readable days and hours for future interviews', () => {
      const futureDate = new Date(Date.now() + 86400000 * 2 + 3600000 * 3).toISOString();
      const countdown = formatInterviewCountdown(futureDate, false);
      expect(countdown.isPast).toBe(false);
      expect(countdown.label).toMatch(/In 2d/);
    });

    it('should return past indicator for dates in the past', () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString();
      const countdown = formatInterviewCountdown(pastDate, false);
      expect(countdown.isPast).toBe(true);
      expect(countdown.label).toBe('Past or In Progress');
    });
  });

  describe('generateIcsCalendar', () => {
    it('should generate valid RFC 5545 calendar string', () => {
      const interview: InterviewRecord = {
        id: 'test-int-1',
        applicationId: 'app-99',
        jobTitle: 'Senior Sound Engineer',
        roundName: 'Technical Audio Exam',
        format: 'VIRTUAL',
        scheduledAt: '2026-10-20T14:00:00.000Z',
        durationMinutes: 45,
        meetingUrl: 'https://meet.google.com/test-e3-call',
        interviewers: ['Lead Sound Engineer'],
        status: 'SCHEDULED',
        createdAt: '2026-09-04T10:00:00.000Z',
      };

      const ics = generateIcsCalendar(interview);
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('SUMMARY:E3 Qatar Interview: Senior Sound Engineer - Technical Audio Exam');
      expect(ics).toContain('LOCATION:https://meet.google.com/test-e3-call');
      expect(ics).toContain('END:VCALENDAR');
    });
  });
});
