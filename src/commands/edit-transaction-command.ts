/**
 * 编辑交易记录命令
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { InteractiveCommandHandler } from '../presentation/cli/interactive-command-handler';

export class EditTransactionCommand extends BaseCommand {
  constructor(engine: BeancountEngine) {
    super(engine);
  }

  /**
   * 执行编辑交易记录命令
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

      const transactionId = params['id'] as string;
      const date = params['date'] as string;
      const narration = params['narration'] as string;
      // const _amount = params['amount'] as string;
      // const _accounts = params['accounts'] as string[];

      // 验证必需参数
      if (!transactionId) {
        return this.createErrorResult('缺少必需参数: id。请提供要编辑的交易ID，或使用 interactive=true 进行交互式输入');
      }

      // 获取所有交易
      const transactions = this.engine?.getTransactions() || [];
      
      // 查找要编辑的交易
      const transactionIndex = transactions.findIndex((tx: any) => tx.id === transactionId);
      
      if (transactionIndex === -1) {
        return this.createErrorResult(`未找到ID为 ${transactionId} 的交易记录`);
      }

      // 更新交易记录
      const originalTransaction = transactions[transactionIndex];
      if (!originalTransaction) {
        return this.createErrorResult(`未找到ID为 ${transactionId} 的交易记录`);
      }

      const updatedTransaction = {
        ...originalTransaction,
        date: date ? new Date(date) : originalTransaction.date,
        narration: narration || originalTransaction.narration,
        postings: originalTransaction.postings || []
      };

      // 保存更新后的交易
      transactions[transactionIndex] = updatedTransaction;
      this.engine?.saveTransactions(transactions);

      return this.createSuccessResult('✅ 交易记录编辑成功', updatedTransaction);
    } catch (error) {
      return this.createErrorResult(`编辑交易记录失败: ${error}`);
    }
  }

  /**
   * 执行交互式编辑交易记录
   */
  private async executeInteractive(): Promise<import('../types').CommandResult> {
    try {
      // 使用交互式处理器收集参数
      const interactiveParams = await InteractiveCommandHandler.handleEditTransaction();
      
      // 递归调用 execute 方法，传入收集到的参数
      return await this.execute(interactiveParams);
    } catch (error) {
      return this.createErrorResult(`交互式编辑交易记录失败: ${error}`);
    }
  }

  /**
   * 获取命令帮助信息
   *
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
✏️ 编辑交易记录
用法: edit_transaction [参数] 或 edit_transaction interactive=true

参数:
- id: 交易记录ID
- date: 交易日期 (YYYY-MM-DD)
- narration: 交易描述
- amount: 交易金额
- accounts: 账户列表 (至少2个账户，用逗号分隔)
- interactive: 是否使用交互式输入 (true/false)

示例:
edit_transaction id=1 date=2024-01-01 narration="修改后的描述" amount=50.00
edit_transaction interactive=true
    `;
  }
}
