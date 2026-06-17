import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { js2xml } from 'xml-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  try {
    const records = await prisma.weatherRecord.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'json') {
      return new NextResponse(JSON.stringify(records, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="weather-history.json"'
        }
      });
    }

    if (format === 'csv') {
      const header = ['ID', 'Location', 'Start Date', 'End Date', 'Avg Temp', 'Max Temp', 'Min Temp', 'Created At'].join(',');
      const rows = records.map(r => [
        r.id,
        `"${r.location}"`,
        r.startDate.toISOString(),
        r.endDate.toISOString(),
        r.avgTemp,
        r.maxTemp,
        r.minTemp,
        r.createdAt.toISOString()
      ].join(','));
      
      return new NextResponse([header, ...rows].join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="weather-history.csv"'
        }
      });
    }

    if (format === 'md') {
      let md = '# Weather History Report\n\n';
      md += '| Location | Start Date | End Date | Avg Temp | Max Temp | Min Temp |\n';
      md += '|---|---|---|---|---|---|\n';
      records.forEach(r => {
        md += `| ${r.location} | ${r.startDate.toDateString()} | ${r.endDate.toDateString()} | ${r.avgTemp?.toFixed(1)} | ${r.maxTemp?.toFixed(1)} | ${r.minTemp?.toFixed(1)} |\n`;
      });

      return new NextResponse(md, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': 'attachment; filename="weather-history.md"'
        }
      });
    }

    if (format === 'xml') {
      const xmlData = {
        _declaration: { _attributes: { version: "1.0", encoding: "utf-8" } },
        WeatherRecords: {
          Record: records.map(r => ({
            ID: r.id,
            Location: r.location,
            StartDate: r.startDate.toISOString(),
            EndDate: r.endDate.toISOString(),
            AvgTemp: r.avgTemp,
            MaxTemp: r.maxTemp,
            MinTemp: r.minTemp,
            CreatedAt: r.createdAt.toISOString()
          }))
        }
      };
      
      const xmlString = js2xml(xmlData, { compact: true, spaces: 2 });
      return new NextResponse(xmlString, {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': 'attachment; filename="weather-history.xml"'
        }
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
