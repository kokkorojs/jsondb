import { watch } from 'chokidar';
import { isAbsolute, resolve } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import { writeFile, readFile } from 'fs/promises';

export class Database {
  public data: {
    [k: string]: any;
  };

  constructor(
    /** 文件路径 */
    private path: string,
    /** 监听文件并热更 */
    private watch: boolean = false,
  ) {
    this.path = isAbsolute(path) ? path : resolve(path);
    this.data = {};

    try {
      const data = readFileSync(this.path, 'utf8');
      this.data = JSON.parse(data);
    } catch (error) {
      writeFileSync(this.path, '{}');
    }
    this.watch && this.watchLocalFile();
  }

  public get(raw_keys: string, escape: boolean = true) {
    let data = this.data;

    const keys = escape ? raw_keys.split('.') : [raw_keys];
    const keys_length = keys.length;

    for (let i = 0; i < keys_length; i++) {
      const key = keys[i];

      if (!data[key]) {
        return;
      }
      data = data[key];
    }
    return data;
  }

  public set(raw_keys: string, value: any, escape: boolean = true): this {
    let data = this.data;

    const keys = escape ? raw_keys.split('.') : [raw_keys];
    const keys_length = keys.length;

    for (let i = 0; i < keys_length; i++) {
      const key = keys[i];

      if (i === keys_length - 1) {
        data[key] = value;
        break;
      }
      data[key] ??= {};

      if (data[key].constructor !== Object) {
        data[key] = {};
      }
      data = data[key];
    }
    return this;
  }

  public has(raw_keys: string, escape: boolean = true): boolean {
    let data = this.data;

    const keys = escape ? raw_keys.split('.') : [raw_keys];
    const keys_length = keys.length;

    for (let i = 0; i < keys_length; i++) {
      const key = keys[i];

      if (!data[key]) {
        return false;
      }
      data = data[key];
    }
    return true;
  }

  public delete(raw_keys: string, escape: boolean = true): this {
    let data = this.data;

    const keys = escape ? raw_keys.split('.') : [raw_keys];
    const keys_length = keys.length;

    for (let i = 0; i < keys_length; i++) {
      const key = keys[i];

      if (i === keys_length - 1) {
        delete data[key];
        break;
      }
      if (!data[key]) {
        break;
      }
      data = data[key];
    }
    return this;
  }

  public async write(): Promise<void> {
    const localData = JSON.stringify(await this.getLocalData(), null, 2);
    const currentData = JSON.stringify(this.data, null, 2);

    if (localData === currentData) {
      return;
    }
    return writeFile(this.path, currentData);
  }

  /**
   * 读取本地文件
   * 
   * @returns 本地数据字符串
   */
  private getLocalData(): Promise<string> {
    return readFile(this.path, 'utf8');
  }

  /**
   * 监听文件热更
   * 
   * @returns 
   */
  private watchLocalFile() {
    return watch(this.path).on('change', async () => {
      try {
        const data = await this.getLocalData();
        this.data = JSON.parse(data);
      } catch (error) { }
    });
  }
}
