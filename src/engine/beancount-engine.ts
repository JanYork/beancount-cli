/**
 * Beancount操作引擎
 *
 * 作者: JanYork
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { Account, Transaction, Posting, Balance, BeancountEntry, AccountType } from '../types';
import { BeancountParser } from '../utils/parser';

export class BeancountEngine {
  private filePath: string;
  private entries: BeancountEntry[] = [];
  private errors: string[] = [];
  // private options: Record<string, any> = {};

  constructor(filePath: string) {
    this.filePath = filePath;
    this.loadFile();
  }

  /**
   * 加载beancount文件
   */
  private loadFile(): void {
    try {
      if (!existsSync(this.filePath)) {
        throw new Error(`文件不存在: ${this.filePath}`);
      }

      const content = readFileSync(this.filePath, 'utf-8');
      this.entries = BeancountParser.parseContent(content);

      // 验证文件
      this.errors = this.validateFile();

      if (this.errors.length > 0) {
        console.warn(`⚠️  加载文件时发现 ${this.errors.length} 个错误`);
      }
    } catch (error) {
      throw new Error(`加载文件失败: ${error}`);
    }
  }

  /**
   * 重新加载文件
   */
  public reload(): void {
    this.loadFile();
  }

  /**
   * 获取所有账户信息
   */
  public getAccounts(): Account[] {
    const accounts: Account[] = [];

    for (const entry of this.entries) {
      if (entry.type === 'open') {
        const accountName = entry['account'];
        if (accountName) {
          const accountType = this.getAccountType(accountName);
          const account: Account = {
            name: accountName,
            type: accountType,
            openDate: entry.date,
            meta: entry.meta || {},
          };
          accounts.push(account);
        }
      }
    }

    return accounts;
  }

  /**
   * 获取账户类型
   */
  private getAccountType(accountName: string): AccountType {
    const parts = accountName.split(':');
    const rootAccount = parts[0]?.toUpperCase();

    switch (rootAccount) {
      case 'ASSETS':
        return 'ASSETS';
      case 'LIABILITIES':
        return 'LIABILITIES';
      case 'EQUITY':
        return 'EQUITY';
      case 'INCOME':
        return 'INCOME';
      case 'EXPENSES':
        return 'EXPENSES';
      default:
        return 'ASSETS';
    }
  }

  /**
   * 获取交易记录
   */
  public getTransactions(startDate?: Date, endDate?: Date): Transaction[] {
    const transactions: Transaction[] = [];

    for (const entry of this.entries) {
      if (entry.type === 'transaction') {
        // 检查日期范围
        if (startDate && isBefore(entry.date, startOfDay(startDate))) {
          continue;
        }
        if (endDate && isAfter(entry.date, endOfDay(endDate))) {
          continue;
        }

        // 构建交易记录
        const transaction: Transaction = {
          date: entry.date,
          payee: entry['payee'],
          narration: entry['narration'] || '',
          postings: this.getPostingsForTransaction(entry),
          tags: this.extractTags(entry),
          links: this.extractLinks(entry),
          meta: entry.meta || {},
        };

        transactions.push(transaction);
      }
    }

    return transactions;
  }

  /**
   * 获取交易记录的分录
   */
  private getPostingsForTransaction(entry: BeancountEntry): Posting[] {
    // 从条目中获取分录数据
    if (entry['postings'] && Array.isArray(entry['postings'])) {
      return entry['postings'].map(posting => ({
        account: posting.account || '',
        units: posting.units,
        meta: posting.meta || {},
      }));
    }
    return [];
  }

  /**
   * 提取标签
   */
  private extractTags(_entry: BeancountEntry): string[] {
    // 从元数据中提取标签
    return [];
  }

  /**
   * 提取链接
   */
  private extractLinks(_entry: BeancountEntry): string[] {
    // 从元数据中提取链接
    return [];
  }

  /**
   * 添加交易记录
   */
  public addTransaction(transaction: Transaction): void {
    // 验证交易记录
    const validation = BeancountParser.validateTransaction(transaction);
    if (!validation.valid) {
      throw new Error(`交易记录验证失败: ${validation.errors.join(', ')}`);
    }

    // 创建beancount条目
    const entry: BeancountEntry = {
      type: 'transaction',
      date: transaction.date,
      payee: transaction.payee,
      narration: transaction.narration,
      meta: { ...transaction.meta, tags: transaction.tags, links: transaction.links },
    };

    this.entries.push(entry);
    this.saveFile();
  }

  /**
   * 删除交易记录
   */
  public deleteTransaction(transactionDate: Date, narration: string): boolean {
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      if (
        entry &&
        entry.type === 'transaction' &&
        entry.date.getTime() === transactionDate.getTime() &&
        entry['narration'] === narration
      ) {
        this.entries.splice(i, 1);
        this.saveFile();
        return true;
      }
    }
    return false;
  }

  /**
   * 保存交易记录列表
   */
  public async saveTransactions(transactions: Transaction[]): Promise<void> {
    // 清除现有的交易条目
    this.entries = this.entries.filter(entry => entry.type !== 'transaction');

    // 添加新的交易条目
    for (const transaction of transactions) {
      const entry: BeancountEntry = {
        type: 'transaction',
        date: transaction.date,
        payee: transaction.payee,
        narration: transaction.narration,
        postings: transaction.postings,
        meta: { ...transaction.meta, tags: transaction.tags, links: transaction.links },
      };
      this.entries.push(entry);
    }

    // 保存文件
    this.saveFile();
  }

  /**
   * 获取账户余额
   */
  public getBalances(account?: string, balanceDate?: Date): Balance[] {
    const balances: Balance[] = [];
    const targetDate = balanceDate || new Date();

    for (const entry of this.entries) {
      if (entry.type === 'balance') {
        if (account && entry['account'] !== account) {
          continue;
        }

        if (entry['amount'] && entry.date.getTime() <= targetDate.getTime()) {
          const balance: Balance = {
            account: entry['account'] || '',
            amount: entry['amount'],
            date: entry.date,
          };
          balances.push(balance);
        }
      }
    }

    return balances;
  }

  /**
   * 获取净资产信息
   */
  public getNetWorth(targetDate?: Date): Record<string, any> {
    const date = targetDate || new Date();
    const balances = this.getBalances(undefined, date);

    let totalAssets = 0;
    let totalLiabilities = 0;

    for (const balance of balances) {
      const accountType = this.getAccountType(balance.account);
      const amount = balance.amount.number;

      if (accountType === 'ASSETS') {
        totalAssets += amount;
      } else if (accountType === 'LIABILITIES') {
        totalLiabilities += amount;
      }
    }

    return {
      date: format(date, 'yyyy-MM-dd'),
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    };
  }

  /**
   * 获取损益表
   */
  public getIncomeStatement(startDate: Date, endDate: Date): Record<string, any> {
    const transactions = this.getTransactions(startDate, endDate);

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const transaction of transactions) {
      for (const posting of transaction.postings) {
        const accountType = this.getAccountType(posting.account);
        const amount = posting.units?.number || 0;

        if (accountType === 'INCOME') {
          totalIncome += amount;
        } else if (accountType === 'EXPENSES') {
          totalExpenses += amount;
        }
      }
    }

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
    };
  }

  /**
   * 获取资产负债表
   */
  public getBalanceSheet(targetDate?: Date): Record<string, any> {
    const date = targetDate || new Date();
    const balances = this.getBalances(undefined, date);

    const assets: Record<string, number> = {};
    const liabilities: Record<string, number> = {};
    const equity: Record<string, number> = {};

    for (const balance of balances) {
      const accountType = this.getAccountType(balance.account);
      const amount = balance.amount.number;

      switch (accountType) {
        case 'ASSETS':
          assets[balance.account] = amount;
          break;
        case 'LIABILITIES':
          liabilities[balance.account] = amount;
          break;
        case 'EQUITY':
          equity[balance.account] = amount;
          break;
      }
    }

    return {
      date: format(date, 'yyyy-MM-dd'),
      assets,
      liabilities,
      equity,
    };
  }

  /**
   * 保存文件
   */
  private saveFile(): void {
    try {
      const content = this.formatFileContent();
      writeFileSync(this.filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`保存文件失败: ${error}`);
    }
  }

  /**
   * 格式化文件内容
   */
  private formatFileContent(): string {
    const lines: string[] = [];

    for (const entry of this.entries) {
      if (entry.type === 'transaction') {
        const transaction: Transaction = {
          date: entry.date,
          payee: entry['payee'],
          narration: entry['narration'] || '',
          postings: entry['postings'] || [],
          tags: [],
          links: [],
          meta: entry.meta || {},
        };
        lines.push(BeancountParser.formatTransaction(transaction));
      } else if (entry.type === 'open' || entry.type === 'close') {
        const dateStr = format(entry.date, 'yyyy-MM-dd');
        lines.push(`${dateStr} ${entry.type} ${entry['account']}`);
      } else if (entry.type === 'balance' && entry['amount']) {
        const dateStr = format(entry.date, 'yyyy-MM-dd');
        lines.push(`${dateStr} balance ${entry['account']} ${entry['amount'].number} ${entry['amount'].currency}`);
      }

      lines.push(''); // 空行分隔
    }

    return lines.join('\n');
  }

  /**
   * 验证文件
   */
  private validateFile(): string[] {
    const errors: string[] = [];

    for (const entry of this.entries) {
      if (entry.type === 'transaction') {
        const transaction: Transaction = {
          date: entry.date,
          payee: entry['payee'],
          narration: entry['narration'] || '',
          postings: entry['postings'] || [],
          tags: [],
          links: [],
          meta: entry.meta || {},
        };

        const validation = BeancountParser.validateTransaction(transaction);
        if (!validation.valid) {
          errors.push(...validation.errors);
        }
      }
    }

    return errors;
  }

  /**
   * 获取文件统计信息
   */
  public getFileStats(): Record<string, any> {
    const accounts = this.getAccounts();
    const transactions = this.getTransactions();
    const balances = this.getBalances();

    return {
      totalAccounts: accounts.length,
      totalTransactions: transactions.length,
      totalBalances: balances.length,
      totalErrors: this.errors.length,
      filePath: this.filePath,
    };
  }
}
