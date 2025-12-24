import React from 'react';

interface Props {
    content: string;
    children: React.ReactNode;
}

export const Tooltip: React.FC<Props> = ({ content, children }) => {
    return (
        <div className="relative group">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
                {content}
            </div>
        </div>
    );
};
