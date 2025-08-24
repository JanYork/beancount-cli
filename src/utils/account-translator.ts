/**
 * 账户名翻译器
 * 将英文账户名翻译为中文显示名
 * 
 * @author JanYork
 */

import { t } from './i18n';

/**
 * 账户名翻译器
 */
export class AccountTranslator {
  
  /**
   * 账户名到中文显示名的映射
   */
  private static readonly accountNameMap: Record<string, string> = {
    // 资产账户
    'Assets:Bank': '银行账户',
    'Assets:Cash': '现金',
    'Assets:Investment': '投资账户',
    'Assets:Property': '房产',
    'Assets:Vehicle': '车辆',
    'Assets:Stock': '股票',
    'Assets:Bond': '债券',
    'Assets:Crypto': '加密货币',
    'Assets:Gold': '黄金',
    'Assets:Silver': '白银',
    
    // 负债账户
    'Liabilities:Credit': '信用卡',
    'Liabilities:CreditCard': '信用卡',
    'Liabilities:Loan': '贷款',
    'Liabilities:Mortgage': '房贷',
    'Liabilities:StudentLoan': '学生贷款',
    'Liabilities:CarLoan': '车贷',
    'Liabilities:PersonalLoan': '个人贷款',
    
    // 收入账户
    'Income:Salary': '工资收入',
    'Income:Bonus': '奖金收入',
    'Income:Investment': '投资收益',
    'Income:Interest': '利息收入',
    'Income:Dividend': '股息收入',
    'Income:Rental': '租金收入',
    'Income:Business': '经营收入',
    'Income:Freelance': '自由职业收入',
    'Income:Other': '其他收入',
    
    // 支出账户
    'Expenses:Food': '餐饮支出',
    'Expenses:Transport': '交通支出',
    'Expenses:Utilities': '水电费',
    'Expenses:Entertainment': '娱乐支出',
    'Expenses:Shopping': '购物支出',
    'Expenses:Medical': '医疗支出',
    'Expenses:Education': '教育支出',
    'Expenses:Housing': '住房支出',
    'Expenses:Insurance': '保险支出',
    'Expenses:Tax': '税费支出',
    'Expenses:Travel': '旅行支出',
    'Expenses:Clothing': '服装支出',
    'Expenses:Beauty': '美容支出',
    'Expenses:Sports': '运动支出',
    'Expenses:Books': '书籍支出',
    'Expenses:Technology': '科技支出',
    'Expenses:Pet': '宠物支出',
    'Expenses:Charity': '慈善支出',
    'Expenses:Other': '其他支出',
    
    // 权益账户
    'Equity:Opening': '期初余额',
    'Equity:Opening-Balances': '期初余额',
    'Equity:Closing': '期末余额',
    'Equity:Closing-Balances': '期末余额',
    'Equity:RetainedEarnings': '留存收益',
  };

  /**
   * 翻译账户名
   * @param accountName 英文账户名
   * @returns 中文显示名
   */
  static translate(accountName: string): string {
    return this.accountNameMap[accountName] || accountName;
  }

  /**
   * 批量翻译账户名
   * @param accountNames 账户名数组
   * @returns 翻译后的账户名数组
   */
  static translateBatch(accountNames: string[]): string[] {
    return accountNames.map(name => this.translate(name));
  }

  /**
   * 获取账户类型的中文名称
   * @param accountName 账户名
   * @returns 账户类型中文名称
   */
  static getAccountType(accountName: string): string {
    if (accountName.startsWith('Assets:')) {
      return t('account.type.assets');
    } else if (accountName.startsWith('Liabilities:')) {
      return t('account.type.liabilities');
    } else if (accountName.startsWith('Income:')) {
      return t('account.type.income');
    } else if (accountName.startsWith('Expenses:')) {
      return t('account.type.expenses');
    } else if (accountName.startsWith('Equity:')) {
      return t('account.type.equity');
    } else {
      return t('account.type.other');
    }
  }

  /**
   * 格式化账户显示
   * @param accountName 账户名
   * @returns 格式化的账户显示
   */
  static formatAccountDisplay(accountName: string): string {
    const translatedName = this.translate(accountName);
    const accountType = this.getAccountType(accountName);
    
    // 如果翻译后还是英文，说明没有映射，返回原名称
    if (translatedName === accountName) {
      return accountName;
    }
    
    return `${translatedName} (${accountType})`;
  }

  /**
   * 获取所有账户类型
   * @returns 账户类型数组
   */
  static getAllAccountTypes(): string[] {
    return [
      t('account.type.assets'),
      t('account.type.liabilities'),
      t('account.type.income'),
      t('account.type.expenses'),
      t('account.type.equity'),
      t('account.type.other')
    ];
  }

  /**
   * 根据类型获取账户列表
   * @param type 账户类型
   * @returns 该类型的账户列表
   */
  static getAccountsByType(type: string): string[] {
    const accounts: string[] = [];
    
    for (const [accountName] of Object.entries(this.accountNameMap)) {
      const accountType = this.getAccountType(accountName);
      if (accountType === type) {
        accounts.push(accountName);
      }
    }
    
    return accounts;
  }

  /**
   * 搜索账户
   * @param keyword 关键词
   * @returns 匹配的账户列表
   */
  static searchAccounts(keyword: string): Array<{name: string; displayName: string; type: string}> {
    const results: Array<{name: string; displayName: string; type: string}> = [];
    const keywordLower = keyword.toLowerCase();
    
    for (const [accountName, displayName] of Object.entries(this.accountNameMap)) {
      if (accountName.toLowerCase().includes(keywordLower) || 
          displayName.toLowerCase().includes(keywordLower)) {
        results.push({
          name: accountName,
          displayName: displayName,
          type: this.getAccountType(accountName)
        });
      }
    }
    
    return results;
  }
}
