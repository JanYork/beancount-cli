/**
 * 搜索命令
 * 支持多种搜索条件
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { InteractiveCommandHandler } from '../presentation/cli/interactive-command-handler';

export class SearchCommand extends BaseCommand {
  constructor(engine: BeancountEngine) {
    super(engine);
  }

  /**
   * 执行搜索命令
   *
   * @param params 命令参数
   * @returns 执行结果
   */
  async execute(params: Record<string, any>): Promise<import('../types').CommandResult> {
    try {
      // 检查是否需要交互式输入
      if (params['interactive'] === true || Object.keys(params).length === 0) {
        return await this.executeInteractive();
      }

      const query = params['query'] as string;
      const startDate = params['startDate'] as string;
      const endDate = params['endDate'] as string;
      const accounts = params['accounts'] as string;
      const amountMin = params['amountMin'] as string;
      const amountMax = params['amountMax'] as string;
      const tags = params['tags'] as string;

      // 如果没有提供任何搜索条件，返回所有交易
      if (!query && !startDate && !endDate && !accounts && !amountMin && !amountMax && !tags) {
        const transactions = this.engine?.getTransactions() || [];
        return this.createSuccessResult(
          `🔍 显示所有交易记录 (共 ${transactions.length} 条)`,
          transactions
        );
      }

      // 构建搜索条件
      const searchConditions: Record<string, any> = {};
      if (query) searchConditions['query'] = query;
      if (startDate) searchConditions['startDate'] = new Date(startDate);
      if (endDate) searchConditions['endDate'] = new Date(endDate);
      if (accounts) searchConditions['accounts'] = accounts.split(',');
      if (amountMin) searchConditions['amountMin'] = parseFloat(amountMin);
      if (amountMax) searchConditions['amountMax'] = parseFloat(amountMax);
      if (tags) searchConditions['tags'] = tags.split(',');

      // 执行搜索
      const transactions = this.engine?.getTransactions() || [];
      const searchResults = this.performSearch(transactions, searchConditions);

      if (searchResults.length === 0) {
        return this.createSuccessResult('🔍 没有找到匹配的交易记录');
      }

      return this.createSuccessResult(
        `🔍 找到 ${searchResults.length} 条匹配的交易记录`,
        searchResults
      );
    } catch (error) {
      return this.createErrorResult(`搜索失败: ${error}`);
    }
  }

  /**
   * 执行交互式搜索
   */
  private async executeInteractive(): Promise<import('../types').CommandResult> {
    try {
      // 使用交互式处理器收集参数
      const interactiveParams = await InteractiveCommandHandler.handleListTransactions();
      
      // 构建参数
      const params: Record<string, any> = {};
      
      if (interactiveParams.keyword) {
        params['query'] = interactiveParams.keyword;
      }
      
      if (interactiveParams.dateRange) {
        params['startDate'] = interactiveParams.dateRange.start;
        params['endDate'] = interactiveParams.dateRange.end;
      }
      
      if (interactiveParams.accounts && interactiveParams.accounts.length > 0) {
        params['accounts'] = interactiveParams.accounts.join(',');
      }
      
      if (interactiveParams.amountRange) {
        params['amountMin'] = interactiveParams.amountRange.min.toString();
        params['amountMax'] = interactiveParams.amountRange.max.toString();
      }
      
      // 递归调用 execute 方法，传入收集到的参数
      return await this.execute(params);
    } catch (error) {
      return this.createErrorResult(`交互式搜索失败: ${error}`);
    }
  }

  /**
   * 执行搜索
   */
  private performSearch(transactions: any[], conditions: Record<string, any>): any[] {
    return transactions.filter(transaction => {
      // 关键词搜索
      if (conditions['query']) {
        const query = conditions['query'].toLowerCase();
        const matchesQuery = 
          transaction.narration?.toLowerCase().includes(query) ||
          transaction.payee?.toLowerCase().includes(query) ||
          transaction.tags?.some((tag: string) => tag.toLowerCase().includes(query)) ||
          transaction.links?.some((link: string) => link.toLowerCase().includes(link));
        
        if (!matchesQuery) return false;
      }

      // 日期范围搜索
      if (conditions['startDate'] || conditions['endDate']) {
        const transactionDate = new Date(transaction.date);
        if (conditions['startDate'] && transactionDate < conditions['startDate']) return false;
        if (conditions['endDate'] && transactionDate > conditions['endDate']) return false;
      }

      // 账户搜索
      if (conditions['accounts'] && conditions['accounts'].length > 0) {
        const transactionAccounts = transaction.postings?.map((p: any) => p.account) || [];
        const hasMatchingAccount = conditions['accounts'].some((account: string) =>
          transactionAccounts.includes(account)
        );
        if (!hasMatchingAccount) return false;
      }

      // 金额范围搜索
      if (conditions['amountMin'] !== undefined || conditions['amountMax'] !== undefined) {
        const totalAmount = transaction.postings?.reduce((sum: number, p: any) => {
          return sum + (p.units?.number || 0);
        }, 0) || 0;
        
        if (conditions['amountMin'] !== undefined && totalAmount < conditions['amountMin']) return false;
        if (conditions['amountMax'] !== undefined && totalAmount > conditions['amountMax']) return false;
      }

      // 标签搜索
      if (conditions['tags'] && conditions['tags'].length > 0) {
        const hasMatchingTag = conditions['tags'].some((tag: string) =>
          transaction.tags?.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }

  /**
   * 获取命令帮助信息
   *
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
🔍 搜索交易记录
用法: search [参数] 或 search interactive=true

参数:
- query: 搜索关键词（描述、收款人、标签等）
- startDate: 开始日期 (YYYY-MM-DD)
- endDate: 结束日期 (YYYY-MM-DD)
- accounts: 账户列表（用逗号分隔）
- amountMin: 最小金额
- amountMax: 最大金额
- tags: 标签列表（用逗号分隔）
- interactive: 是否使用交互式输入 (true/false)

示例:
search query="午餐"
search startDate=2024-01-01 endDate=2024-12-31
search accounts="Assets:Cash,Expenses:Food"
search amountMin=10 amountMax=100
search interactive=true
    `;
  }
}
