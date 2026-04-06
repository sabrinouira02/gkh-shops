import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CCard, CCardBody, CContainer, CRow, CCol, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CBadge, CButton } from '@coreui/react-pro';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShoppingCart, CreditCard, Ship, Calendar, MapPin, User, Package, Eye, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';


// ── Reusable address block ─────────────────────────────────────────────────────
function AddressBlock({ address, label, t }: { address: any, label: string, t: (k: string) => string }) {
    const isEmpty = !address || Object.keys(address).length === 0;
    return (
        <div className="mb-3 small">
            <div className="fw-bold text-uppercase text-secondary mb-2">{label}</div>
            {isEmpty ? (
                <div className="p-2 border border-body rounded text-secondary">{t('not_available')}</div>
            ) : (
                <div className="p-3 border border-body rounded bg-body">
                    <div className="fw-semibold text-body mb-1">
                        {address.firstname} {address.lastname}
                        {address.company && <span className="text-secondary fw-normal ms-1">— {address.company}</span>}
                    </div>
                    <div className="text-secondary lh-sm">
                        {address.address1}<br />
                        {address.address2 && <>{address.address2}<br /></>}
                        {address.postcode} {address.city}
                        {address.country && <>, {address.country}</>}
                    </div>
                    {(address.phone || address.phone_mobile) && (
                        <div className="mt-2 d-flex flex-column gap-1">
                            {address.phone && (
                                <div className="d-flex align-items-center gap-1 text-secondary">
                                    <Phone size={12} /> {address.phone}
                                </div>
                            )}
                            {address.phone_mobile && (
                                <div className="d-flex align-items-center gap-1 text-secondary">
                                    <Phone size={12} /> {address.phone_mobile} <span className="opacity-50">(mobile)</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
// ──────────────────────────────────────────────────────────────────────────────

export default function OrderShow({ shop, order, address_invoice, address_delivery, carrier }: {
    shop: any, order: any,
    address_invoice: any, address_delivery: any,
    carrier: any
}) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('shops'), href: '/shops' },
        { title: shop.name, href: `/shops/${shop.id}` },
        { title: t('orders'), href: `/shops/${shop.id}/orders` },
        { title: `${t('details')} #${order.id}`, href: `/shops/${shop.id}/orders/${order.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('order')} #${order.reference} - ${shop.name}`} />

            <CContainer fluid className="py-4">
                <div className="mb-4 d-flex justify-content-between align-items-center">
                    <div>
                        <Link href={`/shops/${shop.id}/orders`} className="text-decoration-none d-flex align-items-center gap-1 text-secondary mb-3">
                            <ArrowLeft size={16} /> {t('back_to_list')}
                        </Link>
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-success text-white p-3 rounded-3 shadow-sm">
                                <ShoppingCart size={32} />
                            </div>
                            <div>
                                <h2 className="fw-bold mb-0 text-body">{t('order')} <span className="text-primary">{order.reference}</span></h2>
                                <p className="text-secondary mb-0 d-flex align-items-center gap-1">
                                    <Calendar size={14} /> {t('placed_on')} {new Date(order.date_add).toLocaleString('fr-FR')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <CRow className="g-4">
                    <CCol lg={8}>
                        <CCard className="border-0 shadow-sm mb-4 bg-body-tertiary">
                            <CCardBody className="p-4">
                                <h5 className="fw-bold mb-4 text-body">{t('order_products')}</h5>
                                <CTable align="middle" responsive hover className="mb-0">
                                    <CTableHead className="bg-body-secondary text-secondary small text-uppercase">
                                        <CTableRow>
                                            <CTableHeaderCell>{t('photo')}</CTableHeaderCell>
                                            <CTableHeaderCell>{t('product')}</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">{t('unit_price')}</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">{t('quantity')}</CTableHeaderCell>
                                            <CTableHeaderCell className="text-end">{t('total')}</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {order.associations?.order_rows?.map((row: any, idx: number) => (
                                            <CTableRow key={idx}>
                                                <CTableDataCell>
                                                    <div className="bg-body-secondary rounded p-2 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                                        <Package size={24} className="text-secondary" />
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="fw-semibold text-body">{t('product')} #{row.product_id}</div>
                                                    <div className="small text-secondary">{row.product_reference || '-'}</div>
                                                </CTableDataCell>
                                                <CTableDataCell className="text-center text-body">
                                                    {parseFloat(row.unit_price_tax_incl || row.product_price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-center text-body">
                                                    x {row.product_quantity}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-end fw-bold text-body">
                                                    {(parseFloat(row.unit_price_tax_incl || row.product_price) * parseInt(row.product_quantity)).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>
                            </CCardBody>
                        </CCard>

                        <CRow className="g-4">
                            <CCol md={6}>
                                <CCard className="border-0 shadow-sm mb-4 h-100 bg-body-tertiary">
                                    <CCardBody className="p-4 d-flex flex-column">
                                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-body">
                                            <CreditCard size={20} className="text-secondary" /> {t('payment')}
                                        </h5>
                                        <div className="flex-grow-1">
                                            <div className="mb-1 text-secondary small text-uppercase">{t('payment_method')}</div>
                                            <div className="fw-bold fs-5 mb-3 text-body">{order.payment}</div>

                                            <div className="p-3 bg-body-secondary rounded-3 d-flex justify-content-between align-items-center border border-body">
                                                <span className="text-secondary">{t('total_paid')}:</span>
                                                <span className="fw-bold fs-4 text-success">
                                                    {parseFloat(order.total_paid).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                </span>
                                            </div>
                                        </div>
                                    </CCardBody>
                                </CCard>
                            </CCol>
                            <CCol md={6}>
                                <CCard className="border-0 shadow-sm mb-4 h-100 bg-body-tertiary">
                                    <CCardBody className="p-4">
                                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-body">
                                            <Ship size={20} className="text-secondary" /> {t('shipping')}
                                        </h5>

                                        {/* Carrier name + ID */}
                                        <div className="mb-3 p-3 bg-body-secondary rounded-3 border border-body d-flex align-items-center gap-3">
                                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                                                <Ship size={18} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-body">
                                                    {carrier?.name || `${t('carrier')} #${order.id_carrier}`}
                                                </div>
                                                {carrier?.delay && (
                                                    <div className="text-secondary small mt-1">
                                                        {Array.isArray(carrier.delay)
                                                            ? carrier.delay[0]?.value
                                                            : (typeof carrier.delay === 'object' && carrier.delay?.language
                                                                ? (Array.isArray(carrier.delay.language)
                                                                    ? carrier.delay.language[0]?.value
                                                                    : carrier.delay.language?.value)
                                                                : carrier.delay)}
                                                    </div>
                                                )}
                                                <div className="text-secondary extra-small opacity-60">ID: {order.id_carrier}</div>
                                            </div>
                                        </div>

                                        {/* Shipping cost */}
                                        <div className="p-3 bg-body-secondary rounded-3 d-flex justify-content-between align-items-center border border-body">
                                            <span className="text-secondary">{t('shipping_cost')}:</span>
                                            <span className="fw-bold text-body">
                                                {parseFloat(order.total_shipping).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                            </span>
                                        </div>
                                    </CCardBody>
                                </CCard>
                            </CCol>
                        </CRow>
                    </CCol>

                    <CCol lg={4}>
                        <CCard className="border-0 shadow-sm mb-4 bg-body-tertiary">
                            <CCardBody className="p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-body">
                                    <User size={20} className="text-secondary" /> {t('customer')}
                                </h5>
                                <div className="d-flex flex-column align-items-center text-center p-3 mb-4 rounded-3 bg-body-secondary border border-body">
                                    {/* Avatar */}
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm"
                                        style={{
                                            width: '64px',
                                            height: '64px',
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
                                        }}
                                    >
                                        <User size={28} color="white" strokeWidth={2} />
                                    </div>

                                    {/* Client ID */}
                                    <div className="text-secondary small mb-1">{t('customer_id')}</div>
                                    <div className="fw-bold fs-5 text-body mb-3">
                                        <span className="badge bg-primary bg-opacity-15 text-primary rounded-pill px-3 py-2" style={{ fontSize: '0.95rem' }}>
                                            # {order.id_customer}
                                        </span>
                                    </div>

                                    {/* CTA */}
                                    <Link
                                        href={`/shops/${shop.id}/customers/${order.id_customer}`}
                                        className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 shadow-sm"
                                        style={{ fontWeight: 600, letterSpacing: '0.01em' }}
                                    >
                                        <User size={14} /> {t('view_customer_profile')}
                                        <span className="ms-auto opacity-75">→</span>
                                    </Link>
                                </div>

                                <hr className="my-4 border-body" />
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-body">
                                    <MapPin size={20} className="text-secondary" /> {t('addresses')}
                                </h5>
                                <AddressBlock address={address_invoice} label={t('billing')} t={t} />
                                <AddressBlock address={address_delivery} label={t('shipping_address')} t={t} />
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </AppLayout>
    );
}
