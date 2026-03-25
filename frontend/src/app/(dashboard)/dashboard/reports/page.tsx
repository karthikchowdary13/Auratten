'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const ReportsContent = dynamic(() => import('./ReportsContent'), {
    ssr: false,
    loading: () => (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'var(--bg-main)',
            color: 'var(--text-muted)'
        }}>
            Loading Reports...
        </div>
    )
});

export default function ReportsPage() {
    return <ReportsContent />;
}
