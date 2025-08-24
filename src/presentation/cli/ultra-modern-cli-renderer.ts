/**
 * 超现代化CLI渲染器
 * 使用最先进的CLI库构建惊艳的用户体验
 * 
 * @author JanYork
 */

import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import cliTable from 'cli-table3';
import figlet from 'figlet';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import terminalSize from 'terminal-size';
import cliCursor from 'cli-cursor';
import cliTruncate from 'cli-truncate';
import cliColumns from 'cli-columns';
import wrapAnsi from 'wrap-ansi';
import { t } from '../../utils/i18n';
import { ThemeManager } from './theme-manager';
import { AccountTranslator } from '../../utils/account-translator';

/**
 * 超现代化CLI渲染器
 * 提供惊艳的视觉效果和流畅的用户体验
 */
export class UltraModernCLIRenderer {
  private static themeManager = ThemeManager.getInstance();

  /**
   * 获取终端尺寸
   */
  private static getTerminalSize() {
    try {
      return terminalSize();
    } catch {
      return { columns: 80, rows: 24 };
    }
  }

  /**
   * 智能文本截断
   */
  private static truncateText(text: string, maxLength: number): string {
    return cliTruncate(text, maxLength, { position: 'end' });
  }

  /**
   * 显示动画横幅
   */
  static async showAnimatedBanner(): Promise<void> {
    cliCursor.hide();
    
    const title = 'Beancount CLI';
    const subtitle = t('cli.banner.subtitle');
    
    // 生成ASCII艺术字
    const asciiTitle = figlet.textSync(title, {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    });

    // 使用动画效果
    const animation = chalkAnimation.rainbow(asciiTitle);
    
    // 等待动画完成
    await new Promise(resolve => setTimeout(resolve, 2000));
    animation.stop();

    // 显示渐变标题
    const gradientTitle = gradient.pastel.multiline(asciiTitle);
    
    // 使用boxen包装
    const banner = boxen(
      `${gradientTitle}\n\n${chalk.gray(subtitle)}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: this.themeManager.getColor('primary'),
        backgroundColor: 'black'
      }
    );

    console.log(banner);
    cliCursor.show();
  }

  /**
   * 显示动态状态卡片
   */
  static showDynamicStatus(stats: {
    totalAccounts: number;
    totalTransactions: number;
    totalBalances: number;
    totalErrors: number;
    filePath: string;
  }): void {
    const { columns } = this.getTerminalSize();
    const isWide = columns >= 100;
    
    if (isWide) {
      this.showWideDynamicStatus(stats);
    } else {
      this.showCompactDynamicStatus(stats);
    }
  }

  /**
   * 显示宽屏动态状态
   */
  private static showWideDynamicStatus(stats: any): void {
    const table = new cliTable({
      head: [
        chalk.cyan(`📊 ${t('status.metrics')}`),
        chalk.cyan(`📈 ${t('status.accounts')}`),
        chalk.cyan(`📝 ${t('status.transactions')}`),
        chalk.cyan(`💰 ${t('status.balances')}`),
        chalk.cyan(`⚠️ ${t('status.errors')}`)
      ],
      colWidths: [15, 12, 12, 12, 12],
      style: {
        head: ['cyan'],
        border: ['gray']
      }
    });

    table.push([
      chalk.bold(t('status.count')),
      chalk.green(stats.totalAccounts.toString()),
      chalk.blue(stats.totalTransactions.toString()),
      chalk.yellow(stats.totalBalances.toString()),
      stats.totalErrors > 0 ? chalk.red(stats.totalErrors.toString()) : chalk.gray('0')
    ]);

    console.log(table.toString());
    
    // 使用cli-columns显示文件路径
    const fileInfo = [`📁 ${t('status.file')}: ${stats.filePath}`];
    console.log(cliColumns(fileInfo, { width: 80 }));
    console.log();
  }

  /**
   * 显示紧凑动态状态
   */
  private static showCompactDynamicStatus(stats: any): void {
    const items = [
      { icon: '📈', label: t('status.accounts'), value: stats.totalAccounts, color: 'green' },
      { icon: '📝', label: t('status.transactions'), value: stats.totalTransactions, color: 'blue' },
      { icon: '💰', label: t('status.balances'), value: stats.totalBalances, color: 'yellow' },
      { icon: '⚠️', label: t('status.errors'), value: stats.totalErrors, color: 'red' }
    ];

    // 使用cli-columns优化布局
    const statusItems = items.map(item => {
      const colorFn = chalk[item.color as keyof typeof chalk] as any;
      return `${item.icon} ${chalk.bold(item.label)}: ${colorFn(item.value)}`;
    });

    console.log(chalk.bold(`📊 ${t('status.title')}`));
    console.log(cliColumns(statusItems, { 
      width: 80,
      padding: 2
    }));
    console.log(chalk.gray(`📁 ${stats.filePath}`));
    console.log();
  }

  /**
   * 显示交互式帮助信息
   */
  static showInteractiveHelp(commands: Array<{name: string; description: string; usage: string}>): void {
    const { columns } = this.getTerminalSize();
    const isWide = columns >= 120;

    if (isWide) {
      this.showWideInteractiveHelp(commands);
    } else {
      this.showCompactInteractiveHelp(commands);
    }
  }

  /**
   * 显示宽屏交互式帮助
   */
  private static showWideInteractiveHelp(commands: any[]): void {
    const table = new cliTable({
      head: [
        chalk.cyan(t('table.command')),
        chalk.cyan('说明'),
        chalk.cyan(t('table.usage'))
      ],
      colWidths: [20, 40, 50],
      style: {
        head: ['cyan'],
        border: ['gray']
      }
    });

    commands.forEach(cmd => {
      table.push([
        chalk.bold(cmd.name),
        cmd.description,
        chalk.gray(cmd.usage)
      ]);
    });

    console.log(chalk.bold(`📖 ${t('table.available.commands')}`));
    console.log(table.toString());
  }

  /**
   * 显示紧凑交互式帮助
   */
  private static showCompactInteractiveHelp(commands: any[]): void {
    console.log(chalk.bold(`📖 ${t('table.available.commands')}`));
    console.log();

    // 按类别分组显示
    const categories = {
      [t('category.basic')]: ['add_transaction', 'edit_transaction', 'delete_transaction'],
      [t('category.query')]: ['list_transactions', 'list_accounts', 'show_balance', 'show_networth'],
      [t('category.system')]: ['config', 'validate', 'export', 'search'],
      [t('category.file')]: ['init_structure', 'check_structure']
    };

    Object.entries(categories).forEach(([category, commandNames]) => {
      console.log(chalk.cyan.bold(category));
      
      const categoryCommands = commands.filter(cmd => commandNames.includes(cmd.name));
      const commandList = categoryCommands.map(cmd => 
        `${chalk.bold(cmd.name)}\n${chalk.gray(cmd.description)}`
      );

      if (commandList.length > 0) {
        console.log(cliColumns(commandList, { 
          width: 70,
          padding: 1
        }));
      }
      console.log();
    });
  }

  /**
   * 显示动画交易表格
   */
  static async showAnimatedTransactions(transactions: any[], totalCount: number): Promise<void> {
    if (transactions.length === 0) {
      console.log(chalk.yellow(t('table.no.transactions')));
      console.log(chalk.gray(t('table.no.transactions.hint')));
      console.log();
      return;
    }

    const { columns } = this.getTerminalSize();
    const isWide = columns >= 120;

    if (isWide) {
      await this.showWideAnimatedTransactionTable(transactions);
    } else {
      await this.showCompactAnimatedTransactionList(transactions);
    }

    console.log(chalk.gray(t('table.total.records', { count: totalCount.toString() })));
    console.log();
  }

  /**
   * 显示宽屏动画交易表格
   */
  private static async showWideAnimatedTransactionTable(transactions: any[]): Promise<void> {
    const table = new cliTable({
      head: [
        chalk.cyan(t('table.date')),
        chalk.cyan(t('table.description')),
        chalk.cyan(t('table.amount')),
        chalk.cyan(t('table.account'))
      ],
      colWidths: [12, 30, 15, 40],
      style: {
        head: ['cyan'],
        border: ['gray']
      }
    });

    // 逐行添加动画效果
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      const date = new Date(tx.date).toLocaleDateString('zh-CN');
      const narration = this.truncateText(tx.narration || '-', 28);
      const amount = tx.amount || '¥0.00';
      const accounts = this.truncateText(
        tx.postings?.map((p: any) => AccountTranslator.translate(p.account)).join('; ') || '-',
        38
      );

      table.push([
        date,
        narration,
        chalk.bold(amount),
        accounts
      ]);

      // 每添加一行就显示一次，创造动画效果
      if (i === 0) {
        console.log(chalk.bold(t('table.transaction.records')));
        console.log(table.toString());
      } else {
        // 清除之前的输出并重新显示
        process.stdout.write('\x1b[2K\x1b[1G');
        console.log(chalk.bold(t('table.transaction.records')));
        console.log(table.toString());
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * 显示紧凑动画交易列表
   */
  private static async showCompactAnimatedTransactionList(transactions: any[]): Promise<void> {
    console.log(chalk.bold(t('table.transaction.records')));
    console.log();

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      const date = new Date(tx.date).toLocaleDateString('zh-CN');
      const narration = tx.narration || '-';
      const amount = tx.amount || '¥0.00';

      console.log(chalk.bold(`${i + 1}. ${date}`));
      console.log(chalk.gray(`   ${t('table.description')}: ${narration}`));
      console.log(chalk.blue(`   ${t('table.amount')}: ${amount}`));
      
      if (tx.postings?.length) {
        const accounts = tx.postings.map((p: any) => AccountTranslator.translate(p.account)).join(' → ');
        console.log(chalk.dim(`   ${t('table.account')}: ${accounts}`));
      }
      console.log();

      // 添加延迟创造动画效果
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  /**
   * 显示动画余额信息
   */
  static showAnimatedBalance(balances: any[]): void {
    if (balances.length === 0) {
      console.log(chalk.yellow(t('table.no.balance')));
      console.log(chalk.gray(t('table.no.balance.hint')));
      console.log();
      return;
    }

    const table = new cliTable({
      head: [
        chalk.cyan(t('balance.account')),
        chalk.cyan(t('balance.amount')),
        chalk.cyan(t('balance.currency'))
      ],
      colWidths: [30, 15, 8],
      style: {
        head: ['cyan'],
        border: ['gray']
      }
    });

    balances.forEach(balance => {
      const account = AccountTranslator.translate(balance.account);
      const amount = balance.amount.number || 0;
      const currency = balance.amount.currency || 'CNY';
      
      const color = amount >= 0 ? 'green' : 'red';
      const formattedAmount = amount >= 0 ? `+${amount}` : `${amount}`;

      const colorFn = chalk[color as keyof typeof chalk] as any;
      table.push([
        account,
        colorFn(formattedAmount),
        currency
      ]);
    });

    console.log(chalk.bold(t('balance.title')));
    console.log(table.toString());
    console.log();
  }

  /**
   * 显示动画账户列表
   */
  static showAnimatedAccounts(accounts: any[]): void {
    if (accounts.length === 0) {
      console.log(chalk.yellow(t('table.no.accounts')));
      console.log(chalk.gray(t('table.no.accounts.hint')));
      console.log();
      return;
    }

    // 按类型分组
    const grouped = accounts.reduce((acc, account) => {
      const type = account.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(account);
      return acc;
    }, {} as Record<string, any[]>);

    const typeNames = {
      'ASSETS': t('account.type.assets'),
      'LIABILITIES': t('account.type.liabilities'),
      'INCOME': t('account.type.income'),
      'EXPENSES': t('account.type.expenses'),
      'EQUITY': t('account.type.equity')
    };

    Object.entries(grouped).forEach(([type, typeAccounts]) => {
      console.log(chalk.bold(typeNames[type as keyof typeof typeNames] || t('account.type.other')));
      
      (typeAccounts as any[]).forEach((account: any) => {
        const openDate = new Date(account.openDate).toLocaleDateString('zh-CN');
        const translatedName = AccountTranslator.translate(account.name);
        console.log(chalk.gray(`  • ${translatedName} (${t('account.created')} ${openDate})`));
      });
      console.log();
    });
  }

  /**
   * 显示动画成功消息
   */
  static showAnimatedSuccess(message: string): void {
    const successBox = boxen(
      chalk.green(`✅ ${message}`),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green',
        backgroundColor: 'black'
      }
    );
    console.log(successBox);
  }

  /**
   * 显示动画错误消息
   */
  static showAnimatedError(message: string, details?: string): void {
    const errorContent = details 
      ? `${chalk.red(`❌ ${message}`)}\n${chalk.gray(details)}`
      : chalk.red(`❌ ${message}`);

    const errorBox = boxen(
      errorContent,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'red',
        backgroundColor: 'black'
      }
    );
    console.log(errorBox);
  }

  /**
   * 显示动画警告消息
   */
  static showAnimatedWarning(message: string): void {
    const warningBox = boxen(
      chalk.yellow(`⚠️ ${message}`),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'yellow',
        backgroundColor: 'black'
      }
    );
    console.log(warningBox);
  }

  /**
   * 显示动画信息消息
   */
  static showAnimatedInfo(message: string): void {
    const infoBox = boxen(
      chalk.blue(`ℹ️ ${message}`),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'blue',
        backgroundColor: 'black'
      }
    );
    console.log(infoBox);
  }

  /**
   * 显示动画加载
   */
  static showAnimatedLoading(message: string): any {
    return ora({
      text: message,
      color: 'cyan',
      spinner: 'dots'
    });
  }

  /**
   * 显示动画进度条
   */
  static showAnimatedProgress(current: number, total: number, label: string): void {
    const percentage = Math.round((current / total) * 100);
    const barLength = 30;
    const filledLength = Math.round((current / total) * barLength);
    
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(barLength - filledLength);
    
    console.log(chalk.cyan(`🔄 ${label}`));
    console.log(`${filled}${empty} ${percentage}% (${current}/${total})`);
    console.log();
  }

  /**
   * 显示动画分隔线
   */
  static showAnimatedDivider(): void {
    const { columns } = this.getTerminalSize();
    const line = '─'.repeat(columns - 2);
    console.log(chalk.gray(`┌${line}┐`));
  }

  /**
   * 清除屏幕
   */
  static clearScreen(): void {
    console.clear();
  }

  /**
   * 显示动画命令提示
   */
  static showAnimatedPrompt(): void {
    const prompt = chalk.cyan(t('prompt.enter.command')) + chalk.gray(` (${t('prompt.help.hint')}):`);
    process.stdout.write(prompt + ' ');
  }

  /**
   * 显示包装文本
   */
  static showWrappedText(text: string, width: number = 80): void {
    const wrapped = wrapAnsi(text, width, { trim: true });
    console.log(wrapped);
  }
} 