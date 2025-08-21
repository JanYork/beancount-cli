/**
 * 账户名称翻译工具
 *
 * 作者: JanYork
 */

import { Language } from './i18n';
import { UserPreferencesManager } from './user-preferences';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface AccountTranslation {
  en: string;
  zh: string;
  category: string;
}

export interface UserTranslation {
  account: string;
  translations: Record<Language, string>;
}

export class AccountTranslator {
  private static readonly accountTranslations: AccountTranslation[] = [
    // Assets (资产)
    { en: 'Assets', zh: '资产', category: 'root' },
    { en: 'Assets:Cash', zh: '现金', category: 'assets' },
    { en: 'Assets:Bank', zh: '银行账户', category: 'assets' },
    { en: 'Assets:Bank:Savings', zh: '储蓄账户', category: 'assets' },
    { en: 'Assets:Bank:Checking', zh: '支票账户', category: 'assets' },
    { en: 'Assets:Investment', zh: '投资', category: 'assets' },
    { en: 'Assets:Investment:Stocks', zh: '股票', category: 'assets' },
    { en: 'Assets:Investment:Bonds', zh: '债券', category: 'assets' },
    { en: 'Assets:Investment:Crypto', zh: '加密货币', category: 'assets' },
    { en: 'Assets:RealEstate', zh: '房地产', category: 'assets' },
    { en: 'Assets:Vehicle', zh: '车辆', category: 'assets' },
    { en: 'Assets:Equipment', zh: '设备', category: 'assets' },

    // Liabilities (负债)
    { en: 'Liabilities', zh: '负债', category: 'root' },
    { en: 'Liabilities:Credit', zh: '信用卡', category: 'liabilities' },
    { en: 'Liabilities:Loan', zh: '贷款', category: 'liabilities' },
    { en: 'Liabilities:Loan:Student', zh: '学生贷款', category: 'liabilities' },
    { en: 'Liabilities:Loan:Car', zh: '汽车贷款', category: 'liabilities' },
    { en: 'Liabilities:Loan:Home', zh: '房屋贷款', category: 'liabilities' },
    { en: 'Liabilities:Tax', zh: '税款', category: 'liabilities' },

    // Income (收入)
    { en: 'Income', zh: '收入', category: 'root' },
    { en: 'Income:Salary', zh: '工资', category: 'income' },
    { en: 'Income:Bonus', zh: '奖金', category: 'income' },
    { en: 'Income:Investment', zh: '投资收益', category: 'income' },
    { en: 'Income:Investment:Dividends', zh: '股息', category: 'income' },
    { en: 'Income:Investment:Interest', zh: '利息', category: 'income' },
    { en: 'Income:Investment:CapitalGains', zh: '资本利得', category: 'income' },
    { en: 'Income:Business', zh: '营业收入', category: 'income' },
    { en: 'Income:Freelance', zh: '自由职业', category: 'income' },
    { en: 'Income:Rental', zh: '租金收入', category: 'income' },
    { en: 'Income:Other', zh: '其他收入', category: 'income' },

    // Expenses (支出)
    { en: 'Expenses', zh: '支出', category: 'root' },
    { en: 'Expenses:Food', zh: '餐饮', category: 'expenses' },
    { en: 'Expenses:Food:Restaurant', zh: '餐厅', category: 'expenses' },
    { en: 'Expenses:Food:Groceries', zh: '杂货', category: 'expenses' },
    { en: 'Expenses:Transport', zh: '交通', category: 'expenses' },
    { en: 'Expenses:Transport:Public', zh: '公共交通', category: 'expenses' },
    { en: 'Expenses:Transport:Taxi', zh: '出租车', category: 'expenses' },
    { en: 'Expenses:Transport:Fuel', zh: '燃油', category: 'expenses' },
    { en: 'Expenses:Housing', zh: '住房', category: 'expenses' },
    { en: 'Expenses:Housing:Rent', zh: '房租', category: 'expenses' },
    { en: 'Expenses:Housing:Utilities', zh: '水电费', category: 'expenses' },
    { en: 'Expenses:Housing:Maintenance', zh: '维护费', category: 'expenses' },
    { en: 'Expenses:Shopping', zh: '购物', category: 'expenses' },
    { en: 'Expenses:Shopping:Clothing', zh: '服装', category: 'expenses' },
    { en: 'Expenses:Shopping:Electronics', zh: '电子产品', category: 'expenses' },
    { en: 'Expenses:Entertainment', zh: '娱乐', category: 'expenses' },
    { en: 'Expenses:Entertainment:Movies', zh: '电影', category: 'expenses' },
    { en: 'Expenses:Entertainment:Games', zh: '游戏', category: 'expenses' },
    { en: 'Expenses:Health', zh: '医疗', category: 'expenses' },
    { en: 'Expenses:Health:Insurance', zh: '医疗保险', category: 'expenses' },
    { en: 'Expenses:Health:Medicine', zh: '药品', category: 'expenses' },
    { en: 'Expenses:Education', zh: '教育', category: 'expenses' },
    { en: 'Expenses:Education:Tuition', zh: '学费', category: 'expenses' },
    { en: 'Expenses:Education:Books', zh: '书籍', category: 'expenses' },
    { en: 'Expenses:Insurance', zh: '保险', category: 'expenses' },
    { en: 'Expenses:Insurance:Life', zh: '人寿保险', category: 'expenses' },
    { en: 'Expenses:Insurance:Car', zh: '汽车保险', category: 'expenses' },
    { en: 'Expenses:Insurance:Home', zh: '房屋保险', category: 'expenses' },
    { en: 'Expenses:Tax', zh: '税费', category: 'expenses' },
    { en: 'Expenses:Tax:Income', zh: '所得税', category: 'expenses' },
    { en: 'Expenses:Tax:Sales', zh: '销售税', category: 'expenses' },
    { en: 'Expenses:Other', zh: '其他支出', category: 'expenses' },

    // Equity (权益)
    { en: 'Equity', zh: '权益', category: 'root' },
    { en: 'Equity:Opening', zh: '期初余额', category: 'equity' },
    { en: 'Equity:Closing', zh: '期末余额', category: 'equity' },
    { en: 'Equity:RetainedEarnings', zh: '留存收益', category: 'equity' },
  ];

