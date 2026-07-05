import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/Button"

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function generateMetadata(props: { params: Promise<{ locale: string, slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const formattedSlug = params.slug.replace(/-/g, ' ')
  return {
    title: params.locale === 'ar' ? `مشاريع: ${formattedSlug} | E3 Qatar` : `Projects: ${formattedSlug} | E3 Qatar`,
    description: params.locale === 'ar' ? 'استعرض مشاريعنا ودراسات الحالة.' : 'Browse our associated case studies and projects.',
  }
}

export default async function ServiceProjectsPage(props: { params: Promise<{ locale: string, slug: string }> }) {
  const params = await props.params;
  const { locale, slug } = params;
  
  let projects = []
  
  try {
    const baseUrl = getBaseUrl()
    // In a real app we'd filter by serviceId or category. We'll fetch all and filter client-side or mock.
    const res = await fetch(`${baseUrl}/api/case-studies?isVisible=true`, { next: { revalidate: 60 } })
    if (res.ok) {
      const { data } = await res.json()
      // Filter mock if tags/categories align with slug
      projects = data || []
    }
  } catch (error) {
    console.error("Failed to fetch projects for service", error)
  }

  // Fallback if empty or API fails
  if (projects.length === 0) {
    projects = [
      {
        id: '1', slug: 'expo-2023-doha',
        title: { en: 'Expo 2023 Doha', ar: 'إكسبو 2023 الدوحة' },
        category: { en: 'Government', ar: 'حكومي' },
        coverImage: '/projects/expo.webp',
      },
      {
        id: '2', slug: 'qatar-economic-forum',
        title: { en: 'Qatar Economic Forum', ar: 'منتدى قطر الاقتصادي' },
        category: { en: 'Corporate', ar: 'شركات' },
        coverImage: '/projects/qef.webp',
      },
    ]
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Header Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10">
        <div className="mb-8">
          <Link href={`/${locale}/b2b/services/${slug}`} className="inline-flex items-center text-zinc-400 hover:text-emerald-500 transition-colors">
            <ArrowLeft className="w-4 h-4 me-2 rtl:ms-2 rtl:me-0 rtl:-scale-x-100" />
            <span className="text-sm font-bold tracking-widest uppercase">
              {locale === 'ar' ? 'العودة إلى الخدمة' : 'Back to Service'}
            </span>
          </Link>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
          {locale === 'ar' ? 'مشاريع ذات صلة' : 'Associated Projects'}
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl">
          {locale === 'ar' 
            ? 'دراسات حالة سابقة وتنفيذ ناجح باستخدام هذه القدرات الأساسية.' 
            : 'Past case studies and successful deployments utilizing these core capabilities.'}
        </p>
      </section>

      {/* Grid Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project: any) => (
            <Link 
              key={project.id} 
              href={`/${locale}/b2b/case-studies/${project.slug}`}
              className="group block relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 hover:border-emerald-500/30 transition-all duration-500"
            >
              <div className="aspect-video relative overflow-hidden">
                <div className="absolute inset-0 bg-zinc-950/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img 
                  src={project.coverImage || "https://images.unsplash.com/photo-1540839045646-19f7381eb6c7"} 
                  alt={project.title?.[locale as 'en'|'ar']} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <div className="text-xs font-bold tracking-widest uppercase text-emerald-500 mb-3">
                  {project.category?.[locale as 'en'|'ar'] || 'Project'}
                </div>
                <h3 className="text-2xl font-black text-white mb-4 group-hover:text-emerald-400 transition-colors">
                  {project.title?.[locale as 'en'|'ar']}
                </h3>
                <div className="flex items-center text-zinc-400 text-sm font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                  {locale === 'ar' ? 'اقرأ دراسة الحالة' : 'Read Case Study'}
                  <ExternalLink className="w-4 h-4 ms-2 rtl:me-2 rtl:ms-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}
