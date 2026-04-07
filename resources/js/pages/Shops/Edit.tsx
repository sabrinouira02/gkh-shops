import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CRow, CFormSwitch, CInputGroup, CInputGroupText } from '@coreui/react-pro';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Save, ArrowLeft, Info, Trash, Tag } from 'lucide-react';
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
    logo: string | null;
    logo_url: string | null;
    category_id: number | null;
}

export default function Edit({ shop, categories }: { shop: Shop, categories: any[] }) {
    const { t } = useTranslation();
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
