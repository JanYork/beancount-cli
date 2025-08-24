/**
 * CommandFactory 测试
 */

import { CommandFactory } from '../commands/command-factory';
import { HelpCommand } from '../commands/help-command';
import { AddTransactionCommand } from '../commands/add-transaction-command';
import { ListTransactionsCommand } from '../commands/list-transactions-command';
import { ShowBalanceCommand } from '../commands/show-balance-command';
import { ConfigCommand } from '../commands/config-command';
import { ValidateCommand } from '../commands/validate-command';
import { ExportCommand } from '../commands/export-command';
import { SearchCommand } from '../commands/search-command';
import { ReportCommand } from '../commands/report-command';
import { ListAccountsCommand } from '../commands/list-accounts-command';
import { ShowNetworthCommand } from '../commands/show-networth-command';
import { InitStructureCommand } from '../commands/init-structure-command';
import { CheckStructureCommand } from '../commands/check-structure-command';
import { DeleteTransactionCommand } from '../commands/delete-transaction-command';
import { EditTransactionCommand } from '../commands/edit-transaction-command';

// Mock all command classes
jest.mock('../commands/help-command');
jest.mock('../commands/add-transaction-command');
jest.mock('../commands/list-transactions-command');
jest.mock('../commands/show-balance-command');
jest.mock('../commands/config-command');
jest.mock('../commands/validate-command');
jest.mock('../commands/export-command');
jest.mock('../commands/search-command');
jest.mock('../commands/report-command');
jest.mock('../commands/list-accounts-command');
jest.mock('../commands/show-networth-command');
jest.mock('../commands/init-structure-command');
jest.mock('../commands/check-structure-command');
jest.mock('../commands/delete-transaction-command');
jest.mock('../commands/edit-transaction-command');

