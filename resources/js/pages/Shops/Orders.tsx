import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Order } from '@/types';
import { CCard, CCardBody, CContainer, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge, CButton, CFormInput } from '@coreui/react-pro';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, ChevronUp, ChevronDown, Calendar, CreditCard, Search, Download, FileSpreadsheet } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import Pagination from '@/components/Pagination';
import { useTranslation } from 'react-i18next';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

export default function Orders({ shop, orders, total, params }: { shop: any, orders: Order[], total: number, params: any }) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('shops'), href: '/shops' },
        { title: shop.name, href: `/shops/${shop.id}` },
        { title: t('orders'), href: `/shops/${shop.id}/orders` },
    ];

    const [filters, setFilters] = useState(params.filters || {});
    const isFirstRender = useRef(true);

    // Debounced filter effect
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(`/shops/${shop.id}/orders`, { ...params, filters, page: 1 }, {
                preserveState: true,
                replace: true
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [filters]);

    const handleFilterChange = (field: string, value: string) => {
        setFilters((prev: any) => ({ ...prev, [field]: value }));
    };

    const handlePageChange = (page: number) => {
        router.get(`/shops/${shop.id}/orders`, { ...params, page });
    };

    const handleLimitChange = (limit: number) => {
        router.get(`/shops/${shop.id}/orders`, { ...params, limit, page: 1 });
    };

    const handleSort = (field: string) => {
        const order = params.sort_field === field && params.sort_order === 'ASC' ? 'DESC' : 'ASC';
        router.get(`/shops/${shop.id}/orders`, { ...params, sort_field: field, sort_order: order, page: 1 });
    };

    const getSortIcon = (field: string) => {
        if (params.sort_field !== field) return null;
        return params.sort_order === 'ASC' ? <ChevronUp size={14} className="ms-1" /> : <ChevronDown size={14} className="ms-1" />;
    };

    const handleExport = (type: 'csv' | 'excel') => {
        const rows = orders.map(o => ({
            ID: o.id,
            Référence: o.reference,
            'Total (€)': parseFloat(o.total_paid).toFixed(2),
            Paiement: o.payment,
            Date: new Date(o.date_add).toLocaleDateString('fr-FR'),
            Statut: o.state_name ?? o.current_state,
        }));
        type === 'csv' ? exportToCSV(rows, `commandes_${shop.name}`) : exportToExcel(rows, `commandes_${shop.name}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('orders')} - ${shop.name}`} />

            <CContainer fluid className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-0 text-body">{t('orders')}</h2>
                        <p className="text-secondary mb-0">{total} {t('orders').toLowerCase()} sur {shop.name}</p>
                    </div>
                    <div className="d-flex gap-2">
                        <CButton color="success" variant="outline" size="sm" className="d-flex align-items-center gap-1" onClick={() => handleExport('excel')}>
                            <FileSpreadsheet size={15} /> Excel
                        </CButton>
                        <CButton color="secondary" variant="outline" size="sm" className="d-flex align-items-center gap-1" onClick={() => handleExport('csv')}>
                            <Download size={15} /> CSV
                        </CButton>
                    </div>
                </div>

                <CCard className="border-0 shadow-sm overflow-hidden mb-4 bg-body-tertiary">
                    <CCardBody className="p-0">
                        <CTable align="middle" responsive hover className="mb-0 border-top">
                            <CTableHead className="bg-body-tertiary text-secondary small text-uppercase">
                                <CTableRow>
                                    <CTableHeaderCell 
                                        onClick={() => handleSort('id')} 
                                        style={{ cursor: 'pointer' }}
                                        className="ps-4 py-3"
                                    >
                                        ID {getSortIcon('id')}
                                    </CTableHeaderCell>
                                    <CTableHeaderCell 
                                        onClick={() => handleSort('reference')} 
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {t('reference')} {getSortIcon('reference')}
                                    </CTableHeaderCell>
                                    <CTableHeaderCell 
                                        onClick={() => handleSort('total_paid')} 
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {t('price')} {getSortIcon('total_paid')}
                                    </CTableHeaderCell>
                                    <CTableHeaderCell 
                                        onClick={() => handleSort('payment')} 
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {t('paymentMethod')} {getSortIcon('payment')}
                                    </CTableHeaderCell>
                                    <CTableHeaderCell 
                                        onClick={() => handleSort('date_add')} 
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {t('date')} {getSortIcon('date_add')}
                                    </CTableHeaderCell>
                                    <CTableHeaderCell>{t('status')}</CTableHeaderCell>
                                    <CTableHeaderCell className="text-end pe-4">{t('actions')}</CTableHeaderCell>
                                </CTableRow>
                                {/* Filter Row */}
                                <CTableRow className="bg-body-secondary border-bottom">
                                    <CTableHeaderCell className="ps-3 py-2">
                                        <CFormInput 
                                            size="sm" 
                                            placeholder={t('filter_id')} 
                                            value={filters.id || ''}
                                            onChange={(e) => handleFilterChange('id', e.target.value)}
                                            style={{ minWidth: '60px' }}
                                        />
                                    </CTableHeaderCell>
                                    <CTableHeaderCell className="py-2">
                                        <CFormInput 
                                            size="sm" 
                                            placeholder={t('filter_ref')} 
                                            value={filters.reference || ''}
                                            onChange={(e) => handleFilterChange('reference', e.target.value)}
                                        />
                                    </CTableHeaderCell>
                                    <CTableHeaderCell className="py-2">
                                        <CFormInput 
                                            size="sm" 
                                            placeholder={t('price')} 
                                            value={filters.total_paid || ''}
                                            onChange={(e) => handleFilterChange('total_paid', e.target.value)}
                                        />
                                    </CTableHeaderCell>
                                    <CTableHeaderCell className="py-2">
                                        <CFormInput 
                                            size="sm" 
                                            placeholder={t('paymentMethod')} 
                                            value={filters.payment || ''}
                                            onChange={(e) => handleFilterChange('payment', e.target.value)}
                                        />
                                    </CTableHeaderCell>
                                    <CTableHeaderCell className="py-2">
                                        <CFormInput 
                                            size="sm" 
                                            placeholder={t('date')} 
                                            value={filters.date_add || ''}
                                            onChange={(e) => handleFilterChange('date_add', e.target.value)}
                                        />
                                    </CTableHeaderCell>
                                    <CTableHeaderCell></CTableHeaderCell>
                                    <CTableHeaderCell className="text-end pe-3 small">
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
                                {orders.length === 0 ? (
                                    <CTableRow>
                                        <CTableDataCell colSpan={7} className="text-center py-5">
                                            <div className="text-secondary">{t('no_items')}</div>
                                        </CTableDataCell>
                                    </CTableRow>
                                ) : (
                                    orders.map((order) => (
                                        <CTableRow key={order.id}>
                                            <CTableDataCell className="ps-4 small text-secondary">#{order.id}</CTableDataCell>
                                            <CTableDataCell className="fw-bold text-primary">{order.reference}</CTableDataCell>
                                            <CTableDataCell className="fw-semibold text-body">
                                                {parseFloat(order.total_paid).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                            </CTableDataCell>
                                            <CTableDataCell className="small text-body">
                                                <CreditCard size={14} className="me-1 text-secondary" /> {order.payment}
                                            </CTableDataCell>
                                            <CTableDataCell className="small text-body">
                                                <Calendar size={14} className="me-1 text-secondary" /> {new Date(order.date_add).toLocaleDateString()}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge color={order.current_state == '6' ? 'danger' : (order.current_state == '2' ? 'success' : 'primary')} shape="rounded-pill">
                                                    {order.state_name}
                                                </CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell className="text-end pe-4">
                                                <Link href={`/shops/${shop.id}/orders/${order.id}`}>
                                                    <CButton color="primary" variant="ghost" size="sm" title="Voir l'ordre">
                                                        <Eye size={18} />
                                                    </CButton>
                                                </Link>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))
                                )}
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>

                <Pagination 
                    currentPage={params.page} 
                    total={total} 
                    limit={params.limit}
                    onPageChange={handlePageChange} 
                    onLimitChange={handleLimitChange}
                />
            </CContainer>
        </AppLayout>
    );
}
