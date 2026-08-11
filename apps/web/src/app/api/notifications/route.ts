import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const notifications: any[] = [];

    // 1. Fetch recent SystemLogs (CMS edits, Media uploads, Settings changes)
    try {
      const logs = await db.systemLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      logs.forEach((log: any) => {
        let title = 'System Activity';
        let type: 'info' | 'success' | 'warning' | 'error' = 'info';

        if (log.action?.includes('PAGE') || log.action?.includes('CMS')) {
          title = 'CMS Website Page Updated';
          type = 'success';
        } else if (log.action?.includes('MEDIA')) {
          title = 'New Media Uploaded';
          type = 'info';
        } else if (log.action?.includes('SETTING')) {
          title = 'Global Setting Modified';
          type = 'warning';
        }

        notifications.push({
          id: `log-${log.id}`,
          title,
          message: `${log.action} - ${log.resourceId || 'Website Asset'}`,
          timestamp: log.createdAt.toISOString(),
          read: false,
          type
        });
      });
    } catch (_e) {
      // SystemLog table fallback
    }

    // 2. Fetch recent inquiries
    try {
      const inquiries = await db.inquiry.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      inquiries.forEach((inq: any) => {
        notifications.push({
          id: `inq-${inq.id}`,
          title: 'New Customer Inquiry',
          message: `From ${inq.name || 'Visitor'} (${inq.email || 'N/A'})`,
          timestamp: inq.createdAt.toISOString(),
          read: false,
          type: 'info'
        });
      });
    } catch (_e) {
      // Inquiry fallback
    }

    // Sort by timestamp descending
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      notifications: notifications.slice(0, 15),
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 200 });
  }
}
