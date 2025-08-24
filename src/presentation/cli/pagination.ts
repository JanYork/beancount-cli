/**
 * 分页组件
 * 支持数据分页显示和快捷键换页
 * 
 * @author JanYork
 */

import * as readline from 'readline';

export interface PaginationOptions {
  pageSize?: number;
  showPageInfo?: boolean;
  showNavigation?: boolean;
  enableKeyboard?: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class Pagination {
  private rl: readline.Interface;
  private options: PaginationOptions;

  constructor(options: PaginationOptions = {}) {
    this.options = {
      pageSize: 10,
      showPageInfo: true,
      showNavigation: true,
      enableKeyboard: true,
      ...options
    };

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });
  }

  /**
   * 分页显示数据
   */
  async paginate<T>(
    data: T[],
    renderFunction: (items: T[], pageInfo: PaginationInfo) => void,
    options: PaginationOptions = {}
  ): Promise<void> {
    const mergedOptions = { ...this.options, ...options };
    const pageSize = mergedOptions.pageSize || 10;
    const totalPages = Math.ceil(data.length / pageSize);
    let currentPage = 1;

    while (currentPage <= totalPages) {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, data.length);
      const pageData = data.slice(startIndex, endIndex);

      const pageInfo: PaginationInfo = {
        currentPage,
        totalPages,
        totalRecords: data.length,
        pageSize,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      };

      // 清屏
      console.clear();

      // 渲染数据
      renderFunction(pageData, pageInfo);

      // 显示分页信息
      if (mergedOptions.showPageInfo) {
        this.showPageInfo(pageInfo);
      }

      // 显示导航
      if (mergedOptions.showNavigation) {
        this.showNavigation(pageInfo);
      }

      // 如果只有一页，直接返回
      if (totalPages <= 1) {
        break;
      }

      // 等待用户输入
      if (mergedOptions.enableKeyboard) {
        const action = await this.waitForUserInput(pageInfo);
        
        switch (action) {
          case 'next':
            currentPage++;
            break;
          case 'prev':
            currentPage--;
            break;
          case 'first':
            currentPage = 1;
            break;
          case 'last':
            currentPage = totalPages;
            break;
          case 'quit':
            return;
          case 'jump':
            const targetPage = await this.getTargetPage(totalPages);
            if (targetPage >= 1 && targetPage <= totalPages) {
              currentPage = targetPage;
            }
            break;
        }
      } else {
        // 自动翻页
        await this.delay(2000);
        currentPage++;
      }
    }
  }

  /**
   * 显示分页信息
   */
  private showPageInfo(pageInfo: PaginationInfo): void {
    console.log('\n' + '─'.repeat(60));
    console.log(`📄 第 ${pageInfo.currentPage} 页，共 ${pageInfo.totalPages} 页`);
    console.log(`📊 总计 ${pageInfo.totalRecords} 条记录，每页 ${pageInfo.pageSize} 条`);
    console.log('─'.repeat(60));
  }

  /**
   * 显示导航信息
   */
  private showNavigation(pageInfo: PaginationInfo): void {
    const navigation = [];

    if (pageInfo.hasPrev) {
      navigation.push('← 上一页 (p)');
    }
    if (pageInfo.hasNext) {
      navigation.push('下一页 (n) →');
    }

    if (pageInfo.currentPage > 1) {
      navigation.push('首页 (f)');
    }
    if (pageInfo.currentPage < pageInfo.totalPages) {
      navigation.push('末页 (l)');
    }

    navigation.push('跳转 (j)', '退出 (q)');

    console.log(`\n🔧 导航: ${navigation.join(' | ')}`);
  }

  /**
   * 等待用户输入
   */
  private async waitForUserInput(pageInfo: PaginationInfo): Promise<string> {
    return new Promise((resolve) => {
      const message = '\n💡 请选择操作: ';
      
      this.rl.question(message, (input) => {
        const action = input.trim().toLowerCase();
        
        switch (action) {
          case 'n':
          case 'next':
          case '':
            if (pageInfo.hasNext) {
              resolve('next');
            } else {
              console.log('⚠️ 已经是最后一页');
              resolve('next');
            }
            break;
          case 'p':
          case 'prev':
          case 'previous':
            if (pageInfo.hasPrev) {
              resolve('prev');
            } else {
              console.log('⚠️ 已经是第一页');
              resolve('prev');
            }
            break;
          case 'f':
          case 'first':
            resolve('first');
            break;
          case 'l':
          case 'last':
            resolve('last');
            break;
          case 'j':
          case 'jump':
            resolve('jump');
            break;
          case 'q':
          case 'quit':
          case 'exit':
            resolve('quit');
            break;
          default:
            console.log('❌ 无效输入，请重试');
            resolve('next');
        }
      });
    });
  }

  /**
   * 获取目标页码
   */
  private async getTargetPage(totalPages: number): Promise<number> {
    return new Promise((resolve) => {
      this.rl.question(`\n📄 请输入页码 (1-${totalPages}): `, (input) => {
        const page = parseInt(input.trim());
        if (isNaN(page) || page < 1 || page > totalPages) {
          console.log(`❌ 请输入 1-${totalPages} 之间的数字`);
          resolve(1);
        } else {
          resolve(page);
        }
      });
    });
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 关闭readline接口
   */
  close(): void {
    this.rl.close();
  }

  /**
   * 静态方法：简单分页显示
   */
  static async simplePaginate<T>(
    data: T[],
    renderFunction: (items: T[]) => void,
    pageSize: number = 10
  ): Promise<void> {
    const pagination = new Pagination({ pageSize });
    await pagination.paginate(data, (items) => renderFunction(items));
    pagination.close();
  }

  /**
   * 静态方法：表格分页显示
   */
  static async tablePaginate<T>(
    data: T[],
    headers: string[],
    rowRenderer: (item: T) => string[],
    pageSize: number = 10
  ): Promise<void> {
    const pagination = new Pagination({ pageSize });
    
    await pagination.paginate(data, (items, pageInfo) => {
      // 渲染表格
      console.log('\n' + '='.repeat(80));
      console.log(`📊 数据表格 (第 ${pageInfo.currentPage} 页)`);
      console.log('='.repeat(80));
      
      if (items.length === 0) {
        console.log('📭 暂无数据');
        return;
      }

      // 显示表头
      console.log('│ ' + headers.join(' │ ') + ' │');
      console.log('├─' + '─┼─'.repeat(headers.length - 1) + '─┤');

      // 显示数据行
      items.forEach((item, index) => {
        const row = rowRenderer(item);
        console.log('│ ' + row.join(' │ ') + ' │');
        
        // 添加分隔线（除了最后一行）
        if (index < items.length - 1) {
          console.log('├─' + '─┼─'.repeat(headers.length - 1) + '─┤');
        }
      });

      console.log('└─' + '─┴─'.repeat(headers.length - 1) + '─┘');
    });
    
    pagination.close();
  }
} 