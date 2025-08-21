/**
 * 国际化工具
 *
 * 作者: JanYork
 */

export type Language = 'zh-CN' | 'en-US';

export interface I18nMessages {
  [key: string]: string | Record<string, string>;
}

export class I18nManager {
  private static instance: I18nManager;
  private currentLanguage: Language = 'zh-CN';
  private messages: Record<Language, I18nMessages> = {
    'zh-CN': {
      // CLI 通用
      'cli.banner.title': '🤖  Beancount CLI',
      'cli.banner.subtitle': '    智能记账命令行工具',
      'cli.prompt.message': '💡 输入命令 (输入 /help 查看帮助):',
      'cli.success': '✅ 执行成功:',
      'cli.error': '❌ 执行失败:',
      'cli.error.general': '❌ 错误:',
      'cli.quit': '👋 再见！',
      'cli.reload.success': '🔄 文件重新加载成功',
      'cli.invalid.command': '无效的命令:',
      'cli.help.suggestion': '💡 输入 /help 查看所有可用命令',
      'cli.command.parse.error': '命令解析失败:',
      'cli.unexpected.error': '发生未预期的错误:',
      'cli.interrupt.detected': '⚠️  检测到中断信号，输入 /quit 退出程序',

      // 文件状态
      'status.title': '📊 文件状态:',
      'status.accounts': '   账户数量:',
      'status.transactions': '   交易记录:',
      'status.balances': '   余额记录:',
      'status.errors': '   错误数量:',
      'status.filepath': '   文件路径:',
      'status.unavailable': '⚠️  无法获取状态信息',

      // 命令补全
      'completion.suggestions': '💡 建议:',
      'completion.auto.complete': '💡 自动补全为:',
      'completion.select.command': '选择要执行的命令:',
      'completion.multiple.found': '💡 找到多个匹配的命令:',

      // 余额显示
      'balance.title': '💰 账户余额信息:',
      'balance.currency': '💵 {currency} 货币:',
      'balance.total': '💰 总计:',
      'balance.no.data': '💰 没有找到余额信息',
      'balance.display.error': '显示余额失败:',
      'balance.date.format.error': '日期格式错误',

      // 命令帮助
      'help.commands': {
        help: '显示帮助信息',
        add_transaction: '添加交易记录',
        list_transactions: '列出交易记录',
        show_balance: '显示账户余额',
        show_networth: '显示净资产',
        list_accounts: '列出所有账户',
        validate: '验证账目文件',
        config: '配置管理',
        quit: '退出程序',
        reload: '重新加载文件',
      },

      // 命令用法
      'usage.commands': {
        help: '/help [命令名]',
        add_transaction: '/add_transaction account="Assets:Cash" amount=100 description="购物"',
        list_transactions: '/list_transactions [account="Assets:Cash"] [limit=10]',
        show_balance: '/show_balance [account="Assets:Cash"] [date=2024-01-01]',
        show_networth: '/show_networth [date=2024-01-01]',
        list_accounts: '/list_accounts [type="Assets"]',
        validate: '/validate',
        config: '/config [action="show"]',
        quit: '/quit',
        reload: '/reload',
      },

      // 启动相关
      'startup.using.default.path': '📁 使用配置文件中的默认路径:',
      'startup.file.not.exists': '⚠️  文件不存在:',
      'startup.goodbye': '👋 再见！',
      'startup.failed': '❌ 启动失败:',
    },
    'en-US': {
      // CLI General
      'cli.banner.title': '🤖  Beancount CLI',
      'cli.banner.subtitle': '    Smart Accounting Command Line Tool',
      'cli.prompt.message': '💡 Enter command (type /help for help):',
      'cli.success': '✅ Success:',
      'cli.error': '❌ Failed:',
      'cli.error.general': '❌ Error:',
      'cli.quit': '👋 Goodbye!',
      'cli.reload.success': '🔄 File reloaded successfully',
      'cli.invalid.command': 'Invalid command:',
      'cli.help.suggestion': '💡 Type /help to see all available commands',
      'cli.command.parse.error': 'Command parsing failed:',
      'cli.unexpected.error': 'Unexpected error occurred:',
      'cli.interrupt.detected': '⚠️  Interrupt detected, type /quit to exit',

      // File Status
      'status.title': '📊 File Status:',
      'status.accounts': '   Accounts:',
      'status.transactions': '   Transactions:',
      'status.balances': '   Balances:',
      'status.errors': '   Errors:',
      'status.filepath': '   File Path:',
      'status.unavailable': '⚠️  Unable to get status information',

      // Command Completion
      'completion.suggestions': '💡 Suggestions:',
      'completion.auto.complete': '💡 Auto-completed to:',
      'completion.select.command': 'Select command to execute:',
      'completion.multiple.found': '💡 Found multiple matching commands:',

      // Balance Display
      'balance.title': '💰 Account Balance Information:',
      'balance.currency': '💵 {currency} Currency:',
      'balance.total': '💰 Total:',
      'balance.no.data': '💰 No balance information found',
      'balance.display.error': 'Failed to display balance:',
      'balance.date.format.error': 'Date format error',

      // Command Help
      'help.commands': {
        help: 'Show help information',
        add_transaction: 'Add transaction record',
        list_transactions: 'List transaction records',
        show_balance: 'Show account balance',
        show_networth: 'Show net worth',
        list_accounts: 'List all accounts',
        validate: 'Validate account file',
        config: 'Configuration management',
        quit: 'Exit program',
        reload: 'Reload file',
      },

      // Command Usage
      'usage.commands': {
        help: '/help [command_name]',
        add_transaction: '/add_transaction account="Assets:Cash" amount=100 description="Shopping"',
        list_transactions: '/list_transactions [account="Assets:Cash"] [limit=10]',
        show_balance: '/show_balance [account="Assets:Cash"] [date=2024-01-01]',
        show_networth: '/show_networth [date=2024-01-01]',
        list_accounts: '/list_accounts [type="Assets"]',
        validate: '/validate',
        config: '/config [action="show"]',
        quit: '/quit',
        reload: '/reload',
      },

      // Startup
      'startup.using.default.path': '📁 Using default path from config:',
      'startup.file.not.exists': '⚠️  File does not exist:',
      'startup.goodbye': '👋 Goodbye!',
      'startup.failed': '❌ Startup failed:',
    },
  };

