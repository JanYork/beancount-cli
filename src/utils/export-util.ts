/**
 * 导出工具类
 * 支持CSV、Excel、JSON等格式的数据导出
 *
 * 作者: JanYork
 */

import { Transaction, ExportOptions, ReportData } from '../types';
import { format as formatDate } from 'date-fns';
import * as fs from 'fs';
import * as path from 'path';

export class ExportUtil {
    /**
     * 导出交易数据
     */
    static async exportTransactions(
        transactions: Transaction[],
        _options: ExportOptions
    ): Promise<string> {
        const outputPath = _options.outputPath || this.generateDefaultPath(_options.format);

        switch (_options.format) {
            case 'csv':
                return this.exportToCSV(transactions, outputPath, _options);
            case 'excel':
                return this.exportToExcel(transactions, outputPath, _options);
            case 'json':
                return this.exportToJSON(transactions, outputPath, _options);
            case 'beancount':
                return this.exportToBeancount(transactions, outputPath, _options);
            default:
                throw new Error(`不支持的导出格式: ${_options.format}`);
        }
    }

    /**
     * 导出报表数据
     */
    static async exportReport(
        report: ReportData,
        format: 'csv' | 'excel' | 'json' = 'json'
    ): Promise<string> {
        const outputPath = this.generateReportPath(report.title, format);

        switch (format) {
            case 'csv':
                return this.exportReportToCSV(report, outputPath);
            case 'excel':
                return this.exportReportToExcel(report, outputPath);
            case 'json':
                return this.exportReportToJSON(report, outputPath);
            default:
                throw new Error(`不支持的导出格式: ${format}`);
        }
    }

    /**
     * 导出为CSV格式
     */
    private static async exportToCSV(
        transactions: Transaction[],
        outputPath: string,
        _options: ExportOptions
    ): Promise<string> {
        const csvWriter = await import('csv-writer');

        const headers = [
            { id: 'date', title: '日期' },
            { id: 'payee', title: '收款人/付款人' },
            { id: 'narration', title: '描述' },
            { id: 'amount', title: '金额' },
            { id: 'currency', title: '货币' },
            { id: 'accounts', title: '账户' },
            { id: 'tags', title: '标签' },
            { id: 'links', title: '链接' },
        ];

        const writer = csvWriter.createObjectCsvWriter({
            path: outputPath,
            header: headers,
        });

        const records = transactions.map(tx => {
            const amount = this.calculateTransactionAmount(tx);
            const currency = this.getTransactionCurrency(tx);

            return {
                date: formatDate(new Date(tx.date), 'yyyy-MM-dd'),
                payee: tx.payee || '',
                narration: tx.narration,
                amount: amount.toFixed(2),
                currency,
                accounts: tx.postings.map(p => p.account).join('; '),
                tags: tx.tags.join('; '),
                links: tx.links.join('; '),
            };
        });

        await writer.writeRecords(records);
        return outputPath;
    }

    /**
     * 导出为Excel格式
     */
    private static async exportToExcel(
        transactions: Transaction[],
        outputPath: string,
        _options: ExportOptions
    ): Promise<string> {
        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('交易记录');

        // 设置表头
        worksheet.columns = [
            { header: '日期', key: 'date', width: 12 },
            { header: '收款人/付款人', key: 'payee', width: 20 },
            { header: '描述', key: 'narration', width: 30 },
            { header: '金额', key: 'amount', width: 15 },
            { header: '货币', key: 'currency', width: 10 },
            { header: '账户', key: 'accounts', width: 25 },
            { header: '标签', key: 'tags', width: 20 },
            { header: '链接', key: 'links', width: 20 },
        ];

        // 添加数据
        transactions.forEach(tx => {
            const amount = this.calculateTransactionAmount(tx);
            const currency = this.getTransactionCurrency(tx);

            worksheet.addRow({
                date: formatDate(new Date(tx.date), 'yyyy-MM-dd'),
                payee: tx.payee || '',
                narration: tx.narration,
                amount: amount.toFixed(2),
                currency,
                accounts: tx.postings.map(p => p.account).join('; '),
                tags: tx.tags.join('; '),
                links: tx.links.join('; '),
            });
        });

        // 设置样式
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };

