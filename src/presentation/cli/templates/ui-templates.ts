import chalk from 'chalk';
import { t } from '../../../utils/i18n';
import { ThemeManager } from '../theme-manager';

/**
 * UI模板集合
 * 统一管理所有CLI界面的模板
 * 充分利用国际化和主题系统
 */
export class UITemplates {
  private static themeManager = ThemeManager.getInstance();

  /**
   * 文件状态面板模板 - 支持国际化和主题
   */
  static getFileStatusTemplate(stats: {
    totalAccounts: number;
    totalTransactions: number;
    totalBalances: number;
    totalErrors: number;
    filePath: string;
  }): string {
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;

    // 计算文本长度，确保不溢出
    const accountsText = t('status.accounts');
    const transactionsText = t('status.transactions');
    const balancesText = t('status.balances');
    const errorsText = t('status.errors');

    return [
      chalk.hex(primaryColor).bold(t('status.title')),
      '',
      '╭─────────────────╮╭─────────────────╮╭─────────────────╮╭─────────────────╮',
      `│📈 ${accountsText.padEnd(13)}││📝 ${transactionsText.padEnd(13)}││💰 ${balancesText.padEnd(13)}││⚠️ ${errorsText.padEnd(13)}│`,
      `│${stats.totalAccounts.toString().padStart(2)} 个           ││${stats.totalTransactions.toString().padStart(1)} 条            ││${stats.totalBalances.toString().padStart(1)} 个            ││${stats.totalErrors.toString().padStart(1)} 个            │`,
      '╰─────────────────╯╰─────────────────╯╰─────────────────╯╰─────────────────╯',
      '',
      '╭──────────────────────────────────────────────────────────────────────────╮',
      `│ 📁 ${t('status.filepath')}: ${stats.filePath.padEnd(55)} │`,
      '╰──────────────────────────────────────────────────────────────────────────╯',
      ''
    ].join('\n');
  }

  /**
   * 欢迎横幅模板 - 支持国际化和主题
   */
  static getWelcomeBannerTemplate(): string {
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;
    const secondaryColor = theme.colors.secondary;

    return [
      '',
      chalk.hex(primaryColor).bold('╭─────────────────────────────────────────────────────────────╮'),
      chalk.hex(primaryColor).bold('│                                                             │'),
      chalk.hex(primaryColor).bold(`│  🧮 ${t('cli.banner.title')}                        │`),
      chalk.hex(secondaryColor).bold(`│  ${t('cli.banner.subtitle')}                        │`),
      chalk.hex(primaryColor).bold('│                                                             │'),
      chalk.hex(theme.colors.muted).bold('│  版本: 1.0.0 | 支持国际化和主题定制                           │'),
      chalk.hex(primaryColor).bold('│                                                             │'),
      chalk.hex(primaryColor).bold('╰─────────────────────────────────────────────────────────────╯'),
      ''
    ].join('\n');
  }

  /**
   * 帮助信息模板 - 支持国际化和主题
   */
  static getHelpTemplate(commands: Array<{name: string; description: string; usage: string}>): string {
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;
    const textColor = theme.colors.text;

    const commandRows = commands.map(cmd => 
      `│ ${chalk.hex(primaryColor)(cmd.name.padEnd(15))} │ ${chalk.hex(textColor)(cmd.description.padEnd(30))} │ ${chalk.hex(theme.colors.muted)(cmd.usage.padEnd(20))} │`
    ).join('\n');

    return [
      chalk.hex(primaryColor).bold('📖 您可以使用的功能'),
      '',
      '╭─────────────────┬────────────────────────────────┬────────────────────╮',
      '│ 功能名称        │ 说明                            │ 使用方法            │',
      '├─────────────────┼────────────────────────────────┼────────────────────┤',
      commandRows,
      '╰─────────────────┴────────────────────────────────┴────────────────────╯',
      ''
    ].join('\n');
  }

