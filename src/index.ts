import { isAbsolute, join, resolve } from 'path';
import { decache, deepClone } from '@kokkoro/utils';
import { writeFileSync, opendirSync, mkdirSync } from 'fs';

function saveFile(filename: string, data: Record<string | symbol, any>) {
  return writeFileSync(filename, JSON.stringify(data, null, 2));
}

export class Database {
  constructor(path: string) {
    path = isAbsolute(path) ? path : resolve(path);

    const filename = join(path, 'index.json');
    const refreshData = (target: Record<string | symbol, any>) => {
      const target_keys = Object.keys(target);
      const target_keys_length = target_keys.length;

      for (let i = 0; i < target_keys_length; i++) {
        const key = target_keys[i];
        delete target[key];
      }
      decache(filename);

      const data = require(filename);
      const data_keys = Object.keys(data);
      const data_keys_length = data_keys.length;

      for (let i = 0; i < data_keys_length; i++) {
        const key = data_keys[i];
        target[key] = data[key];
      }
    };
    const handler: ProxyHandler<{}> = {
      get(target: Record<string | symbol, any>, property, receiver: Database) {
        refreshData(target);
        return target[property];
      },
      set(target: Record<string | symbol, any>, property, value, receiver: Database) {
        try {
          refreshData(target);

          if (deepClone(target[property]) === deepClone(value)) {
            throw undefined;
          }
          const data = deepClone(target);
          data[property] = value;

          saveFile(filename, data);
          target[property] = value;
        } catch (error) { }
        return true;
      },
      deleteProperty(target: Record<string | symbol, any>, property) {
        try {
          refreshData(target);

          if (target[property] === undefined) {
            throw undefined;
          }
          const data = deepClone(target);
          delete data[property];

          saveFile(filename, data);
          delete target[property];
        } catch (error) { }
        return true;
      },
    };
    try {
      opendirSync(path);
    } catch (error) {
      mkdirSync(path);
    }
    let data;

    try {
      data = require(filename);
    } catch (error) {
      data = {};
      writeFileSync(filename, '{\n\n}');
    }
    return new Proxy(data, handler);
  }
}
