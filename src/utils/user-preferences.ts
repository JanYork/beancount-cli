/**
 * 用户偏好设置管理器
 *
 * 作者: JanYork
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface UserPreferences {
  // 显示偏好
  display: {
    show_original_account_names: boolean; // 是否显示原始账户名称
    show_translated_account_names: boolean; // 是否显示翻译后的账户名称
    show_both_names: boolean; // 是否同时显示原始和翻译名称
    date_format: string; // 日期格式
    number_format: string; // 数字格式
  };

  // 交互偏好
  interaction: {
    auto_complete_enabled: boolean; // 是否启用自动补全
    confirm_before_delete: boolean; // 删除前是否确认
    show_suggestions: boolean; // 是否显示建议
  };

  // 功能偏好
  features: {
    auto_save: boolean; // 是否自动保存
    backup_before_changes: boolean; // 修改前是否备份
    validate_on_save: boolean; // 保存时是否验证
  };

  // 自定义设置
  custom: {
    [key: string]: any;
  };
}

export class UserPreferencesManager {
  private static instance: UserPreferencesManager;
  private preferences: UserPreferences;
  private preferencesFilePath: string;

  private constructor() {
    this.preferencesFilePath = path.join(os.homedir(), '.beancount-cli', 'user-preferences.json');
    this.preferences = this.loadDefaultPreferences();
    this.loadPreferences();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): UserPreferencesManager {
    if (!UserPreferencesManager.instance) {
      UserPreferencesManager.instance = new UserPreferencesManager();
    }
    return UserPreferencesManager.instance;
  }

  /**
   * 加载默认偏好设置
   */
  private loadDefaultPreferences(): UserPreferences {
    return {
      display: {
        show_original_account_names: false,
        show_translated_account_names: true,
        show_both_names: false,
        date_format: 'YYYY-MM-DD',
        number_format: 'standard',
      },
      interaction: {
        auto_complete_enabled: true,
        confirm_before_delete: true,
        show_suggestions: true,
      },
      features: {
        auto_save: true,
        backup_before_changes: true,
        validate_on_save: true,
      },
      custom: {},
    };
  }

  /**
   * 加载用户偏好设置
   */
  private loadPreferences(): void {
    try {
      if (fs.existsSync(this.preferencesFilePath)) {
        const data = fs.readFileSync(this.preferencesFilePath, 'utf8');
        const loadedPreferences = JSON.parse(data);

        // 合并默认设置和用户设置
        this.preferences = this.mergePreferences(this.preferences, loadedPreferences);
      }
    } catch (error) {
      console.warn('加载用户偏好设置失败:', error);
    }
  }

  /**
   * 合并偏好设置
   */
  private mergePreferences(defaultPrefs: UserPreferences, userPrefs: any): UserPreferences {
    const merged = { ...defaultPrefs };

    // 合并显示设置
    if (userPrefs.display) {
      merged.display = { ...merged.display, ...userPrefs.display };
    }

    // 合并交互设置
    if (userPrefs.interaction) {
      merged.interaction = { ...merged.interaction, ...userPrefs.interaction };
    }

    // 合并功能设置
    if (userPrefs.features) {
      merged.features = { ...merged.features, ...userPrefs.features };
    }

    // 合并自定义设置
    if (userPrefs.custom) {
      merged.custom = { ...merged.custom, ...userPrefs.custom };
    }

    return merged;
  }

  /**
   * 保存用户偏好设置
   */
  private savePreferences(): void {
    try {
      const configDir = path.dirname(this.preferencesFilePath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(this.preferencesFilePath, JSON.stringify(this.preferences, null, 2), 'utf8');
    } catch (error) {
      console.error('保存用户偏好设置失败:', error);
    }
  }

  /**
   * 获取偏好设置
   */
  public getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  /**
   * 获取特定偏好设置
   */
  public get<T>(key: string, defaultValue?: T): T {
    const keys = key.split('.');
    let value: any = this.preferences;

    for (const k of keys) {
      if (value && typeof value === 'object' && k && k in value) {
        value = value[k];
      } else {
        return defaultValue as T;
      }
    }

    return value;
  }

  /**
   * 设置偏好设置
   */
  public set<T>(key: string, value: T): void {
    const keys = key.split('.');
    let current: any = this.preferences;

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
      current[lastKey] = value;
    }

    this.savePreferences();
  }

  /**
   * 重置偏好设置
   */
  public reset(): void {
    this.preferences = this.loadDefaultPreferences();
    this.savePreferences();
  }

  /**
   * 获取偏好设置文件路径
   */
  public getPreferencesFilePath(): string {
    return this.preferencesFilePath;
  }
}
