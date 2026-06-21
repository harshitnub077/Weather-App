import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { searchLocation, getHistoricalWeather } from '@/lib/api';

export async function GET() {
  try {
    const records = await prisma.weatherRecord.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { location, startDate, endDate } = body;

    if (!location || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
    }


    const locations = await searchLocation(location);
    if (locations.length === 0) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const loc = locations[0];


    const history = await getHistoricalWeather(loc.lat, loc.lon, startDate, endDate);


    const record = await prisma.weatherRecord.create({
      data: {
        location: loc.name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        avgTemp: history.avgTemp,
        maxTemp: history.maxTemp,
        minTemp: history.minTemp,
      }
    });

    return NextResponse.json(record);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create record' }, { status: 500 });
  }
}
