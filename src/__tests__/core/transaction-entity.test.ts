/**
 * 交易实体测试
 *
 * 作者: JanYork
 */

import { Transaction, Posting } from '../../types';

describe('Transaction Entity', () => {
  describe('Transaction structure', () => {
    it('should have correct structure', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [
          {
            account: 'Expenses:Food',
            units: {
              number: 25,
              currency: 'CNY'
            }
          },
          {
            account: 'Assets:Cash',
            units: {
              number: -25,
              currency: 'CNY'
            }
          }
        ],
        tags: ['food', 'lunch'],
        links: []
      };

      expect(transaction.date).toBeInstanceOf(Date);
      expect(transaction.narration).toBe('午餐');
      expect(transaction.postings).toHaveLength(2);
      expect(transaction.tags).toContain('food');
      expect(transaction.tags).toContain('lunch');
      expect(transaction.links).toHaveLength(0);
    });

    it('should handle optional fields', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [],
        tags: [],
        links: []
      };

      expect(transaction.postings).toHaveLength(0);
      expect(transaction.tags).toHaveLength(0);
      expect(transaction.links).toHaveLength(0);
    });

    it('should handle posting with units', () => {
      const posting: Posting = {
        account: 'Expenses:Food',
        units: {
          number: 25,
          currency: 'CNY'
        }
      };

      expect(posting.account).toBe('Expenses:Food');
      expect(posting.units?.number).toBe(25);
      expect(posting.units?.currency).toBe('CNY');
    });

    it('should handle posting without units', () => {
      const posting: Posting = {
        account: 'Expenses:Food'
      };

      expect(posting.account).toBe('Expenses:Food');
      expect(posting.units).toBeUndefined();
    });

    it('should handle complex transaction', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '购物',
        postings: [
          {
            account: 'Expenses:Food',
            units: {
              number: 25,
              currency: 'CNY'
            }
          },
          {
            account: 'Expenses:Transport',
            units: {
              number: 10,
              currency: 'CNY'
            }
          },
          {
            account: 'Assets:Cash',
            units: {
              number: -35,
              currency: 'CNY'
            }
          }
        ],
        tags: ['shopping', 'food', 'transport'],
        links: ['receipt-001']
      };

      expect(transaction.postings).toHaveLength(3);
      
      const foodPostings = transaction.postings.filter(p => p.account === 'Expenses:Food');
      expect(foodPostings).toHaveLength(1);
      
      const firstFoodPosting = foodPostings[0]!;
      expect(firstFoodPosting.account).toBe('Expenses:Food');
      expect(firstFoodPosting.units?.number).toBe(25);
      
      expect(transaction.tags).toContain('shopping');
      expect(transaction.links).toContain('receipt-001');
    });
  });
}); 