/**
 * 命令工厂测试
 * 
 * 作者: JanYork
 */

import { CommandFactory } from '../commands/command-factory';

// Mock the engine and engine-dependent commands
jest.mock('../engine/beancount-engine');

describe('CommandFactory', () => {
  beforeEach(() => {
  });

  describe('createCommand', () => {
    it('should create add_transaction command', () => {
      const command = CommandFactory.createCommand('add_transaction', {} as any);
      expect(command).toBeTruthy();
    });

    it('should create list_transactions command', () => {
      const command = CommandFactory.createCommand('list_transactions', {} as any);
      expect(command).toBeTruthy();
    });

    it('should create show_balance command', () => {
      const command = CommandFactory.createCommand('show_balance', {} as any);
      expect(command).toBeTruthy();
    });

    it('should create help command', () => {
      const command = CommandFactory.createCommand('help', {} as any);
      expect(command).toBeTruthy();
    });

    it('should return null for invalid command', () => {
      const command = CommandFactory.createCommand('invalid_command', {} as any);
      expect(command).toBeNull();
    });

    it('should return null for empty command', () => {
      const command = CommandFactory.createCommand('', {} as any);
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
      expect(commands).toContain('help');
      expect(commands).toContain('reload');
      expect(commands).toContain('quit');
      
      expect(commands).toHaveLength(9);
    });
  });

  describe('isCommandAvailable', () => {
    it('should return true for valid commands', () => {
      expect(CommandFactory.isCommandAvailable('add_transaction')).toBe(true);
      expect(CommandFactory.isCommandAvailable('help')).toBe(true);
      expect(CommandFactory.isCommandAvailable('quit')).toBe(true);
    });

    it('should return false for invalid commands', () => {
      expect(CommandFactory.isCommandAvailable('invalid_command')).toBe(false);
      expect(CommandFactory.isCommandAvailable('add')).toBe(false);
      expect(CommandFactory.isCommandAvailable('show')).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(CommandFactory.isCommandAvailable('ADD_TRANSACTION')).toBe(false);
      expect(CommandFactory.isCommandAvailable('Add_Transaction')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(CommandFactory.isCommandAvailable('')).toBe(false);
    });
  });
}); 