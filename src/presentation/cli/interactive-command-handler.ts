/**
 * 交互式命令处理器
 * 提供便捷的选择和搜索功能
 * 
 * @author JanYork
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { t } from '../../utils/i18n';

/**
 * 交互式命令处理器
 */
export class InteractiveCommandHandler {
  
  /**
   * 处理添加交易记录的交互式流程
   */
  static async handleAddTransaction(): Promise<any> {
    console.log(chalk.cyan.bold('📝 添加交易记录向导'));
    console.log();

    const result: any = {};

    // 1. 选择日期
    result.date = await this.selectDate();
    
    // 2. 输入描述
    result.narration = await this.enterDescription();
    
    // 3. 输入金额
    result.amount = await this.enterAmount();
    
    // 4. 选择账户
    result.accounts = await this.selectAccounts();

    return result;
  }

  /**
   * 处理编辑交易记录的交互式流程
   */
  static async handleEditTransaction(): Promise<any> {
    console.log(chalk.cyan.bold('✏️ 编辑交易记录向导'));
    console.log();

    const result: any = {};

    // 1. 选择要编辑的交易
    result.transactionId = await this.selectTransactionToEdit();
    
    // 2. 选择要编辑的字段
    const fieldsToEdit = await this.selectFieldsToEdit();
    
    for (const field of fieldsToEdit) {
      switch (field) {
        case 'date':
          result.date = await this.selectDate();
          break;
        case 'narration':
          result.narration = await this.enterDescription();
          break;
        case 'amount':
          result.amount = await this.enterAmount();
          break;
        case 'accounts':
          result.accounts = await this.selectAccounts();
          break;
      }
    }

    return result;
  }

  /**
   * 处理删除交易记录的交互式流程
   */
  static async handleDeleteTransaction(): Promise<any> {
    console.log(chalk.cyan.bold('🗑️ 删除交易记录向导'));
    console.log();

    const result: any = {};

    // 1. 选择要删除的交易
    result.transactionId = await this.selectTransactionToDelete();
    
    // 2. 确认删除
    result.confirm = await this.confirmDelete();

    return result;
  }

  /**
   * 处理查询交易记录的交互式流程
   */
  static async handleListTransactions(): Promise<any> {
    console.log(chalk.cyan.bold('🔍 查询交易记录向导'));
    console.log();

    const result: any = {};

    // 1. 选择查询条件
    const queryOptions = await this.selectQueryOptions();
    
    if (queryOptions.includes('date')) {
      result.dateRange = await this.selectDateRange();
    }
    
    if (queryOptions.includes('account')) {
      result.accounts = await this.selectAccountsForQuery();
    }
    
    if (queryOptions.includes('keyword')) {
      result.keyword = await this.enterSearchKeyword();
    }
    
    if (queryOptions.includes('amount')) {
      result.amountRange = await this.selectAmountRange();
    }

    return result;
  }

  /**
   * 处理显示余额的交互式流程
   */
  static async handleShowBalance(): Promise<any> {
    console.log(chalk.cyan.bold('💰 显示账户余额向导'));
    console.log();

    const result: any = {};

    // 1. 选择账户
    result.accounts = await this.selectAccountsForBalance();
    
    // 2. 选择日期
    result.date = await this.selectDateForBalance();

    return result;
  }

  /**
   * 处理配置管理的交互式流程
   */
  static async handleConfig(): Promise<any> {
    console.log(chalk.cyan.bold('⚙️ 配置管理向导'));
    console.log();

    const result: any = {};

    // 1. 选择配置项
    const configOptions = await this.selectConfigOptions();
    
    for (const option of configOptions) {
      switch (option) {
        case 'language':
          result.language = await this.selectLanguage();
          break;
        case 'theme':
          result.theme = await this.selectTheme();
          break;
        case 'currency':
          result.currency = await this.selectCurrency();
          break;
        case 'filePath':
          result.filePath = await this.enterFilePath();
          break;
      }
    }

    return result;
  }

