/**
 * AccountEntity 测试
 * 自动生成的测试文件
 */

import { AccountEntity } from '../core/domain/entities/account.entity';

describe('AccountEntity', () => {
  let instance: AccountEntity;

  beforeEach(() => {
    // 初始化测试实例
    instance = new AccountEntity(
      'Assets:Cash',
      'ASSETS',
      new Date('2024-01-01'),
      'Assets',
      '现金账户'
    );
  });

  afterEach(() => {
    // 清理测试资源
  });

  describe('constructor', () => {
    it('应该正确创建实例', () => {
      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(AccountEntity);
    });

    it('应该设置正确的属性', () => {
      expect(instance.name).toBe('Assets:Cash');
      expect(instance.type).toBe('ASSETS');
      expect(instance.parent).toBe('Assets');
      expect(instance.description).toBe('现金账户');
    });
  });

  describe('基本功能', () => {
    it('应该具有基本属性', () => {
      expect(instance.name).toBeDefined();
      expect(instance.type).toBeDefined();
      expect(instance.openDate).toBeDefined();
    });

    it('应该能够执行基本操作', () => {
      expect(instance.isClosed()).toBe(false);
      expect(instance.isRoot()).toBe(false);
    });

    it('应该正确获取账户深度', () => {
      expect(instance.getDepth()).toBe(1);
      
      const deepAccount = new AccountEntity(
        'Assets:Bank:Savings',
        'ASSETS',
        new Date('2024-01-01')
      );
      expect(deepAccount.getDepth()).toBe(2);
    });

    it('应该正确获取账户路径', () => {
      expect(instance.getPath()).toEqual(['Assets', 'Cash']);
      
      const deepAccount = new AccountEntity(
        'Assets:Bank:Savings',
        'ASSETS',
        new Date('2024-01-01')
      );
      expect(deepAccount.getPath()).toEqual(['Assets', 'Bank', 'Savings']);
    });

    it('应该正确获取根名称', () => {
      expect(instance.getRootName()).toBe('Assets');
    });
  });

  describe('账户类型检查', () => {
    it('应该正确检查资产账户', () => {
      expect(instance.isAsset()).toBe(true);
      expect(instance.isOfType('ASSETS')).toBe(true);
    });

    it('应该正确检查负债账户', () => {
      const liabilityAccount = new AccountEntity(
        'Liabilities:Credit',
        'LIABILITIES',
        new Date('2024-01-01')
      );
      expect(liabilityAccount.isLiability()).toBe(true);
      expect(liabilityAccount.isOfType('LIABILITIES')).toBe(true);
    });

    it('应该正确检查权益账户', () => {
      const equityAccount = new AccountEntity(
        'Equity:Opening',
        'EQUITY',
        new Date('2024-01-01')
      );
      expect(equityAccount.isEquity()).toBe(true);
      expect(equityAccount.isOfType('EQUITY')).toBe(true);
    });

    it('应该正确检查收入账户', () => {
      const incomeAccount = new AccountEntity(
        'Income:Salary',
        'INCOME',
        new Date('2024-01-01')
      );
      expect(incomeAccount.isIncome()).toBe(true);
      expect(incomeAccount.isOfType('INCOME')).toBe(true);
    });

    it('应该正确检查支出账户', () => {
      const expenseAccount = new AccountEntity(
        'Expenses:Food',
        'EXPENSES',
        new Date('2024-01-01')
      );
      expect(expenseAccount.isExpense()).toBe(true);
      expect(expenseAccount.isOfType('EXPENSES')).toBe(true);
    });
  });

  describe('账户状态', () => {
    it('应该正确处理关闭账户', () => {
      const closeDate = new Date('2024-12-31');
      const closedAccount = instance.close(closeDate);
      
      expect(closedAccount.isClosed()).toBe(true);
      expect(closedAccount.closeDate).toEqual(closeDate);
      expect(closedAccount.name).toBe(instance.name);
    });

    it('应该防止重复关闭账户', () => {
      const closedAccount = instance.close();
      expect(() => closedAccount.close()).toThrow('账户已经关闭');
    });

    it('应该正确处理元数据更新', () => {
      const updatedAccount = instance.updateMeta({ currency: 'CNY' });
      expect(updatedAccount.meta['currency']).toBe('CNY');
      expect(updatedAccount.name).toBe(instance.name);
    });
  });

  describe('数据转换', () => {
    it('应该正确转换为DTO', () => {
      const dto = instance.toDTO();
      expect(dto.name).toBe('Assets:Cash');
      expect(dto.type).toBe('ASSETS');
      expect(dto.parent).toBe('Assets');
      expect(dto.description).toBe('现金账户');
      expect(dto.openDate).toEqual(new Date('2024-01-01'));
    });
  });

  describe('错误处理', () => {
    it('应该正确处理错误情况', () => {
      expect(() => {
        new AccountEntity('', 'ASSETS', new Date());
      }).toThrow();
    });

    it('应该验证账户名称格式', () => {
      expect(() => {
        new AccountEntity('InvalidName', 'ASSETS', new Date());
      }).toThrow('账户名称必须包含冒号分隔符');
    });

    it('应该验证开户日期', () => {
      expect(() => {
        new AccountEntity('Assets:Cash', 'ASSETS', new Date('invalid'));
      }).toThrow('开户日期不能为空且必须有效');
    });

    it('应该验证关闭日期', () => {
      const openDate = new Date('2024-01-01');
      const closeDate = new Date('2023-12-31');
      expect(() => {
        new AccountEntity('Assets:Cash', 'ASSETS', openDate, undefined, undefined, closeDate);
      }).toThrow('关闭日期必须晚于开户日期');
    });
  });

  describe('边界条件', () => {
    it('应该处理边界条件', () => {
      // 测试有父账户的情况
      const childAccount = new AccountEntity(
        'Assets:Cash',
        'ASSETS',
        new Date('2024-01-01'),
        'Assets',
        '现金账户'
      );
      expect(childAccount.isRoot()).toBe(false);
      expect(childAccount.isChild()).toBe(true);
      
      // 测试根账户（没有父账户，但名称仍需要包含冒号）
      const rootAccount = new AccountEntity(
        'Assets:Root',
        'ASSETS',
        new Date('2024-01-01')
      );
      expect(rootAccount.isRoot()).toBe(true);
      expect(rootAccount.isChild()).toBe(false);
    });

    it('应该处理空元数据', () => {
      const accountWithEmptyMeta = new AccountEntity(
        'Assets:Cash',
        'ASSETS',
        new Date('2024-01-01'),
        'Assets',
        '现金账户',
        undefined,
        {}
      );
      expect(accountWithEmptyMeta.meta).toEqual({});
    });

    it('应该处理复杂元数据', () => {
      const complexMeta = {
        currency: 'CNY',
        country: 'CN',
        tags: ['cash', 'liquid']
      };
      const accountWithComplexMeta = new AccountEntity(
        'Assets:Cash',
        'ASSETS',
        new Date('2024-01-01'),
        'Assets',
        '现金账户',
        undefined,
        complexMeta
      );
      expect(accountWithComplexMeta.meta).toEqual(complexMeta);
    });
  });
});
