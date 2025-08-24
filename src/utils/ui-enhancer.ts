/**
 * UI增强工具类
 * 提供更好的命令行界面和样式
 *
 * 作者: JanYork
 */

import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import boxen from 'boxen';
import terminalLink from 'terminal-link';
import cliProgress from 'cli-progress';
import cliSpinners from 'cli-spinners';
import { table } from 'table';
import { PaginationInfo, SearchOptions } from '../types';

export class UIEnhancer {
  private static progressBar: cliProgress.SingleBar | null = null;

  /**
   * 显示彩色横幅
   */
  static showBanner(title: string, subtitle?: string): void {
    console.log();

    // 使用figlet生成ASCII艺术字
    const bannerText = figlet.textSync(title, {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    });

    // 应用渐变色
    const gradientBanner = gradient(['#ff6b6b', '#4ecdc4', '#45b7d1'])(bannerText);
    console.log(gradientBanner);

    if (subtitle) {
      console.log(chalk.cyan.bold(`\n${subtitle}`));
    }
    console.log();
  }

  /**
   * 显示带边框的消息框
   */
  static showMessageBox(message: string, title?: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
    };

    const color = colors[type];
    const content = title ? `${color.bold(title)}\n\n${message}` : message;

    const box = boxen(content, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'blue',
    });

    console.log(box);
  }

  /**
   * 显示进度条
   */
  static showProgress(title: string, total: number): void {
    this.progressBar = new cliProgress.SingleBar({
      format: `${title} |${chalk.cyan('{bar}')}| {percentage}% | {value}/{total}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });

    this.progressBar.start(total, 0);
  }

  /**
   * 更新进度条
   */
  static updateProgress(value: number): void {
    if (this.progressBar) {
      this.progressBar.update(value);
    }
  }

  /**
   * 完成进度条
   */
  static completeProgress(): void {
    if (this.progressBar) {
      this.progressBar.stop();
      this.progressBar = null;
    }
  }

  /**
   * 显示加载动画
   */
  static showSpinner(text: string): NodeJS.Timeout {
    const spinner = cliSpinners.dots;
    let i = 0;

    const interval = setInterval(() => {
      process.stdout.write(`\r${spinner.frames[i]} ${text}`);
      i = (i + 1) % spinner.frames.length;
    }, spinner.interval);

    return interval;
  }

  /**
   * 停止加载动画
   */
  static stopSpinner(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    process.stdout.write('\r\x1b[K'); // 清除当前行
  }

  /**
   * 显示分页表格
   */
  static showPaginatedTable(
    data: any[][],
    headers: string[],
    pagination: PaginationInfo,
    title?: string
  ): void {
    if (title) {
      console.log(chalk.blue.bold(`\n${title}`));
    }

    // 显示表格
    const tableData = [headers, ...data];
    const tableOutput = table(tableData, {
      border: {
        topBody: '─',
        topJoin: '┬',
        topLeft: '┌',
        topRight: '┐',
        bottomBody: '─',
        bottomJoin: '┴',
        bottomLeft: '└',
        bottomRight: '┘',
        bodyLeft: '│',
        bodyRight: '│',
        bodyJoin: '│',
        joinBody: '─',
        joinLeft: '├',
        joinRight: '┤',
        joinJoin: '┼',
      },
    });

    console.log(tableOutput);

    // 显示分页信息
    this.showPaginationInfo(pagination);
  }

  /**
   * 显示分页信息
   */
  static showPaginationInfo(pagination: PaginationInfo): void {
    const { currentPage, totalPages, totalRecords, hasNext, hasPrev } = pagination;

    console.log(chalk.gray(`\n第 ${currentPage} 页，共 ${totalPages} 页 (总计 ${totalRecords} 条记录)`));

    const navigation = [];
    if (hasPrev) {
      navigation.push(chalk.cyan('← 上一页'));
    }
    if (hasNext) {
      navigation.push(chalk.cyan('下一页 →'));
    }

    if (navigation.length > 0) {
      console.log(chalk.gray(`导航: ${navigation.join(' | ')}`));
    }
  }

  /**
   * 显示搜索过滤器
   */
  static showSearchFilters(filters: SearchOptions): void {
    if (!filters.query && !filters.startDate && !filters.endDate &&
        !filters.accounts?.length && !filters.tags?.length) {
      return;
    }

    console.log(chalk.yellow.bold('\n🔍 当前搜索过滤器:'));

    if (filters.query) {
      console.log(chalk.gray(`  关键词: ${filters.query}`));
    }

    if (filters.startDate || filters.endDate) {
      const start = filters.startDate?.toLocaleDateString() || '不限';
      const end = filters.endDate?.toLocaleDateString() || '不限';
      console.log(chalk.gray(`  日期范围: ${start} 至 ${end}`));
    }

    if (filters.accounts?.length) {
      console.log(chalk.gray(`  账户: ${filters.accounts.join(', ')}`));
    }

    if (filters.tags?.length) {
      console.log(chalk.gray(`  标签: ${filters.tags.join(', ')}`));
    }

    if (filters.amountRange) {
      const { min, max, currency } = filters.amountRange;
      const range = [];
      if (min !== undefined) range.push(`≥ ${min} ${currency || ''}`);
      if (max !== undefined) range.push(`≤ ${max} ${currency || ''}`);
      if (range.length) {
        console.log(chalk.gray(`  金额范围: ${range.join(' 且 ')}`));
      }
    }

    console.log();
  }

  /**
   * 显示统计卡片
   */
  static showStatCard(title: string, value: string | number, unit?: string, trend?: number): void {
    const valueStr = typeof value === 'number' ? value.toLocaleString() : value;
    const displayValue = unit ? `${valueStr} ${unit}` : valueStr;

    let trendIcon = '';
    let trendColor = chalk.gray;

    if (trend !== undefined) {
      if (trend > 0) {
        trendIcon = '↗';
        trendColor = chalk.green;
      } else if (trend < 0) {
        trendIcon = '↘';
        trendColor = chalk.red;
      } else {
        trendIcon = '→';
        trendColor = chalk.gray;
      }
    }

    const card = boxen(
      `${chalk.blue.bold(title)}\n\n${chalk.white.bold(displayValue)} ${trendColor(trendIcon)}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'blue',
      }
    );

    console.log(card);
  }

  /**
   * 显示链接
   */
  static showLink(text: string, url: string): void {
    const link = terminalLink(text, url);
    console.log(chalk.blue(link));
  }

  /**
   * 显示成功消息
   */
  static showSuccess(message: string): void {
    console.log(chalk.green.bold('✅ ' + message));
  }

  /**
   * 显示错误消息
   */
  static showError(message: string): void {
    console.log(chalk.red.bold('❌ ' + message));
  }

  /**
   * 显示警告消息
   */
  static showWarning(message: string): void {
    console.log(chalk.yellow.bold('⚠️  ' + message));
  }

  /**
   * 显示信息消息
   */
  static showInfo(message: string): void {
    console.log(chalk.blue.bold('ℹ️  ' + message));
  }

  /**
   * 显示分隔线
   */
  static showDivider(char: string = '─', length: number = 50): void {
    console.log(chalk.gray(char.repeat(length)));
  }

  /**
   * 显示彩色列表
   */
  static showList(items: string[], title?: string, color: 'blue' | 'green' | 'yellow' | 'red' = 'blue'): void {
    if (title) {
      console.log(chalk[color].bold(`\n${title}`));
    }

    items.forEach((item, index) => {
      console.log(chalk[color](`  ${index + 1}. ${item}`));
    });
    console.log();
  }

  /**
   * 显示确认对话框
   */
  static async showConfirmation(message: string): Promise<boolean> {
    const inquirer = await import('inquirer');

    const { confirm } = await inquirer.default.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message,
        default: false,
      },
    ]);

    return confirm;
  }

  /**
   * 显示选择列表
   */
  static async showSelection<T>(
    message: string,
    choices: Array<{ name: string; value: T }>
  ): Promise<T> {
    const inquirer = await import('inquirer');

    const { selected } = await inquirer.default.prompt([
      {
        type: 'list',
        name: 'selected',
        message,
        choices,
      },
    ]);

    return selected;
  }

  /**
   * 显示多选列表
   */
  static async showMultiSelection<T>(
    message: string,
    choices: Array<{ name: string; value: T; checked?: boolean }>
  ): Promise<T[]> {
    const inquirer = await import('inquirer');

    const { selected } = await inquirer.default.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message,
        choices,
      },
    ]);

    return selected;
  }

  /**
   * 显示输入框
   */
  static async showInput(message: string, defaultValue?: string): Promise<string> {
    const inquirer = await import('inquirer');

    const { input } = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'input',
        message,
        default: defaultValue,
      },
    ]);

    return input;
  }

  /**
   * 显示密码输入框
   */
  static async showPassword(message: string): Promise<string> {
    const inquirer = await import('inquirer');

    const { password } = await inquirer.default.prompt([
      {
        type: 'password',
        name: 'password',
        message,
      },
    ]);

    return password;
  }

  /**
   * 清除屏幕
   */
  static clearScreen(): void {
    console.clear();
  }

  /**
   * 格式化金额
   */
  static formatAmount(amount: number, currency: string = 'CNY'): string {
    const formatted = amount.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const currencySymbols: Record<string, string> = {
      CNY: '¥',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${formatted}`;
  }

  /**
   * 格式化日期
   */
  static formatDate(date: Date): string {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  /**
   * 格式化日期时间
   */
  static formatDateTime(date: Date): string {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
