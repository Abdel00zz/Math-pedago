import React, { useState } from 'react';
import Modal from './Modal';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpSection: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="relative rounded-lg p-5 overflow-hidden shadow-sm"
         style={{
             background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)'
         }}>
        <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id={`pattern-${icon}`} width="30" height="30" patternUnits="userSpaceOnUse">
                        <circle cx="15" cy="15" r="1" fill="currentColor" className="text-primary" opacity="0.4"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#pattern-${icon})`} />
            </svg>
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary rounded-full p-2 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <h4 className="text-lg font-bold text-foreground">{title}</h4>
            </div>
            <div className="mt-3 pl-12 text-sm text-muted-foreground space-y-2">
                {children}
            </div>
        </div>
    </div>
);

const FrenchContent: React.FC = () => (
    <div className="space-y-4">
        <div className="relative text-center p-6 rounded-lg overflow-hidden mb-6"
             style={{
                 background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)'
             }}>
            <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="header-pattern" width="50" height="50" patternUnits="userSpaceOnUse">
                            <circle cx="25" cy="25" r="2" fill="currentColor" className="text-primary" opacity="0.3"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#header-pattern)" />
                </svg>
            </div>
            <div className="relative z-10">
                <h3 className="text-2xl font-extrabold tracking-tight text-foreground">Bienvenue au Center Scientific of Mathematics !</h3>
                <p className="mt-1 text-base text-muted-foreground">Votre centre scolaire interactif, ouvert 24h/24 et 7j/7.</p>
            </div>
        </div>
        
        <HelpSection icon="menu_book" title="Leçons Interactives">
            <p>Explorez des cours structurés avec définitions, théorèmes et exemples. Naviguez entre les sections, prenez votre temps et maîtrisez chaque concept à votre rythme.</p>
        </HelpSection>
        
        <HelpSection icon="smart_display" title="Capsules Vidéos">
            <p>Regardez des vidéos courtes et ciblées pour mieux comprendre les notions complexes. Chaque vidéo complète la leçon avec des explications visuelles claires.</p>
        </HelpSection>

        <HelpSection icon="quiz" title="Quiz Interactifs">
            <p>Testez vos connaissances avec des quiz courts. Lisez bien, répondez, puis analysez la correction pour progresser.</p>
        </HelpSection>
        
        <HelpSection icon="rate_review" title="Exercices & Auto-évaluation">
            <p>Après chaque exercice, évaluez votre ressenti pour m'aider à identifier vos points forts et les notions à renforcer.</p>
            <ul className="exercise-list-bullet space-y-1 mt-2">
                <li><strong className="text-green-500">J'ai réussi facilement</strong> : Vous maîtrisez !</li>
                <li><strong className="text-yellow-500">J'ai réfléchi</strong> : Bien, la pratique consolide.</li>
                <li><strong className="text-red-500">C'était un défi</strong> : Parfait pour en discuter en cours.</li>
            </ul>
        </HelpSection>

        <HelpSection icon="task_alt" title="Finaliser et Envoyer">
            <p>Une fois tout complété, envoyez votre travail. Je reçois un résumé de votre progression pour un accompagnement personnalisé.</p>
        </HelpSection>

        <div className="relative rounded-lg p-5 text-center overflow-hidden shadow-sm"
             style={{
                 background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)'
             }}>
            <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="contact-pattern-fr" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="20" cy="20" r="1.5" fill="currentColor" className="text-primary" opacity="0.4"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#contact-pattern-fr)" />
                </svg>
            </div>
            <div className="relative z-10">
                <h4 className="text-lg font-bold text-foreground">Cours en Direct & Contact</h4>
                <p className="mt-2 text-sm text-muted-foreground">Pendant nos séances, nous corrigeons les exercices, répondons aux questions et structurons les méthodes. Chaque difficulté est une opportunité d'apprendre.</p>
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a href="https://web.facebook.com/Maths.new.horizons" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#1877F2] text-white font-semibold hover:bg-[#166eab] transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                        <span>Facebook</span>
                    </a>
                    <a href="https://wa.me/212674680119" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#25D366] text-white font-semibold hover:bg-[#1ebe58] transition-colors">
                        <span className="material-symbols-outlined text-xl">chat</span>
                        <span>WhatsApp</span>
                    </a>
                    <a
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=bdh.malek@gmail.com&su=Assistance%20Pedago&body=Bonjour%20Abdelmalek,%0A%0A"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#EA4335] text-white font-semibold hover:bg-[#c53727] transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">mail</span>
                        <span>Gmail</span>
                    </a>
                </div>
            </div>
        </div>

        <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
                Plateforme créée avec <span className="text-red-500">passion</span> par Boudouh Abdelmalek au Maroc
            </p>
        </div>
    </div>
);