  /**
   * 命令帮助详情模板 - 支持国际化和主题
   */
  static getCommandDetailTemplate(commandName: string, description: string, usage: string, examples: string[]): string {
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;
    const textColor = theme.colors.text;

    const exampleRows = examples.map(ex => `  ${chalk.hex(theme.colors.muted)('•')} ${chalk.hex(primaryColor)(ex)}`).join('\n');

    return [
      chalk.hex(primaryColor).bold(`📖 ${commandName} 功能说明`),
      '',
      '╭────────────────────────────────────────────────────────╮',
      `│ ${chalk.hex(primaryColor)('功能')}: ${chalk.hex(textColor)(description.padEnd(45))} │`,
      `│ ${chalk.hex(primaryColor)('用法')}: ${chalk.hex(textColor)(usage.padEnd(45))} │`,
      '├────────────────────────────────────────────────────────┤',
      `│ ${chalk.hex(primaryColor)('示例')}:`,
      exampleRows,
      '╰────────────────────────────────────────────────────────╯',
      ''
    ].join('\n');
  }

  /**
   * 成功消息模板 - 支持国际化和主题
   */
  static getSuccessTemplate(message: string): string {
    const theme = this.themeManager.getCurrentTheme();
    const successColor = theme.colors.success;
    const indicator = this.themeManager.createStatusIndicator('success');

    return [
      '',
      chalk.hex(successColor).bold(`${indicator} ${t('cli.success')}`),
      chalk.hex(successColor)(`   ${message}`),
      ''
    ].join('\n');
  }

  /**
   * 错误消息模板 - 支持国际化和主题
   */
  static getErrorTemplate(message: string, details?: string): string {
    const theme = this.themeManager.getCurrentTheme();
    const errorColor = theme.colors.error;
    const mutedColor = theme.colors.muted;
    const indicator = this.themeManager.createStatusIndicator('error');

    const lines = [
      '',
      chalk.hex(errorColor).bold(`${indicator} ${t('cli.error')}`),
      chalk.hex(errorColor)(`   ${message}`)
    ];

    if (details) {
      lines.push(chalk.hex(mutedColor)(`   详细说明: ${details}`));
    }

    lines.push('');
    return lines.join('\n');
  }

  /**
   * 警告消息模板 - 支持国际化和主题
   */
  static getWarningTemplate(message: string): string {
    const theme = this.themeManager.getCurrentTheme();
    const warningColor = theme.colors.warning;
    const indicator = this.themeManager.createStatusIndicator('warning');

    return [
      '',
      chalk.hex(warningColor).bold(`${indicator} 温馨提示`),
      chalk.hex(warningColor)(`   ${message}`),
      ''
    ].join('\n');
  }

  /**
   * 信息消息模板 - 支持国际化和主题
   */
  static getInfoTemplate(message: string): string {
    const theme = this.themeManager.getCurrentTheme();
    const infoColor = theme.colors.info;
    const indicator = this.themeManager.createStatusIndicator('info');

    return [
      '',
      chalk.hex(infoColor).bold(`${indicator} 小贴士`),
      chalk.hex(infoColor)(`   ${message}`),
      ''
    ].join('\n');
  }

  /**
   * 确认对话框模板 - 支持国际化和主题
   */
  static getConfirmTemplate(message: string): string {
    const theme = this.themeManager.getCurrentTheme();
    const warningColor = theme.colors.warning;
    const textColor = theme.colors.text;
    const mutedColor = theme.colors.muted;

    return [
      '',
      chalk.hex(warningColor).bold('❓ 请确认操作'),
      chalk.hex(textColor)(`   ${message}`),
      chalk.hex(mutedColor)('   请输入 y 或 yes 确认，n 或 no 取消'),
      ''
    ].join('\n');
  }

  /**
   * 输入提示模板 - 支持国际化和主题
   */
  static getInputPromptTemplate(label: string, placeholder?: string): string {
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;
    const textColor = theme.colors.text;
    const mutedColor = theme.colors.muted;

    const placeholderText = placeholder ? chalk.hex(mutedColor)(` (例如: ${placeholder})`) : '';
    return [
      '',
      chalk.hex(primaryColor).bold(`📝 请输入${label}`),
      chalk.hex(textColor)(`   请输入内容${placeholderText}:`),
      ''
    ].join('\n');
  }

