/**
 * 命令补全器
 * 提供命令建议和补全功能
 * 
 * @author JanYork
 */

import { t } from './i18n';

export interface CommandSuggestion {
  command: string;
  description: string;
  usage: string;
  category: string;
  aliases?: string[];
}

export class CommandCompleter {
  private static readonly commands: CommandSuggestion[] = [
    // 基础操作
    {
      command: 'add_transaction',
      description: t('command.add_transaction.description'),
      usage: 'add_transaction [参数]',
      category: t('category.basic'),
      aliases: ['add', 'add_tx', 'transaction', 'a', 'new']
    },
    {
      command: 'edit_transaction',
      description: t('command.edit_transaction.description'),
      usage: 'edit_transaction [参数]',
      category: t('category.basic'),
      aliases: ['edit', 'edit_tx', 'modify', 'e', 'change']
    },
    {
      command: 'delete_transaction',
      description: t('command.delete_transaction.description'),
      usage: 'delete_transaction [参数]',
      category: t('category.basic'),
      aliases: ['delete', 'del', 'remove', 'd', 'rm']
    },

    // 查询统计
    {
      command: 'list_transactions',
      description: t('command.list_transactions.description'),
      usage: 'list_transactions [参数]',
      category: t('category.query'),
      aliases: ['list', 'transactions', 'tx', 'ls', 'lt']
    },
    {
      command: 'list_accounts',
      description: t('command.list_accounts.description'),
      usage: 'list_accounts [参数]',
      category: t('category.query'),
      aliases: ['accounts', 'account', 'act', 'ac']
    },
    {
      command: 'show_balance',
      description: t('command.show_balance.description'),
      usage: 'show_balance [参数]',
      category: t('category.query'),
      aliases: ['balance', 'bal', 'b', 'money']
    },
    {
      command: 'show_networth',
      description: t('command.show_networth.description'),
      usage: 'show_networth [参数]',
      category: t('category.query'),
      aliases: ['networth', 'net', 'worth', 'nw', 'wealth']
    },

    // 系统管理
    {
      command: 'config',
      description: t('command.config.description'),
      usage: 'config [参数]',
      category: t('category.system'),
      aliases: ['settings', 'configure', 'c', 'conf']
    },
    {
      command: 'search',
      description: t('command.search.description'),
      usage: 'search [参数]',
      category: t('category.system'),
      aliases: ['find', 'lookup', 's', 'f']
    },
    {
      command: 'export',
      description: t('command.export.description'),
      usage: 'export [参数]',
      category: t('category.system'),
      aliases: ['exp', 'output', 'e', 'out']
    },
    {
      command: 'validate',
      description: t('command.validate.description'),
      usage: 'validate [参数]',
      category: t('category.system'),
      aliases: ['check', 'verify', 'v', 'val']
    },

    // 文件管理
    {
      command: 'check_structure',
      description: t('command.check_structure.description'),
      usage: 'check_structure [参数]',
      category: t('category.file'),
      aliases: ['check', 'structure', 'cs', 'chk']
    },
    {
      command: 'init_structure',
      description: t('command.init_structure.description'),
      usage: 'init_structure [参数]',
      category: t('category.file'),
      aliases: ['init', 'initialize', 'i', 'setup']
    },

    // 报表功能
    {
      command: 'report',
      description: t('command.report.description'),
      usage: 'report [参数]',
      category: t('category.query'),
      aliases: ['reports', 'rpt', 'r', 'rep']
    },

    // 帮助和退出
    {
      command: 'help',
      description: t('command.help.description'),
      usage: 'help [命令]',
      category: t('category.system'),
      aliases: ['h', '?', 'man', 'help']
    },
    {
      command: 'quit',
      description: t('command.quit.description'),
      usage: 'quit',
      category: t('category.system'),
      aliases: ['exit', 'q', 'bye', 'quit']
    }
  ];

  /**
   * 获取命令建议
   * @param partialInput 部分输入
   * @returns 建议列表
   */
  static getSuggestions(partialInput: string): CommandSuggestion[] {
    if (!partialInput || partialInput.trim() === '') {
      return this.commands.slice(0, 5); // 返回前5个常用命令
    }

    const input = partialInput.toLowerCase().trim();
    const suggestions: CommandSuggestion[] = [];

    // 1. 精确匹配命令名
    const exactMatches = this.commands.filter(cmd => 
      cmd.command.toLowerCase().startsWith(input)
    );
    suggestions.push(...exactMatches);

    // 2. 别名匹配
    const aliasMatches = this.commands.filter(cmd => 
      cmd.aliases?.some(alias => alias.toLowerCase().startsWith(input))
    );
    suggestions.push(...aliasMatches.filter(cmd => !suggestions.includes(cmd)));

    // 3. 包含匹配
    const containsMatches = this.commands.filter(cmd => 
      cmd.command.toLowerCase().includes(input) ||
      cmd.description.toLowerCase().includes(input) ||
      cmd.aliases?.some(alias => alias.toLowerCase().includes(input))
    );
    suggestions.push(...containsMatches.filter(cmd => !suggestions.includes(cmd)));

    // 4. 模糊匹配（编辑距离）
    if (suggestions.length < 3) {
      const fuzzyMatches = this.getFuzzyMatches(input);
      suggestions.push(...fuzzyMatches.filter(cmd => !suggestions.includes(cmd)));
    }

    // 5. 智能推荐（基于使用频率和相关性）
    if (suggestions.length < 2) {
      const smartSuggestions = this.getSmartSuggestions(input);
      suggestions.push(...smartSuggestions.filter(cmd => !suggestions.includes(cmd)));
    }

    return suggestions.slice(0, 10); // 最多返回10个建议
  }

