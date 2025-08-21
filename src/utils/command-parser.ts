/**
 * 命令解析器
 *
 * 作者: JanYork
 */

import { ParsedCommand } from '../types';

/**
 * 命令解析器类
 */
export class CommandParser {
  /**
   * 解析命令字符串
   *
   * @param input 用户输入的命令字符串
   * @returns 解析后的命令对象
   */
  public static parseCommand(input: string): ParsedCommand {
    if (!input || !input.trim()) {
      return { command: '', params: {} };
    }

    // 移除开头的斜杠
    const cleanInput = input.startsWith('/') ? input.substring(1) : input;

    // 分割命令和参数
    const spaceIndex = cleanInput.indexOf(' ');
    if (spaceIndex === -1) {
      return { command: cleanInput.toLowerCase(), params: {} };
    }

    const commandName = cleanInput.substring(0, spaceIndex).toLowerCase();
    const paramsText = cleanInput.substring(spaceIndex + 1);
    const params = this.parseParameters(paramsText);

    return { command: commandName, params };
  }

  /**
   * 解析参数字符串
   *
   * @param paramsText 参数字符串
   * @returns 参数字典
   */
  private static parseParameters(paramsText: string): Record<string, any> {
    const params: Record<string, any> = {};

    if (!paramsText.trim()) {
      return params;
    }

    // 分割参数，但保持引号内的空格
    const parts: string[] = [];
    let currentPart = '';
    let inQuotes = false;
    let quoteChar: string | null = null;

    for (let i = 0; i < paramsText.length; i++) {
      const char = paramsText[i];
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        currentPart += char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = null;
        currentPart += char;
      } else if (char === ' ' && !inQuotes) {
        if (currentPart.trim()) {
          parts.push(currentPart.trim());
          currentPart = '';
        }
      } else {
        currentPart += char;
      }
    }

    if (currentPart.trim()) {
      parts.push(currentPart.trim());
    }

    for (const part of parts) {
      const equalIndex = part.indexOf('=');
      if (equalIndex > 0) {
        const key = part.substring(0, equalIndex);
        const value = part.substring(equalIndex + 1);
        if (key && value) {
          params[key] = this.parseValue(value);
        }
      }
    }