  /**
   * 选择列表模板 - 支持国际化和主题
   */
  static getSelectionTemplate(title: string, options: string[]): string {
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;
    const textColor = theme.colors.text;
    const mutedColor = theme.colors.muted;

    const optionRows = options.map((opt, index) => 
      `  ${chalk.hex(primaryColor)(`${index + 1}.`)} ${chalk.hex(textColor)(opt)}`
    ).join('\n');

    return [
      '',
      chalk.hex(primaryColor).bold(`📋 请选择${title}`),
      '',
      optionRows,
      '',
      chalk.hex(mutedColor)('   请输入选项编号 (1, 2, 3...):'),
      ''
    ].join('\n');
  }

  /**
   * 进度条模板 - 支持国际化和主题
   */
  static getProgressTemplate(current: number, total: number, label: string): string {
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;
    const progressBar = this.themeManager.createProgressBar(current, total);
    
    return [
      '',
      chalk.hex(primaryColor).bold(`🔄 正在${label}`),
      `   ${progressBar} (${current}/${total})`,
      ''
    ].join('\n');
  }

  /**
   * 交易记录表格模板 - 支持国际化和主题
   */
  static getTransactionTableTemplate(transactions: any[], totalCount: number): string {
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;
    const textColor = theme.colors.text;
    const mutedColor = theme.colors.muted;

    if (transactions.length === 0) {
      return [
        '',
        chalk.hex(mutedColor)('📝 暂无交易记录'),
        chalk.hex(mutedColor)('   您可以添加一些交易记录来开始记账'),
        ''
      ].join('\n');
    }

    const tableHeader = [
      '╭────────────┬───────────────┬──────┬───────┬────────────────────────────────┬──────╮',
      '│ 日期       │ 收款人/付款人 │ 描述 │ 金额  │ 账户                           │ 标签 │',
      '├────────────┼───────────────┼──────┼───────┼────────────────────────────────┼──────┤'
    ].join('\n');

    const tableRows = transactions.map(tx => {
      const date = new Date(tx.date).toLocaleDateString('zh-CN');
      const payee = tx.payee || '-';
      const narration = tx.narration || '-';
      const amount = tx.amount || '¥0.00';
      const accounts = tx.postings?.map((p: any) => p.account).join('; ') || '-';
      const tags = tx.tags?.join(', ') || '-';
      
      return `│ ${chalk.hex(textColor)(date.padEnd(10))} │ ${chalk.hex(textColor)(payee.padEnd(13))} │ ${chalk.hex(textColor)(narration.padEnd(4))} │ ${chalk.hex(textColor)(amount.padEnd(5))} │ ${chalk.hex(textColor)(accounts.padEnd(30))} │ ${chalk.hex(textColor)(tags.padEnd(4))} │`;
    }).join('\n');

    const tableFooter = '╰────────────┴───────────────┴──────┴───────┴────────────────────────────────┴──────╯';

    return [
      '',
      chalk.hex(primaryColor).bold(`📝 您的交易记录 (共 ${totalCount} 条)`),
      '',
      tableHeader,
      tableRows,
      tableFooter,
      '',
      chalk.hex(mutedColor)(`第 1 页，共 1 页 (总计 ${totalCount} 条记录)`),
      ''
    ].join('\n');
  }

  /**
   * 账户列表模板 - 支持国际化和主题
   */
  static getAccountListTemplate(accounts: any[]): string {
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;
    const textColor = theme.colors.text;
    const mutedColor = theme.colors.muted;

    if (accounts.length === 0) {
      return [
        '',
        chalk.hex(mutedColor)('🏦 暂无账户'),
        chalk.hex(mutedColor)('   您可以先创建一些账户来开始记账'),
        ''
      ].join('\n');
    }

    const accountTypes = {
      'ASSETS': '💰 资产账户',
      'LIABILITIES': '💳 负债账户', 
      'INCOME': '💵 收入账户',
      'EXPENSES': '💸 支出账户',
      'EQUITY': '📊 权益账户'
    };

    const groupedAccounts: Record<string, any[]> = {};
    accounts.forEach(account => {
      const type = accountTypes[account.type as keyof typeof accountTypes] || '📁 其他账户';
      if (!groupedAccounts[type]) {
        groupedAccounts[type] = [];
      }
      groupedAccounts[type].push(account);
    });

    let result = [
      '',
      chalk.hex(primaryColor).bold('🏦 您的账户列表'),
      ''
    ];

    Object.entries(groupedAccounts).forEach(([typeName, typeAccounts]) => {
      result.push(chalk.hex(primaryColor).bold(typeName));
      typeAccounts.forEach(account => {
        const openDate = new Date(account.openDate).toLocaleDateString('zh-CN');
        result.push(`  • ${chalk.hex(textColor)(account.name)} ${chalk.hex(mutedColor)(`(创建于 ${openDate})`)}`);
      });
      result.push('');
    });

    return result.join('\n');
  }

