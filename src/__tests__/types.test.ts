/**
 * 类型定义测试
 * 
 * 作者: JanYork
 */

import { Account, Transaction, Posting, Amount, Balance, BeancountEntry, AccountType } from '../types';

describe('Types', () => {
  describe('Account', () => {
    it('should create account with required fields', () => {
      const account: Account = {
        name: 'Assets:Cash',
        type: 'ASSETS'
      };

      expect(account.name).toBe('Assets:Cash');
      expect(account.type).toBe('ASSETS');
    });

    it('should create account with optional fields', () => {
      const account: Account = {
        name: 'Assets:Bank',
        type: 'ASSETS',
        parent: 'Assets',
        description: '银行账户',
        openDate: new Date('2024-01-01'),
        closeDate: new Date('2024-12-31'),
        meta: { currency: 'CNY' }
      };

      expect(account.parent).toBe('Assets');
      expect(account.description).toBe('银行账户');
      expect(account.openDate).toEqual(new Date('2024-01-01'));
      expect(account.closeDate).toEqual(new Date('2024-12-31'));
      expect(account.meta).toEqual({ currency: 'CNY' });
    });
  });

  describe('Amount', () => {
    it('should create amount with number and currency', () => {
      const amount: Amount = {
        number: 100.50,
        currency: 'CNY'
      };

      expect(amount.number).toBe(100.50);
      expect(amount.currency).toBe('CNY');
    });
  });

  describe('Posting', () => {
    it('should create posting with required fields', () => {
      const posting: Posting = {
        account: 'Assets:Cash'
      };

      expect(posting.account).toBe('Assets:Cash');
    });

    it('should create posting with optional fields', () => {
      const posting: Posting = {
        account: 'Expenses:Food',
        units: { number: 25.00, currency: 'CNY' },
        cost: null,
        price: { number: 1.00, currency: 'CNY' },
        flag: '*',
        meta: { category: 'dining' }
      };

      expect(posting.units?.number).toBe(25.00);
      expect(posting.price?.currency).toBe('CNY');
      expect(posting.flag).toBe('*');
      expect(posting.meta?.['category']).toBe('dining');
    });
  });

  describe('Transaction', () => {
    it('should create transaction with required fields', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [],
        tags: [],
        links: []
      };

      expect(transaction.date).toEqual(new Date('2024-01-01'));
      expect(transaction.narration).toBe('午餐');
      expect(transaction.postings).toEqual([]);
      expect(transaction.tags).toEqual([]);
      expect(transaction.links).toEqual([]);
    });

    it('should create transaction with optional fields', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        payee: '餐厅',
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', units: { number: 25.00, currency: 'CNY' } },
          { account: 'Assets:Cash', units: { number: -25.00, currency: 'CNY' } }
        ],
        tags: ['food', 'lunch'],
        links: ['receipt-001'],
        meta: { location: 'office' }
      };

      expect(transaction.payee).toBe('餐厅');
      expect(transaction.postings).toHaveLength(2);
      expect(transaction.tags).toEqual(['food', 'lunch']);
      expect(transaction.links).toEqual(['receipt-001']);
      expect(transaction.meta?.['location']).toBe('office');
    });
  });

  describe('Balance', () => {
    it('should create balance with all fields', () => {
      const balance: Balance = {
        account: 'Assets:Cash',
        amount: { number: 1000.00, currency: 'CNY' },
        date: new Date('2024-01-01')
      };

      expect(balance.account).toBe('Assets:Cash');
      expect(balance.amount.number).toBe(1000.00);
      expect(balance.amount.currency).toBe('CNY');
      expect(balance.date).toEqual(new Date('2024-01-01'));
    });
  });

  describe('BeancountEntry', () => {
    it('should create entry with basic fields', () => {
      const entry: BeancountEntry = {
        type: 'transaction',
        date: new Date('2024-01-01')
      };

      expect(entry.type).toBe('transaction');
      expect(entry.date).toEqual(new Date('2024-01-01'));
    });

    it('should create entry with additional fields', () => {
      const entry: BeancountEntry = {
        type: 'transaction',
        date: new Date('2024-01-01'),
        payee: '商店',
        narration: '购物',
        meta: { category: 'shopping' }
      };

      expect(entry['payee']).toBe('商店');
      expect(entry['narration']).toBe('购物');
      expect(entry.meta?.['category']).toBe('shopping');
    });
  });

  describe('AccountType', () => {
    it('should have correct account types', () => {
      const types: AccountType[] = ['ASSETS', 'LIABILITIES', 'EQUITY', 'INCOME', 'EXPENSES'];
      
      expect(types).toContain('ASSETS');
      expect(types).toContain('LIABILITIES');
      expect(types).toContain('EQUITY');
      expect(types).toContain('INCOME');
      expect(types).toContain('EXPENSES');
    });
  });
}); 