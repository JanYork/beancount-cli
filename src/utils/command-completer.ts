/**
 * 命令补全工具
 *
 * 作者: JanYork
 */

import { t, tn } from './i18n';

export interface CommandSuggestion {
  command: string;
  description: string;
  usage: string;
}

export class CommandCompleter {
  private static readonly commands: CommandSuggestion[] = [
    {
      command: 'help',
      description: 'help.commands.help',
      usage: 'usage.commands.help',
    },
    {
      command: 'add_transaction',
      description: 'help.commands.add_transaction',
      usage: 'usage.commands.add_transaction',
    },
    {
      command: 'list_transactions',
      description: 'help.commands.list_transactions',
      usage: 'usage.commands.list_transactions',
    },
    {
      command: 'show_balance',
      description: 'help.commands.show_balance',
      usage: 'usage.commands.show_balance',
    },
    {
      command: 'show_networth',
      description: 'help.commands.show_networth',
      usage: 'usage.commands.show_networth',
    },
    {
      command: 'list_accounts',
      description: 'help.commands.list_accounts',
      usage: 'usage.commands.list_accounts',
    },
    {
      command: 'validate',
      description: 'help.commands.validate',
      usage: 'usage.commands.validate',
    },
    {
      command: 'config',
      description: 'help.commands.config',
      usage: 'usage.commands.config',
    },
    {
      command: 'quit',
      description: 'help.commands.quit',
      usage: 'usage.commands.quit',
    },
    {
      command: 'reload',
      description: 'help.commands.reload',
      usage: 'usage.commands.reload',
    },
  ];

  /**
   * 获取命令建议
   */
  static getSuggestions(partialInput: string): CommandSuggestion[] {
    if (!partialInput.startsWith('/')) {
      return [];
    }

    const command = partialInput.slice(1);
    return this.commands.filter(cmd => cmd.command.startsWith(command) || cmd.command.includes(command));
  }

  /**
   * 获取所有命令
   */
  static getAllCommands(): string[] {
    return this.commands.map(cmd => cmd.command);
  }

  /**
   * 获取命令详情
   */
  static getCommandDetails(commandName: string): CommandSuggestion | undefined {
    return this.commands.find(cmd => cmd.command === commandName);
  }

  /**
   * 获取本地化的命令建议
   */
  static getLocalizedSuggestions(partialInput: string): Array<{
    command: string;
    description: string;
    usage: string;
  }> {
    const suggestions = this.getSuggestions(partialInput);
    return suggestions.map(suggestion => ({
      command: suggestion.command,
      description: tn('help.commands', suggestion.command),
      usage: tn('usage.commands', suggestion.command),
    }));
  }

  /**
   * 显示命令建议
   */
  static displaySuggestions(suggestions: CommandSuggestion[]): void {
    if (suggestions.length === 0) {
      return;
    }

    console.log(`\n${t('completion.suggestions')}`);
    suggestions.forEach((suggestion, index) => {
      const description = tn('help.commands', suggestion.command);
      const usage = tn('usage.commands', suggestion.command);
      console.log(`   ${index + 1}. ${usage}`);
      console.log(`      ${description}`);
    });
    console.log();
  }

  /**
   * 创建交互式命令选择器
   */
  static async selectCommand(partialInput: string = ''): Promise<string | null> {
    const suggestions = this.getSuggestions(partialInput);

    if (suggestions.length === 0) {
      return null;
    }

    if (suggestions.length === 1) {
      const suggestion = suggestions[0];
      if (suggestion) {
        return `/${suggestion.command}`;
      }
      return null;
    }

    // 如果有多个建议，显示选择界面
    console.log(`\n${t('completion.multiple.found')}`);
    suggestions.forEach((suggestion, index) => {
      const description = tn('help.commands', suggestion.command);
      console.log(`   ${index + 1}. /${suggestion.command} - ${description}`);
    });

    // 这里可以集成 inquirer 来提供更好的选择体验
    // 暂时返回第一个匹配的命令
    const firstSuggestion = suggestions[0];
    if (firstSuggestion) {
      return `/${firstSuggestion.command}`;
    }
    return null;
  }
}
