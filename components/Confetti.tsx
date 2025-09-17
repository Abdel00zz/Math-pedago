import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
    id: number;
    style: React.CSSProperties;
}

const Confetti: React.FC = () => {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
    const colors = ['#0056d2', '#f0b129', '#06842c', '#c72525', '#1a73e8'];

    useEffect(() => {
        const generatePieces = () => {
            const newPieces: ConfettiPiece[] = [];
            const count = 100; 
            for (let i = 0; i < count; i++) {
                newPieces.push({
                    id: i,
                    style: {
                        left: `${Math.random() * 100}%`,
                        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                        width: `${Math.random() * 8 + 6}px`,
                        height: `${Math.random() * 8 + 6}px`,
                        animation: `confettiFall ${Math.random() * 2 + 3}s linear forwards, confettiSpin ${Math.random() * 2 + 1}s linear infinite`,
                        animationDelay: `${Math.random() * 2}s`,
                    },
                });
            }
            setPieces(newPieces);
        };
        generatePieces();
    }, []);

    return (
        <div className="fixed inset-0 z-[2000] pointer-events-none overflow-hidden">
            {pieces.map(piece => (
                <div
                    key={piece.id}
                    className="absolute top-0 opacity-0"
                    style={piece.style}
                />
            ))}
        </div>
    );
};

export default Confetti;