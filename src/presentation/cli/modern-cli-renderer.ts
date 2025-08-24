/**
 * 现代化CLI渲染器
 * 使用权威的CLI库构建响应式、兼容的界面
 * 
 * @author JanYork
 */

import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import cliTable from 'cli-table3';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { t } from '../../utils/i18n';
import { ThemeManager } from './theme-manager';

/**
 * 现代化CLI渲染器
 * 提供响应式、兼容的CLI界面渲染
 */
export class ModernCLIRenderer {
  private static themeManager = ThemeManager.getInstance();

  /**
   * 获取终端宽度
   */
  private static getTerminalWidth(): number {
    return process.stdout.columns || 80;
  }

  /**
   * 智能文本截断
   */
  private static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * 显示现代化横幅
   */
  static showModernBanner(): void {
    const title = 'Beancount CLI';
    const subtitle = t('cli.banner.subtitle');
    
    // 使用figlet生成ASCII艺术标题
    const asciiTitle = figlet.textSync(title, {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    });

    // 使用gradient美化标题
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
  }

  /**
   * 显示现代化状态卡片
   */
  static showModernStatus(stats: {
    totalAccounts: number;
    totalTransactions: number;
    totalBalances: number;
    totalErrors: number;
    filePath: string;
  }): void {
    const terminalWidth = this.getTerminalWidth();
    const isWide = terminalWidth >= 100;
    
    if (isWide) {
      this.showWideStatus(stats);
    } else {
      this.showCompactStatus(stats);
    }
  }

  /**
   * 显示宽屏状态布局
   */
  private static showWideStatus(stats: any): void {
    const table = new cliTable({
      head: [
        chalk.cyan('📊 指标'),
        chalk.cyan('📈 账户'),
        chalk.cyan('📝 交易'),
        chalk.cyan('💰 余额'),
        chalk.cyan('⚠️ 错误')
      ],
      colWidths: [15, 12, 12, 12, 12],
      style: {
        head: ['cyan'],
        border: ['gray']
      }
    });

    table.push([
      chalk.bold('数量'),
      chalk.green(stats.totalAccounts.toString()),
      chalk.blue(stats.totalTransactions.toString()),
      chalk.yellow(stats.totalBalances.toString()),
      stats.totalErrors > 0 ? chalk.red(stats.totalErrors.toString()) : chalk.gray('0')
    ]);

    console.log(table.toString());
    console.log(chalk.gray(`📁 文件: ${stats.filePath}`));
    console.log();
  }

  /**
   * 显示紧凑状态布局
   */
  private static showCompactStatus(stats: any): void {
    const items = [
      { icon: '📈', label: '账户', value: stats.totalAccounts, color: 'green' },
      { icon: '📝', label: '交易', value: stats.totalTransactions, color: 'blue' },
      { icon: '💰', label: '余额', value: stats.totalBalances, color: 'yellow' },
      { icon: '⚠️', label: '错误', value: stats.totalErrors, color: 'red' }
    ];

    const statusLine = items.map(item => {
      const colorFn = chalk[item.color as keyof typeof chalk] as any;
      return `${item.icon} ${chalk.bold(item.label)}: ${colorFn(item.value)}`;
    }).join('  ');

    console.log(chalk.bold('📊 文件状态'));
    console.log(statusLine);
    console.log(chalk.gray(`📁 ${stats.filePath}`));
    console.log();
  }

  /**
   * 显示现代化帮助信息
   */
  static showModernHelp(commands: Array<{name: string; description: string; usage: string}>): void {
    const terminalWidth = this.getTerminalWidth();
    const isWide = terminalWidth >= 120;

    if (isWide) {
      this.showWideHelp(commands);
    } else {
      this.showCompactHelp(commands);
    }
  }

