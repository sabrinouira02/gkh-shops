import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CCard, CCardBody, CContainer, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge, CButton, CTooltip } from '@coreui/react-pro';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Folder, ShoppingBasket, Plus, Edit, Trash2, Tag } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CategoryIndex({ categories }: { categories: any[] }) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard'), href: '/dashboard' },
        { title: t('categories'), href: '/categories' },
    ];

    const handleDelete = (id: number) => {
        if (confirm(t('confirm_delete_category'))) {
            router.delete(`/categories/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('categories')} />

            <CContainer fluid className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-0 text-body">{t('categories')}</h2>
                        <p className="text-secondary mb-0">{t('manage_platform_categories')}</p>
                    </div>
                    <Link href="/categories/create">
                        <CButton color="primary" className="d-flex align-items-center gap-2 shadow-sm px-4">
                            <Plus size={18} /> {t('add_category')}
                        </CButton>
                    </Link>
                </div>

                <CCard className="border-0 shadow-sm overflow-hidden mb-4 bg-body-tertiary">
                    <CCardBody className="p-0">
                        <CTable align="middle" responsive hover className="mb-0">
                            <CTableHead className="bg-body-secondary text-secondary small text-uppercase">
                                <CTableRow>
                                    <CTableHeaderCell className="ps-4 py-3">ID</CTableHeaderCell>
                                    <CTableHeaderCell>{t('name')}</CTableHeaderCell>
                                    <CTableHeaderCell>{t('shops_count')}</CTableHeaderCell>
                                    <CTableHeaderCell>{t('status')}</CTableHeaderCell>
                                    <CTableHeaderCell className="text-end pe-4">{t('actions')}</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {categories.length === 0 ? (
                                    <CTableRow>
                                        <CTableDataCell colSpan={5} className="text-center py-5">
                                            <div className="text-secondary opacity-50 mb-2">
                                                <Folder size={48} className="mb-2" />
                                                <p>{t('no_items')}</p>
                                            </div>
                                        </CTableDataCell>
                                    </CTableRow>
                                ) : (
                                    categories.map((category) => (
                                        <CTableRow key={category.id}>
                                            <CTableDataCell className="ps-4 small text-secondary">#{category.id}</CTableDataCell>
                                            <CTableDataCell className="fw-medium text-body">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div
                                                        className="p-2 rounded-3 d-flex align-items-center justify-content-center"
                                                        style={{ backgroundColor: `${category.color}15`, color: category.color || 'var(--cui-primary)' }}
                                                    >
                                                        <Tag size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold">{category.name}</div>
                                                        {category.description && <div className="small text-secondary text-truncate" style={{ maxWidth: '200px' }}>{category.description}</div>}
                                                    </div>
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge color="info" className="px-2 py-1">
                                                    {category.shops_count} sites
                                                </CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge color={category.active ? 'success' : 'secondary'} shape="rounded-pill">
                                                    {category.active ? t('active') : t('inactive')}
                                                </CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-1">
                                                    <Link href={`/categories/${category.id}/edit`}>
                                                        <CButton color="info" variant="ghost" size="sm">
                                                            <Edit size={18} />
                                                        </CButton>
                                                    </Link>
                                                    <CButton color="danger" variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                                                        <Trash2 size={18} />
                                                    </CButton>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))
                                )}
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            </CContainer>
        </AppLayout>
    );
}
