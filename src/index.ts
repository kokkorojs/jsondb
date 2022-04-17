import { readFileSync, writeFileSync } from 'fs';
import { writeFile } from 'fs/promises';

export class Database {
  public data: object;
  private raw_data: string;

  constructor(
    private path: string,
  ) {
    this.data = {};
    this.raw_data = '{}';

    try {
      const raw_data = readFileSync(this.path, 'utf8');

      this.raw_data = raw_data || this.raw_data;
      this.data = JSON.parse(this.raw_data);
    } catch (error) {
      const { message } = error as Error;

      if (!message.includes('ENOENT: no such file or directory')) {
        throw error;
      }
      writeFileSync(this.path, this.raw_data);
    }
  }

  get(raw_keys: string, escape: boolean = true) {
    const keys = escape ? raw_keys.split('.') : [raw_keys];
    const keys_length = keys.length;

    let key: string = '';
    for (let i = 0; i < keys_length; i++) {
      key += `["${keys[i]}"]`;
      const value = eval(`this.data${key}`);

      if (!value) {
        return;
      }
    }
    return eval(`this.data${key}`);
  }

  set(raw_keys: string, value: any, escape: boolean = true) {
    const keys = escape ? raw_keys.split('.') : [raw_keys];
    const keys_length = keys.length;

    let key: string = '';
    for (let i = 0; i < keys_length; i++) {
      key += `["${keys[i]}"]`;
      eval(`this.data${key} ||= {}`);
    }
    eval(`this.data${key} = value`);
  }

  has(raw_keys: string, escape: boolean = true) {
    const keys = escape ? raw_keys.split('.') : [raw_keys];
    const keys_length = keys.length;

    let key: string = '';
    for (let i = 0; i < keys_length; i++) {
      key += `["${keys[i]}"]`;
      const value = eval(`this.data${key}`);

      if (!value) {
        return false;
      }
    }
    return true;
  }

  delete(raw_keys: string, escape: boolean = true) {
    const keys = escape ? raw_keys.split('.') : [raw_keys];
    const keys_length = keys.length;

    let key: string = '';
    for (let i = 0; i < keys_length; i++) {
      key += `["${keys[i]}"]`;
    }
    eval(`delete this.data${key}`);
  }

  async write(): Promise<void> {
    try {
      const raw_data = JSON.stringify(this.data, null, 2);

      if (raw_data !== this.raw_data) {
        await writeFile(this.path, raw_data);
        this.raw_data = raw_data;
      }
    } catch (error) {
      const data = JSON.parse(this.raw_data);

      this.data = data;
      throw error;
    }
  }
}
