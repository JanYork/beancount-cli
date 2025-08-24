/**
 * TransactionEntity 测试
 */

import { TransactionEntity } from '../core/domain/entities/transaction.entity';

describe('TransactionEntity', () => {
  let instance: TransactionEntity;

  beforeEach(() => {
    // 初始化测试实例
    instance = new TransactionEntity(
      new Date('2024-01-01'),
      '午餐',
      [
        { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
        { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
      ],
      '餐厅',
      ['food', 'lunch'],
      ['receipt-001']
    );
  });

  describe('constructor', () => {
    it('应该正确创建实例', () => {
      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(TransactionEntity);
    });

    it('应该设置正确的属性', () => {
      expect(instance.date).toEqual(new Date('2024-01-01'));
      expect(instance.narration).toBe('午餐');
      expect(instance.payee).toBe('餐厅');
      expect(instance.tags).toEqual(['food', 'lunch']);
      expect(instance.links).toEqual(['receipt-001']);
    });
  });

  describe('基本功能', () => {
    it('应该具有基本属性', () => {
      expect(instance.date).toBeDefined();
      expect(instance.narration).toBeDefined();
      expect(instance.postings).toBeDefined();
    });

    it('应该正确获取分录', () => {
      expect(instance.postings).toHaveLength(2);
      expect(instance.postings[0]?.account).toBe('Expenses:Food');
      expect(instance.postings[1]?.account).toBe('Assets:Cash');
    });

    it('应该正确获取标签', () => {
      expect(instance.tags).toContain('food');
      expect(instance.tags).toContain('lunch');
    });

    it('应该正确获取链接', () => {
      expect(instance.links).toContain('receipt-001');
    });

    it('应该正确获取ID', () => {
      expect(instance.id).toBeDefined();
      expect(instance.id).toMatch(/^txn_\d+_[a-z0-9]+$/);
    });
  });

  describe('金额计算', () => {
    it('应该正确计算总金额', () => {
      const totalAmount = instance.totalAmount;
      expect(totalAmount).toBeDefined();
      expect(totalAmount?.number).toBe(0); // 平衡交易总金额为0
      expect(totalAmount?.currency).toBe('CNY');
    });

    it('应该处理无金额的分录', () => {
      const transactionWithoutAmounts = new TransactionEntity(
        new Date('2024-01-01'),
        '无金额交易',
        [
          { account: 'Expenses:Food' },
          { account: 'Assets:Cash' }
        ]
      );
      expect(transactionWithoutAmounts.totalAmount).toBeNull();
    });
  });

  describe('验证功能', () => {
    it('应该验证交易平衡', () => {
      expect(instance.isBalanced()).toBe(true);
    });

    it('应该检测不平衡交易', () => {
      expect(() => {
        new TransactionEntity(
          new Date('2024-01-01'),
          '不平衡交易',
          [
            { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
            { account: 'Assets:Cash', units: { number: -20, currency: 'CNY' } }
          ]
        );
      }).toThrow('借贷不平衡');
    });

    it('应该允许小的浮点误差', () => {
      const transactionWithSmallError = new TransactionEntity(
        new Date('2024-01-01'),
        '小误差交易',
        [
          { account: 'Expenses:Food', units: { number: 25.001, currency: 'CNY' } },
          { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
        ]
      );
      expect(transactionWithSmallError.isBalanced()).toBe(true);
    });
  });

  describe('查询功能', () => {
    it('应该根据账户查询分录', () => {
      const foodPostings = instance.getPostingsByAccount('Expenses:Food');
      expect(foodPostings).toHaveLength(1);
      expect(foodPostings[0]?.account).toBe('Expenses:Food');
    });

    it('应该返回未找到的分录', () => {
      const notFoundPostings = instance.getPostingsByAccount('NonExistent');
      expect(notFoundPostings).toHaveLength(0);
    });

    it('应该检查是否包含账户', () => {
      expect(instance.hasAccount('Expenses:Food')).toBe(true);
      expect(instance.hasAccount('Assets:Cash')).toBe(true);
      expect(instance.hasAccount('NonExistent')).toBe(false);
    });

    it('应该检查是否包含标签', () => {
      expect(instance.hasTag('food')).toBe(true);
      expect(instance.hasTag('lunch')).toBe(true);
      expect(instance.hasTag('non-existent')).toBe(false);
    });

    it('应该检查是否包含链接', () => {
      expect(instance.hasLink('receipt-001')).toBe(true);
      expect(instance.hasLink('non-existent')).toBe(false);
    });
  });

  describe('数据转换', () => {
    it('应该正确转换为DTO', () => {
      const dto = instance.toDTO();
      expect(dto.date).toEqual(new Date('2024-01-01'));
      expect(dto.narration).toBe('午餐');
      expect(dto.payee).toBe('餐厅');
      expect(dto.tags).toEqual(['food', 'lunch']);
      expect(dto.links).toEqual(['receipt-001']);
      expect(dto.postings).toHaveLength(2);
      expect(dto.id).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('应该验证必需参数', () => {
      expect(() => {
        new TransactionEntity(
          new Date('2024-01-01'),
          '',
          [{ account: 'Expenses:Food' }]
        );
      }).toThrow('交易描述不能为空');
    });

    it('应该验证分录不为空', () => {
      expect(() => {
        new TransactionEntity(
          new Date('2024-01-01'),
          '无分录交易',
          []
        );
      }).toThrow('至少需要一个分录');
    });

    it('应该验证日期有效性', () => {
      expect(() => {
        new TransactionEntity(
          new Date('invalid'),
          '无效日期',
          [{ account: 'Expenses:Food' }]
        );
      }).toThrow('交易日期不能为空且必须有效');
    });

    it('应该验证分录账户名称', () => {
      expect(() => {
        new TransactionEntity(
          new Date('2024-01-01'),
          '无效分录',
          [{ account: '' }]
        );
      }).toThrow('分录 1 缺少账户名称');
    });

    it('应该验证交易平衡', () => {
      expect(() => {
        new TransactionEntity(
          new Date('2024-01-01'),
          '不平衡交易',
          [
            { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
            { account: 'Assets:Cash', units: { number: -20, currency: 'CNY' } }
          ]
        );
      }).toThrow('借贷不平衡');
    });
  });

  describe('边界条件', () => {
    it('应该处理无收款人的交易', () => {
      const transactionWithoutPayee = new TransactionEntity(
        new Date('2024-01-01'),
        '无收款人交易',
        [{ account: 'Expenses:Food' }]
      );
      expect(transactionWithoutPayee.payee).toBeUndefined();
    });

    it('应该处理无标签的交易', () => {
      const transactionWithoutTags = new TransactionEntity(
        new Date('2024-01-01'),
        '无标签交易',
        [{ account: 'Expenses:Food' }]
      );
      expect(transactionWithoutTags.tags).toEqual([]);
    });

    it('应该处理无链接的交易', () => {
      const transactionWithoutLinks = new TransactionEntity(
        new Date('2024-01-01'),
        '无链接交易',
        [{ account: 'Expenses:Food' }]
      );
      expect(transactionWithoutLinks.links).toEqual([]);
    });

    it('应该处理无元数据的交易', () => {
      const transactionWithoutMeta = new TransactionEntity(
        new Date('2024-01-01'),
        '无元数据交易',
        [{ account: 'Expenses:Food' }]
      );
      expect(transactionWithoutMeta.meta).toEqual({});
    });

    it('应该处理自定义ID', () => {
      const customId = 'custom_txn_001';
      const transactionWithCustomId = new TransactionEntity(
        new Date('2024-01-01'),
        '自定义ID交易',
        [{ account: 'Expenses:Food' }],
        undefined,
        [],
        [],
        {},
        customId
      );
      expect(transactionWithCustomId.id).toBe(customId);
    });
  });
});
