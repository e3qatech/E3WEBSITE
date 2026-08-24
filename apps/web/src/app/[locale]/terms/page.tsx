import { Metadata } from 'next';
import Link from 'next/link';
import { Scale, FileText, AlertCircle, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === 'ar';

  const titleEn = 'Terms of Service | E3 Qatar';
  const titleAr = 'الشروط والأحكام | إي ثري قطر';
  const descEn = 'E3 Qatar Terms of Service and Event Operations Conditions under State of Qatar legal jurisdiction.';
  const descAr = 'الشروط والأحكام العامة وتشغيل الفعاليات لشركة إي ثري قطر الخاضعة للقوانين المعمول بها في دولة قطر.';

  return {
    title: isAr ? titleAr : titleEn,
    description: isAr ? descAr : descEn,
    alternates: {
      canonical: `/${locale}/terms`,
      languages: {
        en: '/en/terms',
        ar: '/ar/terms',
      },
    },
  };
}

export default async function TermsOfServicePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const isAr = locale === 'ar';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-24 sm:py-32" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href={`/${locale}/b2c`}
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            <span>{isAr ? 'العودة للرئيسية' : 'Return to Home'}</span>
          </Link>
        </div>

        {/* Hero Title */}
        <div className="border-b border-zinc-800 pb-10 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>{isAr ? 'الشروط القانونية والتنظيمية' : 'Legal & Operational Terms'}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4 font-display">
            {isAr ? 'الشروط والأحكام العامة' : 'General Terms of Service'}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            {isAr
              ? 'آخر تحديث: أغسطس ٢٠٢٦ | خاضعة لقوانين واختصاص محاكم دولة قطر'
              : 'Last Updated: August 2026 | Governed by the Laws of the State of Qatar'}
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-10 text-zinc-300 text-sm sm:text-base leading-relaxed">
          
          {/* Section 1 */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
              {isAr ? '١. المقدمة وقبول الشروط' : '1. Acceptance of Terms'}
            </h2>
            <p>
              {isAr
                ? 'تحكم هذه الشروط والأحكام استخدامك لموقع E3 Qatar وجميع الخدمات الرقمية والتذاكر والفعاليات والوجهات الترفيهية التابعة لها. يُعد دخولك إلى المنصة أو شراؤك للتذاكر أو تقديمك لعروض المشاريع موافقة صريحة على الالتزام بهذه الشروط.'
                : 'These Terms of Service govern your access to and use of E3 Qatar websites, digital services, ticketing systems, attraction venues, and festival activations. By accessing our platform, purchasing tickets, or submitting project RFPs, you agree to be bound by these terms.'}
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              {isAr ? '٢. شروط التذاكر والدخول إلى الفعاليات' : '2. Ticketing, Passes & Venue Admission'}
            </h2>
            <ul className="space-y-3 list-disc list-inside">
              <li>
                <strong>{isAr ? 'صلاحية التذكرة:' : 'Ticket Validity:'}</strong>{' '}
                {isAr
                  ? 'التذاكر صالحة فقط للتاريخ والوقت والفعالية المحددة في أمر الشراء، وغير قابلة لإعادة البيع غير المصرح به.'
                  : 'Tickets and passes are valid strictly for the specified date, time slot, and attraction venue indicated upon issuance.'}
              </li>
              <li>
                <strong>{isAr ? 'قواعد الأمان والسلامة:' : 'Safety & Venue Rules:'}</strong>{' '}
                {isAr
                  ? 'يجب على جميع الزوار الالتزام بإرشادات السلامة التشغيلية، ومحددات الطول والعمر المعتمدة في مناطق الألعاب الحركية والهوائية.'
                  : 'All guests must comply with venue safety guidelines, weight/height limitations, and staff instructions at inflatable and kinetic arenas.'}
              </li>
              <li>
                <strong>{isAr ? 'سياسة الإلغاء والاسترجاع:' : 'Refund & Cancellation Policy:'}</strong>{' '}
                {isAr
                  ? 'تخضع عمليات الاسترجاع للشروط المحددة لكل فعالية، وفي حال إلغاء الفعالية من قبل الإدارة يتم تعويض الزوار وفقاً للأنظمة المعمول بها.'
                  : 'Refunds are processed in accordance with specific event policies or in cases of mandatory cancellation by venue management.'}
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400 shrink-0" />
              {isAr ? '٣. الملكية الفكرية وحقوق النشر' : '3. Intellectual Property Rights'}
            </h2>
            <p>
              {isAr
                ? 'جميع العلامات التجارية، والمحتويات المرئية، وتصاميم الهياكل الحركية، وأنظمة الترفيه (بما فيها InflataRUN وInflataCity وUrban Arena) هي ملكية حصرية لشركة E3 وشركائها المرخصين، ومحمية بموجب قوانين الملكية الفكرية في قطر والاتفاقيات الدولية.'
                : 'All trademarks, media content, kinetic structure designs, and proprietary attraction IP (including InflataRUN, InflataCity, and Urban Arena) are the exclusive property of E3 Qatar and its licensors, protected by Qatar IP laws and international conventions.'}
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              {isAr ? '٤. القانون الواجب التطبيق والاختصاص القضائي' : '4. Governing Law & Jurisdiction'}
            </h2>
            <p>
              {isAr
                ? 'تخضع هذه الشروط والأحكام وتُفسر وفقاً للقوانين السارية في دولة قطر. وتختص المحاكم القطرية حصرياً بالفصل في أي نزاع قد ينشأ عن أو يرتبط بهذه الشروط.'
                : 'These Terms of Service are governed by and construed in accordance with the laws of the State of Qatar. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the Courts of Qatar.'}
            </p>
          </section>

          {/* Contact Legal */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
              {isAr ? '٥. الاستفسارات القانونية' : '5. Legal Inquiries'}
            </h2>
            <p className="mb-4">
              {isAr
                ? 'لأي استفسارات قانونية أو مؤسسية تتعلق بهذه الشروط، يرجى التواصل مع فريقنا القانوني:'
                : 'For any legal or contractual inquiries concerning these Terms of Service, please reach out to our legal department:'}
            </p>
            <div className="text-sm font-bold text-emerald-400">
              <a href="mailto:info@eeeqa.com" className="underline hover:text-emerald-300">info@eeeqa.com</a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
