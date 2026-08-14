import { EverlastingMemoriesManager } from '@/components/dashboard/b2c/content/EverlastingMemoriesManager'
import { DashboardPageShell, DashboardPageHeader } from '@/components/dashboard/ui'

export const metadata = {
  title: 'Everlasting Memories Manager | E3 CMS',
  description: 'Manage Everlasting Memories guest moment cards, headlines, subtexts, and media.'
}

export default function EverlastingMemoriesPage() {
  return (
    <DashboardPageShell variant="wide">
      <DashboardPageHeader
        title="Everlasting Memories Manager"
        description="Manage Everlasting Memories guest moment cards, headlines, subtexts, and media assets featured on the B2C Landing Page."
        breadcrumbs={[
          { label: "B2C Content", href: "/dashboard/b2c/attractions" },
          { label: "Everlasting Memories" },
        ]}
        badge={{ label: "B2C Public", variant: "purple" }}
        previewUrl="/b2c"
      />
      <EverlastingMemoriesManager />
    </DashboardPageShell>
  )
}