  /**
   * 处理报表生成的交互式流程
   */
  static async handleReport(): Promise<any> {
    console.log(chalk.cyan.bold('📊 报表生成向导'));
    console.log();

    const result: any = {};

    // 1. 选择报表类型
    result.reportType = await this.selectReportType();
    
    // 2. 选择日期范围
    result.dateRange = await this.selectDateRange();
    
    // 3. 选择账户（可选）
    const { needAccounts } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'needAccounts',
        message: '是否需要按账户筛选？',
        default: false
      }
    ]);

    if (needAccounts) {
      result.accounts = await this.selectAccountsForQuery();
    }

    return result;
  }

  /**
   * 处理数据导出的交互式流程
   */
  static async handleExport(): Promise<any> {
    console.log(chalk.cyan.bold('📤 数据导出向导'));
    console.log();

    const result: any = {};

    // 1. 选择导出格式
    result.format = await this.selectExportFormat();
    
    // 2. 选择输出路径
    result.outputPath = await this.enterOutputPath();
    
    // 3. 选择日期范围（可选）
    const { needDateRange } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'needDateRange',
        message: '是否需要按日期范围筛选？',
        default: false
      }
    ]);

    if (needDateRange) {
      result.dateRange = await this.selectDateRange();
    }
    
    // 4. 选择账户（可选）
    const { needAccounts } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'needAccounts',
        message: '是否需要按账户筛选？',
        default: false
      }
    ]);

    if (needAccounts) {
      result.accounts = await this.selectAccountsForQuery();
    }

    return result;
  }

  /**
   * 处理数据验证的交互式流程
   */
  static async handleValidate(): Promise<any> {
    console.log(chalk.cyan.bold('🔍 数据验证向导'));
    console.log();

    const result: any = {};

    // 1. 选择验证类型
    result.validateType = await this.selectValidateType();
    
    // 2. 是否自动修复问题
    const { fixIssues } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'fixIssues',
        message: '是否自动修复发现的问题？',
        default: false
      }
    ]);

    result.fixIssues = fixIssues;

    return result;
  }

  /**
   * 选择日期
   */
  private static async selectDate(): Promise<string> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const dateOptions = [
      { name: '今天', value: today.toISOString().split('T')[0] },
      { name: '昨天', value: yesterday.toISOString().split('T')[0] },
      { name: '上周', value: lastWeek.toISOString().split('T')[0] },
      { name: '自定义日期', value: 'custom' }
    ];

    const { dateChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'dateChoice',
        message: t('interactive.select.date'),
        choices: dateOptions,
        loop: true, // 支持循环选择
        pageSize: 10 // 每页显示10个选项
      }
    ]);

    if (dateChoice === 'custom') {
      const { customDate } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customDate',
          message: '请输入日期 (YYYY-MM-DD):',
          validate: (input: string) => {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(input)) {
              return '请输入正确的日期格式 (YYYY-MM-DD)';
            }
            return true;
          }
        }
      ]);
      return customDate;
    }

    return dateChoice;
  }

  /**
   * 选择日期范围
   */
  private static async selectDateRange(): Promise<{start: string; end: string}> {
    const { startDate } = await inquirer.prompt([
      {
        type: 'input',
        name: 'startDate',
        message: '请输入开始日期 (YYYY-MM-DD):',
        validate: (input: string) => {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(input)) {
            return '请输入正确的日期格式 (YYYY-MM-DD)';
          }
          return true;
        }
      }
    ]);

    const { endDate } = await inquirer.prompt([
      {
        type: 'input',
        name: 'endDate',
        message: '请输入结束日期 (YYYY-MM-DD):',
        validate: (input: string) => {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(input)) {
            return '请输入正确的日期格式 (YYYY-MM-DD)';
          }
          return true;
        }
      }
    ]);

    return { start: startDate, end: endDate };
  }

  /**
   * 选择余额查询日期
   */
  private static async selectDateForBalance(): Promise<string> {
    const { dateChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'dateChoice',
        message: '选择查询日期:',
        choices: [
          { name: '当前日期', value: 'current' },
          { name: '指定日期', value: 'custom' }
        ],
        loop: true, // 支持循环选择
        pageSize: 10 // 每页显示10个选项
      }
    ]);

    if (dateChoice === 'custom') {
      return await this.selectDate();
    }

    return 'current';
  }

  /**
   * 输入描述
   */
  private static async enterDescription(): Promise<string> {
    const { narration } = await inquirer.prompt([
      {
        type: 'input',
        name: 'narration',
        message: t('interactive.enter.description'),
        validate: (input: string) => {
          if (!input.trim()) {
            return '描述不能为空';
          }
          return true;
        }
      }
    ]);
    return narration;
  }

  /**
   * 输入金额
   */
  private static async enterAmount(): Promise<string> {
    const { amount } = await inquirer.prompt([
      {
        type: 'input',
        name: 'amount',
        message: t('interactive.enter.amount'),
        validate: (input: string) => {
          const amountRegex = /^-?\d+(\.\d{1,2})?$/;
          if (!amountRegex.test(input)) {
            return '请输入正确的金额格式 (如: 100.50)';
          }
          return true;
        }
      }
    ]);
    return amount;
  }

  /**
   * 选择金额范围
   */
  private static async selectAmountRange(): Promise<{min: number; max: number}> {
    const { minAmount } = await inquirer.prompt([
      {
        type: 'input',
        name: 'minAmount',
        message: '请输入最小金额:',
        validate: (input: string) => {
          const amountRegex = /^-?\d+(\.\d{1,2})?$/;
          if (!amountRegex.test(input)) {
            return '请输入正确的金额格式';
          }
          return true;
        }
      }
    ]);

    const { maxAmount } = await inquirer.prompt([
      {
        type: 'input',
        name: 'maxAmount',
        message: '请输入最大金额:',
        validate: (input: string) => {
          const amountRegex = /^-?\d+(\.\d{1,2})?$/;
          if (!amountRegex.test(input)) {
            return '请输入正确的金额格式';
          }
          return true;
        }
      }
    ]);

    return { min: parseFloat(minAmount), max: parseFloat(maxAmount) };
  }

  /**
   * 输入搜索关键词
   */
  private static async enterSearchKeyword(): Promise<string> {
    const { keyword } = await inquirer.prompt([
      {
        type: 'input',
        name: 'keyword',
        message: '请输入搜索关键词:',
        validate: (input: string) => {
          if (!input.trim()) {
            return '关键词不能为空';
          }
          return true;
        }
      }
    ]);
    return keyword;
  }

  /**
   * 输入文件路径
   */
  private static async enterFilePath(): Promise<string> {
    const { filePath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'filePath',
        message: '请输入文件路径:',
        validate: (input: string) => {
          if (!input.trim()) {
            return '文件路径不能为空';
          }
          return true;
        }
      }
    ]);
    return filePath;
  }

  /**
   * 选择账户
   */
  private static async selectAccounts(): Promise<string[]> {
    const accounts = await this.getAccountOptions();
    const selectedAccounts: string[] = [];

    // 选择第一个账户（支出/收入账户）
    const { firstAccount } = await inquirer.prompt([
      {
        type: 'list',
        name: 'firstAccount',
        message: '选择账户类型:',
        choices: [
          { name: '💰 支出账户', value: 'expense' },
          { name: '💵 收入账户', value: 'income' },
          { name: '🏦 资产账户', value: 'asset' },
          { name: '💳 负债账户', value: 'liability' }
        ],
        loop: true, // 支持循环选择
        pageSize: 10 // 每页显示10个选项
      }
    ]);

    // 根据类型显示具体账户
    const accountOptions = accounts.filter(acc => acc.type === firstAccount);
    const { selectedAccount } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedAccount',
        message: t('interactive.select.account'),
        choices: accountOptions.map(acc => ({
          name: `${acc.icon} ${acc.displayName}`,
          value: acc.name
        })),
        loop: true, // 支持循环选择
        pageSize: 10 // 每页显示10个选项
      }
    ]);

    selectedAccounts.push(selectedAccount);

    // 选择第二个账户（对应账户）
    const { secondAccount } = await inquirer.prompt([
      {
        type: 'list',
        name: 'secondAccount',
        message: '选择对应账户:',
        choices: accounts
          .filter(acc => acc.name !== selectedAccount)
          .map(acc => ({
            name: `${acc.icon} ${acc.displayName}`,
            value: acc.name
          })),
        loop: true, // 支持循环选择
        pageSize: 10 // 每页显示10个选项
      }
    ]);

    selectedAccounts.push(secondAccount);

    return selectedAccounts;
  }

  /**
   * 选择查询账户
   */
  private static async selectAccountsForQuery(): Promise<string[]> {
    const accounts = await this.getAccountOptions();
    const { selectedAccounts } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedAccounts',
        message: '选择要查询的账户 (可多选):',
        choices: accounts.map(acc => ({
          name: `${acc.icon} ${acc.displayName}`,
          value: acc.name
        })),
        pageSize: 10, // 每页显示10个选项
        loop: true // 支持循环选择
      }
    ]);

    return selectedAccounts;
  }

  /**
   * 选择余额查询账户
   */
  private static async selectAccountsForBalance(): Promise<string[]> {
    const accounts = await this.getAccountOptions();
    const { selectedAccounts } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedAccounts',
        message: '选择要查询余额的账户 (可多选):',
        choices: accounts.map(acc => ({
          name: `${acc.icon} ${acc.displayName}`,
          value: acc.name
        })),
        pageSize: 10, // 每页显示10个选项
        loop: true // 支持循环选择
      }
    ]);

    return selectedAccounts;
  }

  /**
   * 选择要编辑的交易
   */
  private static async selectTransactionToEdit(): Promise<string> {
    // 这里应该从实际的交易数据中获取
    const mockTransactions = [
      { id: '1', description: '工资', date: '2025-08-21', amount: '5000' },
      { id: '2', description: '午餐', date: '2025-08-21', amount: '25' },
      { id: '3', description: '购物', date: '2025-08-21', amount: '100' }
    ];

    const { transactionId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'transactionId',
        message: '选择要编辑的交易:',
        choices: mockTransactions.map(tx => ({
          name: `${tx.date} - ${tx.description} (¥${tx.amount})`,
          value: tx.id
        })),
        loop: true, // 支持循环选择
        pageSize: 10 // 每页显示10个选项
      }
    ]);

    return transactionId;
  }

  /**
   * 选择要删除的交易
   */
  private static async selectTransactionToDelete(): Promise<string> {
    // 这里应该从实际的交易数据中获取
    const mockTransactions = [
      { id: '1', description: '工资', date: '2025-08-21', amount: '5000' },
      { id: '2', description: '午餐', date: '2025-08-21', amount: '25' },
      { id: '3', description: '购物', date: '2025-08-21', amount: '100' }
    ];

    const { transactionId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'transactionId',
        message: '选择要删除的交易:',
        choices: mockTransactions.map(tx => ({
          name: `${tx.date} - ${tx.description} (¥${tx.amount})`,
          value: tx.id
        })),
        loop: true, // 支持循环选择
        pageSize: 10 // 每页显示10个选项
      }
    ]);

    return transactionId;
  }

  /**
   * 选择要编辑的字段
   */
  private static async selectFieldsToEdit(): Promise<string[]> {
    const { fields } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'fields',
        message: '选择要编辑的字段:',
        choices: [
          { name: '📅 日期', value: 'date' },
          { name: '📝 描述', value: 'narration' },
          { name: '💰 金额', value: 'amount' },
          { name: '🏦 账户', value: 'accounts' }
        ]
      }
    ]);

    return fields;
  }

  /**
   * 选择查询选项
   */
  private static async selectQueryOptions(): Promise<string[]> {
    const { options } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'options',
        message: '选择查询条件:',
        choices: [
          { name: '📅 日期范围', value: 'date' },
          { name: '🏦 账户', value: 'account' },
          { name: '🔍 关键词', value: 'keyword' },
          { name: '💰 金额范围', value: 'amount' }
        ],
        validate: (input: string[]) => {
          if (input.length === 0) {
            return '请至少选择一个查询条件';
          }
          return true;
        }
      }
    ]);

    return options;
  }

  /**
   * 选择配置选项
   */
  private static async selectConfigOptions(): Promise<string[]> {
    const { options } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'options',
        message: '选择要配置的选项:',
        choices: [
          { name: '🌐 语言设置', value: 'language' },
          { name: '🎨 主题设置', value: 'theme' },
          { name: '💰 货币设置', value: 'currency' },
          { name: '📁 文件路径', value: 'filePath' }
        ],
        validate: (input: string[]) => {
          if (input.length === 0) {
            return '请至少选择一个配置选项';
          }
          return true;
        }
      }
    ]);

    return options;
  }

  /**
   * 选择报表类型
   */
  private static async selectReportType(): Promise<string> {
    const { reportType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'reportType',
        message: '选择报表类型:',
        choices: [
          { name: '📈 收支明细报表', value: 'income_expense' },
          { name: '💰 资产负债表', value: 'balance_sheet' },
          { name: '💸 现金流量表', value: 'cash_flow' },
          { name: '📅 月度汇总', value: 'monthly_summary' },
          { name: '📊 年度汇总', value: 'yearly_summary' },
          { name: '🏷️ 分类分析', value: 'category_analysis' }
        ],
        loop: true, // 支持循环选择
        pageSize: 10 // 每页显示10个选项
      }
    ]);

    return reportType;
  }

  /**
   * 选择导出格式
   */
  private static async selectExportFormat(): Promise<string> {
    const { format } = await inquirer.prompt([
      {
        type: 'list',
        name: 'format',
        message: '选择导出格式:',
        choices: [
          { name: '📊 CSV格式 (Excel兼容)', value: 'csv' },
          { name: '📈 Excel格式 (.xlsx)', value: 'excel' },
          { name: '📄 JSON格式', value: 'json' },
          { name: '📋 PDF格式', value: 'pdf' }
        ],
        loop: true, // 支持循环选择
        pageSize: 10 // 每页显示10个选项
      }
    ]);

    return format;
  }

  /**
   * 输入输出路径
   */
  private static async enterOutputPath(): Promise<string> {
    const { outputPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'outputPath',
        message: '请输入输出文件路径 (留空使用默认路径):',
        default: './exported_data'
      }
    ]);

    return outputPath;
  }

  /**
   * 选择验证类型
   */
  private static async selectValidateType(): Promise<string> {
    const { validateType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'validateType',
        message: '选择验证类型:',
        choices: [
          { name: '📝 交易记录验证', value: 'transactions' },
          { name: '🏦 账户验证', value: 'accounts' },
          { name: '🔗 数据一致性验证', value: 'consistency' },
          { name: '✅ 全面验证', value: 'all' }
        ],
        loop: true, // 支持循环选择
        pageSize: 10 // 每页显示10个选项
      }
    ]);

    return validateType;
  }

  /**
   * 选择语言
   */
  private static async selectLanguage(): Promise<string> {
    const { language } = await inquirer.prompt([
      {
        type: 'list',
        name: 'language',
        message: '选择语言:',
        choices: [
          { name: '🇨🇳 简体中文', value: 'zh-CN' },
          { name: '🇺🇸 English', value: 'en-US' }
        ],
        loop: true, // 支持循环选择
        pageSize: 10 // 每页显示10个选项
      }
    ]);

    return language;
  }

  /**
   * 选择主题
   */
  private static async selectTheme(): Promise<string> {
    const { theme } = await inquirer.prompt([
      {
        type: 'list',
        name: 'theme',
        message: '选择主题:',
        choices: [
          { name: '🌙 深色主题', value: 'dark' },
          { name: '☀️ 浅色主题', value: 'light' },
          { name: '🌈 彩色主题', value: 'colorful' }
        ],
        loop: true, // 支持循环选择
        pageSize: 10 // 每页显示10个选项
      }
    ]);

    return theme;
  }

  /**
   * 选择货币
   */
  private static async selectCurrency(): Promise<string> {
    const { currency } = await inquirer.prompt([
      {
        type: 'list',
        name: 'currency',
        message: '选择默认货币:',
        choices: [
          { name: '🇨🇳 人民币 (CNY)', value: 'CNY' },
          { name: '🇺🇸 美元 (USD)', value: 'USD' },
          { name: '🇪🇺 欧元 (EUR)', value: 'EUR' },
          { name: '🇯🇵 日元 (JPY)', value: 'JPY' }
        ],
        loop: true, // 支持循环选择
        pageSize: 10 // 每页显示10个选项
      }
    ]);

    return currency;
  }

  /**
   * 确认删除
   */
  private static async confirmDelete(): Promise<boolean> {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '确定要删除这条交易记录吗？',
        default: false
      }
    ]);

    return confirm;
  }

  /**
   * 获取账户选项
   */
  static async getAccountOptions(): Promise<any[]> {
    // 这里可以从实际的账户数据中获取
    // 暂时使用模拟数据
    return [
      // 资产账户
      { name: 'Assets:Bank', displayName: '银行账户', type: 'asset', icon: '🏦' },
      { name: 'Assets:Cash', displayName: '现金', type: 'asset', icon: '💵' },
      { name: 'Assets:Investment', displayName: '投资账户', type: 'asset', icon: '📈' },
      
      // 负债账户
      { name: 'Liabilities:Credit', displayName: '信用卡', type: 'liability', icon: '💳' },
      { name: 'Liabilities:Loan', displayName: '贷款', type: 'liability', icon: '🏦' },
      
      // 收入账户
      { name: 'Income:Salary', displayName: '工资收入', type: 'income', icon: '💵' },
      { name: 'Income:Investment', displayName: '投资收益', type: 'income', icon: '📈' },
      { name: 'Income:Other', displayName: '其他收入', type: 'income', icon: '💰' },
      
      // 支出账户
      { name: 'Expenses:Food', displayName: '餐饮支出', type: 'expense', icon: '🍽️' },
      { name: 'Expenses:Transport', displayName: '交通支出', type: 'expense', icon: '🚗' },
      { name: 'Expenses:Shopping', displayName: '购物支出', type: 'expense', icon: '🛍️' },
      { name: 'Expenses:Entertainment', displayName: '娱乐支出', type: 'expense', icon: '🎮' },
      { name: 'Expenses:Utilities', displayName: '水电费', type: 'expense', icon: '💡' },
      { name: 'Expenses:Medical', displayName: '医疗支出', type: 'expense', icon: '🏥' },
      { name: 'Expenses:Education', displayName: '教育支出', type: 'expense', icon: '📚' }
    ];
  }

  /**
   * 搜索选项
   */
  static async searchOptions(options: any[], keyword: string): Promise<any[]> {
    const keywordLower = keyword.toLowerCase();
    return options.filter(option => 
      option.displayName.toLowerCase().includes(keywordLower) ||
      option.name.toLowerCase().includes(keywordLower)
    );
  }

  /**
   * 显示搜索结果
   */
  static showSearchResults(results: any[], keyword: string): void {
    if (results.length === 0) {
      console.log(chalk.yellow(`❌ 未找到包含 "${keyword}" 的选项`));
      return;
    }

    console.log(chalk.green(`🔍 找到 ${results.length} 个匹配项:`));
    results.forEach((result, index) => {
      console.log(chalk.cyan(`${index + 1}. ${result.icon} ${result.displayName}`));
    });
  }
} 