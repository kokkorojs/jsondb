# jsondb

Local JSON database (◕ω＜)☆

```typescript
const db = new Database('example');

(async () => {
  await db.put('message', 'hello world');
  console.log(await db.has('message')); // true

  const message = await db.get('message');
  console.log(message); // "hello world"

  await db.put('message.value', 'hello world'); // { "message": { "value": "hello world" } }
  await db.put('message.value', 'hello world', false); // { "message.value": "hello world" } }
})();
```
