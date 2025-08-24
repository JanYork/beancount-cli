/**
 * 删除交易记录命令
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { InteractiveCommandHandler } from '../presentation/cli/interactive-command-handler';

export class DeleteTransactionCommand extends BaseCommand {
  constructor(engine: BeancountEngine) {
    super(engine);
  }

  /**
   * 执行删除交易记录命令
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
      const confirm = params['confirm'] as boolean;

      // 验证必需参数
      if (!transactionId) {
        return this.createErrorResult('缺少必需参数: id。请提供要删除的交易ID，或使用 interactive=true 进行交互式输入');
      }

      // 如果没有确认，返回错误
      if (!confirm) {
        return this.createErrorResult('删除操作需要确认。请使用 interactive=true 进行交互式确认');
      }

      // 获取所有交易
      const transactions = this.engine?.getTransactions() || [];
      
      // 查找要删除的交易
      const transactionIndex = transactions.findIndex((tx: any) => tx.id === transactionId);
      
      if (transactionIndex === -1) {
        return this.createErrorResult(`未找到ID为 ${transactionId} 的交易记录`);
      }

      const transactionToDelete = transactions[transactionIndex];
      if (!transactionToDelete) {
        return this.createErrorResult(`未找到ID为 ${transactionId} 的交易记录`);
      }

      // 删除交易记录
      const success = this.engine?.deleteTransaction(transactionToDelete.date, transactionToDelete.narration);
      
      if (!success) {
        return this.createErrorResult(`删除交易记录失败: 未找到对应的交易记录`);
      }

      return this.createSuccessResult(`✅ 交易记录 ${transactionId} 删除成功`);
    } catch (error) {
      return this.createErrorResult(`删除交易记录失败: ${error}`);
    }
  }

  /**
   * 执行交互式删除交易记录
   */
  private async executeInteractive(): Promise<import('../types').CommandResult> {
    try {
      // 使用交互式处理器收集参数
      const interactiveParams = await InteractiveCommandHandler.handleDeleteTransaction();
      
      // 递归调用 execute 方法，传入收集到的参数
      return await this.execute(interactiveParams);
    } catch (error) {
      return this.createErrorResult(`交互式删除交易记录失败: ${error}`);
    }
  }

  /**
   * 获取命令帮助信息
   *
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
🗑️ 删除交易记录
用法: delete_transaction [参数] 或 delete_transaction interactive=true

参数:
- id: 交易记录ID
- confirm: 确认删除 (true/false)
- interactive: 是否使用交互式输入 (true/false)

示例:
delete_transaction id=1 confirm=true
delete_transaction interactive=true
    `;
  }
}
