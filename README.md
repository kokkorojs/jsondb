# jsondb

Local JSON database (◕ω＜)☆

```javascript
const { Database } = require('@kokkoro/jsondb');

const db = new Database('kokkoro'); // created "kokkoro/index.json"

console.log(db); // JSON file => {}
db.message = 'hello world'; // JSON file => { "message": "hello world" }

setInterval(() => {
  // modify local JSON file to support hot update
  console.log(db.message);
}, 2000);
```
