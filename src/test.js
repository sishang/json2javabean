const main = require('./util');

const JSON_OBJ = {
  "isSuccess": true,
  "data": [],
  "nihao": {
    "aaa": 1,
    "bbb": false
  }
}

console.log(main(JSON.stringify(JSON_OBJ), 'Model', 'com.test.model.example', false));

console.log(main(JSON.stringify(JSON_OBJ), 'Root', 'com.test.root.example', true))

