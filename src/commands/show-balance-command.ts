/**
 * 显示余额命令
 *
 * 作者: JanYork
 */

import { parse } from 'date-fns';
import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { t } from '../utils/i18n';
import { CLIRenderer } from '../presentation/cli/cli-renderer';
import { InteractiveCommandHandler } from '../presentation/cli/interactive-command-handler';

export class ShowBalanceCommand extends BaseCommand {
  constructor(engine: BeancountEngine) {
    super(engine);
  }

  /**
   * 执行显示余额命令
   *
   * @param params 命令参数
   * @returns 执行结果
   */
  async execute(params: Record<string, any>): Promise<import('../types').CommandResult> {
    try {
      // 检查是否需要交互式输入
      if (params['interactive'] === true || Object.keys(params).length === 0) {
        return this.executeInteractive();
      }

      const account = params['account'] as string;
      const dateStr = params['date'] as string;

      let balanceDate: Date | undefined;
      if (dateStr) {
        try {
          balanceDate = parse(dateStr, 'yyyy-MM-dd', new Date());
          if (isNaN(balanceDate.getTime())) {
            return this.createErrorResult(t('balance.date.format.error'));
          }
        } catch (error) {
          return this.createErrorResult(t('balance.date.format.error'));
        }
      }

      // 获取余额
      const balances = this.engine?.getBalances(account, balanceDate) || [];

      if (balances.length === 0) {
        return this.createSuccessResult(t('balance.no.data'));
      }

      // 使用CLIRenderer显示余额信息
      CLIRenderer.showBalance(balances);

      return this.createSuccessResult(`成功显示 ${balances.length} 个账户余额`, balances);
    } catch (error) {
      return this.createErrorResult(`${t('balance.display.error')} ${error}`);
    }
  }

  /**
   * 执行交互式显示余额
   */
  private async executeInteractive(): Promise<import('../types').CommandResult> {
    try {
      // 使用交互式处理器收集参数
      const interactiveParams = await InteractiveCommandHandler.handleShowBalance();
      
      // 构建参数
      const params: Record<string, any> = {};
      
      if (interactiveParams.accounts && interactiveParams.accounts.length > 0) {
        params['account'] = interactiveParams.accounts.join(',');
      }
      
      if (interactiveParams.date && interactiveParams.date !== 'current') {
        params['date'] = interactiveParams.date;
      }
      
      // 递归调用 execute 方法，传入收集到的参数
      return await this.execute(params);
    } catch (error) {
      return this.createErrorResult(`交互式显示余额失败: ${error}`);
    }
  }

  /**
   * 获取命令帮助信息
   *
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
💰 显示账户余额
用法: show_balance [参数] 或 show_balance interactive=true

参数:
- account: 账户名称 (可选)
- date: 查询日期 (YYYY-MM-DD, 可选)
- interactive: 是否使用交互式输入 (true/false)

示例:
show_balance
show_balance account="Assets:Cash"
show_balance date=2024-01-01
show_balance account="Assets:Cash" date=2024-01-01
show_balance interactive=true
    `;
  }
}
