/**
 * 添加交易记录命令
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { InteractiveCommandHandler } from '../presentation/cli/interactive-command-handler';
import { Transaction } from '../types';

export class AddTransactionCommand extends BaseCommand {
  constructor(engine: BeancountEngine) {
    super(engine);
  }

  /**
   * 执行添加交易记录命令
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

      // 解析参数
      const date = params['date'] as string;
      const narration = params['narration'] as string;
      const amount = params['amount'] as string;
      const accounts = params['accounts'] as string[];

      // 验证必需参数
      if (!date || !narration || !amount || !accounts || accounts.length < 2) {
        return this.createErrorResult('缺少必需参数。请提供 date, narration, amount, accounts 参数，或使用 interactive=true 进行交互式输入');
      }

      // 创建交易记录
      const transaction: Transaction = {
        date: new Date(date),
        narration,
        postings: [
          {
            account: accounts[0] || '',
            units: {
              number: parseFloat(amount),
              currency: 'CNY'
            }
          },
          {
            account: accounts[1] || '',
            units: {
              number: -parseFloat(amount),
              currency: 'CNY'
            }
          }
        ],
        tags: [],
        links: []
      };

      // 添加交易记录
      this.engine?.addTransaction(transaction);

      return this.createSuccessResult('✅ 交易记录添加成功', transaction);
    } catch (error) {
      return this.createErrorResult(`添加交易记录失败: ${error}`);
    }
  }

  /**
   * 执行交互式添加交易记录
   */
  private async executeInteractive(): Promise<import('../types').CommandResult> {
    try {
      // 使用交互式处理器收集参数
      const interactiveParams = await InteractiveCommandHandler.handleAddTransaction();
      
      // 递归调用 execute 方法，传入收集到的参数
      return await this.execute(interactiveParams);
    } catch (error) {
      return this.createErrorResult(`交互式添加交易记录失败: ${error}`);
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
用法: add_transaction [参数] 或 add_transaction interactive=true

参数:
- date: 交易日期 (YYYY-MM-DD)
- narration: 交易描述
- amount: 交易金额
- accounts: 账户列表 (至少2个账户，用逗号分隔)
- interactive: 是否使用交互式输入 (true/false)

示例:
add_transaction date=2024-01-01 narration="午餐" amount=25.50 accounts="Expenses:Food,Assets:Cash"
add_transaction interactive=true
    `;
  }
}
