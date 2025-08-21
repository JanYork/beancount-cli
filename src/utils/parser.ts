/**
 * Beancount文件解析器
 * 
 * 作者: JanYork
 */

import { parse, format } from 'date-fns';
import { Transaction, Posting, Amount, BeancountEntry } from '../types';

export class BeancountParser {
  /**
   * 解析beancount文件内容
   * 
   * @param content 文件内容
   * @returns 解析后的条目数组
   */
  public static parseContent(content: string): BeancountEntry[] {
    const lines = content.split('\n');
    const entries: BeancountEntry[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() || '';
      
      if (!line || line.startsWith(';')) {
        continue;
      }
      
      try {
        const entry = this.parseLine(line, i + 1);
        if (entry) {
          entries.push(entry);
        }
      } catch (error) {
        // 静默处理解析错误
      }
    }
    
    return entries;
  }
  
  /**
   * 解析单行内容
   * 
   * @param line 行内容
   * @param lineNumber 行号
   * @returns 解析后的条目
   */
  private static parseLine(line: string, lineNumber: number): BeancountEntry | null {
    // 解析日期
    const dateMatch = line.match(/^(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) {
      return null;
    }
    
    const dateStr = dateMatch[1];
    if (!dateStr) {
      return null;
    }
    
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    
    // 解析交易记录
    if (line.includes('*') || line.includes('!')) {
      return this.parseTransaction(line, date, lineNumber);
    }
    
    // 解析账户定义
    if (line.includes('open') || line.includes('close')) {
      return this.parseAccount(line, date, lineNumber);
    }
    
    // 解析余额
    if (line.includes('balance')) {
      return this.parseBalance(line, date, lineNumber);
    }
    
    return null;
  }
  
  /**
   * 解析交易记录
   * 
   * @param line 行内容
   * @param date 日期
   * @param lineNumber 行号
   * @returns 交易记录条目
   */
  private static parseTransaction(line: string, date: Date, lineNumber: number): BeancountEntry {
    const parts = line.split(/\s+/);
    const flag = parts[1];
    let payee: string | undefined;
    let narration: string | undefined;
    
    // 解析收款人和描述
    const remaining = line.substring(line.indexOf(flag || '') + 1).trim();
    if (remaining.includes('"')) {
      const match = remaining.match(/"([^"]+)"/);
      if (match) {
        narration = match[1];
        const beforeNarration = remaining.substring(0, remaining.indexOf('"')).trim();
        if (beforeNarration && !beforeNarration.startsWith('"')) {
          payee = beforeNarration;
        }
      }
    }
    
    return {
      type: 'transaction',
      date,
      flag,
      payee,
      narration: narration || '',
      meta: { lineNumber }
    };
  }
  
  /**
   * 解析账户定义
   * 
   * @param line 行内容
   * @param date 日期
   * @param lineNumber 行号
   * @returns 账户条目
   */
  private static parseAccount(line: string, date: Date, lineNumber: number): BeancountEntry {
    const parts = line.split(/\s+/);
    const action = parts[1]; // open 或 close
    const accountName = parts[2];
    
    return {
      type: action || 'unknown',
      date,
      account: accountName || '',
      meta: { lineNumber }
    };
  }
  
  /**
   * 解析余额
   * 
   * @param line 行内容
   * @param date 日期
   * @param lineNumber 行号
   * @returns 余额条目
   */
  private static parseBalance(line: string, date: Date, lineNumber: number): BeancountEntry {
    const parts = line.split(/\s+/);
    const accountName = parts[2]; // balance 后面是账户名
    const amountNumber = parts[3]; // 金额数字
    const currency = parts[4]; // 货币
    
    // 解析金额
    let amount: Amount | undefined;
    
    if (amountNumber && currency) {
      amount = {
        number: parseFloat(amountNumber),
        currency: currency
      };
    }
    
    return {
      type: 'balance',
      date,
      account: accountName,
      amount,
      meta: { lineNumber }
    };
  }
  
  /**
   * 解析分录
   * 
   * @param lines 分录行数组
   * @param startLine 开始行号
   * @returns 分录数组
   */
  public static parsePostings(lines: string[], startLine: number): Posting[] {
    const postings: Posting[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] || '';
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith(';')) {
        continue;
      }
      
      // 检查是否是分录行（以空格开头）
      if (line.startsWith(' ') || line.startsWith('\t')) {
        const posting = this.parsePostingLine(line, startLine + i);
        if (posting) {
          postings.push(posting);
        }
      }
    }
    
    return postings;
  }
  
  /**
   * 解析单行分录
   * 
   * @param line 行内容
   * @param lineNumber 行号
   * @returns 分录对象
   */
  private static parsePostingLine(line: string, lineNumber: number): Posting | null {
    const trimmed = line.trim();
    if (!trimmed) {
      return null;
    }
    
    const parts = trimmed.split(/\s+/);
    const account = parts[0];
    
    // 解析金额
    let units: Amount | undefined;
    if (parts.length >= 3) {
      // 格式: Expenses:Food 25 CNY
      const amountNumber = parts[1];
      const currency = parts[2];
      if (amountNumber && currency) {
        units = {
          number: parseFloat(amountNumber),
          currency: currency
        };
      }
    } else if (parts.length === 1) {
      // 只有账户名，没有金额
      units = undefined;
    }
    
    const posting: Posting = {
      account: account || '',
      meta: { lineNumber }
    };
    
    if (units) {
      posting.units = units;
    }
    
    return posting;
  }
  
  /**
   * 格式化交易记录为beancount格式
   * 
   * @param transaction 交易记录
   * @returns 格式化的字符串
   */
  public static formatTransaction(transaction: Transaction): string {
    const dateStr = format(transaction.date, 'yyyy-MM-dd');
    const flag = '*';
    const payee = transaction.payee ? ` ${transaction.payee}` : '';
    const narration = transaction.narration ? ` "${transaction.narration}"` : '';
    
    let result = `${dateStr} ${flag}${payee}${narration}`;
    
    // 添加标签
    if (transaction.tags.length > 0) {
      result += `\n  ${transaction.tags.map(tag => `#${tag}`).join(' ')}`;
    }
    
    // 添加链接
    if (transaction.links.length > 0) {
      result += `\n  ${transaction.links.map(link => `^${link}`).join(' ')}`;
    }
    
    // 添加分录
    for (const posting of transaction.postings) {
      result += `\n  ${posting.account}`;
      if (posting.units) {
        result += ` ${posting.units.number} ${posting.units.currency}`;
      }
    }
    
    return result;
  }
  
  /**
   * 验证交易记录
   * 
   * @param transaction 交易记录
   * @returns 验证结果
   */
  public static validateTransaction(transaction: Transaction): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!transaction.date) {
      errors.push('交易日期不能为空');
    }
    
    if (!transaction.narration) {
      errors.push('交易描述不能为空');
    }
    
    if (transaction.postings.length === 0) {
      errors.push('至少需要一个分录');
    }
    
    // 检查借贷平衡
    let total = 0;
    for (const posting of transaction.postings) {
      if (posting.units) {
        total += posting.units.number;
      }
    }
    
    if (Math.abs(total) > 0.01) { // 允许小的浮点误差
      errors.push('借贷不平衡');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
} 