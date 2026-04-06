import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Shop {
    id: number;
    name: string;
    url: string;
    logo?: string | null;
    api_key: string;
    created_at: string;
    updated_at: string;
    [key: string]: any;
}

export interface Product {
    id: string | number;
    name: any;
    reference: string;
    price: string;
    quantity: string | number;
    main_image?: string;
    [key: string]: any;
}

export interface Order {
    id: string | number;
    reference: string;
    total_paid: string;
    payment: string;
    date_add: string;
    current_state: string | number;
    state_name?: string;
    [key: string]: any;
}

export interface Customer {
    id: string | number;
    firstname: string;
    lastname: string;
    email: string;
    date_add: string;
    active: string | number;
    [key: string]: any;
}
