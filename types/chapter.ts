export interface Chapter {
    id: number;
    title: string;
    section: 'Géométrie' | 'Algèbre' | 'Analyse';
    contents: string[];
    capacities: string[];
}

export type SectionType = Chapter['section'];

export const SECTION_ORDER: SectionType[] = ['Algèbre', 'Analyse', 'Géométrie'];
