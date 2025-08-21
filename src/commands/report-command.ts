/**
 * 报表命令
 * 支持各种财务报表生成
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { CommandResult } from '../types';
import { ReportGenerator } from '../utils/report-generator';
import { UIEnhancer } from '../utils/ui-enhancer';
import { BeancountEngine } from '../engine/beancount-engine';
import { format, subMonths } from 'date-fns';

export class ReportCommand extends BaseCommand {
    constructor(engine: BeancountEngine) {
        super(engine);
    }

    async execute(params: Record<string, any>): Promise<CommandResult> {
        try {
            const reportType = params['type'] || params['args']?.[0];

            if (!reportType) {
                return {
                    success: false,
                    message: '请指定报表类型，使用 /report help 查看支持的报表类型',
                };
            }

            if (reportType === 'help') {
                return {
                    success: true,
                    message: this.getHelp(),
                };
            }

            const transactions = this.engine?.getTransactions() || [];
            // const now = new Date();

            // 根据报表类型生成报表
            let report;
            switch (reportType) {
                case 'income_expense':
                    report = await this.generateIncomeExpenseReport(transactions, params);
                    break;
                case 'balance_sheet':
                    report = await this.generateBalanceSheet(transactions, params);
                    break;
                case 'cash_flow':
                    report = await this.generateCashFlowReport(transactions, params);
                    break;
                case 'monthly_summary':
                    report = await this.generateMonthlySummary(transactions, params);
                    break;
                case 'yearly_summary':
                    report = await this.generateYearlySummary(transactions, params);
                    break;
                case 'category_analysis':
                    report = await this.generateCategoryAnalysis(transactions, params);
                    break;
                default:
                    return {
                        success: false,
                        message: `不支持的报表类型: ${reportType}`,
                    };
            }

            // 显示报表
            this.displayReport(report);

            return {
                success: true,
                message: `报表生成成功: ${report.title}`,
                data: report,
            };
        } catch (error) {
            return {
                success: false,
                message: `报表生成失败: ${error}`,
            };
        }
    }

    private async generateIncomeExpenseReport(transactions: any[], params: Record<string, any>) {
        const { startDate, endDate } = this.parseDateRange(params, 12); // 默认12个月

        return ReportGenerator.generateIncomeExpenseReport(
            transactions,
            startDate,
            endDate
        );
    }

    private async generateBalanceSheet(transactions: any[], params: Record<string, any>) {
        const reportDate = params['date'] ? new Date(params['date']) : new Date();

        return ReportGenerator.generateBalanceSheet(transactions, reportDate);
    }

    private async generateCashFlowReport(transactions: any[], params: Record<string, any>) {
        const { startDate, endDate } = this.parseDateRange(params, 12);

        return ReportGenerator.generateCashFlowReport(
            transactions,
            startDate,
            endDate
        );
    }

    private async generateMonthlySummary(transactions: any[], params: Record<string, any>) {
        const year = params['year'] || new Date().getFullYear();
        const month = params['month'];

        return ReportGenerator.generateMonthlySummary(transactions, year, month);
    }

    private async generateYearlySummary(transactions: any[], params: Record<string, any>) {
        const startYear = params['startYear'] || new Date().getFullYear();
        const endYear = params['endYear'];

        return ReportGenerator.generateYearlySummary(transactions, startYear, endYear);
    }

    private async generateCategoryAnalysis(transactions: any[], params: Record<string, any>) {
        const { startDate, endDate } = this.parseDateRange(params, 12);
        const categoryType = params['categoryType'] || 'all';

        return ReportGenerator.generateCategoryAnalysis(
            transactions,
            startDate,
            endDate,
            categoryType
        );
    }

    private parseDateRange(params: Record<string, any>, defaultMonths: number) {
        let startDate: Date;
        let endDate: Date = new Date();

        if (params['startDate'] && params['endDate']) {
            startDate = new Date(params['startDate']);
            endDate = new Date(params['endDate']);
        } else if (params['months']) {
            const months = parseInt(params['months']);
            startDate = subMonths(new Date(), months);
        } else {
            startDate = subMonths(new Date(), defaultMonths);
        }

        return { startDate, endDate };
    }

    private displayReport(report: any) {
        UIEnhancer.showMessageBox(
            `报表生成时间: ${format(report.generatedAt, 'yyyy-MM-dd HH:mm:ss')}`,
            report.title,
            'info'
        );

        switch (report.type) {
            case 'income_expense':
                this.displayIncomeExpenseReport(report);
                break;
            case 'balance_sheet':
                this.displayBalanceSheet(report);
                break;
            case 'cash_flow':
                this.displayCashFlowReport(report);
                break;
            case 'monthly_summary':
                this.displayMonthlySummary(report);
                break;
            case 'yearly_summary':
                this.displayYearlySummary(report);
                break;
            case 'category_analysis':
                this.displayCategoryAnalysis(report);
                break;
        }
    }

    private displayIncomeExpenseReport(report: any) {
        const data = report.data;
        const summary = data.summary;

        console.log('\n📊 收入支出汇总:');
        UIEnhancer.showStatCard('总收入', UIEnhancer.formatAmount(summary.totalIncome), '', 0);
        UIEnhancer.showStatCard('总支出', UIEnhancer.formatAmount(summary.totalExpenses), '', 0);
        UIEnhancer.showStatCard('净收入', UIEnhancer.formatAmount(summary.netIncome), '', summary.netIncome > 0 ? 1 : -1);

        if (data.incomeCategories?.length > 0) {
            console.log('\n💰 收入分类:');
            const tableData = data.incomeCategories.map((cat: any) => [
                cat.category,
                UIEnhancer.formatAmount(cat.amount),
                `${cat.percentage.toFixed(1)}%`,
            ]);
            UIEnhancer.showPaginatedTable(tableData, ['分类', '金额', '占比'], { currentPage: 1, pageSize: 10, totalRecords: data.incomeCategories.length, totalPages: 1, hasNext: false, hasPrev: false });
        }

        if (data.expenseCategories?.length > 0) {
            console.log('\n💸 支出分类:');
            const tableData = data.expenseCategories.map((cat: any) => [
                cat.category,
                UIEnhancer.formatAmount(cat.amount),
                `${cat.percentage.toFixed(1)}%`,
            ]);
            UIEnhancer.showPaginatedTable(tableData, ['分类', '金额', '占比'], { currentPage: 1, pageSize: 10, totalRecords: data.expenseCategories.length, totalPages: 1, hasNext: false, hasPrev: false });
        }
    }

    private displayBalanceSheet(report: any) {
        const data = report.data;

        console.log('\n📋 资产负债表:');
        console.log(`报告日期: ${format(data.reportDate, 'yyyy-MM-dd')}`);

        UIEnhancer.showStatCard('总资产', UIEnhancer.formatAmount(data.totalAssets), '', 0);
        UIEnhancer.showStatCard('总负债', UIEnhancer.formatAmount(data.totalLiabilities), '', 0);
        UIEnhancer.showStatCard('净资产', UIEnhancer.formatAmount(data.netWorth), '', data.netWorth > 0 ? 1 : -1);

        if (Object.keys(data.assets).length > 0) {
            console.log('\n💼 资产明细:');
            const tableData = Object.entries(data.assets).map(([account, amount]: [string, any]) => [
                account,
                UIEnhancer.formatAmount(amount),
            ]);
            UIEnhancer.showPaginatedTable(tableData, ['账户', '余额'], { currentPage: 1, pageSize: 10, totalRecords: tableData.length, totalPages: 1, hasNext: false, hasPrev: false });
        }

        if (Object.keys(data.liabilities).length > 0) {
            console.log('\n💳 负债明细:');
            const tableData = Object.entries(data.liabilities).map(([account, amount]: [string, any]) => [
                account,
                UIEnhancer.formatAmount(amount),
            ]);
            UIEnhancer.showPaginatedTable(tableData, ['账户', '余额'], { currentPage: 1, pageSize: 10, totalRecords: tableData.length, totalPages: 1, hasNext: false, hasPrev: false });
        }
    }

    private displayCashFlowReport(report: any) {
        const data = report.data;

        console.log('\n💱 现金流量表:');
        console.log(`期间: ${data.period}`);

        UIEnhancer.showStatCard('期初余额', UIEnhancer.formatAmount(data.openingBalance.number), data.openingBalance.currency, 0);
        UIEnhancer.showStatCard('现金流入', UIEnhancer.formatAmount(data.cashInflow.number), data.cashInflow.currency, 1);
        UIEnhancer.showStatCard('现金流出', UIEnhancer.formatAmount(data.cashOutflow.number), data.cashOutflow.currency, -1);
        UIEnhancer.showStatCard('期末余额', UIEnhancer.formatAmount(data.closingBalance.number), data.closingBalance.currency, 0);
        UIEnhancer.showStatCard('净现金流', UIEnhancer.formatAmount(data.netCashFlow.number), data.netCashFlow.currency, data.netCashFlow.number > 0 ? 1 : -1);

        if (data.categories?.length > 0) {
            console.log('\n📊 分类明细:');
            const tableData = data.categories.map((cat: any) => [
                cat.category,
                UIEnhancer.formatAmount(cat.totalAmount.number),
                cat.transactionCount,
                `${cat.percentage.toFixed(1)}%`,
            ]);
            UIEnhancer.showPaginatedTable(tableData, ['分类', '金额', '交易数', '占比'], { currentPage: 1, pageSize: 10, totalRecords: data.categories.length, totalPages: 1, hasNext: false, hasPrev: false });
        }
    }

    private displayMonthlySummary(report: any) {
        const data = report.data;

        if (Array.isArray(data)) {
            // 年度月度汇总
            console.log('\n📅 月度汇总:');
            const tableData = data.map((month: any) => [
                `${month.year}-${month.month.toString().padStart(2, '0')}`,
                UIEnhancer.formatAmount(month.totalIncome.number),
                UIEnhancer.formatAmount(month.totalExpenses.number),
                UIEnhancer.formatAmount(month.netIncome.number),
                month.transactionCount,
            ]);
            UIEnhancer.showPaginatedTable(tableData, ['月份', '收入', '支出', '净收入', '交易数'], { currentPage: 1, pageSize: 12, totalRecords: data.length, totalPages: 1, hasNext: false, hasPrev: false });
        } else {
            // 单月汇总
            console.log('\n📅 月度汇总:');
            UIEnhancer.showStatCard('收入', UIEnhancer.formatAmount(data.totalIncome.number), data.totalIncome.currency, 0);
            UIEnhancer.showStatCard('支出', UIEnhancer.formatAmount(data.totalExpenses.number), data.totalExpenses.currency, 0);
            UIEnhancer.showStatCard('净收入', UIEnhancer.formatAmount(data.netIncome.number), data.netIncome.currency, data.netIncome.number > 0 ? 1 : -1);
            UIEnhancer.showStatCard('交易数', data.transactionCount, '笔', 0);
        }
    }

    private displayYearlySummary(report: any) {
        const data = report.data;

        if (Array.isArray(data)) {
            // 多年汇总
            console.log('\n📅 年度汇总:');
            const tableData = data.map((year: any) => [
                year.year.toString(),
                UIEnhancer.formatAmount(year.totalIncome.number),
                UIEnhancer.formatAmount(year.totalExpenses.number),
                UIEnhancer.formatAmount(year.netIncome.number),
                year.transactionCount,
            ]);
            UIEnhancer.showPaginatedTable(tableData, ['年份', '收入', '支出', '净收入', '交易数'], { currentPage: 1, pageSize: 10, totalRecords: data.length, totalPages: 1, hasNext: false, hasPrev: false });
        } else {
            // 单年汇总
            console.log('\n📅 年度汇总:');
            UIEnhancer.showStatCard('收入', UIEnhancer.formatAmount(data.totalIncome.number), data.totalIncome.currency, 0);
            UIEnhancer.showStatCard('支出', UIEnhancer.formatAmount(data.totalExpenses.number), data.totalExpenses.currency, 0);
            UIEnhancer.showStatCard('净收入', UIEnhancer.formatAmount(data.netIncome.number), data.netIncome.currency, data.netIncome.number > 0 ? 1 : -1);
            UIEnhancer.showStatCard('交易数', data.transactionCount, '笔', 0);
        }
    }

    private displayCategoryAnalysis(report: any) {
        const data = report.data;

        console.log('\n📊 分类分析:');
        const tableData = data.map((cat: any) => [
            cat.category,
            UIEnhancer.formatAmount(cat.totalAmount.number),
            cat.transactionCount,
            UIEnhancer.formatAmount(cat.averageAmount.number),
            `${cat.percentage.toFixed(1)}%`,
        ]);
        UIEnhancer.showPaginatedTable(tableData, ['分类', '总金额', '交易数', '平均金额', '占比'], { currentPage: 1, pageSize: 10, totalRecords: data.length, totalPages: Math.ceil(data.length / 10), hasNext: data.length > 10, hasPrev: false });
    }

    getHelp(): string {
        return `
生成财务报表

用法: /report <报表类型> [选项]

支持的报表类型:
  income_expense     收入支出报表
  balance_sheet      资产负债表
  cash_flow          现金流量表
  monthly_summary    月度汇总报表
  yearly_summary     年度汇总报表
  category_analysis  分类分析报表

通用选项:
  startDate=<开始日期>     开始日期 (YYYY-MM-DD)
  endDate=<结束日期>       结束日期 (YYYY-MM-DD)
  months=<月数>           最近几个月 (默认: 12)

月度汇总选项:
  year=<年份>             指定年份 (默认: 当前年)
  month=<月份>            指定月份 (1-12)

年度汇总选项:
  startYear=<开始年份>     开始年份 (默认: 当前年)
  endYear=<结束年份>       结束年份

分类分析选项:
  categoryType=<类型>     分类类型 (income|expense|all)

示例:
  /report income_expense
  /report balance_sheet
  /report cash_flow months=6
  /report monthly_summary year=2024
  /report yearly_summary startYear=2020 endYear=2024
  /report category_analysis startDate=2024-01-01 endDate=2024-12-31
    `;
    }
}
