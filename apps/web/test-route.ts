import { GET } from './src/app/api/calendar/route';
import { NextRequest } from 'next/server';

async function run() {
  const req = new NextRequest('http://localhost/api/calendar?startDate=2026-08-13');
  const res = await GET(req);
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', text);
}
run().catch(console.error);
