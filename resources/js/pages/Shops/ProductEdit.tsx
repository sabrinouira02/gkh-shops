import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CCard, CCardBody, CContainer, CRow, CCol, CButton, CForm, CFormInput, CFormLabel, CFormTextarea, CFormSwitch } from '@coreui/react-pro';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Package, Tag, Layers, Info } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ProductEdit({ shop, product }: { shop: any, product: any }) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('shops'), href: '/shops' },
        { title: shop.name, href: `/shops/${shop.id}` },
        { title: t('products'), href: `/shops/${shop.id}/products` },
        { title: t('edit_product_id', { id: product.id }), href: `/shops/${shop.id}/products/${product.id}/edit` },
    ];

    const getName = (name: any): string => {
        if (!name) return '';
        if (typeof name === 'string') return name.trim();
        if (Array.isArray(name) && name.length > 0) return (typeof name[0] === 'object' ? name[0].value : name[0]) || '';
        if (typeof name === 'object' && name !== null && name.language) {
            const langs = Array.isArray(name.language) ? name.language : [name.language];
            return langs[0]?.value || '';
        }
        return '';
    };

    const { data, setData, put, processing, errors } = useForm({
        name: getName(product.name),
        price: product.price,
        reference: product.reference || '',
        description_short: getName(product.description_short),
        description: getName(product.description),
        active: product.active === '1'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/shops/${shop.id}/products/${product.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('edit_product_id', { id: product.id })} - ${shop.name}`} />

            <CContainer fluid className="py-4">
                <div className="mb-4">
                    <Link href={`/shops/${shop.id}/products/${product.id}`} className="text-decoration-none d-flex align-items-center gap-1 text-muted mb-3">
                        <ArrowLeft size={16} /> {t('cancel_return_details')}
                    </Link>
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-warning text-white p-3 rounded-3 shadow-sm">
                            <Package size={32} />
                        </div>
                        <div>
                            <h2 className="fw-bold mb-0">{t('edit_product_title')}</h2>
                            <p className="text-muted mb-0">{t('edit_ps_info')}</p>
                        </div>
                    </div>
                </div>

                <CRow>
                    <CCol lg={8}>
                        <CForm onSubmit={handleSubmit}>
                            <CCard className="border-0 shadow-sm mb-4">
                                <CCardBody className="p-4">
                                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                        <Info size={18} className="text-primary" /> {t('general_info')}
                                    </h5>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="name">{t('product_name')}</CFormLabel>
                                        <CFormInput
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            invalid={!!errors.name}
                                        />
                                        {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                                    </div>

                                    <CRow className="g-3">
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel htmlFor="reference">{t('reference')}</CFormLabel>
                                                <CFormInput
                                                    id="reference"
                                                    value={data.reference}
                                                    onChange={(e) => setData('reference', e.target.value)}
                                                    invalid={!!errors.reference}
                                                />
                                                {errors.reference && <div className="text-danger small mt-1">{errors.reference}</div>}
                                            </div>
                                        </CCol>
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel htmlFor="price">{t('sales_price_tax_excl')}</CFormLabel>
                                                <CFormInput
                                                    id="price"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.price}
                                                    onChange={(e) => setData('price', e.target.value)}
                                                    invalid={!!errors.price}
                                                />
                                                {errors.price && <div className="text-danger small mt-1">{errors.price}</div>}
                                            </div>
                                        </CCol>
                                    </CRow>

                                    <div className="mb-3 mt-2">
                                        <CFormSwitch
                                            label={t('product_active_shop')}
                                            id="active"
                                            checked={data.active}
                                            onChange={(e) => setData('active', e.target.checked)}
                                        />
                                    </div>

                                    <hr className="my-4" />

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="description_short">{t('short_description_summary')}</CFormLabel>
                                        <CFormTextarea
                                            id="description_short"
                                            rows={3}
                                            value={data.description_short}
                                            onChange={(e) => setData('description_short', e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="description">{t('full_description_html')}</CFormLabel>
                                        <CFormTextarea
                                            id="description"
                                            rows={8}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                        />
                                    </div>

                                    <div className="d-flex justify-content-end gap-2 mt-4">
                                        <Link href={`/shops/${shop.id}/products/${product.id}`}>
                                            <CButton color="secondary" variant="ghost">{t('cancel')}</CButton>
                                        </Link>
                                        <CButton color="primary" type="submit" disabled={processing} className="px-4 d-flex align-items-center gap-2 shadow-sm">
                                            <Save size={18} /> {processing ? t('saving') : t('save_changes')}
                                        </CButton>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CForm>
                    </CCol>

                    <CCol lg={4}>
                        <CCard className="border-0 shadow-sm mb-4">
                            <CCardBody className="p-4">
                                <h5 className="fw-bold mb-3">{t('preview_image')}</h5>
                                {product.main_image ? (
                                    <div className="text-center mb-4 bg-body-tertiary rounded-3 p-4">
                                        <img src={product.main_image} alt={data.name} style={{ maxHeight: '200px', objectFit: 'contain' }} className="mw-100" />
                                    </div>
                                ) : (
                                    <div className="text-center mb-4 bg-body-tertiary rounded-3 p-5 text-secondary">
                                        <Package size={48} className="opacity-25" />
                                        <p className="mt-2 small mb-0">{t('no_image')}</p>
                                    </div>
                                )}
                                <div className="small text-muted mb-2">{t('product_id')}: <strong>{product.id}</strong></div>
                                <div className="small text-muted mb-4">{t('shop')}: <strong>{shop.name}</strong></div>
                                
                                <div className="alert alert-info border-0 shadow-sm small py-3">
                                    <Info size={16} className="me-2 text-info" />
                                    {t('ps_api_edit_notice')}
                                </div>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </AppLayout>
    );
}
