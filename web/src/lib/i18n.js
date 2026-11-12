// English at the root, Arabic under /ar/. Page content comes from PocketBase (*_ar fields); this file holds the fixed UI text.

export const langOf = (url) => (/^\/ar(\/|$)/.test(url.pathname) ? "ar" : "en");

/** Internal link in the given language: href("ar", "/about/") -> "/ar/about/". External links pass through. */
export const href = (lang, path) => (lang === "ar" && path?.startsWith("/") && !path.startsWith("/api/") ? "/ar" + path : path);

/** The same page in the other language. */
export const alternate = (url) => (langOf(url) === "ar" ? url.pathname.replace(/^\/ar/, "") || "/" : "/ar" + url.pathname);

export const ui = {
  en: {
    dir: "ltr", ogLocale: "en_US",
    switchLabel: "العربية", switchLang: "ar", switchTitle: "النسخة العربية",
    skip: "Skip to content", home: "Home", about: "About", services: "Services", contact: "Contact",
    homeAria: "home", menu: "Menu", mainNav: "Main", breadcrumb: "Breadcrumb",
    callUs: "Call us", profile: "Company profile", profileDownload: "Download company profile",
    callKicker: "Have a project in mind? Give us a call", contactUs: "Contact us",
    resources: "Resources", reachUs: "Reach Us", rights: "All rights reserved.", whatsapp: "Chat on WhatsApp",
    titleSuffix: "Right Standard Contracting Company", heroSr: "Right Standard ",
    ourFields: "Our fields", viewAll: "View all services", prev: "Previous services", next: "Next services",
    clientLogo: (n) => `Client ${n} logo`, projectAlt: (f) => `${f} project by Right Standard`, moreExplore: "More Explore",
    introAlt: "Right Standard engineers on a construction site",
    founderName: "Engr. Abdallah Nazir Halawani", founderRole: "Founder & CEO", founderAlt: "Engr. Abdallah Nazir Halawani, Founder & CEO",
    ourServices: "Our Services", quote: "Request a Quote", photo: (s, n) => `${s} work by Right Standard, photo ${n}`,
    contactAlt: "Right Standard engineer on a call", firstName: "First name", lastName: "Last name",
    email: "Email address", message: "Your message", send: "Send Message", map: "Map: Saudi Arabia",
    office: "Office Address", phone: "Phone Number", mail: "Mail Address",
    sending: "Sending…", sent: "Thank you for your message. We will get back to you soon.",
    failed: "Sorry, your message could not be sent. Please call or email us instead.",
    notFoundTitle: "Page Not Found", notFoundH1: "Page not found", notFoundText: "The page you are looking for has moved or no longer exists.",
    notFoundDesc: "The page you are looking for does not exist.", backHome: "Back to Home",
  },
  ar: {
    dir: "rtl", ogLocale: "ar_SA",
    switchLabel: "English", switchLang: "en", switchTitle: "English version",
    skip: "تخطَّ إلى المحتوى", home: "الرئيسية", about: "من نحن", services: "خدماتنا", contact: "تواصل معنا",
    homeAria: "الصفحة الرئيسية", menu: "القائمة", mainNav: "القائمة الرئيسية", breadcrumb: "مسار التنقل",
    callUs: "اتصل بنا", profile: "ملف الشركة", profileDownload: "تحميل ملف الشركة",
    callKicker: "لديك مشروع؟ اتصل بنا الآن", contactUs: "تواصل معنا",
    resources: "روابط سريعة", reachUs: "معلومات التواصل", rights: "جميع الحقوق محفوظة.", whatsapp: "تواصل معنا عبر واتساب",
    titleSuffix: "شركة المعيار الصحيح للمقاولات العامة", heroSr: "",
    ourFields: "مجالات عملنا", viewAll: "عرض جميع الخدمات", prev: "الخدمات السابقة", next: "الخدمات التالية",
    clientLogo: (n) => `شعار العميل ${n}`, projectAlt: (f) => `مشروع ${f} من تنفيذ المعيار الصحيح`, moreExplore: "اكتشف المزيد",
    introAlt: "مهندسو المعيار الصحيح في موقع إنشاء",
    founderName: "المهندس عبد الله نذير حلواني", founderRole: "المؤسس والرئيس التنفيذي", founderAlt: "المهندس عبد الله نذير حلواني، المؤسس والرئيس التنفيذي",
    ourServices: "خدماتنا", quote: "اطلب عرض سعر", photo: (s, n) => `${s} من أعمال المعيار الصحيح، صورة ${n}`,
    contactAlt: "مهندس من المعيار الصحيح خلال مكالمة", firstName: "الاسم الأول", lastName: "اسم العائلة",
    email: "البريد الإلكتروني", message: "رسالتك", send: "إرسال الرسالة", map: "خريطة: المملكة العربية السعودية",
    office: "عنوان المكتب", phone: "رقم الهاتف", mail: "البريد الإلكتروني",
    sending: "جارٍ الإرسال…", sent: "شكرًا لتواصلك معنا، سنعاود الاتصال بك في أقرب وقت.",
    failed: "عذرًا، تعذّر إرسال رسالتك. يُرجى التواصل معنا هاتفيًا أو عبر البريد الإلكتروني.",
    notFoundTitle: "الصفحة غير موجودة", notFoundH1: "الصفحة غير موجودة", notFoundText: "الصفحة التي تبحث عنها نُقلت أو لم تعد متوفرة.",
    notFoundDesc: "الصفحة التي تبحث عنها غير موجودة.", backHome: "العودة إلى الرئيسية",
  },
};
