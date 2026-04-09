import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CCard, CCardBody, CCol, CContainer, CRow, CBadge, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton } from '@coreui/react-pro';
import { CChartPie } from '@coreui/react-chartjs';
import { Head, Link } from '@inertiajs/react';
import { Wallet, Users, ShoppingBag, ArrowRight, TrendingUp, Activity, Clock, Plus, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ShopStat {
    id: number;
    name: string;
    total_standard: number;
    total_special: number;
    total_customers: number;
}

interface ActivityLog {
    id: number;
    description: string;
    created_at: string;
    user?: { name: string };
    shop?: { name: string };
    action: string;
}

interface DashboardProps {
    shops_stats: ShopStat[];
    total_engaged: number;
    total_customers_count: number;
    recent_activities: ActivityLog[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ shops_stats = [], total_engaged = 0, total_customers_count = 0, recent_activities = [] }: DashboardProps) {
    const { t } = useTranslation();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <CContainer fluid className="py-4">
                {/* Header Welcome Card */}
                <div className="mb-5 p-4 rounded-4 bg-body-tertiary border shadow-sm position-relative overflow-hidden box-glass">
                    <div className="position-relative z-1 d-flex justify-content-between align-items-center">
                        <div>
                            <h3 className="fw-bold mb-1 text-body">{t('welcome_back', 'Ravi de vous revoir !')}</h3>
                             <p className="text-secondary mb-0 opacity-75">{t('platform_summary', 'Voici un aperçu de l\'état de vos boutiques aujourd\'hui.')}</p>
                        </div>
                        <div className="d-flex gap-2">
                           <Link href="/shops/create" className="btn btn-primary d-flex align-items-center gap-2 rounded-3 shadow-sm px-4">
                                <Plus size={18} /> {t('add_shop', 'Ajouter une boutique')}
                           </Link>
                        </div>
                    </div>
                </div>

                {/* Global Summary Stats */}
                <CRow className="g-4 mb-5">
                    <CCol lg={6}>
                        <CCard className="h-100 border-0 shadow-sm overflow-hidden bg-primary text-white position-relative box-glass card-hover">
                            <CCardBody className="p-4 z-1">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="bg-white bg-opacity-25 p-3 rounded-circle shadow-sm">
                                        <ShoppingBag size={32} />
                                    </div>
                                </div>
                                <h6 className="text-white text-opacity-75 mb-1">{t('active_shops', 'Boutiques Actives')}</h6>
                                <h2 className="fw-bold mb-0 lh-1">{shops_stats.length}</h2>
                            </CCardBody>
                            <div className="position-absolute end-0 bottom-0 opacity-10 p-3">
                                <ShoppingBag size={100} style={{ marginBottom: '-20px', marginRight: '-20px' }} />
                            </div>
                        </CCard>
                    </CCol>

                    <CCol lg={6}>
                        <CCard className="h-100 border-0 shadow-sm overflow-hidden bg-info text-white position-relative box-glass card-hover">
                            <CCardBody className="p-4 z-1">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="bg-white bg-opacity-25 p-3 rounded-circle shadow-sm">
                                        <Activity size={32} />
                                    </div>
                                </div>
                                <h6 className="text-white text-opacity-75 mb-1">{t('total_activities', 'Activités Enregistrées')}</h6>
                                <h2 className="fw-bold mb-0 lh-1">{recent_activities.length}</h2>
                            </CCardBody>
                            <div className="position-absolute end-0 bottom-0 opacity-10 p-3">
                                <Activity size={100} style={{ marginBottom: '-20px', marginRight: '-20px' }} />
                            </div>
                        </CCard>
                    </CCol>
                </CRow>

                <CRow className="g-4 mb-5">
                    {/* Recent Activities */}
                    <CCol lg={12}>
                        <CCard className="h-100 border-0 shadow-sm bg-body-tertiary box-glass">
                            <CCardBody className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold mb-0 text-body d-flex align-items-center gap-2">
                                        <Clock size={20} className="text-warning" />
                                        {t('recent_activities', 'Activités Récentes')}
                                    </h5>
                                </div>
                                
                                <div className="timeline-dashboard">
                                    {recent_activities.length > 0 ? (
                                        recent_activities.map((activity) => (
                                            <div key={activity.id} className="d-flex gap-3 mb-4 last-child-no-margin">
                                                <div className="flex-shrink-0">
                                                    <div className="p-2 bg-body-tertiary border rounded-3 shadow-sm">
                                                        <Activity size={18} className="text-primary" />
                                                    </div>
                                                </div>
                                                <div className="flex-grow-1 border-bottom pb-3">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <h6 className="fw-bold text-body mb-0">{activity.description}</h6>
                                                        <small className="text-muted">{new Date(activity.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2 small text-secondary opacity-75">
                                                        <span className="fw-medium">{activity.user?.name || t('system', 'Système')}</span>
                                                        <span className="opacity-25">•</span>
                                                        <span>{activity.shop?.name || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-5 text-secondary opacity-50">
                                            {t('no_recent_activity', 'Aucune activité récente à afficher.')}
                                        </div>
                                    )}
                                </div>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>

                {/* Individual Shop Breakdown */}
                <CCard className="border-0 shadow-sm bg-body-tertiary box-glass">
                    <CCardBody className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0 text-body d-flex align-items-center gap-2">
                                <ShoppingBag size={24} className="text-primary" />
                                {t('overview_by_shop', 'Vue des Boutiques')}
                            </h5>
                        </div>
                        
                        <div className="table-responsive">
                            <CTable align="middle" hover responsive className="mb-0">
                                <CTableHead className="text-body-secondary fw-semibold border-0">
                                    <CTableRow>
                                        <CTableHeaderCell className="bg-body-tertiary py-3 border-bottom">{t('shop', 'Boutique')}</CTableHeaderCell>
                                        <CTableHeaderCell className="bg-body-tertiary py-3 text-center border-bottom">{t('id', 'ID')}</CTableHeaderCell>
                                        <CTableHeaderCell className="bg-body-tertiary py-3 text-end border-bottom"></CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {shops_stats.map((stat) => (
                                        <CTableRow key={stat.id} className="align-middle">
                                            <CTableDataCell className="py-3 border-0">
                                                <div className="d-flex align-items-center">
                                                    <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                                                        <ShoppingBag size={20} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-body">{stat.name}</div>
                                                    </div>
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell className="py-3 border-0 text-center">
                                                <CBadge className="px-3 bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-10">
                                                    #{stat.id}
                                                </CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell className="py-3 border-0 text-end">
                                                <Link href={`/shops/${stat.id}`} className="btn btn-sm btn-ghost-primary rounded-3 px-3 border-0 d-inline-flex align-items-center gap-2">
                                                    {t('manage', 'Gérer')} <ArrowRight size={18} />
                                                </Link>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                            </CTable>
                        </div>
                    </CCardBody>
                </CCard>
            </CContainer>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .box-glass {
                    border: 1px solid rgba(var(--#{$prefix}border-color-rgb), 0.5) !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .card-hover:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
                }
                .timeline-dashboard .last-child-no-margin:last-child {
                    margin-bottom: 0 !important;
                }
                .timeline-dashboard .last-child-no-margin:last-child .flex-grow-1 {
                    border-bottom: 0 !important;
                    padding-bottom: 0 !important;
                }
                .z-1 { z-index: 1; }
            `}} />
        </AppLayout>
    );
}
