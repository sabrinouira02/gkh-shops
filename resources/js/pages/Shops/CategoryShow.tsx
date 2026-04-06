import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CCard, CCardBody, CContainer, CRow, CCol, CButton, CBadge } from '@coreui/react-pro';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Settings, Folder, Info, CheckCircle, XCircle, Calendar, Hash, Layers } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CategoryShow({ shop, category }: { shop: any, category: any }) {
    const { t } = useTranslation();
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('shops'), href: '/shops' },
        { title: shop.name, href: `/shops/${shop.id}` },
        { title: t('categories'), href: `/shops/${shop.id}/products?tab=categories` },
        { title: `${t('details')} #${category.id}`, href: `/shops/${shop.id}/categories/${category.id}` },
    ];

    const getName = (name: any): string => {
        if (!name) return 'N/A';
        if (typeof name === 'string') return name.trim();
        if (Array.isArray(name) && name.length > 0) return (typeof name[0] === 'object' ? name[0].value : name[0]) || '';
        if (typeof name === 'object' && name !== null) {
            if (name.language) {
               const langs = Array.isArray(name.language) ? name.language : [name.language];
               return langs[0]?.value || '';
            }
            return name.value || name[0]?.value || 'N/A';
        }
        return 'N/A';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('category')} #${category.id} - ${shop.name}`} />

            <CContainer fluid className="py-4">
                <div className="mb-4">
                    <Link href={`/shops/${shop.id}/products?tab=categories`} className="text-decoration-none d-flex align-items-center gap-1 text-muted mb-3 transition-all hover-translate-x">
                        <ArrowLeft size={16} /> {t('back_to_list', 'Retour à la liste')}
                    </Link>
                    <div className="d-flex justify-content-between align-items-center animate__animated animate__fadeInDown">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary text-white p-3 rounded-3 shadow-sm">
                                <Folder size={32} />
                            </div>
                            <div>
                                <h2 className="fw-bold mb-0 text-body">{getName(category.name)}</h2>
                                <p className="text-secondary mb-0 opacity-75">{t('category_details', 'Détails de la catégorie')}</p>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <Link href={`/shops/${shop.id}/categories/${category.id}/edit`}>
                                <CButton color="warning" className="text-white d-flex align-items-center gap-2 shadow-sm hover-lift">
                                    <Settings size={18} /> {t('edit')}
                                </CButton>
                            </Link>
                        </div>
                    </div>
                </div>

                <CRow className="g-4">
                    <CCol lg={8} className="animate__animated animate__fadeInLeft">
                        <CCard className="border-0 shadow-lg mb-4 premium-glass h-100">
                            <CCardBody className="p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-primary">
                                    <Info size={18} /> {t('description')}
                                </h5>
                                
                                <div className="p-4 bg-body-secondary bg-opacity-50 rounded-3 border border-secondary border-opacity-10 shadow-inner min-vh-25">
                                    {category.description ? (
                                        <div className="text-body lh-lg" dangerouslySetInnerHTML={{ __html: getName(category.description) }} />
                                    ) : (
                                        <div className="text-secondary opacity-50 italic text-center py-5">{t('no_description', 'Aucune description disponible.')}</div>
                                    )}
                                </div>
                            </CCardBody>
                        </CCard>
                    </CCol>

                    <CCol lg={4} className="animate__animated animate__fadeInRight">
                        <CRow className="g-4 h-100 flex-column">
                            <CCol>
                                <CCard className="border-0 shadow-lg mb-4 premium-glass">
                                    <CCardBody className="p-4">
                                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-primary">
                                            <Layers size={18} /> {t('system_info', 'Système')}
                                        </h5>
                                        
                                        <div className="mb-3 d-flex justify-content-between align-items-center py-2 border-bottom border-secondary border-opacity-10">
                                            <span className="text-secondary d-flex align-items-center gap-2"><Hash size={14} /> ID:</span>
                                            <strong className="text-body">#{category.id}</strong>
                                        </div>
                                        
                                        <div className="mb-3 d-flex justify-content-between align-items-center py-2 border-bottom border-secondary border-opacity-10">
                                            <span className="text-secondary d-flex align-items-center gap-2"><Layers size={14} /> Parent ID:</span>
                                            <strong className="text-body">#{category.id_parent}</strong>
                                        </div>
                                        
                                        <div className="mb-3 d-flex justify-content-between align-items-center py-2 border-bottom border-secondary border-opacity-10">
                                            <span className="text-secondary d-flex align-items-center gap-2"><Settings size={14} /> {t('status')}:</span>
                                            {category.active === '1' ? (
                                                <CBadge color="success" shape="rounded-pill" className="px-3">{t('active')}</CBadge>
                                            ) : (
                                                <CBadge color="secondary" shape="rounded-pill" className="px-3">{t('inactive')}</CBadge>
                                            )}
                                        </div>
                                        
                                        {category.date_add && (
                                            <div className="mb-3 d-flex justify-content-between align-items-center py-2 border-bottom border-secondary border-opacity-10">
                                                <span className="text-secondary d-flex align-items-center gap-2"><Calendar size={14} /> {t('date_add', 'Créé le')}:</span>
                                                <small className="text-body">{new Date(category.date_add).toLocaleString()}</small>
                                            </div>
                                        )}
                                        
                                        <div className="small text-muted mt-4 p-3 bg-body-tertiary rounded-2 border border-secondary border-opacity-10">
                                            <Info size={14} className="me-2" />
                                            {t('sync_ps_info')}
                                        </div>
                                    </CCardBody>
                                </CCard>
                            </CCol>
                        </CRow>
                    </CCol>
                </CRow>
            </CContainer>

            <style>{`
                .premium-glass {
                    background: rgba(var(--cui-body-bg-rgb), 0.7) !important;
                    backdrop-filter: blur(10px) !important;
                    border: 1px solid rgba(var(--cui-body-color-rgb), 0.1) !important;
                }
                .hover-translate-x:hover {
                    transform: translateX(-4px);
                }
                .hover-lift:hover {
                    transform: translateY(-2px);
                }
                .transition-all {
                    transition: all 0.2s ease-in-out;
                }
                .min-vh-25 { min-height: 250px; }
            `}</style>
        </AppLayout>
    );
}