  /**
   * 获取模糊匹配
   */
  private static getFuzzyMatches(input: string): CommandSuggestion[] {
    const matches: Array<{cmd: CommandSuggestion; score: number}> = [];

    for (const cmd of this.commands) {
      const score = this.calculateSimilarity(input, cmd.command);
      if (score > 0.3) { // 相似度阈值
        matches.push({ cmd, score });
      }
    }

    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(m => m.cmd);
  }

  /**
   * 计算字符串相似度
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 计算 Levenshtein 距离
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    // 简化版本：使用字符串包含关系
    if (str1.includes(str2) || str2.includes(str1)) {
      return 0;
    }
    
    // 计算字符差异
    let diff = 0;
    const minLen = Math.min(str1.length, str2.length);
    for (let i = 0; i < minLen; i++) {
      if (str1[i] !== str2[i]) {
        diff++;
      }
    }
    diff += Math.abs(str1.length - str2.length);
    
    return diff;
  }

  /**
   * 获取智能建议
   */
  private static getSmartSuggestions(input: string): CommandSuggestion[] {
    const suggestions: CommandSuggestion[] = [];

    // 基于输入关键词的智能推荐
    const keywords = input.split(/\s+/);
    
    for (const keyword of keywords) {
      const addCmd = this.commands.find(cmd => cmd.command === 'add_transaction');
      const listCmd = this.commands.find(cmd => cmd.command === 'list_transactions');
      const balanceCmd = this.commands.find(cmd => cmd.command === 'show_balance');
      const accountCmd = this.commands.find(cmd => cmd.command === 'list_accounts');
      const configCmd = this.commands.find(cmd => cmd.command === 'config');
      const helpCmd = this.commands.find(cmd => cmd.command === 'help');

      if (keyword.includes('add') || keyword.includes('new') || keyword.includes('create')) {
        if (addCmd) suggestions.push(addCmd);
      }
      if (keyword.includes('list') || keyword.includes('show') || keyword.includes('view')) {
        if (listCmd) suggestions.push(listCmd);
      }
      if (keyword.includes('balance') || keyword.includes('money') || keyword.includes('amount')) {
        if (balanceCmd) suggestions.push(balanceCmd);
      }
      if (keyword.includes('account') || keyword.includes('bank')) {
        if (accountCmd) suggestions.push(accountCmd);
      }
      if (keyword.includes('config') || keyword.includes('setting')) {
        if (configCmd) suggestions.push(configCmd);
      }
      if (keyword.includes('help') || keyword.includes('?')) {
        if (helpCmd) suggestions.push(helpCmd);
      }
    }

    return suggestions.slice(0, 3);
  }

  /**
   * 获取命令详情
   */
  static getCommandDetails(commandName: string): CommandSuggestion | undefined {
    return this.commands.find(cmd => 
      cmd.command === commandName || 
      cmd.aliases?.includes(commandName)
    );
  }

  /**
   * 获取所有命令
   */
  static getAllCommands(): CommandSuggestion[] {
    return [...this.commands];
  }

  /**
   * 按类别获取命令
   */
  static getCommandsByCategory(category: string): CommandSuggestion[] {
    return this.commands.filter(cmd => cmd.category === category);
  }

  /**
   * 获取常用命令
   */
  static getCommonCommands(): CommandSuggestion[] {
    const commonCommands = [
      'add_transaction',
      'list_transactions', 
      'show_balance',
      'list_accounts',
      'help'
    ];
    
    return this.commands.filter(cmd => commonCommands.includes(cmd.command));
  }

  /**
   * 智能命令猜测
   */
  static guessCommand(input: string): CommandSuggestion | null {
    const suggestions = this.getSuggestions(input);
    if (suggestions.length > 0) {
      const firstSuggestion = suggestions[0];
      return firstSuggestion || null; // 返回最匹配的命令
    }
    return null;
  }

  /**
   * 获取命令提示
   */
  static getCommandHint(input: string): string {
    const suggestions = this.getSuggestions(input);
    
    if (suggestions.length === 0) {
      return t('command.no.suggestions');
    }
    
    if (suggestions.length === 1) {
      const cmd = suggestions[0];
      if (cmd) {
        return `${t('command.suggestion')}: ${cmd.command} - ${cmd.description}`;
      }
    }
    
    const commandNames = suggestions.slice(0, 3).map(cmd => cmd.command).join(', ');
    return `${t('command.suggestions')}: ${commandNames}`;
  }
}
