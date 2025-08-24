/**
 * 主题管理器
 * 管理CLI界面的主题和颜色方案
 * 
 * @author JanYork
 */

import chalk from 'chalk';

/**
 * 主题类型
 */
export type ThemeType = 'default' | 'dark' | 'light' | 'colorful' | 'minimal';

/**
 * 颜色方案
 */
export interface ColorScheme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  muted: string;
  background: string;
  text: string;
  border: string;
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  name: string;
  type: ThemeType;
  colors: ColorScheme;
  emoji: boolean;
  borders: boolean;
  animations: boolean;
}

/**
 * 主题管理器类
 * 管理CLI界面的主题和样式
 */
export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeConfig;
  private readonly themes: Map<ThemeType, ThemeConfig> = new Map();

  private constructor() {
    this.initializeThemes();
    this.currentTheme = this.themes.get('default')!;
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * 设置主题
   */
  setTheme(themeType: ThemeType): void {
    const theme = this.themes.get(themeType);
    if (theme) {
      this.currentTheme = theme;
    }
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeConfig {
    return { ...this.currentTheme };
  }

  /**
   * 获取可用主题列表
   */
  getAvailableThemes(): ThemeType[] {
    return Array.from(this.themes.keys());
  }

  /**
   * 获取主题颜色
   */
  getColor(colorKey: keyof ColorScheme): string {
    return this.currentTheme.colors[colorKey];
  }

  /**
   * 应用主题样式到文本
   */
  applyStyle(text: string, style: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'muted'): string {
    const color = this.currentTheme.colors[style];
    return chalk.hex(color)(text);
  }

  /**
   * 创建带边框的文本
   */
  createBorderedText(text: string, style: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'muted' = 'primary'): string {
    if (!this.currentTheme.borders) {
      return text;
    }

    const color = this.currentTheme.colors[style];
    const borderChar = '─';
    const border = borderChar.repeat(text.length + 4);
    
    return chalk.hex(color)(`┌${border}┐\n│  ${text}  │\n└${border}┘`);
  }

  /**
   * 创建状态指示器
   */
  createStatusIndicator(status: 'success' | 'warning' | 'error' | 'info'): string {
    const indicators = {
      success: this.currentTheme.emoji ? '✅' : '✓',
      warning: this.currentTheme.emoji ? '⚠️' : '!',
      error: this.currentTheme.emoji ? '❌' : '✗',
      info: this.currentTheme.emoji ? 'ℹ️' : 'i',
    };

    const indicator = indicators[status];
    const color = this.currentTheme.colors[status];
    
    return chalk.hex(color)(indicator);
  }

  /**
   * 创建进度条
   */
  createProgressBar(current: number, total: number, width: number = 30): string {
    const percentage = Math.round((current / total) * 100);
    const filledWidth = Math.round((width * current) / total);
    const emptyWidth = width - filledWidth;

    const filledChar = '█';
    const emptyChar = '░';
    
    const filledBar = chalk.hex(this.currentTheme.colors.success)(filledChar.repeat(filledWidth));
    const emptyBar = chalk.hex(this.currentTheme.colors.muted)(emptyChar.repeat(emptyWidth));
    
    return `${filledBar}${emptyBar} ${percentage}%`;
  }

  /**
   * 创建表格样式
   */
  getTableStyle(): any {
    return {
      border: {
        topBody: '─',
        topJoin: '┬',
        topLeft: '┌',
        topRight: '┐',
        bottomBody: '─',
        bottomJoin: '┴',
        bottomLeft: '└',
        bottomRight: '┘',
        bodyLeft: '│',
        bodyRight: '│',
        bodyJoin: '│',
        joinBody: '─',
        joinLeft: '├',
        joinRight: '┤',
        joinJoin: '┼',
      },
      columnDefault: {
        alignment: 'left',
      },
    };
  }

  /**
   * 初始化主题
   */
  private initializeThemes(): void {
    // 默认主题
    this.themes.set('default', {
      name: '默认主题',
      type: 'default',
      colors: {
        primary: '#4ECDC4',
        secondary: '#45B7D1',
        success: '#2ECC71',
        warning: '#F39C12',
        error: '#E74C3C',
        info: '#3498DB',
        muted: '#95A5A6',
        background: '#000000',
        text: '#FFFFFF',
        border: '#4ECDC4',
      },
      emoji: true,
      borders: true,
      animations: true,
    });

    // 深色主题
    this.themes.set('dark', {
      name: '深色主题',
      type: 'dark',
      colors: {
        primary: '#00BCD4',
        secondary: '#607D8B',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3',
        muted: '#757575',
        background: '#121212',
        text: '#FFFFFF',
        border: '#424242',
      },
      emoji: true,
      borders: true,
      animations: false,
    });

    // 浅色主题
    this.themes.set('light', {
      name: '浅色主题',
      type: 'light',
      colors: {
        primary: '#1976D2',
        secondary: '#546E7A',
        success: '#388E3C',
        warning: '#F57C00',
        error: '#D32F2F',
        info: '#1976D2',
        muted: '#757575',
        background: '#FFFFFF',
        text: '#212121',
        border: '#E0E0E0',
      },
      emoji: false,
      borders: true,
      animations: false,
    });

    // 彩色主题
    this.themes.set('colorful', {
      name: '彩色主题',
      type: 'colorful',
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        success: '#45B7D1',
        warning: '#96CEB4',
        error: '#FFEAA7',
        info: '#DDA0DD',
        muted: '#F8BBD9',
        background: '#000000',
        text: '#FFFFFF',
        border: '#FF6B6B',
      },
      emoji: true,
      borders: true,
      animations: true,
    });

    // 简约主题
    this.themes.set('minimal', {
      name: '简约主题',
      type: 'minimal',
      colors: {
        primary: '#000000',
        secondary: '#333333',
        success: '#000000',
        warning: '#000000',
        error: '#000000',
        info: '#000000',
        muted: '#666666',
        background: '#FFFFFF',
        text: '#000000',
        border: '#CCCCCC',
      },
      emoji: false,
      borders: false,
      animations: false,
    });
  }

  /**
   * 创建自定义主题
   */
  createCustomTheme(
    name: string,
    colors: Partial<ColorScheme>,
    options: Partial<Omit<ThemeConfig, 'name' | 'type' | 'colors'>>
  ): void {
    const defaultColors = this.themes.get('default')!.colors;
    const customTheme: ThemeConfig = {
      name,
      type: 'default',
      colors: { ...defaultColors, ...colors },
      emoji: options.emoji ?? true,
      borders: options.borders ?? true,
      animations: options.animations ?? true,
    };

    // 使用时间戳作为键来避免冲突
    const customKey = `custom_${Date.now()}` as ThemeType;
    this.themes.set(customKey, customTheme);
  }

  /**
   * 导出主题配置
   */
  exportTheme(themeType: ThemeType): ThemeConfig | null {
    const theme = this.themes.get(themeType);
    return theme ? { ...theme } : null;
  }

  /**
   * 导入主题配置
   */
  importTheme(theme: ThemeConfig): void {
    const customKey = `imported_${Date.now()}` as ThemeType;
    this.themes.set(customKey, theme);
  }

  /**
   * 获取主题预览
   */
  getThemePreview(themeType: ThemeType): string {
    const theme = this.themes.get(themeType);
    if (!theme) {
      return '主题不存在';
    }

    const preview = [
      `${theme.name}`,
      `主色: ${theme.colors.primary}`,
      `次色: ${theme.colors.secondary}`,
      `成功: ${theme.colors.success}`,
      `警告: ${theme.colors.warning}`,
      `错误: ${theme.colors.error}`,
      `信息: ${theme.colors.info}`,
      `静音: ${theme.colors.muted}`,
      `Emoji: ${theme.emoji ? '启用' : '禁用'}`,
      `边框: ${theme.borders ? '启用' : '禁用'}`,
      `动画: ${theme.animations ? '启用' : '禁用'}`,
    ].join('\n');

    return preview;
  }
} 