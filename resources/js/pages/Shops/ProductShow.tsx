import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CCard, CCardBody, CContainer, CRow, CCol, CListGroup, CListGroupItem, CBadge, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CFormSelect, CAlert } from '@coreui/react-pro';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Tag, Layers, Eye, ExternalLink, Hash, Info, Settings, Trash2, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function ProductShow({ shop, product, categories, availableShops = [] }: {
    shop: any,
    product: any,
    categories: any[],
    availableShops?: { id: number, name: string }[]
}) {
    const { t } = useTranslation();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [copyError, setCopyError] = useState<string | null>(null);

    const { data, setData, post, processing } = useForm({
        target_shop_id: ''
    });

    const handleDelete = () => {
        router.delete(`/shops/${shop.id}/products/${product.id}`, {
            onSuccess: () => setShowDeleteModal(false),
        });
    };

    const handleCopy = () => {
        setCopySuccess(null);
        setCopyError(null);
        post(`/shops/${shop.id}/products/${product.id}/copy`, {
            onSuccess: (page: any) => {
                const flash = (page.props as any).flash;
                setCopySuccess(flash?.success || t('product_copied_success'));
            },
            onError: (errors: any) => {
                setCopyError(Object.values(errors).join(', ') || t('error_copying_product'));
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('shops'), href: '/shops' },
        { title: shop.name, href: `/shops/${shop.id}` },
        { title: t('products'), href: `/shops/${shop.id}/products` },
        { title: `${t('product_details')} #${product.id}`, href: `/shops/${shop.id}/products/${product.id}` },
    ];

    const getName = (name: any): string => {
        if (!name) return '';
        if (typeof name === 'string') return name.trim();
        if (Array.isArray(name) && name.length > 0) {
            return (typeof name[0] === 'object' ? name[0].value : name[0]) || '';
        }
        if (typeof name === 'object' && name !== null && name.language) {
            const langs = Array.isArray(name.language) ? name.language : [name.language];
            return langs[0]?.value || '';
        }
        if (typeof name === 'object' && name !== null && name.value) {
            return typeof name.value === 'string' ? name.value : '';
        }
        return '';
    };

    const shortDesc = getName(product.description_short);
    const longDesc = getName(product.description);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('product')} #${product.id} - ${shop.name}`} />

            <CContainer fluid className="py-4">
                <div className="mb-4">
                    <Link href={`/shops/${shop.id}/products`} className="text-decoration-none d-flex align-items-center gap-1 text-muted mb-3">
                        <ArrowLeft size={16} /> {t('back_to_list')}
                    </Link>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary text-white p-3 rounded-3 shadow-sm">
                                <Package size={32} />
                            </div>
                            <div>
                                <h2 className="fw-bold mb-0">{getName(product.name)}</h2>
                                <p className="text-muted mb-0 d-flex align-items-center gap-2">
                                    <Hash size={14} /> {t('reference')}: <span className="fw-bold">{product.reference || t('none')}</span>
                                </p>
                            </div>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                            <CButton
                                color="danger"
                                variant="outline"
                                onClick={() => setShowDeleteModal(true)}
                                className="d-flex align-items-center gap-1 px-3 py-2 bg-body-emphasis fw-bold shadow-sm border-danger hover-black"
                            >
                                <Trash2 size={18} /> {t('delete')}
                            </CButton>
                            <Link href={`/shops/${shop.id}/products/${product.id}/edit`} className="text-decoration-none">
                                <CButton color="warning" variant="outline" className="d-flex align-items-center gap-1 px-4 py-2 bg-body-emphasis fw-bold shadow-sm">
                                    <Settings size={18} /> {t('edit')}
                                </CButton>
                            </Link>
                            {availableShops.length > 0 && (
                                <CButton
                                    color="info"
                                    variant="outline"
                                    onClick={() => { setShowCopyModal(true); setCopySuccess(null); setCopyError(null); }}
                                    className="d-flex align-items-center gap-1 px-4 py-2 bg-body-emphasis fw-bold shadow-sm border-info hover-black"
                                >
                                    <Copy size={18} /> {t('copy_product')}
                                </CButton>
                            )}
                        </div>
                    </div>
                </div>

                {/* Delete Modal */}
                <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} alignment="center">
                    <CModalHeader>
                        <CModalTitle>{t('confirm_delete_product')}</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <p>{t('confirm_delete_product_q', { name: getName(product.name) })}</p>
                        <p className="text-danger small mb-0"><Info size={14} /> {t('irreversible_action')}</p>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>{t('cancel')}</CButton>
                        <CButton color="danger" className="text-white" onClick={handleDelete}>{t('delete_permanently')}</CButton>
                    </CModalFooter>
                </CModal>

                {/* Copy Modal */}
                <CModal visible={showCopyModal} onClose={() => setShowCopyModal(false)} alignment="center" size="lg">
                    <CModalHeader className="border-0 pb-0">
                        <CModalTitle className="fw-bold d-flex align-items-center gap-2">
                            <div className="bg-info text-white p-2 rounded-2">
                                <Copy size={20} />
                            </div>
                            {t('copy_to_another_shop')}
                        </CModalTitle>
                    </CModalHeader>
                    <CModalBody className="py-4 px-4">
                        {copySuccess ? (
                            <div className="text-center py-4">
                                <CheckCircle size={56} className="text-success mb-3" />
                                <h5 className="fw-bold text-success mb-2">{t('copy_success_title')}</h5>
                                <p className="text-muted">{copySuccess}</p>
                            </div>
                        ) : (
                            <>
                                {copyError && (
                                    <CAlert color="danger" className="mb-4">{copyError}</CAlert>
                                )}
                                <div className="p-3 bg-body-secondary rounded-3 mb-4 d-flex gap-3 align-items-center">
                                    <div className="bg-primary text-white p-2 rounded-2 flex-shrink-0">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <div className="fw-bold">{getName(product.name)}</div>
                                        <div className="small text-muted">{t('source_shop')} : <strong>{shop.name}</strong> &bull; ID #{product.id}</div>
                                    </div>
                                </div>

                                <label className="fw-semibold small text-secondary mb-2 d-block">{t('select_target_shop')} :</label>
                                <CFormSelect
                                    value={data.target_shop_id}
                                    onChange={(e) => setData('target_shop_id', e.target.value)}
                                    className="mb-3 shadow-sm border-0 bg-body-secondary py-2"
                                    size="lg"
                                >
                                    <option value="">{t('choose_shop')}</option>
                                    {availableShops.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </CFormSelect>

                                <div className="alert alert-info border-0 small py-2 mb-0">
                                    <Info size={14} className="me-1" />
                                    {t('copy_notice')}
                                </div>
                            </>
                        )}
                    </CModalBody>
                    <CModalFooter className="border-0">
                        <CButton color="secondary" variant="ghost" onClick={() => setShowCopyModal(false)}>
                            {copySuccess ? t('close') : t('cancel')}
                        </CButton>
                        {!copySuccess && (
                            <CButton
                                color="info"
                                className="text-white px-4 d-flex align-items-center gap-2 fw-bold"
                                onClick={handleCopy}
                                disabled={processing || !data.target_shop_id}
                            >
                                <Copy size={18} />
                                {processing ? t('copying_in_progress') : t('copy_btn')}
                            </CButton>
                        )}
                    </CModalFooter>
                </CModal>

                <CRow>
                    <CCol lg={8}>
                        <CCard className="border-0 shadow-sm mb-4">
                            <CCardBody className="p-4">
                                {product.main_image && (
                                    <div className="text-center mb-4 bg-body-tertiary rounded-3 p-4">
                                        <img src={product.main_image} alt={getName(product.name)} style={{ maxHeight: '300px', objectFit: 'contain' }} className="mw-100" />
                                    </div>
                                )}

                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                    <Info size={18} className="text-primary" /> {t('general_info')}
                                </h5>

                                <CRow className="g-4 mb-4">
                                    <CCol sm={6}>
                                        <div className="small text-muted mb-1 text-uppercase">{t('sales_price_tax_excl')}</div>
                                        <h4 className="fw-bold text-primary">
                                            {parseFloat(product.price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                        </h4>
                                    </CCol>
                                    <CCol sm={6}>
                                        <div className="small text-muted mb-1 text-uppercase">{t('available_stock')}</div>
                                        <h4 className="fw-bold d-flex align-items-center gap-2">
                                            {product.quantity}
                                            <CBadge color={parseInt(product.quantity) > 10 ? 'success' : (parseInt(product.quantity) > 0 ? 'warning' : 'danger')} shape="rounded-pill">
                                                {parseInt(product.quantity) > 0 ? t('in_stock') : t('out_of_stock')}
                                            </CBadge>
                                        </h4>
                                    </CCol>
                                    <CCol sm={6}>
                                        <div className="small text-muted mb-1 text-uppercase">{t('product_id', 'ID Produit')} ({t('id') || 'ID'})</div>
                                        <div className="fw-medium">{product.id}</div>
                                    </CCol>
                                    <CCol sm={6}>
                                        <div className="small text-muted mb-1 text-uppercase">{t('condition')}</div>
                                        <div className="fw-medium text-capitalize"><CBadge color="info" shape="rounded-pill" className="px-2">{product.condition}</CBadge></div>
                                    </CCol>
                                </CRow>

                                <hr className="my-4" />

                                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <Layers size={18} className="text-primary" /> {t('associated_categories')}
                                </h5>
                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    {categories && categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <CBadge
                                                key={cat.id}
                                                color={cat.is_default ? 'primary' : 'secondary'}
                                                className={`p-2 ${cat.is_default ? '' : 'border'}`}
                                                shape="rounded-pill"
                                            >
                                                <Tag size={12} className="me-1" /> {cat.name} {cat.is_default && <small className="ms-1 opacity-75">({t('default')})</small>}
                                            </CBadge>
                                        ))
                                    ) : (
                                        <span className="text-muted small italic">{t('no_categories_listed')}</span>
                                    )}
                                </div>

                                {shortDesc && (
                                    <>
                                        <hr className="my-4" />
                                        <h5 className="fw-bold mb-3">{t('summary')}</h5>
                                        <div className="p-3 bg-body-tertiary rounded" dangerouslySetInnerHTML={{ __html: shortDesc }} />
                                    </>
                                )}
                            </CCardBody>
                        </CCard>

                        {longDesc && (
                            <CCard className="border-0 shadow-sm overflow-hidden">
                                <CCardBody className="p-4">
                                    <h5 className="fw-bold mb-3">{t('full_description')}</h5>
                                    <div className="product-description" dangerouslySetInnerHTML={{ __html: longDesc }} />
                                </CCardBody>
                            </CCard>
                        )}
                    </CCol>

                    <CCol lg={4}>
                        <CCard className="border-0 shadow-sm mb-4">
                            <CCardBody className="p-4">
                                <h5 className="fw-bold mb-3">{t('properties_dates')}</h5>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between px-0">
                                        <span className="text-muted">{t('status')}</span>
                                        <CBadge color={product.active === '1' ? 'success' : 'secondary'}>
                                            {product.active === '1' ? t('active') : t('inactive')}
                                        </CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between px-0">
                                        <span className="text-muted">{t('visibility')}</span>
                                        <span className="fw-medium text-capitalize">{product.visibility}</span>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between px-0">
                                        <span className="text-muted">{t('date_add')}</span>
                                        <span className="fw-medium">{new Date(product.date_add).toLocaleDateString()}</span>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between px-0">
                                        <span className="text-muted">{t('date_upd')}</span>
                                        <span className="fw-medium">{new Date(product.date_upd).toLocaleDateString()}</span>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>

                        <div className="d-grid gap-2">
                            <a
                                href={`${shop.url}/index.php?controller=product&id_product=${product.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary py-3 shadow-sm d-flex align-items-center justify-content-center gap-2 fw-bold"
                            >
                                <ExternalLink size={20} /> {t('see_on_shop')}
                            </a>
                        </div>
                    </CCol>
                </CRow>
            </CContainer>

            <style>{`
                .hover-black {
                    color: inherit;
                }
                .hover-black:hover {
                    color: #000 !important;
                }
                .btn-outline-danger {
                    color: var(--cui-danger);
                }
                .btn-outline-info {
                    color: var(--cui-info);
                }
            `}</style>
        </AppLayout>
    );
}
