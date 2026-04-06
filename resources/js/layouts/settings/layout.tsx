import { Link, usePage } from '@inertiajs/react';
import {
    CContainer,
    CRow,
    CCol,
    CCard,
    CCardBody,
} from '@coreui/react-pro';
import { PropsWithChildren } from 'react';
import clsx from 'clsx';

const sidebarNavItems = [
    { title: 'Profile', href: '/settings/profile' },
    { title: 'Password', href: '/settings/password' },
    { title: 'Appearance', href: '/settings/appearance' },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { url } = usePage();

    return (
        <CContainer className="py-4">
            <h2>Settings</h2>
            <p className="text-medium text-muted mb-4">
                Manage your profile and account settings
            </p>

            <CRow>
                <CCol md={3}>
                    <CCard className="mb-3">
                        <CCardBody>
                            <ul className="nav flex-column">
                                {sidebarNavItems.map((item, index) => (
                                    <li className="nav-item" key={index}>
                                        <Link
                                            href={item.href}
                                            className={clsx(
                                                'nav-link text-sm px-3 py-2 rounded',
                                                {
                                                    'bg-primary text-white': url === item.href,
                                                    'text-body': url !== item.href,
                                                }
                                            )}
                                        >
                                            {item.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol md={9}>
                    <CCard>
                        <CCardBody>{children}</CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    );
}