  /**
   * 余额显示模板 - 支持国际化和主题
   */
  static getBalanceTemplate(balances: any[]): string {
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;
    const textColor = theme.colors.text;
    const successColor = theme.colors.success;
    const errorColor = theme.colors.error;
    const mutedColor = theme.colors.muted;

    if (balances.length === 0) {
      return [
        '',
        chalk.hex(mutedColor)('💰 暂无余额信息'),
        chalk.hex(mutedColor)('   您可以添加一些交易记录来查看余额'),
        ''
      ].join('\n');
    }

    const balanceRows = balances.map(balance => {
      const account = balance.account;
      const amount = balance.amount;
      const currency = amount.currency || 'CNY';
      const value = amount.number || 0;
      const formattedAmount = value >= 0 ? `+${value}` : `${value}`;
      const color = value >= 0 ? successColor : errorColor;
      
      return `│ ${chalk.hex(textColor)(account.padEnd(20))} │ ${chalk.hex(color)(formattedAmount.padStart(10))} ${chalk.hex(textColor)(currency.padEnd(3))} │`;
    }).join('\n');

    return [
      '',
      chalk.hex(primaryColor).bold('💰 您的账户余额'),
      '',
      '╭────────────────────┬──────────────╮',
      '│ 账户名称           │ 余额         │',
      '├────────────────────┼──────────────┤',
      balanceRows,
      '╰────────────────────┴──────────────╯',
      '',
      chalk.hex(mutedColor)('💡 正数表示有钱，负数表示欠钱'),
      ''
    ].join('\n');
  }

  /**
   * 净资产显示模板 - 支持国际化和主题
   */
  static getNetworthTemplate(networth: any): string {
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;
    const textColor = theme.colors.text;
    const successColor = theme.colors.success;
    const errorColor = theme.colors.error;
    const mutedColor = theme.colors.muted;

    const total = networth.total || 0;
    const currency = networth.currency || 'CNY';
    const color = total >= 0 ? successColor : errorColor;
    const status = total >= 0 ? '净资产' : '净负债';

    return [
      '',
      chalk.hex(primaryColor).bold('📊 您的财务状况'),
      '',
      '╭────────────────────────────────────────╮',
      `│ ${chalk.hex(primaryColor)('总资产')}: ${chalk.hex(successColor)((networth.assets || 0).toString().padStart(15))} ${chalk.hex(textColor)(currency.padEnd(3))} │`,
      `│ ${chalk.hex(primaryColor)('总负债')}: ${chalk.hex(errorColor)((networth.liabilities || 0).toString().padStart(15))} ${chalk.hex(textColor)(currency.padEnd(3))} │`,
      '├────────────────────────────────────────┤',
      `│ ${chalk.hex(primaryColor)(status)}: ${chalk.hex(color)(total.toString().padStart(15))} ${chalk.hex(textColor)(currency.padEnd(3))} │`,
      '╰────────────────────────────────────────╯',
      '',
      chalk.hex(mutedColor)('💡 净资产 = 总资产 - 总负债'),
      ''
    ].join('\n');
  }

