import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';
import { Product } from '../models/product.model';

type AutoTablePlugin = typeof import('jspdf-autotable')['default'];

@Injectable({ providedIn: 'root' })
export class ProductPdfService {
  exportInventory(products: Product[]): Promise<void> {
    return this.downloadReport(products, 'gupio-inventory-details.pdf');
  }

  exportProduct(product: Product): Promise<void> {
    const filename = `${this.slugify(product.name)}-details.pdf`;
    return this.downloadReport([product], filename);
  }

  private async downloadReport(products: Product[], filename: string): Promise<void> {
    const [{ jsPDF }, tableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const autoTable = tableModule.default;
    const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;

    products.forEach((product, index) => {
      if (index > 0) pdf.addPage();
      this.renderProduct(pdf, product, index + 1, products.length, margin, contentWidth, autoTable);
    });

    const pageCount = pdf.getNumberOfPages();
    for (let page = 1; page <= pageCount; page++) {
      pdf.setPage(page);
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.setDrawColor(224, 232, 227);
      pdf.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(105, 119, 111);
      pdf.text(`Generated ${new Date().toLocaleString()}  |  Page ${page} of ${pageCount}`, margin, pageHeight - 7);
    }

    pdf.save(filename);
  }

  private renderProduct(
    pdf: jsPDF,
    product: Product,
    productNumber: number,
    productCount: number,
    margin: number,
    contentWidth: number,
    autoTable: AutoTablePlugin
  ): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    pdf.setFillColor(23, 99, 76);
    pdf.rect(0, 0, pageWidth, 15, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text('GUPIO  /  PRODUCT INVENTORY', margin, 9.5);
    pdf.text(`PRODUCT ${productNumber} OF ${productCount}`, pageWidth - margin, 9.5, { align: 'right' });

    let cursorY = 25;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(19);
    pdf.setTextColor(30, 43, 38);
    const titleLines = pdf.splitTextToSize(product.name, contentWidth);
    pdf.text(titleLines, margin, cursorY);
    cursorY += titleLines.length * 8 + 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(103, 117, 110);
    pdf.text(`Product ID: ${product._id}`, margin, cursorY);
    cursorY += 6;

    autoTable(pdf, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [['Inventory field', 'Product record']],
      body: [
        ['Category', product.category],
        ['Unit price', `INR ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(product.price)}`],
        ['Quantity on hand', `${product.stockQuantity} units`],
        ['Stock status', product.stockStatus],
        ['Reorder point', `${product.reorderPoint ?? 10} units`],
        ['Created', new Date(product.createdAt).toLocaleString()],
        ['Last updated', new Date(product.updatedAt).toLocaleString()],
      ],
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, textColor: [45, 59, 51], lineColor: [227, 233, 229] },
      headStyles: { fillColor: [23, 99, 76], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 46, fontStyle: 'bold' }, 1: { cellWidth: contentWidth - 46 } },
    });

    cursorY = this.lastTableY(pdf) + 8;
    autoTable(pdf, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [['Description', '']],
      body: [[product.description || 'No description provided.']],
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, overflow: 'linebreak', textColor: [45, 59, 51], lineColor: [227, 233, 229] },
      headStyles: { fillColor: [23, 99, 76], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: contentWidth } },
    });

    cursorY = this.lastTableY(pdf) + 8;
    const adjustments = [...(product.stockAdjustments ?? [])].reverse();
    autoTable(pdf, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [['Stock adjustment history', 'Reason', 'Recorded']],
      body: adjustments.length > 0
        ? adjustments.map((entry) => [
            `${entry.delta > 0 ? '+' : ''}${entry.delta} units`,
            entry.reason,
            new Date(entry.createdAt).toLocaleString(),
          ])
        : [['No adjustments recorded', '', '']],
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.5, overflow: 'linebreak', textColor: [45, 59, 51], lineColor: [227, 233, 229] },
      headStyles: { fillColor: [239, 245, 241], textColor: [30, 43, 38], fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 39 }, 1: { cellWidth: contentWidth - 83 }, 2: { cellWidth: 44 } },
    });
  }

  private lastTableY(pdf: jsPDF): number {
    return (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 30;
  }

  private slugify(value: string): string {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product';
  }
}