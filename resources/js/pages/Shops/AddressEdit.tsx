import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CCard, CCardBody, CContainer, CRow, CCol, CButton, CForm, CFormInput, CFormLabel, CFormSwitch, CFormSelect } from '@coreui/react-pro';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, MapPin, Info, Settings, User, Building, Phone, Map } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AddressEdit({ shop, address, countries }: { shop: any, address: any, countries: any[] }) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('shops'), href: '/shops' },
        { title: shop.name, href: `/shops/${shop.id}` },
        { title: t('customers'), href: `/shops/${shop.id}/customers` },
        { title: t('addresses'), href: `/shops/${shop.id}/customers?tab=addresses` },
        { title: `${t('edit')} #${address.id}`, href: `/shops/${shop.id}/addresses/${address.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        firstname: address.firstname || '',
        lastname: address.lastname || '',
        company: address.company || '',
        address1: address.address1 || '',
        address2: address.address2 || '',
        postcode: address.postcode || '',
        city: address.city || '',
        phone: address.phone || '',
        phone_mobile: address.phone_mobile || '',
        alias: address.alias || 'Mon adresse',
        id_country: address.id_country || '1',
        dni: address.dni || '',
        vat_number: address.vat_number || '',
    });

    // Handle Flash messages
    const { flash } = usePage().props as any;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/shops/${shop.id}/addresses/${address.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('edit_address')} #${address.id} - ${shop.name}`} />

            <CContainer fluid className="py-4">
                {flash?.success && (
                    <div className="alert alert-success border-0 shadow-sm mb-4 animate__animated animate__fadeInDown d-flex align-items-center gap-2">
                        <Save size={18} /> {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="alert alert-danger border-0 shadow-sm mb-4 animate__animated animate__fadeInDown d-flex align-items-center gap-2 text-white bg-danger">
                        <Info size={18} /> {flash.error}
                    </div>
                )}

                <div className="mb-4 animate__animated animate__fadeInLeft">
                    <Link href={`/shops/${shop.id}/customers?tab=addresses`} className="text-decoration-none d-flex align-items-center gap-1 text-muted mb-3 transition-all hover-translate-x">
                        <ArrowLeft size={16} /> {t('back_to_list')}
                    </Link>
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-warning text-white p-3 rounded-3 shadow-sm">
                            <MapPin size={32} />
                        </div>
                        <div>
                            <h2 className="fw-bold mb-0">{t('edit_address')}</h2>
                            <p className="text-muted mb-0 opacity-75">{t('address_details')} PrestaShop</p>
                        </div>
                    </div>
                </div>

                <CRow className="animate__animated animate__fadeInUp">
                    <CCol lg={8}>
                        <CForm onSubmit={handleSubmit}>
                            <CCard className="border-0 shadow-lg mb-4 premium-glass">
                                <CCardBody className="p-4">
                                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-primary">
                                        <User size={18} /> {t('recipient')}
                                    </h5>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="alias">{t('alias')} <span className="text-danger">*</span></CFormLabel>
                                        <CFormInput
                                            id="alias"
                                            value={data.alias}
                                            onChange={(e) => setData('alias', e.target.value)}
                                            placeholder="Ex: Bureau, Maison..."
                                            invalid={!!errors.alias}
                                            className="bg-body-secondary border-0 py-2"
                                        />
                                    </div>

                                    <CRow className="g-3">
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel htmlFor="firstname">{t('firstname')} <span className="text-danger">*</span></CFormLabel>
                                                <CFormInput
                                                    id="firstname"
                                                    value={data.firstname}
                                                    onChange={(e) => setData('firstname', e.target.value)}
                                                    invalid={!!errors.firstname}
                                                    className="bg-body-secondary border-0 py-2"
                                                />
                                            </div>
                                        </CCol>
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel htmlFor="lastname">{t('lastname')} <span className="text-danger">*</span></CFormLabel>
                                                <CFormInput
                                                    id="lastname"
                                                    value={data.lastname}
                                                    onChange={(e) => setData('lastname', e.target.value)}
                                                    invalid={!!errors.lastname}
                                                    className="bg-body-secondary border-0 py-2"
                                                />
                                            </div>
                                        </CCol>
                                    </CRow>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="company">{t('company')} ({t('optional', 'Optionnel')})</CFormLabel>
                                        <div className="input-group">
                                            <span className="input-group-text bg-body-secondary border-0"><Building size={16} /></span>
                                            <CFormInput
                                                id="company"
                                                value={data.company}
                                                onChange={(e) => setData('company', e.target.value)}
                                                className="bg-body-secondary border-0 py-2"
                                            />
                                        </div>
                                    </div>

                                    <h5 className="fw-bold mb-4 mt-5 d-flex align-items-center gap-2 text-primary">
                                        <Map size={18} /> {t('location')}
                                    </h5>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="address1">{t('address1')} <span className="text-danger">*</span></CFormLabel>
                                        <CFormInput
                                            id="address1"
                                            value={data.address1}
                                            onChange={(e) => setData('address1', e.target.value)}
                                            invalid={!!errors.address1}
                                            className="bg-body-secondary border-0 py-2"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="address2">{t('address2')} ({t('optional', 'Optionnel')})</CFormLabel>
                                        <CFormInput
                                            id="address2"
                                            value={data.address2}
                                            onChange={(e) => setData('address2', e.target.value)}
                                            className="bg-body-secondary border-0 py-2"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <CFormLabel htmlFor="id_country">{t('country')} <span className="text-danger">*</span></CFormLabel>
                                        <CFormSelect
                                            id="id_country"
                                            value={data.id_country}
                                            onChange={(e) => setData('id_country', e.target.value)}
                                            invalid={!!errors.id_country}
                                            className="bg-body-secondary border-0 py-2"
                                        >
                                            <option value="">{t('select_country', 'Sélectionner un pays')}</option>
                                            {countries.map((country: any) => (
                                                <option key={country.id} value={country.id}>
                                                    {typeof country.name === 'string' ? country.name : (Array.isArray(country.name) ? country.name[0]?.value : country.name?.value || country.name)}
                                                </option>
                                            ))}
                                        </CFormSelect>
                                    </div>

                                    <CRow className="g-3">
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel htmlFor="dni">{t('dni')} ({t('optional', 'Optionnel')})</CFormLabel>
                                                <CFormInput
                                                    id="dni"
                                                    value={data.dni}
                                                    onChange={(e) => setData('dni', e.target.value)}
                                                    className="bg-body-secondary border-0 py-2"
                                                />
                                            </div>
                                        </CCol>
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel htmlFor="vat_number">{t('vat_number')} ({t('optional', 'Optionnel')})</CFormLabel>
                                                <CFormInput
                                                    id="vat_number"
                                                    value={data.vat_number}
                                                    onChange={(e) => setData('vat_number', e.target.value)}
                                                    className="bg-body-secondary border-0 py-2"
                                                />
                                            </div>
                                        </CCol>
                                    </CRow>

                                    <CRow className="g-3">
                                        <CCol md={4}>
                                            <div className="mb-3">
                                                <CFormLabel htmlFor="postcode">{t('postcode')} <span className="text-danger">*</span></CFormLabel>
                                                <CFormInput
                                                    id="postcode"
                                                    value={data.postcode}
                                                    onChange={(e) => setData('postcode', e.target.value)}
                                                    invalid={!!errors.postcode}
                                                    className="bg-body-secondary border-0 py-2"
                                                />
                                            </div>
                                        </CCol>
                                        <CCol md={8}>
                                            <div className="mb-3">
                                                <CFormLabel htmlFor="city">{t('city')} <span className="text-danger">*</span></CFormLabel>
                                                <CFormInput
                                                    id="city"
                                                    value={data.city}
                                                    onChange={(e) => setData('city', e.target.value)}
                                                    invalid={!!errors.city}
                                                    className="bg-body-secondary border-0 py-2"
                                                />
                                            </div>
                                        </CCol>
                                    </CRow>

                                    <h5 className="fw-bold mb-4 mt-5 d-flex align-items-center gap-2 text-primary">
                                        <Phone size={18} /> Contact
                                    </h5>

                                    <CRow className="g-3">
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel htmlFor="phone">{t('phone')}</CFormLabel>
                                                <CFormInput
                                                    id="phone"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    className="bg-body-secondary border-0 py-2"
                                                />
                                            </div>
                                        </CCol>
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel htmlFor="phone_mobile">{t('phone_mobile')}</CFormLabel>
                                                <CFormInput
                                                    id="phone_mobile"
                                                    value={data.phone_mobile}
                                                    onChange={(e) => setData('phone_mobile', e.target.value)}
                                                    className="bg-body-secondary border-0 py-2"
                                                />
                                            </div>
                                        </CCol>
                                    </CRow>

                                    <div className="d-flex justify-content-end gap-2 mt-5 pt-3 border-top border-secondary border-opacity-10">
                                        <Link href={`/shops/${shop.id}/customers?tab=addresses`}>
                                            <CButton color="secondary" variant="ghost" className="transition-all hover-bg-secondary-soft">{t('cancel', 'Annuler')}</CButton>
                                        </Link>
                                        <CButton color="primary" type="submit" disabled={processing} className="px-4 d-flex align-items-center gap-2 shadow-sm transition-all hover-lift">
                                            <Save size={18} /> {processing ? t('saving', 'Enregistrement...') : t('save_changes')}
                                        </CButton>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CForm>
                    </CCol>

                    <CCol lg={4}>
                        <CCard className="border-0 shadow-lg mb-4 premium-glass">
                            <CCardBody className="p-4">
                                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <Settings size={18} /> {t('system_info')}
                                </h5>
                                <div className="small text-muted mb-2 d-flex justify-content-between">
                                    <span>{t('address_id')}:</span>
                                    <strong className="text-body">#{address.id}</strong>
                                </div>
                                <div className="small text-muted mb-2 d-flex justify-content-between">
                                    <span>{t('customer_id')}:</span>
                                    <strong className="text-body">#{address.id_customer}</strong>
                                </div>
                                <div className="small text-muted mb-2 d-flex justify-content-between">
                                    <span>{t('shop_name', 'Boutique')}:</span>
                                    <strong className="text-body">{shop.name}</strong>
                                </div>
                                <div className="small text-muted mb-4 d-flex justify-content-between">
                                    <span>{t('last_sync')}:</span>
                                    <strong className="text-body">{new Date(address.date_upd).toLocaleString()}</strong>
                                </div>

                                <div className="alert alert-info border-0 shadow-sm small py-2 px-3 bg-opacity-10 bg-info text-info">
                                    <div className="d-flex gap-2">
                                        <Info size={16} className="mt-1" />
                                        <span>{t('sync_ps_info')}</span>
                                    </div>
                                </div>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </AppLayout>
    );
}
