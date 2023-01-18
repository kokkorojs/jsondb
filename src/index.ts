import { isAbsolute, join, resolve } from 'path';
import { writeFileSync, opendirSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { decache } from '@kokkoro/utils';

export class Database {
  /** 文件夹路径 */
  public path: string;
  /** JSON 文件路径 */
  public filename: string;
  // TODO ／人◕ ‿‿ ◕人＼ 文件备份
  // public backup: string;
  private data: Record<string, any>;

  constructor(path: string) {
    this.path = isAbsolute(path) ? path : resolve(path);
    this.filename = join(this.path, 'index.json');
    this.data = {
      updateTime: new Date(),
    };

    try {
      opendirSync(path);
    } catch (error) {
      mkdirSync(path);
    }

    try {
      this.data = require(this.filename);

      if (!this.data.updateTime) {
        this.data.updateTime = new Date();
        throw new Error();
      }
    } catch (error) {
      writeFileSync(this.filename, JSON.stringify(this.data, null, 2));
    }
  }

  public async get(raw_keys: string, escape: boolean = true): Promise<Record<string, any> | undefined> {
    await this.refreshData();

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

  public async put(raw_keys: string, value: any, escape: boolean = true): Promise<void> {
    await this.refreshData();

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
    await this.writeLocalFile();
  }

  public async has(raw_keys: string, escape: boolean = true): Promise<boolean> {
    await this.refreshData();

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

  public async del(raw_keys: string, escape: boolean = true): Promise<void> {
    await this.refreshData();

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
    await this.writeLocalFile();
  }

  private async writeLocalFile(): Promise<void> {
    this.data.updateTime = new Date();
    return writeFile(this.filename, JSON.stringify(this.data, null, 2));
  }

  /**
   * 刷新数据
   */
  private async refreshData(): Promise<void> {
    await new Promise<void>((resolve) => {
      decache(this.filename);
      this.data = require(this.filename);
      resolve();
    });
  }
}
