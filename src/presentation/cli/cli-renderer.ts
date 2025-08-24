/**
 * CLI渲染器
 * 负责提供美观、用户友好的命令行界面
 * 使用模板系统统一管理UI输出
 * 
 * @author JanYork
 */

import chalk from 'chalk';
import boxen from 'boxen';
import { table } from 'table';
import cliProgress from 'cli-progress';
import ora from 'ora';
import { UITemplates } from './templates/ui-templates';
import { ModernCLIRenderer } from './modern-cli-renderer';
import { UltraModernCLIRenderer } from './ultra-modern-cli-renderer';

/**
 * CLI渲染器类
 * 提供统一的界面渲染功能
 * 使用模板系统简化代码，提高可维护性
 */
export class CLIRenderer {

  /**
   * 显示应用横幅
   */
  static async showBanner(_title: string, _subtitle?: string): Promise<void> {
    await UltraModernCLIRenderer.showAnimatedBanner();
  }

  /**
   * 显示欢迎横幅 - 使用模板
   */
  static showWelcomeBanner(): void {
    console.log(UITemplates.getWelcomeBannerTemplate());
  }

  /**
   * 显示文件状态面板 - 使用超现代化渲染器
   */
  static showFileStatus(stats: {
    totalAccounts: number;
    totalTransactions: number;
    totalBalances: number;
    totalErrors: number;
    filePath: string;
  }): void {
    UltraModernCLIRenderer.showDynamicStatus(stats);
  }

  /**
   * 显示成功消息 - 使用现代化渲染器
   */
  static showSuccess(message: string): void {
    ModernCLIRenderer.showModernSuccess(message);
  }

  /**
   * 显示错误消息 - 使用现代化渲染器
   */
  static showError(message: string, details?: string): void {
    ModernCLIRenderer.showModernError(message, details);
  }

  /**
   * 显示警告消息 - 使用模板
   */
  static showWarning(message: string): void {
    console.log(UITemplates.getWarningTemplate(message));
  }

  /**
   * 显示信息消息 - 使用模板
   */
  static showInfo(message: string): void {
    console.log(UITemplates.getInfoTemplate(message));
  }

  /**
   * 显示帮助信息 - 使用超现代化渲染器
   */
  static showHelp(commands: Array<{name: string; description: string; usage: string}>): void {
    UltraModernCLIRenderer.showInteractiveHelp(commands);
  }

  /**
   * 显示命令帮助详情 - 使用模板
   */
  static showCommandHelp(commandName: string, description: string, usage: string, examples: string[]): void {
    console.log(UITemplates.getCommandDetailTemplate(commandName, description, usage, examples));
  }

  /**
   * 显示确认对话框 - 使用模板
   */
  static showConfirm(message: string): void {
    console.log(UITemplates.getConfirmTemplate(message));
  }

  /**
   * 显示输入提示 - 使用模板
   */
  static showInputPrompt(label: string, placeholder?: string): void {
    console.log(UITemplates.getInputPromptTemplate(label, placeholder));
  }

  /**
   * 显示选择列表 - 使用模板
   */
  static showSelection(title: string, options: string[]): void {
    console.log(UITemplates.getSelectionTemplate(title, options));
  }

  /**
   * 显示进度条 - 使用模板
   */
  static showProgress(current: number, total: number, label: string): void {
    console.log(UITemplates.getProgressTemplate(current, total, label));
  }

  /**
   * 显示交易记录表格 - 使用超现代化渲染器
   */
  static async showTransactionTable(transactions: any[], totalCount: number): Promise<void> {
    await UltraModernCLIRenderer.showAnimatedTransactions(transactions, totalCount);
  }

  /**
   * 显示账户列表 - 使用超现代化渲染器
   */
  static showAccountList(accounts: any[]): void {
    UltraModernCLIRenderer.showAnimatedAccounts(accounts);
  }

  /**
   * 显示余额信息 - 使用超现代化渲染器
   */
  static showBalance(balances: any[]): void {
    UltraModernCLIRenderer.showAnimatedBalance(balances);
  }

  /**
   * 显示净资产 - 支持国际化和主题
   */
  static showNetworth(networth: any): void {
    console.log(UITemplates.getNetworthTemplate(networth));
  }

  /**
   * 显示主题信息
   */
  static showThemeInfo(): void {
    console.log(UITemplates.getThemeInfoTemplate());
  }

  /**
   * 显示语言信息
   */
  static showLanguageInfo(): void {
    console.log(UITemplates.getLanguageInfoTemplate());
  }

  /**
   * 显示搜索结果 - 使用模板
   */
  static showSearchResults(query: string, results: Array<{title: string; description: string; type: string}>): void {
    console.log(UITemplates.getSearchResultsTemplate(query, results));
  }

