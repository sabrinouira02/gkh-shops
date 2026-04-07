import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CRow, CFormSwitch, CInputGroup, CInputGroupText } from '@coreui/react-pro';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Save, ArrowLeft, Info, Trash, Tag, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import React from 'react';

interface Shop {
    id: number;
    name: string;
    url: string;
    admin_url: string | null;
    api_key: string;
    description: string | null;
    is_active: boolean;
    logo_url: string | null;
    category_id: number | null;
    ks1_enabled: boolean;
    ks1_settings: {
        order_states: number[];
        [key: string]: any;
    };
}

export default function Edit({ shop, categories, order_states = [] }: { shop: Shop, categories: any[], order_states?: any[] }) {
    const { t } = useTranslation();
    const initialKs1Settings = {
        ks1_id: '',
        ks1_user: '',
        ks1_pass: '',
        ks1_salesman: '',
        ks1_shop_identifier: '',
        ks1_project: 'Lager',
        shipping_cost_id: '9999',
        conditions: '14 Tage Netto',
        conditions_days: 14,
        discount: 0,
        discount_days: 0,
        delivery_date: 4,
        weight_per_package: 15,
        order_states: [2],
        ...(shop.ks1_settings || {})
    };

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        name: shop.name || '',
        url: shop.url || '',
        api_key: shop.api_key || '',
        admin_url: shop.admin_url || '',
        logo: null as File | null,
        description: shop.description || '',
        is_active: !!shop.is_active,
        category_id: shop.category_id || '',
        ks1_enabled: !!shop.ks1_enabled,
        ks1_settings: initialKs1Settings
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('shops'), href: '/shops' },
        { title: t('edit'), href: '#' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/shops/${shop.id}`);
    };

    const handleDelete = () => {
        if (confirm(t('confirm_delete'))) {
            router.delete(`/shops/${shop.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('edit')} ${shop.name}`} />

            <CContainer fluid className="py-4">
                <div className="mb-4">
                    <Link href="/shops" className="text-decoration-none d-flex align-items-center gap-1 text-muted mb-2">
                        <ArrowLeft size={16} /> {t('back_to_list')}
                    </Link>
                    <h2 className="fw-bold">{t('edit_shop')}</h2>
                </div>

                <CRow className="g-4">
                    <CCol lg={8}>
                        <CCard className="shadow-sm border-0">
                            <CCardBody className="p-4">
                                <CForm onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <CFormLabel htmlFor="name">{t('shop_name')}</CFormLabel>
                                        <CFormInput
                                            type="text"
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            invalid={!!errors.name}
                                        />
                                        {errors.name && <div className="invalid-feedback text-danger">{errors.name}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="category_id">{t('category')}</CFormLabel>
                                        <CInputGroup className="flex-nowrap">
                                            <CInputGroupText className="bg-body-secondary text-secondary">
                                                <Tag size={16} />
                                            </CInputGroupText>
                                            <CFormSelect
                                                id="category_id"
                                                value={data.category_id}
                                                onChange={(e) => setData('category_id', e.target.value)}
                                                invalid={!!errors.category_id}
                                            >
                                                <option value="">-- {t('select_category')} --</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </CFormSelect>
                                        </CInputGroup>
                                        {errors.category_id && <div className="text-danger small mt-1">{errors.category_id}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="logo">{t('shop_logo')}</CFormLabel>
                                        <div className="mb-2 d-flex align-items-center gap-3">
                                            {shop.logo_url && (
                                                <img src={shop.logo_url} alt="Current Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} className="rounded border bg-light p-1" />
                                            )}
                                            <CFormInput
                                                type="file"
                                                id="logo"
                                                onChange={(e) => setData('logo', e.target.files ? e.target.files[0] : null)}
                                                invalid={!!errors.logo}
                                            />
                                        </div>
                                        <div className="small text-muted">{t('leave_empty_logo')}</div>
                                        {errors.logo && <div className="invalid-feedback text-danger d-block">{errors.logo}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="url">{t('api_url')}</CFormLabel>
                                        <CFormInput
                                            type="url"
                                            id="url"
                                            value={data.url}
                                            onChange={(e) => setData('url', e.target.value)}
                                            invalid={!!errors.url}
                                        />
                                        {errors.url && <div className="text-danger small mt-1">{errors.url}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="api_key">{t('webservice_key')}</CFormLabel>
                                        <CFormInput
                                            type="password"
                                            id="api_key"
                                            value={data.api_key}
                                            onChange={(e) => setData('api_key', e.target.value)}
                                            invalid={!!errors.api_key}
                                        />
                                        {errors.api_key && <div className="text-danger small mt-1">{errors.api_key}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="admin_url">{t('admin_url_opt')}</CFormLabel>
                                        <CFormInput
                                            type="url"
                                            id="admin_url"
                                            value={data.admin_url}
                                            onChange={(e) => setData('admin_url', e.target.value)}
                                            invalid={!!errors.admin_url}
                                        />
                                        {errors.admin_url && <div className="text-danger small mt-1">{errors.admin_url}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <CFormLabel htmlFor="description">{t('description_opt')}</CFormLabel>
                                        <CFormTextarea
                                            id="description"
                                            rows={3}
                                            value={data.description || ''}
                                            onChange={(e) => setData('description', e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <CFormSwitch
                                            id="is_active"
                                            label={t('shop_active')}
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                        />
                                    </div>

                                    <div className="mb-4 p-3 bg-body-tertiary rounded border border-primary border-opacity-10">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <RefreshCw size={20} className="text-primary" />
                                            <h5 className="mb-0 fw-bold">Synchronisation KS1</h5>
                                        </div>

                                        <div className="mb-3">
                                            <CFormSwitch
                                                id="ks1_enabled"
                                                label="Activer la synchronisation KS1"
                                                checked={data.ks1_enabled}
                                                onChange={(e) => setData('ks1_enabled', e.target.checked)}
                                            />
                                        </div>

                                        {data.ks1_enabled && (
                                            <div className="ms-4 ps-2 border-start border-primary border-opacity-25">
                                                <div className="mb-3">
                                                    <CFormLabel className="small fw-bold">États de commande à transmettre</CFormLabel>
                                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                                        {order_states.map((state) => (
                                                            <div key={state.id} className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id={`state_${state.id}`}
                                                                    checked={data.ks1_settings.order_states.includes(Number(state.id))}
                                                                    onChange={(e) => {
                                                                        const id = Number(state.id);
                                                                        const current = [...data.ks1_settings.order_states];
                                                                        if (e.target.checked) {
                                                                            if (!current.includes(id)) current.push(id);
                                                                        } else {
                                                                            const index = current.indexOf(id);
                                                                            if (index > -1) current.splice(index, 1);
                                                                        }
                                                                        setData('ks1_settings', { ...data.ks1_settings, order_states: current });
                                                                    }}
                                                                />
                                                                <label className="form-check-label small" htmlFor={`state_${state.id}`}>
                                                                    {state.name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <CRow className="g-3 mb-3">
                                                    <CCol md={6}>
                                                        <CFormLabel className="small fw-bold">KS1-ID</CFormLabel>
                                                        <CFormInput
                                                            size="sm"
                                                            value={data.ks1_settings.ks1_id}
                                                            onChange={(e) => setData('ks1_settings', { ...data.ks1_settings, ks1_id: e.target.value })}
                                                        />
                                                    </CCol>
                                                    <CCol md={6}>
                                                        <CFormLabel className="small fw-bold">Verkäufer (Salesman)</CFormLabel>
                                                        <CFormInput
                                                            size="sm"
                                                            value={data.ks1_settings.ks1_salesman}
                                                            onChange={(e) => setData('ks1_settings', { ...data.ks1_settings, ks1_salesman: e.target.value })}
                                                        />
                                                    </CCol>
                                                    <CCol md={6}>
                                                        <CFormLabel className="small fw-bold">Benutzer (KS1-User)</CFormLabel>
                                                        <CFormInput
                                                            size="sm"
                                                            value={data.ks1_settings.ks1_user}
                                                            onChange={(e) => setData('ks1_settings', { ...data.ks1_settings, ks1_user: e.target.value })}
                                                        />
                                                    </CCol>
                                                    <CCol md={6}>
                                                        <CFormLabel className="small fw-bold">Passwort</CFormLabel>
                                                        <CFormInput
                                                            type="password"
                                                            size="sm"
                                                            value={data.ks1_settings.ks1_pass}
                                                            onChange={(e) => setData('ks1_settings', { ...data.ks1_settings, ks1_pass: e.target.value })}
                                                        />
                                                    </CCol>
                                                    <CCol md={6}>
                                                        <CFormLabel className="small fw-bold">Shop Identifier</CFormLabel>
                                                        <CFormInput
                                                            size="sm"
                                                            value={data.ks1_settings.ks1_shop_identifier}
                                                            onChange={(e) => setData('ks1_settings', { ...data.ks1_settings, ks1_shop_identifier: e.target.value })}
                                                        />
                                                    </CCol>
                                                    <CCol md={6}>
                                                        <CFormLabel className="small fw-bold">Projekt</CFormLabel>
                                                        <CFormInput
                                                            size="sm"
                                                            value={data.ks1_settings.ks1_project}
                                                            onChange={(e) => setData('ks1_settings', { ...data.ks1_settings, ks1_project: e.target.value })}
                                                        />
                                                    </CCol>
                                                </CRow>

                                                <CRow className="g-3 mb-3">
                                                    <CCol md={6}>
                                                        <CFormLabel className="small fw-bold">Conditions (Texte)</CFormLabel>
                                                        <CFormInput
                                                            size="sm"
                                                            value={data.ks1_settings.conditions}
                                                            onChange={(e) => setData('ks1_settings', { ...data.ks1_settings, conditions: e.target.value })}
                                                        />
                                                    </CCol>
                                                    <CCol md={3}>
                                                        <CFormLabel className="small fw-bold">Skonto %</CFormLabel>
                                                        <CFormInput
                                                            type="number"
                                                            step="0.01"
                                                            size="sm"
                                                            value={data.ks1_settings.discount}
                                                            onChange={(e) => setData('ks1_settings', { ...data.ks1_settings, discount: Number(e.target.value) })}
                                                        />
                                                    </CCol>
                                                    <CCol md={3}>
                                                        <CFormLabel className="small fw-bold">Skonto Tage</CFormLabel>
                                                        <CFormInput
                                                            type="number"
                                                            size="sm"
                                                            value={data.ks1_settings.discount_days}
                                                            onChange={(e) => setData('ks1_settings', { ...data.ks1_settings, discount_days: Number(e.target.value) })}
                                                        />
                                                    </CCol>
                                                    <CCol md={4}>
                                                        <CFormLabel className="small fw-bold">Shipping Cost ID</CFormLabel>
                                                        <CFormInput
                                                            size="sm"
                                                            value={data.ks1_settings.shipping_cost_id}
                                                            onChange={(e) => setData('ks1_settings', { ...data.ks1_settings, shipping_cost_id: e.target.value })}
                                                        />
                                                    </CCol>
                                                    <CCol md={4}>
                                                        <CFormLabel className="small fw-bold">Delivery Date (Days)</CFormLabel>
                                                        <CFormInput
                                                            type="number"
                                                            size="sm"
                                                            value={data.ks1_settings.delivery_date}
                                                            onChange={(e) => setData('ks1_settings', { ...data.ks1_settings, delivery_date: Number(e.target.value) })}
                                                        />
                                                    </CCol>
                                                    <CCol md={4}>
                                                        <CFormLabel className="small fw-bold">Weight/Package (kg)</CFormLabel>
                                                        <CFormInput
                                                            type="number"
                                                            size="sm"
                                                            value={data.ks1_settings.weight_per_package}
                                                            onChange={(e) => setData('ks1_settings', { ...data.ks1_settings, weight_per_package: Number(e.target.value) })}
                                                        />
                                                    </CCol>
                                                </CRow>

                                                <div className="mb-2 p-2 bg-white bg-opacity-50 rounded border small">
                                                    <div className="fw-bold text-primary mb-1">URL Endpoint pour KS1 :</div>
                                                    <code className="text-break">{window.location.origin}/ks1/{shop.id}/</code>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-flex justify-content-between pt-3 border-top">
                                        <CButton
                                            type="button"
                                            color="danger"
                                            variant="ghost"
                                            className="d-flex align-items-center gap-2"
                                            onClick={handleDelete}
                                        >
                                            <Trash size={18} /> {t('delete')}
                                        </CButton>
                                        <CButton
                                            type="submit"
                                            color="primary"
                                            className="px-5 d-flex align-items-center gap-2 shadow-sm"
                                            disabled={processing}
                                        >
                                            <Save size={18} /> {t('update')}
                                        </CButton>
                                    </div>
                                </CForm>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol lg={4}>
                        <CCard className="bg-body-tertiary border-0 shadow-sm overflow-hidden">
                            <CCardBody className="p-4">
                                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                                    <Info size={20} /> {t('api_connection_title')}
                                </h5>
                                <p className="small text-secondary mb-0">
                                    {t('last_success_sync')} : {shop.url}
                                </p>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </AppLayout>
    );
}
