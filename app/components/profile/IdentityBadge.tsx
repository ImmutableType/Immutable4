// components/profile/IdentityBadge.tsx
'use client'

interface IdentityBadgeProps {
    verified: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function IdentityBadge({ verified, size = 'md' }: IdentityBadgeProps) {
    if (!verified) return null;
    
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };
    
    return (
        <span className={`inline-flex items-center justify-center ${sizeClasses[size]} bg-black rounded-full ml-2`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3/4 h-3/4"
            >
                <polyline points="20 6 9 17 4 12" />
            </svg>
        </span>
    );
}