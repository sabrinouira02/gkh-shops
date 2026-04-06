import React from 'react';
import { CPagination, CPaginationItem, CFormSelect } from '@coreui/react-pro';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: any;
    total: number;
    limit?: any;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
}

export default function Pagination({ currentPage, total, limit = 10, onPageChange, onLimitChange }: PaginationProps) {
    const totalPages = Math.ceil(total / Number(limit));
    const current = Number(currentPage || 1) || 1;
    
    if (total === 0) return null;

    const renderPaginationItems = () => {
        const pages = [];
        
        // Always show page 1
        pages.push(1);

        if (current > 3) {
            pages.push('...');
        }

        // Show window around current page
        for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
            if (pages[pages.length - 1] !== i) {
                pages.push(i);
            }
        }

        if (current < totalPages - 2) {
            pages.push('...');
        }

        // Always show last page if > 1
        if (totalPages > 1 && pages[pages.length - 1] !== totalPages) {
            pages.push(totalPages);
        }

        return pages.map((p, i) => (
            <CPaginationItem 
                key={i} 
                active={p === current}
                disabled={p === '...'}
                onClick={() => typeof p === 'number' && onPageChange(p)}
                style={{ cursor: p === '...' ? 'default' : 'pointer' }}
            >
                {p}
            </CPaginationItem>
        ));
    };

    return (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3">
            <div className="d-flex align-items-center gap-2 text-secondary small">
                <span>Afficher</span>
                <CFormSelect 
                    size="sm" 
                    className="w-auto"
                    value={limit}
                    onChange={(e) => onLimitChange?.(Number(e.target.value))}
                >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="500">500</option>
                </CFormSelect>
                <span>par page (Total: {total})</span>
            </div>

            {totalPages > 1 && (
                <CPagination size="sm" className="mb-0">
                    <CPaginationItem 
                        disabled={current <= 1}
                        onClick={() => onPageChange(current - 1)}
                        style={{ cursor: 'pointer' }}
                    >
                        <ChevronLeft size={16} />
                    </CPaginationItem>
                    
                    {renderPaginationItems()}

                    <CPaginationItem 
                        disabled={current >= totalPages}
                        onClick={() => onPageChange(current + 1)}
                        style={{ cursor: 'pointer' }}
                    >
                        <ChevronRight size={16} />
                    </CPaginationItem>
                </CPagination>
            )}
        </div>
    );
}
