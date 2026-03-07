import React from 'react';

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-bg-base text-text-body">
            {/* Real app would have a persistent top nav or sidebar here, but directive focuses on dashboard content */}
            <main className="mx-auto w-full max-w-[1280px] px-[20px] lg:px-[48px] py-[48px]">
                {children}
            </main>
        </div>
    );
}
