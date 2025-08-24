/**
 * CLI控制器
 * 负责处理用户交互和命令执行
 * 
 * @author JanYork
 */

import { CommandParser } from './command-parser';
import { CommandExecutor } from './command-executor';
import { CLIRenderer } from './cli-renderer';
import { TabCompleter } from './tab-completer';
import { t } from '../../utils/i18n';
import { CommandResult } from '../../types';

/**
 * CLI控制器类
 * 负责协调用户交互、命令解析和执行
 */
export class CLIController {
  private running = true;
  private readonly commandExecutor: CommandExecutor;
  private readonly tabCompleter: TabCompleter;

  constructor(commandExecutor: CommandExecutor) {
    this.commandExecutor = commandExecutor;
    this.tabCompleter = new TabCompleter();
  }

  /**
   * 运行CLI主循环
   */
  async run(): Promise<void> {
    // 首先显示Banner
    this.printBanner();
    
    // 然后显示状态信息
    this.printStatus();

    // 连续交互循环，只有遇到中断指令才中断
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

    // 关闭Tab补全器
    this.tabCompleter.close();
  }

  /**
   * 打印欢迎横幅
   */
  private printBanner(): void {
    CLIRenderer.showBanner('Beancount CLI', t('cli.banner.subtitle'));
  }

  /**
   * 打印状态信息
   */
  private printStatus(): void {
    try {
      const stats = this.commandExecutor.getFileStats();
      CLIRenderer.showFileStatus(stats);
    } catch (error) {
      CLIRenderer.showWarning(t('status.unavailable'));
      console.log();
    }
  }

  /**
   * 显示命令提示
   */
  private async showPrompt(): Promise<void> {
    const message = `${t('command.prompt')} (${t('command.help.hint')})`;
    const userInput = await this.tabCompleter.showPrompt(message);

    if (!userInput.trim()) {
      return;
    }

    await this.processCommand(userInput);
  }

  /**
   * 处理命令
   */
  private async processCommand(input: string): Promise<void> {
    try {
      // 解析命令
      const parsedCommand = CommandParser.parseCommand(input);

      // 验证命令 - 先尝试直接验证，失败则尝试猜测
      if (!CommandParser.validateCommand(parsedCommand.command)) {
        // 尝试命令猜测
        const guessedCommand = CommandParser.guessCommand(parsedCommand.command);
        
        if (guessedCommand) {
          // 显示猜测结果并询问用户是否确认
          const inquirer = await import('inquirer');
          const { confirm } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `未找到命令 "${parsedCommand.command}"，是否执行 "${guessedCommand.command}"？`,
              default: true,
            },
          ]);
          
          if (confirm) {
            // 使用猜测的命令
            parsedCommand.command = guessedCommand.command;
          } else {
            // 显示命令建议
            const suggestions = CommandParser.getCommandSuggestions(parsedCommand.command);
            if (suggestions.length > 0) {
              console.log(`\n💡 可能的命令: ${suggestions.slice(0, 5).join(', ')}`);
            }
            this.handleError(`${t('cli.invalid.command')} ${parsedCommand.command}`);
            console.log(t('cli.help.suggestion'));
            return;
          }
        } else {
          // 没有找到猜测，显示错误和建议
          const suggestions = CommandParser.getCommandSuggestions(parsedCommand.command);
          if (suggestions.length > 0) {
            console.log(`\n💡 可能的命令: ${suggestions.slice(0, 5).join(', ')}`);
          }
          this.handleError(`${t('cli.invalid.command')} ${parsedCommand.command}`);
          console.log(t('cli.help.suggestion'));
          return;
        }
      }

      // 处理特殊命令
      if (parsedCommand.command === 'quit') {
        this.running = false;
        CLIRenderer.showSuccess(t('cli.quit'));
        return;
      }

      if (parsedCommand.command === 'reload') {
        await this.handleReloadCommand();
        return;
      }

      if (parsedCommand.command === 'help') {
        await this.handleHelpCommand(parsedCommand);
        return;
      }

      // 执行普通命令
      const result = await this.commandExecutor.execute(parsedCommand.command, parsedCommand.params);
      this.displayResult(result);
    } catch (error) {
      this.handleError(`${t('cli.command.parse.error')} ${error}`);
    }
  }

  /**
   * 处理重新加载命令
   */
  private async handleReloadCommand(): Promise<void> {
    const result = await this.commandExecutor.execute('reload', {});
    if (result.success) {
      CLIRenderer.showWarning(t('cli.reload.success'));
      this.printStatus();
    } else {
      this.handleError(result.message);
    }
  }

  /**
   * 处理帮助命令
   */
  private async handleHelpCommand(parsedCommand: any): Promise<void> {
    if (parsedCommand.params.args && parsedCommand.params.args.length > 0) {
      const helpText = CommandParser.getCommandHelp(parsedCommand.params.args[0]);
      if (helpText) {
        console.log(helpText);
      } else {
        this.handleError(`未知命令: ${parsedCommand.params.args[0]}`);
      }
    } else {
      // 显示通用帮助
      const result = await this.commandExecutor.execute('help', {});
      this.displayResult(result);
    }
  }

  /**
   * 显示命令执行结果
   */
  private displayResult(result: CommandResult): void {
    if (result.success) {
      CLIRenderer.showSuccess(result.message || '执行成功');
    } else {
      CLIRenderer.showError(result.message);
    }
    console.log();
  }

  /**
   * 处理错误
   */
  private handleError(error: string): void {
    CLIRenderer.showError(`${t('cli.error.general')} ${error}`);
    console.log();
  }
} 