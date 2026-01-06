import React from 'react';

export default function Card() {
    const totalCards = 6;
    const cards = Array.from({ length: totalCards }, (_, i) => i + 1);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full p-4">
            {cards.map((card) => (
                <div
                    key={card}
                    className="bg-white rounded-xl p-6 shadow-sm h-48"
                ></div>
            ))}
        </div>
    );
}
