/**
 * command-factory 单元测试
 */
import { CommandFactory } from '../commands/command-factory';
import { BeancountEngine } from '../engine/beancount-engine';

// Mock engine
const mockEngine = {} as BeancountEngine;

describe('CommandFactory', () => {
  describe('createCommand', () => {
    it('should create add_transaction command', () => {
      const command = CommandFactory.createCommand('add_transaction', mockEngine);
      expect(command).toBeDefined();
      expect(command!.constructor.name).toBe('AddTransactionCommand');
    });

    it('should create list_transactions command', () => {
      const command = CommandFactory.createCommand('list_transactions', mockEngine);
      expect(command).toBeDefined();
      expect(command!.constructor.name).toBe('ListTransactionsCommand');
    });

    it('should create show_balance command', () => {
      const command = CommandFactory.createCommand('show_balance', mockEngine);
      expect(command).toBeDefined();
      expect(command!.constructor.name).toBe('ShowBalanceCommand');
    });

    it('should create show_networth command', () => {
      const command = CommandFactory.createCommand('show_networth', mockEngine);
      expect(command).toBeDefined();
      expect(command!.constructor.name).toBe('ShowNetworthCommand');
    });

    it('should create list_accounts command', () => {
      const command = CommandFactory.createCommand('list_accounts', mockEngine);
      expect(command).toBeDefined();
      expect(command!.constructor.name).toBe('ListAccountsCommand');
    });

    it('should create validate command', () => {
      const command = CommandFactory.createCommand('validate', mockEngine);
      expect(command).toBeDefined();
      expect(command!.constructor.name).toBe('ValidateCommand');
    });

    it('should create config command', () => {
      const command = CommandFactory.createCommand('config', mockEngine);
      expect(command).toBeDefined();
      expect(command!.constructor.name).toBe('ConfigCommand');
    });

    it('should create help command', () => {
      const command = CommandFactory.createCommand('help', mockEngine);
      expect(command).toBeDefined();
      expect(command!.constructor.name).toBe('HelpCommand');
    });

    it('should create init_structure command', () => {
      const command = CommandFactory.createCommand('init_structure', mockEngine);
      expect(command).toBeDefined();
      expect(command!.constructor.name).toBe('InitStructureCommand');
    });

    it('should create check_structure command', () => {
      const command = CommandFactory.createCommand('check_structure', mockEngine);
      expect(command).toBeDefined();
      expect(command!.constructor.name).toBe('CheckStructureCommand');
    });

    it('should return null for unknown command', () => {
      const command = CommandFactory.createCommand('unknown_command', mockEngine);
      expect(command).toBeNull();
    });
  });

  describe('getAvailableCommands', () => {
    it('should return all available commands', () => {
      const commands = CommandFactory.getAvailableCommands();

      expect(commands).toContain('add_transaction');
      expect(commands).toContain('list_transactions');
      expect(commands).toContain('show_balance');
      expect(commands).toContain('show_networth');
      expect(commands).toContain('list_accounts');
      expect(commands).toContain('validate');
      expect(commands).toContain('config');
      expect(commands).toContain('help');
      expect(commands).toContain('init_structure');
      expect(commands).toContain('check_structure');
      expect(commands).toContain('reload');
      expect(commands).toContain('quit');
    });
  });

  describe('isCommandAvailable', () => {
    it('should return true for available commands', () => {
      expect(CommandFactory.isCommandAvailable('help')).toBe(true);
      expect(CommandFactory.isCommandAvailable('add_transaction')).toBe(true);
      expect(CommandFactory.isCommandAvailable('config')).toBe(true);
    });

    it('should return false for unavailable commands', () => {
      expect(CommandFactory.isCommandAvailable('unknown_command')).toBe(false);
      expect(CommandFactory.isCommandAvailable('invalid')).toBe(false);
    });
  });
});
