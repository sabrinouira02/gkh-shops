import React from 'react';
import { CSpinner } from '@coreui/react-pro';
import { useTranslation } from 'react-i18next';

export default function Loader({ show = false }: { show?: boolean }) {
    if (!show) return null;
    const { t } = useTranslation();
    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
            style={{
                zIndex: 9999,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(4px)',
                transition: 'all 0.3s ease'
            }}
        >
            <div className="bg-white p-4 rounded-4 shadow-lg d-flex flex-column align-items-center border">
                <CSpinner color="primary" variant="grow" style={{ width: '3rem', height: '3rem' }} />
                <div className="mt-3 fw-bold text-primary animate-pulse">{t('loading')}</div>
                <div className="text-muted small mt-1">{t('fetching_data')}</div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                .animate-pulse {
                    animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
}
