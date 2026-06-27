import { ServicesEditor } from "@/components/dashboard/b2b/ServicesEditor"

export const metadata = {
  title: "New Service | E3 B2B Management",
  description: "Create a new engineering service.",
}

export default function NewServicePage() {
  return (
    <div className="w-full">
      <ServicesEditor />
    </div>
  )
}
