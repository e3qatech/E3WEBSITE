import JobDetailPage from "../[id]/page"

export default function NewJobPage() {
  return <JobDetailPage params={Promise.resolve({ id: "new" })} />
}