  /**
   * 显示宽屏帮助布局
   */
  private static showWideHelp(commands: any[]): void {
    const table = new cliTable({
      head: [
        chalk.cyan('命令'),
        chalk.cyan('说明'),
        chalk.cyan('用法')
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

    console.log(chalk.bold('📖 可用命令'));
    console.log(table.toString());
  }

  /**
   * 显示紧凑帮助布局
   */
  private static showCompactHelp(commands: any[]): void {
    console.log(chalk.bold('📖 可用命令'));
    console.log();

    commands.forEach(cmd => {
      console.log(chalk.bold(cmd.name));
      console.log(chalk.gray(`  ${cmd.description}`));
      console.log(chalk.dim(`  用法: ${cmd.usage}`));
      console.log();
    });
  }

  /**
   * 显示现代化交易表格
   */
  static showModernTransactions(transactions: any[], totalCount: number): void {
    if (transactions.length === 0) {
      console.log(chalk.yellow('📝 暂无交易记录'));
      console.log(chalk.gray('   您可以添加一些交易记录来开始记账'));
      console.log();
      return;
    }

    const terminalWidth = this.getTerminalWidth();
    const isWide = terminalWidth >= 120;

    if (isWide) {
      this.showWideTransactionTable(transactions);
    } else {
      this.showCompactTransactionList(transactions);
    }

    console.log(chalk.gray(`📄 共 ${totalCount} 条记录`));
    console.log();
  }

  /**
   * 显示宽屏交易表格
   */
  private static showWideTransactionTable(transactions: any[]): void {
    const table = new cliTable({
      head: [
        chalk.cyan('日期'),
        chalk.cyan('描述'),
        chalk.cyan('金额'),
        chalk.cyan('账户')
      ],
      colWidths: [12, 30, 15, 40],
      style: {
        head: ['cyan'],
        border: ['gray']
      }
    });

    transactions.forEach(tx => {
      const date = new Date(tx.date).toLocaleDateString('zh-CN');
      const narration = this.truncateText(tx.narration || '-', 28);
      const amount = tx.amount || '¥0.00';
      const accounts = this.truncateText(
        tx.postings?.map((p: any) => p.account).join('; ') || '-',
        38
      );

      table.push([
        date,
        narration,
        chalk.bold(amount),
        accounts
      ]);
    });

    console.log(table.toString());
  }

  /**
   * 显示紧凑交易列表
   */
  private static showCompactTransactionList(transactions: any[]): void {
    transactions.forEach((tx, index) => {
      const date = new Date(tx.date).toLocaleDateString('zh-CN');
      const narration = tx.narration || '-';
      const amount = tx.amount || '¥0.00';

      console.log(chalk.bold(`${index + 1}. ${date}`));
      console.log(chalk.gray(`   描述: ${narration}`));
      console.log(chalk.blue(`   金额: ${amount}`));
      
      if (tx.postings?.length) {
        const accounts = tx.postings.map((p: any) => p.account).join(' → ');
        console.log(chalk.dim(`   账户: ${accounts}`));
      }
      console.log();
    });
  }

  /**
   * 显示现代化余额信息
   */
  static showModernBalance(balances: any[]): void {
    if (balances.length === 0) {
      console.log(chalk.yellow('💰 暂无余额信息'));
      console.log(chalk.gray('   您可以添加一些交易记录来查看余额'));
      console.log();
      return;
    }

    const table = new cliTable({
      head: [
        chalk.cyan('账户'),
        chalk.cyan('余额'),
        chalk.cyan('货币')
      ],
      colWidths: [30, 15, 8],
      style: {
        head: ['cyan'],
        border: ['gray']
      }
    });

    balances.forEach(balance => {
      const account = balance.account;
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

    console.log(chalk.bold('💰 账户余额'));
    console.log(table.toString());
    console.log();
  }

  /**
   * 显示现代化账户列表
   */
  static showModernAccounts(accounts: any[]): void {
    if (accounts.length === 0) {
      console.log(chalk.yellow('🏦 暂无账户'));
      console.log(chalk.gray('   您可以先创建一些账户来开始记账'));
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
      'ASSETS': '💰 资产账户',
      'LIABILITIES': '💳 负债账户',
      'INCOME': '💵 收入账户',
      'EXPENSES': '💸 支出账户',
      'EQUITY': '📊 权益账户'
    };

    Object.entries(grouped).forEach(([type, typeAccounts]) => {
      console.log(chalk.bold(typeNames[type as keyof typeof typeNames] || '📁 其他账户'));
      
      (typeAccounts as any[]).forEach((account: any) => {
        const openDate = new Date(account.openDate).toLocaleDateString('zh-CN');
        console.log(chalk.gray(`  • ${account.name} (创建于 ${openDate})`));
      });
      console.log();
    });
  }

  /**
   * 显示现代化成功消息
   */
  static showModernSuccess(message: string): void {
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
   * 显示现代化错误消息
   */
  static showModernError(message: string, details?: string): void {
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
   * 显示现代化警告消息
   */
  static showModernWarning(message: string): void {
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
   * 显示现代化信息消息
   */
  static showModernInfo(message: string): void {
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
   * 显示现代化加载动画
   */
  static showModernLoading(message: string): any {
    return ora({
      text: message,
      color: 'cyan',
      spinner: 'dots'
    });
  }

  /**
   * 显示现代化进度条
   */
  static showModernProgress(current: number, total: number, label: string): void {
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
   * 显示现代化分隔线
   */
  static showModernDivider(): void {
    const width = this.getTerminalWidth();
    const line = '─'.repeat(width - 2);
    console.log(chalk.gray(`┌${line}┐`));
  }

  /**
   * 清除屏幕
   */
  static clearScreen(): void {
    console.clear();
  }

  /**
   * 显示现代化命令提示
   */
  static showModernPrompt(): void {
    const prompt = chalk.cyan('💡 输入命令') + chalk.gray(' (输入 help 查看帮助):');
    process.stdout.write(prompt + ' ');
  }
} 