  // 用户自定义翻译存储
  private static userTranslations: Map<string, Record<Language, string>> = new Map();
  private static translationsFilePath: string;

  static {
    // 初始化时加载持久化的翻译
    this.translationsFilePath = path.join(os.homedir(), '.beancount-cli', 'user-translations.json');
    this.loadUserTranslations();
  }

  /**
   * 加载用户自定义翻译
   */
  private static loadUserTranslations(): void {
    try {
      if (fs.existsSync(this.translationsFilePath)) {
        const data = fs.readFileSync(this.translationsFilePath, 'utf8');
        const translations = JSON.parse(data);

        this.userTranslations.clear();
        for (const [account, trans] of Object.entries(translations)) {
          this.userTranslations.set(account, trans as Record<Language, string>);
        }
      }
    } catch (error) {
      console.warn('加载用户翻译失败:', error);
    }
  }

  /**
   * 保存用户自定义翻译
   */
  private static saveUserTranslations(): void {
    try {
      const configDir = path.dirname(this.translationsFilePath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      const translations: Record<string, Record<Language, string>> = {};
      for (const [account, trans] of this.userTranslations.entries()) {
        translations[account] = trans;
      }

      fs.writeFileSync(this.translationsFilePath, JSON.stringify(translations, null, 2), 'utf8');
    } catch (error) {
      console.error('保存用户翻译失败:', error);
    }
  }

  /**
   * 添加用户自定义翻译
   */
  static addUserTranslation(account: string, language: Language, translation: string): void {
    if (!this.userTranslations.has(account)) {
      this.userTranslations.set(account, {} as Record<Language, string>);
    }
    this.userTranslations.get(account)![language] = translation;
    this.saveUserTranslations(); // 保存用户自定义翻译
  }

  /**
   * 获取用户自定义翻译
   */
  static getUserTranslation(account: string, language: Language): string | null {
    const translations = this.userTranslations.get(account);
    return translations?.[language] || null;
  }

  /**
   * 移除用户自定义翻译
   */
  static removeUserTranslation(account: string, language?: Language): void {
    if (language) {
      const translations = this.userTranslations.get(account);
      if (translations) {
        delete translations[language];
        if (Object.keys(translations).length === 0) {
          this.userTranslations.delete(account);
        }
      }
    } else {
      this.userTranslations.delete(account);
    }
    this.saveUserTranslations(); // 保存用户自定义翻译
  }

  /**
   * 获取所有用户自定义翻译
   */
  static getAllUserTranslations(): UserTranslation[] {
    const result: UserTranslation[] = [];
    for (const [account, translations] of this.userTranslations.entries()) {
      result.push({
        account,
        translations,
      });
    }
    return result;
  }

  /**
   * 翻译账户名称
   */
  static translateAccount(accountName: string, language: Language): string {
    if (language === 'en-US') {
      return accountName; // 英文直接返回原名称
    }

    const preferences = UserPreferencesManager.getInstance();
    const showBothNames = preferences.get('display.show_both_names', false);
    const showOriginalNames = preferences.get('display.show_original_account_names', false);

    // 如果用户选择显示原始名称，直接返回
    if (showOriginalNames && !showBothNames) {
      return accountName;
    }

    // 获取翻译后的名称
    const translatedName = this.getTranslatedAccountName(accountName, language);

    // 如果用户选择同时显示原始和翻译名称
    if (showBothNames && translatedName !== accountName) {
      return `${translatedName} (${accountName})`;
    }

    return translatedName;
  }

  /**
   * 获取翻译后的账户名称（内部方法）
   */
  private static getTranslatedAccountName(accountName: string, language: Language): string {
    // 首先检查用户自定义翻译
    const userTranslation = this.getUserTranslation(accountName, language);
    if (userTranslation) {
      return userTranslation;
    }

    // 查找完全匹配的系统默认账户
    const exactMatch = this.accountTranslations.find(t => t.en === accountName);
    if (exactMatch) {
      return exactMatch.zh;
    }

    // 检查是否为系统默认账户的变体（如 Assets:Bank:MyBank）
    const parts = accountName.split(':');
    if (parts.length >= 2) {
      // 检查前两级是否为系统默认账户
      const baseAccount = `${parts[0]}:${parts[1]}`;
      const baseMatch = this.accountTranslations.find(t => t.en === baseAccount);

      if (baseMatch) {
        // 如果是系统默认账户的变体，翻译基础部分，保留用户自定义部分
        const translatedBase = baseMatch.zh;
        const customParts = parts.slice(2);
        if (customParts.length > 0) {
          return `${translatedBase}:${customParts.join(':')}`;
        }
        return translatedBase;
      }
    }

    // 检查是否为系统默认账户的直接子账户
    const firstPart = parts[0];
    const firstPartMatch = this.accountTranslations.find(t => t.en === firstPart);

    if (firstPartMatch && parts.length > 1) {
      // 翻译根账户，保留用户自定义的子账户
      const translatedRoot = firstPartMatch.zh;
      const customParts = parts.slice(1);
      return `${translatedRoot}:${customParts.join(':')}`;
    }

    // 如果都不是系统默认账户，保持原样
    return accountName;
  }

  /**
   * 翻译账户列表
   */
  static translateAccounts(accounts: string[], language: Language): string[] {
    return accounts.map(account => this.translateAccount(account, language));
  }

  /**
   * 获取账户类别名称
   */
  static getCategoryName(category: string, language: Language): string {
    const categoryMap = {
      assets: { 'zh-CN': '资产', 'en-US': 'Assets' },
      liabilities: { 'zh-CN': '负债', 'en-US': 'Liabilities' },
      income: { 'zh-CN': '收入', 'en-US': 'Income' },
      expenses: { 'zh-CN': '支出', 'en-US': 'Expenses' },
      equity: { 'zh-CN': '权益', 'en-US': 'Equity' },
    };

    return categoryMap[category as keyof typeof categoryMap]?.[language] || category;
  }

  /**
   * 格式化交易描述
   */
  static formatTransactionDescription(narration: string, language: Language): string {
    if (language === 'en-US') {
      return narration;
    }

    // 常见交易类型的翻译
    const transactionTypes: Record<string, string> = {
      Salary: '工资',
      Bonus: '奖金',
      Investment: '投资',
      Shopping: '购物',
      Food: '餐饮',
      Transport: '交通',
      Housing: '住房',
      Entertainment: '娱乐',
      Health: '医疗',
      Education: '教育',
      Insurance: '保险',
      Tax: '税费',
      Loan: '贷款',
      Credit: '信用卡',
      Cash: '现金',
      Bank: '银行',
      Savings: '储蓄',
      Checking: '支票',
      Stocks: '股票',
      Bonds: '债券',
      Crypto: '加密货币',
      RealEstate: '房地产',
      Vehicle: '车辆',
      Equipment: '设备',
    };

    // 尝试翻译常见词汇
    let translated = narration;
    for (const [en, zh] of Object.entries(transactionTypes)) {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      translated = translated.replace(regex, zh);
    }

    return translated;
  }

  /**
   * 格式化金额显示
   */
  static formatAmount(amount: number, currency: string, language: Language): string {
    const sign = amount >= 0 ? '+' : '';
    const formattedAmount = `${sign}${amount.toLocaleString()}`;

    if (language === 'zh-CN') {
      // 中文格式：+1,000 CNY
      return `${formattedAmount} ${currency}`;
    } else {
      // 英文格式：+1,000 CNY
      return `${formattedAmount} ${currency}`;
    }
  }
}
