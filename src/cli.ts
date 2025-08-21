/**
 * Beancount CLI 主命令行界面
 *
 * 作者: JanYork
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import { BeancountEngine } from './engine/beancount-engine';
import { CommandFactory } from './commands/command-factory';
import { CommandResult } from './types';
import { CommandCompleter } from './utils/command-completer';
import { t, tn } from './utils/i18n';
import { UIEnhancer } from './utils/ui-enhancer';

// 完整的CommandParser实现
export class CommandParser {
  static parseCommand(input: string) {
    const [command, ...paramParts] = input.trim().split(' ');
    const parsedCommand = command?.startsWith('/') ? command.slice(1) : command || '';

    // 解析参数
    const params: Record<string, any> = {};
    for (const part of paramParts) {
      if (part.includes('=')) {
        const [key, value] = part.split('=', 2);
        if (key && value !== undefined) {
          // 处理嵌套键，如 currency.default
          this.setNestedValue(params, key, value);
        }
      } else if (part) {
        // 如果没有等号，作为位置参数
        if (!params['args']) {
          params['args'] = [];
        }
        (params['args'] as any[]).push(part);
      }
    }

    return {
      command: parsedCommand,
      params,
    };
  }

  /**
   * 设置嵌套值
   */
  private static setNestedValue(obj: Record<string, any>, key: string, value: string): void {
    const keys = key.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (k && (!(k in current) || typeof current[k] !== 'object')) {
        current[k] = {};
      }
      if (k) {
        current = current[k];
      }
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      // 尝试解析值类型
      if (value === 'true' || value === 'false') {
        current[lastKey] = value === 'true';
      } else if (!isNaN(Number(value))) {
        current[lastKey] = Number(value);
      } else {
        current[lastKey] = value;
      }
    }
  }

  static validateCommand(command: string): boolean {
    return CommandCompleter.getAllCommands().includes(command);
  }

  static getCommandHelp(commandName: string): string | null {
    const commandDetails = CommandCompleter.getCommandDetails(commandName);
    if (commandDetails) {
      const description = tn('help.commands', commandName);
      const usage = tn('usage.commands', commandName);
      return `${usage}\n${description}`;
    }
    return null;
  }

  /**
   * 获取所有可用命令
   */
  static getAllCommands(): string[] {
    return CommandCompleter.getAllCommands();
  }

  /**
   * 获取命令建议
   */
  static getCommandSuggestions(partialCommand: string): string[] {
    const suggestions = CommandCompleter.getSuggestions(`/${partialCommand}`);
    return suggestions.map(s => s.command);
  }
}

export class BeancountCLI {
  private engine: BeancountEngine;
  private running: boolean = true;

  constructor(filePath: string) {
    this.engine = new BeancountEngine(filePath);
  }

  /**
   * 运行CLI主循环
   */
  async run(): Promise<void> {
    this.printBanner();
    this.printStatus();

    while (this.running) {
      try {
        await this.showPrompt();
      } catch (error) {
        if (error instanceof Error && error.message === 'SIGINT') {
          console.log(`\n${t('cli.interrupt.detected')}`);
          continue;
        }
        this.handleError(`${t('cli.unexpected.error')} ${error}`);
      }
    }
  }

  /**
   * 打印欢迎横幅
   */
  private printBanner(): void {
    UIEnhancer.showBanner('Beancount CLI', t('cli.banner.subtitle'));
  }

  /**
   * 打印状态信息
   */
  private printStatus(): void {
    try {
      const stats = this.engine.getFileStats();

      console.log(`\n📊 ${t('status.title')}`);
      UIEnhancer.showStatCard(t('status.accounts'), stats['totalAccounts'], '个', 0);
      UIEnhancer.showStatCard(t('status.transactions'), stats['totalTransactions'], '条', 0);
      UIEnhancer.showStatCard(t('status.balances'), stats['totalBalances'], '个', 0);
      UIEnhancer.showStatCard(t('status.errors'), stats['totalErrors'], '个', 0);
      console.log(`📁 ${t('status.filepath')}: ${stats['filePath']}`);
      console.log();
    } catch (error) {
      UIEnhancer.showWarning(t('status.unavailable'));
      console.log();
    }
  }

