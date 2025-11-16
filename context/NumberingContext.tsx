import React, { createContext, useContext, useRef, useCallback, ReactNode, useEffect } from 'react';

interface NumberingState {
    'definition-box': number;
    'theorem-box': number;
    'proposition-box': number;
    'property-box': number;
    'remark-box': number;
    'example-box': number;
    'practice-box': number;
    'explain-box': number;
}

interface NumberingContextValue {
    getNumberFor: (type: keyof NumberingState, key: string) => number;
    reset: () => void;
}

const NumberingContext = createContext<NumberingContextValue | undefined>(undefined);

const createInitialCounters = (): NumberingState => ({
    'definition-box': 0,
    'theorem-box': 0,
    'proposition-box': 0,
    'property-box': 0,
    'remark-box': 0,
    'example-box': 0,
    'practice-box': 0,
    'explain-box': 0,
});

export const NumberingProvider: React.FC<{ children: ReactNode; resetKey?: string | number | null }> = ({ children, resetKey = null }) => {
    const countersRef = useRef<NumberingState>(createInitialCounters());
    const assignedNumbersRef = useRef<Record<string, number>>({});

    const getNumberFor = useCallback((type: keyof NumberingState, key: string) => {
        const mapKey = `${type}::${key}`;
        if (assignedNumbersRef.current[mapKey]) {
            return assignedNumbersRef.current[mapKey];
        }

        countersRef.current[type] += 1;
        assignedNumbersRef.current[mapKey] = countersRef.current[type];
        return assignedNumbersRef.current[mapKey];
    }, []);

    const reset = useCallback(() => {
        countersRef.current = createInitialCounters();
        assignedNumbersRef.current = {};
    }, []);

    useEffect(() => {
        reset();
    }, [resetKey, reset]);

    return (
        <NumberingContext.Provider value={{ getNumberFor, reset }}>
            {children}
        </NumberingContext.Provider>
    );
};

export const useNumbering = () => {
    const context = useContext(NumberingContext);
    if (!context) {
        throw new Error('useNumbering must be used within NumberingProvider');
    }
    return context;
};
