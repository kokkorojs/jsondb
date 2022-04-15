import { deepClone } from 'kokkoro';
import { readFileSync, writeFileSync } from 'fs';
import { writeFile } from 'fs/promises';

export class Database {
  private data: object;
  private raw_data: string;

  constructor(
    private path: string,
  ) {
    this.data = {};
    this.raw_data = '{}';

    try {
      const raw_data = readFileSync(this.path, 'utf8');

      this.raw_data = raw_data;
      this.data = JSON.parse(raw_data);
    } catch (error) {
      const { message } = error as Error;

      if (!message.includes('ENOENT: no such file or directory')) {
        throw error;
      }
      writeFileSync(this.path, this.raw_data);
    }
  }

  get() {

  }

  set(raw_keys: string, value: any) {
    const keys = raw_keys.split('.');
    const keys_length = keys.length;

    if (keys_length > 1) {

    }

    // for (let i = 0; i !== keys_length - 1; i++) {
    //   const key = keys[i];

    //   this.data[key]
    // }
  }

  has() {

  }

  delete() {

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
