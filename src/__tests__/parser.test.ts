/**
 * Beancount解析器测试
 * 
 * 作者: JanYork
 */

import { BeancountParser } from '../utils/parser';
import { Transaction } from '../types';

describe('BeancountParser', () => {
  describe('parseContent', () => {
    it('should parse empty content', () => {
      const result = BeancountParser.parseContent('');
      expect(result).toEqual([]);
    });

    it('should parse content with comments', () => {
      const content = '; 这是注释\n2024-01-01 open Assets:Cash';
      const result = BeancountParser.parseContent(content);
      expect(result).toHaveLength(1);
    });

    it('should parse content with empty lines', () => {
      const content = '\n\n2024-01-01 open Assets:Cash\n\n';
      const result = BeancountParser.parseContent(content);
      expect(result).toHaveLength(1);
    });

    it('should handle parsing errors gracefully', () => {
      const content = '2024-01-01 open Assets:Cash\ninvalid line\n2024-01-02 * "午餐"';
      const result = BeancountParser.parseContent(content);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('parseLine', () => {
    it('should return null for lines without date', () => {
      const result = (BeancountParser as any).parseLine('open Assets:Cash', 1);
      expect(result).toBeNull();
    });

    it('should handle invalid date format', () => {
      const result = (BeancountParser as any).parseLine('invalid-date open Assets:Cash', 1);
      expect(result).toBeNull();
    });

    it('should return null for comment lines', () => {
      const result = (BeancountParser as any).parseLine('; 注释', 1);
      expect(result).toBeNull();
    });

    it('should return null for empty lines', () => {
      const result = (BeancountParser as any).parseLine('   ', 1);
      expect(result).toBeNull();
    });
  });

  describe('parseTransaction', () => {
    it('should parse transaction with flag', () => {
      const result = (BeancountParser as any).parseTransaction(
        '2024-01-01 * "午餐"',
        new Date('2024-01-01'),
        1
      );

      expect(result.type).toBe('transaction');
      expect(result.flag).toBe('*');
      expect(result.narration).toBe('午餐');
      expect(result.payee).toBeUndefined();
    });

    it('should parse transaction with payee and narration', () => {
      const result = (BeancountParser as any).parseTransaction(
        '2024-01-01 * 餐厅 "午餐"',
        new Date('2024-01-01'),
        1
      );

      expect(result.type).toBe('transaction');
      expect(result.payee).toBe('餐厅');
      expect(result.narration).toBe('午餐');
    });

    it('should parse transaction with exclamation flag', () => {
      const result = (BeancountParser as any).parseTransaction(
        '2024-01-01 ! "午餐"',
        new Date('2024-01-01'),
        1
      );

      expect(result.type).toBe('transaction');
      expect(result.flag).toBe('!');
    });

    it('should handle transaction without narration', () => {
      const result = (BeancountParser as any).parseTransaction(
        '2024-01-01 *',
        new Date('2024-01-01'),
        1
      );

      expect(result.type).toBe('transaction');
      expect(result.narration).toBe('');
    });

    it('should handle transaction with complex narration parsing', () => {
      const result = (BeancountParser as any).parseTransaction(
        '2024-01-01 * 餐厅 "午餐"',
        new Date('2024-01-01'),
        1
      );

      expect(result.type).toBe('transaction');
      expect(result.payee).toBe('餐厅');
      expect(result.narration).toBe('午餐');
    });

    it('should handle transaction with narration but no payee', () => {
      const result = (BeancountParser as any).parseTransaction(
        '2024-01-01 * "午餐"',
        new Date('2024-01-01'),
        1
      );

      expect(result.type).toBe('transaction');
      expect(result.payee).toBeUndefined();
      expect(result.narration).toBe('午餐');
    });
  });

  describe('parseAccount', () => {
    it('should parse open account', () => {
      const result = (BeancountParser as any).parseAccount(
        '2024-01-01 open Assets:Cash',
        new Date('2024-01-01'),
        1
      );

      expect(result.type).toBe('open');
      expect(result.account).toBe('Assets:Cash');
    });

    it('should parse close account', () => {
      const result = (BeancountParser as any).parseAccount(
        '2024-01-01 close Assets:Cash',
        new Date('2024-01-01'),
        1
      );

      expect(result.type).toBe('close');
      expect(result.account).toBe('Assets:Cash');
    });
  });

  describe('parseBalance', () => {
    it('should parse balance with amount', () => {
      const result = (BeancountParser as any).parseBalance(
        '2024-01-01 balance Assets:Cash 1000 CNY',
        new Date('2024-01-01'),
        1
      );

      expect(result.type).toBe('balance');
      expect(result.account).toBe('Assets:Cash');
      expect(result.amount?.number).toBe(1000);
      expect(result.amount?.currency).toBe('CNY');
    });

    it('should parse balance with negative amount', () => {
      const result = (BeancountParser as any).parseBalance(
        '2024-01-01 balance Liabilities:Credit -500 CNY',
        new Date('2024-01-01'),
        1
      );

      expect(result.type).toBe('balance');
      expect(result.amount?.number).toBe(-500);
    });

    it('should parse balance with decimal amount', () => {
      const result = (BeancountParser as any).parseBalance(
        '2024-01-01 balance Assets:Cash 1000.50 CNY',
        new Date('2024-01-01'),
        1
      );

      expect(result.type).toBe('balance');
      expect(result.amount?.number).toBe(1000.50);
    });

    it('should handle balance without amount', () => {
      const result = (BeancountParser as any).parseBalance(
        '2024-01-01 balance Assets:Cash',
        new Date('2024-01-01'),
        1
      );

      expect(result.type).toBe('balance');
      expect(result.amount).toBeUndefined();
    });

    it('should handle invalid amount format', () => {
      const result = (BeancountParser as any).parseBalance(
        '2024-01-01 balance Assets:Cash invalid',
        new Date('2024-01-01'),
        1
      );

      expect(result.type).toBe('balance');
      expect(result.amount).toBeUndefined();
    });
  });

  describe('parsePostings', () => {
    it('should parse postings from lines', () => {
      const lines = [
        '  Expenses:Food 25 CNY',
        '  Assets:Cash -25 CNY'
      ];
      
      const result = BeancountParser.parsePostings(lines, 1);
      
      expect(result).toHaveLength(2);
      expect(result[0]?.account).toBe('Expenses:Food');
      expect(result[1]?.account).toBe('Assets:Cash');
    });

    it('should skip non-posting lines', () => {
      const lines = [
        '  Expenses:Food 25 CNY',
        '2024-01-01 * "午餐"',
        '  Assets:Cash -25 CNY'
      ];
      
      const result = BeancountParser.parsePostings(lines, 1);
      
      expect(result).toHaveLength(2);
    });

    it('should skip comment lines', () => {
      const lines = [
        '  Expenses:Food 25 CNY',
        '  ; 这是注释',
        '  Assets:Cash -25 CNY'
      ];
      
      const result = BeancountParser.parsePostings(lines, 1);
      
      expect(result).toHaveLength(2);
    });

    it('should handle empty lines', () => {
      const lines = [
        '  Expenses:Food 25 CNY',
        '',
        '  Assets:Cash -25 CNY'
      ];
      
      const result = BeancountParser.parsePostings(lines, 1);
      
      expect(result).toHaveLength(2);
    });
  });

  describe('parsePostingLine', () => {
    it('should parse posting with account only', () => {
      const result = (BeancountParser as any).parsePostingLine(
        '  Expenses:Food',
        1
      );

      expect(result?.account).toBe('Expenses:Food');
      expect(result?.units).toBeUndefined();
    });

    it('should parse posting with account and amount', () => {
      const result = (BeancountParser as any).parsePostingLine(
        '  Expenses:Food 25 CNY',
        1
      );

      expect(result?.account).toBe('Expenses:Food');
      expect(result?.units?.number).toBe(25);
      expect(result?.units?.currency).toBe('CNY');
    });

    it('should parse posting with negative amount', () => {
      const result = (BeancountParser as any).parsePostingLine(
        '  Assets:Cash -25 CNY',
        1
      );

      expect(result?.account).toBe('Assets:Cash');
      expect(result?.units?.number).toBe(-25);
    });

    it('should parse posting with decimal amount', () => {
      const result = (BeancountParser as any).parsePostingLine(
        '  Expenses:Food 25.50 CNY',
        1
      );

      expect(result?.account).toBe('Expenses:Food');
      expect(result?.units?.number).toBe(25.50);
    });

    it('should return null for empty line', () => {
      const result = (BeancountParser as any).parsePostingLine('', 1);
      expect(result).toBeNull();
    });

    it('should return null for whitespace only line', () => {
      const result = (BeancountParser as any).parsePostingLine('   ', 1);
      expect(result).toBeNull();
    });

    it('should handle invalid amount format', () => {
      const result = (BeancountParser as any).parsePostingLine(
        '  Expenses:Food invalid',
        1
      );

      expect(result?.account).toBe('Expenses:Food');
      expect(result?.units).toBeUndefined();
    });
  });

  describe('formatTransaction', () => {
    it('should format transaction correctly', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
          { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
        ],
        tags: [],
        links: [],
        meta: {}
      };

      const result = BeancountParser.formatTransaction(transaction);
      
      expect(result).toContain('2024-01-01 * "午餐"');
      expect(result).toContain('Expenses:Food 25 CNY');
      expect(result).toContain('Assets:Cash -25 CNY');
    });

    it('should format transaction with payee', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        payee: '餐厅',
        narration: '午餐',
        postings: [],
        tags: [],
        links: [],
        meta: {}
      };

      const result = BeancountParser.formatTransaction(transaction);
      
      expect(result).toContain('2024-01-01 * 餐厅 "午餐"');
    });

    it('should format transaction with tags', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [],
        tags: ['food', 'lunch'],
        links: [],
        meta: {}
      };

      const result = BeancountParser.formatTransaction(transaction);
      
      expect(result).toContain('#food');
      expect(result).toContain('#lunch');
    });

    it('should format transaction with links', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [],
        tags: [],
        links: ['receipt-001'],
        meta: {}
      };

      const result = BeancountParser.formatTransaction(transaction);
      
      expect(result).toContain('^receipt-001');
    });

    it('should format transaction with postings without units', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food' }
        ],
        tags: [],
        links: [],
        meta: {}
      };

      const result = BeancountParser.formatTransaction(transaction);
      
      expect(result).toContain('Expenses:Food');
      expect(result).not.toContain('undefined');
    });
  });

  describe('validateTransaction', () => {
    it('should validate valid transaction', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
          { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
        ],
        tags: [],
        links: [],
        meta: {}
      };

      const result = BeancountParser.validateTransaction(transaction);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing date', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '',
        postings: [],
        tags: [],
        links: [],
        meta: {}
      };

      const result = BeancountParser.validateTransaction(transaction);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('交易描述不能为空');
    });

    it('should detect missing narration', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '',
        postings: [],
        tags: [],
        links: [],
        meta: {}
      };

      const result = BeancountParser.validateTransaction(transaction);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('交易描述不能为空');
    });

    it('should detect missing postings', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [],
        tags: [],
        links: [],
        meta: {}
      };

      const result = BeancountParser.validateTransaction(transaction);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('至少需要一个分录');
    });

    it('should detect unbalanced postings', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } }
        ],
        tags: [],
        links: [],
        meta: {}
      };

      const result = BeancountParser.validateTransaction(transaction);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('借贷不平衡');
    });

    it('should allow small floating point errors', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', units: { number: 25.001, currency: 'CNY' } },
          { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
        ],
        tags: [],
        links: [],
        meta: {}
      };

      const result = BeancountParser.validateTransaction(transaction);
      
      expect(result.valid).toBe(true);
    });

    it('should handle postings without units', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food' },
          { account: 'Assets:Cash' }
        ],
        tags: [],
        links: [],
        meta: {}
      };

      const result = BeancountParser.validateTransaction(transaction);
      
      expect(result.valid).toBe(true);
    });

    it('should handle invalid date format in parseLine', () => {
      const result = (BeancountParser as any).parseLine('invalid-date open Assets:Cash', 1);
      expect(result).toBeNull();
    });

    it('should handle empty date string in parseLine', () => {
      const result = (BeancountParser as any).parseLine(' open Assets:Cash', 1);
      expect(result).toBeNull();
    });

    it('should handle transaction with only flag', () => {
      const result = (BeancountParser as any).parseLine('2024-01-01 *', 1);
      expect(result).toBeDefined();
      expect(result?.type).toBe('transaction');
    });

    it('should handle transaction without narration', () => {
      const result = (BeancountParser as any).parseLine('2024-01-01 * "午餐"', 1);
      expect(result).toBeDefined();
      expect(result?.narration).toBe('午餐');
    });

    it('should handle posting with only account', () => {
      const posting = (BeancountParser as any).parsePostingLine('Assets:Cash', 1);
      expect(posting.account).toBe('Assets:Cash');
      expect(posting.units).toBeUndefined();
    });

    it('should handle posting with amount and currency', () => {
      const posting = (BeancountParser as any).parsePostingLine('Expenses:Food 25 CNY', 1);
      expect(posting.account).toBe('Expenses:Food');
      expect(posting.units).toEqual({
        number: 25,
        currency: 'CNY'
      });
    });

    it('should handle transaction with tags and links in formatTransaction', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
          { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
        ],
        tags: ['food', 'lunch'],
        links: ['receipt-001'],
        meta: {}
      };
      
      const formatted = BeancountParser.formatTransaction(transaction);
      expect(formatted).toContain('#food');
      expect(formatted).toContain('#lunch');
      expect(formatted).toContain('^receipt-001');
    });

    it('should handle transaction with payee and narration', () => {
      const result = (BeancountParser as any).parseTransaction(
        '2024-01-01 * 收款人 "午餐"',
        new Date('2024-01-01'),
        1
      );
      expect(result.payee).toBe('收款人');
      expect(result.narration).toBe('午餐');
    });

    it('should handle transaction without payee', () => {
      const result = (BeancountParser as any).parseTransaction(
        '2024-01-01 * "午餐"',
        new Date('2024-01-01'),
        1
      );
      expect(result.payee).toBeUndefined();
      expect(result.narration).toBe('午餐');
    });

    it('should handle transaction with payee starting with quote', () => {
      const result = (BeancountParser as any).parseTransaction(
        '2024-01-01 * 收款人 "午餐"',
        new Date('2024-01-01'),
        1
      );
      expect(result.payee).toBe('收款人');
    });

    it('should handle account with unknown action', () => {
      const result = (BeancountParser as any).parseAccount(
        '2024-01-01 unknown Assets:Cash',
        new Date('2024-01-01'),
        1
      );
      expect(result.type).toBe('unknown');
    });

    it('should handle account with empty account name', () => {
      const result = (BeancountParser as any).parseAccount(
        '2024-01-01 open',
        new Date('2024-01-01'),
        1
      );
      expect(result.account).toBe('');
    });

    it('should handle balance without amount', () => {
      const result = (BeancountParser as any).parseBalance(
        '2024-01-01 balance Assets:Cash',
        new Date('2024-01-01'),
        1
      );
      expect(result.amount).toBeUndefined();
    });

    it('should handle balance with amount and currency', () => {
      const result = (BeancountParser as any).parseBalance(
        '2024-01-01 balance Assets:Cash 1000 CNY',
        new Date('2024-01-01'),
        1
      );
      expect(result.amount).toEqual({
        number: 1000,
        currency: 'CNY'
      });
    });

    it('should handle line without recognized type', () => {
      const result = (BeancountParser as any).parseLine('2024-01-01 note 这是一条注释', 1);
      expect(result).toBeNull();
    });

    it('should handle parseLine with invalid date format', () => {
      const result = (BeancountParser as any).parseLine('invalid-date * "午餐"', 1);
      expect(result).toBeNull();
    });

    it('should handle parseLine with empty date string', () => {
      const result = (BeancountParser as any).parseLine(' * "午餐"', 1);
      expect(result).toBeNull();
    });

    it('should handle parseLine with unknown entry type', () => {
      const result = (BeancountParser as any).parseLine('2024-01-01 unknown', 1);
      expect(result).toBeNull();
    });

    it('should handle parseTransaction with only flag', () => {
      const result = (BeancountParser as any).parseTransaction('2024-01-01 *', new Date('2024-01-01'), 1);
      expect(result.type).toBe('transaction');
      expect(result.flag).toBe('*');
      expect(result.narration).toBe('');
    });

    it('should handle parseTransaction without narration', () => {
      const result = (BeancountParser as any).parseTransaction('2024-01-01 * 收款人', new Date('2024-01-01'), 1);
      expect(result.type).toBe('transaction');
      expect(result.flag).toBe('*');
      expect(result.payee).toBeUndefined();
      expect(result.narration).toBe('');
    });

    it('should handle parseAccount with missing account name', () => {
      const result = (BeancountParser as any).parseAccount('2024-01-01 open', new Date('2024-01-01'), 1);
      expect(result.type).toBe('open');
      expect(result.account).toBe('');
    });

    it('should handle parseAccount with unknown action', () => {
      const result = (BeancountParser as any).parseAccount('2024-01-01 unknown', new Date('2024-01-01'), 1);
      expect(result.type).toBe('unknown');
    });

    it('should handle parseBalance without amount', () => {
      const result = (BeancountParser as any).parseBalance('2024-01-01 balance Assets:Cash', new Date('2024-01-01'), 1);
      expect(result.type).toBe('balance');
      expect(result.account).toBe('Assets:Cash');
      expect(result.amount).toBeUndefined();
    });

    it('should handle parseBalance with amount', () => {
      const result = (BeancountParser as any).parseBalance('2024-01-01 balance Assets:Cash 1000 CNY', new Date('2024-01-01'), 1);
      expect(result.type).toBe('balance');
      expect(result.account).toBe('Assets:Cash');
      expect(result.amount).toEqual({ number: 1000, currency: 'CNY' });
    });

    it('should handle parsePostingLine with only account', () => {
      const result = (BeancountParser as any).parsePostingLine('  Assets:Cash', 1);
      expect(result.account).toBe('Assets:Cash');
      expect(result.units).toBeUndefined();
    });

    it('should handle parsePostingLine with account and amount', () => {
      const result = (BeancountParser as any).parsePostingLine('  Assets:Cash 1000 CNY', 1);
      expect(result.account).toBe('Assets:Cash');
      expect(result.units).toEqual({ number: 1000, currency: 'CNY' });
    });

    it('should handle formatTransaction with tags and links', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
          { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
        ],
        tags: ['food', 'lunch'],
        links: ['receipt-001'],
        meta: {}
      };
      
      const result = BeancountParser.formatTransaction(transaction);
      expect(result).toContain('#food');
      expect(result).toContain('#lunch');
      expect(result).toContain('^receipt-001');
    });

    it('should handle formatTransaction without payee', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
          { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
        ],
        tags: [],
        links: [],
        meta: {}
      };
      
      const result = BeancountParser.formatTransaction(transaction);
      expect(result).toContain('2024-01-01 * "午餐"');
      expect(result).not.toContain('undefined');
    });

    it('should handle validateTransaction with missing date', () => {
      const transaction: Transaction = {
        date: null as any,
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
          { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
        ],
        tags: [],
        links: [],
        meta: {}
      };
      
      const result = BeancountParser.validateTransaction(transaction);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('交易日期不能为空');
    });

    it('should handle validateTransaction with missing narration', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '',
        postings: [
          { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
          { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
        ],
        tags: [],
        links: [],
        meta: {}
      };
      
      const result = BeancountParser.validateTransaction(transaction);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('交易描述不能为空');
    });

    it('should handle validateTransaction with no postings', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [],
        tags: [],
        links: [],
        meta: {}
      };
      
      const result = BeancountParser.validateTransaction(transaction);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('至少需要一个分录');
    });

    it('should handle validateTransaction with unbalanced postings', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
          { account: 'Assets:Cash', units: { number: -20, currency: 'CNY' } }
        ],
        tags: [],
        links: [],
        meta: {}
      };
      
      const result = BeancountParser.validateTransaction(transaction);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('借贷不平衡');
    });

    it('should handle validateTransaction with balanced postings', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', units: { number: 25, currency: 'CNY' } },
          { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
        ],
        tags: [],
        links: [],
        meta: {}
      };
      
      const result = BeancountParser.validateTransaction(transaction);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle validateTransaction with small floating point error', () => {
      const transaction: Transaction = {
        date: new Date('2024-01-01'),
        narration: '午餐',
        postings: [
          { account: 'Expenses:Food', units: { number: 25.001, currency: 'CNY' } },
          { account: 'Assets:Cash', units: { number: -25, currency: 'CNY' } }
        ],
        tags: [],
        links: [],
        meta: {}
      };
      
      const result = BeancountParser.validateTransaction(transaction);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
}); 