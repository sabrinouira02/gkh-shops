import * as XLSX from 'xlsx';

/**
 * Export an array of objects to a CSV file and trigger browser download.
 */
export function exportToCSV(data: Record<string, any>[], filename: string): void {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(';'),
        ...data.map(row =>
            headers.map(h => {
                const val = row[h] ?? '';
                const str = String(val).replace(/"/g, '""');
                return str.includes(';') || str.includes('\n') ? `"${str}"` : str;
            }).join(';')
        ),
    ];

    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `${filename}.csv`);
}

/**
 * Export an array of objects to an Excel (.xlsx) file and trigger browser download.
 */
export function exportToExcel(data: Record<string, any>[], filename: string): void {
    if (!data.length) return;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Export');
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

function triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
