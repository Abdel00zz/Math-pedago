import React from 'react';
import Modal from './Modal';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Guide d'utilisation" className="max-w-[92vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw]">
            <div className="max-w-full p-2 md:p-3" style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '8px',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
            }}>
                {/* Message d'accueil principal en arabe */}
                <div className="text-center mb-6 md:mb-8">
                    <div className="text-xl md:text-2xl font-bold text-blue-800 mb-2" dir="rtl" style={{
                        fontFamily: '"Noto Sans Arabic", sans-serif',
                        lineHeight: '1.6'
                    }}>
                        أهلاً بكم في منصة بيداغوا للرياضيات، أنا أستاذكم عبد المالك
                    </div>
                    <h3 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: '"Fira Sans", sans-serif' }}>Excellence Pédagogique Interactive</h3>
                    {/* Phrase d'introduction en mode professeur-apprenant */}
                    <div className="text-gray-700 text-base md:text-lg font-medium leading-relaxed" style={{ fontFamily: '"Fira Sans", sans-serif' }}>
                        Je suis ton professeur Abdelmalek : je t'accompagne pas à pas. Voici comment tirer le meilleur de la plateforme.
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
                                Après chaque exercice, choisis un niveau de feedback. Cela m'aide à voir où tu es à l'aise et où tu as besoin d'un coup de pouce.
                            </div>
                            <ul className="list-disc pl-3 md:pl-4 space-y-1 text-indigo-800">
                                <li><strong>Facile</strong> : tu maîtrises, passe à la suite.</li>
                                <li><strong>Moyen</strong> : revois la méthode et refais un exercice similaire.</li>
                                <li><strong>Difficile</strong> : on le traitera ensemble en live, consulte l'indice si disponible.</li>
                                <li><strong>Pas travaillé</strong> : c'est noté (compte comme « évalué »), pense à y revenir.</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-base md:text-lg font-bold text-emerald-900 mb-2 md:mb-3">Feedback du professeur & bouton Envoyer</h4>
                            <div className="text-sm md:text-base text-gray-800 mb-1">
                                Quand tu appuies sur « Envoyer », je reçois un résumé clair de tes activités (réussites, erreurs récurrentes, temps passé). Avec ces informations, je te propose un plan d'entraînement ciblé.
                            </div>
                            <ul className="list-disc pl-3 md:pl-4 space-y-1 text-emerald-800">
                                <li>Pour envoyer, termine le quiz et évalue tous les exercices (même avec « Pas travaillé »).</li>
                                <li>Recommandations personnalisées sur les notions à revoir.</li>
                                <li>Exercices adaptés à ton niveau actuel et conseils méthodologiques.</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-base md:text-lg font-bold text-rose-900 mb-2 md:mb-3">Séances live : on progresse ensemble</h4>
                            <div className="text-sm md:text-base text-gray-800 mb-1">
                                Pendant les séances, on corrige ensemble, tu poses tes questions et je t'aide à structurer ta démarche. Chaque difficulté devient une opportunité d'apprendre.
                            </div>
                            <ul className="list-disc pl-3 md:pl-4 space-y-1 text-rose-800">
                                <li>Résolution pas à pas des exercices difficiles.</li>
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
                            <h4 className="text-lg md:text-xl font-bold text-indigo-900 mb-2 md:mb-3">ابدأ من هنا: اختبارات قصيرة بإشراف الأستاذ</h4>
                            <div className="text-sm md:text-base text-gray-800 mb-2">
                                أرافقك باختبارات قصيرة (صحيح/خطأ واختيار من متعدد) للتحقق من المعارف القبلية وتثبيت الأساسيات. الهدف واضح: تفهم بسرعة، تحفظ بإتقان، وتتقدم بثبات.
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

                {/* Pied de page enrichi */}
                <div className="text-center mt-3 md:mt-5 pt-3 md:pt-4 border-t border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg">
                    <div className="mb-1 md:mb-2">
                        <div className="text-xs md:text-sm font-medium text-blue-800">
                            🚀 <strong>Plateforme d'excellence pédagogique</strong>
                        </div>
                    </div>
                    <div className="text-xs md:text-sm text-blue-700">
                        Développé par société <span className="font-bold text-blue-900">"تطوير"</span>
                    </div>
                    <div className="text-[11px] md:text-xs text-blue-600 mt-1">
                        Innovation • Pédagogie • Réussite
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default HelpModal;