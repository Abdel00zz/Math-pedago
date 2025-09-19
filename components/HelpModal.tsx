import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-modal-title"
        >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md animate-fadeIn transition-all duration-500" aria-hidden="true"></div>
            <div 
                className="relative w-full max-w-[92vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] p-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 shadow-2xl animate-slideInUp max-h-[95vh] overflow-hidden border border-blue-100/50 backdrop-blur-sm"
            onClick={e => e.stopPropagation()}
            style={{ fontFamily: 'Inter, Poppins, system-ui, sans-serif', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)' }}
            >

                
                {/* Contenu avec scroll */}
                <div className="p-8 overflow-y-auto max-h-[calc(95vh-80px)] scrollbar-thin scrollbar-thumb-blue-300/60 scrollbar-track-transparent max-w-full" style={{
                    background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.9) 50%, rgba(236, 254, 255, 0.8) 100%)',
                    borderRadius: '16px',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    backdropFilter: 'blur(10px)'
                }}>
                    {/* Bouton de fermeture repositionné */}
                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={onClose} 
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                            aria-label="Fermer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Message d'accueil avec présentation du professeur */}
                     <div className="text-center mb-6 md:mb-8">
                         {/* Titre et présentation du professeur - design épuré */}
                           <div className="mb-8" dir="rtl" style={{
                               fontFamily: '"Playfair Display", "Amiri", serif',
                               lineHeight: '1.6'
                           }}>
                               <div className="text-2xl md:text-3xl font-light text-gray-800 text-center" style={{
                                   fontWeight: '300',
                                   letterSpacing: '0.5px'
                               }}>
                                     مرحباً بكم، أنا الأستاذ عبد المالك، وسأرافقكم في تعلم الرياضيات بخطوات واضحة ومفيدة
                                 </div>
                           </div>

                         {/* Message du professeur reformulé */}
                         <div className="text-gray-700 text-base md:text-lg font-medium leading-relaxed" style={{ fontFamily: '"Fira Sans", sans-serif' }}>
                             Découvre une approche moderne et interactive pour maîtriser les mathématiques. <strong className="text-indigo-700">Maths Mind</strong> t'accompagne dans ton apprentissage avec des outils adaptés à ton rythme.
                         </div>
                     </div>

                    {/* Contenu bilingue en deux colonnes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {/* Colonne française */}
                        <div className="space-y-3 md:space-y-5 text-gray-700 leading-relaxed" style={{ fontFamily: '"Fira Sans", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                            <div>
                                <h4 className="text-lg md:text-xl font-bold text-indigo-900 mb-2 md:mb-3">Quiz interactifs guidés par le prof</h4>
                                <div className="text-sm md:text-base text-gray-800 mb-2">
                                    Je te propose des quiz courts (Vrai/Faux, QCM) pour vérifier les prérequis et ancrer les bases. L'objectif est simple : comprendre vite, mémoriser mieux, progresser sûrement.
                                </div>
                                <ul className="list-disc pl-3 md:pl-4 space-y-1 text-gray-800">
                                    <li>Lis l'énoncé calmement et repère les mots-clés.</li>
                                    <li>Réponds, puis observe la correction pour comparer ta démarche.</li>
                                    <li>Note la méthode qui fonctionne afin de la réutiliser.</li>
                                </ul>
                            </div>

                            {/* Nouvel encart: Exercices & feedback */}
                            <div>
                                <h4 className="text-base md:text-lg font-bold text-indigo-900 mb-2 md:mb-3">Exercices : auto-évalue-toi simplement</h4>
                                <div className="text-sm md:text-base text-gray-800 mb-1">
                                    Après chaque exercice, choisis un niveau adapté. Cela m'aide à identifier tes points forts et les aspects nécessitant un soutien supplémentaire.
                                </div>
                                <ul className="list-disc pl-3 md:pl-4 space-y-1 text-indigo-800">
                                    <li><strong>Facile</strong> : tu maîtrises, passe au suivant.</li>
                                    <li><strong>Moyen</strong> : révise la méthode et refais un exercice similaire.</li>
                                    <li><strong>Difficile</strong> : on le travaille ensemble en cours, regarde le bouton « Indice » s'il existe.</li>
                                    <li><strong>Pas travaillé</strong> : acceptable et compté comme « évalué », mais pense à y revenir.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-base md:text-lg font-bold text-emerald-900 mb-2 md:mb-3">Feedback et bouton « Envoyer »</h4>
                                <div className="text-sm md:text-base text-gray-800 mb-1">
                                    En cliquant sur « Envoyer », je reçois un résumé clair de ton travail (taux de réussite, erreurs récurrentes, temps passé). Avec ces données, je te propose un plan d'entraînement ciblé.
                                </div>
                                <ul className="list-disc pl-3 md:pl-4 space-y-1 text-emerald-800">
                                    <li>Envoi possible dès que le quiz est terminé et tous les exercices évalués (même avec « Pas travaillé »).</li>
                                    <li>Recommandations personnalisées sur les concepts à revoir.</li>
                                    <li>Exercices adaptés à ton niveau actuel et conseils méthodologiques pour gagner en efficacité.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-base md:text-lg font-bold text-rose-900 mb-2 md:mb-3">Cours en direct : on progresse ensemble</h4>
                                <div className="text-sm md:text-base text-gray-800 mb-1">
                                    Pendant le cours, on corrige ensemble, tu poses tes questions sur ce qui te pose problème, et je t'aide à structurer tes étapes de résolution. Chaque difficulté devient une opportunité d'apprentissage plus profond.
                                </div>
                                <ul className="list-disc pl-3 md:pl-4 space-y-1 text-rose-800">
                                    <li>Résolution progressive des exercices difficiles.</li>
                                    <li>Astuces pour éviter les pièges et gagner du temps.</li>
                                    <li>Objectifs clairs à atteindre entre deux séances.</li>
                                </ul>
                                <div className="text-sm md:text-base text-rose-800 font-medium mt-1">
                                    Ton effort + mon accompagnement = des résultats durables.
                                </div>
                            </div>

                            {/* Autres fonctionnalités utiles */}
                            <div>
                                <h4 className="text-base md:text-lg font-bold text-sky-900 mb-2 md:mb-3">Autres fonctionnalités utiles</h4>
                                <ul className="list-disc pl-3 md:pl-4 space-y-1 text-sky-800 text-sm md:text-base">
                                    <li><strong>Notifications</strong> : un message s'affiche en haut à droite (succès, erreur, info) pour confirmer tes actions.</li>
                                    <li><strong>Tableau de bord</strong> : vois ton score de quiz et combien d'exercices sont évalués sur le total; tu peux revoir le quiz s'il est soumis.</li>
                                    <li><strong>Indices</strong> : certains exercices ont un bouton « Indice » qui ouvre une aide étape par étape.</li>
                                    <li><strong>Navigation</strong> : depuis le hub du chapitre, lance le Quiz ou les Exercices, et utilise « Précédent/Suivant » pour parcourir les questions.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Colonne arabe */}
                        <div className="space-y-3 md:space-y-5 text-gray-700 leading-relaxed" dir="rtl" style={{
                            fontFamily: '"Noto Sans Arabic", "Arabic UI Text", "Segoe UI Arabic", "Tahoma", sans-serif',
                            textAlign: 'right'
                        }}>
                            <div>
                                <h4 className="text-lg md:text-xl font-bold text-indigo-900 mb-2 md:mb-3">ابدأ من هنا: اختبارات قصيرة تفاعلية</h4>
                                <div className="text-sm md:text-base text-gray-800 mb-2">
                                     التطبيق يمكنك من إجراء اختبارات قصيرة (صحيح/خطأ واختيار من متعدد) للتحقق من المعارف القبلية وتثبيت الأساسيات. الهدف واضح: تفهم بسرعة، تحفظ بإتقان، وتتقدم بثبات.
                                 </div>
                                <ul className="list-disc pr-3 md:pr-4 space-y-1 text-gray-800">
                                    <li>اقرأ المعطيات بهدوء وحدد الكلمات المفتاحية.</li>
                                    <li>أجب ثم اطّلع على التصحيح وقارن طريقتك.</li>
                                    <li>دوّن الطريقة التي نجحت معك لتعيد استخدامها.</li>
                                </ul>
                            </div>

                            {/* جديد: التمارين ومستويات التغذية الراجعة */}
                            <div>
                                <h4 className="text-base md:text-lg font-bold text-indigo-900 mb-2 md:mb-3">التمارين: قيّم نفسك ببساطة</h4>
                                <div className="text-sm md:text-base text-gray-800 mb-1">
                                    بعد كل تمرين اختر مستوى مناسباً. هذا يساعدني على معرفة نقاط القوة والجوانب التي تحتاج دعماً إضافياً.
                                </div>
                                <ul className="list-disc pr-3 md:pr-4 space-y-1 text-indigo-800">
                                    <li><strong>سهل</strong>: أنت متقن، انتقل إلى التمرين التالي.</li>
                                    <li><strong>متوسط</strong>: راجع المنهجية وأعد تمريناً مشابهاً.</li>
                                    <li><strong>صعب</strong>: نعالجه معاً في الحصة المباشرة، واطّلع على زر «تلميح» إن وُجد.</li>
                                    <li><strong>غير منجز</strong>: مقبول ويُحتسب «مُقيّماً»، لكن تذكّر العودة إليه.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-base md:text-lg font-bold text-emerald-900 mb-2 md:mb-3">التغذية الراجعة وزر «إرسال»</h4>
                                <div className="text-sm md:text-base text-gray-800 mb-1">
                                    عند الضغط على «إرسال» يصلني ملخص واضح لعملك (نِسب النجاح، الأخطاء المتكررة، الوقت المستغرق). بهذه المعطيات أقترح لك خطة تدريب موجهة.
                                </div>
                                <ul className="list-disc pr-3 md:pr-4 space-y-1 text-emerald-800">
                                    <li>يمكن الإرسال عند إنهاء الاختبار وتقييم جميع التمارين (حتى بخيار «Pas travaillé»).</li>
                                    <li>توصيات شخصية بالمفاهيم التي تحتاج مراجعة.</li>
                                    <li>تمارين مناسبة لمستواك الحالي ونصائح منهجية لرفع الفعالية.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-base md:text-lg font-bold text-rose-900 mb-2 md:mb-3">حصص مباشرة: نتقدم معاً</h4>
                                <div className="text-sm md:text-base text-gray-800 mb-1">
                                    خلال الحصة نصحّح معاً، تسأل عمّا أشكل عليك، وأساعدك على تنظيم خطوات الحل. كل صعوبة فرصة لتعلّم أعمق.
                                </div>
                                <ul className="list-disc pr-3 md:pr-4 space-y-1 text-rose-800">
                                    <li>حل تدريجي للتمارين الصعبة.</li>
                                    <li>حيل لتجنب الأخطاء الشائعة وربح الوقت.</li>
                                    <li>أهداف واضحة بين حصتين لقياس التقدم.</li>
                                </ul>
                                <div className="text-sm md:text-base text-rose-800 font-medium mt-1">
                                    جهدُك + مرافقتي = نتائج ثابتة ومستدامة.
                                </div>
                            </div>

                            {/* ميزات أخرى مفيدة */}
                            <div>
                                <h4 className="text-base md:text-lg font-bold text-sky-900 mb-2 md:mb-3">ميزات أخرى مفيدة</h4>
                                <ul className="list-disc pr-3 md:pr-4 space-y-1 text-sky-800 text-sm md:text-base">
                                    <li><strong>الإشعارات</strong>: رسالة تظهر أعلى اليمين (نجاح، خطأ، معلومات) لتأكيد عملياتك.</li>
                                    <li><strong>لوحة المتابعة</strong>: تشاهد نتيجة الاختبار وعدد التمارين المُقيمة من المجموع؛ يمكنك مراجعة الاختبار إذا تم إرساله.</li>
                                    <li><strong>زر «تلميح»</strong>: بعض التمارين تحتوي زر «تلميح» يفتح مساعدة خطوة بخطوة.</li>
                                    <li><strong>التنقل</strong>: من مركز الفصل ابدأ الاختبار أو التمارين، واستعمل «السابق/التالي» للتنقل بين الأسئلة.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default HelpModal;