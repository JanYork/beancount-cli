/**
 * Beancount操作引擎
 *
 * 作者: JanYork
 */
import { Account, Transaction, Balance } from '../types';
export declare class BeancountEngine {
    private filePath;
    private entries;
    private errors;
    constructor(filePath: string);
    /**
     * 加载beancount文件
     */
    private loadFile;
    /**
     * 重新加载文件
     */
    reload(): void;
    /**
     * 获取所有账户信息
     */
    getAccounts(): Account[];
    /**
     * 获取账户类型
     */
    private getAccountType;
    /**
     * 获取交易记录
     */
    getTransactions(startDate?: Date, endDate?: Date): Transaction[];
    /**
     * 获取交易记录的分录
     */
    private getPostingsForTransaction;
    /**
     * 提取标签
     */
    private extractTags;
    /**
     * 提取链接
     */
    private extractLinks;
    /**
     * 添加交易记录
     */
    addTransaction(transaction: Transaction): void;
    /**
     * 删除交易记录
     */
    deleteTransaction(transactionDate: Date, narration: string): boolean;
    /**
     * 获取账户余额
     */
    getBalances(account?: string, balanceDate?: Date): Balance[];
    /**
     * 获取净资产信息
     */
    getNetWorth(targetDate?: Date): Record<string, any>;
    /**
     * 获取损益表
     */
    getIncomeStatement(startDate: Date, endDate: Date): Record<string, any>;
    /**
     * 获取资产负债表
     */
    getBalanceSheet(targetDate?: Date): Record<string, any>;
    /**
     * 保存文件
     */
    private saveFile;
    /**
     * 格式化文件内容
     */
    private formatFileContent;
    /**
     * 验证文件
     */
    private validateFile;
    /**
     * 获取文件统计信息
     */
    getFileStats(): Record<string, any>;
}
//# sourceMappingURL=beancount-engine.d.ts.map