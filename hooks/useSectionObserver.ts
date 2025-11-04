import { useEffect, useRef, RefObject } from 'react';

interface SectionObserverOptions {
    onActiveChange: (sectionId: string | null) => void;
    threshold?: number;
    rootMargin?: string;
}

export const useSectionObserver = (
    scrollContainerRef: RefObject<HTMLElement>,
    options: SectionObserverOptions
) => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastActiveRef = useRef<string | null>(null);
    const { onActiveChange, threshold = 0.3, rootMargin = '-10% 0px -80% 0px' } = options;

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const callback: IntersectionObserverCallback = (entries) => {
            // Trouver la section la plus visible
            let mostVisible: IntersectionObserverEntry | null = null;
            let maxRatio = 0;

            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                    maxRatio = entry.intersectionRatio;
                    mostVisible = entry;
                }
            });

            if (mostVisible) {
                const sectionId = mostVisible.target.getAttribute('data-lesson-section-id');
                if (sectionId && sectionId !== lastActiveRef.current) {
                    lastActiveRef.current = sectionId;
                    // Utiliser requestAnimationFrame pour smooth update
                    requestAnimationFrame(() => {
                        onActiveChange(sectionId);
                    });
                }
            }
        };

        observerRef.current = new IntersectionObserver(callback, {
            root: container,
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
            rootMargin,
        });

        // Observer toutes les sections
        const sections = container.querySelectorAll('[data-lesson-anchor="section"]');
        sections.forEach((section) => {
            observerRef.current?.observe(section);
        });

        return () => {
            observerRef.current?.disconnect();
        };
    }, [scrollContainerRef, onActiveChange, threshold, rootMargin]);

    return observerRef;
};

export const useSubsectionObserver = (
    scrollContainerRef: RefObject<HTMLElement>,
    options: SectionObserverOptions
) => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastActiveRef = useRef<string | null>(null);
    const { onActiveChange, threshold = 0.3, rootMargin = '-10% 0px -80% 0px' } = options;

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const callback: IntersectionObserverCallback = (entries) => {
            let mostVisible: IntersectionObserverEntry | null = null;
            let maxRatio = 0;

            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                    maxRatio = entry.intersectionRatio;
                    mostVisible = entry;
                }
            });

            if (mostVisible) {
                const subsectionId = mostVisible.target.getAttribute('data-lesson-subsection-id');
                if (subsectionId && subsectionId !== lastActiveRef.current) {
                    lastActiveRef.current = subsectionId;
                    // Utiliser requestAnimationFrame pour smooth update
                    requestAnimationFrame(() => {
                        onActiveChange(subsectionId);
                    });
                }
            }
        };

        observerRef.current = new IntersectionObserver(callback, {
            root: container,
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
            rootMargin,
        });

        const subsections = container.querySelectorAll('[data-lesson-anchor="subsection"]');
        subsections.forEach((subsection) => {
            observerRef.current?.observe(subsection);
        });

        return () => {
            observerRef.current?.disconnect();
        };
    }, [scrollContainerRef, onActiveChange, threshold, rootMargin]);

    return observerRef;
};
