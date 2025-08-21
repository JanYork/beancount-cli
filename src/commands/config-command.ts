/**
 * 配置命令
 *
 * 作者: JanYork
 */

import { BaseCommand } from './base-command';
import { ConfigManager } from '../utils/config-manager';
import { Language } from '../utils/i18n';
import { AccountTranslator } from '../utils/account-translator';
import { UserPreferencesManager } from '../utils/user-preferences';
import inquirer from 'inquirer';

export class ConfigCommand extends BaseCommand {
  private configManager: ConfigManager;

  constructor() {
    super();
    this.configManager = ConfigManager.getInstance();
  }

  /**
   * 执行配置命令
   *
   * @param params 命令参数
   * @returns 执行结果
   */
  async execute(params: Record<string, any>): Promise<import('../types').CommandResult> {
    try {
      const action = (params['action'] as string) || 'show';

      switch (action) {
        case 'show':
          return this.showConfig();
        case 'language':
          return await this.setLanguage(params);
        case 'account_translation':
          return await this.manageAccountTranslation(params);
        case 'preferences':
          return await this.managePreferences(params);
        case 'edit':
          return this.editConfig();
        default:
          return this.createErrorResult(`未知的配置操作: ${action}`);
      }
    } catch (error) {
      return this.createErrorResult(`配置操作失败: ${error}`);
    }
  }

  /**
   * 显示配置
   */
  private showConfig(): import('../types').CommandResult {
    const config = this.configManager.getConfig();

    let result = '⚙️  当前配置:\n\n';

    // 显示语言设置
    result += `🌐 语言: ${config.ui.language}\n`;
    result += `📁 默认文件: ${config.data.default_file}\n`;
    result += `💰 默认货币: ${config.currency.default}\n`;
    result += `🎨 主题: ${config.ui.theme}\n`;
    result += `📊 输出格式: ${config.ui.output_format}\n`;
    result += `🔧 自动备份: ${config.features.auto_backup ? '启用' : '禁用'}\n`;
    result += `✅ 验证: ${config.features.enable_validation ? '启用' : '禁用'}\n`;

    return this.createSuccessResult(result, config);
  }

  /**
   * 设置语言
   */
  private async setLanguage(params: Record<string, any>): Promise<import('../types').CommandResult> {
    const language = params['language'] as Language;

    if (language) {
      // 直接设置语言
      if (language === 'zh-CN' || language === 'en-US') {
        this.configManager.setLanguage(language);
        return this.createSuccessResult(`✅ 语言已设置为: ${language}`);
      } else {
        return this.createErrorResult(`不支持的语言: ${language}`);
      }
    } else {
      // 交互式选择语言
      try {
        const { selectedLanguage } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedLanguage',
            message: '选择语言 / Select Language:',
            choices: [
              { name: '中文 (Chinese)', value: 'zh-CN' },
              { name: 'English', value: 'en-US' },
            ],
          },
        ]);