  private constructor() {}

  static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  /**
   * 设置当前语言
   */
  setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  /**
   * 获取当前语言
   */
  getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * 获取翻译文本
   */
  t(key: string, params?: Record<string, string>): string {
    const message = this.messages[this.currentLanguage][key];
    if (!message || typeof message !== 'string') {
      // 如果当前语言没有找到，尝试英文
      const fallbackMessage = this.messages['en-US'][key];
      if (!fallbackMessage || typeof fallbackMessage !== 'string') {
        return key; // 如果都没有找到，返回键名
      }
      return this.interpolate(fallbackMessage, params);
    }
    return this.interpolate(message, params);
  }

  /**
   * 获取嵌套的翻译文本
   */
  tn(category: string, key: string): string {
    const categoryData = this.messages[this.currentLanguage][category];
    if (typeof categoryData === 'object' && categoryData[key]) {
      return categoryData[key];
    }

    // 回退到英文
    const fallbackCategoryData = this.messages['en-US'][category];
    if (typeof fallbackCategoryData === 'object' && fallbackCategoryData[key]) {
      return fallbackCategoryData[key];
    }

    return `${category}.${key}`;
  }

  /**
   * 插值替换
   */
  private interpolate(message: string, params?: Record<string, string>): string {
    if (!params) {
      return message;
    }

    return message.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] || match;
    });
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): Language[] {
    return Object.keys(this.messages) as Language[];
  }

  /**
   * 检查语言是否支持
   */
  isLanguageSupported(language: string): language is Language {
    return this.getSupportedLanguages().includes(language as Language);
  }
}

// 导出便捷函数
export const t = (key: string, params?: Record<string, string>): string => {
  return I18nManager.getInstance().t(key, params);
};

export const tn = (category: string, key: string): string => {
  return I18nManager.getInstance().tn(category, key);
};

export const setLanguage = (language: Language): void => {
  I18nManager.getInstance().setLanguage(language);
};

export const getLanguage = (): Language => {
  return I18nManager.getInstance().getLanguage();
};
