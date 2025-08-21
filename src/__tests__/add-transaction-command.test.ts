/**
 * 添加交易命令测试
 *
 * 作者: JanYork
 */

import { AddTransactionCommand } from '../commands/add-transaction-command';


// Mock BeancountEngine
jest.mock('../engine/beancount-engine');

describe('AddTransactionCommand', () => {
  let command: AddTransactionCommand;


  beforeEach(() => {
    command = new AddTransactionCommand();
  });

  describe('execute', () => {
    it('should successfully add transaction with valid parameters', () => {
      const params = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', amount: 25 },
          { account: 'Assets:Cash', amount: -25 },
        ],
      };

      const result = command.execute(params);

      expect(result.success).toBe(true);
      expect(result.message).toContain('成功添加交易记录');
      expect(result.data).toBeDefined();
    });

    it('should fail when date is missing', () => {
      const params = {
        narration: '午餐',
        postings: [{ account: 'Expenses:Food', amount: 25 }],
      };

      const result = command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('缺少必要参数: 日期');
    });

    it('should fail when narration is missing', () => {
      const params = {
        date: '2024-01-01',
        postings: [{ account: 'Expenses:Food', amount: 25 }],
      };

      const result = command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('缺少必要参数: 描述');
    });

    it('should fail with invalid date format', () => {
      const params = {
        date: 'invalid-date',
        narration: '午餐',
        postings: [{ account: 'Expenses:Food', amount: 25 }],
      };

      const result = command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('日期格式错误');
    });

    it('should fail with date parsing exception', () => {
      // Test with a date that will cause parse to fail
      const params = {
        date: '2024-13-45', // Invalid month and day
        narration: '午餐',
        postings: [{ account: 'Expenses:Food', amount: 25 }],
      };

      const result = command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('日期格式错误');
    });

    it('should fail when postings array is empty', () => {
      const params = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [],
      };

      const result = command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('至少需要一个分录');
    });

    it('should fail when postings is missing', () => {
      const params = {
        date: '2024-01-01',
        narration: '午餐',
      };

      const result = command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('缺少必要参数: 分录列表');
    });

    it('should handle posting with missing account', () => {
      const params = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [{ amount: 25 }, { account: 'Assets:Cash', amount: -25 }],
      };

      const result = command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('参数验证失败: 分录 1 缺少账户名称');
    });

    it('should handle posting with missing amount', () => {
      const params = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [{ account: 'Expenses:Food' }, { account: 'Assets:Cash', amount: -25 }],
      };

      const result = command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('参数验证失败: 分录 1 缺少金额');
    });

    it('should use default currency when not specified', () => {
      const params = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', amount: 25 },
          { account: 'Assets:Cash', amount: -25 },
        ],
      };

      const result = command.execute(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle posting with missing account or amount', () => {
      const params = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: '', amount: 25 }, // 缺少账户名称
          { account: 'Assets:Cash' }, // 缺少金额
          { account: 'Expenses:Food', amount: 25 }, // 有效分录
        ],
      };

      const result = command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('参数验证失败: 分录 1 缺少账户名称, 分录 2 缺少金额');
    });

    it('should handle all invalid postings being filtered out', () => {
      // 测试一个所有分录都被过滤掉的情况
      const params = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: '', amount: 25 }, // 缺少账户名称，会被过滤
          { account: 'Assets:Cash' }, // 缺少金额，会被过滤
        ],
      };

      const result = command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('参数验证失败: 分录 1 缺少账户名称, 分录 2 缺少金额');
    });

    it('should handle payee parameter', () => {
      const params = {
        date: '2024-01-01',
        payee: '餐厅',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', amount: 25 },
          { account: 'Assets:Cash', amount: -25 },
        ],
      };

      const result = command.execute(params);

      expect(result.success).toBe(true);
      expect(result.message).toContain('成功添加交易记录');
    });

    it('should handle mixed valid and invalid postings', () => {
      // 测试混合有效和无效分录的情况，覆盖 continue 语句
      const params = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', amount: 25 }, // 有效分录
          { account: '', amount: 25 }, // 缺少账户名称，会被过滤
          { account: 'Assets:Cash', amount: -25 }, // 有效分录
          { account: 'Income:Salary' }, // 缺少金额，会被过滤
        ],
      };

      const result = command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('参数验证失败');
    });

    it('should handle engine error', () => {
      // 测试文件操作抛出异常的情况
      const mockFs = require('fs');
      jest.spyOn(mockFs, 'appendFileSync').mockImplementation(() => {
        throw new Error('File write error');
      });

      const params = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', amount: 25 },
          { account: 'Assets:Cash', amount: -25 },
        ],
      };

      const result = command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('添加交易记录失败');

      // 恢复 mock
      jest.restoreAllMocks();
    });
  });

  describe('getHelp', () => {
    it('should return help text', () => {
      const help = command.getHelp();

      expect(help).toContain('添加交易记录');
      expect(help).toContain('用法:');
      expect(help).toContain('参数:');
      expect(help).toContain('示例:');
    });
  });

  describe('validateParams', () => {
    it('should validate required parameters', () => {
      const validParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [{ account: 'Expenses:Food', amount: 25 }],
      };

      const result = command['validateParams'](validParams);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing date', () => {
      const invalidParams = {
        narration: '午餐',
        postings: [{ account: 'Expenses:Food', amount: 25 }],
      };

      const result = command['validateParams'](invalidParams);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('缺少必要参数: 日期');
    });

    it('should detect missing narration', () => {
      const invalidParams = {
        date: '2024-01-01',
        postings: [{ account: 'Expenses:Food', amount: 25 }],
      };

      const result = command['validateParams'](invalidParams);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('缺少必要参数: 描述');
    });

    it('should detect missing postings', () => {
      const invalidParams = {
        date: '2024-01-01',
        narration: '午餐',
      };

      const result = command['validateParams'](invalidParams);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('缺少必要参数: 分录列表');
    });

    it('should validate posting structure', () => {
      const invalidParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food' }, // missing amount
          { amount: -25 }, // missing account
        ],
      };

      const result = command['validateParams'](invalidParams);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('分录 1 缺少金额');
      expect(result.errors).toContain('分录 2 缺少账户名称');
    });

    it('should handle postings with undefined account', () => {
      const invalidParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [{ account: undefined, amount: 25 }],
      };

      const result = command['validateParams'](invalidParams);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('分录 1 缺少账户名称');
    });

    it('should handle postings with null account', () => {
      const invalidParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [{ account: null, amount: 25 }],
      };

      const result = command['validateParams'](invalidParams);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('分录 1 缺少账户名称');
    });

    it('should handle postings with undefined amount', () => {
      const invalidParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [{ account: 'Expenses:Food', amount: undefined }],
      };

      const result = command['validateParams'](invalidParams);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('分录 1 缺少金额');
    });

    it('should handle postings with null amount', () => {
      const invalidParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [{ account: 'Expenses:Food', amount: null }],
      };

      const result = command['validateParams'](invalidParams);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle postings with empty string account', () => {
      const invalidParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [{ account: '', amount: 25 }],
      };

      const result = command['validateParams'](invalidParams);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('分录 1 缺少账户名称');
    });

    it('should handle postings with whitespace account', () => {
      const invalidParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [{ account: '   ', amount: 25 }],
      };

      const result = command['validateParams'](invalidParams);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle postings with zero amount', () => {
      const validParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', amount: 0 },
          { account: 'Assets:Cash', amount: 0 },
        ],
      };

      const result = command['validateParams'](validParams);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle postings with negative amount', () => {
      const validParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', amount: 25 },
          { account: 'Assets:Cash', amount: -25 },
        ],
      };

      const result = command['validateParams'](validParams);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle postings with decimal amount', () => {
      const validParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', amount: 25.5 },
          { account: 'Assets:Cash', amount: -25.5 },
        ],
      };

      const result = command['validateParams'](validParams);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle postings with custom currency', () => {
      const validParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', amount: 25, currency: 'USD' },
          { account: 'Assets:Cash', amount: -25, currency: 'USD' },
        ],
      };

      const result = command['validateParams'](validParams);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle postings with missing currency (defaults to CNY)', () => {
      const validParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', amount: 25 },
          { account: 'Assets:Cash', amount: -25 },
        ],
      };

      const result = command['validateParams'](validParams);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle postings with empty currency', () => {
      const validParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', amount: 25, currency: '' },
          { account: 'Assets:Cash', amount: -25, currency: '' },
        ],
      };

      const result = command['validateParams'](validParams);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle postings with undefined currency', () => {
      const validParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', amount: 25, currency: undefined },
          { account: 'Assets:Cash', amount: -25, currency: undefined },
        ],
      };

      const result = command['validateParams'](validParams);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle postings with null currency', () => {
      const validParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', amount: 25, currency: null },
          { account: 'Assets:Cash', amount: -25, currency: null },
        ],
      };

      const result = command['validateParams'](validParams);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle postings with whitespace currency', () => {
      const validParams = {
        date: '2024-01-01',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', amount: 25, currency: '   ' },
          { account: 'Assets:Cash', amount: -25, currency: '   ' },
        ],
      };

      const result = command['validateParams'](validParams);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
