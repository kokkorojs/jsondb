import { deepClone } from 'kokkoro';
import { readFileSync, writeFileSync } from 'fs';
import { writeFile } from 'fs/promises';

export class Database {
  public data: object;
  private raw_data: string;
  private base_data: object;

  constructor(
    private path: string,
  ) {
    this.data = {};
    this.raw_data = '{\n\n}';

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
    this.base_data = deepClone(this.data);
  }

  save() {
    try {
      writeFile(this.path, this.raw_data);
      this.base_data = deepClone(this.data);
    } catch (error) {

    }
    return
  }
}
