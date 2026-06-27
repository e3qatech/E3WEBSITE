module.exports = {
  ci: {
    collect: {
      // Start the Next.js production server before running tests
      startServerCommand: 'pnpm --filter web start',
      startServerReadyPattern: 'ready on',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/b2b/services',
        // Mock a route assuming dummy data will be available in CI
        // 'http://localhost:3000/dashboard/overview' 
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // Core Web Vitals Enforcement (Budget limits from User)
        'largest-contentful-paint': ['error', { maxNumericValue: 1100 }], // LCP < 1.1s
        'first-contentful-paint': ['error', { maxNumericValue: 800 }],     // FCP < 0.8s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],    // CLS < 0.1
        'interactive': ['error', { maxNumericValue: 2500 }],               // TTI < 2.5s
        
        // General Scores (Out of 1)
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1.0 }], // Enforce WCAG AA 100%
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 1.0 }],
      },
    },
    upload: {
      target: 'temporary-public-storage', // Generates a shareable URL for the PR
    },
  },
};
