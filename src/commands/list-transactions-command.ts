/**
 * 列出交易记录命令
 * 
 * 作者: JanYork
 */

import { parse, format } from 'date-fns';
import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';

export class ListTransactionsCommand extends BaseCommand {
  private engine: BeancountEngine;

  constructor(engine: BeancountEngine) {
    super();
    this.engine = engine;
  }

  /**
   * 执行列出交易记录命令
   * 
   * @param params 命令参数
   * @returns 执行结果
   */
  execute(params: Record<string, any>): import('../types').CommandResult {
    try {
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      // 解析日期范围
      if (params['start_date']) {
        try {
          startDate = parse(params['start_date'] as string, 'yyyy-MM-dd', new Date());
          if (isNaN(startDate.getTime())) {
            return this.createErrorResult('开始日期格式错误');
          }
        } catch (error) {
          return this.createErrorResult('开始日期格式错误');
        }
      }

      if (params['end_date']) {
        try {
          endDate = parse(params['end_date'] as string, 'yyyy-MM-dd', new Date());
          if (isNaN(endDate.getTime())) {
            return this.createErrorResult('结束日期格式错误');
          }
        } catch (error) {
          return this.createErrorResult('结束日期格式错误');
        }
      }

      // 获取交易记录
      const transactions = this.engine.getTransactions(startDate, endDate);

      if (transactions.length === 0) {
        return this.createSuccessResult('📝 没有找到交易记录');
      }

      // 格式化输出
      let result = `📝 找到 ${transactions.length} 条交易记录:\n\n`;

      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        if (transaction) {
          const dateStr = format(transaction.date, 'yyyy-MM-dd');
          result += `${i + 1}. ${dateStr} - ${transaction.narration}\n`;
          
          if (transaction.payee) {
            result += `   收款人: ${transaction.payee}\n`;
          }

          for (const posting of transaction.postings) {
            if (posting.units) {
              const amount = posting.units.number;
              const currency = posting.units.currency;
              const sign = amount >= 0 ? '' : '';
              result += `   ${posting.account}: ${sign}${amount} ${currency}\n`;
            }
          }

          if (transaction.tags.length > 0) {
            result += `   标签: ${transaction.tags.join(', ')}\n`;
          }

          result += '\n';
        }
      }

      return this.createSuccessResult(result, transactions);
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
用法: /list_transactions [start_date=2024-01-01] [end_date=2024-01-31]

参数:
- start_date: 开始日期 (YYYY-MM-DD, 可选)
- end_date: 结束日期 (YYYY-MM-DD, 可选)

示例:
/list_transactions
/list_transactions start_date=2024-01-01
/list_transactions start_date=2024-01-01 end_date=2024-01-31
    `;
  }
} 