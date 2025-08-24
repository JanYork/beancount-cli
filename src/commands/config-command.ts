/**
 * 配置管理命令
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { ConfigManager } from '../utils/config-manager';
import { Language } from '../utils/i18n';
import { InteractiveCommandHandler } from '../presentation/cli/interactive-command-handler';

export class ConfigCommand extends BaseCommand {
  constructor(engine: BeancountEngine) {
    super(engine);
  }

  /**
   * 执行配置管理命令
   *
   * @param params 命令参数
   * @returns 执行结果
   */
  async execute(params: Record<string, any>): Promise<import('../types').CommandResult> {
    try {
      // 检查是否需要交互式输入
      if (params['interactive'] === true || Object.keys(params).length === 0) {
        return await this.executeInteractive();
      }

      const action = params['action'] as string;
      const key = params['key'] as string;
      const value = params['value'] as string;

      if (!action) {
        return this.createErrorResult('缺少必要参数: action');
      }

      switch (action) {
        case 'get':
          return this.handleGetConfig(key);
        case 'set':
          return this.handleSetConfig(key, value);
        case 'list':
          return this.handleListConfig();
        case 'reset':
          return this.handleResetConfig();
        case 'language':
          return this.handleLanguageConfig(value);
        case 'theme':
          return this.handleThemeConfig(value);
        case 'currency':
          return this.handleCurrencyConfig(value);
        case 'filepath':
          return this.handleFilePathConfig(value);
        default:
          return this.createErrorResult(`未知的配置操作: ${action}`);
      }
    } catch (error) {
      return this.createErrorResult(`配置管理失败: ${error}`);
    }
  }

  /**
   * 执行交互式配置管理
   */
  private async executeInteractive(): Promise<import('../types').CommandResult> {
    try {
      // 使用交互式处理器收集参数
      const interactiveParams = await InteractiveCommandHandler.handleConfig();
      
      // 构建参数
      const params: Record<string, any> = {};
      
      if (interactiveParams.language) {
        params['action'] = 'language';
        params['value'] = interactiveParams.language;
      }
      
      if (interactiveParams.theme) {
        params['action'] = 'theme';
        params['value'] = interactiveParams.theme;
      }
      
      if (interactiveParams.currency) {
        params['action'] = 'currency';
        params['value'] = interactiveParams.currency;
      }
      
      if (interactiveParams.filePath) {
        params['action'] = 'filepath';
        params['value'] = interactiveParams.filePath;
      }
      
      // 递归调用 execute 方法，传入收集到的参数
      return await this.execute(params);
    } catch (error) {
      return this.createErrorResult(`交互式配置管理失败: ${error}`);
    }
  }

  /**
   * 获取配置值
   */
  private handleGetConfig(key: string): import('../types').CommandResult {
    if (!key) {
      return this.createErrorResult('缺少必要参数: key');
    }

    const configManager = ConfigManager.getInstance();
    const value = configManager.get(key);

    if (value === undefined) {
      return this.createErrorResult(`配置项不存在: ${key}`);
    }

    return this.createSuccessResult(`配置项 ${key} = ${value}`, { key, value });
  }

  /**
   * 设置配置值
   */
  private handleSetConfig(key: string, value: string): import('../types').CommandResult {
    if (!key || value === undefined) {
      return this.createErrorResult('缺少必要参数: key 或 value');
    }

    const configManager = ConfigManager.getInstance();
    configManager.set(key, value);

    return this.createSuccessResult(`配置项 ${key} 已设置为 ${value}`, { key, value });
  }

  /**
   * 列出所有配置
   */
  private handleListConfig(): import('../types').CommandResult {
    const configManager = ConfigManager.getInstance();
    const config = configManager.getConfig();

    let result = '📋 当前配置:\n\n';
    result += `📁 数据设置:\n`;
    result += `  默认文件: ${config.data.default_file}\n`;
    result += `  数据目录: ${config.data.data_dir}\n`;
    result += `  备份目录: ${config.data.backup_dir}\n\n`;
    
    result += `💰 货币设置:\n`;
    result += `  默认货币: ${config.currency.default}\n`;
    result += `  支持货币: ${config.currency.supported.join(', ')}\n\n`;
    
    result += `🌐 界面设置:\n`;
    result += `  语言: ${config.ui.language}\n`;
    result += `  主题: ${config.ui.theme}\n`;
    result += `  显示表情: ${config.ui.show_emoji ? '是' : '否'}\n`;
    result += `  显示颜色: ${config.ui.show_colors ? '是' : '否'}\n\n`;
    
    result += `🔧 功能设置:\n`;
    result += `  自动备份: ${config.features.auto_backup ? '是' : '否'}\n`;
    result += `  启用验证: ${config.features.enable_validation ? '是' : '否'}\n`;
    result += `  启用模板: ${config.features.enable_templates ? '是' : '否'}\n`;

    return this.createSuccessResult(result, config);
  }

  /**
   * 重置配置
   */
  private handleResetConfig(): import('../types').CommandResult {
    const configManager = ConfigManager.getInstance();
    // 重新加载默认配置
    configManager.reloadConfig();

    return this.createSuccessResult('✅ 配置已重置为默认值');
  }

  /**
   * 设置语言
   */
  private handleLanguageConfig(language: string): import('../types').CommandResult {
    if (!language) {
      return this.createErrorResult('缺少必要参数: language');
    }

    const validLanguages: Language[] = ['zh-CN', 'en-US'];
    if (!validLanguages.includes(language as Language)) {
      return this.createErrorResult(`不支持的语言: ${language}`);
    }

    const configManager = ConfigManager.getInstance();
    configManager.set('language', language);

    return this.createSuccessResult(`语言已设置为: ${language}`);
  }

  /**
   * 设置主题
   */
  private handleThemeConfig(theme: string): import('../types').CommandResult {
    if (!theme) {
      return this.createErrorResult('缺少必要参数: theme');
    }

    const validThemes = ['light', 'dark', 'colorful'];
    if (!validThemes.includes(theme)) {
      return this.createErrorResult(`不支持的主题: ${theme}`);
    }

    const configManager = ConfigManager.getInstance();
    configManager.set('theme', theme);

    return this.createSuccessResult(`主题已设置为: ${theme}`);
  }

  /**
   * 设置货币
   */
  private handleCurrencyConfig(currency: string): import('../types').CommandResult {
    if (!currency) {
      return this.createErrorResult('缺少必要参数: currency');
    }

    const validCurrencies = ['CNY', 'USD', 'EUR', 'JPY'];
    if (!validCurrencies.includes(currency)) {
      return this.createErrorResult(`不支持的货币: ${currency}`);
    }

    const configManager = ConfigManager.getInstance();
    configManager.set('currency', currency);

    return this.createSuccessResult(`默认货币已设置为: ${currency}`);
  }

  /**
   * 设置文件路径
   */
  private handleFilePathConfig(filePath: string): import('../types').CommandResult {
    if (!filePath) {
      return this.createErrorResult('缺少必要参数: filePath');
    }

    const configManager = ConfigManager.getInstance();
    configManager.set('data.default_file', filePath);

    return this.createSuccessResult(`默认文件路径已设置为: ${filePath}`);
  }



  /**
   * 获取命令帮助信息
   *
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
⚙️ 配置管理
用法: config [参数] 或 config interactive=true

参数:
- action: 操作类型 (get|set|list|reset|language|theme|currency|filepath)
- key: 配置项名称 (用于 get/set 操作)
- value: 配置项值 (用于 set 操作)
- interactive: 是否使用交互式输入 (true/false)

操作说明:
- get <key>: 获取配置项值
- set <key> <value>: 设置配置项值
- list: 列出所有配置
- reset: 重置为默认配置
- language <value>: 设置语言 (zh-CN|en-US)
- theme <value>: 设置主题 (light|dark|colorful)
- currency <value>: 设置货币 (CNY|USD|EUR|JPY)
- filepath <value>: 设置默认文件路径

示例:
config action=list
config action=set key=language value=zh-CN
config action=language value=zh-CN
config action=theme value=dark
config action=currency value=CNY
config interactive=true
    `;
  }
}
