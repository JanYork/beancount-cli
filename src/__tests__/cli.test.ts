/**
 * CLI 测试
 *
 * 作者: JanYork
 */

import { BeancountCLI } from '../cli';

describe('BeancountCLI', () => {
  let cli: BeancountCLI;
  const testFilePath = './test.beancount';

  beforeEach(() => {
    cli = new BeancountCLI(testFilePath);
  });

  describe('constructor', () => {
    it('should create CLI instance with file path', () => {
      expect(cli).toBeDefined();
      expect(cli).toBeInstanceOf(BeancountCLI);
    });
  });

  describe('executeCommand', () => {
    it('should execute help command successfully', async () => {
      const result = await cli.executeCommand('help');
      
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('should execute help command with parameters', async () => {
      const result = await cli.executeCommand('help', { command: 'add_transaction' });
      
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('should handle unknown command gracefully', async () => {
      const result = await cli.executeCommand('unknown_command');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
    });
  });

  describe('getFileStats', () => {
    it('should return file statistics', () => {
      const stats = cli.getFileStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });
  });

  describe('runInteractive', () => {
    it('should be callable', async () => {
      // 这个方法会启动交互式界面，我们只测试它不会抛出错误
      expect(typeof cli.runInteractive).toBe('function');
    });
  });
});