describe('CommandFactory', () => {
  let mockEngine: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEngine = {
      getTransactions: jest.fn(),
      addTransaction: jest.fn(),
      deleteTransaction: jest.fn(),
      updateTransaction: jest.fn(),
      getAccounts: jest.fn(),
      getBalance: jest.fn(),
      validateFile: jest.fn(),
      exportData: jest.fn(),
      searchTransactions: jest.fn(),
      generateReport: jest.fn(),
      getNetworth: jest.fn(),
      checkStructure: jest.fn(),
      initStructure: jest.fn(),
    };

    CommandFactory.setEngine(mockEngine);
  });

  describe('createCommand', () => {
    it('应该创建help命令', () => {
      const command = CommandFactory.createCommand('help');
      expect(command).toBeInstanceOf(HelpCommand);
    });

    it('应该创建add_transaction命令', () => {
      const command = CommandFactory.createCommand('add_transaction');
      expect(command).toBeInstanceOf(AddTransactionCommand);
    });

    it('应该创建list_transactions命令', () => {
      const command = CommandFactory.createCommand('list_transactions');
      expect(command).toBeInstanceOf(ListTransactionsCommand);
    });

    it('应该创建show_balance命令', () => {
      const command = CommandFactory.createCommand('show_balance');
      expect(command).toBeInstanceOf(ShowBalanceCommand);
    });

    it('应该创建config命令', () => {
      const command = CommandFactory.createCommand('config');
      expect(command).toBeInstanceOf(ConfigCommand);
    });

    it('应该创建validate命令', () => {
      const command = CommandFactory.createCommand('validate');
      expect(command).toBeInstanceOf(ValidateCommand);
    });

    it('应该创建export命令', () => {
      const command = CommandFactory.createCommand('export');
      expect(command).toBeInstanceOf(ExportCommand);
    });

    it('应该创建search命令', () => {
      const command = CommandFactory.createCommand('search');
      expect(command).toBeInstanceOf(SearchCommand);
    });

    it('应该创建report命令', () => {
      const command = CommandFactory.createCommand('report');
      expect(command).toBeInstanceOf(ReportCommand);
    });

    it('应该创建list_accounts命令', () => {
      const command = CommandFactory.createCommand('list_accounts');
      expect(command).toBeInstanceOf(ListAccountsCommand);
    });

    it('应该创建show_networth命令', () => {
      const command = CommandFactory.createCommand('show_networth');
      expect(command).toBeInstanceOf(ShowNetworthCommand);
    });

    it('应该创建init_structure命令', () => {
      const command = CommandFactory.createCommand('init_structure');
      expect(command).toBeInstanceOf(InitStructureCommand);
    });

    it('应该创建check_structure命令', () => {
      const command = CommandFactory.createCommand('check_structure');
      expect(command).toBeInstanceOf(CheckStructureCommand);
    });

    it('应该创建delete_transaction命令', () => {
      const command = CommandFactory.createCommand('delete_transaction');
      expect(command).toBeInstanceOf(DeleteTransactionCommand);
    });

    it('应该创建edit_transaction命令', () => {
      const command = CommandFactory.createCommand('edit_transaction');
      expect(command).toBeInstanceOf(EditTransactionCommand);
    });

    it('应该处理未知命令', () => {
      const command = CommandFactory.createCommand('unknown_command');
      expect(command).toBeNull();
    });

    it('应该处理空命令名', () => {
      const command = CommandFactory.createCommand('');
      expect(command).toBeNull();
    });

    it('应该处理null命令名', () => {
      const command = CommandFactory.createCommand(null as any);
      expect(command).toBeNull();
    });

    it('应该处理undefined命令名', () => {
      const command = CommandFactory.createCommand(undefined as any);
      expect(command).toBeNull();
    });
  });

  describe('getAvailableCommands', () => {
    it('应该返回所有可用命令', () => {
      const commands = CommandFactory.getAvailableCommands();

      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);

      // 检查是否包含主要命令
      expect(commands).toContain('help');
      expect(commands).toContain('add_transaction');
      expect(commands).toContain('list_transactions');
      expect(commands).toContain('show_balance');
      expect(commands).toContain('config');
      expect(commands).toContain('validate');
      expect(commands).toContain('export');
      expect(commands).toContain('search');
      expect(commands).toContain('report');
      expect(commands).toContain('list_accounts');
      expect(commands).toContain('show_networth');
      expect(commands).toContain('init_structure');
      expect(commands).toContain('check_structure');
      expect(commands).toContain('delete_transaction');
      expect(commands).toContain('edit_transaction');
    });
  });

  describe('getCommandAliases', () => {
    it('应该返回命令别名映射', () => {
      const aliases = CommandFactory.getCommandAliases();

      expect(aliases).toBeInstanceOf(Object);
      expect(aliases['add']).toBe('add_transaction');
      expect(aliases['list']).toBe('list_transactions');
      expect(aliases['balance']).toBe('show_balance');
      expect(aliases['settings']).toBe('config');
      expect(aliases['find']).toBe('search');
      expect(aliases['reports']).toBe('report');
    });
  });

  describe('getStandardCommandName', () => {
    it('应该返回别名的标准命令名', () => {
      expect(CommandFactory.getStandardCommandName('add')).toBe('add_transaction');
      expect(CommandFactory.getStandardCommandName('list')).toBe('list_transactions');
      expect(CommandFactory.getStandardCommandName('balance')).toBe('show_balance');
      expect(CommandFactory.getStandardCommandName('config')).toBe('config');
      expect(CommandFactory.getStandardCommandName('search')).toBe('search');
      expect(CommandFactory.getStandardCommandName('report')).toBe('report');
    });

    it('应该返回原始名称如果不是别名', () => {
      expect(CommandFactory.getStandardCommandName('unknown')).toBe('unknown');
      expect(CommandFactory.getStandardCommandName('add_transaction')).toBe('add_transaction');
    });
  });

  describe('hasCommand', () => {
    it('应该正确识别存在的命令', () => {
      expect(CommandFactory.hasCommand('help')).toBe(true);
      expect(CommandFactory.hasCommand('add_transaction')).toBe(true);
      expect(CommandFactory.hasCommand('list_transactions')).toBe(true);
      expect(CommandFactory.hasCommand('show_balance')).toBe(true);
      expect(CommandFactory.hasCommand('config')).toBe(true);
      expect(CommandFactory.hasCommand('validate')).toBe(true);
      expect(CommandFactory.hasCommand('export')).toBe(true);
      expect(CommandFactory.hasCommand('search')).toBe(true);
      expect(CommandFactory.hasCommand('report')).toBe(true);
      expect(CommandFactory.hasCommand('list_accounts')).toBe(true);
      expect(CommandFactory.hasCommand('show_networth')).toBe(true);
      expect(CommandFactory.hasCommand('init_structure')).toBe(true);
      expect(CommandFactory.hasCommand('check_structure')).toBe(true);
      expect(CommandFactory.hasCommand('delete_transaction')).toBe(true);
      expect(CommandFactory.hasCommand('edit_transaction')).toBe(true);
    });

    it('应该正确识别不存在的命令', () => {
      expect(CommandFactory.hasCommand('unknown_command')).toBe(false);
      expect(CommandFactory.hasCommand('')).toBe(false);
      expect(CommandFactory.hasCommand('invalid')).toBe(false);
    });

    it('应该处理null和undefined', () => {
      expect(CommandFactory.hasCommand(null as any)).toBe(false);
      expect(CommandFactory.hasCommand(undefined as any)).toBe(false);
    });
  });

  describe('边界条件', () => {
    it('应该处理没有设置engine的情况', () => {
      // 清除engine
      CommandFactory.setEngine(null as any);
      
      expect(() => {
        CommandFactory.createCommand('help');
      }).toThrow('引擎未初始化，请先调用 setEngine');
    });

    it('应该处理特殊字符命令名', () => {
      const command = CommandFactory.createCommand('special@#$%');
      expect(command).toBeNull();
    });

    it('应该处理很长的命令名', () => {
      const longCommand = 'a'.repeat(1000);
      const command = CommandFactory.createCommand(longCommand);
      expect(command).toBeNull();
    });

    it('应该处理大小写不敏感', () => {
      const command1 = CommandFactory.createCommand('HELP');
      const command2 = CommandFactory.createCommand('Help');
      const command3 = CommandFactory.createCommand('help');
      
      expect(command1).toBeInstanceOf(HelpCommand);
      expect(command2).toBeInstanceOf(HelpCommand);
      expect(command3).toBeInstanceOf(HelpCommand);
    });
  });
}); 