import React, { useState } from 'react';
import Modal from './Modal';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FrenchContent: React.FC = () => (
    <div className="help-content">
        <div className="help-section help-section--intro">
            <h3 className="help-section__title">Bienvenue au Center Scientific of Mathematics !</h3>
            <p className="help-section__text">Votre centre scolaire interactif, ouvert 24h/24 et 7j/7.</p>
        </div>
        
        <div className="help-section">
            <h4 className="help-section__heading">Leçons Interactives</h4>
            <p className="help-section__text">Explorez des cours structurés avec définitions, théorèmes et exemples. Naviguez entre les sections, prenez votre temps et maîtrisez chaque concept à votre rythme.</p>
        </div>
        
        <div className="help-section">
            <h4 className="help-section__heading">Capsules Vidéos</h4>
            <p className="help-section__text">Regardez des vidéos courtes et ciblées pour mieux comprendre les notions complexes. Chaque vidéo complète la leçon avec des explications visuelles claires.</p>
        </div>

        <div className="help-section">
            <h4 className="help-section__heading">Quiz Interactifs</h4>
            <p className="help-section__text">Testez vos connaissances avec des quiz courts. Lisez bien, répondez, puis analysez la correction pour progresser.</p>
        </div>
        
        <div className="help-section">
            <h4 className="help-section__heading">Exercices & Auto-évaluation</h4>
            <p className="help-section__text">Après chaque exercice, évaluez votre ressenti pour m'aider à identifier vos points forts et les notions à renforcer.</p>
            <ul className="help-list">
                <li><strong className="text-success">J'ai réussi facilement</strong> : Vous maîtrisez !</li>
                <li><strong className="text-warning">J'ai réfléchi</strong> : Bien, la pratique consolide.</li>
                <li><strong className="text-error">C'était un défi</strong> : Parfait pour en discuter en cours.</li>
            </ul>
        </div>

        <div className="help-section">
            <h4 className="help-section__heading">Finaliser et Envoyer</h4>
            <p className="help-section__text">Une fois tout complété, envoyez votre travail. Je reçois un résumé de votre progression pour un accompagnement personnalisé.</p>
        </div>

        <div className="help-section help-section--contact">
            <h4 className="help-section__heading">Cours en Direct</h4>
            <p className="help-section__text">Pendant nos séances, nous corrigeons les exercices, répondons aux questions et structurons les méthodes. Chaque difficulté est une opportunité d'apprendre.</p>
            <div className="help-contact">
                <p className="help-contact__label">Pour me contacter :</p>
                <div className="help-contact__buttons">
                    <a href="https://web.facebook.com/Maths.new.horizons" target="_blank" rel="noopener noreferrer" className="help-contact__btn help-contact__btn--facebook">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                        <span>Facebook</span>
                    </a>
                    <a href="https://wa.me/212674680119" target="_blank" rel="noopener noreferrer" className="help-contact__btn help-contact__btn--whatsapp">
                        <span className="material-symbols-outlined text-xl">chat</span>
                        <span>WhatsApp</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
);

const ArabicContent: React.FC = () => (
    <div className="help-content" dir="rtl">
        <div className="help-section help-section--intro">
            <h3 className="help-section__title">! مرحباً بكم في المركز العلمي للرياضيات</h3>
            <p className="help-section__text">مركزكم الدراسي التفاعلي، مفتوح 24 ساعة طوال أيام الأسبوع.</p>
        </div>

        <div className="help-section">
            <h4 className="help-section__heading">دروس تفاعلية</h4>
            <p className="help-section__text">استكشفوا دروساً منظمة مع تعاريف ونظريات وأمثلة. تنقلوا بين الأقسام وخذوا وقتكم لإتقان كل مفهوم.</p>
        </div>
        
        <div className="help-section">
            <h4 className="help-section__heading">كبسولات فيديو</h4>
            <p className="help-section__text">شاهدوا مقاطع فيديو قصيرة ومركزة لفهم أفضل للمفاهيم المعقدة. كل فيديو يكمل الدرس بشروحات بصرية واضحة.</p>
        </div>

        <div className="help-section">
            <h4 className="help-section__heading">اختبارات تفاعلية</h4>
            <p className="help-section__text">اختبروا معارفكم باختبارات قصيرة. اقرأوا، أجيبوا، ثم حللوا التصحيح للتقدم.</p>
        </div>

        <div className="help-section">
            <h4 className="help-section__heading">التمارين والتقييم الذاتي</h4>
            <p className="help-section__text">بعد كل تمرين، قيّموا شعوركم لمساعدتي على تحديد نقاط قوتكم والمفاهيم التي تحتاج تعزيز.</p>
            <ul className="help-list">
                <li><strong className="text-success">نجحت بسهولة</strong> : أنتم تتقنون!</li>
                <li><strong className="text-warning">احتجت للتفكير</strong> : جيد، الممارسة تثبت.</li>
                <li><strong className="text-error">كان تحدياً</strong> : ممتاز لمناقشته في الحصة.</li>
            </ul>
        </div>

        <div className="help-section">
            <h4 className="help-section__heading">إنهاء وإرسال</h4>
            <p className="help-section__text">بعد إكمال كل شيء، أرسلوا عملكم. أتلقى ملخصاً لمرافقة شخصية.</p>
        </div>

        <div className="help-section help-section--contact">
            <h4 className="help-section__heading">الحصص المباشرة</h4>
            <p className="help-section__text">خلال حصصنا، نصحح التمارين ونجيب على الأسئلة وننظم طرق الحل. كل صعوبة فرصة للتعلم.</p>
            <div className="help-contact">
                <p className="help-contact__label">للتواصل معي :</p>
                <div className="help-contact__buttons">
                    <a href="https://web.facebook.com/Maths.new.horizons" target="_blank" rel="noopener noreferrer" className="help-contact__btn help-contact__btn--facebook">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                        <span>فيسبوك</span>
                    </a>
                    <a href="https://wa.me/212674680119" target="_blank" rel="noopener noreferrer" className="help-contact__btn help-contact__btn--whatsapp">
                        <span className="material-symbols-outlined text-xl">chat</span>
                        <span>واتساب</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
);

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'fr' | 'ar'>('fr');

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Guide d'utilisation"
            className="help-modal"
        >
            {/* Tabs */}
            <div className="help-modal__tabs">
                <button
                    onClick={() => setActiveTab('fr')}
                    className={`help-modal__tab ${activeTab === 'fr' ? 'help-modal__tab--active' : ''}`}
                >
                    Français
                </button>
                <button
                     onClick={() => setActiveTab('ar')}
                     className={`help-modal__tab ${activeTab === 'ar' ? 'help-modal__tab--active' : ''}`}
                >
                    العربية
                </button>
            </div>

            {/* Content */}
            <div className="help-modal__content">
                {activeTab === 'fr' ? <FrenchContent /> : <ArabicContent />}
            </div>
        </Modal>
    );
};

export default HelpModal;