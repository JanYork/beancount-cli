/**
 * 列出交易命令测试
 * 
 * 作者: JanYork
 */

import { ListTransactionsCommand } from '../commands/list-transactions-command';
import { BeancountEngine } from '../engine/beancount-engine';

// Mock BeancountEngine
jest.mock('../engine/beancount-engine');

describe('ListTransactionsCommand', () => {
  let command: ListTransactionsCommand;
  let mockEngine: jest.Mocked<BeancountEngine>;

  beforeEach(() => {
    mockEngine = {
      getTransactions: jest.fn()
    } as any;
    command = new ListTransactionsCommand(mockEngine);
  });

  describe('execute', () => {
    it('should list transactions without date filters', () => {
      const mockTransactions = [
        {
          date: new Date('2024-01-01'),
          narration: '午餐',
          postings: [
            { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
            { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
          ],
          tags: [],
          links: []
        }
      ];

      mockEngine.getTransactions = jest.fn().mockReturnValue(mockTransactions);
      

      const result = command.execute({});
      

      expect(result.success).toBe(true);
      expect(result.message).toContain('找到 1 条交易记录');
      expect(mockEngine.getTransactions).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should list transactions with start date filter', () => {
      const mockTransactions = [
        {
          date: new Date('2024-01-01'),
          narration: '午餐',
          postings: [
            { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
            { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
          ],
          tags: [],
          links: []
        }
      ];

      mockEngine.getTransactions = jest.fn().mockReturnValue(mockTransactions);
      

      const result = command.execute({ start_date: '2024-01-01' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('找到 1 条交易记录');
      expect(mockEngine.getTransactions).toHaveBeenCalledWith(expect.any(Date), undefined);
    });

    it('should list transactions with end date filter', () => {
      const mockTransactions = [
        {
          date: new Date('2024-01-01'),
          narration: '午餐',
          postings: [
            { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
            { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
          ],
          tags: [],
          links: []
        }
      ];

      mockEngine.getTransactions = jest.fn().mockReturnValue(mockTransactions);
      

      const result = command.execute({ end_date: '2024-01-31' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('找到 1 条交易记录');
      expect(mockEngine.getTransactions).toHaveBeenCalledWith(undefined, expect.any(Date));
    });

    it('should list transactions with both date filters', () => {
      const mockTransactions = [
        {
          date: new Date('2024-01-01'),
          narration: '午餐',
          postings: [
            { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
            { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
          ],
          tags: [],
          links: []
        }
      ];

      mockEngine.getTransactions = jest.fn().mockReturnValue(mockTransactions);
      

      const result = command.execute({ 
        start_date: '2024-01-01', 
        end_date: '2024-01-31' 
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('找到 1 条交易记录');
      expect(mockEngine.getTransactions).toHaveBeenCalledWith(
        expect.any(Date), 
        expect.any(Date)
      );
    });

    it('should handle invalid start date format', () => {
      const result = command.execute({ start_date: 'invalid-date' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('开始日期格式错误');
    });

    it('should handle invalid end date format', () => {
      const result = command.execute({ end_date: 'invalid-date' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('结束日期格式错误');
    });

    it('should handle date parsing exception for start date', () => {
      // Test with a date that will cause parse to throw an exception
      const result = command.execute({ start_date: '2024-13-45' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('开始日期格式错误');
    });

    it('should handle date parsing exception for end date', () => {
      // Test with a date that will cause parse to throw an exception
      const result = command.execute({ end_date: '2024-13-45' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('结束日期格式错误');
    });

    it('should handle empty transaction list', () => {
      mockEngine.getTransactions = jest.fn().mockReturnValue([]);

      const result = command.execute({});
      

      expect(result.success).toBe(true);
      expect(result.message).toContain('没有找到交易记录');
    });

    it('should format transaction output correctly', () => {
      const mockTransactions = [
        {
          date: new Date('2024-01-01'),
          payee: '餐厅',
          narration: '午餐',
          postings: [
            { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
            { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
          ],
          tags: ['food', 'lunch'],
          links: []
        }
      ];

      mockEngine.getTransactions = jest.fn().mockReturnValue(mockTransactions);
      

      const result = command.execute({});
      

      expect(result.success).toBe(true);
      expect(result.message).toContain('1. 2024-01-01 - 午餐');
      expect(result.message).toContain('收款人: 餐厅');
      expect(result.message).toContain('Expenses:Food: 25 CNY');
      expect(result.message).toContain('Assets:Cash: -25 CNY');
      expect(result.message).toContain('标签: food, lunch');
    });

    it('should handle transaction without payee', () => {
      const mockTransactions = [
        {
          date: new Date('2024-01-01'),
          narration: '午餐',
          postings: [
            { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
            { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
          ],
          tags: [],
          links: []
        }
      ];

      mockEngine.getTransactions = jest.fn().mockReturnValue(mockTransactions);
      

      const result = command.execute({});
      

      expect(result.success).toBe(true);
      expect(result.message).not.toContain('收款人:');
    });

    it('should handle transaction without tags', () => {
      const mockTransactions = [
        {
          date: new Date('2024-01-01'),
          narration: '午餐',
          postings: [
            { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
            { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
          ],
          tags: [],
          links: []
        }
      ];

      mockEngine.getTransactions = jest.fn().mockReturnValue(mockTransactions);
      

      const result = command.execute({});
      

      expect(result.success).toBe(true);
      expect(result.message).not.toContain('标签:');
    });

    it('should handle posting without units', () => {
      const mockTransactions = [
        {
          date: new Date('2024-01-01'),
          narration: '午餐',
          postings: [
            { account: 'Expenses:Food' }
          ],
          tags: [],
          links: []
        }
      ];

      mockEngine.getTransactions = jest.fn().mockReturnValue(mockTransactions);
      

      const result = command.execute({});
      

      expect(result.success).toBe(true);
      expect(result.message).toContain('1. 2024-01-01 - 午餐');
      // 由于 posting 没有 units，分录信息不会被显示
      expect(result.message).not.toContain('Expenses:Food:');
    });

    it('should handle transaction with null postings', () => {
      const mockTransactions = [
        {
          date: new Date('2024-01-01'),
          narration: '午餐',
          postings: null as any,
          tags: [],
          links: []
        }
      ];

      mockEngine.getTransactions = jest.fn().mockReturnValue(mockTransactions);
      
      const result = command.execute({});
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('列出交易记录失败');
    });

    it('should handle transaction with undefined postings', () => {
      const mockTransactions = [
        {
          date: new Date('2024-01-01'),
          narration: '午餐',
          postings: undefined as any,
          tags: [],
          links: []
        }
      ];

      mockEngine.getTransactions = jest.fn().mockReturnValue(mockTransactions);
      
      const result = command.execute({});
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('列出交易记录失败');
    });

    it('should handle transaction with empty postings array', () => {
      const mockTransactions = [
        {
          date: new Date('2024-01-01'),
          narration: '午餐',
          postings: [],
          tags: [],
          links: []
        }
      ];

      mockEngine.getTransactions = jest.fn().mockReturnValue(mockTransactions);
      
      const result = command.execute({});
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('找到 1 条交易记录');
    });

    it('should handle transaction with null transaction', () => {
      mockEngine.getTransactions = jest.fn().mockReturnValue([
        null as any
      ]);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('找到 1 条交易记录');
    });

    it('should handle transaction with undefined transaction', () => {
      mockEngine.getTransactions = jest.fn().mockReturnValue([
        undefined as any
      ]);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('找到 1 条交易记录');
    });

    it('should handle engine error', () => {
      mockEngine.getTransactions.mockImplementation(() => {
        throw new Error('Engine error');
      });

      const result = command.execute({});

      expect(result.success).toBe(false);
      expect(result.message).toContain('列出交易记录失败');

      // Restore mock
      mockEngine.getTransactions.mockRestore();
    });
  });

  describe('getHelp', () => {
    it('should return help text', () => {
      const help = command.getHelp();
      
      expect(help).toContain('列出交易记录');
      expect(help).toContain('用法:');
      expect(help).toContain('参数:');
      expect(help).toContain('示例:');
    });
  });
}); 