import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CRow, CInputGroup, CInputGroupText } from '@coreui/react-pro';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Info, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import React from 'react';

export default function Create({ categories }: { categories: any[] }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        url: '',
        api_key: '',
        admin_url: '',
        description: '',
        category_id: '',
        logo: null as File | null,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('shops'), href: '/shops' },
        { title: t('new'), href: '/shops/create' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/shops');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('add_shop_title')} - PrestaConnect`} />

            <CContainer fluid className="py-4">
                <div className="mb-4">
                    <Link href="/shops" className="text-decoration-none d-flex align-items-center gap-1 text-muted mb-2">
                        <ArrowLeft size={16} /> {t('back_to_list')}
                    </Link>
                    <h2 className="fw-bold">{t('new_shop')}</h2>
                </div>

                <CRow>
                    <CCol lg={8}>
                        <CCard className="shadow-sm border-0">
                            <CCardBody className="p-4">
                                <CForm onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <CFormLabel htmlFor="name">{t('shop_name')}</CFormLabel>
                                        <CFormInput
                                            type="text"
                                            id="name"
                                            placeholder="Ex: My Store"
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
                                        <CFormInput
                                            type="file"
                                            id="logo"
                                            onChange={(e) => setData('logo', e.target.files ? e.target.files[0] : null)}
                                            invalid={!!errors.logo}
                                        />
                                        {errors.logo && <div className="invalid-feedback text-danger">{errors.logo}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="url">{t('api_url')}</CFormLabel>
                                        <CFormInput
                                            type="url"
                                            id="url"
                                            placeholder="https://mystore.com/"
                                            value={data.url}
                                            onChange={(e) => setData('url', e.target.value)}
                                            invalid={!!errors.url}
                                        />
                                        <div className="form-text mt-1 text-muted d-flex align-items-center gap-1">
                                            <Info size={14} /> {t('api_url_help')}
                                        </div>
                                        {errors.url && <div className="invalid-feedback text-danger">{errors.url}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="api_key">{t('webservice_key')}</CFormLabel>
                                        <CFormInput
                                            type="password"
                                            id="api_key"
                                            placeholder="Your secret key"
                                            value={data.api_key}
                                            onChange={(e) => setData('api_key', e.target.value)}
                                            invalid={!!errors.api_key}
                                        />
                                        {errors.api_key && <div className="invalid-feedback text-danger">{errors.api_key}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="admin_url">{t('admin_url_opt')}</CFormLabel>
                                        <CFormInput
                                            type="url"
                                            id="admin_url"
                                            placeholder="https://mystore.com/admin123"
                                            value={data.admin_url}
                                            onChange={(e) => setData('admin_url', e.target.value)}
                                            invalid={!!errors.admin_url}
                                        />
                                        {errors.admin_url && <div className="invalid-feedback text-danger">{errors.admin_url}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <CFormLabel htmlFor="description">{t('description_opt')}</CFormLabel>
                                        <CFormTextarea
                                            id="description"
                                            rows={3}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                        />
                                    </div>

                                    <div className="d-flex justify-content-end pt-3 border-top gap-2">
                                        <CButton
                                            type="submit"
                                            color="primary"
                                            className="px-5 d-flex align-items-center gap-2 shadow-sm"
                                            disabled={processing}
                                        >
                                            <Save size={18} /> {t('save_shop')}
                                        </CButton>
                                    </div>
                                </CForm>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol lg={4}>
                        <CCard className="bg-body-tertiary border-0 shadow-sm overflow-hidden">
                            <CCardBody className="p-4">
                                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-body">
                                    <Info size={20} className="text-primary" /> {t('help')}
                                </h5>
                                <p className="small text-secondary mb-3">
                                    {t('webservice_help_text')}
                                </p>
                                <ol className="small text-secondary ps-3">
                                    <li className="mb-2">{t('webservice_step_1')}</li>
                                    <li className="mb-2">{t('webservice_step_2')}</li>
                                    <li className="mb-2">{t('webservice_step_3')}</li>
                                    <li>{t('webservice_step_4')}</li>
                                </ol>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </AppLayout>
    );
}
