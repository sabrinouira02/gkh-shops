import { cilSpeedometer, cilBasket, cilFolder } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react-pro';
import { ElementType, JSX } from 'react';
import { Translation } from 'react-i18next';

export type Badge = {
    color: string;
    text: string;
};

export type NavItem = {
    badge?: Badge;
    component: string | ElementType;
    href?: string;
    icon?: string | JSX.Element;
    items?: NavItem[];
    name: string | JSX.Element;
    to?: string;
};

// Simplified navigation structure
const _nav: NavItem[] = [
    {
        component: CNavItem,
        name: <Translation>{(t) => t('dashboard')}</Translation>,
        to: '/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    },
    {
        component: CNavTitle,
        name: <Translation>{(t) => t('pages')}</Translation>,
    },
    {
        component: CNavItem,
        name: <Translation>{(t) => t('shops')}</Translation>,
        to: '/shops',
        icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
    },
    {
        component: CNavItem,
        name: <Translation>{(t) => t('categories')}</Translation>,
        to: '/categories',
        icon: <CIcon icon={cilFolder} customClassName="nav-icon" />,
    },
];

export default _nav;