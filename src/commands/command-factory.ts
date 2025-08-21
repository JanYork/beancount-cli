/**
 * 命令工厂
 * 
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { AddTransactionCommand } from './add-transaction-command';
import { ListTransactionsCommand } from './list-transactions-command';
import { ShowBalanceCommand } from './show-balance-command';
import { ShowNetworthCommand } from './show-networth-command';
import { ListAccountsCommand } from './list-accounts-command';
import { ValidateCommand } from './validate-command';
import { ConfigCommand } from './config-command';
import { HelpCommand } from './help-command';

export class CommandFactory {
  /**
   * 创建命令实例
   * 
   * @param commandName 命令名称
   * @param engine Beancount引擎实例
   * @returns 命令实例或null
   */
  static createCommand(commandName: string, engine: BeancountEngine): BaseCommand | null {
    const commands: Record<string, new (engine: BeancountEngine) => BaseCommand> = {
      'add_transaction': AddTransactionCommand,
      'list_transactions': ListTransactionsCommand,
      'show_balance': ShowBalanceCommand,
      'show_networth': ShowNetworthCommand,
      'list_accounts': ListAccountsCommand,
      'validate': ValidateCommand,
      'config': ConfigCommand,
      'help': HelpCommand
    };

    const CommandClass = commands[commandName];
    if (CommandClass) {
      return new CommandClass(engine);
    }

    return null;
  }

  /**
   * 获取所有可用命令名称
   * 
   * @returns 命令名称数组
   */
  static getAvailableCommands(): string[] {
    return [
      'add_transaction',
      'list_transactions',
      'show_balance',
      'show_networth',
      'list_accounts',
      'validate',
      'config',
      'help'
    ];
  }

  /**
   * 检查命令是否存在
   * 
   * @param commandName 命令名称
   * @returns 是否存在
   */
  static isCommandAvailable(commandName: string): boolean {
    return this.getAvailableCommands().includes(commandName);
  }
} 