import React, { createContext, useContext, useRef, useCallback, ReactNode } from 'react';

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
    getNextNumber: (type: keyof NumberingState) => number;
    reset: () => void;
}

const NumberingContext = createContext<NumberingContextValue | undefined>(undefined);

export const NumberingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const countersRef = useRef<NumberingState>({
        'definition-box': 0,
        'theorem-box': 0,
        'proposition-box': 0,
        'property-box': 0,
        'remark-box': 0,
        'example-box': 0,
        'practice-box': 0,
        'explain-box': 0,
    });

    const getNextNumber = useCallback((type: keyof NumberingState) => {
        countersRef.current[type] += 1;
        return countersRef.current[type];
    }, []);

    const reset = useCallback(() => {
        countersRef.current = {
            'definition-box': 0,
            'theorem-box': 0,
            'proposition-box': 0,
            'property-box': 0,
            'remark-box': 0,
            'example-box': 0,
            'practice-box': 0,
            'explain-box': 0,
        };
    }, []);

    return (
        <NumberingContext.Provider value={{ getNextNumber, reset }}>
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
