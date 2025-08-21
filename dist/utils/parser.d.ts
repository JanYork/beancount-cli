/**
 * Beancount文件解析器
 *
 * 作者: JanYork
 */
import { Transaction, Posting, BeancountEntry } from '../types';
export declare class BeancountParser {
    /**
     * 解析beancount文件内容
     *
     * @param content 文件内容
     * @returns 解析后的条目数组
     */
    static parseContent(content: string): BeancountEntry[];
    /**
     * 解析单行内容
     *
     * @param line 行内容
     * @param lineNumber 行号
     * @returns 解析后的条目
     */
    private static parseLine;
    /**
     * 解析交易记录
     *
     * @param line 行内容
     * @param date 日期
     * @param lineNumber 行号
     * @returns 交易记录条目
     */
    private static parseTransaction;
    /**
     * 解析账户定义
     *
     * @param line 行内容
     * @param date 日期
     * @param lineNumber 行号
     * @returns 账户条目
     */
    private static parseAccount;
    /**
     * 解析余额
     *
     * @param line 行内容
     * @param date 日期
     * @param lineNumber 行号
     * @returns 余额条目
     */
    private static parseBalance;
    /**
     * 解析分录
     *
     * @param lines 分录行数组
     * @param startLine 开始行号
     * @returns 分录数组
     */
    static parsePostings(lines: string[], startLine: number): Posting[];
    /**
     * 解析单行分录
     *
     * @param line 行内容
     * @param lineNumber 行号
     * @returns 分录对象
     */
    private static parsePostingLine;
    /**
     * 格式化交易记录为beancount格式
     *
     * @param transaction 交易记录
     * @returns 格式化的字符串
     */
    static formatTransaction(transaction: Transaction): string;
    /**
     * 验证交易记录
     *
     * @param transaction 交易记录
     * @returns 验证结果
     */
    static validateTransaction(transaction: Transaction): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=parser.d.ts.map