  /**
   * 显示分隔线 - 使用模板
   */
  static showDivider(char: string = '─', length: number = 60): void {
    console.log(UITemplates.getDividerTemplate(char, length));
  }

  /**
   * 显示加载动画 - 使用模板
   */
  static showLoading(message: string): void {
    console.log(UITemplates.getLoadingTemplate(message));
  }

  /**
   * 显示完成状态 - 使用模板
   */
  static showCompletion(message: string, duration?: number): void {
    console.log(UITemplates.getCompletionTemplate(message, duration));
  }

  /**
   * 显示命令提示 - 水平布局
   */
  static showCommandPrompt(message: string, suggestions?: string[]): void {
    // 水平布局：命令提示和建议在同一行
    let promptContent = chalk.cyan.bold('💡 ') + chalk.white(message);
    
    if (suggestions && suggestions.length > 0) {
      const suggestionText = suggestions.map((s: string) => chalk.cyan(`/${s}`)).join(' ');
      promptContent += chalk.gray(` | 建议: ${suggestionText}`);
    }

    console.log(promptContent);
    console.log();
  }

  /**
   * 显示CLI界面 - 使用模板
   */
  static showCLIInterface(stats: {
    totalAccounts: number;
    totalTransactions: number;
    totalBalances: number;
    totalErrors: number;
    filePath: string;
  }): void {
    // 显示欢迎横幅
    this.showWelcomeBanner();
    
    // 显示文件状态
    this.showFileStatus(stats);
    
    // 显示分隔线
    this.showDivider();
    
    // 显示命令提示
    this.showCommandPrompt('请输入命令', ['help', 'add', 'list', 'balance', 'exit']);
  }

  /**
   * 显示交互式进度条
   */
  static showInteractiveProgress(total: number, label: string): cliProgress.SingleBar {
    const progressBar = new cliProgress.SingleBar({
      format: `🔄 ${label} |{bar}| {percentage}% | {value}/{total}`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    });

    progressBar.start(total, 0);
    return progressBar;
  }

  /**
   * 显示交互式加载动画
   */
  static showInteractiveLoading(message: string): any {
    return ora({
      text: message,
      color: 'cyan',
      spinner: 'dots',
    });
  }

  /**
   * 显示消息框
   */
  static showMessageBox(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const colors: Record<string, string> = {
      success: 'green',
      error: 'red',
      warning: 'yellow',
      info: 'blue',
    };

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };

    const messageBox = boxen(
      `${icons[type]} ${message}`,
      {
        padding: { top: 1, bottom: 1, left: 2, right: 2 },
        margin: { top: 1, bottom: 1 },
        borderStyle: 'round',
        borderColor: colors[type] as any,
        backgroundColor: 'black',
      }
    );

    console.log(messageBox);
  }

  /**
   * 显示状态卡片
   */
  static showStatusCard(title: string, value: string, icon: string, color: string = 'cyan'): void {
    const statusCard = boxen(
      `${icon} ${(chalk as any)[color].bold(title)}\n${chalk.white.bold(value)}`,
      {
        padding: { top: 1, bottom: 1, left: 2, right: 2 },
        margin: { top: 0, bottom: 0, left: 1, right: 1 },
        borderStyle: 'round',
        borderColor: color,
        backgroundColor: 'black',
      }
    );

    process.stdout.write(statusCard);
  }

  /**
   * 显示水平状态卡片组
   */
  static showHorizontalStatusCards(cards: Array<{title: string; value: string; icon: string; color?: string}>): void {
    const cardStrings = cards.map(card => {
      const color = card.color || 'cyan';
      return boxen(
        `${card.icon} ${(chalk as any)[color].bold(card.title)}\n${chalk.white.bold(card.value)}`,
        {
          padding: { top: 0, bottom: 0, left: 1, right: 1 },
          margin: 0,
          borderStyle: 'round',
          borderColor: color,
          backgroundColor: 'black',
        }
      );
    });

    // 水平排列，无间距
    console.log(cardStrings.join(''));
  }

  /**
   * 显示表格（使用table库）
   */
  static showAdvancedTable(data: any[][], options?: any): void {
    const tableOutput = table(data, {
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
      ...options,
    });

    console.log(tableOutput);
  }

  /**
   * 清屏
   */
  static clearScreen(): void {
    console.clear();
  }

  /**
   * 显示版本信息
   */
  static showVersion(version: string): void {
    const versionBox = boxen(
      chalk.cyan.bold(`版本: ${version}`),
      {
        padding: { top: 0, bottom: 0, left: 2, right: 2 },
        margin: { top: 1, bottom: 1 },
        borderStyle: 'round',
        borderColor: 'cyan',
        backgroundColor: 'black',
      }
    );

    console.log(versionBox);
  }
} 