  /**
   * 显示命令提示
   */
  private async showPrompt(): Promise<void> {
    const { userInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'userInput',
        message: t('cli.prompt.message'),
        default: '',
        prefix: '',
        suffix: '',
        transformer: (input: string) => {
          // 实时显示命令建议
          if (input.startsWith('/')) {
            const suggestions = CommandCompleter.getSuggestions(input);
            if (suggestions.length > 0 && suggestions.length <= 5) {
              // 清除之前的建议显示
              process.stdout.write('\x1b[2K\r');
              // 显示建议
              const suggestionText = suggestions.map(s => `/${s.command}`).join(' ');
              process.stdout.write(`💡 ${t('completion.suggestions')} ${suggestionText}`);
            }
          }
          return input;
        },
      },
    ]);

    if (!userInput.trim()) {
      return;
    }

    // 如果用户输入的是部分命令，尝试补全
    if (userInput.startsWith('/') && !userInput.includes(' ')) {
      const suggestions = CommandCompleter.getSuggestions(userInput);
      if (suggestions.length === 1) {
        // 自动补全
        const suggestion = suggestions[0];
        if (suggestion) {
          UIEnhancer.showInfo(`${t('completion.auto.complete')} /${suggestion.command}`);
          await this.processCommand(`/${suggestion.command}`);
        }
        return;
      } else if (suggestions.length > 1) {
        // 显示选择界面
        const { selectedCommand } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedCommand',
            message: t('completion.select.command'),
            choices: suggestions.map(s => ({
              name: `/${s.command} - ${tn('help.commands', s.command)}`,
              value: `/${s.command}`,
            })),
          },
        ]);
        await this.processCommand(selectedCommand);
        return;
      }
    }

    await this.processCommand(userInput);
  }

  /**
   * 处理命令
   *
   * @param input 用户输入
   */
  private async processCommand(input: string): Promise<void> {
    try {
      // 解析命令
      const parsedCommand = CommandParser.parseCommand(input);

      // 验证命令
      if (!CommandParser.validateCommand(parsedCommand.command)) {
        this.handleError(`${t('cli.invalid.command')} ${parsedCommand.command}`);
        console.log(t('cli.help.suggestion'));
        return;
      }

      // 处理特殊命令
      if (parsedCommand.command === 'quit') {
        this.running = false;
        UIEnhancer.showSuccess(t('cli.quit'));
        return;
      }

      if (parsedCommand.command === 'help') {
        if (parsedCommand.params['args'] && parsedCommand.params['args'].length > 0) {
          const helpText = CommandParser.getCommandHelp(parsedCommand.params['args'][0]);
          if (helpText) {
            console.log(helpText);
          } else {
            this.handleError(`未知命令: ${parsedCommand.params['args'][0]}`);
          }
        } else {
          // 显示通用帮助
          const helpCommand = CommandFactory.createCommand('help', this.engine);
          if (helpCommand) {
            const result = await helpCommand.execute(parsedCommand.params);
            this.displayResult(result);
          }
        }
        return;
      }

      if (parsedCommand.command === 'reload') {
        this.engine.reload();
        UIEnhancer.showWarning(t('cli.reload.success'));
        this.printStatus();
        return;
      }

      // 创建并执行命令
      const command = CommandFactory.createCommand(parsedCommand.command, this.engine);
      if (command) {
        const result = await command.execute(parsedCommand.params);
        this.displayResult(result);
      } else {
        this.handleError(`未知命令: ${parsedCommand.command}`);
      }
    } catch (error) {
      this.handleError(`${t('cli.command.parse.error')} ${error}`);
    }
  }

  /**
   * 显示命令执行结果
   *
   * @param result 执行结果
   */
  private displayResult(result: CommandResult): void {
    if (result.success) {
      UIEnhancer.showSuccess(result.message);
    } else {
      UIEnhancer.showError(result.message);
    }
    console.log();
  }

  /**
   * 处理错误
   *
   * @param error 错误信息
   */
  private handleError(error: string): void {
    UIEnhancer.showError(`${t('cli.error.general')} ${error}`);
    console.log();
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const program = new Command();

  program
    .name('beancount-cli')
    .description('Beancount CLI - 智能记账命令行工具')
    .version('1.0.0')
    .argument('[file]', 'Beancount文件路径（可选，将使用配置文件中的默认路径）')
    .action(async (file?: string) => {
      try {
        // 初始化配置和文件
        const { ConfigManager } = await import('./utils/config-manager');
        const configManager = ConfigManager.getInstance();

        let filePath = file;

        // 如果没有提供文件路径，使用配置文件中的默认路径
        if (!filePath) {
          filePath = configManager.expandPath(configManager.get('data.default_file'));
          console.log(`${t('startup.using.default.path')} ${filePath}`);
        }

        // 检查文件是否存在，如果不存在则引导用户创建
        const fs = await import('fs');
        if (!fs.existsSync(filePath)) {
          console.log(`${t('startup.file.not.exists')} ${filePath}`);

          const { createInitialSetup } = await import('./utils/setup-wizard');
          const shouldCreate = await createInitialSetup(filePath, configManager);

          if (!shouldCreate) {
            console.log(t('startup.goodbye'));
            process.exit(0);
          }
        }

        const cli = new BeancountCLI(filePath);
        await cli.run();
      } catch (error) {
        console.error(t('startup.failed'), error);
        process.exit(1);
      }
    });

  program.parse();
}

if (require.main === module) {
  main();
}
