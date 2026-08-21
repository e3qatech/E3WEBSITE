import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, FileText, CheckCircle2, ArrowLeft, Mail, MapPin } from 'lucide-react';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === 'ar';

  const titleEn = 'Privacy Policy | E3 Qatar';
  const titleAr = 'سياسة الخصوصية | إي ثري قطر';
  const descEn = 'E3 Qatar Privacy Policy. Compliant with State of Qatar Law No. (13) of 2016 concerning Personal Data Privacy Protection.';
  const descAr = 'سياسة خصوصية إي ثري قطر، المتوافقة مع القانون رقم (١٣) لسنة ٢٠١٦ بشأن حماية خصوصية البيانات الشخصية في دولة قطر.';

  return {
    title: isAr ? titleAr : titleEn,
    description: isAr ? descAr : descEn,
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: {
        en: '/en/privacy',
        ar: '/ar/privacy',
      },
    },
  };
}

export default async function PrivacyPolicyPage(props: {
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
            <Shield className="w-3.5 h-3.5" />
            <span>{isAr ? 'حماية البيانات والخصوصية' : 'Data Privacy & Protection'}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4 font-display">
            {isAr ? 'سياسة الخصوصية وحماية البيانات' : 'Privacy & Data Protection Policy'}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            {isAr
              ? 'آخر تحديث: أغسطس ٢٠٢٦ | متوافق مع قانون حماية خصوصية البيانات الشخصية بدولة قطر (قانون رقم ١٣ لسنة ٢٠١٦)'
              : 'Last Updated: August 2026 | Compliant with State of Qatar Law No. (13) of 2016 concerning Personal Data Privacy Protection (PDPL)'}
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-10 text-zinc-300 text-sm sm:text-base leading-relaxed">
          
          {/* Section 1 */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
              {isAr ? '١. التزامنا بحماية خصوصيتك' : '1. Our Commitment to Your Privacy'}
            </h2>
            <p>
              {isAr
                ? 'تلتزم شركة إي ثري قطر (E3 Qatar) بحماية سرية وأمان البيانات الشخصية لجميع زوار موقعنا، وعملائنا، والمشاركين في فعالياتنا ومهرجاناتنا. تنطبق هذه السياسة على جميع المنصات الإلكترونية والخدمات الرقمية التي تديرها E3 داخل دولة قطر.'
                : 'E3 Qatar is deeply committed to protecting the privacy, confidentiality, and security of personal data collected from visitors, guests, corporate clients, and event attendees. This Privacy Policy governs all public platforms, applications, and digital services operated by E3 in the State of Qatar.'}
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
              {isAr ? '٢. البيانات التي نقوم بجمعها' : '2. Personal Data We Collect'}
            </h2>
            <ul className="space-y-3 list-disc list-inside text-zinc-300">
              <li>
                <strong>{isAr ? 'بيانات الهوية والاتصال:' : 'Identity & Contact Data:'}</strong>{' '}
                {isAr
                  ? 'الاسم، عنوان البريد الإلكتروني، رقم الهاتف، والجهة أو الشركة.'
                  : 'Full name, email address, phone number, and organization or company.'}
              </li>
              <li>
                <strong>{isAr ? 'بيانات التذاكر والفعاليات:' : 'Ticketing & Event Data:'}</strong>{' '}
                {isAr
                  ? 'سجلات حجز التذاكر، الباقات المختارة، والتفضيلات الخاصة بالزيارة.'
                  : 'Ticket reservations, experience packages selected, and visit preferences.'}
              </li>
              <li>
                <strong>{isAr ? 'مستندات التوظيف وعروض المشاريع (RFP):' : 'Career Applications & RFP Documents:'}</strong>{' '}
                {isAr
                  ? 'السير الذاتية والمستندات المرفوعة، والتي يتم تخزينها في خوادم مشفرة وخاصة.'
                  : 'Resumes, CVs, and RFP briefs uploaded securely to access-controlled private cloud storage.'}
              </li>
              <li>
                <strong>{isAr ? 'البيانات التقنية:' : 'Technical & Interaction Data:'}</strong>{' '}
                {isAr
                  ? 'عنوان IP، نوع المتصفح، ومعلومات الجلسة المشفرة لتحسين الأداء والأمان.'
                  : 'IP address, browser type, and encrypted session data used strictly for security and performance optimization.'}
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              {isAr ? '٣. الأغراض القانونية لمعالجة البيانات' : '3. Purpose of Processing'}
            </h2>
            <p className="mb-4">
              {isAr
                ? 'نقوم بمعالجة بياناتك وفقاً للأحكام المنصوص عليها في قانون حماية البيانات القطري للأغراض التالية:'
                : 'We process personal data in strict adherence to Qatar legal frameworks for the following lawful purposes:'}
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>{isAr ? 'إصدار التذاكر وإدارة الدخول إلى الفعاليات والوجهات الترفيهية.' : 'Issuing admission passes and managing venue access control.'}</li>
              <li>{isAr ? 'الرد على استفسارات الدعم الفني وخدمة العملاء.' : 'Responding to guest inquiries, support tickets, and feedback.'}</li>
              <li>{isAr ? 'تقييم طلبات المشاريع وعروض الأسعار للشركات (B2B RFP).' : 'Evaluating corporate project inquiries and engineering RFPs.'}</li>
              <li>{isAr ? 'معالجة طلبات التوظيف والانضمام لفريق العمل.' : 'Reviewing job applications and candidate qualifications.'}</li>
              <li>{isAr ? 'إرسال نشرات الفعاليات والأخبار بعد تأكيد الاشتراك بالبريد الإلكتروني.' : 'Delivering event announcements upon verified opt-in consent.'}</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              {isAr ? '٤. حقوق صاحب البيانات بموجب القانون القطري' : '4. Your Rights Under Qatar PDPL'}
            </h2>
            <p className="mb-4">
              {isAr
                ? 'يحق لك في أي وقت ممارسة حقوقك القانونية، بما في ذلك:'
                : 'Under State of Qatar Law No. 13 of 2016, you have specific statutory rights:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <h3 className="font-bold text-white mb-1">{isAr ? 'حق الوصول والاطلاع' : 'Right to Access'}</h3>
                <p className="text-xs text-zinc-400">{isAr ? 'طلب نسخة من بياناتك الشخصية المخزنة لدينا.' : 'Request a copy of personal data maintained in our records.'}</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <h3 className="font-bold text-white mb-1">{isAr ? 'حق التصحيح' : 'Right to Rectification'}</h3>
                <p className="text-xs text-zinc-400">{isAr ? 'تعديل وتحديث أي بيانات غير دقيقة أو غير مكتملة.' : 'Request correction of inaccurate or incomplete personal records.'}</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <h3 className="font-bold text-white mb-1">{isAr ? 'حق المحو والإلغاء' : 'Right to Erasure'}</h3>
                <p className="text-xs text-zinc-400">{isAr ? 'طلب حذف بياناتك عند انتهاء الغرض من جمعها.' : 'Request deletion of your data once retention requirements lapse.'}</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <h3 className="font-bold text-white mb-1">{isAr ? 'سحب الموافقة' : 'Withdrawal of Consent'}</h3>
                <p className="text-xs text-zinc-400">{isAr ? 'إلغاء الاشتراك في النشرات الإخبارية والتسويقية بنقرة واحدة.' : 'Withdraw consent from marketing or newsletter communications anytime.'}</p>
              </div>
            </div>
          </section>

          {/* Section 5 - Contact DPO */}
          <section className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
              {isAr ? '٥. التواصل مع مسؤول حماية البيانات' : '5. Contact Data Protection Officer'}
            </h2>
            <p className="mb-4">
              {isAr
                ? 'لأي استفسارات بخصوص هذه السياسة أو لممارسة حقوقك المتعلقة ببياناتك، يرجى التواصل مع فريق الخصوصية لدينا:'
                : 'For any inquiries regarding this policy or to exercise your statutory rights, please contact our Data Protection Officer:'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 text-sm font-medium">
              <div className="flex items-center gap-2 text-emerald-400">
                <Mail className="w-4 h-4" />
                <a href="mailto:privacy@e3.qa" className="underline hover:text-emerald-300">privacy@e3.qa</a>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin className="w-4 h-4" />
                <span>{isAr ? 'الدوحة، دولة قطر' : 'Doha, State of Qatar'}</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
