
import { ChapterData, QuizQuestion, Exercise, Video, QuizOption, SubQuestion, SubSubQuestion, ExerciseImage, Hint, ConcoursData, ConcoursQuestion, ConcoursResume, ConcoursResumeSection } from '../types';

/**
 * Extrait le type de classe à partir du nom de fichier
 * Exemples:
 * - "1bse_calcul.json" -> "1BSE"
 * - "1bsm_logique.json" -> "1BSM"
 * - "2bse_limites.json" -> "2BSE"
 */
function extractClassTypeFromFilename(filename: string): string {
    const match = filename.match(/^([^_]+)_/);
    if (match) {
        return match[1].toUpperCase();
    }
    return filename.replace(/\.json$/i, '').toUpperCase();
}

/**
 * Extrait le nom du chapitre à partir du nom de fichier
 */
function extractChapterNameFromFilename(filename: string): string {
    const withoutExt = filename.replace(/\.json$/i, '');
    const withoutPrefix = withoutExt.replace(/^[^_]+_/, '');
    const withSpaces = withoutPrefix.replace(/_/g, ' ');
    return withSpaces.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function parseChapterFile(content: string, manifestEntry: any, classType?: string): ChapterData {
    const data = JSON.parse(content);

    // Normaliser le class_type en minuscules pour correspondre au manifest
    const detectedClassType = (classType || extractClassTypeFromFilename(manifestEntry.file || '')).toLowerCase();
    const detectedChapterName = data.chapter || extractChapterNameFromFilename(manifestEntry.file || '');

    const chapter: ChapterData = {
        id: manifestEntry.id,
        file_name: manifestEntry.file,
        is_active: manifestEntry.isActive,
        version: data.version || manifestEntry.version,
        class_type: detectedClassType,
        chapter_name: detectedChapterName,
        session_dates: data.sessionDates || [],
        lessonFile: data.lessonFile || undefined, // Optional lesson file path
        videos: (data.videos || []).map((v: any): Video => ({
            id: v.id || '',
            title: v.title || '',
            youtubeId: v.youtubeId || '',
            duration: v.duration || '',
            description: v.description || '',
            thumbnail: v.thumbnail || '',
        })),
        quiz_questions: (data.quiz || []).map((q: any): QuizQuestion => {
            const questionType = q.type || 'mcq';
            const options = (q.options || []).map((opt: any): QuizOption => ({
                text: opt.text || '',
                is_correct: opt.is_correct !== undefined ? opt.is_correct : (opt.isCorrect || false),
                explanation: opt.explanation || null
            }));

            // Handle explanation being at the question level
            if (q.explanation) {
                const correctOption = options.find(o => o.is_correct);
                if (correctOption && !correctOption.explanation) {
                    correctOption.explanation = q.explanation;
                }
            }

            return {
                id: q.id || '',
                question: q.question || '',
                type: questionType,
                options: options,
                steps: q.steps || []
            }
        }),
        exercises: (data.exercises || []).map((e: any): Exercise => {
            const hintsByQuestionNumber: { [key: string]: string } = {};
            if (e.hint && Array.isArray(e.hint)) {
                for (const hint of e.hint) {
                    if (hint.questionNumber && hint.text) {
                        hintsByQuestionNumber[hint.questionNumber] = hint.text;
                    }
                }
            }
            
            return {
                id: e.id || '',
                title: e.title || '',
                statement: e.statement || '',
                sub_questions: (e.sub_questions || []).map((sq: any, index: number): SubQuestion => {
                    const questionNumber = sq.questionNumber || (index + 1).toString();
                    return {
                        text: sq.text || '',
                        questionNumber: questionNumber,
                        sub_sub_questions: (sq.sub_sub_questions || []).map((ssq: any): SubSubQuestion => ({
                            text: ssq.text || '',
                        })),
                        hint: hintsByQuestionNumber[questionNumber] || null,
                        images: (sq.images || []).map((img: any): ExerciseImage => ({
                            id: img.id || '',
                            path: img.path || '',
                            caption: img.caption || '',
                            size: img.size || 'medium',
                            custom_width: img.customWidth || img.custom_width || null,
                            custom_height: img.customHeight || img.custom_height || null,
                            position: img.position || 'center',
                            alignment: img.alignment || 'center',
                            alt: img.alt || '',
                        })),
                    }
                }),
                hint: e.hint || [],
                images: (e.images || []).map((img: any): ExerciseImage => ({
                    id: img.id || `img_${Date.now()}_${Math.random()}`,
                    path: img.path || '',
                    caption: img.caption || '',
                    size: img.size || 'medium',
                    custom_width: img.customWidth || img.custom_width || null,
                    custom_height: img.customHeight || img.custom_height || null,
                    position: img.position || 'center',
                    alignment: img.alignment || 'center',
                    alt: img.alt || img.caption || '',
                })),
            };
        }),
        concours: (data.concours || []).map((c: any): ConcoursData => ({
            id: c.id || '',
            concours: c.concours || '',
            annee: c.annee || '',
            theme: c.theme || '',
            resume: {
                title: c.resume?.title || '',
                introduction: c.resume?.introduction || '',
                sections: (c.resume?.sections || []).map((s: any): ConcoursResumeSection => ({
                    type: s.type || 'definitions',
                    title: s.title || '',
                    items: s.items || [],
                })),
            },
            quiz: (c.quiz || []).map((q: any): ConcoursQuestion => ({
                id: q.id || '',
                theme: q.theme || c.theme || '',
                question: q.question || '',
                type: q.type || 'mcq',
                options: (q.options || []).map((opt: any) => ({
                    id: opt.id || '',
                    text: opt.text || '',
                    isCorrect: opt.isCorrect !== undefined ? opt.isCorrect : (opt.is_correct || false),
                })),
                explanation: q.explanation || '',
                hints: q.hints || [],
            })),
        })),
    };
    return chapter;
}