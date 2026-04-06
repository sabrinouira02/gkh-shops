import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CCard, CCardBody, CContainer, CRow, CCol, CButton, CForm, CFormInput, CFormLabel, CFormTextarea, CFormSwitch, CFormCheck } from '@coreui/react-pro';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Folder, Info, Search, Layers } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function CategoryEdit({ shop, category, categories = [] }: { shop: any, category: any, categories?: any[] }) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('shops'), href: '/shops' },
        { title: shop.name, href: `/shops/${shop.id}` },
        { title: t('categories'), href: `/shops/${shop.id}/products?tab=categories` },
        { title: `${t('edit')} #${category.id}`, href: `/shops/${shop.id}/categories/${category.id}/edit` },
    ];

    const getName = (name: any): string => {
        if (!name) return '';
        if (typeof name === 'string') return name.trim();
        if (Array.isArray(name) && name.length > 0) return (typeof name[0] === 'object' ? name[0].value : name[0]) || '';
        if (typeof name === 'object' && name !== null) {
            if (name.language) {
               const langs = Array.isArray(name.language) ? name.language : [name.language];
               return langs[0]?.value || '';
            }
            return name.value || name[0]?.value || '';
        }
        return '';
    };

    const { data, setData, put, processing, errors } = useForm({
        name: getName(category.name),
        description: getName(category.description),
        active: category.active === '1',
        id_parent: category.id_parent || '2',
    });

    const filteredCategories = useMemo(() => {
        return categories
            .filter(c => c.id !== category.id)
            .filter(c => {
                const name = getName(c.name).toLowerCase();
                return name.includes(searchTerm.toLowerCase()) || c.id.toString().includes(searchTerm);
            });
    }, [categories, category.id, searchTerm]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/shops/${shop.id}/categories/${category.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('edit')} ${t('category')} #${category.id} - ${shop.name}`} />

            <CContainer fluid className="py-4">
                <div className="mb-4">
                    <Link href={`/shops/${shop.id}/products?tab=categories`} className="text-decoration-none d-flex align-items-center gap-1 text-muted mb-3 transition-all hover-translate-x">
                        <ArrowLeft size={16} /> {t('back_to_list', 'Retour à la liste')}
                    </Link>
                    <div className="d-flex align-items-center gap-3 animate__animated animate__fadeInDown">
                        <div className="bg-warning text-white p-3 rounded-3 shadow-sm">
                            <Folder size={32} />
                        </div>
                        <div>
                            <h2 className="fw-bold mb-0 text-body">{t('edit_category', 'Modifier la catégorie')}</h2>
                            <p className="text-secondary mb-0 opacity-75">{t('sync_ps_info')}</p>
                        </div>
                    </div>
                </div>

                <CRow>
                    <CCol lg={8} className="animate__animated animate__fadeInLeft">
                        <CForm onSubmit={handleSubmit}>
                            <CCard className="border-0 shadow-lg mb-4 premium-glass">
                                <CCardBody className="p-4">
                                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-primary">
                                        <Info size={18} /> {t('general_info', 'Informations Générales')}
                                    </h5>

                                    <div className="mb-4">
                                        <CFormLabel htmlFor="name" className="fw-semibold small text-secondary">{t('name')} <span className="text-danger">*</span></CFormLabel>
                                        <CFormInput
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            invalid={!!errors.name}
                                            className="bg-body-secondary border-0 py-2 shadow-sm focus-ring"
                                        />
                                        {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <CFormLabel className="fw-semibold small text-secondary d-flex justify-content-between align-items-center">
                                            <span>{t('parent_category', 'Catégorie Parente')}</span>
                                            <div className="position-relative w-50">
                                                <Search size={14} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-secondary opacity-50" />
                                                <CFormInput
                                                    size="sm"
                                                    placeholder={t('search_category', 'Rechercher...')}
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="ps-4 border-0 bg-dark bg-opacity-10"
                                                />
                                            </div>
                                        </CFormLabel>

                                        <div className="category-radio-list p-3 bg-body-secondary bg-opacity-50 rounded-3 border border-secondary border-opacity-10 shadow-inner mt-2 overflow-auto" style={{ maxHeight: '250px' }}>
                                            {filteredCategories.length > 0 ? (
                                                filteredCategories.map((cat) => (
                                                    <div key={cat.id} className={`p-2 rounded-2 mb-1 transition-all hover-bg-primary-soft cursor-pointer d-flex align-items-center ${data.id_parent == cat.id ? 'bg-primary bg-opacity-10 border border-primary border-opacity-25' : ''}`}
                                                         onClick={() => setData('id_parent', cat.id)}>
                                                        <CFormCheck
                                                            type="radio"
                                                            name="id_parent"
                                                            id={`cat-${cat.id}`}
                                                            checked={data.id_parent == cat.id}
                                                            onChange={() => setData('id_parent', cat.id)}
                                                            className="me-3"
                                                        />
                                                        <label htmlFor={`cat-${cat.id}`} className="mb-0 flex-grow-1 cursor-pointer fw-medium">
                                                            {getName(cat.name)} <span className="text-secondary small opacity-50 ms-2">#{cat.id}</span>
                                                        </label>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 text-secondary italic opacity-50">
                                                    {searchTerm ? t('no_results_found', 'Aucun résultat') : t('loading_categories', 'Chargement des catégories...')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-4 mt-2">
                                        <CFormSwitch
                                            label={t('active_status', 'Catégorie active')}
                                            id="active"
                                            checked={data.active}
                                            onChange={(e) => setData('active', e.target.checked)}
                                            className="cursor-pointer"
                                        />
                                    </div>

                                    <hr className="my-4 opacity-10" />

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="description" className="fw-semibold small text-secondary">{t('description')} (HTML)</CFormLabel>
                                        <CFormTextarea
                                            id="description"
                                            rows={5}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="bg-body-secondary border-0 py-2 shadow-sm"
                                        />
                                    </div>

                                    <div className="d-flex justify-content-end gap-2 mt-5 pt-3 border-top border-secondary border-opacity-10">
                                        <Link href={`/shops/${shop.id}/products?tab=categories`}>
                                            <CButton color="secondary" variant="ghost" className="transition-all hover-bg-secondary-soft">{t('cancel', 'Annuler')}</CButton>
                                        </Link>
                                        <CButton color="primary" type="submit" disabled={processing} className="px-4 d-flex align-items-center gap-2 shadow-sm transition-all hover-lift">
                                            <Save size={18} /> {processing ? t('saving', 'Enregistrement...') : t('save_changes', 'Enregistrer')}
                                        </CButton>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CForm>
                    </CCol>

                    <CCol lg={4} className="animate__animated animate__fadeInRight">
                        <CCard className="border-0 shadow-lg mb-4 premium-glass">
                            <CCardBody className="p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-primary">
                                    <Layers size={18} /> {t('system_info', 'Système')}
                                </h5>

                                {category.image_url && (
                                    <div className="text-center mb-4 bg-body-tertiary rounded-3 p-3 shadow-inner">
                                        <img src={category.image_url} alt={data.name} style={{ maxHeight: '150px', objectFit: 'contain' }} className="mw-100 rounded shadow-sm transition-all hover-scale" />
                                    </div>
                                )}

                                <div className="small text-muted mb-3 d-flex justify-content-between">
                                    <span>{t('category_id', 'ID Catégorie')}:</span>
                                    <strong className="text-body">#{category.id}</strong>
                                </div>
                                <div className="small text-muted mb-3 d-flex justify-content-between">
                                    <span>{t('shop', 'Boutique')}:</span>
                                    <strong className="text-body">{shop.name}</strong>
                                </div>

                                <div className="alert alert-info border-0 shadow-sm small py-3 mt-4">
                                    <Info size={16} className="me-2 text-info float-start mt-1" />
                                    <div>{t('sync_ps_info')}</div>
                                </div>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>

            <style>{`
                .premium-glass {
                    background: rgba(var(--cui-body-bg-rgb), 0.7) !important;
                    backdrop-filter: blur(10px) !important;
                    border: 1px solid rgba(var(--cui-body-color-rgb), 0.1) !important;
                }
                .category-radio-list::-webkit-scrollbar,
                .overflow-auto::-webkit-scrollbar {
                    width: 6px;
                }
                .category-radio-list::-webkit-scrollbar-thumb,
                .overflow-auto::-webkit-scrollbar-thumb {
                    background: rgba(var(--cui-primary-rgb), 0.2);
                    border-radius: 10px;
                }
                .hover-bg-primary-soft:hover {
                    background: rgba(var(--cui-primary-rgb), 0.05);
                }
                .shadow-inner {
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
                }
                .hover-translate-x:hover {
                    transform: translateX(-4px);
                }
                .hover-lift:hover {
                    transform: translateY(-2px);
                }
                .hover-scale:hover {
                    transform: scale(1.05);
                }
                .transition-all {
                    transition: all 0.2s ease-in-out;
                }
            `}</style>
        </AppLayout>
    );
}
