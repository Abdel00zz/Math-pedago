
export const getChapterId = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

export const downloadJSON = (data: object, filename: string): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Fonction pour générer la structure JSON de progression selon les spécifications
export const generateStudentProgressSubmission = (
    studentName: string,
    studentLevel: string,
    chapters: Array<{
        chapterName: string;
        quizScore: number;
        quizAnswers: { [questionId: string]: string };
        exercisesFeedback: { [exerciseId: string]: string };
        quizQuestions: Array<{ id: string; options: Array<{ text: string }> }>;
    }>
) => {
    const submission = {
        studentName,
        studentLevel,
        timestamp: Date.now(),
        results: chapters.map(chapter => ({
            chapter: chapter.chapterName,
            quiz: {
                score: chapter.quizScore,
                answers: Object.entries(chapter.quizAnswers).reduce((acc, [questionId, selectedText]) => {
                    // Trouver l'index de l'option sélectionnée
                    const question = chapter.quizQuestions.find(q => q.id === questionId);
                    const optionIndex = question?.options.findIndex(opt => opt.text === selectedText) ?? -1;
                    acc[questionId] = optionIndex;
                    return acc;
                }, {} as { [questionId: string]: number })
            },
            exercisesFeedback: chapter.exercisesFeedback
        }))
    };
    
    return submission;
};

// Fonction pour générer un exemple de structure JSON de progression
export const generateExampleProgressSubmission = () => {
    return {
        studentName: "Jean Dupont",
        studentLevel: "1ère Bac Sciences Mathématiques",
        timestamp: Date.now(),
        results: [
            {
                chapter: "Les Nombres Complexes",
                quiz: {
                    score: 85,
                    answers: {
                        "q_complexe_1": 0,
                        "q_complexe_2": 2,
                        "q_complexe_3": 1
                    }
                },
                exercisesFeedback: {
                    "exo_complex_ops": "Moyen",
                    "exo_complex_form": "Facile",
                    "exo_complex_calc": "Difficile"
                }
            }
        ]
    };
};
