import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CCard, CCardBody, CContainer, CRow, CCol, CButton, CForm, CFormInput, CFormLabel, CFormSwitch, CFormSelect, CFormCheck } from '@coreui/react-pro';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, User, Mail, Info, Settings, Building, Users, ShoppingBasket } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CustomerEdit({ shop, customer, groups, wallet_budget }: { shop: any, customer: any, groups: any[], wallet_budget?: any }) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('shops'), href: '/shops' },
        { title: shop.name, href: `/shops/${shop.id}` },
        { title: t('customers'), href: `/shops/${shop.id}/customers` },
        { title: `${t('edit')} #${customer.id}`, href: `/shops/${shop.id}/customers/${customer.id}/edit` },
    ];

    // Extract current group IDs
    const initGroups = () => {
        const groupsAssoc = customer.associations?.groups?.group;
        if (!groupsAssoc) return ['3'];
        const groupsArray = Array.isArray(groupsAssoc) ? groupsAssoc : [groupsAssoc];
        return groupsArray.map((g: any) => (g.id || g).toString());
    };

    const { data, setData, put, processing, errors } = useForm({
        firstname: customer.firstname || '',
        lastname: customer.lastname || '',
        email: customer.email || '',
        company: customer.company || '',
        active: customer.active == '1',
        id_gender: customer.id_gender || '1',
        birthday: customer.birthday && customer.birthday !== '0000-00-00' ? customer.birthday : '',
        newsletter: customer.newsletter == '1',
        id_default_group: customer.id_default_group || '3',
        groups: initGroups(),
        standard_budget: wallet_budget?.standard_budget || 0,
        special_budget: wallet_budget?.special_budget || 0,
    });

    // Handle Flash messages
    const { flash } = usePage().props as any;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/shops/${shop.id}/customers/${customer.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('edit')} ${customer.firstname} ${customer.lastname} - ${shop.name}`} />

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
                    <Link href={`/shops/${shop.id}/customers/${customer.id}`} className="text-decoration-none d-flex align-items-center gap-1 text-muted mb-3 transition-all hover-translate-x">
                        <ArrowLeft size={16} /> {t('details')}
                    </Link>
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-success text-white p-3 rounded-3 shadow-sm">
                            <User size={32} />
                        </div>
                        <div>
                            <h2 className="fw-bold mb-0">{t('edit')} {t('user')}</h2>
                            <p className="text-muted mb-0 opacity-75">{t('customer_details_profiles')} PrestaShop</p>
                        </div>
                    </div>
                </div>

                <CRow className="animate__animated animate__fadeInUp">
                    <CCol lg={8}>
                        <CForm onSubmit={handleSubmit}>
                            <CCard className="border-0 shadow-lg mb-4 premium-glass">
                                <CCardBody className="p-4">
                                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-primary">
                                        <Info size={18} /> {t('general_info')}
                                    </h5>

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
                                        <CFormLabel htmlFor="company">{t('company')}</CFormLabel>
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

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="email">{t('email')} <span className="text-danger">*</span></CFormLabel>
                                        <div className="input-group">
                                            <span className="input-group-text bg-body-secondary border-0"><Mail size={16} /></span>
                                            <CFormInput
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                invalid={!!errors.email}
                                                className="bg-body-secondary border-0 py-2"
                                            />
                                        </div>
                                    </div>

                                    <CRow className="g-3">
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel htmlFor="id_gender">{t('id_gender')}</CFormLabel>
                                                <CFormSelect
                                                    id="id_gender"
                                                    value={data.id_gender}
                                                    onChange={(e) => setData('id_gender', e.target.value)}
                                                    className="bg-body-secondary border-0 py-2"
                                                >
                                                    <option value="0">{t('not_available')}</option>
                                                    <option value="1">M.</option>
                                                    <option value="2">Mme</option>
                                                </CFormSelect>
                                            </div>
                                        </CCol>
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel htmlFor="birthday">{t('birthday')}</CFormLabel>
                                                <CFormInput
                                                    id="birthday"
                                                    type="date"
                                                    value={data.birthday}
                                                    onChange={(e) => setData('birthday', e.target.value)}
                                                    className="bg-body-secondary border-0 py-2"
                                                />
                                            </div>
                                        </CCol>
                                    </CRow>

                                    <h5 className="fw-bold mb-3 mt-4 text-primary d-flex align-items-center gap-2">
                                        <Settings size={18} /> {t('status')} & {t('settings')}
                                    </h5>

                                    <div className="p-3 bg-body-secondary rounded-3 mb-4">
                                        <div className="mb-3">
                                            <CFormSwitch
                                                label={t('active')}
                                                id="active"
                                                checked={data.active}
                                                onChange={(e) => setData('active', e.target.checked)}
                                            />
                                        </div>
                                        <div className="mb-0">
                                            <CFormSwitch
                                                label={t('newsletter')}
                                                id="newsletter"
                                                checked={data.newsletter}
                                                onChange={(e) => setData('newsletter', e.target.checked)}
                                            />
                                        </div>
                                    </div>

                                    <h5 className="fw-bold mb-3 mt-4 text-success d-flex align-items-center gap-2">
                                        <ShoppingBasket size={18} /> Portefeuille (Wallet)
                                    </h5>

                                    <div className="p-4 bg-success bg-opacity-10 border border-success border-opacity-10 rounded-3 mb-4">
                                        <CRow className="g-3">
                                            <CCol md={6}>
                                                <CFormLabel htmlFor="standard_budget">Budget Standard (€)</CFormLabel>
                                                <CFormInput
                                                    id="standard_budget"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.standard_budget}
                                                    onChange={(e) => setData('standard_budget', e.target.value)}
                                                    className="bg-body border-0 py-2 shadow-sm"
                                                />
                                            </CCol>
                                            <CCol md={6}>
                                                <CFormLabel htmlFor="special_budget">Budget Spécial (€)</CFormLabel>
                                                <CFormInput
                                                    id="special_budget"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.special_budget}
                                                    onChange={(e) => setData('special_budget', e.target.value)}
                                                    className="bg-body border-0 py-2 shadow-sm"
                                                />
                                            </CCol>
                                        </CRow>
                                    </div>

                                    <h5 className="fw-bold mb-4 mt-5 d-flex align-items-center gap-2 text-primary">
                                        <Users size={18} /> {t('groups')}
                                    </h5>

                                    <div className="mb-4">
                                        <CFormLabel>{t('id_default_group')}</CFormLabel>
                                        <CFormSelect
                                            value={data.id_default_group}
                                            onChange={(e) => setData('id_default_group', e.target.value)}
                                            className="mb-4 bg-body-secondary border-0 py-2"
                                        >
                                            {groups.map((group: any) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name}
                                                </option>
                                            ))}
                                        </CFormSelect>

                                        <CFormLabel className="mb-3">{t('groups')}</CFormLabel>
                                        <div className="p-3 border-0 rounded-3 bg-body-secondary" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {groups.map((group: any) => (
                                                <div key={group.id} className="mb-2">
                                                    <CFormCheck
                                                        id={`group-${group.id}`}
                                                        label={group.name}
                                                        checked={data.groups.includes(group.id.toString())}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            const groupId = group.id.toString();
                                                            if (checked) {
                                                                setData('groups', [...data.groups, groupId]);
                                                            } else {
                                                                setData('groups', data.groups.filter((id: string) => id !== groupId));
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-end gap-2 mt-5 pt-3 border-top border-secondary border-opacity-10">
                                        <Link href={`/shops/${shop.id}/customers/${customer.id}`}>
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
                                    <Settings size={18} /> {t('system', 'Système')}
                                </h5>
                                <div className="small text-muted mb-2 d-flex justify-content-between">
                                    <span>{t('customer_id')}:</span>
                                    <strong className="text-body">#{customer.id}</strong>
                                </div>
                                <div className="small text-muted mb-2 d-flex justify-content-between">
                                    <span>{t('shop_name')}:</span>
                                    <strong className="text-body">{shop.name}</strong>
                                </div>
                                <div className="small text-muted mb-4 d-flex justify-content-between">
                                    <span>{t('date_add')}:</span>
                                    <strong className="text-body">{new Date(customer.date_add).toLocaleDateString()}</strong>
                                </div>

                                <div className="alert alert-info border-0 shadow-sm small py-2 px-3 bg-opacity-10 bg-info text-info">
                                    <div className="d-flex gap-2">
                                        <Info size={16} className="mt-1" />
                                        <span>Synchronisation bidirectionnelle via PrestaShop API.</span>
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
