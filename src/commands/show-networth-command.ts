/**
 * 显示净资产命令
 * 
 * 作者: JanYork
 */

import { parse } from 'date-fns';
import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import chalk from 'chalk';

export class ShowNetworthCommand extends BaseCommand {
  private engine: BeancountEngine;

  constructor(engine: BeancountEngine) {
    super();
    this.engine = engine;
  }

  /**
   * 执行显示净资产命令
   * 
   * @param params 命令参数
   * @returns 执行结果
   */
  execute(params: Record<string, any>): import('../types').CommandResult {
    try {
      const dateStr = params['date'] as string;

      let balanceDate: Date | undefined;
      if (dateStr) {
        try {
          balanceDate = parse(dateStr, 'yyyy-MM-dd', new Date());
          if (isNaN(balanceDate.getTime())) {
            return this.createErrorResult('日期格式错误，请使用 YYYY-MM-DD 格式');
          }
        } catch (error) {
          return this.createErrorResult('日期格式错误，请使用 YYYY-MM-DD 格式');
        }
      }

      // 获取净资产信息
      const networth = this.engine.getNetWorth(balanceDate);

      if (!networth) {
        return this.createSuccessResult('💰 无法计算净资产信息');
      }

      // 格式化输出
      const totalAssets = networth['assets'] || 0;
      const totalLiabilities = networth['liabilities'] || 0;
      const netWorth = networth['netWorth'] || 0;

      let result = `💰 净资产报告\n\n`;
      
      result += `${chalk.green.bold('📈 资产:')} ${chalk.green(`+${totalAssets.toFixed(2)} CNY`)}\n`;
      result += `${chalk.red.bold('💳 负债:')} ${chalk.red(`-${totalLiabilities.toFixed(2)} CNY`)}\n`;
      result += `${chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n`;
      
      const netWorthColor = netWorth >= 0 ? chalk.green : chalk.red;
      const netWorthSign = netWorth >= 0 ? '+' : '';
      result += `${chalk.blue.bold('🏦 净资产:')} ${netWorthColor(`${netWorthSign}${netWorth.toFixed(2)} CNY`)}\n`;

      if (dateStr) {
        result += `\n${chalk.gray(`📅 报告日期: ${dateStr}`)}`;
      }

      return this.createSuccessResult(result, networth);
    } catch (error) {
      return this.createErrorResult(`显示净资产失败: ${error}`);
    }
  }

  /**
   * 获取命令帮助信息
   * 
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
💰 显示净资产
用法: /show_networth [date=2024-01-01]

参数:
- date: 查询日期 (YYYY-MM-DD, 可选)

功能: 显示指定日期的净资产情况，包括总资产、总负债和净资产

示例:
/show_networth
/show_networth date=2024-01-01
    `;
  }
} 