/**
 * 显示余额命令测试
 * 
 * 作者: JanYork
 */

import { ShowBalanceCommand } from '../commands/show-balance-command';
import { BeancountEngine } from '../engine/beancount-engine';

// Mock BeancountEngine
jest.mock('../engine/beancount-engine');

describe('ShowBalanceCommand', () => {
  let command: ShowBalanceCommand;
  let mockEngine: jest.Mocked<BeancountEngine>;

  beforeEach(() => {
    mockEngine = new BeancountEngine('test.beancount') as jest.Mocked<BeancountEngine>;
    command = new ShowBalanceCommand(mockEngine);
  });

  describe('execute', () => {
    it('should show balances without filters', () => {
      const mockBalances = [
        {
          account: 'Assets:Cash',
          amount: { number: 1000, currency: 'CNY' },
          date: new Date('2024-01-01')
        }
      ];

      mockEngine.getBalances = jest.fn().mockReturnValue(mockBalances);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('账户余额信息');
      expect(mockEngine.getBalances).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should show balances with account filter', () => {
      const mockBalances = [
        {
          account: 'Assets:Cash',
          amount: { number: 1000, currency: 'CNY' },
          date: new Date('2024-01-01')
        }
      ];

      mockEngine.getBalances = jest.fn().mockReturnValue(mockBalances);

      const result = command.execute({ account: 'Assets:Cash' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('账户余额信息');
      expect(mockEngine.getBalances).toHaveBeenCalledWith('Assets:Cash', undefined);
    });

    it('should show balances with date filter', () => {
      const mockBalances = [
        {
          account: 'Assets:Cash',
          amount: { number: 1000, currency: 'CNY' },
          date: new Date('2024-01-01')
        }
      ];

      mockEngine.getBalances = jest.fn().mockReturnValue(mockBalances);

      const result = command.execute({ date: '2024-01-01' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('账户余额信息');
      expect(mockEngine.getBalances).toHaveBeenCalledWith(undefined, expect.any(Date));
    });

    it('should show balances with both filters', () => {
      const mockBalances = [
        {
          account: 'Assets:Cash',
          amount: { number: 1000, currency: 'CNY' },
          date: new Date('2024-01-01')
        }
      ];

      mockEngine.getBalances = jest.fn().mockReturnValue(mockBalances);

      const result = command.execute({ 
        account: 'Assets:Cash', 
        date: '2024-01-01' 
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('账户余额信息');
      expect(mockEngine.getBalances).toHaveBeenCalledWith(
        'Assets:Cash', 
        expect.any(Date)
      );
    });

    it('should handle invalid date format', () => {
      const result = command.execute({ date: 'invalid-date' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('日期格式错误');
    });

    it('should handle date parsing exception', () => {
      // Test with a date that will cause parse to throw an exception
      const result = command.execute({ date: '2024-13-45' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('日期格式错误');
    });

    it('should handle empty balance list', () => {
      mockEngine.getBalances = jest.fn().mockReturnValue([]);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('没有找到余额信息');
    });

    it('should format balance output correctly', () => {
      const mockBalances = [
        {
          account: 'Assets:Cash',
          amount: { number: 1000, currency: 'CNY' },
          date: new Date('2024-01-01')
        },
        {
          account: 'Assets:Bank',
          amount: { number: 5000, currency: 'CNY' },
          date: new Date('2024-01-01')
        }
      ];

      mockEngine.getBalances = jest.fn().mockReturnValue(mockBalances);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('Assets:Cash: +1000 CNY');
      expect(result.message).toContain('Assets:Bank: +5000 CNY');
    });

    it('should handle negative amounts', () => {
      const mockBalances = [
        {
          account: 'Liabilities:Credit',
          amount: { number: -1000, currency: 'CNY' },
          date: new Date('2024-01-01')
        }
      ];

      mockEngine.getBalances = jest.fn().mockReturnValue(mockBalances);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('Liabilities:Credit: -1000 CNY');
    });

    it('should handle decimal amounts', () => {
      const mockBalances = [
        {
          account: 'Assets:Cash',
          amount: { number: 1000.50, currency: 'CNY' },
          date: new Date('2024-01-01')
        }
      ];

      mockEngine.getBalances = jest.fn().mockReturnValue(mockBalances);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('Assets:Cash: +1000.5 CNY');
    });

    it('should handle multiple balances in loop', () => {
      const mockBalances = [
        {
          account: 'Assets:Cash',
          amount: { number: 1000, currency: 'CNY' },
          date: new Date('2024-01-01')
        },
        {
          account: 'Assets:Bank',
          amount: { number: 5000, currency: 'CNY' },
          date: new Date('2024-01-01')
        },
        {
          account: 'Liabilities:Credit',
          amount: { number: -2000, currency: 'CNY' },
          date: new Date('2024-01-01')
        }
      ];

      mockEngine.getBalances = jest.fn().mockReturnValue(mockBalances);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('Assets:Cash: +1000 CNY');
      expect(result.message).toContain('Assets:Bank: +5000 CNY');
      expect(result.message).toContain('Liabilities:Credit: -2000 CNY');
    });

    it('should handle engine error', () => {
      mockEngine.getBalances.mockImplementation(() => {
        throw new Error('Engine error');
      });

      const result = command.execute({});

      expect(result.success).toBe(false);
      expect(result.message).toContain('显示余额失败');

      // Restore mock
      mockEngine.getBalances.mockRestore();
    });
  });

  describe('getHelp', () => {
    it('should return help text', () => {
      const help = command.getHelp();
      
      expect(help).toContain('显示账户余额');
      expect(help).toContain('用法:');
      expect(help).toContain('参数:');
      expect(help).toContain('示例:');
    });
  });
}); 