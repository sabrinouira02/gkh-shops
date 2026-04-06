import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Shop } from '@/types';
import { CCard, CCardBody, CCol, CContainer, CRow, CButton, CBadge, CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormLabel, CFormInput, CFormSwitch, CFormSelect } from '@coreui/react-pro';
import { CChartLine } from '@coreui/react-chartjs';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, ShoppingCart, Users, TrendingUp, Calendar, RefreshCw, Globe, Key, ShieldCheck, ExternalLink, Settings, ChevronDown, Folder, Truck, CreditCard, Trash2, Info, Lock, Mail, Plus, Search, Layers } from 'lucide-react';
import { useState } from 'react';

interface Stats {
    products_count: number | string;
    orders_count: number | string;
    customers_count: number | string;
}

import { useTranslation } from 'react-i18next';

export default function Show({ shop, stats, chart_data, current_days, carriers = [], customer_groups = [], employees = [], modules = [] }: {
    shop: Shop,
    stats: Stats,
    chart_data: any,
    current_days: number,
    carriers?: any[],
    customer_groups?: any[],
    employees?: any[],
    modules?: any[]
}) {


    const { t } = useTranslation();

    const getName = (name: any): string => {
        if (!name) return '';
        if (typeof name === 'string') return name.trim();
        if (Array.isArray(name) && name.length > 0) {
            return (typeof name[0] === 'object' ? (name[0].value || name[0].name || '') : name[0]) || '';
        }
        if (typeof name === 'object' && name !== null && name.language) {
            const langs = Array.isArray(name.language) ? name.language : [name.language];
            return (langs[0]?.value || langs[0]?.name || '') || '';
        }
        if (typeof name === 'object' && name !== null && name.value) {
            return typeof name.value === 'string' ? name.value : '';
        }
        return JSON.stringify(name); // Last resort for debugging if it's still an object
    };
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showDeleteEmployeeModal, setShowDeleteEmployeeModal] = useState(false);
    const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [moduleSearch, setModuleSearch] = useState('');

    const filteredModules = modules.filter(mod => {
        const name = getName(mod.name).toLowerCase();
        const techName = (mod.name || '').toString().toLowerCase();
        const s = moduleSearch.toLowerCase();
        return name.includes(s) || techName.includes(s);
    });

    const { data: editData, setData: setEditData, put: updateEmployee, processing: updating, reset: resetEditForm } = useForm({
        firstname: '',
        lastname: '',
        email: '',
        active: true as boolean,
        passwd: '',
        id_profile: 1
    });

    const { data: addData, setData: setAddData, post: postEmployee, processing: adding, reset: resetAddForm } = useForm({
        firstname: '',
        lastname: '',
        email: '',
        active: true as boolean,
        passwd: '',
        id_profile: 1
    });

    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [showEditGroupModal, setShowEditGroupModal] = useState(false);
    const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);

    const { data: groupData, setData: setGroupData, put: updateGroupAction, processing: groupUpdating, reset: resetGroupForm } = useForm({
        name: '',
        reduction: 0,
        price_display_method: 0,
        show_prices: 1
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('shops'), href: '/shops' },
        { title: shop.name, href: `/shops/${shop.id}` },
    ];

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            onFinish: () => setIsRefreshing(false)
        });
    };

    const handleRangeChange = (days: number) => {
        setIsRefreshing(true);
        router.get(window.location.pathname, { days }, {
            preserveScroll: true,
            onFinish: () => setIsRefreshing(false)
        });
    };

    const rangeLabels: Record<number, string> = {
        7: t('last_7_days'),
        30: t('last_30_days'),
        90: t('last_90_days'),
        365: t('last_year')
    };

    const handleDeleteEmployee = () => {
        if (!selectedEmployee) return;
        router.delete(`/shops/${shop.id}/employees/${selectedEmployee.id}`, {
            onSuccess: () => setShowDeleteEmployeeModal(false),
            onFinish: () => setSelectedEmployee(null)
        });
    };

    const handleAddEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        postEmployee(`/shops/${shop.id}/employees`, {
            onSuccess: () => {
                setShowAddEmployeeModal(false);
                resetAddForm();
            }
        });
    };

    const handleEditClick = (emp: any) => {
        setSelectedEmployee(emp);
        setEditData({
            firstname: emp.firstname,
            lastname: emp.lastname,
            email: emp.email,
            active: emp.active == '1',
            passwd: '',
            id_profile: emp.id_profile
        });
        setShowEditEmployeeModal(true);
    };

    const handleUpdateEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        updateEmployee(`/shops/${shop.id}/employees/${selectedEmployee.id}`, {
            onSuccess: () => {
                setShowEditEmployeeModal(false);
                resetEditForm();
            }
        });
    };

    const handleEditGroupClick = (group: any) => {
        setSelectedGroup(group);
        setGroupData({
            name: getName(group.name),
            reduction: parseFloat(group.reduction),
            price_display_method: parseInt(group.price_display_method),
            show_prices: parseInt(group.show_prices)
        });
        setShowEditGroupModal(true);
    };

    const handleUpdateGroup = (e: React.FormEvent) => {
        e.preventDefault();
        updateGroupAction(`/shops/${shop.id}/groups/${selectedGroup.id}`, {
            onSuccess: () => {
                setShowEditGroupModal(false);
                resetGroupForm();
            }
        });
    };

    const handleDeleteGroup = () => {
        if (!selectedGroup) return;
        router.delete(`/shops/${shop.id}/groups/${selectedGroup.id}`, {
            onSuccess: () => setShowDeleteGroupModal(false),
            onFinish: () => setSelectedGroup(null)
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${shop.name} - Dashboard`} />

            <CContainer fluid className="py-4 glass-shell animate-fade-in">
                {/* Premium Header Section */}
                <div className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 sub-header-container p-4 rounded-4 shadow-sm border border-white bg-body-emphasis border-opacity-10 backdrop-blur">
                    <div className="d-flex align-items-center gap-4 w-100">
                        <div className="shop-logo-wrapper position-relative">
                            <div className="logo-glow position-absolute top-50 start-50 translate-middle rounded-circle"></div>
                            <div className="bg-body-tertiary p-2 rounded-4 shadow border d-flex align-items-center justify-content-center position-relative" style={{ width: '80px', height: '80px', zIndex: 1 }}>
                                {shop.logo ? (
                                    <img src={shop.logo} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <Globe size={40} className="text-primary opacity-75" />
                                )}
                            </div>
                        </div>
                        <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-3 mb-1">
                                <h1 className="fw-black mb-0 text-body tracking-tight display-6">{shop.name}</h1>
                                <div className="status-indicator-wrapper d-flex align-items-center gap-2 px-3 py-1 bg-success bg-opacity-10 rounded-pill border border-success border-opacity-25 shadow-sm">
                                    <span className="status-pulse"></span>
                                    <span className="extra-small fw-bold text-success text-uppercase tracking-wider">{t('connected')}</span>
                                </div>
                            </div>
                            <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small">
                                <a href={shop.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none d-flex align-items-center gap-1 hover-primary link-transition fw-medium">
                                    {shop.url} <ExternalLink size={14} />
                                </a>
                                <span className="opacity-25">|</span>
                                <span className="d-flex align-items-center gap-1">
                                    <Calendar size={14} /> {t('last_sync', { date: new Date().toLocaleDateString() })}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex gap-3 w-md-auto w-100 justify-content-center">
                        <Link href={`/shops/${shop.id}/edit`} className="text-decoration-none">
                            <CButton color="secondary" variant="ghost" className="d-flex align-items-center gap-2 px-4 py-2 border rounded-pill bg-body-emphasis border-opacity-25 shadow-sm hover-secondary text-body fw-bold">
                                <Settings size={18} /> {t('configure')}
                            </CButton>
                        </Link>
                        <CButton
                            color="primary"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow border-0 gradient-primary-animation fw-bold"
                        >
                            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                            <span>{t('update')}</span>
                        </CButton>
                    </div>
                </div>

                {/* High-Impact Statistics Cluster */}
                <CRow className="g-4 mb-5">
                    {[
                        { title: t('total_products'), val: stats.products_count, icon: Package, color1: '#8B5CF6', color2: '#6D28D9', key: 'prod' },
                        { title: t('total_orders'), val: stats.orders_count, icon: ShoppingCart, color1: '#10B981', color2: '#059669', key: 'ord' },
                        { title: t('total_customers'), val: stats.customers_count, icon: Users, color1: '#3B82F6', color2: '#2563EB', key: 'cust' }
                    ].map(({ icon: Icon, ...stat }) => (
                        <CCol sm={6} lg={4} key={stat.key}>
                            <CCard className="premium-stat-card border-0 shadow-sm overflow-hidden h-100 rounded-4" style={{ background: `linear-gradient(225deg, ${stat.color1} 0%, ${stat.color2} 100%)` }}>
                                <CCardBody className="p-4 d-flex flex-column justify-content-between h-100 position-relative text-white">
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div className="stat-icon-blob p-3 rounded-4 bg-white bg-opacity-20 backdrop-blur-sm shadow-inner">
                                            <Icon size={28} color="black" />
                                        </div>
                                        <div className="badge rounded-pill bg-white bg-opacity-10 py-1 px-2 text-white extra-small fw-bold">
                                            <TrendingUp size={10} className="me-1" /> +2.4%
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="mb-1 opacity-70 fw-bold text-uppercase tracking-wider extra-small">{stat.title}</h6>
                                        <h1 className="fw-black mb-0 display-5 tracking-tight">{stat.val}</h1>
                                    </div>
                                    <div className="stat-card-decoration position-absolute">
                                        <Icon size={120} />
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    ))}
                </CRow>

                <CRow className="g-4">
                    {/* Main Content Area */}
                    <CCol lg={8}>
                        <CCard className="border-0 shadow-sm mb-4 bg-body-tertiary">
                            <CCardBody className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-body">
                                        <TrendingUp size={20} className="text-primary" /> {t('performance_shop')}
                                    </h5>

                                    <CDropdown className="d-inline-flex">
                                        <CDropdownToggle
                                            caret={false}
                                            className="d-flex align-items-center gap-2 px-3 py-1 border rounded-3 text-secondary bg-body hover-primary transition-all small fw-medium shadow-sm"
                                        >
                                            <Calendar size={14} /> {rangeLabels[current_days] || t('custom_range')}
                                            <ChevronDown size={14} className="ms-1 opacity-50" />
                                        </CDropdownToggle>

                                        <CDropdownMenu>
                                            <CDropdownItem onClick={() => handleRangeChange(7)} active={current_days === 7}>{t('last_7_days')}</CDropdownItem>
                                            <CDropdownItem onClick={() => handleRangeChange(30)} active={current_days === 30}>{t('last_30_days')}</CDropdownItem>
                                            <CDropdownItem onClick={() => handleRangeChange(90)} active={current_days === 90}>{t('last_90_days')}</CDropdownItem>
                                            <CDropdownItem onClick={() => handleRangeChange(365)} active={current_days === 365}>{t('last_year')}</CDropdownItem>
                                        </CDropdownMenu>
                                    </CDropdown>
                                </div>


                                <div style={{ height: '320px' }} className="mt-2">
                                    {chart_data && chart_data.labels && chart_data.labels.length > 0 ? (
                                        <CChartLine
                                            data={chart_data}
                                            options={{
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { display: false },
                                                },
                                                scales: {
                                                    x: {
                                                        grid: { display: false },
                                                        ticks: {
                                                            maxTicksLimit: 7,
                                                            color: 'var(--cui-secondary-color)',
                                                        },
                                                    },
                                                    y: {
                                                        beginAtZero: true,
                                                        border: { dash: [5, 5] },
                                                        grid: { color: 'var(--cui-border-color-translucent)' },
                                                        ticks: {
                                                            color: 'var(--cui-secondary-color)',
                                                            callback: (value: any) => `${value} €`,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    ) : (
                                        <div className="h-100 bg-body rounded-4 d-flex align-items-center justify-content-center border border-dashed text-center p-4">
                                            <div>
                                                <div className="bg-body-emphasis p-3 rounded-circle shadow-sm d-inline-block mb-3">
                                                    <TrendingUp size={32} className="text-secondary opacity-50" />
                                                </div>
                                                <p className="fw-bold text-body mb-1">{t('no_performance_data')}</p>
                                                <p className="text-secondary small">{t('try_refreshing')}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </CCardBody>
                        </CCard>

                        <CRow className="g-4 mb-4">
                            {/* Carriers Panel */}
                            <CCol md={6}>
                                <CCard className="border-0 shadow-sm h-100 bg-body-tertiary rounded-4 overflow-hidden">
                                    <CCardBody className="p-0">
                                        <div className="p-4 border-bottom border-white border-opacity-10 bg-body-emphasis bg-opacity-50 backdrop-blur d-flex align-items-center gap-2">
                                            <div className="p-2 bg-primary bg-opacity-10 rounded-3">
                                                <Truck size={20} className="text-primary" />
                                            </div>
                                            <h6 className="fw-black mb-0 text-body text-uppercase tracking-wider small">{t('active_carriers')}</h6>
                                        </div>
                                        <div className="p-3">
                                            <div className="d-flex flex-column gap-2">
                                                {carriers.length > 0 ? carriers.map((c: any) => (
                                                    <div key={c.id} className="carrier-row p-3 rounded-4 bg-body border border-transparent shadow-sm-hover transition-all d-flex justify-content-between align-items-center">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="p-2 bg-light rounded-3 text-secondary">
                                                                <Globe size={16} />
                                                            </div>
                                                            <span className="fw-bold text-body small">{getName(c.name)}</span>
                                                        </div>
                                                        <CBadge color="info" shape="rounded-pill" className="px-3 py-2 extra-small fw-semibold bg-info bg-opacity-10 text-info border border-info border-opacity-25">
                                                            {getName(c.delay)}
                                                        </CBadge>
                                                    </div>
                                                )) : (
                                                    <div className="text-center py-4 text-secondary italic small opacity-50">{t('no_items')}</div>
                                                )}
                                            </div>
                                        </div>
                                    </CCardBody>
                                </CCard>
                            </CCol>

                            {/* Groups Panel */}
                            <CCol md={6}>
                                <CCard className="border-0 shadow-sm h-100 bg-body-tertiary rounded-4 overflow-hidden">
                                    <CCardBody className="p-0">
                                        <div className="p-4 border-bottom border-white border-opacity-10 bg-body-emphasis bg-opacity-50 backdrop-blur d-flex align-items-center gap-2">
                                            <div className="p-2 bg-info bg-opacity-10 rounded-3">
                                                <Users size={20} className="text-info" />
                                            </div>
                                            <h6 className="fw-black mb-0 text-body text-uppercase tracking-wider small">{t('customer_groups')}</h6>
                                        </div>
                                        <div className="table-responsive">
                                            <CTable hover align="middle" className="mb-0 premium-table small">
                                                <CTableHead className="bg-body-emphasis bg-opacity-25 border-bottom">
                                                    <CTableRow>
                                                        <CTableHeaderCell className="ps-4 border-0 py-3">{t('name')}</CTableHeaderCell>
                                                        <CTableHeaderCell className="text-center border-0 py-3">{t('reduction')}</CTableHeaderCell>
                                                        <CTableHeaderCell className="text-end pe-4 border-0 py-3">{t('actions')}</CTableHeaderCell>
                                                    </CTableRow>
                                                </CTableHead>
                                                <CTableBody>
                                                    {customer_groups.length > 0 ? customer_groups.map((group: any) => (
                                                        <CTableRow key={group.id} className="border-bottom border-light">
                                                            <CTableDataCell className="ps-4 py-3">
                                                                <div className="fw-bold text-body">{getName(group.name)}</div>
                                                                <div className="extra-small text-secondary opacity-75">ID: #{group.id}</div>
                                                            </CTableDataCell>
                                                            <CTableDataCell className="text-center py-3">
                                                                <span className="fw-black text-info">{group.reduction}%</span>
                                                            </CTableDataCell>
                                                            <CTableDataCell className="text-end pe-4 py-3">
                                                                <div className="d-flex justify-content-end gap-1">
                                                                    <CButton color="warning" size="sm" variant="ghost" className="p-2 rounded-circle hover-scale" onClick={() => handleEditGroupClick(group)}>
                                                                        <Settings size={14} />
                                                                    </CButton>
                                                                    <CButton color="danger" size="sm" variant="ghost" className="p-2 rounded-circle hover-scale" onClick={() => { setSelectedGroup(group); setShowDeleteGroupModal(true); }}>
                                                                        <Trash2 size={14} />
                                                                    </CButton>
                                                                </div>
                                                            </CTableDataCell>
                                                        </CTableRow>
                                                    )) : (
                                                        <CTableRow>
                                                            <CTableDataCell colSpan={3} className="text-center py-5 text-secondary italic opacity-50">
                                                                {t('no_items')}
                                                            </CTableDataCell>
                                                        </CTableRow>
                                                    )}
                                                </CTableBody>
                                            </CTable>
                                        </div>
                                    </CCardBody>
                                </CCard>
                            </CCol>
                        </CRow>
                    </CCol>

                    {/* Quick Access Sidebar */}
                    <CCol lg={4}>
                        <div className="d-flex flex-column gap-4">
                            <CCard className="border-0 shadow-sm overflow-hidden bg-body-tertiary">
                                <CCardBody className="p-4">
                                    <h5 className="fw-bold mb-4 text-body">{t('quick_management')}</h5>
                                    <div className="d-grid gap-3">
                                        <Link href={`/shops/${shop.id}/products`} className="text-decoration-none">
                                            <CCard className="border shadow-sm hover-secondary transition-all quick-nav-item bg-body-tertiary">
                                                <CCardBody className="p-3 d-flex align-items-center gap-3">
                                                    <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                                                        <Package size={20} />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-0 fw-bold text-body">{t('my_catalog')}</h6>
                                                        <p className="small text-secondary mb-0">{t('manage_products_stocks')}</p>
                                                    </div>
                                                    <ChevronDown size={14} className="text-secondary rotate-270" />
                                                </CCardBody>
                                            </CCard>
                                        </Link>

                                        <Link href={`/shops/${shop.id}/orders`} className="text-decoration-none">
                                            <CCard className="border shadow-sm hover-secondary transition-all quick-nav-item bg-body-tertiary">
                                                <CCardBody className="p-3 d-flex align-items-center gap-3">
                                                    <div className="bg-warning bg-opacity-10 p-2 rounded-3 text-warning">
                                                        <ShoppingCart size={20} />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-0 fw-bold text-body">{t('my_sales')}</h6>
                                                        <p className="small text-secondary mb-0">{t('follow_orders')}</p>
                                                    </div>
                                                    <ChevronDown size={14} className="text-secondary rotate-270" />
                                                </CCardBody>
                                            </CCard>
                                        </Link>

                                        <Link href={`/shops/${shop.id}/customers`} className="text-decoration-none">
                                            <CCard className="border shadow-sm hover-secondary transition-all quick-nav-item bg-body-tertiary">
                                                <CCardBody className="p-3 d-flex align-items-center gap-3">
                                                    <div className="bg-info bg-opacity-10 p-2 rounded-3 text-info">
                                                        <Users size={20} />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-0 fw-bold text-body">{t('my_customers')}</h6>
                                                        <p className="small text-secondary mb-0">{t('customer_details_profiles')}</p>
                                                    </div>
                                                    <ChevronDown size={14} className="text-secondary rotate-270" />
                                                </CCardBody>
                                            </CCard>
                                        </Link>
                                    </div>

                                </CCardBody>
                            </CCard>

                            <CCard className="border-0 shadow-sm bg-body-secondary">
                                <CCardBody className="p-4">
                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 small text-body">
                                        <Key size={16} className="text-secondary" /> {t('api_info')}
                                    </h6>
                                    <div className="space-y-2">
                                        <div className="small d-flex justify-content-between py-1 border-bottom border-body text-secondary">
                                            <span>{t('api_version')}</span>
                                            <span className="fw-medium text-body">1.7.x / 8.x</span>
                                        </div>
                                        <div className="small d-flex justify-content-between py-1 border-bottom border-body text-secondary">
                                            <span>{t('webservice_key')}</span>
                                            <span className="fw-medium text-body text-truncate ms-2" style={{ maxWidth: '120px' }}>{shop.api_key.substring(0, 8)}...</span>
                                        </div>
                                        <div className="small d-flex justify-content-between py-1 border-bottom border-body text-secondary">
                                            <span>{t('admin_url')}</span>
                                            <span className="fw-medium text-body ms-2">
                                                {shop.admin_url ? (
                                                    <a href={shop.admin_url} target="_blank" rel="noopener noreferrer" className="text-decoration-none d-flex align-items-center gap-1">
                                                        {t('open_backoffice')} <ExternalLink size={11} />
                                                    </a>
                                                ) : (
                                                    <span className="text-secondary">-</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </div>
                    </CCol>
                </CRow>

                {/* Integrated Employee Ecosystem Table */}
                <CRow className="mt-5 mb-5">
                    <CCol xs={12}>
                        <CCard className="border-0 shadow-lg bg-body-tertiary rounded-4 overflow-hidden">
                            <CCardBody className="p-0">
                                <div className="p-4 border-bottom border-white border-opacity-10 bg-body-emphasis bg-opacity-50 backdrop-blur d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2 bg-primary bg-opacity-10 rounded-3">
                                            <Users size={24} className="text-primary" />
                                        </div>
                                        <div>
                                            <h5 className="fw-black mb-0 text-body tracking-tight">{t('shop_employees')}</h5>
                                            <p className="extra-small text-secondary mb-0 opacity-75">{t('manage_staff_permissions')}</p>
                                        </div>
                                    </div>
                                    <CButton color="primary" className="rounded-pill px-4 py-2 fw-bold text-uppercase tracking-wider small shadow-sm gradient-primary-animation d-flex align-items-center gap-2" onClick={() => setShowAddEmployeeModal(true)}>
                                        <Plus size={18} /> {t('add_employee')}
                                    </CButton>
                                </div>

                                <div className="table-responsive">
                                    <CTable hover align="middle" className="mb-0 premium-table-lg">
                                        <CTableHead className="bg-light bg-opacity-50">
                                            <CTableRow>
                                                <CTableHeaderCell className="ps-4 border-0 py-3 text-uppercase extra-small fw-black text-secondary tracking-wider" style={{ width: '80px' }}>ID</CTableHeaderCell>
                                                <CTableHeaderCell className="border-0 py-3 text-uppercase extra-small fw-black text-secondary tracking-wider">{t('employee')}</CTableHeaderCell>
                                                <CTableHeaderCell className="border-0 py-3 text-uppercase extra-small fw-black text-secondary tracking-wider">{t('contact_info')}</CTableHeaderCell>
                                                <CTableHeaderCell className="text-center border-0 py-3 text-uppercase extra-small fw-black text-secondary tracking-wider">{t('status')}</CTableHeaderCell>
                                                <CTableHeaderCell className="text-end pe-4 border-0 py-3 text-uppercase extra-small fw-black text-secondary tracking-wider">{t('actions')}</CTableHeaderCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {employees.length > 0 ? employees.map((emp: any) => (
                                                <CTableRow key={emp.id} className="employee-table-row transition-all position-relative">
                                                    <CTableDataCell className="ps-4 py-4 text-secondary fw-medium">#{emp.id}</CTableDataCell>
                                                    <CTableDataCell className="py-4">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="avatar-placeholder rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary fw-black" style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}>
                                                                {emp.firstname.charAt(0)}{emp.lastname.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="fw-black text-body mb-0" style={{ fontSize: '1rem' }}>{emp.firstname} {emp.lastname}</div>
                                                                {emp.id_profile == '1' ? (
                                                                    <div className="d-flex align-items-center gap-1 text-danger extra-small fw-bold">
                                                                        <ShieldCheck size={10} /> {t('administrator')}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-secondary extra-small fw-medium">{t('employee')}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CTableDataCell>
                                                    <CTableDataCell className="py-4">
                                                        <div className="d-flex flex-column">
                                                            <span className="text-body fw-medium mb-0" style={{ fontSize: '0.9rem' }}>{emp.email}</span>
                                                            <span className="text-secondary extra-small opacity-75">{t('active_since_date', { date: '2024' })}</span>
                                                        </div>
                                                    </CTableDataCell>
                                                    <CTableDataCell className="text-center py-4">
                                                        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill border bg-opacity-10" style={{
                                                            borderColor: emp.active == '1' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                                                            backgroundColor: emp.active == '1' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(107, 114, 128, 0.05)',
                                                            color: emp.active == '1' ? '#059669' : '#4B5563'
                                                        }}>
                                                            <div className={`status-dot ${emp.active == '1' ? 'bg-success' : 'bg-secondary'}`} style={{ width: '6px', height: '6px', borderRadius: '50%' }}></div>
                                                            <span className="extra-small fw-bold text-uppercase tracking-wider">{emp.active == '1' ? t('active') : t('inactive')}</span>
                                                        </div>
                                                    </CTableDataCell>
                                                    <CTableDataCell className="text-end pe-4 py-4">
                                                        <div className="d-flex justify-content-end gap-2">
                                                            <CButton color="warning" size="sm" variant="ghost" className="p-2 rounded-3 hover-warning-solid text-warning shadow-sm border border-warning border-opacity-25" onClick={() => handleEditClick(emp)}>
                                                                <Settings size={18} />
                                                            </CButton>
                                                            <CButton color="danger" size="sm" variant="ghost" className="p-2 rounded-3 hover-danger-solid text-danger shadow-sm border border-danger border-opacity-25" onClick={() => { setSelectedEmployee(emp); setShowDeleteEmployeeModal(true); }}>
                                                                <Trash2 size={18} />
                                                            </CButton>
                                                        </div>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            )) : (
                                                <CTableRow>
                                                    <CTableDataCell colSpan={5} className="text-center py-5 text-secondary italic opacity-50">
                                                        {t('no_items')}
                                                    </CTableDataCell>
                                                </CTableRow>
                                            )}
                                        </CTableBody>
                                    </CTable>
                                </div>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>

                {/* Active Modules Ecosystem */}
                {modules.length > 0 && (
                    <CRow className="mb-5">
                        <CCol xs={12}>
                            <CCard className="border-0 shadow-lg bg-body-tertiary rounded-4 overflow-hidden">
                                <CCardBody className="p-0">
                                    <div className="p-4 border-bottom border-white border-opacity-10 bg-body-emphasis bg-opacity-50 backdrop-blur d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="p-2 bg-info bg-opacity-10 rounded-3">
                                                <Folder size={24} className="text-info" />
                                            </div>
                                            <div>
                                                <h5 className="fw-black mb-0 text-body tracking-tight">{t('active_modules')}</h5>
                                                <p className="extra-small text-secondary mb-0 opacity-75">{t('manage_staff_permissions')}</p>
                                            </div>
                                        </div>
                                        <div className="position-relative" style={{ maxWidth: '300px', width: '100%' }}>
                                            <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                                            <CFormInput
                                                className="ps-5 rounded-pill bg-body bg-opacity-50 border-white border-opacity-10 shadow-sm-hover transition-all"
                                                placeholder={t('search_modules')}
                                                value={moduleSearch}
                                                onChange={(e) => setModuleSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                        <CTable hover align="middle" className="mb-0 premium-table-lg">
                                            <CTableHead className="bg-light bg-opacity-50 sticky-top">
                                                <CTableRow>
                                                    <CTableHeaderCell className="ps-4 border-0 py-3 text-uppercase extra-small fw-black text-secondary tracking-wider">{t('module_name')}</CTableHeaderCell>
                                                    <CTableHeaderCell className="border-0 py-3 text-uppercase extra-small fw-black text-secondary tracking-wider">{t('author')}</CTableHeaderCell>
                                                    <CTableHeaderCell className="text-center border-0 py-3 text-uppercase extra-small fw-black text-secondary tracking-wider">{t('version')}</CTableHeaderCell>
                                                    <CTableHeaderCell className="text-center border-0 py-3 text-uppercase extra-small fw-black text-secondary tracking-wider">{t('status')}</CTableHeaderCell>
                                                </CTableRow>
                                            </CTableHead>
                                            <CTableBody>
                                                {filteredModules.length > 0 ? filteredModules.map((mod: any) => (
                                                    <CTableRow key={mod.id} className="module-table-row transition-all">
                                                        <CTableDataCell className="ps-4 py-3">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="p-2 bg-body rounded-3 border">
                                                                    <Layers size={20} className="text-secondary opacity-50" />
                                                                </div>
                                                                <div>
                                                                    <div className="fw-black text-body" style={{ fontSize: '0.95rem' }}>{mod.displayName || getName(mod.name)}</div>
                                                                    <div className="extra-small text-secondary opacity-75">{mod.name}</div>
                                                                </div>
                                                            </div>
                                                        </CTableDataCell>
                                                        <CTableDataCell className="py-3">
                                                            <span className="text-body fw-medium small">{mod.author || 'PrestaShop'}</span>
                                                        </CTableDataCell>
                                                        <CTableDataCell className="text-center py-3">
                                                            <CBadge color="light" className="text-secondary fw-bold px-3 py-2 border extra-small">
                                                                {mod.version}
                                                            </CBadge>
                                                        </CTableDataCell>
                                                        <CTableDataCell className="text-center py-3">
                                                            <CBadge color="success" className="px-4 py-2 small fw-bold bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill">
                                                                {t('active')}
                                                            </CBadge>
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                )) : (
                                                    <CTableRow>
                                                        <CTableDataCell colSpan={4} className="text-center py-5">
                                                            <div className="opacity-50">
                                                                <Folder size={48} className="mb-2" />
                                                                <p className="small italic text-secondary mb-0">{t('no_modules_found')}</p>
                                                            </div>
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                )}
                                            </CTableBody>
                                        </CTable>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                )}

                {/* Delete Employee Confirmation Modal */}
                <CModal visible={showDeleteEmployeeModal} onClose={() => setShowDeleteEmployeeModal(false)} backdrop="static" alignment="center">
                    <CModalHeader>
                        <CModalTitle>{t('confirm_delete_employee')}</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <p>{t('confirm_delete_employee_q', { name: selectedEmployee ? `${selectedEmployee.firstname} ${selectedEmployee.lastname}` : '' })}</p>
                        <p className="text-danger small mb-0"><Info size={14} /> {t('irreversible_action')}</p>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" variant="ghost" onClick={() => setShowDeleteEmployeeModal(false)}>{t('cancel')}</CButton>
                        <CButton color="danger" onClick={handleDeleteEmployee}>{t('delete_permanently')}</CButton>
                    </CModalFooter>
                </CModal>

                {/* Edit Employee Modal */}
                <CModal visible={showEditEmployeeModal} onClose={() => setShowEditEmployeeModal(false)} backdrop="static" alignment="center">
                    <CForm onSubmit={handleUpdateEmployee}>
                        <CModalHeader>
                            <CModalTitle>{t('edit_employee')}</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <div className="mb-3">
                                <CFormLabel className="small fw-bold">{t('firstname')}</CFormLabel>
                                <CFormInput
                                    value={editData.firstname}
                                    onChange={(e) => setEditData('firstname', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel className="small fw-bold">{t('lastname')}</CFormLabel>
                                <CFormInput
                                    value={editData.lastname}
                                    onChange={(e) => setEditData('lastname', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel className="small fw-bold d-flex align-items-center gap-2">
                                    <Mail size={14} /> {t('email')}
                                </CFormLabel>
                                <CFormInput
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) => setEditData('email', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel className="small fw-bold d-flex align-items-center gap-2">
                                    <Lock size={14} /> {t('password')}
                                    <span className="fw-normal text-muted small ms-1">({t('leave_blank_to_keep')})</span>
                                </CFormLabel>
                                <CFormInput
                                    type="password"
                                    value={editData.passwd}
                                    onChange={(e) => setEditData('passwd', e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="mb-2">
                                <CFormSwitch
                                    label={t('active_account')}
                                    checked={editData.active}
                                    onChange={(e) => setEditData('active', e.target.checked)}
                                />
                            </div>
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="secondary" variant="ghost" onClick={() => setShowEditEmployeeModal(false)}>
                                {t('cancel')}
                            </CButton>
                            <CButton color="primary" type="submit" disabled={updating}>
                                {updating ? t('saving') : t('save_changes')}
                            </CButton>
                        </CModalFooter>
                    </CForm>
                </CModal>

                {/* Add Employee Modal */}
                <CModal visible={showAddEmployeeModal} onClose={() => setShowAddEmployeeModal(false)} backdrop="static" alignment="center">
                    <CForm onSubmit={handleAddEmployee}>
                        <CModalHeader>
                            <CModalTitle>{t('add_employee_title')}</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <div className="mb-3">
                                <CFormLabel className="small fw-bold">{t('firstname')}</CFormLabel>
                                <CFormInput
                                    value={addData.firstname}
                                    onChange={(e) => setAddData('firstname', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel className="small fw-bold">{t('lastname')}</CFormLabel>
                                <CFormInput
                                    value={addData.lastname}
                                    onChange={(e) => setAddData('lastname', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel className="small fw-bold d-flex align-items-center gap-2">
                                    <Mail size={14} /> {t('email')}
                                </CFormLabel>
                                <CFormInput
                                    type="email"
                                    value={addData.email}
                                    onChange={(e) => setAddData('email', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel className="small fw-bold d-flex align-items-center gap-2">
                                    <Lock size={14} /> {t('password')}
                                </CFormLabel>
                                <CFormInput
                                    type="password"
                                    value={addData.passwd}
                                    onChange={(e) => setAddData('passwd', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <div className="text-muted extra-small mt-1">{t('password_min_8')}</div>
                            </div>
                            <div className="mb-2">
                                <CFormSwitch
                                    label={t('active_account')}
                                    checked={addData.active}
                                    onChange={(e) => setAddData('active', e.target.checked)}
                                />
                            </div>
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="secondary" variant="ghost" onClick={() => setShowAddEmployeeModal(false)}>
                                {t('cancel')}
                            </CButton>
                            <CButton color="primary" type="submit" disabled={adding}>
                                {adding ? t('creating') : t('create_employee')}
                            </CButton>
                        </CModalFooter>
                    </CForm>
                </CModal>

                {/* Edit Group Modal */}
                <CModal visible={showEditGroupModal} onClose={() => setShowEditGroupModal(false)} backdrop="static" alignment="center">
                    <CForm onSubmit={handleUpdateGroup}>
                        <CModalHeader>
                            <CModalTitle>{t('edit_group')}</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <div className="mb-3">
                                <CFormLabel className="small fw-bold">{t('group_name')}</CFormLabel>
                                <CFormInput
                                    value={groupData.name}
                                    onChange={(e) => setGroupData('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel className="small fw-bold">{t('reduction_percent')}</CFormLabel>
                                <CFormInput
                                    type="number"
                                    step="0.01"
                                    value={groupData.reduction}
                                    onChange={(e) => setGroupData('reduction', parseFloat(e.target.value))}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel className="small fw-bold">{t('price_display')}</CFormLabel>
                                <CFormSelect
                                    value={groupData.price_display_method}
                                    onChange={(e) => setGroupData('price_display_method', parseInt(e.target.value))}
                                >
                                    <option value="0">{t('price_tax_incl')}</option>
                                    <option value="1">{t('price_tax_excl')}</option>
                                </CFormSelect>
                            </div>
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="secondary" variant="ghost" onClick={() => setShowEditGroupModal(false)}>
                                {t('cancel')}
                            </CButton>
                            <CButton color="primary" type="submit" disabled={groupUpdating}>
                                {groupUpdating ? t('saving') : t('save_changes')}
                            </CButton>
                        </CModalFooter>
                    </CForm>
                </CModal>

                {/* Delete Group Confirmation Modal */}
                <CModal visible={showDeleteGroupModal} onClose={() => setShowDeleteGroupModal(false)} backdrop="static" alignment="center">
                    <CModalHeader>
                        <CModalTitle>{t('confirm_delete_group')}</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <p>{t('confirm_delete_group_q', { name: selectedGroup ? getName(selectedGroup.name) : '' })}</p>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" variant="ghost" onClick={() => setShowDeleteGroupModal(false)}>{t('cancel')}</CButton>
                        <CButton color="danger" onClick={handleDeleteGroup}>{t('delete_permanently')}</CButton>
                    </CModalFooter>
                </CModal>

            </CContainer>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .glass-shell { 
                    background: radial-gradient(circle at top right, rgba(79, 70, 229, 0.05), transparent 600px), 
                                radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.05), transparent 600px);
                    min-height: 100vh;
                }

                .backdrop-blur { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
                .fw-black { font-weight: 900; }
                .tracking-tight { letter-spacing: -0.02em; }
                .tracking-wider { letter-spacing: 0.05em; }

                /* Header Pulse Animation */
                .status-pulse {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    background-color: var(--cui-success);
                    border-radius: 50%;
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }

                .logo-glow {
                    width: 120px;
                    height: 120px;
                    background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%);
                    opacity: 0.6;
                    filter: blur(15px);
                }

                .premium-stat-card {
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
                }
                .premium-stat-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
                }

                .stat-card-decoration {
                    right: -20px;
                    bottom: -20px;
                    opacity: 0.15;
                    transform: rotate(-15deg);
                    pointer-events: none;
                }

                /* Table Styling */
                .premium-table thead th {
                    border-bottom: 0 !important;
                    color: var(--cui-secondary-color);
                    font-size: 0.65rem;
                    font-weight: 900;
                    text-uppercase: true;
                    letter-spacing: 0.05em;
                }
                .premium-table-lg thead th {
                    padding: 1.25rem 1rem !important;
                    background: var(--cui-light) !important;
                }

                .carrier-row {
                    border: 1px solid transparent !important;
                    background: var(--cui-body-bg) !important;
                }
                .carrier-row:hover {
                    border-color: var(--cui-primary-border-subtle) !important;
                    background: var(--cui-tertiary-bg) !important;
                    transform: scale(1.01);
                }

                .employee-table-row:hover {
                    background-color: var(--cui-tertiary-bg) !important;
                }

                .quick-nav-item { 
                    border: 1px solid rgba(0,0,0,0.05) !important;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .quick-nav-item:hover {
                    background: var(--cui-body-bg) !important;
                    transform: translateX(5px);
                    border-color: var(--cui-primary) !important;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important;
                }

                .hover-scale:hover { transform: scale(1.1); }
                .shadow-sm-hover:hover { box-shadow: var(--cui-box-shadow-sm) !important; }

                .rounded-4 { border-radius: 1.25rem !important; }
                .display-5 { font-size: 2.75rem; font-weight: 800; }
                .extra-small { font-size: 0.7rem; }
                
                .gradient-primary-animation {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    transition: all 0.3s ease;
                }
                .gradient-primary-animation:hover:not(:disabled) {
                    background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
                    box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3) !important;
                    transform: translateY(-2px);
                }

                .hover-warning-solid:hover { background-color: var(--cui-warning) !important; color: white !important; }
                .hover-danger-solid:hover { background-color: var(--cui-danger) !important; color: white !important; }

                .link-transition { transition: color 0.2s ease; }
            `}</style>

        </AppLayout>
    );
}
