import { Metadata } from 'next';
import { SocialMediaManagerView } from '@/components/admin/social-media/SocialMediaManagerView';

export const metadata: Metadata = {
  title: 'Social Media Manager | E3 Qatar Administration',
  description: 'Manage platform API integrations, connected social accounts, content moderation, feeds, and website placement.',
};

export const dynamic = 'force-dynamic';

export default function SocialMediaAdminPage() {
  return <SocialMediaManagerView />;
}
