/**
 * 搜索命令
 * 支持强大的搜索和分页功能
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { CommandResult } from '../types';
import { SearchPaginationUtil } from '../utils/search-pagination';
import { UIEnhancer } from '../utils/ui-enhancer';
import { BeancountEngine } from '../engine/beancount-engine';
import { format } from 'date-fns';

export class SearchCommand extends BaseCommand {
    constructor(engine: BeancountEngine) {
        super(engine);
    }

    async execute(params: Record<string, any>): Promise<CommandResult> {
        try {
            // 解析搜索选项
            const searchOptions = SearchPaginationUtil.parseSearchOptions(params);

            // 验证搜索选项
            const validation = SearchPaginationUtil.validateSearchOptions(searchOptions);
            if (!validation.valid) {
                return {
                    success: false,
                    message: `搜索参数验证失败:\n${validation.errors.join('\n')}`,
                };
            }

            // 解析分页参数
            const { page, pageSize } = SearchPaginationUtil.parsePaginationParams(params);

            // 获取所有交易
            const allTransactions = this.engine?.getTransactions() || [];

            // 执行搜索
            const filteredTransactions = SearchPaginationUtil.searchTransactions(
                allTransactions,
                searchOptions
            );

            // 分页
            const { data: paginatedTransactions, pagination } = SearchPaginationUtil.paginateData(
                filteredTransactions,
                page,
                pageSize
            );

            // 生成搜索摘要
            const summary = SearchPaginationUtil.generateSearchSummary(
                filteredTransactions,
                searchOptions
            );

            // 显示搜索过滤器
            UIEnhancer.showSearchFilters(searchOptions);

            // 显示搜索摘要
            console.log(`\n📊 搜索结果摘要:`);
            console.log(`   总交易数: ${summary.totalTransactions}`);
            console.log(`   总金额: ${UIEnhancer.formatAmount(summary.totalAmount.number, summary.totalAmount.currency)}`);
            if (summary.dateRange.start && summary.dateRange.end) {
                console.log(`   日期范围: ${format(summary.dateRange.start, 'yyyy-MM-dd')} 至 ${format(summary.dateRange.end, 'yyyy-MM-dd')}`);
            }
            console.log(`   涉及账户: ${summary.accounts.length} 个`);
            console.log(`   涉及标签: ${summary.tags.length} 个`);

            // 显示交易列表
            if (paginatedTransactions.length > 0) {
                const tableData = paginatedTransactions.map(tx => [
                    format(new Date(tx.date), 'yyyy-MM-dd'),
                    tx.payee || '-',
                    tx.narration.length > 30 ? tx.narration.substring(0, 30) + '...' : tx.narration,
                    UIEnhancer.formatAmount(SearchPaginationUtil.calculateTransactionAmount(tx)),
                    tx.postings.map(p => p.account).join('; '),
                    tx.tags.join(', ') || '-',
                ]);

                const headers = ['日期', '收款人/付款人', '描述', '金额', '账户', '标签'];

                UIEnhancer.showPaginatedTable(
                    tableData,
                    headers,
                    pagination,
                    '搜索结果'
                );
            } else {
                UIEnhancer.showInfo('没有找到匹配的交易记录');
            }

            return {
                success: true,
                message: `搜索完成，找到 ${summary.totalTransactions} 条交易记录`,
                data: {
                    transactions: paginatedTransactions,
                    summary,
                    searchOptions,
                },
                pagination,
            };
        } catch (error) {
            return {
                success: false,
                message: `搜索失败: ${error}`,
            };
        }
    }

    getHelp(): string {
        return `
搜索交易记录

用法: /search [选项]

选项:
  query=<关键词>          搜索关键词（描述、收款人、标签、账户等）
  startDate=<开始日期>     开始日期 (YYYY-MM-DD)
  endDate=<结束日期>       结束日期 (YYYY-MM-DD)
  accounts=<账户列表>      账户过滤，多个账户用逗号分隔
  tags=<标签列表>         标签过滤，多个标签用逗号分隔
  amountRange.min=<最小金额>  最小金额
  amountRange.max=<最大金额>  最大金额
  amountRange.currency=<货币> 货币类型
  sortBy=<排序字段>        排序字段 (date|amount|narration|payee)
  sortOrder=<排序方向>     排序方向 (asc|desc)
  page=<页码>             页码 (默认: 1)
  pageSize=<每页大小>      每页大小 (默认: 20)

示例:
  /search query=购物
  /search startDate=2024-01-01 endDate=2024-12-31
  /search accounts=Assets:Bank,Expenses:Food
  /search amountRange.min=100 amountRange.max=1000
  /search sortBy=date sortOrder=desc page=2 pageSize=10
    `;
    }
}
