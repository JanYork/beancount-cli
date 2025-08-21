"use strict";
/**
 * Beancount操作引擎
 *
 * 作者: JanYork
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeancountEngine = void 0;
const fs_1 = require("fs");
const date_fns_1 = require("date-fns");
const parser_1 = require("../utils/parser");
class BeancountEngine {
    // private options: Record<string, any> = {};
    constructor(filePath) {
        this.entries = [];
        this.errors = [];
        this.filePath = filePath;
        this.loadFile();
    }
    /**
     * 加载beancount文件
     */
    loadFile() {
        try {
            if (!(0, fs_1.existsSync)(this.filePath)) {
                throw new Error(`文件不存在: ${this.filePath}`);
            }
            const content = (0, fs_1.readFileSync)(this.filePath, 'utf-8');
            this.entries = parser_1.BeancountParser.parseContent(content);
            // 验证文件
            this.errors = this.validateFile();
            if (this.errors.length > 0) {
                console.warn(`⚠️  加载文件时发现 ${this.errors.length} 个错误`);
            }
        }
        catch (error) {
            throw new Error(`加载文件失败: ${error}`);
        }
    }
    /**
     * 重新加载文件
     */
    reload() {
        this.loadFile();
    }
    /**
     * 获取所有账户信息
     */
    getAccounts() {
        const accounts = [];
        for (const entry of this.entries) {
            if (entry.type === 'open') {
                const accountName = entry['account'];
                if (accountName) {
                    const accountType = this.getAccountType(accountName);
                    const account = {
                        name: accountName,
                        type: accountType,
                        openDate: entry.date,
                        meta: entry.meta || {}
                    };
                    accounts.push(account);
                }
            }
        }
        return accounts;
    }
    /**
     * 获取账户类型
     */
    getAccountType(accountName) {
        const parts = accountName.split(':');
        const rootAccount = parts[0]?.toUpperCase();
        switch (rootAccount) {
            case 'ASSETS':
                return 'ASSETS';
            case 'LIABILITIES':
                return 'LIABILITIES';
            case 'EQUITY':
                return 'EQUITY';
            case 'INCOME':
                return 'INCOME';
            case 'EXPENSES':
                return 'EXPENSES';
            default:
                return 'ASSETS';
        }
    }
    /**
     * 获取交易记录
     */
    getTransactions(startDate, endDate) {
        const transactions = [];
        for (const entry of this.entries) {
            if (entry.type === 'transaction') {
                // 检查日期范围
                if (startDate && (0, date_fns_1.isBefore)(entry.date, (0, date_fns_1.startOfDay)(startDate))) {
                    continue;
                }
                if (endDate && (0, date_fns_1.isAfter)(entry.date, (0, date_fns_1.endOfDay)(endDate))) {
                    continue;
                }
                // 构建交易记录
                const transaction = {
                    date: entry.date,
                    payee: entry['payee'],
                    narration: entry['narration'] || '',
                    postings: this.getPostingsForTransaction(entry),
                    tags: this.extractTags(entry),
                    links: this.extractLinks(entry),
                    meta: entry.meta || {}
                };
                transactions.push(transaction);
            }
        }
        return transactions;
    }
    /**
     * 获取交易记录的分录
     */
    getPostingsForTransaction(entry) {
        // 从条目中获取分录数据
        if (entry['postings'] && Array.isArray(entry['postings'])) {
            return entry['postings'].map(posting => ({
                account: posting.account || '',
                units: posting.units,
                meta: posting.meta || {}
            }));
        }
        return [];
    }
    /**
     * 提取标签
     */
    extractTags(_entry) {
        // 从元数据中提取标签
        return [];
    }
    /**
     * 提取链接
     */
    extractLinks(_entry) {
        // 从元数据中提取链接
        return [];
    }
    /**
     * 添加交易记录
     */
    addTransaction(transaction) {
        // 验证交易记录
        const validation = parser_1.BeancountParser.validateTransaction(transaction);
        if (!validation.valid) {
            throw new Error(`交易记录验证失败: ${validation.errors.join(', ')}`);
        }
        // 创建beancount条目
        const entry = {
            type: 'transaction',
            date: transaction.date,
            payee: transaction.payee,
            narration: transaction.narration,
            meta: { ...transaction.meta, tags: transaction.tags, links: transaction.links }
        };
        this.entries.push(entry);
        this.saveFile();
    }
    /**
     * 删除交易记录
     */
    deleteTransaction(transactionDate, narration) {
        for (let i = 0; i < this.entries.length; i++) {
            const entry = this.entries[i];
            if (entry && entry.type === 'transaction' &&
                entry.date.getTime() === transactionDate.getTime() &&
                entry['narration'] === narration) {
                this.entries.splice(i, 1);
                this.saveFile();
                return true;
            }
        }
        return false;
    }
    /**
     * 获取账户余额
     */
    getBalances(account, balanceDate) {
        const balances = [];
        const targetDate = balanceDate || new Date();
        for (const entry of this.entries) {
            if (entry.type === 'balance') {
                if (account && entry['account'] !== account) {
                    continue;
                }
                if (entry['amount'] && entry.date.getTime() <= targetDate.getTime()) {
                    const balance = {
                        account: entry['account'] || '',
                        amount: entry['amount'],
                        date: entry.date
                    };
                    balances.push(balance);
                }
            }
        }
        return balances;
    }
    /**
     * 获取净资产信息
     */
    getNetWorth(targetDate) {
        const date = targetDate || new Date();
        const balances = this.getBalances(undefined, date);
        let totalAssets = 0;
        let totalLiabilities = 0;
        for (const balance of balances) {
            const accountType = this.getAccountType(balance.account);
            const amount = balance.amount.number;
            if (accountType === 'ASSETS') {
                totalAssets += amount;
            }
            else if (accountType === 'LIABILITIES') {
                totalLiabilities += amount;
            }
        }
        return {
            date: (0, date_fns_1.format)(date, 'yyyy-MM-dd'),
            totalAssets,
            totalLiabilities,
            netWorth: totalAssets - totalLiabilities
        };
    }
    /**
     * 获取损益表
     */
    getIncomeStatement(startDate, endDate) {
        const transactions = this.getTransactions(startDate, endDate);
        let totalIncome = 0;
        let totalExpenses = 0;
        for (const transaction of transactions) {
            for (const posting of transaction.postings) {
                const accountType = this.getAccountType(posting.account);
                const amount = posting.units?.number || 0;
                if (accountType === 'INCOME') {
                    totalIncome += amount;
                }
                else if (accountType === 'EXPENSES') {
                    totalExpenses += amount;
                }
            }
        }
        return {
            startDate: (0, date_fns_1.format)(startDate, 'yyyy-MM-dd'),
            endDate: (0, date_fns_1.format)(endDate, 'yyyy-MM-dd'),
            totalIncome,
            totalExpenses,
            netIncome: totalIncome - totalExpenses
        };
    }
    /**
     * 获取资产负债表
     */
    getBalanceSheet(targetDate) {
        const date = targetDate || new Date();
        const balances = this.getBalances(undefined, date);
        const assets = {};
        const liabilities = {};
        const equity = {};
        for (const balance of balances) {
            const accountType = this.getAccountType(balance.account);
            const amount = balance.amount.number;
            switch (accountType) {
                case 'ASSETS':
                    assets[balance.account] = amount;
                    break;
                case 'LIABILITIES':
                    liabilities[balance.account] = amount;
                    break;
                case 'EQUITY':
                    equity[balance.account] = amount;
                    break;
            }
        }
        return {
            date: (0, date_fns_1.format)(date, 'yyyy-MM-dd'),
            assets,
            liabilities,
            equity
        };
    }
    /**
     * 保存文件
     */
    saveFile() {
        try {
            const content = this.formatFileContent();
            (0, fs_1.writeFileSync)(this.filePath, content, 'utf-8');
        }
        catch (error) {
            throw new Error(`保存文件失败: ${error}`);
        }
    }
    /**
     * 格式化文件内容
     */
    formatFileContent() {
        const lines = [];
        for (const entry of this.entries) {
            if (entry.type === 'transaction') {
                const transaction = {
                    date: entry.date,
                    payee: entry['payee'],
                    narration: entry['narration'] || '',
                    postings: [],
                    tags: [],
                    links: [],
                    meta: entry.meta || {}
                };
                lines.push(parser_1.BeancountParser.formatTransaction(transaction));
            }
            else if (entry.type === 'open' || entry.type === 'close') {
                const dateStr = (0, date_fns_1.format)(entry.date, 'yyyy-MM-dd');
                lines.push(`${dateStr} ${entry.type} ${entry['account']}`);
            }
            else if (entry.type === 'balance' && entry['amount']) {
                const dateStr = (0, date_fns_1.format)(entry.date, 'yyyy-MM-dd');
                lines.push(`${dateStr} balance ${entry['account']} ${entry['amount'].number} ${entry['amount'].currency}`);
            }
            lines.push(''); // 空行分隔
        }
        return lines.join('\n');
    }
    /**
     * 验证文件
     */
    validateFile() {
        const errors = [];
        for (const entry of this.entries) {
            if (entry.type === 'transaction') {
                const transaction = {
                    date: entry.date,
                    payee: entry['payee'],
                    narration: entry['narration'] || '',
                    postings: [],
                    tags: [],
                    links: [],
                    meta: entry.meta || {}
                };
                const validation = parser_1.BeancountParser.validateTransaction(transaction);
                if (!validation.valid) {
                    errors.push(...validation.errors);
                }
            }
        }
        return errors;
    }
    /**
     * 获取文件统计信息
     */
    getFileStats() {
        const accounts = this.getAccounts();
        const transactions = this.getTransactions();
        const balances = this.getBalances();
        return {
            totalAccounts: accounts.length,
            totalTransactions: transactions.length,
            totalBalances: balances.length,
            totalErrors: this.errors.length,
            filePath: this.filePath
        };
    }
}
exports.BeancountEngine = BeancountEngine;
//# sourceMappingURL=beancount-engine.js.map