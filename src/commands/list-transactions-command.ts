/**
 * 列出交易记录命令
 *
 * 作者: JanYork
 */

import { format } from 'date-fns';
import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { UIEnhancer } from '../utils/ui-enhancer';
import { SearchPaginationUtil } from '../utils/search-pagination';

export class ListTransactionsCommand extends BaseCommand {
  constructor(engine: BeancountEngine) {
    super(engine);
  }

  /**
   * 执行列出交易记录命令
   *
   * @param params 命令参数
   * @returns 执行结果
   */
  async execute(params: Record<string, any>): Promise<import('../types').CommandResult> {
    try {
      // 解析搜索选项
      const searchOptions = SearchPaginationUtil.parseSearchOptions(params);

      // 解析分页参数
      const { page, pageSize } = SearchPaginationUtil.parsePaginationParams(params);

      // 获取所有交易
      const allTransactions = this.engine?.getTransactions() || [];

      // 执行搜索过滤
      const filteredTransactions = SearchPaginationUtil.searchTransactions(
        allTransactions,
        searchOptions
      );

      if (filteredTransactions.length === 0) {
        return this.createSuccessResult('📝 没有找到交易记录');
      }

      // 分页
      const { data: paginatedTransactions, pagination } = SearchPaginationUtil.paginateData(
        filteredTransactions,
        page,
        pageSize
      );

      // 显示搜索过滤器
      UIEnhancer.showSearchFilters(searchOptions);

      // 显示交易列表
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
        `交易记录 (共 ${filteredTransactions.length} 条)`
      );

      return this.createSuccessResult(
        `成功显示 ${paginatedTransactions.length} 条交易记录`,
        {
          transactions: paginatedTransactions,
          totalCount: filteredTransactions.length,
          pagination,
        }
      );
    } catch (error) {
      return this.createErrorResult(`列出交易记录失败: ${error}`);
    }
  }

  /**
   * 获取命令帮助信息
   *
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
📋 列出交易记录

用法: /list_transactions [选项]

选项:
  startDate=<开始日期>     开始日期 (YYYY-MM-DD)
  endDate=<结束日期>       结束日期 (YYYY-MM-DD)
  query=<关键词>          搜索关键词（描述、收款人、标签、账户等）
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
  /list_transactions
  /list_transactions startDate=2024-01-01 endDate=2024-12-31
  /list_transactions query=购物 page=2 pageSize=10
  /list_transactions accounts=Assets:Bank,Expenses:Food
  /list_transactions sortBy=date sortOrder=desc
    `;
  }
}