    return params;
  }

  /**
   * 解析单个值
   *
   * @param value 值字符串
   * @returns 解析后的值
   */
  private static parseValue(value: string): any {
    // 处理引号包围的字符串
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return value.substring(1, value.length - 1);
    }

    // 处理列表
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        return JSON.parse(value);
      } catch (error) {
        return this.parseSimpleList(value);
      }
    }

    // 处理字典
    if (value.startsWith('{') && value.endsWith('}')) {
      try {
        return JSON.parse(value);
      } catch (error) {
        return value; // 如果JSON解析失败，保持原值
      }
    }

    // 处理布尔值
    if (value.toLowerCase() === 'true') {
      return true;
    }
    if (value.toLowerCase() === 'false') {
      return false;
    }

    // 处理数字
    if (this.isNumeric(value)) {
      if (value.includes('.')) {
        return parseFloat(value);
      } else {
        return parseInt(value, 10);
      }
    }

    return value;
  }

  /**
   * 解析简单的列表格式
   *
   * @param listText 列表文本
   * @returns 解析后的列表
   */
  private static parseSimpleList(listText: string): any[] {
    try {
      // 移除方括号
      const content = listText.substring(1, listText.length - 1);

      if (!content) {
        return [];
      }

      // 分割元素
      const elements: string[] = [];
      let currentElement = '';
      let inQuotes = false;
      let quoteChar: string | null = null;
      let braceCount = 0;

      for (const char of content) {
        if ((char === '"' || char === "'") && !inQuotes) {
          inQuotes = true;
          quoteChar = char;
          currentElement += char;
        } else if (char === quoteChar && inQuotes) {
          inQuotes = false;
          quoteChar = null;
          currentElement += char;
        } else if (char === '{' && !inQuotes) {
          braceCount++;
          currentElement += char;
        } else if (char === '}' && !inQuotes) {
          braceCount--;
          currentElement += char;
        } else if (char === ',' && !inQuotes && braceCount === 0) {
          elements.push(currentElement.trim());
          currentElement = '';
        } else {
          currentElement += char;
        }
      }

      // 添加最后一个元素
      if (currentElement.trim()) {
        elements.push(currentElement.trim());
      }

      // 解析每个元素
      const parsedElements: any[] = [];
      for (const element of elements) {
        const trimmed = element.trim();

        // 尝试解析为字典
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const parsed = JSON.parse(trimmed);
            parsedElements.push(parsed);
          } catch (error) {
            parsedElements.push(trimmed);
          }
        } else {
          parsedElements.push(trimmed);
        }
      }

      return parsedElements;
    } catch (error) {
      return [];
    }
  }

  /**
   * 检查字符串是否为数字
   *
   * @param str 要检查的字符串
   * @returns 是否为数字
   */
  private static isNumeric(str: string): boolean {
    return !isNaN(Number(str)) && !isNaN(parseFloat(str));
  }

  /**
   * 验证命令名称是否有效
   *
   * @param commandName 命令名称
   * @returns 是否有效
   */
  public static validateCommand(commandName: string): boolean {
    const validCommands = [
      'add_transaction',
      'list_transactions',
      'show_balance',
      'show_networth',
      'list_accounts',
      'validate',
      'help',
      'reload',
      'quit',
    ];

    return validCommands.includes(commandName);
  }

  /**
   * 获取命令帮助信息
   *
   * @param commandName 命令名称
   * @returns 帮助信息
   */
  public static getCommandHelp(commandName: string): string | null {
    const helpMap: Record<string, string> = {
      add_transaction:
        '添加交易记录\n用法: /add_transaction date=YYYY-MM-DD narration="描述" postings=[{"account":"账户","amount":金额}]\n示例: /add_transaction date=2024-01-01 narration="午餐" postings=[{"account":"Expenses:Food","amount":25}]',
      list_transactions:
        '列出交易记录\n用法: /list_transactions [start_date=YYYY-MM-DD] [end_date=YYYY-MM-DD]\n示例: /list_transactions start_date=2024-01-01 end_date=2024-01-31',
      show_balance:
        '显示账户余额\n用法: /show_balance [account=账户名] [date=YYYY-MM-DD]\n示例: /show_balance account=Assets:Cash date=2024-01-01',
      show_networth: '显示净资产\n用法: /show_networth [date=YYYY-MM-DD]\n示例: /show_networth date=2024-01-01',
      list_accounts: '列出所有账户\n用法: /list_accounts\n示例: /list_accounts',
      validate: '验证beancount文件\n用法: /validate [strict=true/false]\n示例: /validate strict=true',
      help: '显示帮助信息\n用法: /help [command=命令名]\n示例: /help command=add_transaction',
      reload: '重新加载文件\n用法: /reload\n示例: /reload',
      quit: '退出程序\n用法: /quit\n示例: /quit',
    };

    return helpMap[commandName.toLowerCase()] || null;
  }

  /**
   * 获取所有可用命令的帮助信息
   *
   * @returns 所有命令的帮助信息
   */
  public static getAllCommandHelp(): string {
    const commands = [
      'add_transaction',
      'list_transactions',
      'show_balance',
      'show_networth',
      'list_accounts',
      'validate',
      'help',
      'reload',
      'quit',
    ];

    let help = '可用命令列表:\n\n';

    for (const command of commands) {
      const commandHelp = this.getCommandHelp(command);
      if (commandHelp) {
        help += `${command}:\n${commandHelp}\n\n`;
      }
    }

    help += '提示:\n';
    help += '- 所有命令都可以用 / 开头\n';
    help += '- 参数使用 key=value 格式\n';
    help += '- 字符串值可以用引号包围\n';
    help += '- 列表和对象使用JSON格式\n';
    help += '- 使用 /help command=命令名 获取详细帮助\n';

    return help;
  }
}