  /**
   * 搜索结果模板 - 支持国际化和主题
   */
  static getSearchResultsTemplate(query: string, results: Array<{title: string; description: string; type: string}>): string {
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;
    const textColor = theme.colors.text;
    const mutedColor = theme.colors.muted;
    const warningColor = theme.colors.warning;

    if (results.length === 0) {
      return [
        '',
        chalk.hex(warningColor).bold('🔍 搜索结果'),
        chalk.hex(mutedColor)(`   没有找到与 "${query}" 相关的内容`),
        chalk.hex(mutedColor)('   请尝试其他关键词'),
        ''
      ].join('\n');
    }

    const resultRows = results.map((result, index) => [
      `  ${chalk.hex(primaryColor)(`${index + 1}.`)} ${chalk.hex(textColor).bold(result.title)}`,
      `     ${chalk.hex(mutedColor)(result.type)} - ${chalk.hex(textColor)(result.description)}`
    ].join('\n')).join('\n');

    return [
      '',
      chalk.hex(primaryColor).bold(`🔍 搜索结果 (找到 ${results.length} 项)`),
      chalk.hex(mutedColor)(`   搜索关键词: "${query}"`),
      '',
      resultRows,
      ''
    ].join('\n');
  }

  /**
   * 分隔线模板 - 支持主题
   */
  static getDividerTemplate(char: string = '─', length: number = 60): string {
    const theme = this.themeManager.getCurrentTheme();
    const mutedColor = theme.colors.muted;
    return chalk.hex(mutedColor)(char.repeat(length));
  }

  /**
   * 加载动画模板 - 支持国际化和主题
   */
  static getLoadingTemplate(message: string): string {
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;
    const mutedColor = theme.colors.muted;

    return [
      '',
      chalk.hex(primaryColor).bold(`⏳ 正在${message}`),
      chalk.hex(mutedColor)('   请稍等片刻...'),
      ''
    ].join('\n');
  }

  /**
   * 完成状态模板 - 支持国际化和主题
   */
  static getCompletionTemplate(message: string, duration?: number): string {
    const theme = this.themeManager.getCurrentTheme();
    const successColor = theme.colors.success;
    const mutedColor = theme.colors.muted;
    const indicator = this.themeManager.createStatusIndicator('success');

    const durationText = duration ? chalk.hex(mutedColor)(` (用时: ${duration}毫秒)`) : '';
    return [
      '',
      chalk.hex(successColor).bold(`${indicator} ${message}${durationText}`),
      ''
    ].join('\n');
  }

  /**
   * 主题信息模板
   */
  static getThemeInfoTemplate(): string {
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;
    const textColor = theme.colors.text;
    const mutedColor = theme.colors.muted;

    return [
      '',
      chalk.hex(primaryColor).bold('🎨 当前主题信息'),
      '',
      `主题名称: ${chalk.hex(textColor)(theme.name)}`,
      `主题类型: ${chalk.hex(textColor)(theme.type)}`,
      `主色调: ${chalk.hex(theme.colors.primary)(theme.colors.primary)}`,
      `次色调: ${chalk.hex(theme.colors.secondary)(theme.colors.secondary)}`,
      `Emoji: ${chalk.hex(textColor)(theme.emoji ? '启用' : '禁用')}`,
      `边框: ${chalk.hex(textColor)(theme.borders ? '启用' : '禁用')}`,
      `动画: ${chalk.hex(textColor)(theme.animations ? '启用' : '禁用')}`,
      '',
      chalk.hex(mutedColor)('💡 使用 /config theme <主题名> 切换主题'),
      ''
    ].join('\n');
  }

  /**
   * 语言信息模板
   */
  static getLanguageInfoTemplate(): string {
    const { getLanguage } = require('../../utils/i18n');
    const currentLang = getLanguage();
    const theme = this.themeManager.getCurrentTheme();
    const primaryColor = theme.colors.primary;
    const textColor = theme.colors.text;
    const mutedColor = theme.colors.muted;

    const languageNames = {
      'zh-CN': '简体中文',
      'en-US': 'English'
    };

    return [
      '',
      chalk.hex(primaryColor).bold('🌍 当前语言信息'),
      '',
      `当前语言: ${chalk.hex(textColor)(languageNames[currentLang as keyof typeof languageNames] || currentLang)}`,
      `语言代码: ${chalk.hex(textColor)(currentLang)}`,
      '',
      chalk.hex(mutedColor)('💡 使用 /config language <语言代码> 切换语言'),
      ''
    ].join('\n');
  }
} 