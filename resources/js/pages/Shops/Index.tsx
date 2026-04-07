import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    CButton, CCard, CCardBody, CCol, CContainer, CRow, CTable,
    CTableBody, CTableDataCell, CTableHead, CTableHeaderCell,
    CTableRow, CBadge, CAlert, CFormInput
} from '@coreui/react-pro';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Settings, Trash, RefreshCw, ExternalLink, CheckCircle, AlertCircle, Eye, Download, FileSpreadsheet } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Shops',
        href: '/shops',
    },
];

interface Shop {
    id: number;
    name: string;
    url: string;
    admin_url: string | null;
    status: 'connecting' | 'active' | 'error';
    is_active: boolean;
    logo: string | null;
    logo_url: string | null;
    last_sync_at: string | null;
    category?: {
        name: string;
        color: string;
    };
}

export default function Index({ shops, params = { filters: {} } }: { shops: Shop[], params?: any }) {
    const { t } = useTranslation();
    const { flash } = usePage().props as any;
    const testResult = flash?.test_result;
    const successMessage = flash?.success;

    const [filters, setFilters] = useState(params.filters || {});
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get('/shops', { filters }, {
                preserveState: true,
                replace: true
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [filters]);

    const handleFilterChange = (field: string, value: string) => {
        setFilters((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleTest = (id: number) => {
        router.post(`/shops/${id}/test`);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this shop?')) {
            router.delete(`/shops/${id}`);
        }
    };

    const handleExport = (type: 'csv' | 'excel') => {
        const rows = shops.map(s => ({
            ID: s.id,
            Nom: s.name,
            URL: s.url,
            'URL Admin': s.admin_url ?? '',
            Catégorie: s.category?.name ?? '-',
            Statut: s.status,
            'Dernière sync': s.last_sync_at ?? '',
        }));
        type === 'csv' ? exportToCSV(rows, 'boutiques') : exportToExcel(rows, 'boutiques');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return <CBadge color="success">{t('connected')}</CBadge>;
            case 'error': return <CBadge color="danger">{t('error')}</CBadge>;
            default: return <CBadge color="warning">{t('waiting')}</CBadge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shops - PrestaConnect" />

            <CContainer fluid className="py-4">
                {testResult && (
                    <CAlert color={testResult.success ? 'success' : 'danger'} className="d-flex align-items-center gap-2 shadow-sm mb-4">
                        {testResult.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <div>
                            <strong>{testResult.message}</strong>
                            {testResult.success && <span className="ms-2">{t('shop_connected')}</span>}
                        </div>
                    </CAlert>
                )}

                {successMessage && (
                    <CAlert color="success" className="d-flex align-items-center gap-2 shadow-sm mb-4">
                        <CheckCircle size={20} />
                        <div>{successMessage}</div>
                    </CAlert>
                )}

                <div className="d-flex justify-content-between align-items-center mb-4 text-body">
                    <div>
                        <h2 className="mb-0 fw-bold">{t('my_shops')}</h2>
                        <p className="text-secondary">{t('manage_webservice')}</p>
                    </div>
                    <div className="d-flex gap-2">
                        <CButton color="success" variant="outline" size="sm" className="d-flex align-items-center gap-1" onClick={() => handleExport('excel')}>
                            <FileSpreadsheet size={15} /> Excel
                        </CButton>
                        <CButton color="secondary" variant="outline" size="sm" className="d-flex align-items-center gap-1" onClick={() => handleExport('csv')}>
                            <Download size={15} /> CSV
                        </CButton>
                        <Link href="/shops/create">
                            <CButton color="primary" className="d-flex align-items-center gap-2 shadow-sm">
                                <Plus size={18} /> {t('add_shop')}
                            </CButton>
                        </Link>
                    </div>
                </div>

                <CCard className="shadow-sm border-0 bg-body-tertiary overflow-hidden">
                    <CCardBody className="p-0">
                        <CTable align="middle" responsive hover className="mb-0">
                            <CTableHead className="bg-body-tertiary text-secondary small text-uppercase">
                                <CTableRow>
                                    <CTableHeaderCell className="ps-4">{t('logo')}</CTableHeaderCell>
                                    <CTableHeaderCell>{t('name')}</CTableHeaderCell>
                                    <CTableHeaderCell>{t('url')}</CTableHeaderCell>
                                    <CTableHeaderCell>{t('admin_url')}</CTableHeaderCell>
                                    <CTableHeaderCell>{t('category')}</CTableHeaderCell>
                                    <CTableHeaderCell>{t('status')}</CTableHeaderCell>
                                    <CTableHeaderCell>{t('last_sync')}</CTableHeaderCell>
                                    <CTableHeaderCell className="text-end pe-4">{t('actions')}</CTableHeaderCell>
                                </CTableRow>
                                {/* Filter Row */}
                                <CTableRow className="bg-body-secondary border-bottom">
                                    <CTableHeaderCell></CTableHeaderCell>
                                    <CTableHeaderCell className="py-2">
                                        <CFormInput
                                            size="sm"
                                            placeholder={t('filter_name')}
                                            value={filters.name || ''}
                                            onChange={(e) => handleFilterChange('name', e.target.value)}
                                        />
                                    </CTableHeaderCell>
                                    <CTableHeaderCell className="py-2">
                                        <CFormInput
                                            size="sm"
                                            placeholder={t('filter_url')}
                                            value={filters.url || ''}
                                            onChange={(e) => handleFilterChange('url', e.target.value)}
                                        />
                                    </CTableHeaderCell>
                                    <CTableHeaderCell className="py-2">
                                        <CFormInput
                                            size="sm"
                                            placeholder={t('filter_admin_url')}
                                            value={filters.admin_url || ''}
                                            onChange={(e) => handleFilterChange('admin_url', e.target.value)}
                                        />
                                    </CTableHeaderCell>
                                    <CTableHeaderCell></CTableHeaderCell>
                                    <CTableHeaderCell></CTableHeaderCell>
                                    <CTableHeaderCell></CTableHeaderCell>
                                    <CTableHeaderCell className="text-end pe-3">
                                        <CButton
                                            variant="ghost"
                                            size="sm"
                                            color="secondary"
                                            onClick={() => setFilters({})}
                                            title={t('reset')}
                                        >
                                            {t('reset')}
                                        </CButton>
                                    </CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {shops.length === 0 ? (
                                    <CTableRow>
                                        <CTableDataCell colSpan={6} className="text-center py-5">
                                            <p className="text-secondary mb-0">Aucune boutique configurée.</p>
                                        </CTableDataCell>
                                    </CTableRow>
                                ) : (
                                    shops.map((shop) => (
                                        <CTableRow key={shop.id}>
                                            <CTableDataCell className="ps-4">
                                                {shop.logo_url ? (
                                                    <img src={shop.logo_url} alt={shop.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} className="rounded border bg-body-emphasis p-1" />
                                                ) : (
                                                    <div className="rounded border bg-body-tertiary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                        <span className="text-secondary small">N/A</span>
                                                    </div>
                                                )}
                                            </CTableDataCell>
                                            <CTableDataCell className="fw-semibold text-body">
                                                {shop.name}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <a href={shop.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none d-flex align-items-center gap-1">
                                                    {shop.url} <ExternalLink size={12} />
                                                </a>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                {shop.admin_url ? (
                                                    <a href={shop.admin_url} target="_blank" rel="noopener noreferrer" className="text-decoration-none d-flex align-items-center gap-1">
                                                        {shop.admin_url} <ExternalLink size={12} />
                                                    </a>
                                                ) : (
                                                    <span className="text-secondary">-</span>
                                                )}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                {shop.category ? (
                                                    <CBadge 
                                                        style={{ backgroundColor: shop.category.color || '#39f' }}
                                                        className="text-white border-0"
                                                    >
                                                        {shop.category.name}
                                                    </CBadge>
                                                ) : (
                                                    <span className="text-secondary small italic">-</span>
                                                )}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                {getStatusBadge(shop.status)}
                                            </CTableDataCell>
                                            <CTableDataCell className="small">
                                                {shop.last_sync_at ? new Date(shop.last_sync_at).toLocaleString() : '-'}
                                            </CTableDataCell>
                                            <CTableDataCell className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Link href={`/shops/${shop.id}`} className="text-decoration-none">
                                                        <CButton
                                                            color="primary"
                                                            variant="ghost"
                                                            size="sm"
                                                            title="Voir les statistiques"
                                                        >
                                                            <Eye size={16} />
                                                        </CButton>
                                                    </Link>
                                                    <CButton
                                                        color="info"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleTest(shop.id)}
                                                        title="Tester la connexion"
                                                    >
                                                        <RefreshCw size={16} />
                                                    </CButton>
                                                    <Link href={`/shops/${shop.id}/edit`} className="text-decoration-none">
                                                        <CButton color="warning" variant="ghost" size="sm" title="Modifier">
                                                            <Settings size={16} />
                                                        </CButton>
                                                    </Link>
                                                    <CButton
                                                        color="danger"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(shop.id)}
                                                        title="Supprimer"
                                                    >
                                                        <Trash size={16} />
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
