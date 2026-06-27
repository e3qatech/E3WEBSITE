"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"

export interface ProjectCard {
  id: string
  slug?: string
  title: Record<string, string>
  clientName: Record<string, string>
  year: string
  thumbnailUrl: string
}

interface SimilarProjectsProps {
  projects: ProjectCard[]
  locale: string
}

export function SimilarProjects({ projects, locale }: SimilarProjectsProps) {
  const isRTL = locale === 'ar'

  if (!projects || projects.length === 0) return null

  return (
    <section className="py-24 bg-[var(--surface-default)]" id="projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-4">
              {locale === 'ar' ? 'مشاريع ذات صلة' : 'Featured Deployments'}
            </h2>
            <p className="text-xl text-[var(--text-secondary)]">
              {locale === 'ar' ? 'شاهد هذا التخصص في العمل.' : 'See this capability in action.'}
            </p>
          </div>
          <Button asChild variant="outline" className="hidden md:inline-flex">
            <Link href={`/${locale}/b2b/case-studies`}>
              {locale === 'ar' ? 'عرض جميع المشاريع' : 'View All Projects'}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group cursor-pointer"
            >
              {/* Wrapper link or div depending on if slug exists */}
              <Link 
                href={project.slug ? `/${locale}/b2b/case-studies/${project.slug}` : `/${locale}/b2b/case-studies`}
                className="block"
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--surface-hover)] border border-[var(--border-default)] mb-4 relative">
                  <img 
                    src={project.thumbnailUrl} 
                    alt={project.title[locale] || project.title.en}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-[var(--color-primary)] tracking-wider uppercase">
                      {project.clientName[locale] || project.clientName.en}
                    </span>
                    <span className="text-sm text-[var(--text-tertiary)] font-medium">
                      {project.year}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                    {project.title[locale] || project.title.en}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-12 md:hidden">
          <Button asChild variant="outline" className="w-full">
            <Link href={`/${locale}/b2b/case-studies`}>
              {locale === 'ar' ? 'عرض جميع المشاريع' : 'View All Projects'}
            </Link>
          </Button>
        </div>

      </div>
    </section>
  )
}
