/**
 * 命令提示组件
 * 提供智能的命令提示和自动补全功能
 * 
 * @author JanYork
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { CLIRenderer } from './cli-renderer';

/**
 * 命令提示选项
 */
export interface CommandPromptOptions {
  message?: string;
  suggestions?: string[];
  history?: string[];
  autoComplete?: boolean;
  showHelp?: boolean;
}

/**
 * 命令提示组件类
 * 提供智能的命令输入体验
 */
export class CommandPrompt {
  private static readonly COMMAND_HISTORY: string[] = [];
  private static readonly MAX_HISTORY = 50;

  /**
   * 显示命令提示
   */
  static async showPrompt(options: CommandPromptOptions = {}): Promise<string> {
    const {
      message = '💡 输入命令 (输入 /help 查看帮助):',
      suggestions = [],
      autoComplete = true,
      showHelp = true,
    } = options;

    // 显示帮助提示
    if (showHelp) {
      this.showHelpHint();
    }

    // 显示命令提示
    CLIRenderer.showCommandPrompt(message, suggestions);

    // 获取用户输入
    const { userInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'userInput',
        message: '',
        prefix: '',
        suffix: '',
        default: '',
        transformer: (input: string) => {
          // 实时显示命令建议
          if (autoComplete && input.startsWith('/')) {
            this.showLiveSuggestions(input, suggestions);
          }
          return input;
        },
        validate: (input: string) => {
          if (!input.trim()) {
            return true; // 允许空输入
          }
          return true;
        },
      },
    ]);

    // 保存到历史记录
    if (userInput.trim()) {
      this.addToHistory(userInput.trim());
    }

    return userInput.trim();
  }

  /**
   * 显示命令选择界面
   */
  static async showCommandSelection(
    commands: Array<{ name: string; description: string; usage: string }>,
    message: string = '选择要执行的命令:'
  ): Promise<string> {
    const choices = commands.map(cmd => ({
      name: `${chalk.cyan(`/${cmd.name}`)} - ${chalk.white(cmd.description)}`,
      value: `/${cmd.name}`,
    }));

    const { selectedCommand } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedCommand',
        message: chalk.cyan.bold(message),
        choices,
        pageSize: 10,
      },
    ]);

    return selectedCommand;
  }

  /**
   * 显示确认对话框
   */
  static async showConfirmation(
    message: string,
    defaultValue: boolean = false
  ): Promise<boolean> {
    CLIRenderer.showConfirm(message);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '',
        default: defaultValue,
        prefix: '',
      },
    ]);

    return confirm;
  }

  /**
   * 显示多选界面
   */
  static async showMultiSelection<T>(
    items: Array<{ name: string; value: T; checked?: boolean }>,
    message: string = '选择项目:'
  ): Promise<T[]> {
    const { selectedItems } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedItems',
        message: chalk.cyan.bold(message),
        choices: items.map(item => ({
          name: item.name,
          value: item.value,
          checked: item.checked || false,
        })),
        pageSize: 10,
      },
    ]);

    return selectedItems;
  }

  /**
   * 显示输入框
   */
  static async showInput(
    message: string,
    defaultValue?: string,
    validator?: (input: string) => boolean | string
  ): Promise<string> {
    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: chalk.cyan.bold(message),
        default: defaultValue,
        validate: validator,
      },
    ]);

    return input;
  }

  /**
   * 显示密码输入框
   */
  static async showPassword(message: string): Promise<string> {
    const { password } = await inquirer.prompt([
      {
        type: 'password',
        name: 'password',
        message: chalk.cyan.bold(message),
        mask: '*',
      },
    ]);

    return password;
  }

  /**
   * 显示数字输入框
   */
  static async showNumber(
    message: string,
    defaultValue?: number,
    min?: number,
    max?: number
  ): Promise<number> {
    const { number } = await inquirer.prompt([
      {
        type: 'number',
        name: 'number',
        message: chalk.cyan.bold(message),
        default: defaultValue,
        validate: (input: number) => {
          if (min !== undefined && input < min) {
            return `数值不能小于 ${min}`;
          }
          if (max !== undefined && input > max) {
            return `数值不能大于 ${max}`;
          }
          return true;
        },
      },
    ]);

    return number;
  }

  /**
   * 显示日期选择器
   */
  static async showDate(
    message: string,
    defaultValue?: string
  ): Promise<string> {
    const { date } = await inquirer.prompt([
      {
        type: 'input',
        name: 'date',
        message: chalk.cyan.bold(message),
        default: defaultValue || new Date().toISOString().split('T')[0],
        validate: (input: string) => {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(input)) {
            return '请输入正确的日期格式 (YYYY-MM-DD)';
          }
          const date = new Date(input);
          if (isNaN(date.getTime())) {
            return '请输入有效的日期';
          }
          return true;
        },
      },
    ]);

    return date;
  }

  /**
   * 显示实时建议
   */
  private static showLiveSuggestions(input: string, suggestions: string[]): void {
    const matchingSuggestions = suggestions.filter(s => 
      s.toLowerCase().includes(input.slice(1).toLowerCase())
    );

    if (matchingSuggestions.length > 0 && matchingSuggestions.length <= 5) {
      // 清除之前的建议显示
      process.stdout.write('\x1b[2K\r');
      
      // 显示建议
      const suggestionText = matchingSuggestions
        .map(s => chalk.cyan(`/${s}`))
        .join(' ');
      
      const suggestionBox = chalk.gray(`💡 建议: ${suggestionText}`);
      process.stdout.write(suggestionBox);
    }
  }

  /**
   * 显示帮助提示
   */
  private static showHelpHint(): void {
    const helpBox = chalk.gray('💡 提示: 输入 /help 查看所有可用命令，使用 Tab 键自动补全');
    console.log(helpBox);
    console.log();
  }

  /**
   * 添加到历史记录
   */
  private static addToHistory(command: string): void {
    // 移除重复项
    const index = this.COMMAND_HISTORY.indexOf(command);
    if (index > -1) {
      this.COMMAND_HISTORY.splice(index, 1);
    }

    // 添加到开头
    this.COMMAND_HISTORY.unshift(command);

    // 限制历史记录大小
    if (this.COMMAND_HISTORY.length > this.MAX_HISTORY) {
      this.COMMAND_HISTORY.pop();
    }
  }

  /**
   * 获取命令历史
   */
  static getHistory(): string[] {
    return [...this.COMMAND_HISTORY];
  }

  /**
   * 清空历史记录
   */
  static clearHistory(): void {
    this.COMMAND_HISTORY.length = 0;
  }

  /**
   * 显示历史记录
   */
  static showHistory(limit: number = 10): void {
    const history = this.COMMAND_HISTORY.slice(0, limit);
    
    if (history.length === 0) {
      CLIRenderer.showInfo('暂无命令历史记录');
      return;
    }

    const historyTitle = chalk.cyan.bold('📜 命令历史记录');
    console.log(historyTitle);
    console.log();

    history.forEach((command, index) => {
      const historyBox = chalk.gray(`${index + 1}. ${command}`);
      console.log(historyBox);
    });

    console.log();
  }
} 