/**
 * 列出所有账户命令
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { CLIRenderer } from '../presentation/cli/cli-renderer';

export class ListAccountsCommand extends BaseCommand {
  constructor(engine: BeancountEngine) {
    super(engine);
  }

  /**
   * 执行列出账户命令
   *
   * @param _params 命令参数
   * @returns 执行结果
   */
  execute(_params: Record<string, any>): import('../types').CommandResult {
    try {
      const accounts = this.engine?.getAccounts() || [];

      if (accounts.length === 0) {
        return this.createSuccessResult('📋 没有找到账户信息');
      }

      // 使用CLIRenderer显示账户列表
      CLIRenderer.showAccountList(accounts);

      return this.createSuccessResult(`成功显示 ${accounts.length} 个账户`, accounts);
    } catch (error) {
      return this.createErrorResult(`列出账户失败: ${error}`);
    }
  }



  /**
   * 获取命令帮助信息
   *
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
📋 列出所有账户
用法: /list_accounts

功能: 显示所有已定义的账户，按类型分组显示

示例:
/list_accounts
    `;
  }
}
