import { NextResponse } from 'next/server';
import { requireClientOrganization, AppAuthError } from '@/lib/server-auth';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { user, client } = await requireClientOrganization();

    const body = await request.json();
    const { title, services, estimatedDate, budgetRange, description } = body;

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return NextResponse.json(
        { error: 'Project title is required (minimum 3 characters)' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Detailed project description is required (minimum 10 characters)' },
        { status: 400 }
      );
    }

    const companyName = client?.company || 'Enterprise Partner';
    const contactEmail = user.email || 'partner@eeeqa.com';

    const fullScopeMessage = [
      description.trim(),
      estimatedDate ? `\n\nTarget Event Timeline: ${estimatedDate}` : '',
      budgetRange ? `\nTarget Investment Range: ${budgetRange}` : '',
      Array.isArray(services) && services.length > 0 ? `\nSelected Capabilities: ${services.join(', ')}` : '',
    ].join('');

    // Create the Lead record
    const lead = await db.lead.create({
      data: {
        name: title.trim(),
        company: companyName,
        email: contactEmail,
        status: 'NEW',
        source: 'CLIENT_PORTAL',
        interestServices: Array.isArray(services) ? services : [],
        inquiries: {
          create: {
            type: 'PROJECT',
            subject: title.trim(),
            message: fullScopeMessage,
            status: 'NEW',
          },
        },
        activities: {
          create: {
            type: 'PORTAL_SUBMISSION',
            description: `Project brief submitted by ${user.name || user.email} via Enterprise Portal.`,
          },
        },
      },
      include: {
        inquiries: true,
        activities: true,
      },
    });

    return NextResponse.json(
      { success: true, leadId: lead.id, lead },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error creating B2B RFP:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
