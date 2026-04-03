'use client';

import { Download, FileText } from 'lucide-react';
import styles from './history.module.css';
import { format } from 'date-fns';

interface ExportButtonsProps {
    filteredHistory: any[];
    user: any;
}

export default function ExportButtons({ filteredHistory, user }: ExportButtonsProps) {
    const exportToCSV = () => {
        const headers = ['ID', 'Subject', 'Teacher', 'Section', 'Date', 'Time', 'Status'];
        const rows = filteredHistory.map(item => [
            item.id,
            item.subject,
            item.teacher,
            item.section,
            format(new Date(item.markedAt), 'MMM d, yyyy'),
            format(new Date(item.markedAt), 'h:mm a'),
            item.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_history_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = async () => {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.setTextColor(108, 99, 255);
        doc.text('Auratten Attendance History', 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Student: ${user?.name || 'Karthik Chowdary'}`, 14, 32);
        doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, 14, 39);
        
        const tableColumn = ["Date", "Subject", "Teacher", "Section", "Status"];
        const tableRows = filteredHistory.map(item => [
            format(new Date(item.markedAt), 'MMM d, yyyy'),
            item.subject,
            item.teacher,
            item.section,
            item.status
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 48,
            theme: 'grid',
            headStyles: { fillColor: [108, 99, 255], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 245, 255] }
        });

        doc.save(`attendance_history_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

    return (
        <div className="flex items-center gap-3">
            <button onClick={exportToPDF} className={styles.exportButton}>
                <FileText size={18} />
                <span>Export PDF</span>
            </button>
            <button onClick={exportToCSV} className={styles.exportButton}>
                <Download size={18} />
                <span>Export CSV</span>
            </button>
        </div>
    );
}
