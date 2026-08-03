function verify() {
  const dbEnv = process.env.E3_DATABASE_ENV;
  
  if (!dbEnv || dbEnv !== 'development') {
    if (dbEnv === 'production') {
      console.error('ERROR: E3_DATABASE_ENV is set to production!');
      process.exit(1);
    }
    console.error('ERROR: E3_DATABASE_ENV=development is missing or invalid in the environment.');
    process.exit(1);
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('ERROR: DATABASE_URL not found in the environment.');
    process.exit(1);
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      console.error('ERROR: DATABASE_URL points to localhost.');
      process.exit(1);
    }
    if (!parsed.hostname.includes('neon.tech')) {
      console.error('ERROR: DATABASE_URL does not point to a Neon hostname.');
      process.exit(1);
    }
    
    console.log(`Database Host: ${parsed.hostname}`);
    console.log(`Database Name: ${parsed.pathname.replace('/', '')}`);

    console.log('Environment successfully verified as Development.');
  } catch (e) {
    console.error('ERROR: Could not parse DATABASE_URL safely.');
    process.exit(1);
  }
}

verify();
