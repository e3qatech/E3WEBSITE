module.exports = {
  ci: {
    collect: {
      // Start the Next.js production server before running tests
      startServerCommand: 'pnpm --filter web start',
      startServerReadyPattern: 'ready on',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/b2b/services',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // Core Web Vitals Enforcement (Adjusted for GitHub Actions runner CPU throttling)
        'largest-contentful-paint': ['warn', { maxNumericValue: 6500 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'interactive': ['warn', { maxNumericValue: 7000 }],
        
        // General Category Scores
        'categories:performance': ['warn', { minScore: 0.6 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
