/**
 * 命令解析器测试
 *
 * 作者: JanYork
 */

import { CommandParser } from '../utils/command-parser';

describe('CommandParser', () => {
  describe('parseCommand', () => {
    it('should parse command without parameters', () => {
      const result = CommandParser.parseCommand('/help');

      expect(result.command).toBe('help');
      expect(result.params).toEqual({});
    });

    it('should parse command with simple parameters', () => {
      const result = CommandParser.parseCommand('/show_balance account="Assets:Cash"');

      expect(result.command).toBe('show_balance');
      expect(result.params).toEqual({
        account: 'Assets:Cash',
      });
    });

    it('should parse command with multiple parameters', () => {
      const result = CommandParser.parseCommand('/add_transaction date=2024-01-01 narration="午餐"');

      expect(result.command).toBe('add_transaction');
      expect(result.params).toEqual({
        date: '2024-01-01',
        narration: '午餐',
      });
    });

    it('should parse command with array parameters', () => {
      const result = CommandParser.parseCommand('/add_transaction postings=[{"account":"Expenses:Food","amount":25}]');

      expect(result.command).toBe('add_transaction');
      expect(result.params['postings']).toEqual([{ account: 'Expenses:Food', amount: 25 }]);
    });

    it('should parse command with nested object parameters', () => {
      const result = CommandParser.parseCommand(
        '/add_transaction postings=[{"account":"Expenses:Food","amount":25,"currency":"CNY"}]'
      );

      expect(result.command).toBe('add_transaction');
      expect(result.params['postings']).toEqual([{ account: 'Expenses:Food', amount: 25, currency: 'CNY' }]);
    });

    it('should parse command with boolean parameters', () => {
      const result = CommandParser.parseCommand('/validate strict=true verbose=false');

      expect(result.command).toBe('validate');
      expect(result.params).toEqual({
        strict: true,
        verbose: false,
      });
    });

    it('should parse command with numeric parameters', () => {
      const result = CommandParser.parseCommand('/show_balance limit=100 offset=0');

      expect(result.command).toBe('show_balance');
      expect(result.params).toEqual({
        limit: 100,
        offset: 0,
      });
    });

    it('should parse command with float parameters', () => {
      const result = CommandParser.parseCommand('/add_transaction amount=25.50');

      expect(result.command).toBe('add_transaction');
      expect(result.params).toEqual({
        amount: 25.5,
      });
    });

    it('should parse command with negative numbers', () => {
      const result = CommandParser.parseCommand('/add_transaction amount=-25');

      expect(result.command).toBe('add_transaction');
      expect(result.params).toEqual({
        amount: -25,
      });
    });

    it('should handle command without leading slash', () => {
      const result = CommandParser.parseCommand('help');

      expect(result.command).toBe('help');
      expect(result.params).toEqual({});
    });

    it('should handle empty input', () => {
      const result = CommandParser.parseCommand('');

      expect(result.command).toBe('');
      expect(result.params).toEqual({});
    });

    it('should handle whitespace in parameters', () => {
      const result = CommandParser.parseCommand('/add_transaction narration="  午餐  "');

      expect(result.command).toBe('add_transaction');
      expect(result.params).toEqual({
        narration: '  午餐  ',
      });
    });
  });

  describe('validateCommand', () => {
    it('should validate valid commands', () => {
      const validCommands = [
        'add_transaction',
        'list_transactions',
        'show_balance',
        'show_networth',
        'list_accounts',
        'validate',
        'help',
        'reload',
        'quit',
      ];

      for (const command of validCommands) {
        expect(CommandParser.validateCommand(command)).toBe(true);
      }
    });

    it('should reject invalid commands', () => {
      const invalidCommands = ['invalid_command', 'add', 'show', 'list', 'unknown'];

      for (const command of invalidCommands) {
        expect(CommandParser.validateCommand(command)).toBe(false);
      }
    });

    it('should be case sensitive', () => {
      expect(CommandParser.validateCommand('ADD_TRANSACTION')).toBe(false);
      expect(CommandParser.validateCommand('Add_Transaction')).toBe(false);
    });
  });

  describe('getCommandHelp', () => {
    it('should return help for valid commands', () => {
      const help = CommandParser.getCommandHelp('add_transaction');
      expect(help).toBeTruthy();
      expect(help).toContain('添加交易记录');
    });

    it('should return null for invalid commands', () => {
      const help = CommandParser.getCommandHelp('invalid_command');
      expect(help).toBeNull();
    });

    it('should return help for all valid commands', () => {
      const validCommands = [
        'add_transaction',
        'list_transactions',
        'show_balance',
        'show_networth',
        'list_accounts',
        'validate',
        'reload',
      ];

      for (const command of validCommands) {
        const help = CommandParser.getCommandHelp(command);
        expect(help).toBeTruthy();
        expect(help).toContain('用法:');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle malformed JSON in parameters', () => {
      const result = CommandParser.parseCommand('/add_transaction postings=[{"account":"Expenses:Food","amount":25,}]');

      expect(result.command).toBe('add_transaction');
      expect(result.params['postings']).toBeDefined();
    });

    it('should handle parameters with special characters', () => {
      const result = CommandParser.parseCommand('/add_transaction narration="特殊字符: !@#$%^&*()"');

      expect(result.command).toBe('add_transaction');
      expect(result.params['narration']).toBe('特殊字符: !@#$%^&*()');
    });

    it('should handle parameters with newlines', () => {
      const result = CommandParser.parseCommand('/add_transaction narration="多行\n描述"');

      expect(result.command).toBe('add_transaction');
      expect(result.params['narration']).toBe('多行\n描述');
    });

    it('should handle empty currentPart in parsing', () => {
      // Test case where currentPart is empty after trimming
      const result = CommandParser.parseCommand('/help');

      expect(result.command).toBe('help');
      expect(result.params).toEqual({});
    });

    it('should handle JSON parse errors gracefully', () => {
      // Test case where JSON.parse fails and falls back to parseSimpleList
      const result = CommandParser.parseCommand('/add_transaction postings=[invalid-json]');

      expect(result.command).toBe('add_transaction');
      expect(result.params['postings']).toBeDefined();
    });

    it('should handle case insensitive help lookup', () => {
      const help = CommandParser.getCommandHelp('HELP');
      expect(help).toBeTruthy();
      expect(help).toContain('显示帮助信息');
    });

    it('should handle getAllCommandHelp method', () => {
      const allHelp = CommandParser.getAllCommandHelp();
      expect(allHelp).toContain('可用命令列表');
      expect(allHelp).toContain('add_transaction');
      expect(allHelp).toContain('提示:');
    });

    it('should handle parameters with equal sign at start', () => {
      const result = CommandParser.parseCommand('/add_transaction =value');
      expect(result.command).toBe('add_transaction');
      expect(result.params).toEqual({});
    });

    it('should handle parameters with only key', () => {
      const result = CommandParser.parseCommand('/add_transaction key=');
      expect(result.command).toBe('add_transaction');
      expect(result.params).toEqual({});
    });

    it('should handle empty string input', () => {
      const result = CommandParser.parseCommand('');
      expect(result.command).toBe('');
      expect(result.params).toEqual({});
    });

    it('should handle whitespace only input', () => {
      const result = CommandParser.parseCommand('   ');
      expect(result.command).toBe('');
      expect(result.params).toEqual({});
    });

    it('should handle command with only slash', () => {
      const result = CommandParser.parseCommand('/');
      expect(result.command).toBe('');
      expect(result.params).toEqual({});
    });

    it('should handle parameters with nested braces', () => {
      const result = CommandParser.parseCommand(
        '/add_transaction postings=[{"account":"Expenses:Food","meta":{"tag":"food"}}]'
      );
      expect(result.command).toBe('add_transaction');
      expect(result.params['postings']).toBeDefined();
    });

    it('should handle malformed list with missing closing bracket', () => {
      const result = CommandParser.parseCommand('/add_transaction postings=[{"account":"Expenses:Food"');
      expect(result.command).toBe('add_transaction');
      expect(result.params['postings']).toBeDefined();
    });

    it('should handle numeric string that is not actually numeric', () => {
      const result = CommandParser.parseCommand('/add_transaction amount=25abc');
      expect(result.command).toBe('add_transaction');
      expect(result.params['amount']).toBe('25abc');
    });

    it('should handle empty params text', () => {
      const result = CommandParser.parseCommand('/help ');
      expect(result.command).toBe('help');
      expect(result.params).toEqual({});
    });

    it('should handle params with only whitespace', () => {
      const result = CommandParser.parseCommand('/help   ');
      expect(result.command).toBe('help');
      expect(result.params).toEqual({});
    });

    it('should handle params with empty currentPart', () => {
      const result = CommandParser.parseCommand('/help "test"');
      expect(result.command).toBe('help');
      expect(result.params).toEqual({});
    });

    it('should handle JSON parse error for object', () => {
      const result = CommandParser.parseCommand('/add_transaction meta={invalid-json}');
      expect(result.command).toBe('add_transaction');
      expect(result.params['meta']).toBe('{invalid-json}');
    });

    it('should handle parseSimpleList with empty content', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toEqual([]);
    });

    it('should handle parseSimpleList with nested braces', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[{"key":"value"}]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });

    it('should handle parseSimpleList with JSON parse error', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[{invalid-json}]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });

    it('should handle parseSimpleList with trailing comma', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[hello, world,]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });

    it('should handle parseSimpleList with only trailing comma', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[,]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });

    it('should handle parseSimpleList with empty elements', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[, ,]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });

    it('should handle parseSimpleList with single quote', () => {
      const result = CommandParser.parseCommand("/add_transaction items=['hello']");
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toEqual(["'hello'"]);
    });

    it('should handle parseSimpleList with mixed quotes', () => {
      const result = CommandParser.parseCommand('/add_transaction items=["hello", \'world\']');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });

    it('should handle parseSimpleList with complex nested structure', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[hello, {key: {nested: value}}, world]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });

    it('should handle parseSimpleList with valid JSON object', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[hello, {"key": "value"}, world]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });

    it('should handle parseSimpleList with malformed input', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[hello, world');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });

    it('should handle parseSimpleList with empty content', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toEqual([]);
    });

    it('should handle parseSimpleList with single element', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[hello]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toEqual(['hello']);
    });

    it('should handle parseSimpleList with multiple elements', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[hello, world, test]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });

    it('should handle parseSimpleList with quoted elements', () => {
      const result = CommandParser.parseCommand('/add_transaction items=["hello", "world", "test"]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });

    it('should handle parseSimpleList with mixed elements', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[hello, "world", 123]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });

    it('should handle parseSimpleList with nested braces', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[hello, {key: value}, world]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });

    it('should handle parseSimpleList with commas in quoted strings', () => {
      const result = CommandParser.parseCommand('/add_transaction items=["hello, world", "test, example"]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });

    it('should handle parseSimpleList with commas in nested braces', () => {
      const result = CommandParser.parseCommand('/add_transaction items=[hello, {key: value, nested: data}, world]');
      expect(result.command).toBe('add_transaction');
      expect(result.params['items']).toBeDefined();
    });
  });
});
