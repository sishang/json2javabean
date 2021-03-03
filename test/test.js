// const json2java = require('../src/index');
const json2java = require('../dist/main');

const JSON_OBJ = {
  "isSuccess": true,
  "data": [],
  "nihao": {
    "aaa": 1,
    "bbb": false
  }
}

console.log(json2java(JSON.stringify(JSON_OBJ), 'Model', 'com.test.model.example', false));

console.log(json2java(JSON.stringify(JSON_OBJ), 'Root', 'com.test.root.example', true))


