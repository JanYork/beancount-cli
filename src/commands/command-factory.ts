/**
 * 命令工厂
 * 负责创建和管理各种命令实例
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { AddTransactionCommand } from './add-transaction-command';
import { EditTransactionCommand } from './edit-transaction-command';
import { DeleteTransactionCommand } from './delete-transaction-command';
import { ListTransactionsCommand } from './list-transactions-command';
import { ListAccountsCommand } from './list-accounts-command';
import { ShowBalanceCommand } from './show-balance-command';
import { ShowNetworthCommand } from './show-networth-command';
import { ConfigCommand } from './config-command';
import { SearchCommand } from './search-command';
import { ReportCommand } from './report-command';
import { ExportCommand } from './export-command';
import { ValidateCommand } from './validate-command';
import { CheckStructureCommand } from './check-structure-command';
import { InitStructureCommand } from './init-structure-command';
import { HelpCommand } from './help-command';
import { BeancountEngine } from '../engine/beancount-engine';

export class CommandFactory {
  private static engine: BeancountEngine;

  /**
   * 设置引擎实例
   */
  static setEngine(engine: BeancountEngine): void {
    CommandFactory.engine = engine;
  }

  /**
   * 创建命令实例
   *
   * @param commandName 命令名称
   * @returns 命令实例
   */
  static createCommand(commandName: string): BaseCommand | null {
    if (!CommandFactory.engine) {
      throw new Error('引擎未初始化，请先调用 setEngine');
    }

    if (!commandName) {
      return null;
    }

    switch (commandName.toLowerCase()) {
      case 'add_transaction':
      case 'add':
      case 'add_tx':
      case 'transaction':
      case 'a':
      case 'new':
        return new AddTransactionCommand(CommandFactory.engine);

      case 'edit_transaction':
      case 'edit':
      case 'edit_tx':
      case 'modify':
      case 'e':
      case 'change':
        return new EditTransactionCommand(CommandFactory.engine);

      case 'delete_transaction':
      case 'delete':
      case 'del':
      case 'remove':
      case 'd':
      case 'rm':
        return new DeleteTransactionCommand(CommandFactory.engine);

      case 'list_transactions':
      case 'list':
      case 'transactions':
      case 'tx':
      case 'ls':
      case 'lt':
        return new ListTransactionsCommand(CommandFactory.engine);

      case 'list_accounts':
      case 'accounts':
      case 'account':
      case 'act':
      case 'ac':
        return new ListAccountsCommand(CommandFactory.engine);

      case 'show_balance':
      case 'balance':
      case 'bal':
      case 'b':
      case 'money':
        return new ShowBalanceCommand(CommandFactory.engine);

      case 'show_networth':
      case 'networth':
      case 'net':
      case 'worth':
      case 'nw':
      case 'wealth':
        return new ShowNetworthCommand(CommandFactory.engine);

      case 'config':
      case 'settings':
      case 'configure':
      case 'c':
      case 'conf':
        return new ConfigCommand(CommandFactory.engine);

      case 'search':
      case 'find':
      case 'lookup':
      case 's':
      case 'f':
        return new SearchCommand(CommandFactory.engine);

      case 'report':
      case 'reports':
      case 'rpt':
        return new ReportCommand(CommandFactory.engine);

      case 'export':
      case 'exp':
      case 'output':
      case 'e':
      case 'out':
        return new ExportCommand(CommandFactory.engine);

      case 'validate':
      case 'check':
      case 'verify':
      case 'v':
      case 'val':
        return new ValidateCommand(CommandFactory.engine);

      case 'check_structure':
      case 'check':
      case 'structure':
      case 'cs':
      case 'chk':
        return new CheckStructureCommand();

      case 'init_structure':
      case 'init':
      case 'initialize':
      case 'i':
      case 'setup':
        return new InitStructureCommand();

      case 'help':
      case 'h':
      case '?':
      case 'man':
      case 'help':
        return new HelpCommand();

      case 'quit':
      case 'exit':
      case 'q':
      case 'bye':
        // 特殊处理退出命令
        return null;

      default:
        return null;
    }
  }

  /**
   * 获取所有可用命令
   */
  static getAvailableCommands(): string[] {
    return [
      'add_transaction',
      'edit_transaction',
      'delete_transaction',
      'list_transactions',
      'list_accounts',
      'show_balance',
      'show_networth',
      'config',
      'search',
      'report',
      'export',
      'validate',
      'check_structure',
      'init_structure',
      'help'
    ];
  }

  /**
   * 获取命令别名映射
   */
  static getCommandAliases(): Record<string, string> {
    return {
      'add': 'add_transaction',
      'add_tx': 'add_transaction',
      'transaction': 'add_transaction',
      'edit': 'edit_transaction',
      'edit_tx': 'edit_transaction',
      'modify': 'edit_transaction',
      'delete': 'delete_transaction',
      'del': 'delete_transaction',
      'remove': 'delete_transaction',
      'list': 'list_transactions',
      'transactions': 'list_transactions',
      'tx': 'list_transactions',
      'accounts': 'list_accounts',
      'account': 'list_accounts',
      'balance': 'show_balance',
      'bal': 'show_balance',
      'networth': 'show_networth',
      'net': 'show_networth',
      'worth': 'show_networth',
      'settings': 'config',
      'configure': 'config',
      'find': 'search',
      'lookup': 'search',
      'reports': 'report',
      'rpt': 'report',
      'exp': 'export',
      'output': 'export',
      'check': 'validate',
      'verify': 'validate',
      'structure': 'check_structure',
      'init': 'init_structure',
      'initialize': 'init_structure',
      'h': 'help',
      '?': 'help',
      'man': 'help'
    };
  }

  /**
   * 根据别名获取标准命令名
   */
  static getStandardCommandName(alias: string): string {
    const aliases = CommandFactory.getCommandAliases();
    return aliases[alias.toLowerCase()] || alias;
  }

  /**
   * 检查命令是否存在
   */
  static hasCommand(commandName: string): boolean {
    return CommandFactory.createCommand(commandName) !== null;
  }
}
