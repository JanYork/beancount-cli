/**
 * account-translator 单元测试
 */
import { AccountTranslator } from '../utils/account-translator';
// import { Language } from '../utils/i18n'; // 移除未用

describe('AccountTranslator', () => {
    describe('translateAccount', () => {
        it('should translate exact match', () => {
            expect(AccountTranslator.translateAccount('Assets:Cash', 'zh-CN')).toBe('现金');
            expect(AccountTranslator.translateAccount('Equity:Opening-Balances', 'zh-CN')).toBe('期初余额');
        });

        it('should fallback to base account translation', () => {
            expect(AccountTranslator.translateAccount('Assets:Bank:MyBank', 'zh-CN')).toBe('银行账户:MyBank');
        });

        it('should fallback to root translation', () => {
            expect(AccountTranslator.translateAccount('Assets:Custom', 'zh-CN')).toBe('资产:Custom');
        });

        it('should return original for unknown account', () => {
            expect(AccountTranslator.translateAccount('Unknown:Account', 'zh-CN')).toBe('Unknown:Account');
        });

        it('should return original for en-US', () => {
            expect(AccountTranslator.translateAccount('Assets:Cash', 'en-US')).toBe('Assets:Cash');
        });

        it('should use user translation if exists', () => {
            AccountTranslator.addUserTranslation('Assets:Custom', 'zh-CN', '自定义资产');
            expect(AccountTranslator.translateAccount('Assets:Custom', 'zh-CN')).toBe('自定义资产');
            AccountTranslator.removeUserTranslation('Assets:Custom', 'zh-CN');
        });

        it('should show both names if preference set', () => {
            // 模拟 UserPreferencesManager
            const pref = require('../utils/user-preferences').UserPreferencesManager.getInstance();
            jest.spyOn(pref, 'get').mockImplementation((...args: any[]) => args[0] === 'display.show_both_names');
            expect(AccountTranslator.translateAccount('Assets:Cash', 'zh-CN')).toContain('现金');
            expect(AccountTranslator.translateAccount('Assets:Cash', 'zh-CN')).toContain('Assets:Cash');
            jest.restoreAllMocks();
        });

        it('should show original name if preference set', () => {
            const pref = require('../utils/user-preferences').UserPreferencesManager.getInstance();
            jest.spyOn(pref, 'get').mockImplementation((...args: any[]) => args[0] === 'display.show_original_account_names');
            expect(AccountTranslator.translateAccount('Assets:Cash', 'zh-CN')).toBe('Assets:Cash');
            jest.restoreAllMocks();
        });
    });

    describe('getCategoryName', () => {
        it('should return correct category name', () => {
            expect(AccountTranslator.getCategoryName('assets', 'zh-CN')).toBe('资产');
            expect(AccountTranslator.getCategoryName('liabilities', 'zh-CN')).toBe('负债');
            expect(AccountTranslator.getCategoryName('income', 'en-US')).toBe('Income');
            expect(AccountTranslator.getCategoryName('unknown', 'zh-CN')).toBe('unknown');
        });
    });

    describe('formatTransactionDescription', () => {
        it('should translate common transaction types', () => {
            expect(AccountTranslator.formatTransactionDescription('Salary Bonus', 'zh-CN')).toBe('工资 奖金');
        });
        it('should return original for en-US', () => {
            expect(AccountTranslator.formatTransactionDescription('Salary', 'en-US')).toBe('Salary');
        });
    });

    describe('formatAmount', () => {
        it('should format amount with sign and currency', () => {
            expect(AccountTranslator.formatAmount(1000, 'CNY', 'zh-CN')).toBe('+1,000 CNY');
            expect(AccountTranslator.formatAmount(-500, 'USD', 'en-US')).toBe('-500 USD');
        });
    });
});
