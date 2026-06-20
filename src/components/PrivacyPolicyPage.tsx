/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Mail, Cookie, Link2 } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
  lang: 'en' | 'fr' | 'ar';
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack, lang }) => {
  const isRtl = lang === 'ar';

  const content = {
    ar: {
      title: "سياسة الخصوصية - ModsDrive",
      subtitle: "آخر تحديث: يونيو 2026",
      backBtn: "العودة للرئيسية",
      sections: [
        {
          id: "section-1",
          title: "القسم 1 - ما نجمعه:",
          icon: "eye",
          desc: "لا يتطلب ModsDrive تسجيل حساب أو حساب شخصي البيانات من الزوار. نقوم فقط بتخزين معلومات التعديل (الاسم، الوصف والصور وروابط التنزيل) في قاعدة البيانات الخاصة بنا."
        },
        {
          id: "section-2",
          title: "القسم الثاني – التنزيلات والروابط الخارجية:",
          icon: "link",
          desc: "تتم استضافة ملفات Mod على منصات خارجية مثل ModsFire (modsfire.com). عندما تضغط على زر التحميل، سوف تكون إعادة توجيه إلى مصدر خارجي. نحن لسنا مسؤولين عن المحتوى أو ممارسات الخصوصية لهذه المواقع الخارجية."
        },
        {
          id: "section-3",
          title: "القسم 3 - ملفات تعريف الارتباط:",
          icon: "cookie",
          desc: "قد يستخدم موقعنا الإلكتروني Google AdSense لعرض الإعلانات، وهو ما قد يحدث استخدم ملفات تعريف الارتباط لعرض الإعلانات ذات الصلة. يمكنك المراجعة سياسة خصوصية Google على موقعهم الرسمي."
        },
        {
          id: "section-4",
          title: "القسم 4 - حق المؤلف:",
          icon: "shield",
          desc: "يتم إنشاء التعديلات المعروضة بواسطة منشئي محتوى المجتمع. إذا كنت تعتقد أن التعديل ينتهك حقوق الطبع والنشر الخاصة بك، يرجى الاتصال بنا للإزالة."
        }
      ],
      contactTitle: "القسم 5 - الاتصال:",
      contactDesc: "لأية أسئلة حول هذه السياسة، اتصل بنا على: ",
      email: "modsdrive06@gmail.com"
    },
    en: {
      title: "Privacy Policy - ModsDrive",
      subtitle: "Last Updated: June 2026",
      backBtn: "Back to Home",
      sections: [
        {
          id: "section-1",
          title: "Section 1 - What We Collect:",
          icon: "eye",
          desc: "ModsDrive does not require user registration or any personal data from visitors. We only store mod specifications (name, description, imagery, and download links) in our database."
        },
        {
          id: "section-2",
          title: "Section 2 - Downloads & External Links:",
          icon: "link",
          desc: "Mod files are hosted on external platforms like ModsFire (modsfire.com). When you click the download button, you will be redirected to an external source. We are not responsible for the content or privacy practices of these external sites."
        },
        {
          id: "section-3",
          title: "Section 3 - Cookies:",
          icon: "cookie",
          desc: "Our website may use Google AdSense to serve advertisements, which may use cookies to show relevant ads. You can review Google's privacy policy on their official website."
        },
        {
          id: "section-4",
          title: "Section 4 - Copyright:",
          icon: "shield",
          desc: "The displayed mods are created by community content creators. If you believe a mod violates your copyright, please contact us for removal."
        }
      ],
      contactTitle: "Section 5 - Contact:",
      contactDesc: "For any questions about this policy, contact us at: ",
      email: "modsdrive06@gmail.com"
    },
    fr: {
      title: "Politique de Confidentialité - ModsDrive",
      subtitle: "Dernière mise à jour: Juin 2026",
      backBtn: "Retour à l'accueil",
      sections: [
        {
          id: "section-1",
          title: "Section 1 - Ce que nous collectons:",
          icon: "eye",
          desc: "ModsDrive ne nécessite pas d'enregistrement de compte ou de données personnelles des visiteurs. Nous stockons uniquement les informations sur les mods (nom, description, images et liens de téléchargement) dans notre base de données."
        },
        {
          id: "section-2",
          title: "Section 2 - Téléchargements & Liens Externes:",
          icon: "link",
          desc: "Les fichiers de mod sont hébergés sur des plateformes externes comme ModsFire (modsfire.com). Lorsque vous cliquez sur le bouton de téléchargement, vous serez redirigé vers une source externe. Nous ne sommes pas responsables du contenu ou des pratiques de confidentialité de ces sites externes."
        },
        {
          id: "section-3",
          title: "Section 3 - Cookies:",
          icon: "cookie",
          desc: "Notre site Web peut utiliser Google AdSense pour diffuser des annonces, ce qui peut utiliser des cookies pour afficher des annonces pertinentes. Vous pouvez consulter les règles de confidentialité de Google sur leur site officiel."
        },
        {
          id: "section-4",
          title: "Section 4 - Droit d'auteur:",
          icon: "shield",
          desc: "Les mods affichés sont créés par des créateurs de contenu de la communauté. Si vous pensez qu'un mod enfreint vos droits d'auteur, veuillez nous contacter pour sa suppression."
        }
      ],
      contactTitle: "Section 5 - Contact:",
      contactDesc: "Pour toute question concernant cette politique, contactez-nous au: ",
      email: "modsdrive06@gmail.com"
    }
  };

  const t = content[lang] || content.en;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'eye':
        return <Eye className="w-5 h-5 text-brand-cyan" />;
      case 'link':
        return <Link2 className="w-5 h-5 text-brand-cyan" />;
      case 'cookie':
        return <Cookie className="w-5 h-5 text-brand-cyan" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-brand-cyan" />;
      default:
        return <Lock className="w-5 h-5 text-brand-cyan" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-4" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      {/* Navigation Return */}
      <button
        onClick={onBack}
        className={`flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-brand-cyan mb-8 cursor-pointer select-none transition-colors duration-200 group active:scale-95 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-brand-cyan/20`}
      >
        <ArrowLeft className={`w-4 h-4 transition-transform duration-200 ${isRtl ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
        <span>{t.backBtn}</span>
      </button>

      {/* Hero Header Area */}
      <div className="mb-10 text-center relative overflow-hidden rounded-2xl border border-white/5 bg-[#0e0e12] p-8 sm:p-12 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-brand-cyan/15 rounded-full border border-brand-cyan/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
            <Shield className="w-8 h-8 text-brand-cyan" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mb-2">{t.title}</h1>
        <p className="text-sm text-slate-500 font-mono">{t.subtitle}</p>
      </div>

      {/* Styled Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {t.sections.map((section) => (
          <div 
            key={section.id} 
            className="p-6 rounded-xl border border-white/5 bg-[#0e0e12]/95 hover:border-white/10 transition-colors duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                {getIcon(section.icon)}
                <h2 className="text-base font-bold text-slate-100">{section.title}</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{section.desc}</p>
            </div>
          </div>
        ))}

        {/* Contact Module spans full width */}
        <div className="p-6 rounded-xl border border-white/5 bg-brand-cyan/5 border-dashed border-brand-cyan/25 md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-brand-cyan" />
              <h2 className="text-base font-bold text-slate-100">{t.contactTitle}</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {t.contactDesc}
            </p>
          </div>
          <a
            href={`mailto:${t.email}`}
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-black bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-all duration-200 select-none shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-95 self-start sm:self-auto"
          >
            {t.email}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

