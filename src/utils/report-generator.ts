/**
 * 报表生成工具类
 * 提供各种财务报表功能
 *
 * 作者: JanYork
 */

import {
    Transaction,
    ReportData,
    // ReportType,
    MonthlySummary,
    YearlySummary,
    CashFlow,
    BalanceSheet,
    CategoryAnalysis,
    BudgetAnalysis,
    Amount
} from '../types';
import { format, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { SearchPaginationUtil } from './search-pagination';

export class ReportGenerator {
    /**
     * 生成收入支出报表
     */
    static generateIncomeExpenseReport(
        transactions: Transaction[],
        startDate: Date,
        endDate: Date
    ): ReportData {
        const filteredTransactions = SearchPaginationUtil.searchTransactions(transactions, {
            startDate,
            endDate,
        });

        let totalIncome = 0;
        let totalExpenses = 0;
        const incomeCategories: Record<string, number> = {};
        const expenseCategories: Record<string, number> = {};

        for (const tx of filteredTransactions) {
            const amount = SearchPaginationUtil.calculateTransactionAmount(tx);

            // 判断是收入还是支出
            const isIncome = tx.postings.some(posting =>
                posting.account.startsWith('Income:') || posting.account.startsWith('收入:')
            );

            if (isIncome) {
                totalIncome += amount;
                // 按账户分类统计收入
                for (const posting of tx.postings) {
                    if (posting.account.startsWith('Income:') || posting.account.startsWith('收入:')) {
                        const category = posting.account.split(':')[1] || '其他收入';
                        incomeCategories[category] = (incomeCategories[category] || 0) + amount;
                    }
                }
            } else {
                totalExpenses += amount;
                // 按账户分类统计支出
                for (const posting of tx.postings) {
                    if (posting.account.startsWith('Expenses:') || posting.account.startsWith('支出:')) {
                        const category = posting.account.split(':')[1] || '其他支出';
                        expenseCategories[category] = (expenseCategories[category] || 0) + amount;
                    }
                }
            }
        }

        const netIncome = totalIncome - totalExpenses;

        const data = {
            summary: {
                totalIncome,
                totalExpenses,
                netIncome,
                transactionCount: filteredTransactions.length,
            },
            incomeCategories: Object.entries(incomeCategories).map(([category, amount]) => ({
                category,
                amount,
                percentage: (amount / totalIncome) * 100,
            })),
            expenseCategories: Object.entries(expenseCategories).map(([category, amount]) => ({
                category,
                amount,
                percentage: (amount / totalExpenses) * 100,
            })),
        };

        return {
            title: `收入支出报表 (${format(startDate, 'yyyy-MM-dd')} 至 ${format(endDate, 'yyyy-MM-dd')})`,
            type: 'income_expense',
            data,
            generatedAt: new Date(),
            period: { start: startDate, end: endDate },
        };
    }

    /**
     * 生成资产负债表
     */
    static generateBalanceSheet(
        transactions: Transaction[],
        reportDate: Date = new Date()
    ): ReportData {
        const assets: Record<string, number> = {};
        const liabilities: Record<string, number> = {};
        const equity: Record<string, number> = {};

        // 计算各账户余额
        for (const tx of transactions) {
            if (new Date(tx.date) <= reportDate) {
                for (const posting of tx.postings) {
                    const account = posting.account;
                    const amount = posting.units?.number || 0;

                    if (account.startsWith('Assets:') || account.startsWith('资产:')) {
                        assets[account] = (assets[account] || 0) + amount;
                    } else if (account.startsWith('Liabilities:') || account.startsWith('负债:')) {
                        liabilities[account] = (liabilities[account] || 0) + amount;
                    } else if (account.startsWith('Equity:') || account.startsWith('权益:')) {
                        equity[account] = (equity[account] || 0) + amount;
                    }
                }
            }
        }

        const totalAssets = Object.values(assets).reduce((sum, amount) => sum + amount, 0);
        const totalLiabilities = Object.values(liabilities).reduce((sum, amount) => sum + amount, 0);
        // const totalEquity = Object.values(equity).reduce((sum, amount) => sum + amount, 0);
        const netWorth = totalAssets - totalLiabilities;

        const balanceSheet: BalanceSheet = {
            reportDate,
            assets,
            liabilities,
            equity,
            totalAssets,
            totalLiabilities,
            netWorth,
        };

        return {
            title: `资产负债表 (${format(reportDate, 'yyyy-MM-dd')})`,
            type: 'balance_sheet',
            data: balanceSheet,
            generatedAt: new Date(),
        };
    }

    /**
     * 生成现金流量表
     */
    static generateCashFlowReport(
        transactions: Transaction[],
        startDate: Date,
        endDate: Date
    ): ReportData {
        const filteredTransactions = SearchPaginationUtil.searchTransactions(transactions, {
            startDate,
            endDate,
        });

        // 计算期初和期末余额
        const openingBalance = this.calculateAccountBalance(transactions, startDate, 'Assets:');
        const closingBalance = this.calculateAccountBalance(transactions, endDate, 'Assets:');

        let cashInflow = 0;
        let cashOutflow = 0;
        const categories: Record<string, number> = {};

        for (const tx of filteredTransactions) {
            // const amount = SearchPaginationUtil.calculateTransactionAmount(tx);

            // 判断现金流向
            const isInflow = tx.postings.some(posting =>
                posting.account.startsWith('Assets:') && (posting.units?.number || 0) > 0
            );

            // 计算现金流入流出
            const amount = SearchPaginationUtil.calculateTransactionAmount(tx);
            if (isInflow) {
                cashInflow += amount;
            } else {
                cashOutflow += amount;
            }

            // 按分类统计
            for (const posting of tx.postings) {
                if (posting.account.includes(':')) {
                    const category = posting.account.split(':')[1] || '其他';
                    categories[category] = (categories[category] || 0) + (posting.units?.number || 0);
                }
            }
        }

        const netCashFlow = cashInflow - cashOutflow;

        const cashFlow: CashFlow = {
            period: `${format(startDate, 'yyyy-MM-dd')} 至 ${format(endDate, 'yyyy-MM-dd')}`,
            openingBalance: { number: openingBalance, currency: 'CNY' },
            closingBalance: { number: closingBalance, currency: 'CNY' },
            cashInflow: { number: cashInflow, currency: 'CNY' },
            cashOutflow: { number: cashOutflow, currency: 'CNY' },
            netCashFlow: { number: netCashFlow, currency: 'CNY' },
            categories: Object.entries(categories).map(([category, amount]) => ({
                category,
                totalAmount: { number: amount, currency: 'CNY' },
                transactionCount: 0, // 需要进一步计算
                averageAmount: { number: amount, currency: 'CNY' },
                maxAmount: { number: amount, currency: 'CNY' },
                minAmount: { number: amount, currency: 'CNY' },
                percentage: 0, // 需要进一步计算
            })),
        };

        return {
            title: `现金流量表 (${format(startDate, 'yyyy-MM-dd')} 至 ${format(endDate, 'yyyy-MM-dd')})`,
            type: 'cash_flow',
            data: cashFlow,
            generatedAt: new Date(),
            period: { start: startDate, end: endDate },
        };
    }

    /**
     * 生成月度汇总报表
     */
    static generateMonthlySummary(
        transactions: Transaction[],
        year: number,
        month?: number
    ): ReportData {
        const months = month
            ? [{ year, month }]
            : eachMonthOfInterval({ start: new Date(year, 0, 1), end: new Date(year, 11, 31) })
                .map(date => ({ year: date.getFullYear(), month: date.getMonth() + 1 }));

        const monthlyData: MonthlySummary[] = [];

        for (const { year: y, month: m } of months) {
            const startDate = new Date(y, m - 1, 1);
            const endDate = endOfMonth(startDate);

            const monthTransactions = SearchPaginationUtil.searchTransactions(transactions, {
                startDate,
                endDate,
            });

            let totalIncome = 0;
            let totalExpenses = 0;
            const balanceChanges: Record<string, number> = {};

            for (const tx of monthTransactions) {
                const amount = SearchPaginationUtil.calculateTransactionAmount(tx);

                const isIncome = tx.postings.some(posting =>
                    posting.account.startsWith('Income:') || posting.account.startsWith('收入:')
                );

                if (isIncome) {
                    totalIncome += amount;
                } else {
                    totalExpenses += amount;
                }

                // 记录账户余额变化
                for (const posting of tx.postings) {
                    const account = posting.account.split(':')[0];
                    if (account) {
                        balanceChanges[account] = (balanceChanges[account] || 0) + (posting.units?.number || 0);
                    }
                }
            }

            const netIncome = totalIncome - totalExpenses;

            monthlyData.push({
                year: y,
                month: m,
                totalIncome: { number: totalIncome, currency: 'CNY' },
                totalExpenses: { number: totalExpenses, currency: 'CNY' },
                netIncome: { number: netIncome, currency: 'CNY' },
                transactionCount: monthTransactions.length,
                balanceChanges: Object.entries(balanceChanges).reduce((acc, [account, amount]) => {
                    acc[account] = { number: amount, currency: 'CNY' };
                    return acc;
                }, {} as Record<string, Amount>),
            });
        }

        const data = month ? monthlyData[0] : monthlyData;

        return {
            title: month
                ? `${year}年${month}月汇总报表`
                : `${year}年月度汇总报表`,
            type: 'monthly_summary',
            data,
            generatedAt: new Date(),
        };
    }

    /**
     * 生成年度汇总报表
     */
    static generateYearlySummary(
        transactions: Transaction[],
        startYear: number,
        endYear?: number
    ): ReportData {
        const years = endYear
            ? Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
            : [startYear];

        const yearlyData: YearlySummary[] = [];

        for (const year of years) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);

            const yearTransactions = SearchPaginationUtil.searchTransactions(transactions, {
                startDate,
                endDate,
            });

            let totalIncome = 0;
            let totalExpenses = 0;
            const balanceChanges: Record<string, number> = {};

            for (const tx of yearTransactions) {
                const amount = SearchPaginationUtil.calculateTransactionAmount(tx);

                const isIncome = tx.postings.some(posting =>
                    posting.account.startsWith('Income:') || posting.account.startsWith('收入:')
                );

                if (isIncome) {
                    totalIncome += amount;
                } else {
                    totalExpenses += amount;
                }

                // 记录账户余额变化
                for (const posting of tx.postings) {
                    const account = posting.account.split(':')[0];
                    if (account) {
                        balanceChanges[account] = (balanceChanges[account] || 0) + (posting.units?.number || 0);
                    }
                }
            }

            const netIncome = totalIncome - totalExpenses;

            // 生成月度数据
            const monthlyData = this.generateMonthlySummary(transactions, year).data as MonthlySummary[];

            yearlyData.push({
                year,
                totalIncome: { number: totalIncome, currency: 'CNY' },
                totalExpenses: { number: totalExpenses, currency: 'CNY' },
                netIncome: { number: netIncome, currency: 'CNY' },
                transactionCount: yearTransactions.length,
                monthlyData,
                balanceChanges: Object.entries(balanceChanges).reduce((acc, [account, amount]) => {
                    acc[account] = { number: amount, currency: 'CNY' };
                    return acc;
                }, {} as Record<string, Amount>),
            });
        }

        const data = endYear ? yearlyData : yearlyData[0];

        return {
            title: endYear
                ? `${startYear}-${endYear}年度汇总报表`
                : `${startYear}年度汇总报表`,
            type: 'yearly_summary',
            data,
            generatedAt: new Date(),
        };
    }

    /**
     * 生成分类分析报表
     */
    static generateCategoryAnalysis(
        transactions: Transaction[],
        startDate: Date,
        endDate: Date,
        _categoryType: 'income' | 'expense' | 'all' = 'all'
    ): ReportData {
        const filteredTransactions = SearchPaginationUtil.searchTransactions(transactions, {
            startDate,
            endDate,
        });

        const categoryStats: Record<string, {
            totalAmount: number;
            transactionCount: number;
            amounts: number[];
        }> = {};

        for (const tx of filteredTransactions) {
            // const amount = SearchPaginationUtil.calculateTransactionAmount(tx);

            for (const posting of tx.postings) {
                if (posting.account.includes(':')) {
                    const category = posting.account.split(':')[1] || '其他';
                    const postingAmount = posting.units?.number || 0;

                    if (!categoryStats[category]) {
                        categoryStats[category] = {
                            totalAmount: 0,
                            transactionCount: 0,
                            amounts: [],
                        };
                    }

                    categoryStats[category].totalAmount += Math.abs(postingAmount);
                    categoryStats[category].transactionCount += 1;
                    categoryStats[category].amounts.push(Math.abs(postingAmount));
                }
            }
        }

        const totalAmount = Object.values(categoryStats).reduce((sum, stat) => sum + stat.totalAmount, 0);

        const categories: CategoryAnalysis[] = Object.entries(categoryStats).map(([category, stat]) => {
            const amounts = stat.amounts.sort((a, b) => a - b);
            const averageAmount = stat.totalAmount / stat.transactionCount;

            return {
                category,
                totalAmount: { number: stat.totalAmount, currency: 'CNY' },
                transactionCount: stat.transactionCount,
                averageAmount: { number: averageAmount, currency: 'CNY' },
                maxAmount: { number: amounts[amounts.length - 1] || 0, currency: 'CNY' },
                minAmount: { number: amounts[0] || 0, currency: 'CNY' },
                percentage: (stat.totalAmount / totalAmount) * 100,
            };
        });

        // 按总金额排序
        categories.sort((a, b) => b.totalAmount.number - a.totalAmount.number);

        return {
            title: `分类分析报表 (${format(startDate, 'yyyy-MM-dd')} 至 ${format(endDate, 'yyyy-MM-dd')})`,
            type: 'category_analysis',
            data: categories,
            generatedAt: new Date(),
            period: { start: startDate, end: endDate },
        };
    }

    /**
     * 计算账户余额
     */
    private static calculateAccountBalance(
        transactions: Transaction[],
        date: Date,
        accountPrefix: string
    ): number {
        let balance = 0;

        for (const tx of transactions) {
            if (new Date(tx.date) <= date) {
                for (const posting of tx.postings) {
                    if (posting.account.startsWith(accountPrefix)) {
                        balance += posting.units?.number || 0;
                    }
                }
            }
        }

        return balance;
    }

    /**
     * 生成预算分析报表
     */
    static generateBudgetAnalysis(
        transactions: Transaction[],
        budgets: any[], // 这里需要定义Budget类型
        startDate: Date,
        endDate: Date
    ): ReportData {
        const filteredTransactions = SearchPaginationUtil.searchTransactions(transactions, {
            startDate,
            endDate,
        });

        const budgetAnalysis: BudgetAnalysis[] = [];

        for (const budget of budgets) {
            const accountTransactions = filteredTransactions.filter(tx =>
                tx.postings.some(posting => posting.account.includes(budget.account))
            );

            const actualAmount = accountTransactions.reduce((sum, tx) => {
                return sum + SearchPaginationUtil.calculateTransactionAmount(tx);
            }, 0);

            const budgetAmount = budget.amount.number;
            const remainingAmount = budgetAmount - actualAmount;
            const usagePercentage = (actualAmount / budgetAmount) * 100;
            const isOverBudget = actualAmount > budgetAmount;

            budgetAnalysis.push({
                account: budget.account,
                budgetAmount: { number: budgetAmount, currency: budget.amount.currency },
                actualAmount: { number: actualAmount, currency: budget.amount.currency },
                remainingAmount: { number: remainingAmount, currency: budget.amount.currency },
                usagePercentage,
                isOverBudget,
            });
        }

        return {
            title: `预算分析报表 (${format(startDate, 'yyyy-MM-dd')} 至 ${format(endDate, 'yyyy-MM-dd')})`,
            type: 'budget_analysis',
            data: budgetAnalysis,
            generatedAt: new Date(),
            period: { start: startDate, end: endDate },
        };
    }
}
