import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CCard, CCardBody, CContainer, CRow, CCol, CListGroup, CListGroupItem, CBadge, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react-pro';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, User, Mail, Calendar, Hash, ShoppingBasket, Newspaper, MapPin, Tag, Phone, Eye, Settings, Trash2, Info } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function CustomerShow({ shop, customer, groups = [], addresses = [], orders = [] }: { shop: any, customer: any, groups?: any[], addresses?: any[], orders?: any[] }) {
    const { t } = useTranslation();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = () => {
        router.delete(`/shops/${shop.id}/customers/${customer.id}`, {
            onSuccess: () => setShowDeleteModal(false),
        });
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('shops'), href: '/shops' },
        { title: shop.name, href: `/shops/${shop.id}` },
        { title: t('customers'), href: `/shops/${shop.id}/customers` },
        { title: `${customer.firstname} ${customer.lastname}`, href: `/shops/${shop.id}/customers/${customer.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('user')} #${customer.id} - ${shop.name}`} />

            <CContainer fluid className="py-4">
                <div className="mb-4">
                    <Link href={`/shops/${shop.id}/customers`} className="text-decoration-none d-flex align-items-center gap-1 text-secondary mb-3">
                        <ArrowLeft size={16} /> {t('back_to_list')}
                    </Link>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-info text-white p-3 rounded-circle shadow-sm">
                                <User size={32} />
                            </div>
                            <div>
                                <h2 className="fw-bold mb-0 text-body">{customer.firstname} {customer.lastname}</h2>
                                <p className="text-secondary mb-0 d-flex align-items-center gap-1">
                                    <Mail size={14} /> {customer.email}
                                </p>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <CButton color="danger" variant="outline" onClick={() => setShowDeleteModal(true)} className="d-flex align-items-center gap-1 px-3 py-2 bg-body-emphasis fw-bold shadow-sm border-danger hover-black">
                                <Trash2 size={18} /> {t('delete')}
                            </CButton>
                            <Link href={`/shops/${shop.id}/customers/${customer.id}/edit`} className="text-decoration-none">
                                <CButton color="warning" variant="outline" className="d-flex align-items-center gap-1 px-4 py-2 bg-body-emphasis fw-bold shadow-sm">
                                    <Settings size={18} /> {t('edit')}
                                </CButton>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} alignment="center">
                    <CModalHeader>
                        <CModalTitle>{t('confirm_delete_product')}</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <p>{t('confirm_delete_product_text')} <strong>{customer.firstname} {customer.lastname}</strong> de PrestaShop ?</p>
                        <p className="text-danger small mb-0"><Info size={14} /> {t('irreversible_action')}</p>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>{t('cancel')}</CButton>
                        <CButton color="danger" className="text-white" onClick={handleDelete}>{t('delete_permanently')}</CButton>
                    </CModalFooter>
                </CModal>

                <CRow className="g-4">
                    <CCol lg={4}>
                        <CCard className="border-0 shadow-sm mb-4 bg-body-tertiary">
                            <CCardBody className="p-4 text-center">
                                <div className="mb-4 bg-body-secondary rounded-pill d-inline-block p-3">
                                    <User size={48} className="text-secondary" />
                                </div>
                                <h4 className="fw-bold mb-1 text-body">{customer.firstname} {customer.lastname}</h4>
                                <div className="text-secondary small mb-3">{t('customer_id')}: #{customer.id}</div>
                                <CBadge color={customer.active === '1' ? 'success' : 'danger'} shape="rounded-pill" className="px-3">
                                    {customer.active === '1' ? t('active_account') : t('inactive_account')}
                                </CBadge>
                                
                                <hr className="my-4 border-body" />
                                
                                <div className="text-start">
                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-body">
                                        <Hash size={16} className="text-primary" /> Profil
                                    </h6>
                                    <CListGroup flush>
                                        <CListGroupItem className="d-flex justify-content-between px-0 bg-transparent border-body">
                                            <span className="text-secondary">{t('id_gender')}</span>
                                            <span className="fw-medium text-body">{customer.id_gender === '1' ? t('mr') : (customer.id_gender === '2' ? t('mrs') : 'N/A')}</span>
                                        </CListGroupItem>
                                        <CListGroupItem className="d-flex justify-content-between px-0 bg-transparent border-body">
                                            <span className="text-secondary">{t('birthday')}</span>
                                            <span className="fw-medium text-body">{customer.birthday && customer.birthday !== '0000-00-00' ? customer.birthday : t('not_specified')}</span>
                                        </CListGroupItem>
                                        <CListGroupItem className="d-flex justify-content-between px-0 bg-transparent border-body">
                                            <span className="text-secondary">{t('registered_on')}</span>
                                            <span className="fw-medium small text-body">{new Date(customer.date_add).toLocaleDateString()}</span>
                                        </CListGroupItem>
                                    </CListGroup>
                                </div>
                                
                                <hr className="my-4 border-body" />
                                
                                <div className="text-start">
                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-body">
                                        <Tag size={16} className="text-primary" /> {t('groups')} ({groups.length})
                                    </h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {groups.map((g) => (
                                            <CBadge key={g.id} color={g.is_default ? 'primary' : 'secondary'}>
                                                {g.name}
                                            </CBadge>
                                        ))}
                                    </div>
                                </div>
                            </CCardBody>
                        </CCard>
                    </CCol>

                    <CCol lg={8}>
                        <CCard className="border-0 shadow-sm mb-4 bg-body-tertiary">
                            <CCardBody className="p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-body">
                                    <MapPin size={20} className="text-primary" /> {t('address_book')} ({addresses.length})
                                </h5>
                                <CRow className="g-3">
                                    {addresses.length > 0 ? (
                                        addresses.map((addr) => (
                                            <CCol md={6} key={addr.id}>
                                                <div className="p-3 border border-body rounded h-100 bg-body">
                                                    <div className="fw-bold mb-2 text-primary d-flex justify-content-between">
                                                        <span>{addr.alias}</span>
                                                        {addr.company && <CBadge color="info" className="ms-1">{addr.company}</CBadge>}
                                                    </div>
                                                    <div className="small mb-1 text-body">{addr.firstname} {addr.lastname}</div>
                                                    <div className="small text-secondary mb-2">
                                                        {addr.address1} {addr.address2 && <><br/>{addr.address2}</>}<br/>
                                                        {addr.postcode} {addr.city}
                                                    </div>
                                                    <div className="d-flex align-items-center gap-3 mt-3">
                                                        {addr.phone && <div className="small d-flex align-items-center gap-1 text-secondary"><Phone size={14}/> {addr.phone}</div>}
                                                        {addr.phone_mobile && <div className="small d-flex align-items-center gap-1 text-secondary"><Phone size={14}/> {addr.phone_mobile}</div>}
                                                    </div>
                                                </div>
                                            </CCol>
                                        ))
                                    ) : (
                                        <CCol>
                                            <div className="p-4 text-center bg-body border border-body rounded text-secondary">{t('no_items')}</div>
                                        </CCol>
                                    )}
                                </CRow>
                            </CCardBody>
                        </CCard>

                        <CCard className="border-0 shadow-sm mb-4 bg-body-tertiary">
                            <CCardBody className="p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-body">
                                    <ShoppingBasket size={20} className="text-primary" /> {t('order_history')} ({orders.length})
                                </h5>
                                {orders.length > 0 ? (
                                    <CTable align="middle" responsive hover className="mb-0">
                                        <CTableHead className="bg-body-secondary text-secondary small text-uppercase">
                                            <CTableRow>
                                                <CTableHeaderCell>{t('reference')}</CTableHeaderCell>
                                                <CTableHeaderCell>{t('date')}</CTableHeaderCell>
                                                <CTableHeaderCell>{t('total')}</CTableHeaderCell>
                                                <CTableHeaderCell>{t('status')}</CTableHeaderCell>
                                                <CTableHeaderCell className="text-end">{t('action')}</CTableHeaderCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {orders.map((ord) => (
                                                <CTableRow key={ord.id}>
                                                    <CTableDataCell className="fw-bold text-primary small">{ord.reference}</CTableDataCell>
                                                    <CTableDataCell className="small text-body">{new Date(ord.date_add).toLocaleDateString()}</CTableDataCell>
                                                    <CTableDataCell className="fw-semibold text-body">
                                                        {parseFloat(ord.total_paid).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <CBadge color={ord.current_state == '6' ? 'danger' : (ord.current_state == '2' ? 'success' : 'primary')} shape="rounded-pill">
                                                            {ord.state_name}
                                                        </CBadge>
                                                    </CTableDataCell>
                                                    <CTableDataCell className="text-end">
                                                        <Link href={`/shops/${shop.id}/orders/${ord.id}`}>
                                                            <CButton color="primary" variant="ghost" size="sm"><Eye size={16}/></CButton>
                                                        </Link>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))}
                                        </CTableBody>
                                    </CTable>
                                ) : (
                                    <div className="p-5 text-center bg-body border border-body rounded text-secondary">
                                        <Calendar size={48} className="opacity-25 mb-3" />
                                        <p>{t('no_items')}</p>
                                    </div>
                                )}
                            </CCardBody>
                        </CCard>

                        <CCard className="border-0 shadow-sm overflow-hidden bg-body-tertiary">
                            <CCardBody className="p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-body">
                                    <Newspaper size={20} className="text-secondary" /> {t('notes_marketing_preferences')}
                                </h5>
                                <CRow>
                                    <CCol md={6}>
                                        <div className="p-3 bg-body-secondary rounded text-secondary small mb-3 border border-body">
                                            <strong className="text-body">{t('internal_note')}:</strong><br/>
                                            {customer.note || t('no_note')}
                                        </div>
                                    </CCol>
                                    <CCol md={6}>
                                        <div className="d-flex flex-column gap-2">
                                            <div className="d-flex justify-content-between align-items-center p-2 border-bottom border-body">
                                                <span className="small text-secondary d-flex align-items-center gap-1"><Mail size={14}/> {t('newsletter')}</span>
                                                <CBadge color={customer.newsletter === '1' ? 'success' : 'secondary'}>{customer.newsletter === '1' ? t('yes') : t('no')}</CBadge>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center p-2 border-bottom border-body">
                                                <span className="small text-secondary d-flex align-items-center gap-1"><Tag size={14}/> {t('promotions')}</span>
                                                <CBadge color={customer.optin === '1' ? 'success' : 'secondary'}>{customer.optin === '1' ? t('yes') : t('no')}</CBadge>
                                            </div>
                                        </div>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
            <style>{`
                .hover-black:hover {
                    color: #000 !important;
                }
            `}</style>
        </AppLayout>
    );
}