        this.configManager.setLanguage(selectedLanguage);
        return this.createSuccessResult(`✅ 语言已设置为: ${selectedLanguage}`);
      } catch (error) {
        return this.createErrorResult(`语言设置失败: ${error}`);
      }
    }
  }

  /**
   * 管理账户翻译
   */
  private async manageAccountTranslation(params: Record<string, any>): Promise<import('../types').CommandResult> {
    const subAction = params['sub_action'] as string;

    switch (subAction) {
      case 'add':
        return await this.addAccountTranslation(params);
      case 'remove':
        return await this.removeAccountTranslation(params);
      case 'list':
        return this.listAccountTranslations();
      default:
        return await this.showAccountTranslationMenu();
    }
  }

  /**
   * 显示账户翻译管理菜单
   */
  private async showAccountTranslationMenu(): Promise<import('../types').CommandResult> {
    try {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: '选择账户翻译管理操作:',
          choices: [
            { name: '添加账户翻译', value: 'add' },
            { name: '移除账户翻译', value: 'remove' },
            { name: '查看所有翻译', value: 'list' },
          ],
        },
      ]);

      switch (action) {
        case 'add':
          return await this.addAccountTranslation({});
        case 'remove':
          return await this.removeAccountTranslation({});
        case 'list':
          return this.listAccountTranslations();
        default:
          return this.createErrorResult('未知操作');
      }
    } catch (error) {
      return this.createErrorResult(`账户翻译管理失败: ${error}`);
    }
  }

  /**
   * 添加账户翻译
   */
  private async addAccountTranslation(params: Record<string, any>): Promise<import('../types').CommandResult> {
    try {
      const account = params['account'] as string;
      const language = params['language'] as Language;
      const translation = params['translation'] as string;

      if (account && language && translation) {
        // 直接添加
        AccountTranslator.addUserTranslation(account, language, translation);
        return this.createSuccessResult(`✅ 已添加账户翻译: ${account} -> ${translation} (${language})`);
      }

      // 交互式添加
      const { inputAccount, inputLanguage, inputTranslation } = await inquirer.prompt([
        {
          type: 'input',
          name: 'inputAccount',
          message: '请输入账户名称 (如: Assets:Bank:MyBank):',
          validate: (input: string) => (input.trim() ? true : '账户名称不能为空'),
        },
        {
          type: 'list',
          name: 'inputLanguage',
          message: '选择目标语言:',
          choices: [
            { name: '中文', value: 'zh-CN' },
            { name: 'English', value: 'en-US' },
          ],
        },
        {
          type: 'input',
          name: 'inputTranslation',
          message: '请输入翻译:',
          validate: (input: string) => (input.trim() ? true : '翻译不能为空'),
        },
      ]);

      AccountTranslator.addUserTranslation(inputAccount, inputLanguage, inputTranslation);
      return this.createSuccessResult(`✅ 已添加账户翻译: ${inputAccount} -> ${inputTranslation} (${inputLanguage})`);
    } catch (error) {
      return this.createErrorResult(`添加账户翻译失败: ${error}`);
    }
  }

  /**
   * 移除账户翻译
   */
  private async removeAccountTranslation(params: Record<string, any>): Promise<import('../types').CommandResult> {
    try {
      const account = params['account'] as string;
      const language = params['language'] as Language;

      if (account) {
        // 直接移除
        if (language) {
          AccountTranslator.removeUserTranslation(account, language);
          return this.createSuccessResult(`✅ 已移除账户翻译: ${account} (${language})`);
        } else {
          AccountTranslator.removeUserTranslation(account);
          return this.createSuccessResult(`✅ 已移除账户的所有翻译: ${account}`);
        }
      }

      // 交互式移除
      const translations = AccountTranslator.getAllUserTranslations();
      if (translations.length === 0) {
        return this.createSuccessResult('📝 当前没有用户自定义的账户翻译');
      }

      const { selectedTranslation } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedTranslation',
          message: '选择要移除的翻译:',
          choices: translations.map(t => ({
            name: `${t.account} -> ${Object.entries(t.translations)
              .map(([lang, trans]) => `${trans}(${lang})`)
              .join(', ')}`,
            value: t,
          })),
        },
      ]);

      AccountTranslator.removeUserTranslation(selectedTranslation.account);
      return this.createSuccessResult(`✅ 已移除账户翻译: ${selectedTranslation.account}`);
    } catch (error) {
      return this.createErrorResult(`移除账户翻译失败: ${error}`);
    }
  }

  /**
   * 列出所有账户翻译
   */
  private listAccountTranslations(): import('../types').CommandResult {
    const translations = AccountTranslator.getAllUserTranslations();

    if (translations.length === 0) {
      return this.createSuccessResult('📝 当前没有用户自定义的账户翻译');
    }

    let result = '📝 用户自定义账户翻译:\n\n';
    for (const translation of translations) {
      result += `账户: ${translation.account}\n`;
      for (const [language, trans] of Object.entries(translation.translations)) {
        result += `  ${language}: ${trans}\n`;
      }
      result += '\n';
    }

    return this.createSuccessResult(result, translations);
  }

  /**
   * 管理偏好设置
   */
  private async managePreferences(params: Record<string, any>): Promise<import('../types').CommandResult> {
    const subAction = params['sub_action'] as string;

    switch (subAction) {
      case 'show':
        return this.showPreferences();
      case 'set':
        return await this.setPreference(params);
      case 'reset':
        return this.resetPreferences();
      default:
        return await this.showPreferencesMenu();
    }
  }

  /**
   * 显示偏好设置菜单
   */
  private async showPreferencesMenu(): Promise<import('../types').CommandResult> {
    try {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: '选择偏好设置管理操作:',
          choices: [
            { name: '查看当前偏好设置', value: 'show' },
            { name: '修改偏好设置', value: 'set' },
            { name: '重置为默认设置', value: 'reset' },
          ],
        },
      ]);

      switch (action) {
        case 'show':
          return this.showPreferences();
        case 'set':
          return await this.setPreference({});
        case 'reset':
          return this.resetPreferences();
        default:
          return this.createErrorResult('未知操作');
      }
    } catch (error) {
      return this.createErrorResult(`偏好设置管理失败: ${error}`);
    }
  }

  /**
   * 显示偏好设置
   */
  private showPreferences(): import('../types').CommandResult {
    const preferences = UserPreferencesManager.getInstance();
    const prefs = preferences.getPreferences();

    let result = '⚙️  当前偏好设置:\n\n';

    // 显示设置
    result += '📺 显示设置:\n';
    result += `  显示原始账户名称: ${prefs.display.show_original_account_names ? '是' : '否'}\n`;
    result += `  显示翻译账户名称: ${prefs.display.show_translated_account_names ? '是' : '否'}\n`;
    result += `  同时显示原始和翻译: ${prefs.display.show_both_names ? '是' : '否'}\n`;
    result += `  日期格式: ${prefs.display.date_format}\n`;
    result += `  数字格式: ${prefs.display.number_format}\n\n`;

    // 交互设置
    result += '🖱️  交互设置:\n';
    result += `  启用自动补全: ${prefs.interaction.auto_complete_enabled ? '是' : '否'}\n`;
    result += `  删除前确认: ${prefs.interaction.confirm_before_delete ? '是' : '否'}\n`;
    result += `  显示建议: ${prefs.interaction.show_suggestions ? '是' : '否'}\n\n`;

    // 功能设置
    result += '🔧 功能设置:\n';
    result += `  自动保存: ${prefs.features.auto_save ? '是' : '否'}\n`;
    result += `  修改前备份: ${prefs.features.backup_before_changes ? '是' : '否'}\n`;
    result += `  保存时验证: ${prefs.features.validate_on_save ? '是' : '否'}\n\n`;

    return this.createSuccessResult(result, prefs);
  }

  /**
   * 设置偏好设置
   */
  private async setPreference(params: Record<string, any>): Promise<import('../types').CommandResult> {
    try {
      const key = params['key'] as string;
      const value = params['value'];

      if (key && value !== undefined) {
        // 直接设置
        const preferences = UserPreferencesManager.getInstance();
        preferences.set(key, value);
        return this.createSuccessResult(`✅ 已设置偏好: ${key} = ${value}`);
      }

      // 交互式设置
      const { settingKey, settingValue } = await inquirer.prompt([
        {
          type: 'list',
          name: 'settingKey',
          message: '选择具体设置:',
          when: answers => answers.settingType === 'display',
          choices: [
            { name: '显示原始账户名称', value: 'display.show_original_account_names' },
            { name: '显示翻译账户名称', value: 'display.show_translated_account_names' },
            { name: '同时显示原始和翻译', value: 'display.show_both_names' },
            { name: '日期格式', value: 'display.date_format' },
            { name: '数字格式', value: 'display.number_format' },
          ],
        },
        {
          type: 'list',
          name: 'settingKey',
          message: '选择具体设置:',
          when: answers => answers.settingType === 'interaction',
          choices: [
            { name: '启用自动补全', value: 'interaction.auto_complete_enabled' },
            { name: '删除前确认', value: 'interaction.confirm_before_delete' },
            { name: '显示建议', value: 'interaction.show_suggestions' },
          ],
        },
        {
          type: 'list',
          name: 'settingKey',
          message: '选择具体设置:',
          when: answers => answers.settingType === 'features',
          choices: [
            { name: '自动保存', value: 'features.auto_save' },
            { name: '修改前备份', value: 'features.backup_before_changes' },
            { name: '保存时验证', value: 'features.validate_on_save' },
          ],
        },
        {
          type: 'input',
          name: 'settingValue',
          message: '请输入设置值 (布尔值输入 true/false，字符串直接输入):',
          validate: (input: string) => {
            if (input.trim() === '') return '设置值不能为空';
            return true;
          },
        },
      ]);

      // 解析值
      let parsedValue: any = settingValue;
      if (settingValue === 'true') parsedValue = true;
      else if (settingValue === 'false') parsedValue = false;

      const preferences = UserPreferencesManager.getInstance();
      preferences.set(settingKey, parsedValue);

      return this.createSuccessResult(`✅ 已设置偏好: ${settingKey} = ${parsedValue}`);
    } catch (error) {
      return this.createErrorResult(`设置偏好失败: ${error}`);
    }
  }

  /**
   * 重置偏好设置
   */
  private resetPreferences(): import('../types').CommandResult {
    const preferences = UserPreferencesManager.getInstance();
    preferences.reset();
    return this.createSuccessResult('✅ 偏好设置已重置为默认值');
  }

  /**
   * 编辑配置
   */
  private editConfig(): import('../types').CommandResult {
    // 这里可以实现交互式配置编辑
    // 暂时返回提示信息
    return this.createSuccessResult(
      '📝 配置编辑功能开发中...\n\n' +
        '当前可用的配置操作:\n' +
        '- /config show - 显示当前配置\n' +
        '- /config language - 设置语言\n' +
        '- /config language="zh-CN" - 直接设置语言为中文\n' +
        '- /config language="en-US" - 直接设置语言为英文'
    );
  }

  /**
   * 获取命令帮助信息
   *
   * @returns 帮助信息
   */
  getHelp(): string {
    return `
⚙️  配置管理
用法: /config [action] [参数]

操作:
- show: 显示当前配置
- language: 设置语言 (交互式)
- language="zh-CN": 设置语言为中文
- language="en-US": 设置语言为英文
- account_translation: 管理账户翻译 (交互式)
- account_translation sub_action="add" account="Assets:Bank:MyBank" language="zh-CN" translation="我的银行": 添加账户翻译
- account_translation sub_action="remove" account="Assets:Bank:MyBank": 移除账户翻译
- account_translation sub_action="list": 查看所有账户翻译
- preferences: 管理偏好设置 (交互式)
- preferences sub_action="show": 查看当前偏好设置
- preferences sub_action="set" key="display.show_both_names" value="true": 设置偏好
- preferences sub_action="reset": 重置为默认偏好设置
- edit: 编辑配置 (开发中)

示例:
/config
/config show
/config language
/config language="en-US"
/config account_translation
/config account_translation sub_action="add" account="Assets:Bank:MyBank" language="zh-CN" translation="我的银行"
/config preferences
/config preferences sub_action="set" key="display.show_both_names" value="true"
    `;
  }
}
