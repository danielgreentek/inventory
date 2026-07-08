'use client';
import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { useUI } from '@/lib/ui-context';
import { useInventory } from '@/lib/inventory-context';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const { setToastMessage } = useUI();
  const { items, isLoading } = useInventory();

  const buildSortedRows = () => {
    return items.flatMap((item) =>
      item.units.map((unit) => ({
        item_name: item.item_name,
        category: item.category,
        brand: item.brand,
        branch: item.branch,
        serial: unit.serial,
        status: unit.status,
        location: unit.location,
        assignedTo: unit.assignedTo,
        condition: unit.condition,
        condition_note: unit.condition_note,
        production_date: unit.production_date,
      }))
    ).sort((a, b) => {
      if (!a.production_date) return 1;
      if (!b.production_date) return -1;
      return new Date(b.production_date).getTime() - new Date(a.production_date).getTime();
    });
  };

  const handleExportPDF = async () => {
    const rows = buildSortedRows();
    if (rows.length === 0) { setToastMessage('Tidak ada data.'); return; }
    setIsExporting(true);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text('Laporan Inventaris Seluruh Data', 40, 40);

    const tableColumn = ['Nama Barang', 'Kategori', 'Brand', 'Cabang', 'Serial', 'Status', 'Lokasi', 'Dipakai oleh', 'Kondisi', 'Catatan', 'Tgl Produksi'];
    const tableRows = rows.map((r) => [r.item_name, r.category, r.brand, r.branch, r.serial, r.status, r.location, r.assignedTo, r.condition, r.condition_note, r.production_date]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      styles: { fontSize: 8, cellPadding: 5 },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 60 }, 2: { cellWidth: 60 }, 3: { cellWidth: 60 }, 4: { cellWidth: 70 }, 5: { cellWidth: 60 }, 6: { cellWidth: 80 }, 7: { cellWidth: 80 }, 8: { cellWidth: 60 }, 9: { cellWidth: 120 }, 10: { cellWidth: 70 } },
      margin: { left: 40, right: 40 },
    });

    doc.save('laporan-inventaris-semua-data.pdf');
    setToastMessage('Laporan PDF berhasil dibuat.');
    setIsExporting(false);
  };

  const handleExportExcel = async () => {
    const rows = buildSortedRows();
    if (rows.length === 0) { setToastMessage('Tidak ada data.'); return; }
    setIsExporting(true);

    const excelRows = rows.map((r) => ({ 'Nama Barang': r.item_name, 'Kategori': r.category, 'Brand': r.brand, 'Cabang': r.branch, 'Serial': r.serial, 'Status': r.status, 'Lokasi': r.location, 'Dipakai oleh': r.assignedTo, 'Kondisi': r.condition, 'Catatan': r.condition_note, 'Tanggal Produksi': r.production_date }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
    XLSX.writeFile(workbook, 'laporan-inventaris-semua-data.xlsx');

    setToastMessage('Laporan Excel berhasil dibuat.');
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Laporan inventaris</p>
            <h3 className="text-2xl font-semibold text-slate-950">Export PDF & Excel</h3>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-brand-600" />
            <div>
              <p className="text-sm text-slate-500">Laporan PDF</p>
              <h4 className="text-lg font-semibold text-slate-950">Ekspor sebagai PDF</h4>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600">Unduh daftar aset lengkap dalam format PDF.</p>
          <button onClick={handleExportPDF} disabled={isExporting || isLoading}
            className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            <Download size={16} /> {isExporting ? 'Mengunduh...' : 'Export PDF'}
          </button>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-brand-600" />
            <div>
              <p className="text-sm text-slate-500">Laporan Excel</p>
              <h4 className="text-lg font-semibold text-slate-950">Ekspor sebagai Excel</h4>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600">Unduh data inventaris dalam format Excel.</p>
          <button onClick={handleExportExcel} disabled={isExporting || isLoading}
            className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            <Download size={16} /> {isExporting ? 'Mengunduh...' : 'Export Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}