const ArabicContent: React.FC = () => (
    <div className="space-y-4" dir="rtl">
        <div className="relative text-center p-6 rounded-lg overflow-hidden mb-6"
             style={{
                 background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)'
             }}>
            <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="header-pattern-ar" width="50" height="50" patternUnits="userSpaceOnUse">
                            <circle cx="25" cy="25" r="2" fill="currentColor" className="text-primary" opacity="0.3"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#header-pattern-ar)" />
                </svg>
            </div>
            <div className="relative z-10">
                <h3 className="text-2xl font-extrabold tracking-tight text-foreground">! مرحباً بكم في المركز العلمي للرياضيات</h3>
                <p className="mt-1 text-base text-muted-foreground">.مركزكم الدراسي التفاعلي، مفتوح 24 ساعة طوال أيام الأسبوع</p>
            </div>
        </div>

        <HelpSection icon="menu_book" title="دروس تفاعلية">
            <p>استكشفوا دروساً منظمة مع تعاريف ونظريات وأمثلة. تنقلوا بين الأقسام وخذوا وقتكم لإتقان كل مفهوم.</p>
        </HelpSection>
        
        <HelpSection icon="smart_display" title="كبسولات فيديو">
            <p>شاهدوا مقاطع فيديو قصيرة ومركزة لفهم أفضل للمفاهيم المعقدة. كل فيديو يكمل الدرس بشروحات بصرية واضحة.</p>
        </HelpSection>

        <HelpSection icon="quiz" title="اختبارات تفاعلية">
            <p>اختبروا معارفكم باختبارات قصيرة. اقرأوا، أجيبوا، ثم حللوا التصحيح للتقدم.</p>
        </HelpSection>

        <HelpSection icon="rate_review" title="التمارين والتقييم الذاتي">
            <p>بعد كل تمرين، قيّموا شعوركم لمساعدتي على تحديد نقاط قوتكم والمفاهيم التي تحتاج تعزيز.</p>
            <ul className="exercise-list-bullet space-y-1 mt-2">
                <li><strong className="text-green-500">نجحت بسهولة</strong> : أنتم تتقنون!</li>
                <li><strong className="text-yellow-500">احتجت للتفكير</strong> : جيد، الممارسة تثبت.</li>
                <li><strong className="text-red-500">كان تحدياً</strong> : ممتاز لمناقشته في الحصة.</li>
            </ul>
        </HelpSection>

        <HelpSection icon="task_alt" title="إنهاء وإرسال">
            <p>بعد إكمال كل شيء، أرسلوا عملكم. أتلقى ملخصاً لمرافقة شخصية.</p>
        </HelpSection>

        <div className="relative rounded-lg p-5 text-center overflow-hidden shadow-sm"
             style={{
                 background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)'
             }}>
            <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="contact-pattern-ar" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="20" cy="20" r="1.5" fill="currentColor" className="text-primary" opacity="0.4"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#contact-pattern-ar)" />
                </svg>
            </div>
            <div className="relative z-10">
                <h4 className="text-lg font-bold text-foreground">الحصص المباشرة والتواصل</h4>
                <p className="mt-2 text-sm text-muted-foreground">.خلال حصصنا، نصحح التمارين ونجيب على الأسئلة وننظم طرق الحل. كل صعوبة فرصة للتعلم</p>
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a href="https://web.facebook.com/Maths.new.horizons" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#1877F2] text-white font-semibold hover:bg-[#166eab] transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                        <span>فيسبوك</span>
                    </a>
                    <a href="https://wa.me/212674680119" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#25D366] text-white font-semibold hover:bg-[#1ebe58] transition-colors">
                        <span className="material-symbols-outlined text-xl">chat</span>
                        <span>واتساب</span>
                    </a>
                    <a
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=bdh.malek@gmail.com&su=Assistance%20Pedago&body=Bonjour%20Abdelmalek,%0A%0A"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#EA4335] text-white font-semibold hover:bg-[#c53727] transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">mail</span>
                        <span>Gmail</span>
                    </a>
                </div>
            </div>
        </div>

        <div className="mt-8 text-center" dir="ltr">
            <p className="text-sm text-muted-foreground">
                Conçu et développé par بدوح عبد المالك — تصميم وتطوير
            </p>
        </div>
    </div>
);

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'fr' | 'ar'>('fr');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Guide d'Utilisation"
            titleClassName="text-2xl font-bold text-foreground"
            hideHeaderBorder={false}
            className="sm:max-w-4xl md:max-w-5xl landscape:max-w-[90vw] landscape:max-h-[90vh]"
        >
            <div className="p-2">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('fr')}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all focus:outline-none ${
                            activeTab === 'fr' 
                                ? 'bg-primary text-primary-foreground shadow-sm' 
                                : 'bg-transparent text-muted-foreground hover:bg-accent'
                        }`}
                    >
                        Français
                    </button>
                    <button
                        onClick={() => setActiveTab('ar')}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all focus:outline-none ${
                            activeTab === 'ar' 
                                ? 'bg-primary text-primary-foreground shadow-sm' 
                                : 'bg-transparent text-muted-foreground hover:bg-accent'
                        }`}
                    >
                        العربية
                    </button>
                </div>

                {/* Content */}
                <div className="pb-4 px-2 max-h-[75vh] landscape:max-h-[70vh] overflow-y-auto">
                    {activeTab === 'fr' ? <FrenchContent /> : <ArabicContent />}
                </div>
            </div>
        </Modal>
    );
};

export default HelpModal;