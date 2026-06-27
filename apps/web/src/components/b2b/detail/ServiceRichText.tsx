"use client"

import { motion } from "framer-motion"

// Simplified interface for CMS JSON blocks
export interface ContentBlock {
  id: string
  type: 'paragraph' | 'h2' | 'h3' | 'list' | 'quote' | 'image'
  content?: string
  items?: string[] // for lists
  url?: string // for images
  alt?: string
  author?: string // for quotes
}

interface ServiceRichTextProps {
  blocks: ContentBlock[]
  locale: string
}

export function ServiceRichText({ blocks, locale }: ServiceRichTextProps) {
  const isRTL = locale === 'ar'

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'h2':
        return (
          <h2 key={block.id} className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mt-12 mb-6">
            {block.content}
          </h2>
        )
      case 'h3':
        return (
          <h3 key={block.id} className="text-2xl font-bold text-[var(--text-primary)] mt-8 mb-4">
            {block.content}
          </h3>
        )
      case 'paragraph':
        return (
          <p key={block.id} className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: block.content || '' }} />
        )
      case 'list':
        return (
          <ul key={block.id} className="list-none space-y-4 mb-8">
            {block.items?.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-2 h-2 mt-2 rounded-full bg-[var(--color-primary)] shrink-0" />
                <span className="text-lg text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        )
      case 'quote':
        return (
          <blockquote key={block.id} className="ps-6 border-s-4 border-[var(--color-primary)] my-8 italic">
            <p className="text-2xl text-[var(--text-primary)] mb-2 font-medium">"{block.content}"</p>
            {block.author && <footer className="text-sm text-[var(--text-tertiary)]">— {block.author}</footer>}
          </blockquote>
        )
      case 'image':
        return (
          <figure key={block.id} className="my-10 rounded-2xl overflow-hidden bg-[var(--surface-hover)] border border-[var(--border-default)]">
            <img src={block.url} alt={block.alt || 'Service image'} className="w-full h-auto object-cover" />
            {block.alt && <figcaption className="text-center text-sm text-[var(--text-tertiary)] p-3 border-t border-[var(--border-default)]">{block.alt}</figcaption>}
          </figure>
        )
      default:
        return null
    }
  }

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="description">
      <div className="flex flex-col lg:flex-row gap-16">
        
        {/* Left Column (Content) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex-1 max-w-3xl"
        >
          {blocks.map(renderBlock)}
        </motion.div>

        {/* Right Column (Visual/Sticky element) */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full lg:w-1/3 shrink-0"
        >
          <div className="sticky top-32 p-8 bg-[var(--surface-hover)] rounded-3xl border border-[var(--border-default)]">
            <h4 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              {locale === 'ar' ? 'جاهز للبدء؟' : 'Ready to begin?'}
            </h4>
            <p className="text-[var(--text-secondary)] mb-6">
              {locale === 'ar' 
                ? 'فريقنا الهندسي مستعد لتحويل رؤيتك إلى واقع ملموس.' 
                : 'Our engineering team is ready to transform your vision into reality.'}
            </p>
            
            {/* Visual aesthetic element */}
            <div className="aspect-square rounded-2xl bg-[var(--surface-default)] border border-[var(--border-default)] overflow-hidden relative mb-6">
               <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-[length:20px_20px] opacity-10" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 border-2 border-[var(--color-primary)] rounded-full animate-[ping_3s_ease-in-out_infinite]" />
                 <div className="absolute w-8 h-8 border-2 border-[var(--color-accent)] rounded-full animate-[ping_2s_ease-in-out_infinite]" />
               </div>
            </div>
            
          </div>
        </motion.div>

      </div>
    </section>
  )
}
