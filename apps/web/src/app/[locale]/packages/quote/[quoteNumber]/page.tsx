import { notFound } from "next/navigation"
import { Metadata } from "next"
import db from "@/lib/db"
import { PublicQuotationView } from "@/components/b2c/packages/PublicQuotationView"

export const dynamic = "force-dynamic"

export async function generateMetadata(props: {
  params: Promise<{ locale: string; quoteNumber: string }>
}): Promise<Metadata> {
  const { quoteNumber } = await props.params
  return {
    title: `Quotation ${quoteNumber} | E3 Qatar`,
    description: `Official package quotation and event proposal from E3 Qatar.`
  }
}

export default async function PackageQuotationPublicAliasPage(props: {
  params: Promise<{ locale: string; quoteNumber: string }>
}) {
  const { locale, quoteNumber } = await props.params

  const quotation = await db.packageQuotation.findFirst({
    where: {
      OR: [
        { quoteNumber },
        { id: quoteNumber }
      ]
    },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      package: {
        include: {
          attraction: { select: { id: true, nameEn: true, nameAr: true, slug: true } }
        }
      },
      lead: true
    }
  })

  if (!quotation) {
    notFound()
  }

  return (
    <PublicQuotationView quotation={quotation} locale={locale} />
  )
}
