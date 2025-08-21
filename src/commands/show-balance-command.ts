/**
 * 显示余额命令
 *
 * 作者: JanYork
 */

import { parse } from 'date-fns';
import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { t, getLanguage } from '../utils/i18n';
import { AccountTranslator } from '../utils/account-translator';

export class ShowBalanceCommand extends BaseCommand {
  private engine: BeancountEngine;

  constructor(engine: BeancountEngine) {
    super();
    this.engine = engine;
  }

  /**
   * 执行显示余额命令
   *
   * @param params 命令参数
   * @returns 执行结果
   */
  execute(params: Record<string, any>): import('../types').CommandResult {
    try {
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
      const balances = this.engine.getBalances(account, balanceDate);

      if (balances.length === 0) {
        return this.createSuccessResult(t('balance.no.data'));
      }

      // 格式化输出 - 用户友好的界面
      let result = `${t('balance.title')}\n\n`;

      // 按货币分组
      const currencyGroups: Record<string, { accounts: string[]; total: number }> = {};
      const currentLanguage = getLanguage();

      for (const balance of balances) {
        const amount = balance.amount.number;
        const currency = balance.amount.currency;

        if (!currencyGroups[currency]) {
          currencyGroups[currency] = { accounts: [], total: 0 };
        }

        const sign = amount >= 0 ? '+' : '';
        const formattedAmount = `${sign}${amount.toLocaleString()}`;

        // 翻译账户名称
        const translatedAccount = AccountTranslator.translateAccount(balance.account, currentLanguage);
        currencyGroups[currency].accounts.push(`${translatedAccount}: ${formattedAmount}`);
        currencyGroups[currency].total += amount;
      }

      // 按货币显示
      for (const [currency, group] of Object.entries(currencyGroups)) {
        result += `${t('balance.currency', { currency })}\n`;

        for (const accountInfo of group.accounts) {
          result += `   ${accountInfo}\n`;
        }

        const totalSign = group.total >= 0 ? '+' : '';
        const totalFormatted = `${totalSign}${group.total.toLocaleString()}`;
        result += `   ─────────────────\n`;
        result += `   ${t('balance.total')}: ${totalFormatted} ${currency}\n\n`;
      }

      return this.createSuccessResult(result, balances);
    } catch (error) {
      return this.createErrorResult(`${t('balance.display.error')} ${error}`);
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
用法: /show_balance [account="Assets:Cash"] [date=2024-01-01]

参数:
- account: 账户名称 (可选)
- date: 查询日期 (YYYY-MM-DD, 可选)

示例:
/show_balance
/show_balance account="Assets:Cash"
/show_balance date=2024-01-01
/show_balance account="Assets:Cash" date=2024-01-01
    `;
  }
}
