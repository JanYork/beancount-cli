/**
 * 列出所有账户命令
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { getLanguage, Language } from '../utils/i18n';
import { AccountTranslator } from '../utils/account-translator';
import chalk from 'chalk';

export class ListAccountsCommand extends BaseCommand {
  private engine: BeancountEngine;

  constructor(engine: BeancountEngine) {
    super();
    this.engine = engine;
  }

  /**
   * 执行列出账户命令
   *
   * @param _params 命令参数
   * @returns 执行结果
   */
  execute(_params: Record<string, any>): import('../types').CommandResult {
    try {
      const accounts = this.engine.getAccounts();
      const currentLanguage = getLanguage();

      if (accounts.length === 0) {
        return this.createSuccessResult('📋 没有找到账户信息');
      }

      // 按类型分组账户
      const accountGroups: Record<string, string[]> = {};
      for (const account of accounts) {
        const type = this.getAccountType(account.name, currentLanguage);
        if (!accountGroups[type]) {
          accountGroups[type] = [];
        }
        // 翻译账户名称
        const translatedAccount = AccountTranslator.translateAccount(account.name, currentLanguage);
        accountGroups[type].push(translatedAccount);
      }

      // 格式化输出
      let result = `📋 找到 ${accounts.length} 个账户:\n\n`;

      for (const [type, accountList] of Object.entries(accountGroups)) {
        result += `${chalk.cyan.bold(`${type}:`)}\n`;
        for (const account of accountList) {
          result += `  ${chalk.green('•')} ${chalk.yellow(account)}\n`;
        }
        result += '\n';
      }

      return this.createSuccessResult(result, accounts);
    } catch (error) {
      return this.createErrorResult(`列出账户失败: ${error}`);
    }
  }

  /**
   * 获取账户类型
   *
   * @param accountName 账户名称
   * @param language 语言
   * @returns 账户类型
   */
  private getAccountType(accountName: string, language: Language): string {
    if (accountName.startsWith('Assets:')) {
      return language === 'zh-CN' ? '💰 资产账户' : '💰 Assets';
    }
    if (accountName.startsWith('Liabilities:')) {
      return language === 'zh-CN' ? '💳 负债账户' : '💳 Liabilities';
    }
    if (accountName.startsWith('Equity:')) {
      return language === 'zh-CN' ? '🏦 权益账户' : '🏦 Equity';
    }
    if (accountName.startsWith('Income:')) {
      return language === 'zh-CN' ? '📈 收入账户' : '📈 Income';
    }
    if (accountName.startsWith('Expenses:')) {
      return language === 'zh-CN' ? '💸 支出账户' : '💸 Expenses';
    }
    return language === 'zh-CN' ? '❓ 其他账户' : '❓ Other';
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
