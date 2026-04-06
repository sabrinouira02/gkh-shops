import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Product } from '@/types';
import { CCard, CCardBody, CContainer, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge, CButton, CFormInput, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CBadge as CBadgePro } from '@coreui/react-pro';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, ChevronUp, ChevronDown, Package, Search, Download, FileSpreadsheet, Settings, Trash2, Info, Folder, LayoutGrid, CheckCircle, XCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Pagination from '@/components/Pagination';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

export default function Products({ shop, products = [], categories = [], total, params, activeTab }: { shop: any, products?: Product[], categories?: any[], total: number, params: any, activeTab: string }) {
    const { t } = useTranslation();
    const [deletingId, setDeletingId] = useState<number | string | null>(null);
    const [shopData] = useState(shop);

    const handleDelete = () => {
        if (!deletingId) return;
        const resource = activeTab === 'categories' ? 'categories' : 'products';
        router.delete(`/shops/${shop.id}/${resource}/${deletingId}`, {
            onSuccess: () => setDeletingId(null),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('shops'), href: '/shops' },
        { title: shop.name, href: `/shops/${shop.id}` },
        { title: activeTab === 'categories' ? t('categories') : t('products'), href: `/shops/${shop.id}/products?tab=${activeTab}` },
    ];

    const [filters, setFilters] = useState(params.filters || {});
    const isFirstRender = useRef(true);

    // Handle filter changes with debounce
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(`/shops/${shop.id}/products`, { ...params, filters, page: 1, tab: activeTab }, {
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
        router.get(`/shops/${shop.id}/products`, { ...params, page, tab: activeTab });
    };

    const handleLimitChange = (limit: number) => {
        router.get(`/shops/${shop.id}/products`, { ...params, limit, page: 1, tab: activeTab });
    };

    const handleSort = (field: string) => {
        const order = params.sort_field === field && params.sort_order === 'ASC' ? 'DESC' : 'ASC';
        router.get(`/shops/${shop.id}/products`, { ...params, sort_field: field, sort_order: order, page: 1, tab: activeTab });
    };

    const getSortIcon = (field: string) => {
        if (params.sort_field !== field) return null;
        return params.sort_order === 'ASC' ? <ChevronUp size={14} className="ms-1" /> : <ChevronDown size={14} className="ms-1" />;
    };

    const getName = (name: any) => {
        if (!name) return 'N/A';
        if (typeof name === 'string') return name;
        if (Array.isArray(name) && name.length > 0) return name[0].value || name[0];
        if (typeof name === 'object' && name !== null) {
            if (name.language) {
                const langs = Array.isArray(name.language) ? name.language : [name.language];
                return langs[0]?.value || '';
            }
            return name.value || name[0]?.value || 'N/A';
        }
        return 'N/A';
    };

    const handleExport = (type: 'csv' | 'excel') => {
        let rows = [];
        let filename = '';

        if (activeTab === 'categories') {
            rows = categories.map(c => ({
                ID: c.id,
                Nom: getName(c.name),
                'ID Parent': c.id_parent,
                Actif: c.active === '1' ? 'Oui' : 'Non',
            }));
            filename = `categories_${shop.name}`;
        } else {
            rows = products.map(p => ({
                ID: p.id,
                Nom: getName(p.name),
                Référence: p.reference ?? '',
                'Prix (€)': parseFloat(p.price).toFixed(2),
                Stock: p.quantity,
            }));
            filename = `produits_${shop.name}`;
        }
        type === 'csv' ? exportToCSV(rows, filename) : exportToExcel(rows, filename);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${activeTab === 'categories' ? t('categories') : t('products')} - ${shop.name}`} />

            <CContainer fluid className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="animate__animated animate__fadeInLeft">
                        <h2 className="fw-bold mb-0 text-body d-flex align-items-center gap-2">
                            {activeTab === 'categories' ? (
                                <><Folder className="text-warning" size={28} /> {t('categories')}</>
                            ) : (
                                <><Package className="text-primary" size={28} /> {t('products')}</>
                            )}
                        </h2>
                        <p className="text-secondary mb-0 opacity-75">{total} {activeTab === 'categories' ? t('categories').toLowerCase() : t('products').toLowerCase()} sur {shop.name}</p>
                    </div>
                    <div className="d-flex gap-2">
                        <CButton color="success" variant="outline" size="sm" className="d-flex align-items-center gap-1 shadow-sm hover-lift" onClick={() => handleExport('excel')}>
                            <FileSpreadsheet size={15} /> Excel
                        </CButton>
                        <CButton color="secondary" variant="outline" size="sm" className="d-flex align-items-center gap-1 shadow-sm hover-lift" onClick={() => handleExport('csv')}>
                            <Download size={15} /> CSV
                        </CButton>
                    </div>
                </div>

                <div className="bg-body-secondary p-1 rounded-3 d-inline-flex mb-4 shadow-sm border border-secondary border-opacity-10 shadow-lg premium-glass">
                    <Link 
                        href={`/shops/${shop.id}/products?tab=list`} 
                        className={`btn btn-sm px-4 py-2 d-flex align-items-center gap-2 transition-all rounded-2 ${activeTab !== 'categories' ? 'btn-primary shadow text-white' : 'btn-ghost text-secondary border-0'}`}
                    >
                        <LayoutGrid size={16} /> {t('products')}
                    </Link>
                    <Link 
                        href={`/shops/${shop.id}/products?tab=categories`} 
                        className={`btn btn-sm px-4 py-2 d-flex align-items-center gap-2 transition-all rounded-2 ${activeTab === 'categories' ? 'btn-primary shadow text-white' : 'btn-ghost text-secondary border-0'}`}
                    >
                        <Folder size={16} /> {t('categories')}
                    </Link>
                </div>

                <CCard className="border-0 shadow-lg overflow-hidden mb-4 bg-body-tertiary premium-glass">
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
                                    
                                    {activeTab === 'categories' ? (
                                        <>
                                            <CTableHeaderCell 
                                                onClick={() => handleSort('name')} 
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {t('name')} {getSortIcon('name')}
                                            </CTableHeaderCell>
                                            <CTableHeaderCell>{t('status')}</CTableHeaderCell>
                                        </>
                                    ) : (
                                        <>
                                            <CTableHeaderCell>{t('image')}</CTableHeaderCell>
                                            <CTableHeaderCell 
                                                onClick={() => handleSort('name')} 
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {t('name')} {getSortIcon('name')}
                                            </CTableHeaderCell>
                                            <CTableHeaderCell 
                                                onClick={() => handleSort('reference')} 
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {t('reference')} {getSortIcon('reference')}
                                            </CTableHeaderCell>
                                            <CTableHeaderCell 
                                                onClick={() => handleSort('price')} 
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {t('price')} {getSortIcon('price')}
                                            </CTableHeaderCell>
                                            <CTableHeaderCell 
                                                onClick={() => handleSort('quantity')} 
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {t('stock')} {getSortIcon('quantity')}
                                            </CTableHeaderCell>
                                        </>
                                    )}
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
                                    
                                    {activeTab === 'categories' ? (
                                        <>
                                            <CTableHeaderCell className="py-2">
                                                <CFormInput 
                                                    size="sm" 
                                                    placeholder={t('filter_name')} 
                                                    value={filters.name || ''}
                                                    onChange={(e) => handleFilterChange('name', e.target.value)}
                                                />
                                            </CTableHeaderCell>
                                            <CTableHeaderCell></CTableHeaderCell>
                                        </>
                                    ) : (
                                        <>
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
                                                    placeholder={t('filter_ref')} 
                                                    value={filters.reference || ''}
                                                    onChange={(e) => handleFilterChange('reference', e.target.value)}
                                                    style={{ minWidth: '100px' }}
                                                />
                                            </CTableHeaderCell>
                                            <CTableHeaderCell className="py-2">
                                                <CFormInput 
                                                    size="sm" 
                                                    placeholder={t('price')} 
                                                    value={filters.price || ''}
                                                    onChange={(e) => handleFilterChange('price', e.target.value)}
                                                    style={{ minWidth: '80px' }}
                                                />
                                            </CTableHeaderCell>
                                            <CTableHeaderCell className="py-2">
                                                <CFormInput 
                                                    size="sm" 
                                                    placeholder={t('stock')} 
                                                    value={filters.quantity || ''}
                                                    onChange={(e) => handleFilterChange('quantity', e.target.value)}
                                                    style={{ minWidth: '80px' }}
                                                />
                                            </CTableHeaderCell>
                                        </>
                                    )}
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
                                {activeTab === 'categories' ? (
                                    categories.length === 0 ? (
                                        <CTableRow>
                                            <CTableDataCell colSpan={4} className="text-center py-5">
                                                <div className="text-secondary">{t('no_items')}</div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ) : (
                                        categories.map((category) => (
                                            <CTableRow key={category.id}>
                                                <CTableDataCell className="ps-4 small text-secondary">#{category.id}</CTableDataCell>
                                                <CTableDataCell className="fw-medium text-body">{getName(category.name)}</CTableDataCell>
                                                <CTableDataCell>
                                                    {category.active === '1' ? (
                                                        <CBadgePro color="success" shape="rounded-pill" className="d-flex align-items-center gap-1 w-fit">
                                                            <CheckCircle size={12} /> {t('active')}
                                                        </CBadgePro>
                                                    ) : (
                                                        <CBadgePro color="secondary" shape="rounded-pill" className="d-flex align-items-center gap-1 w-fit">
                                                            <XCircle size={12} /> {t('inactive')}
                                                        </CBadgePro>
                                                    )}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-end pe-4">
                                                    <div className="d-flex justify-content-end gap-1">
                                                        <CButton color="danger" variant="ghost" size="sm" title="Supprimer" onClick={() => setDeletingId(category.id)}>
                                                            <Trash2 size={16} />
                                                        </CButton>
                                                        <Link href={`/shops/${shop.id}/categories/${category.id}/edit`}>
                                                            <CButton color="warning" variant="ghost" size="sm" title="Modifier">
                                                                <Settings size={16} />
                                                            </CButton>
                                                        </Link>
                                                        <Link href={`/shops/${shop.id}/categories/${category.id}`}>
                                                            <CButton color="primary" variant="ghost" size="sm" title="Voir détails">
                                                                <Eye size={18} />
                                                            </CButton>
                                                        </Link>
                                                    </div>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    )
                                ) : (
                                    products.length === 0 ? (
                                        <CTableRow>
                                            <CTableDataCell colSpan={7} className="text-center py-5">
                                                <div className="text-secondary">{t('no_items')}</div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ) : (
                                        products.map((product) => (
                                            <CTableRow key={product.id}>
                                                <CTableDataCell className="ps-4 small text-secondary">#{product.id}</CTableDataCell>
                                                <CTableDataCell>
                                                    {product.main_image ? (
                                                        <img src={product.main_image} alt="" className="rounded border shadow-sm transition-all hover-scale" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div className="bg-body-secondary rounded d-flex align-items-center justify-content-center text-secondary" style={{ width: '40px', height: '40px' }}>
                                                            <Package size={16} />
                                                        </div>
                                                    )}
                                                </CTableDataCell>
                                                <CTableDataCell className="fw-medium text-body">{getName(product.name)}</CTableDataCell>
                                                <CTableDataCell className="small">
                                                    <CBadge color="secondary" className="text-body border border-body-secondary bg-transparent">{product.reference || '-'}</CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell className="fw-bold text-body">
                                                    {parseFloat(product.price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadgePro color={Number(product.quantity) > 10 ? 'success' : (Number(product.quantity) > 0 ? 'warning' : 'danger')} shape="rounded-pill">
                                                        {product.quantity}
                                                    </CBadgePro>
                                                </CTableDataCell>
                                                <CTableDataCell className="text-end pe-4">
                                                    <div className="d-flex justify-content-end gap-1">
                                                        <CButton color="danger" variant="ghost" size="sm" title="Supprimer" onClick={() => setDeletingId(product.id)}>
                                                            <Trash2 size={16} />
                                                        </CButton>
                                                        <Link href={`/shops/${shop.id}/products/${product.id}/edit`}>
                                                            <CButton color="warning" variant="ghost" size="sm" title="Modifier">
                                                                <Settings size={16} />
                                                            </CButton>
                                                        </Link>
                                                        <Link href={`/shops/${shop.id}/products/${product.id}`}>
                                                            <CButton color="primary" variant="ghost" size="sm" title="Voir détails">
                                                                <Eye size={18} />
                                                            </CButton>
                                                        </Link>
                                                    </div>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    )
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

            {/* Delete Confirmation Modal */}
            <CModal visible={!!deletingId} onClose={() => setDeletingId(null)} alignment="center" className="premium-glass border-0">
                <CModalHeader className="border-0">
                    <CModalTitle className="fw-bold">{t('confirm_delete')}</CModalTitle>
                </CModalHeader>
                <CModalBody className="py-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="p-3 bg-danger bg-opacity-10 rounded-circle text-danger">
                            <Trash2 size={24} />
                        </div>
                        <p className="mb-0 fw-medium">
                            {activeTab === 'categories' 
                                ? "Voulez-vous vraiment supprimer cette catégorie ? Tous les sous-produits risquent d'être orphelins."
                                : "Voulez-vous vraiment supprimer ce produit de PrestaShop ? Cette action est irréversible."
                            }
                        </p>
                    </div>
                </CModalBody>
                <CModalFooter className="border-0">
                    <CButton color="secondary" variant="ghost" onClick={() => setDeletingId(null)}>{t('cancel', 'Annuler')}</CButton>
                    <CButton color="danger" className="text-white shadow px-4" onClick={handleDelete}>{t('delete_permanently', 'Supprimer définitivement')}</CButton>
                </CModalFooter>
            </CModal>

            <style>{`
                .hover-scale:hover {
                    transform: scale(1.5);
                    z-index: 10;
                }
                .hover-lift:hover {
                    transform: translateY(-2px);
                }
                .transition-all {
                    transition: all 0.2s ease-in-out;
                }
                .premium-glass {
                    background: rgba(var(--cui-body-bg-rgb), 0.7) !important;
                    backdrop-filter: blur(10px) !important;
                    border: 1px solid rgba(var(--cui-body-color-rgb), 0.1) !important;
                }
            `}</style>
        </AppLayout>
    );
}
