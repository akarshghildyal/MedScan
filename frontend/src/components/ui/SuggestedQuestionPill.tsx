'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MessageCircleQuestion } from 'lucide-react';

export interface SuggestedQuestionPillProps {
    question: string;
    onClick: (question: string) => void;
    className?: string;
}

export function SuggestedQuestionPill({
    question,
    onClick,
    className,
}: SuggestedQuestionPillProps) {
    return (
        <button
            type="button"
            onClick={() => onClick(question)}
            className={cn(
                'group flex items-center justify-center gap-2 rounded-full border border-border bg-transparent px-[20px] py-[10px] text-[13px] font-medium text-text-body transition-all duration-200 hover:border-accent hover:bg-accent/5 hover:text-text-primary focus:border-accent focus:bg-accent/5 focus:text-text-primary focus:outline-none focus:ring-0 w-full whitespace-normal text-left sm:w-auto',
                className
            )}
        >
            <MessageCircleQuestion className="h-4 w-4 shrink-0 text-text-muted transition-colors group-hover:text-accent group-focus:text-accent" />
            <span>{question}</span>
        </button>
    );
}
