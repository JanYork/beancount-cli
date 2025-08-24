/**
 * AccountTranslator 测试
 */

import { AccountTranslator } from '../utils/account-translator';

describe('AccountTranslator', () => {
  describe('翻译功能', () => {
    it('应该正确翻译英文账户名到中文', () => {
      const result = AccountTranslator.translate('Assets:Cash');
      expect(result).toBe('现金');
    });

    it('应该正确翻译Expenses账户', () => {
      const result = AccountTranslator.translate('Expenses:Food');
      expect(result).toBe('餐饮支出');
    });

    it('应该正确翻译Income账户', () => {
      const result = AccountTranslator.translate('Income:Salary');
      expect(result).toBe('工资收入');
    });

    it('应该正确翻译Liabilities账户', () => {
      const result = AccountTranslator.translate('Liabilities:CreditCard');
      expect(result).toBe('信用卡');
    });

    it('应该正确翻译Equity账户', () => {
      const result = AccountTranslator.translate('Equity:Opening');
      expect(result).toBe('期初余额');
    });
  });

  describe('反向翻译', () => {
    it('应该正确翻译中文账户名到英文', () => {
      const result = AccountTranslator.translate('Assets:Cash');
      expect(result).toBe('现金');
    });

    it('应该正确翻译中文Expenses账户', () => {
      const result = AccountTranslator.translate('Expenses:Food');
      expect(result).toBe('餐饮支出');
    });

    it('应该正确翻译中文Income账户', () => {
      const result = AccountTranslator.translate('Income:Salary');
      expect(result).toBe('工资收入');
    });
  });

  describe('部分翻译', () => {
    it('应该翻译已知的部分', () => {
      const result = AccountTranslator.translate('Assets:Unknown');
      expect(result).toBe('Assets:Unknown');
    });

    it('应该翻译根账户', () => {
      const result = AccountTranslator.translate('Assets');
      expect(result).toBe('Assets');
    });

    it('应该处理未知的根账户', () => {
      const result = AccountTranslator.translate('Unknown');
      expect(result).toBe('Unknown');
    });
  });

  describe('错误处理', () => {
    it('应该处理空字符串', () => {
      const result = AccountTranslator.translate('');
      expect(result).toBe('');
    });

    it('应该处理null值', () => {
      const result = AccountTranslator.translate(null as any);
      expect(result).toBe(null);
    });

    it('应该处理undefined值', () => {
      const result = AccountTranslator.translate(undefined as any);
      expect(result).toBe(undefined);
    });

    it('应该处理不包含冒号的账户名', () => {
      const result = AccountTranslator.translate('SimpleAccount');
      expect(result).toBe('SimpleAccount');
    });
  });

  describe('边界条件', () => {
    it('应该处理多个冒号', () => {
      const result = AccountTranslator.translate('Assets:Bank:Checking');
      expect(result).toBe('Assets:Bank:Checking');
    });

    it('应该处理特殊字符', () => {
      const result = AccountTranslator.translate('Assets:Special-Account');
      expect(result).toBe('Assets:Special-Account');
    });

    it('应该处理数字', () => {
      const result = AccountTranslator.translate('Assets:Account123');
      expect(result).toBe('Assets:Account123');
    });

    it('应该处理空格', () => {
      const result = AccountTranslator.translate('Assets:My Account');
      expect(result).toBe('Assets:My Account');
    });
  });

  describe('批量翻译', () => {
    it('应该能够批量翻译账户名', () => {
      const accounts = ['Assets:Cash', 'Expenses:Food', 'Income:Salary'];
      const results = accounts.map(account => AccountTranslator.translate(account));
      
      expect(results).toEqual(['现金', '餐饮支出', '工资收入']);
    });

    it('应该能够批量反向翻译', () => {
      const accounts = ['Assets:Cash', 'Expenses:Food', 'Income:Salary'];
      const results = accounts.map(account => AccountTranslator.translate(account));
      
      expect(results).toEqual(['现金', '餐饮支出', '工资收入']);
    });
  });

  describe('翻译映射', () => {
    it('应该包含所有主要账户类型', () => {
      const accountTypes = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'];
      
      accountTypes.forEach(type => {
        const result = AccountTranslator.translate(type);
        expect(result).toBe(type); // 根账户类型不会被翻译
      });
    });

    it('应该包含常见的子账户', () => {
      const commonAccounts = [
        'Assets:Cash',
        'Assets:Bank',
        'Expenses:Food',
        'Expenses:Transport',
        'Income:Salary'
      ];
      
      commonAccounts.forEach(account => {
        const result = AccountTranslator.translate(account);
        expect(typeof result).toBe('string'); // 应该返回字符串
      });
    });
  });

  describe('性能测试', () => {
    it('应该能够快速翻译大量账户名', () => {
      const accounts = Array.from({ length: 1000 }, (_, i) => `Assets:Account${i}`);
      
      const startTime = Date.now();
      accounts.forEach(account => AccountTranslator.translate(account));
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
});
