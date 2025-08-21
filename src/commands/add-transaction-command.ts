/**
 * 添加交易记录命令
 *
 * 作者: JanYork
 */

import { parse, format } from 'date-fns';
import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { Transaction, Posting } from '../types';
import chalk from 'chalk';

export class AddTransactionCommand extends BaseCommand {
  private engine: BeancountEngine;

  constructor(engine: BeancountEngine) {
    super();
    this.engine = engine;
  }

  /**
   * 执行添加交易记录命令
   *
   * @param params 命令参数
   * @returns 执行结果
   */
  execute(params: Record<string, any>): import('../types').CommandResult {
    try {
      // 验证参数
      const validation = this.validateParams(params);
      if (!validation.valid) {
        return this.createErrorResult(`参数验证失败: ${validation.errors.join(', ')}`);
      }

      const dateStr = params['date'] as string;
      const narration = params['narration'] as string;
      const payee = params['payee'] as string;
      const postingsData = params['postings'] as any[];

      // 解析日期
      let transactionDate: Date;
      try {
        transactionDate = parse(dateStr, 'yyyy-MM-dd', new Date());
        if (isNaN(transactionDate.getTime())) {
          return this.createErrorResult('日期格式错误，请使用 YYYY-MM-DD 格式');
        }
      } catch (error) {
        return this.createErrorResult('日期格式错误，请使用 YYYY-MM-DD 格式');
      }

      // 创建分录
      const postings: Posting[] = [];
      for (const postingData of postingsData) {
        const account = postingData.account as string;
        const amount = postingData.amount as number;
        const currency = (postingData.currency as string) || 'CNY';

        if (!account || amount === undefined) {
          continue;
        }

        const posting: Posting = {
          account,
          units: {
            number: amount,
            currency,
          },
        };
        postings.push(posting);
      }

      if (postings.length === 0) {
        return this.createErrorResult('至少需要一个分录');
      }

      // 创建交易记录
      const transaction: Transaction = {
        date: transactionDate,
        payee,
        narration,
        postings,
        tags: [],
        links: [],
        meta: {},
      };

      // 添加到引擎
      this.engine.addTransaction(transaction);

      // 格式化成功消息
      const formattedDate = format(transactionDate, 'yyyy-MM-dd');
      const totalAmount = postings.reduce((sum, p) => sum + (p.units?.number || 0), 0);
      const sign = totalAmount >= 0 ? '+' : '';
      const color = totalAmount >= 0 ? chalk.green : chalk.red;

      const result =
        `✅ 成功添加交易记录!\n\n` +
        `📅 日期: ${chalk.cyan(formattedDate)}\n` +
        `📝 描述: ${chalk.yellow(narration)}\n` +
        `💰 总金额: ${color(`${sign}${totalAmount} CNY`)}\n` +
        `📊 分录数量: ${chalk.blue(postings.length)}`;

      return this.createSuccessResult(result, transaction);
    } catch (error) {
      return this.createErrorResult(`添加交易记录失败: ${error}`);
    }
  }

  /**
   * 获取命令帮助信息
   *
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
📝 添加交易记录
用法: /add_transaction date=2024-01-01 narration="午餐" postings=[{"account":"Expenses:Food","amount":25},{"account":"Assets:Cash","amount":-25}]

参数:
- date: 交易日期 (YYYY-MM-DD)
- narration: 交易描述
- payee: 收款人/付款人 (可选)
- postings: 分录列表，每个分录包含account和amount

示例:
/add_transaction date=2024-01-01 narration="午餐" postings=[{"account":"Expenses:Food","amount":25},{"account":"Assets:Cash","amount":-25}]
    `;
  }

  /**
   * 验证参数
   *
   * @param params 参数
   * @returns 验证结果
   */
  protected override validateParams(params: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params['date']) {
      errors.push('缺少必要参数: 日期');
    }

    if (!params['narration']) {
      errors.push('缺少必要参数: 描述');
    }

    if (!params['postings'] || !Array.isArray(params['postings'])) {
      errors.push('缺少必要参数: 分录列表');
    }

    if (params['postings'] && Array.isArray(params['postings'])) {
      for (let i = 0; i < params['postings'].length; i++) {
        const posting = params['postings'][i];
        if (!posting.account) {
          errors.push(`分录 ${i + 1} 缺少账户名称`);
        }
        if (posting.amount === undefined) {
          errors.push(`分录 ${i + 1} 缺少金额`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
