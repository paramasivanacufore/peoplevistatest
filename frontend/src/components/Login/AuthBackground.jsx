import React from 'react';

export default function AuthBackground({ children }) {
    return (
        <div className="min-h-screen flex md:items-center justify-center overflow-x-hidden overflow-y-auto lg:overflow-y-hidden lg:h-screen relative font-sans bg-gradient-to-br from-purple-100 via-pink-100 to-pink-50 py-4 md:py-0">
            {/* Animated background ribbons */}
            <div className="hidden md:block absolute w-[200px] h-[800px] top-[-200px] left-[10%] bg-gradient-to-br from-purple-200/30 to-purple-300/20 rotate-[-15deg] animate-float"></div>
            <div className="hidden md:block absolute w-[150px] h-[900px] top-[-100px] right-[15%] bg-gradient-to-br from-purple-200/30 to-purple-300/20 rotate-[-15deg] animate-float" style={{ animationDelay: '2s' }}></div>

            {/* Content content (Card) */}
            {children}
        </div>
    );
}
