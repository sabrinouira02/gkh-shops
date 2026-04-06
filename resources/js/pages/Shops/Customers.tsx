import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Customer, type Shop } from '@/types';
import { CCard, CCardBody, CContainer, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge, CButton, CFormInput, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CNav, CNavItem, CNavLink } from '@coreui/react-pro';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, ChevronUp, ChevronDown, User, Mail, Calendar, Search, Download, FileSpreadsheet, Settings, Trash2, Info, MapPin, Hash, Phone, Building } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import Pagination from '@/components/Pagination';
import { useTranslation } from 'react-i18next';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

export default function Customers({ shop, customers, addresses, total, params, activeTab }: { shop: Shop, customers: Customer[], addresses: any[], total: number, params: any, activeTab: string }) {
    const { t } = useTranslation();
    const [deletingCustomerId, setDeletingCustomerId] = useState<number | string | null>(null);
    const [deletingAddressId, setDeletingAddressId] = useState<number | string | null>(null);

    const handleDeleteCustomer = () => {
        if (!deletingCustomerId) return;
        router.delete(`/shops/${shop.id}/customers/${deletingCustomerId}`, {
            onSuccess: () => setDeletingCustomerId(null),
        });
    };

    const handleDeleteAddress = () => {
        if (!deletingAddressId) return;
        router.delete(`/shops/${shop.id}/addresses/${deletingAddressId}`, {
            onSuccess: () => setDeletingAddressId(null),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('shops'), href: '/shops' },
        { title: shop.name, href: `/shops/${shop.id}` },
        { title: activeTab === 'addresses' ? t('addresses') : t('customers'), href: `/shops/${shop.id}/customers` },
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
            const currentTab = activeTab === 'addresses' ? 'addresses' : 'list';
            router.get(`/shops/${shop.id}/customers`, { ...params, filters, page: 1, tab: currentTab }, {
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
        router.get(`/shops/${shop.id}/customers`, { ...params, page, tab: activeTab });
    };

    const handleLimitChange = (limit: number) => {
        router.get(`/shops/${shop.id}/customers`, { ...params, limit, page: 1, tab: activeTab });
    };

    const handleSort = (field: string) => {
        const order = params.sort_field === field && params.sort_order === 'ASC' ? 'DESC' : 'ASC';
        router.get(`/shops/${shop.id}/customers`, { ...params, sort_field: field, sort_order: order, page: 1, tab: activeTab });
    };

    const getSortIcon = (field: string) => {
        if (params.sort_field !== field) return null;
        return params.sort_order === 'ASC' ? <ChevronUp size={14} className="ms-1 animate-bounce" /> : <ChevronDown size={14} className="ms-1 animate-bounce" />;
    };

    const handleExport = (type: 'csv' | 'excel') => {
        let rows = [];
        let filename = '';

        if (activeTab === 'addresses') {
            rows = addresses.map(a => ({
                ID: a.id,
                Alias: a.alias,
                Nom: a.lastname,
                Prénom: a.firstname,
                Adresse: `${a.address1} ${a.address2 || ''}`,
                CP: a.postcode,
                Ville: a.city,
                Téléphone: a.phone_mobile || a.phone,
                'ID Client': a.id_customer
            }));
            filename = `adresses_${shop.name}`;
        } else {
            rows = customers.map(c => ({
                ID: c.id,
                Prénom: c.firstname,
                Nom: c.lastname,
                Email: c.email,
                'Inscrit le': new Date(c.date_add).toLocaleDateString('fr-FR'),
                Actif: c.active === '1' ? 'Oui' : 'Non',
            }));
            filename = `clients_${shop.name}`;
        }
        
        type === 'csv' ? exportToCSV(rows, filename) : exportToExcel(rows, filename);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${activeTab === 'addresses' ? t('addresses') : t('customers')} - ${shop.name}`} />

            <CContainer fluid className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4 text-body">
                    <div className="animate__animated animate__fadeInLeft">
                        <h2 className="fw-bold mb-0 text-body d-flex align-items-center gap-2">
                            {activeTab === 'addresses' ? (
                                <><MapPin className="text-warning" size={28} /> {t('address_list')}</>
                            ) : (
                                <><User className="text-primary" size={28} /> {t('customers')}</>
                            )}
                        </h2>
                        <p className="text-secondary mb-0 opacity-75">{total} {activeTab === 'addresses' ? t('all_addresses') : t('total_customers')} sur {shop.name}</p>
                    </div>
                    <div className="d-flex gap-2 animate__animated animate__fadeInRight">
                        <CButton color="success" variant="outline" size="sm" className="d-flex align-items-center gap-1 shadow-sm hover-lift" onClick={() => handleExport('excel')}>
                            <FileSpreadsheet size={15} /> Excel
                        </CButton>
                        <CButton color="secondary" variant="outline" size="sm" className="d-flex align-items-center gap-1 shadow-sm hover-lift" onClick={() => handleExport('csv')}>
                            <Download size={15} /> CSV
                        </CButton>
                    </div>
                </div>

                <div className="bg-body-secondary p-1 rounded-3 d-inline-flex mb-4 shadow-sm border border-secondary border-opacity-10">
                    <Link 
                        href={`/shops/${shop.id}/customers?tab=list`} 
                        className={`btn btn-sm px-4 py-2 d-flex align-items-center gap-2 transition-all rounded-2 ${activeTab !== 'addresses' ? 'btn-primary shadow text-white' : 'btn-ghost text-secondary border-0'}`}
                    >
                        <User size={16} /> {t('customers')}
                    </Link>
                    <Link 
                        href={`/shops/${shop.id}/customers?tab=addresses`} 
                        className={`btn btn-sm px-4 py-2 d-flex align-items-center gap-2 transition-all rounded-2 ${activeTab === 'addresses' ? 'btn-primary shadow text-white' : 'btn-ghost text-secondary border-0'}`}
                    >
                        <MapPin size={16} /> {t('addresses')}
                    </Link>
                </div>

                <CCard className="border-0 shadow-lg overflow-hidden mb-4 bg-body-tertiary premium-glass">
                    <CCardBody className="p-0">
                        {activeTab !== 'addresses' ? (
                            <CTable align="middle" responsive hover className="mb-0 border-top-0 transition-all">
                                <CTableHead className="bg-body-secondary text-secondary small text-uppercase fw-bold border-bottom">
                                    <CTableRow>
                                        <CTableHeaderCell 
                                            onClick={() => handleSort('id')} 
                                            style={{ cursor: 'pointer' }}
                                            className="ps-4 py-3 border-0"
                                        >
                                            <div className="d-flex align-items-center">ID {getSortIcon('id')}</div>
                                        </CTableHeaderCell>
                                        <CTableHeaderCell 
                                            onClick={() => handleSort('lastname')} 
                                            style={{ cursor: 'pointer' }}
                                            className="border-0"
                                        >
                                            <div className="d-flex align-items-center">{t('name')} {getSortIcon('lastname')}</div>
                                        </CTableHeaderCell>
                                        <CTableHeaderCell 
                                            onClick={() => handleSort('email')} 
                                            style={{ cursor: 'pointer' }}
                                            className="border-0"
                                        >
                                            <div className="d-flex align-items-center">{t('email')} {getSortIcon('email')}</div>
                                        </CTableHeaderCell>
                                        <CTableHeaderCell 
                                            onClick={() => handleSort('date_add')} 
                                            style={{ cursor: 'pointer' }}
                                            className="border-0"
                                        >
                                            <div className="d-flex align-items-center">{t('registered')} {getSortIcon('date_add')}</div>
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="border-0">{t('status')}</CTableHeaderCell>
                                        <CTableHeaderCell className="text-end pe-4 border-0">{t('actions')}</CTableHeaderCell>
                                    </CTableRow>
                                    <CTableRow className="bg-body-tertiary border-bottom small-filters">
                                        <CTableHeaderCell className="ps-3 py-1">
                                            <div className="position-relative">
                                                <Search size={10} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-secondary opacity-50" />
                                                <CFormInput 
                                                    size="sm" 
                                                    placeholder="ID"
                                                    value={filters.id || ''}
                                                    onChange={(e) => handleFilterChange('id', e.target.value)}
                                                    className="ps-4 bg-body border-0 shadow-none small"
                                                    style={{ fontSize: '0.75rem' }}
                                                />
                                            </div>
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="py-1">
                                            <div className="position-relative">
                                                <CFormInput 
                                                    size="sm" 
                                                    placeholder={t('search_customer')}
                                                    value={filters.lastname || ''}
                                                    onChange={(e) => handleFilterChange('lastname', e.target.value)}
                                                    className="bg-body border-0 shadow-none small"
                                                    style={{ fontSize: '0.75rem' }}
                                                />
                                            </div>
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="py-1">
                                            <CFormInput 
                                                size="sm" 
                                                placeholder={t('email')}
                                                value={filters.email || ''}
                                                onChange={(e) => handleFilterChange('email', e.target.value)}
                                                className="bg-body border-0 shadow-none small"
                                                style={{ fontSize: '0.75rem' }}
                                            />
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="py-1">
                                            <CFormInput 
                                                size="sm" 
                                                placeholder="Date..."
                                                value={filters.date_add || ''}
                                                onChange={(e) => handleFilterChange('date_add', e.target.value)}
                                                className="bg-body border-0 shadow-none small"
                                                style={{ fontSize: '0.75rem' }}
                                            />
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="py-1"></CTableHeaderCell>
                                        <CTableHeaderCell className="text-end pe-3 py-1">
                                            <CButton 
                                                variant="ghost" 
                                                size="sm" 
                                                color="secondary"
                                                onClick={() => setFilters({})}
                                                className="p-0 border-0 text-decoration-none opacity-50 hover-opacity-100"
                                                style={{ fontSize: '0.7rem' }}
                                            >
                                                {t('clear_filters')}
                                            </CButton>
                                        </CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {customers.length === 0 ? (
                                        <CTableRow>
                                            <CTableDataCell colSpan={6} className="text-center py-5">
                                                <div className="text-secondary opacity-50 d-flex flex-column align-items-center gap-2">
                                                    <Search size={40} />
                                                    {t('no_items')}
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ) : (
                                        customers.map((customer) => (
                                            <CTableRow key={customer.id} className="hover-lift transition-all">
                                                <CTableDataCell className="ps-4 text-secondary small">#{customer.id}</CTableDataCell>
                                                <CTableDataCell className="fw-bold text-body">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-1 d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                                            {customer.firstname.charAt(0)}{customer.lastname.charAt(0)}
                                                        </div>
                                                        <div className="d-flex flex-column">
                                                            <span>{customer.firstname} {customer.lastname}</span>
                                                            <span className="text-muted small fw-normal">{t('registered')} {new Date(customer.date_add).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell className="small text-body">
                                                    <Mail size={12} className="me-1 text-primary opacity-50" /> {customer.email}
                                                </CTableDataCell>
                                                <CTableDataCell className="small text-secondary">
                                                    <Calendar size={12} className="me-1 text-secondary opacity-50" /> {new Date(customer.date_add).toLocaleDateString()}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color={customer.active === '1' ? 'success' : 'secondary'} className={`rounded-pill px-3 py-1 bg-opacity-10 ${customer.active === '1' ? 'text-success' : 'text-secondary'} border-0`}>
                                                        {customer.active === '1' ? t('active') : t('inactive')}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell className="text-end pe-4">
                                                    <div className="d-flex justify-content-end gap-1">
                                                        <CButton color="danger" variant="ghost" size="sm" className="rounded-pill hover-bg-danger-soft transition-all" title={t('delete')} onClick={() => setDeletingCustomerId(customer.id)}>
                                                            <Trash2 size={16} />
                                                        </CButton>
                                                        <Link href={`/shops/${shop.id}/customers/${customer.id}/edit`}>
                                                            <CButton color="warning" variant="ghost" size="sm" className="rounded-pill hover-bg-warning-soft transition-all" title={t('edit')}>
                                                                <Settings size={16} />
                                                            </CButton>
                                                        </Link>
                                                        <Link href={`/shops/${shop.id}/customers/${customer.id}`}>
                                                            <CButton color="primary" variant="ghost" size="sm" className="rounded-pill hover-bg-primary-soft transition-all" title={t('details')}>
                                                                <Eye size={18} />
                                                            </CButton>
                                                        </Link>
                                                    </div>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    )}
                                </CTableBody>
                            </CTable>
                        ) : (
                            <CTable align="middle" responsive hover className="mb-0 border-top-0 transition-all">
                                <CTableHead className="bg-body-secondary text-secondary small text-uppercase">
                                    <CTableRow>
                                        <CTableHeaderCell 
                                            onClick={() => handleSort('id')} 
                                            style={{ cursor: 'pointer' }}
                                            className="ps-4 py-3 border-0"
                                        >
                                            <div className="d-flex align-items-center">ID {getSortIcon('id')}</div>
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="border-0">{t('alias_company')}</CTableHeaderCell>
                                        <CTableHeaderCell className="border-0">{t('recipient')}</CTableHeaderCell>
                                        <CTableHeaderCell className="border-0">{t('location')}</CTableHeaderCell>
                                        <CTableHeaderCell className="border-0">{t('associated_customer')}</CTableHeaderCell>
                                        <CTableHeaderCell className="text-end pe-4 border-0">{t('actions')}</CTableHeaderCell>
                                    </CTableRow>
                                    <CTableRow className="bg-body-tertiary border-bottom small-filters">
                                        <CTableHeaderCell className="ps-3 py-1">
                                            <CFormInput size="sm" placeholder="ID" value={filters.id || ''} onChange={(e) => handleFilterChange('id', e.target.value)} className="bg-body border-0 shadow-none small" style={{ fontSize: '0.75rem' }} />
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="py-1">
                                            <CFormInput size="sm" placeholder={t('alias')} value={filters.alias || ''} onChange={(e) => handleFilterChange('alias', e.target.value)} className="bg-body border-0 shadow-none small" style={{ fontSize: '0.75rem' }} />
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="py-1">
                                            <CFormInput size="sm" placeholder={t('name')} value={filters.lastname || ''} onChange={(e) => handleFilterChange('lastname', e.target.value)} className="bg-body border-0 shadow-none small" style={{ fontSize: '0.75rem' }} />
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="py-1">
                                            <CFormInput size="sm" placeholder={t('city')} value={filters.city || ''} onChange={(e) => handleFilterChange('city', e.target.value)} className="bg-body border-0 shadow-none small" style={{ fontSize: '0.75rem' }} />
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="py-1">
                                            <CFormInput size="sm" placeholder={t('id_customer')} value={filters.id_customer || ''} onChange={(e) => handleFilterChange('id_customer', e.target.value)} className="bg-body border-0 shadow-none small" style={{ fontSize: '0.75rem' }} />
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className="text-end pe-3 py-1">
                                            <CButton variant="ghost" size="sm" color="secondary" onClick={() => setFilters({})} className="p-0 border-0 small opacity-50" style={{ fontSize: '0.7rem' }}>{t('clear_filters')}</CButton>
                                        </CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {addresses.length === 0 ? (
                                        <CTableRow>
                                            <CTableDataCell colSpan={6} className="text-center py-5 text-secondary opacity-50 d-flex flex-column align-items-center gap-2">
                                                <MapPin size={40} />
                                                Aucune adresse trouvée
                                            </CTableDataCell>
                                        </CTableRow>
                                    ) : (
                                        addresses.map((address) => (
                                            <CTableRow key={address.id} className="hover-lift transition-all">
                                                <CTableDataCell className="ps-4 small text-secondary">#{address.id}</CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="fw-bold text-primary small mb-1">{address.alias}</div>
                                                    {address.company && <div className="text-muted small d-flex align-items-center gap-1"><Building size={12}/> {address.company}</div>}
                                                </CTableDataCell>
                                                <CTableDataCell className="small">
                                                    <div className="fw-bold">{address.firstname} {address.lastname}</div>
                                                    {address.phone_mobile && <div className="text-muted"><Phone size={12} className="me-1"/>{address.phone_mobile}</div>}
                                                </CTableDataCell>
                                                <CTableDataCell className="small">
                                                    <div>{address.address1}</div>
                                                    <div className="text-muted">{address.postcode} {address.city}</div>
                                                </CTableDataCell>
                                                <CTableDataCell className="small">
                                                    <Link href={`/shops/${shop.id}/customers/${address.id_customer}`} className="d-flex align-items-center gap-1 text-decoration-none">
                                                        <User size={14}/> ID: {address.id_customer}
                                                    </Link>
                                                </CTableDataCell>
                                                <CTableDataCell className="text-end pe-4">
                                                    <div className="d-flex justify-content-end gap-1">
                                                        <CButton color="danger" variant="ghost" size="sm" title="Supprimer" onClick={() => setDeletingAddressId(address.id)}>
                                                            <Trash2 size={16} />
                                                        </CButton>
                                                        {/* On utilisera l'edit client pour l'instant ou on pourra créer une page edit dédié plus tard si besoin */}
                                                        {/* L'utilisateur a demandé d'ajouter edit et supprimer aussi */}
                                                        {/* Je vais lier vers une route edit d'adresse que je vais créer */}
                                                        <Link href={`/shops/${shop.id}/addresses/${address.id}/edit`}>
                                                            <CButton color="warning" variant="ghost" size="sm" title="Modifier">
                                                                <Settings size={16} />
                                                            </CButton>
                                                        </Link>
                                                    </div>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    )}
                                </CTableBody>
                            </CTable>
                        )}
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

            {/* Delete Customer Confirmation Modal */}
            <CModal visible={!!deletingCustomerId} onClose={() => setDeletingCustomerId(null)} alignment="center">
                <CModalHeader>
                    <CModalTitle>Confirmer la suppression du client</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <p>Voulez-vous vraiment supprimer ce client de PrestaShop ? Cette action est irréversible.</p>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeletingCustomerId(null)}>Annuler</CButton>
                    <CButton color="danger" className="text-white" onClick={handleDeleteCustomer}>Supprimer définitivement</CButton>
                </CModalFooter>
            </CModal>

            {/* Delete Address Confirmation Modal */}
            <CModal visible={!!deletingAddressId} onClose={() => setDeletingAddressId(null)} alignment="center">
                <CModalHeader>
                    <CModalTitle>Confirmer la suppression de l'adresse</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <p>Voulez-vous vraiment supprimer cette adresse ? Cette action est irréversible dans PrestaShop.</p>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeletingAddressId(null)}>Annuler</CButton>
                    <CButton color="danger" className="text-white" onClick={handleDeleteAddress}>Supprimer l'adresse</CButton>
                </CModalFooter>
            </CModal>
        </AppLayout>
    );
}
