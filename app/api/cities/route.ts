import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ cities: [] });
  }

  try {
    // Switch to Open-Meteo Geocoding API (based on GeoNames)
    // It provides cleaner "city/location" results compared to raw OSM
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?` +
      `name=${encodeURIComponent(query)}&` +
      `count=10&` +
      `language=tr&` +
      `format=json`,
      {
        headers: {
          'User-Agent': 'IrmaCRM/1.0'
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }

    const data = await response.json();

    if (!data.results) {
      return NextResponse.json({ cities: [] });
    }

    // Format the results
    const cities = data.results.map((item: any) => {
      // Build a clear display name: "Kadıköy, İstanbul, Türkiye"
      const parts = [item.name];
      if (item.admin1 && item.admin1 !== item.name) parts.push(item.admin1);
      if (item.country) parts.push(item.country);
      
      const displayName = parts.join(', ');

      return {
        id: item.id,
        name: displayName, // The value to select
        displayName: displayName, // The visual label
        lat: item.latitude?.toString(),
        lon: item.longitude?.toString(),
      };
    });

    return NextResponse.json({ cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json({ cities: [], error: true }, { status: 200 });
  }
}
