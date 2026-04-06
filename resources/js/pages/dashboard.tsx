import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CCard, CCardBody, CCol, CContainer, CRow } from '@coreui/react-pro';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <CContainer fluid className="py-4">
                <CRow className="g-4 mb-4">
                    {[1, 2, 3].map((_, idx) => (
                        <CCol md={4} key={idx}>
                            <CCard className="h-100">
                                <CCardBody className="position-relative p-0">
                                    <div
                                        className="position-absolute start-0 top-0 h-100 w-100"
                                        style={{
                                            backgroundImage:
                                                'repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 10px)',
                                            backgroundSize: '20px 20px',
                                            height: '100%',
                                        }}
                                    />
                                    <div className="p-4">Card {idx + 1}</div>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    ))}
                </CRow>

                <CCard>
                    <CCardBody className="position-relative" style={{ minHeight: '400px' }}>
                        <div
                            className="position-absolute start-0 top-0 h-100 w-100"
                            style={{
                                backgroundImage:
                                    'repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 10px)',
                                backgroundSize: '20px 20px',
                            }}
                        />
                        <div className="position-relative p-4">Main dashboard content</div>
                    </CCardBody>
                </CCard>
            </CContainer>
        </AppLayout>
    );
}
