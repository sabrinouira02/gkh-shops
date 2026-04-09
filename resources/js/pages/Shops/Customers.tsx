import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Customer, type Shop } from '@/types';
import { CCard, CCardBody, CContainer, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge, CButton, CFormInput, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react-pro';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, ChevronUp, ChevronDown, User, Download, FileSpreadsheet, Settings, Trash2, MapPin, Hash, ShoppingBasket } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Pagination from '@/components/Pagination';
import { useTranslation } from 'react-i18next';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

export default function Customers({ shop, customers, addresses, transactions = [], total, params, activeTab }: { shop: Shop, customers: Customer[], addresses: any[], transactions?: any[], total: number, params: any, activeTab: string }) {
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
        { title: activeTab === 'addresses' ? t('addresses') : (activeTab === 'transactions' ? 'Transactions Wallet' : t('customers')), href: `/shops/${shop.id}/customers` },
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
            router.get(`/shops/${shop.id}/customers`, { ...params, filters, page: 1, tab: activeTab }, {
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
        return params.sort_order === 'ASC' ? <ChevronUp size={14} className="ms-1" /> : <ChevronDown size={14} className="ms-1" />;
    };

    const handleExport = (type: 'csv' | 'excel') => {
        let rows = [];
        let filename = '';

        if (activeTab === 'addresses') {
            rows = addresses.map(a => ({
                ID: a.id, Alias: a.alias, Nom: a.lastname, Prénom: a.firstname, CP: a.postcode, Ville: a.city
            }));
            filename = `adresses_${shop.name}`;
        } else if (activeTab === 'transactions') {
            rows = transactions.map(t => ({
                ID: t.id, Transaction: t.id_transaction, Client: t.id_customer, Commande: t.id_order, Total: t.total_amount, Date: t.date_transaction
            }));
            filename = `transactions_${shop.name}`;
        } else {
            rows = customers.map(c => ({
                ID: c.id, Prénom: c.firstname, Nom: c.lastname, Email: c.email, Actif: c.active === '1' ? 'Oui' : 'Non'
            }));
            filename = `clients_${shop.name}`;
        }

        type === 'csv' ? exportToCSV(rows, filename) : exportToExcel(rows, filename);
    };

    const renderTabContent = () => {
        const filterInput = (field: string, placeholder: string = "Rechercher...") => (
            <div className="position-relative">
                <CFormInput
                    size="sm"
                    placeholder={placeholder}
                    value={filters[field] || ''}
                    onChange={(e) => handleFilterChange(field, e.target.value)}
                    className="bg-body border-0 shadow-none small py-0"
                    style={{ fontSize: '0.75rem', height: '24px' }}
                />
            </div>
        );

        switch (activeTab) {
            case 'addresses':
                return (
                    <CTable align="middle" responsive hover className="mb-0 border-top-0 transition-all">
                        <CTableHead className="bg-body-secondary text-secondary small text-uppercase fw-bold border-bottom">
                            <CTableRow>
                                <CTableHeaderCell onClick={() => handleSort('id')} style={{ cursor: 'pointer' }} className="ps-4 py-3">ID {getSortIcon('id')}</CTableHeaderCell>
                                <CTableHeaderCell>Alias / Société</CTableHeaderCell>
                                <CTableHeaderCell>Destinataire</CTableHeaderCell>
                                <CTableHeaderCell>Localisation</CTableHeaderCell>
                                <CTableHeaderCell>ID Client</CTableHeaderCell>
                                <CTableHeaderCell className="text-end pe-4">Actions</CTableHeaderCell>
                            </CTableRow>
                            <CTableRow className="bg-body-tertiary border-bottom">
                                <CTableHeaderCell className="ps-4 py-1">{filterInput('id', 'ID')}</CTableHeaderCell>
                                <CTableHeaderCell className="py-1">{filterInput('alias', t('alias'))}</CTableHeaderCell>
                                <CTableHeaderCell className="py-1">{filterInput('lastname', t('name'))}</CTableHeaderCell>
                                <CTableHeaderCell className="py-1">{filterInput('city', t('city'))}</CTableHeaderCell>
                                <CTableHeaderCell className="py-1">{filterInput('id_customer', 'Client ID')}</CTableHeaderCell>
                                <CTableHeaderCell className="text-end pe-4 py-1">
                                    <CButton variant="ghost" size="sm" color="secondary" onClick={() => setFilters({})} className="p-0 small opacity-50" style={{ fontSize: '0.7rem' }}>{t('clear_filters')}</CButton>
                                </CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {addresses.length === 0 ? (
                                <CTableRow><CTableDataCell colSpan={6} className="text-center py-5 text-secondary opacity-50">Aucune adresse trouvée</CTableDataCell></CTableRow>
                            ) : (
                                addresses.map((addr) => (
                                    <CTableRow key={addr.id}>
                                        <CTableDataCell className="ps-4 small text-secondary">#{addr.id}</CTableDataCell>
                                        <CTableDataCell>
                                            <div className="fw-bold text-primary small">{addr.alias}</div>
                                            {addr.company && <div className="text-muted small">{addr.company}</div>}
                                        </CTableDataCell>
                                        <CTableDataCell className="small fw-bold">{addr.firstname} {addr.lastname}</CTableDataCell>
                                        <CTableDataCell className="small">
                                            <div>{addr.address1}</div>
                                            <div className="text-muted">{addr.postcode} {addr.city}</div>
                                        </CTableDataCell>
                                        <CTableDataCell className="small">
                                            <Link href={`/shops/${shop.id}/customers/${addr.id_customer}`} className="text-decoration-none">ID: {addr.id_customer}</Link>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-1">
                                                <CButton color="danger" variant="ghost" size="sm" onClick={() => setDeletingAddressId(addr.id)}><Trash2 size={16} /></CButton>
                                                <Link href={`/shops/${shop.id}/addresses/${addr.id}/edit`}><CButton color="warning" variant="ghost" size="sm"><Settings size={16} /></CButton></Link>
                                            </div>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))
                            )}
                        </CTableBody>
                    </CTable>
                );
            case 'transactions':
                return (
                    <CTable align="middle" responsive hover className="mb-0 border-top-0 transition-all">
                        <CTableHead className="bg-body-secondary text-secondary small text-uppercase fw-bold border-bottom">
                            <CTableRow>
                                <CTableHeaderCell onClick={() => handleSort('id')} style={{ cursor: 'pointer' }} className="ps-4 py-3">ID {getSortIcon('id')}</CTableHeaderCell>
                                <CTableHeaderCell>Transaction</CTableHeaderCell>
                                <CTableHeaderCell>ID Client / Commande</CTableHeaderCell>
                                <CTableHeaderCell>Budget Std</CTableHeaderCell>
                                <CTableHeaderCell>Budget Spé</CTableHeaderCell>
                                <CTableHeaderCell>Total</CTableHeaderCell>
                                <CTableHeaderCell>Date</CTableHeaderCell>
                            </CTableRow>
                            <CTableRow className="bg-body-tertiary border-bottom">
                                <CTableHeaderCell className="ps-4 py-1">{filterInput('id', 'ID')}</CTableHeaderCell>
                                <CTableHeaderCell className="py-1">{filterInput('id_transaction', 'Ref...')}</CTableHeaderCell>
                                <CTableHeaderCell className="py-1">{filterInput('id_customer', 'ID...')}</CTableHeaderCell>
                                <CTableHeaderCell className="py-1"></CTableHeaderCell>
                                <CTableHeaderCell className="py-1"></CTableHeaderCell>
                                <CTableHeaderCell className="py-1"></CTableHeaderCell>
                                <CTableHeaderCell className="pe-4 py-1">
                                    <CButton variant="ghost" size="sm" color="secondary" onClick={() => setFilters({})} className="p-0 small opacity-50" style={{ fontSize: '0.7rem' }}>{t('clear_filters')}</CButton>
                                </CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {transactions.length === 0 ? (
                                <CTableRow><CTableDataCell colSpan={7} className="text-center py-5 text-secondary opacity-50">Aucune transaction trouvée</CTableDataCell></CTableRow>
                            ) : (
                                transactions.map((t) => (
                                    <CTableRow key={t.id}>
                                        <CTableDataCell className="ps-4 small text-secondary">#{t.id}</CTableDataCell>
                                        <CTableDataCell className="small fw-bold text-primary">{t.id_transaction}</CTableDataCell>
                                        <CTableDataCell className="small">
                                            <Link href={`/shops/${shop.id}/customers/${t.id_customer}`} className="d-block text-decoration-none mb-1 d-flex align-items-center gap-1"><User size={12} /> Client: #{t.id_customer}</Link>
                                            <Link href={`/shops/${shop.id}/orders/${t.id_order}`} className="d-block text-decoration-none d-flex align-items-center gap-1"><Hash size={12} /> Commande: #{t.id_order}</Link>
                                        </CTableDataCell>
                                        <CTableDataCell className={`small fw-bold ${parseFloat(t.standard_amount) < 0 ? 'text-danger' : 'text-success'}`}>{parseFloat(t.standard_amount).toFixed(2)}€</CTableDataCell>
                                        <CTableDataCell className={`small fw-bold ${parseFloat(t.special_amount) < 0 ? 'text-danger' : 'text-info'}`}>{parseFloat(t.special_amount).toFixed(2)}€</CTableDataCell>
                                        <CTableDataCell className={`fw-bold ${parseFloat(t.total_amount) < 0 ? 'text-danger' : 'text-body'}`}>{parseFloat(t.total_amount).toFixed(2)}€</CTableDataCell>
                                        <CTableDataCell className="small text-secondary">{new Date(t.date_transaction).toLocaleString()}</CTableDataCell>
                                    </CTableRow>
                                ))
                            )}
                        </CTableBody>
                    </CTable>
                );
            default: // 'list' or customers
                return (
                    <CTable align="middle" responsive hover className="mb-0 border-top-0 transition-all">
                        <CTableHead className="bg-body-secondary text-secondary small text-uppercase fw-bold border-bottom">
                            <CTableRow>
                                <CTableHeaderCell onClick={() => handleSort('id')} style={{ cursor: 'pointer' }} className="ps-4 py-3">ID {getSortIcon('id')}</CTableHeaderCell>
                                <CTableHeaderCell onClick={() => handleSort('lastname')} style={{ cursor: 'pointer' }}>Nom {getSortIcon('lastname')}</CTableHeaderCell>
                                <CTableHeaderCell onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>Email {getSortIcon('email')}</CTableHeaderCell>
                                <CTableHeaderCell>Statut</CTableHeaderCell>
                                <CTableHeaderCell className="text-end pe-4">Actions</CTableHeaderCell>
                            </CTableRow>
                            <CTableRow className="bg-body-tertiary border-bottom">
                                <CTableHeaderCell className="ps-4 py-1">{filterInput('id', 'ID')}</CTableHeaderCell>
                                <CTableHeaderCell className="py-1">{filterInput('lastname', t('search_customer'))}</CTableHeaderCell>
                                <CTableHeaderCell className="py-1">{filterInput('email', t('email'))}</CTableHeaderCell>
                                <CTableHeaderCell className="py-1"></CTableHeaderCell>
                                <CTableHeaderCell className="text-end pe-4 py-1">
                                    <CButton variant="ghost" size="sm" color="secondary" onClick={() => setFilters({})} className="p-0 small opacity-50" style={{ fontSize: '0.7rem' }}>{t('clear_filters')}</CButton>
                                </CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {customers.length === 0 ? (
                                <CTableRow><CTableDataCell colSpan={5} className="text-center py-5 text-secondary opacity-50">Aucun client trouvé</CTableDataCell></CTableRow>
                            ) : (
                                customers.map((c) => (
                                    <CTableRow key={c.id}>
                                        <CTableDataCell className="ps-4 small text-secondary">#{c.id}</CTableDataCell>
                                        <CTableDataCell className="fw-bold">{c.firstname} {c.lastname}</CTableDataCell>
                                        <CTableDataCell className="small">{c.email}</CTableDataCell>
                                        <CTableDataCell>
                                            <CBadge color={c.active === '1' ? 'success' : 'secondary'} className="rounded-pill px-3">
                                                {c.active === '1' ? t('active') : t('inactive')}
                                            </CBadge>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-1">
                                                <CButton color="danger" variant="ghost" size="sm" onClick={() => setDeletingCustomerId(c.id)}><Trash2 size={16} /></CButton>
                                                <Link href={`/shops/${shop.id}/customers/${c.id}/edit`}><CButton color="warning" variant="ghost" size="sm"><Settings size={16} /></CButton></Link>
                                                <Link href={`/shops/${shop.id}/customers/${c.id}`}><CButton color="primary" variant="ghost" size="sm"><Eye size={18} /></CButton></Link>
                                            </div>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))
                            )}
                        </CTableBody>
                    </CTable>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${activeTab === 'addresses' ? t('addresses') : (activeTab === 'transactions' ? 'Transactions' : t('customers'))} - ${shop.name}`} />

            <CContainer fluid className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4 text-body">
                    <div>
                        <h2 className="fw-bold mb-0 text-body d-flex align-items-center gap-2">
                            {activeTab === 'addresses' && <><MapPin className="text-warning" size={28} /> {t('address_list')}</>}
                            {activeTab === 'transactions' && <><ShoppingBasket className="text-success" size={28} /> Transactions Wallet</>}
                            {activeTab !== 'addresses' && activeTab !== 'transactions' && <><User className="text-primary" size={28} /> {t('customers')}</>}
                        </h2>
                        <p className="text-secondary mb-0 opacity-75">{total} éléments sur {shop.name}</p>
                    </div>
                    <div className="d-flex gap-2">
                        <CButton color="success" variant="outline" size="sm" onClick={() => handleExport('excel')}><FileSpreadsheet size={15} /> Excel</CButton>
                        <CButton color="secondary" variant="outline" size="sm" onClick={() => handleExport('csv')}><Download size={15} /> CSV</CButton>
                    </div>
                </div>

                <div className="bg-body-secondary p-1 rounded-3 d-inline-flex mb-4 shadow-sm">
                    <Link href={`/shops/${shop.id}/customers?tab=list`} className={`btn btn-sm px-4 py-2 rounded-2 ${activeTab !== 'addresses' && activeTab !== 'transactions' ? 'btn-primary shadow text-white' : 'btn-ghost text-secondary'}`}>
                        <User size={16} /> {t('customers')}
                    </Link>
                    <Link href={`/shops/${shop.id}/customers?tab=addresses`} className={`btn btn-sm px-4 py-2 rounded-2 ${activeTab === 'addresses' ? 'btn-primary shadow text-white' : 'btn-ghost text-secondary'}`}>
                        <MapPin size={16} /> {t('addresses')}
                    </Link>
                    <Link href={`/shops/${shop.id}/customers?tab=transactions`} className={`btn btn-sm px-4 py-2 rounded-2 ${activeTab === 'transactions' ? 'btn-primary shadow text-white' : 'btn-ghost text-secondary'}`}>
                        <ShoppingBasket size={16} /> Transactions
                    </Link>
                </div>

                <CCard className="border-0 shadow-lg overflow-hidden mb-4 bg-body-tertiary">
                    <CCardBody className="p-0">
                        {renderTabContent()}
                    </CCardBody>
                </CCard>

                <Pagination currentPage={params.page} total={total} limit={params.limit} onPageChange={handlePageChange} onLimitChange={handleLimitChange} />
            </CContainer>

            <CModal visible={!!deletingCustomerId} onClose={() => setDeletingCustomerId(null)} alignment="center">
                <CModalHeader><CModalTitle>Confirmer suppression</CModalTitle></CModalHeader>
                <CModalBody><p>Voulez-vous vraiment supprimer ce client ?</p></CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeletingCustomerId(null)}>Annuler</CButton>
                    <CButton color="danger" className="text-white" onClick={handleDeleteCustomer}>Supprimer</CButton>
                </CModalFooter>
            </CModal>

            <CModal visible={!!deletingAddressId} onClose={() => setDeletingAddressId(null)} alignment="center">
                <CModalHeader><CModalTitle>Confirmer suppression adresse</CModalTitle></CModalHeader>
                <CModalBody><p>Voulez-vous vraiment supprimer cette adresse ?</p></CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeletingAddressId(null)}>Annuler</CButton>
                    <CButton color="danger" className="text-white" onClick={handleDeleteAddress}>Supprimer</CButton>
                </CModalFooter>
            </CModal>
        </AppLayout>
    );
}
