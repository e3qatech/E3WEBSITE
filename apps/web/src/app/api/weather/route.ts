import { NextResponse } from 'next/server';
import { resolveWeatherForGateway } from '@/lib/server/weather/resolve';

export async function GET() {
  try {
    const weather = await resolveWeatherForGateway();
    return NextResponse.json({
      success: true,
      data: weather,
    });
  } catch (error) {
    console.error('[WEATHER_API_GET_ERROR]', error);
    return NextResponse.json({
      success: false,
      error: 'Weather service unavailable',
    }, { status: 500 });
  }
}
