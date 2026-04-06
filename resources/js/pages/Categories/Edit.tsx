import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CCard, CCardBody, CContainer, CRow, CCol, CForm, CFormInput, CFormLabel, CFormTextarea, CFormSwitch, CButton } from '@coreui/react-pro';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Tag } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CategoryEdit({ category }: { category: any }) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard'), href: '/dashboard' },
        { title: t('categories'), href: '/categories' },
        { title: t('edit_category'), href: `/categories/${category.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: category.name || '',
        description: category.description || '',
        color: category.color || '#4f46e5',
        icon: category.icon || 'folder',
        active: (category.active === 1 || category.active === true) as boolean
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/categories/${category.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('edit_category')} - ${category.name}`} />

            <CContainer fluid className="py-4">
                <div className="mb-4">
                    <Link href="/categories" className="text-decoration-none d-flex align-items-center gap-1 text-secondary mb-3 small hover-primary transition-all">
                        <ArrowLeft size={16} /> {t('back_to_list')}
                    </Link>
                    <h2 className="fw-bold mb-0 text-body">{t('edit_category')}: {category.name}</h2>
                </div>

                <CRow>
                    <CCol lg={8}>
                        <CCard className="border-0 shadow-sm bg-body-tertiary">
                            <CCardBody className="p-4">
                                <CForm onSubmit={submit}>
                                    <CRow className="mb-4">
                                        <CCol md={8}>
                                            <div className="mb-3">
                                                <CFormLabel className="fw-bold text-body small text-uppercase">{t('name')}</CFormLabel>
                                                <CFormInput
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    invalid={!!errors.name}
                                                    placeholder="ex: Électronique, Mode, Beauté..."
                                                    className="bg-body py-2 rounded-3 border-secondary-subtle font-bold"
                                                />
                                                {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                                            </div>
                                        </CCol>
                                        <CCol md={4}>
                                            <div className="mb-3">
                                                <CFormLabel className="fw-bold text-body small text-uppercase">{t('color')}</CFormLabel>
                                                <div className="d-flex gap-2 align-items-center">
                                                    <CFormInput
                                                        type="color"
                                                        value={data.color}
                                                        onChange={e => setData('color', e.target.value)}
                                                        className="p-1 rounded-3 bg-transparent border-0"
                                                        style={{ width: '45px', height: '38px', cursor: 'pointer' }}
                                                    />
                                                    <CFormInput
                                                        value={data.color}
                                                        onChange={e => setData('color', e.target.value)}
                                                        className="bg-body border-secondary-subtle small fw-bold font-monospace"
                                                        size="sm"
                                                    />
                                                </div>
                                            </div>
                                        </CCol>
                                    </CRow>

                                    <div className="mb-4">
                                        <CFormLabel className="fw-bold text-body small text-uppercase">{t('description')}</CFormLabel>
                                        <CFormTextarea
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            rows={4}
                                            placeholder="Informations supplémentaires..."
                                            className="bg-body rounded-3 border-secondary-subtle"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <CFormSwitch
                                            label={t('active')}
                                            id="categoryActive"
                                            checked={data.active}
                                            onChange={e => setData('active', e.target.checked)}
                                        />
                                    </div>

                                    <div className="pt-4 border-top d-flex gap-2">
                                        <CButton 
                                            type="submit" 
                                            color="primary" 
                                            disabled={processing}
                                            className="d-flex align-items-center gap-2 shadow-sm px-4"
                                        >
                                            <Save size={18} /> {t('save_changes')}
                                        </CButton>
                                        <Link href="/categories">
                                            <CButton color="secondary" variant="ghost">
                                                {t('reset')}
                                            </CButton>
                                        </Link>
                                    </div>
                                </CForm>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    
                    <CCol lg={4}>
                        <CCard className="border-0 shadow-sm bg-body-tertiary">
                            <CCardBody className="p-4">
                                <h6 className="fw-bold text-body small text-uppercase mb-4">{t('preview_title')}</h6>
                                <div className="text-center p-4 bg-body rounded-4 border dashed border-primary bg-opacity-10">
                                    <div 
                                        className="mx-auto mb-3 p-4 rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                        style={{ backgroundColor: data.color, color: 'white', width: '80px', height: '80px' }}
                                    >
                                        <Tag size={40} />
                                    </div>
                                    <h4 className="fw-bold mb-1" style={{ color: data.color }}>{data.name || t('new_category')}</h4>
                                    <p className="text-secondary small mb-0">{data.description || t('no_description_preview')}</p>
                                </div>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </AppLayout>
    );
}
