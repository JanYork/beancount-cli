/**
 * 命令解析器
 * 负责解析和验证用户输入的命令
 * 
 * @author JanYork
 */

import { CommandCompleter } from '../../utils/command-completer';

/**
 * 解析后的命令结构
 */
export interface ParsedCommand {
  command: string;
  params: Record<string, any>;
}

/**
 * 命令解析器类
 * 负责解析用户输入的命令字符串
 */
export class CommandParser {
  /**
   * 解析命令字符串
   * @param input 用户输入的命令字符串
   * @returns 解析后的命令对象
   */
  static parseCommand(input: string): ParsedCommand {
    // 移除开头的斜杠
    const cleanInput = input.startsWith('/') ? input.substring(1) : input;
    const [command, ...paramParts] = cleanInput.trim().split(' ');
    const parsedCommand = command || '';

    // 解析参数
    const params: Record<string, any> = {};
    
    // 重新组合参数字符串，然后解析
    const paramsString = paramParts.join(' ');
    if (paramsString.trim()) {
      const parsedParams = this.parseParameters(paramsString);
      Object.assign(params, parsedParams);
    }

    return {
      command: parsedCommand,
      params,
    };
  }

  /**
   * 解析参数字符串
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
        if (key && value !== undefined) {
          // 处理嵌套键，如 currency.default
          this.setNestedValue(params, key, value);
        }
      } else if (part && !part.startsWith('=') && !part.startsWith('"') && !part.startsWith("'")) {
        // 如果没有等号且不以=开头且不是引号字符串，作为位置参数
        if (!params['args']) {
          params['args'] = [];
        }
        (params['args'] as any[]).push(part);
      }
    }

    return params;
  }

  /**
   * 设置嵌套值
   */
  private static setNestedValue(obj: Record<string, any>, key: string, value: string): void {
    const keys = key.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (k && (!(k in current) || typeof current[k] !== 'object')) {
        current[k] = {};
      }
      if (k) {
        current = current[k];
      }
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      // 尝试解析值类型
      const parsedValue = this.parseValue(value);
      // 只有当值不为空时才设置
      if (parsedValue !== '' && parsedValue !== null && parsedValue !== undefined) {
        current[lastKey] = parsedValue;
      }
    }
  }

  /**
   * 解析单个值
   */
  private static parseValue(value: string): any {
    // 如果值为空，返回空字符串
    if (!value || value.trim() === '') {
      return '';
    }
    
    // 移除引号
    const cleanValue = value.replace(/^["']|["']$/g, '');
    
    // 尝试解析布尔值
    if (cleanValue === 'true' || cleanValue === 'false') {
      return cleanValue === 'true';
    }
    
    // 尝试解析数字
    if (!isNaN(Number(cleanValue)) && cleanValue !== '') {
      return Number(cleanValue);
    }
    
    // 尝试解析数组（简单格式）
    if (cleanValue.startsWith('[') && cleanValue.endsWith(']')) {
      try {
        // 尝试解析为 JSON 数组
        return JSON.parse(cleanValue);
      } catch {
        // 如果不是有效的 JSON，尝试解析为简单数组
        const content = cleanValue.slice(1, -1);
        if (content.trim() === '') {
          return [];
        }
        // 简单分割，但保持引号内的逗号
        const items: string[] = [];
        let currentItem = '';
        let inQuotes = false;
        let quoteChar: string | null = null;
        
        for (let i = 0; i < content.length; i++) {
          const char = content[i];
          if ((char === '"' || char === "'") && !inQuotes) {
            inQuotes = true;
            quoteChar = char;
            currentItem += char;
          } else if (char === quoteChar && inQuotes) {
            inQuotes = false;
            quoteChar = null;
            currentItem += char;
          } else if (char === ',' && !inQuotes) {
            if (currentItem.trim()) {
              items.push(currentItem.trim());
              currentItem = '';
            }
          } else {
            currentItem += char;
          }
        }
        
        if (currentItem.trim()) {
          items.push(currentItem.trim());
        }
        
        return items.map(item => {
          // 保持原始格式，不移除引号
          return item;
        });
      }
    }
    
    // 尝试解析 JSON
    try {
      return JSON.parse(cleanValue);
    } catch {
      // 如果不是有效的 JSON，返回原始值
      return cleanValue;
    }
  }

  /**
   * 验证命令是否有效
   * @param command 命令名称
   * @returns 是否有效
   */
  static validateCommand(command: string): boolean {
    const allCommands = CommandCompleter.getAllCommands();
    return allCommands.some(cmd => 
      cmd.command === command || 
      cmd.aliases?.includes(command)
    );
  }

  /**
   * 获取命令帮助信息
   * @param commandName 命令名称
   * @returns 帮助信息或null
   */
  static getCommandHelp(commandName: string): string | null {
    const commandDetails = CommandCompleter.getCommandDetails(commandName.toLowerCase());
    if (commandDetails) {
      // 根据命令类型返回实际的帮助文本
      const helpTexts: Record<string, string> = {
        'help': '用法: help [命令名]\n显示帮助信息',
        'add_transaction': '用法: add_transaction [参数]\n添加交易记录',
        'list_transactions': '用法: list_transactions [参数]\n列出交易记录',
        'show_balance': '用法: show_balance [参数]\n显示账户余额',
        'show_networth': '用法: show_networth [参数]\n显示净资产',
        'list_accounts': '用法: list_accounts [参数]\n列出所有账户',
        'config': '用法: config [参数]\n配置管理',
        'search': '用法: search [参数]\n搜索交易记录',
        'export': '用法: export [参数]\n导出数据',
        'validate': '用法: validate [参数]\n验证文件格式',
        'report': '用法: report [参数]\n生成报表',
        'check_structure': '用法: check_structure [参数]\n检查文件结构',
        'init_structure': '用法: init_structure [参数]\n初始化文件结构'
      };
      
      return helpTexts[commandName.toLowerCase()] || `${commandDetails.usage}\n${commandDetails.description}`;
    }
    return null;
  }

  /**
   * 获取所有可用命令
   * @returns 命令名称数组
   */
  static getAllCommands(): string[] {
    const allCommands = CommandCompleter.getAllCommands();
    return allCommands.map(cmd => cmd.command);
  }

  /**
   * 获取命令建议
   * @param partialCommand 部分命令
   * @returns 建议的命令数组
   */
  static getCommandSuggestions(partialCommand: string): string[] {
    const suggestions = CommandCompleter.getSuggestions(partialCommand);
    return suggestions.map((s: any) => s.command);
  }

  /**
   * 智能命令猜测
   * @param input 用户输入
   * @returns 猜测的命令或null
   */
  static guessCommand(input: string): any {
    return CommandCompleter.guessCommand(input);
  }

  /**
   * 实例方法包装静态方法
   */
  parseCommand(input: string): ParsedCommand {
    return CommandParser.parseCommand(input);
  }

  validateCommand(command: string): boolean {
    return CommandParser.validateCommand(command);
  }

  getCommandHelp(commandName: string): string | null {
    return CommandParser.getCommandHelp(commandName);
  }

  getAllCommands(): string[] {
    return CommandParser.getAllCommands();
  }

  getCommandSuggestions(partialCommand: string): string[] {
    return CommandParser.getCommandSuggestions(partialCommand);
  }
} 