import React, { useEffect, useState, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { CToast, CToastBody, CToastHeader, CToaster, CButton, CCloseButton } from '@coreui/react-pro';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FlashNotifications = () => {
    const { t } = useTranslation();
    const { flash } = usePage().props as any;
    const [toast, setToast] = useState<any>(undefined);
    const toaster = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (flash?.success) {
            setToast(
                <CToast color="success" className="text-white align-items-center border-0 shadow-lg mb-3 premium-glass" autohide={true} visible={true}>
                    <div className="d-flex p-3">
                        <CheckCircle size={20} className="me-2 text-white" />
                        <CToastBody className="p-0 flex-grow-1 fw-bold">
                            {t(flash.success)}
                        </CToastBody>
                        <CCloseButton white className="ms-2" onClick={() => setToast(undefined)} />
                    </div>
                </CToast>
            );
        } else if (flash?.error) {
            setToast(
                <CToast color="danger" className="text-white align-items-center border-0 shadow-lg mb-3 premium-glass" autohide={true} visible={true}>
                    <div className="d-flex p-3">
                        <AlertCircle size={20} className="me-2 text-white" />
                        <CToastBody className="p-0 flex-grow-1 fw-bold">
                            {t(flash.error)}
                        </CToastBody>
                        <CCloseButton white className="ms-2" onClick={() => setToast(undefined)} />
                    </div>
                </CToast>
            );
        }
    }, [flash]);

    return (
        <CToaster ref={toaster} push={toast} placement="top-end" style={{ zIndex: 9999, position: 'fixed', top: '70px', right: '20px' }} />
    );
};

export default FlashNotifications;