        await workbook.xlsx.writeFile(outputPath);
        return outputPath;
    }

    /**
     * 导出为JSON格式
     */
    private static async exportToJSON(
        transactions: Transaction[],
        outputPath: string,
        _options: ExportOptions
    ): Promise<string> {
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                totalTransactions: transactions.length,
                format: 'json',
                options: _options,
            },
            transactions: transactions.map(tx => ({
                ...tx,
                date: tx.date.toISOString(),
            })),
        };

        await fs.promises.writeFile(outputPath, JSON.stringify(exportData, null, 2), 'utf8');
        return outputPath;
    }

    /**
     * 导出为Beancount格式
     */
    private static async exportToBeancount(
        transactions: Transaction[],
        outputPath: string,
        _options: ExportOptions
    ): Promise<string> {
        let beancountContent = '';

        // 添加文件头
        beancountContent += `; 导出时间: ${new Date().toISOString()}\n`;
        beancountContent += `; 总交易数: ${transactions.length}\n\n`;

        // 按日期排序
        const sortedTransactions = [...transactions].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // 生成Beancount格式的交易记录
        for (const tx of sortedTransactions) {
            beancountContent += `${formatDate(new Date(tx.date), 'yyyy-MM-dd')}`;

            if (tx.payee) {
                beancountContent += ` * "${tx.payee}"`;
            } else {
                beancountContent += ` *`;
            }

            beancountContent += ` "${tx.narration}"`;

            // 添加标签
            if (tx.tags.length > 0) {
                beancountContent += ` ${tx.tags.map(tag => `#${tag}`).join(' ')}`;
            }

            // 添加链接
            if (tx.links.length > 0) {
                beancountContent += ` ${tx.links.map(link => `^${link}`).join(' ')}`;
            }

            beancountContent += '\n';

            // 添加分录
            for (const posting of tx.postings) {
                beancountContent += `  ${posting.account}`;

                if (posting.units) {
                    beancountContent += ` ${posting.units.number} ${posting.units.currency}`;
                }

                if (posting.price) {
                    beancountContent += ` @ ${posting.price.number} ${posting.price.currency}`;
                }

                if (posting.cost) {
                    beancountContent += ` {${posting.cost}}`;
                }

                beancountContent += '\n';
            }

            beancountContent += '\n';
        }

        await fs.promises.writeFile(outputPath, beancountContent, 'utf8');
        return outputPath;
    }

    /**
     * 导出报表为CSV
     */
    private static async exportReportToCSV(
        report: ReportData,
        outputPath: string
    ): Promise<string> {
        const csvWriter = await import('csv-writer');

        // 根据报表类型生成不同的CSV结构
        let headers: any[] = [];
        let records: any[] = [];

        switch (report.type) {
            case 'income_expense':
                headers = [
                    { id: 'category', title: '分类' },
                    { id: 'amount', title: '金额' },
                    { id: 'percentage', title: '占比(%)' },
                ];

                const data = report.data as any;
                if (data.incomeCategories) {
                    records.push(...data.incomeCategories.map((cat: any) => ({
                        category: `收入-${cat.category}`,
                        amount: cat.amount.toFixed(2),
                        percentage: cat.percentage.toFixed(2),
                    })));
                }
                if (data.expenseCategories) {
                    records.push(...data.expenseCategories.map((cat: any) => ({
                        category: `支出-${cat.category}`,
                        amount: cat.amount.toFixed(2),
                        percentage: cat.percentage.toFixed(2),
                    })));
                }
                break;

            case 'category_analysis':
                headers = [
                    { id: 'category', title: '分类' },
                    { id: 'totalAmount', title: '总金额' },
                    { id: 'transactionCount', title: '交易数量' },
                    { id: 'averageAmount', title: '平均金额' },
                    { id: 'percentage', title: '占比(%)' },
                ];

                records = (report.data as any[]).map(cat => ({
                    category: cat.category,
                    totalAmount: cat.totalAmount.number.toFixed(2),
                    transactionCount: cat.transactionCount,
                    averageAmount: cat.averageAmount.number.toFixed(2),
                    percentage: cat.percentage.toFixed(2),
                }));
                break;

            default:
                headers = [
                    { id: 'field', title: '字段' },
                    { id: 'value', title: '值' },
                ];

                records = Object.entries(report.data).map(([key, value]) => ({
                    field: key,
                    value: typeof value === 'object' ? JSON.stringify(value) : String(value),
                }));
        }

        const writer = csvWriter.createObjectCsvWriter({
            path: outputPath,
            header: headers,
        });

        await writer.writeRecords(records);
        return outputPath;
    }

    /**
     * 导出报表为Excel
     */
    private static async exportReportToExcel(
        report: ReportData,
        outputPath: string
    ): Promise<string> {
        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('报表数据');

        // 添加报表标题
        worksheet.addRow([report.title]);
        worksheet.getRow(1).font = { bold: true, size: 16 };
        worksheet.mergeCells('A1:C1');

        // 添加生成时间
        worksheet.addRow([`生成时间: ${formatDate(report.generatedAt, 'yyyy-MM-dd HH:mm:ss')}`]);
        worksheet.getRow(2).font = { italic: true };
        worksheet.mergeCells('A2:C2');

        worksheet.addRow([]); // 空行

        // 根据报表类型生成不同的Excel结构
        switch (report.type) {
            case 'income_expense':
                worksheet.addRow(['收入分类']);
                worksheet.getRow(4).font = { bold: true };

                worksheet.addRow(['分类', '金额', '占比(%)']);
                worksheet.getRow(5).font = { bold: true };

                const data = report.data as any;
                if (data.incomeCategories) {
                    data.incomeCategories.forEach((cat: any) => {
                        worksheet.addRow([cat.category, cat.amount.toFixed(2), cat.percentage.toFixed(2)]);
                    });
                }

                worksheet.addRow([]); // 空行
                worksheet.addRow(['支出分类']);
                worksheet.getRow(worksheet.rowCount).font = { bold: true };

                worksheet.addRow(['分类', '金额', '占比(%)']);
                worksheet.getRow(worksheet.rowCount).font = { bold: true };

                if (data.expenseCategories) {
                    data.expenseCategories.forEach((cat: any) => {
                        worksheet.addRow([cat.category, cat.amount.toFixed(2), cat.percentage.toFixed(2)]);
                    });
                }
                break;

            case 'category_analysis':
                worksheet.addRow(['分类', '总金额', '交易数量', '平均金额', '占比(%)']);
                worksheet.getRow(4).font = { bold: true };

                (report.data as any[]).forEach(cat => {
                    worksheet.addRow([
                        cat.category,
                        cat.totalAmount.number.toFixed(2),
                        cat.transactionCount,
                        cat.averageAmount.number.toFixed(2),
                        cat.percentage.toFixed(2),
                    ]);
                });
                break;

            default:
                worksheet.addRow(['字段', '值']);
                worksheet.getRow(4).font = { bold: true };

                Object.entries(report.data).forEach(([key, value]) => {
                    worksheet.addRow([key, typeof value === 'object' ? JSON.stringify(value) : String(value)]);
                });
        }

        // 设置列宽
        worksheet.columns.forEach(column => {
            column.width = 20;
        });

        await workbook.xlsx.writeFile(outputPath);
        return outputPath;
    }

    /**
     * 导出报表为JSON
     */
    private static async exportReportToJSON(
        report: ReportData,
        outputPath: string
    ): Promise<string> {
        const exportData = {
            metadata: {
                title: report.title,
                type: report.type,
                generatedAt: report.generatedAt.toISOString(),
                period: report.period,
            },
            data: report.data,
        };

        await fs.promises.writeFile(outputPath, JSON.stringify(exportData, null, 2), 'utf8');
        return outputPath;
    }

    /**
     * 生成默认输出路径
     */
    private static generateDefaultPath(format: string): string {
        const timestamp = formatDate(new Date(), 'yyyyMMdd_HHmmss');
        const filename = `beancount_export_${timestamp}.${format}`;
        return path.join(process.cwd(), 'exports', filename);
    }

    /**
     * 生成报表输出路径
     */
    private static generateReportPath(title: string, format: string): string {
        const timestamp = formatDate(new Date(), 'yyyyMMdd_HHmmss');
        const safeTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
        const filename = `${safeTitle}_${timestamp}.${format}`;
        return path.join(process.cwd(), 'exports', filename);
    }

    /**
     * 计算交易金额
     */
    private static calculateTransactionAmount(tx: Transaction): number {
        let total = 0;
        for (const posting of tx.postings) {
            if (posting.units) {
                total += Math.abs(posting.units.number);
            }
        }
        return total;
    }

    /**
     * 获取交易货币
     */
    private static getTransactionCurrency(tx: Transaction): string {
        for (const posting of tx.postings) {
            if (posting.units?.currency) {
                return posting.units.currency;
            }
        }
        return 'CNY';
    }

    /**
     * 确保导出目录存在
     */
    static ensureExportDirectory(): void {
        const exportDir = path.join(process.cwd(), 'exports');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }
    }
}
