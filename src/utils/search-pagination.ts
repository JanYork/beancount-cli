/**
 * 搜索和分页工具类
 * 提供强大的搜索和分页功能
 *
 * 作者: JanYork
 */

import { Transaction, SearchOptions, PaginationInfo, Amount } from '../types';
import { format, isWithinInterval } from 'date-fns';

export class SearchPaginationUtil {
    /**
     * 搜索交易记录
     */
    static searchTransactions(
        transactions: Transaction[],
        options: SearchOptions
    ): Transaction[] {
        let filtered = [...transactions];

        // 关键词搜索
        if (options.query) {
            const query = options.query.toLowerCase();
            filtered = filtered.filter(tx => {
                return (
                    tx.narration.toLowerCase().includes(query) ||
                    (tx.payee && tx.payee.toLowerCase().includes(query)) ||
                    tx.tags.some(tag => tag.toLowerCase().includes(query)) ||
                    tx.links.some(link => link.toLowerCase().includes(query)) ||
                    tx.postings.some(posting =>
                        posting.account.toLowerCase().includes(query)
                    )
                );
            });
        }

        // 日期范围过滤
        if (options.startDate || options.endDate) {
            filtered = filtered.filter(tx => {
                const txDate = new Date(tx.date);

                if (options.startDate && options.endDate) {
                    return isWithinInterval(txDate, {
                        start: options.startDate,
                        end: options.endDate,
                    });
                } else if (options.startDate) {
                    return txDate >= options.startDate;
                } else if (options.endDate) {
                    return txDate <= options.endDate;
                }

                return true;
            });
        }

        // 账户过滤
        if (options.accounts && options.accounts.length > 0) {
            filtered = filtered.filter(tx =>
                tx.postings.some(posting =>
                    options.accounts!.some(account =>
                        posting.account.includes(account)
                    )
                )
            );
        }

        // 标签过滤
        if (options.tags && options.tags.length > 0) {
            filtered = filtered.filter(tx =>
                options.tags!.some(tag =>
                    tx.tags.includes(tag)
                )
            );
        }

        // 金额范围过滤
        if (options.amountRange) {
            const { min, max, currency } = options.amountRange;
            filtered = filtered.filter(tx => {
                const totalAmount = this.calculateTransactionAmount(tx, currency);

                if (min !== undefined && totalAmount < min) return false;
                if (max !== undefined && totalAmount > max) return false;

                return true;
            });
        }

        // 排序
        if (options.sortBy) {
            filtered.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                switch (options.sortBy) {
                    case 'date':
                        aValue = new Date(a.date);
                        bValue = new Date(b.date);
                        break;
                    case 'amount':
                        aValue = this.calculateTransactionAmount(a);
                        bValue = this.calculateTransactionAmount(b);
                        break;
                    case 'narration':
                        aValue = a.narration;
                        bValue = b.narration;
                        break;
                    case 'payee':
                        aValue = a.payee || '';
                        bValue = b.payee || '';
                        break;
                    default:
                        aValue = a[options.sortBy as keyof Transaction];
                        bValue = b[options.sortBy as keyof Transaction];
                }

                if (options.sortOrder === 'desc') {
                    [aValue, bValue] = [bValue, aValue];
                }

                if (aValue < bValue) return -1;
                if (aValue > bValue) return 1;
                return 0;
            });
        }

        return filtered;
    }

    /**
     * 分页数据
     */
    static paginateData<T>(
        data: T[],
        page: number = 1,
        pageSize: number = 20
    ): { data: T[]; pagination: PaginationInfo } {
        const totalRecords = data.length;
        const totalPages = Math.ceil(totalRecords / pageSize);
        const currentPage = Math.max(1, Math.min(page, totalPages));
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        const paginatedData = data.slice(startIndex, endIndex);

        const pagination: PaginationInfo = {
            currentPage,
            pageSize,
            totalRecords,
            totalPages,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1,
        };

        return {
            data: paginatedData,
            pagination,
        };
    }

    /**
     * 计算交易总金额
     */
    static calculateTransactionAmount(tx: Transaction, currency?: string): number {
        let total = 0;

        for (const posting of tx.postings) {
            if (posting.units) {
                const amount = posting.units;
                if (!currency || amount.currency === currency) {
                    total += amount.number;
                }
            }
        }

        return Math.abs(total);
    }

    /**
     * 解析搜索选项
     */
    static parseSearchOptions(params: Record<string, any>): SearchOptions {
        const options: SearchOptions = {};

        if (params['query']) {
            options.query = params['query'];
        }

        if (params['startDate']) {
            options.startDate = new Date(params['startDate']);
        }

        if (params['endDate']) {
            options.endDate = new Date(params['endDate']);
        }

        if (params['accounts']) {
            options.accounts = Array.isArray(params['accounts'])
                ? params['accounts']
                : [params['accounts']];
        }

        if (params['tags']) {
            options.tags = Array.isArray(params['tags'])
                ? params['tags']
                : [params['tags']];
        }

        if (params['amountRange']) {
            options.amountRange = params['amountRange'];
        }

        if (params['sortBy']) {
            options.sortBy = params['sortBy'];
        }

        if (params['sortOrder']) {
            options.sortOrder = params['sortOrder'];
        }

        return options;
    }

    /**
     * 解析分页参数
     */
    static parsePaginationParams(params: Record<string, any>): {
        page: number;
        pageSize: number;
    } {
        return {
            page: parseInt(params['page']) || 1,
            pageSize: parseInt(params['pageSize']) || 20,
        };
    }

    /**
     * 生成搜索摘要
     */
    static generateSearchSummary(
        transactions: Transaction[],
        _options: SearchOptions
    ): {
        totalTransactions: number;
        totalAmount: Amount;
        dateRange: { start?: Date; end?: Date };
        accounts: string[];
        tags: string[];
    } {
        const totalTransactions = transactions.length;

        // 计算总金额
        let totalAmount = 0;
        const currencies = new Set<string>();

        for (const tx of transactions) {
            for (const posting of tx.postings) {
                if (posting.units) {
                    totalAmount += Math.abs(posting.units.number);
                    currencies.add(posting.units.currency);
                }
            }
        }

        // 获取日期范围
        const dates = transactions.map(tx => new Date(tx.date)).sort();
        const dateRange = {
            start: dates.length > 0 ? dates[0] : undefined,
            end: dates.length > 0 ? dates[dates.length - 1] : undefined,
        };

        // 获取涉及的账户
        const accounts = new Set<string>();
        for (const tx of transactions) {
            for (const posting of tx.postings) {
                accounts.add(posting.account);
            }
        }

        // 获取涉及的标签
        const tags = new Set<string>();
        for (const tx of transactions) {
            for (const tag of tx.tags) {
                tags.add(tag);
            }
        }

        return {
            totalTransactions,
            totalAmount: {
                number: totalAmount,
                currency: currencies.size === 1 ? Array.from(currencies)[0] || 'CNY' : 'MIXED',
            },
            dateRange: {
                start: dateRange.start || undefined,
                end: dateRange.end || undefined,
            } as { start?: Date; end?: Date },
            accounts: Array.from(accounts).sort(),
            tags: Array.from(tags).sort(),
        };
    }

    /**
     * 格式化搜索条件显示
     */
    static formatSearchConditions(options: SearchOptions): string[] {
        const conditions: string[] = [];

        if (options.query) {
            conditions.push(`关键词: "${options.query}"`);
        }

        if (options.startDate || options.endDate) {
            const start = options.startDate ? format(options.startDate, 'yyyy-MM-dd') : '不限';
            const end = options.endDate ? format(options.endDate, 'yyyy-MM-dd') : '不限';
            conditions.push(`日期: ${start} 至 ${end}`);
        }

        if (options.accounts?.length) {
            conditions.push(`账户: ${options.accounts.join(', ')}`);
        }

        if (options.tags?.length) {
            conditions.push(`标签: ${options.tags.join(', ')}`);
        }

        if (options.amountRange) {
            const { min, max, currency } = options.amountRange;
            const range = [];
            if (min !== undefined) range.push(`≥ ${min} ${currency || ''}`);
            if (max !== undefined) range.push(`≤ ${max} ${currency || ''}`);
            if (range.length) {
                conditions.push(`金额: ${range.join(' 且 ')}`);
            }
        }

        if (options.sortBy) {
            const order = options.sortOrder === 'desc' ? '降序' : '升序';
            conditions.push(`排序: ${options.sortBy} ${order}`);
        }

        return conditions;
    }

    /**
     * 验证搜索选项
     */
    static validateSearchOptions(options: SearchOptions): {
        valid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (options.startDate && options.endDate && options.startDate > options.endDate) {
            errors.push('开始日期不能晚于结束日期');
        }

        if (options.amountRange) {
            const { min, max } = options.amountRange;
            if (min !== undefined && max !== undefined && min > max) {
                errors.push('最小金额不能大于最大金额');
            }
            if (min !== undefined && min < 0) {
                errors.push('最小金额不能为负数');
            }
            if (max !== undefined && max < 0) {
                errors.push('最大金额不能为负数');
            }
        }

        if (options.sortBy && !['date', 'amount', 'narration', 'payee'].includes(options.sortBy)) {
            errors.push('无效的排序字段');
        }

        if (options.sortOrder && !['asc', 'desc'].includes(options.sortOrder)) {
            errors.push('无效的排序方向');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * 生成搜索建议
     */
    static generateSearchSuggestions(
        transactions: Transaction[],
        partialQuery: string
    ): string[] {
        const suggestions = new Set<string>();

        for (const tx of transactions) {
            // 从描述中提取建议
            const words = tx.narration.toLowerCase().split(/\s+/);
            for (const word of words) {
                if (word.startsWith(partialQuery.toLowerCase()) && word.length > partialQuery.length) {
                    suggestions.add(word);
                }
            }

            // 从收款人中提取建议
            if (tx.payee) {
                const payeeWords = tx.payee.toLowerCase().split(/\s+/);
                for (const word of payeeWords) {
                    if (word.startsWith(partialQuery.toLowerCase()) && word.length > partialQuery.length) {
                        suggestions.add(word);
                    }
                }
            }

            // 从标签中提取建议
            for (const tag of tx.tags) {
                if (tag.toLowerCase().startsWith(partialQuery.toLowerCase()) && tag.length > partialQuery.length) {
                    suggestions.add(tag);
                }
            }

            // 从账户中提取建议
            for (const posting of tx.postings) {
                const accountParts = posting.account.toLowerCase().split(':');
                for (const part of accountParts) {
                    if (part.startsWith(partialQuery.toLowerCase()) && part.length > partialQuery.length) {
                        suggestions.add(part);
                    }
                }
            }
        }

        return Array.from(suggestions).slice(0, 10); // 限制建议数量
    }
}
