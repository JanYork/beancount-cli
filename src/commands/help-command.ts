/**
 * 帮助命令
 * 
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import chalk from 'chalk';

export class HelpCommand extends BaseCommand {
  /**
   * 执行帮助命令
   * 
   * @param params 命令参数
   * @returns 执行结果
   */
  execute(_params: Record<string, any>): import('../types').CommandResult {
    const helpText = `
🤖 Beancount CLI 帮助信息

${chalk.cyan.bold('📋 可用命令:')}

${chalk.green('/add_transaction')}    添加交易记录
   ${chalk.gray('用法:')} /add_transaction date=2024-01-01 narration="午餐" postings=[{"account":"Expenses:Food","amount":25},{"account":"Assets:Cash","amount":-25}]

${chalk.green('/list_transactions')}  列出交易记录
   ${chalk.gray('用法:')} /list_transactions [start_date=2024-01-01] [end_date=2024-01-31]

${chalk.green('/show_balance')}      显示账户余额
   ${chalk.gray('用法:')} /show_balance [account="Assets:Cash"] [date=2024-01-01]

${chalk.green('/show_networth')}     显示净资产
   ${chalk.gray('用法:')} /show_networth [date=2024-01-01]

${chalk.green('/list_accounts')}     列出所有账户
   ${chalk.gray('用法:')} /list_accounts

${chalk.green('/validate')}          验证文件
   ${chalk.gray('用法:')} /validate

${chalk.green('/config')}            配置管理
   ${chalk.gray('用法:')} /config [action="操作"] [key="配置项"] [value="配置值"]

${chalk.green('/help')}              显示此帮助信息
   ${chalk.gray('用法:')} /help

${chalk.green('/quit')}              退出程序
   ${chalk.gray('用法:')} /quit

${chalk.yellow.bold('💡 快速上手:')}
1. 查看余额: ${chalk.cyan('/show_balance')}
2. 查看交易: ${chalk.cyan('/list_transactions')}
3. 添加交易: ${chalk.cyan('/add_transaction date=2024-01-01 narration="午餐" postings=[{"account":"Expenses:Food","amount":25},{"account":"Assets:Cash","amount":-25}]')}
4. 管理配置: ${chalk.cyan('/config')}

${chalk.blue.bold('📝 提示:')}
- 所有命令都支持 /xxx 格式
- 日期格式: YYYY-MM-DD
- 金额可以是正数或负数
- 使用引号包围包含空格的文本
- 输入 /help 查看详细帮助
    `;

    return this.createSuccessResult(helpText);
  }

  /**
   * 获取命令帮助信息
   * 
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
❓ 帮助命令
用法: /help [command="命令名称"]

参数:
- command: 特定命令名称 (可选)

示例:
/help
/help command="add_transaction"
    `;
  }
} 