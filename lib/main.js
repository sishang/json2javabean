(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["json2java"] = factory();
	else
		root["json2java"] = factory();
})(typeof self !== 'undefined' ? self : typeof windows !== 'undefined' ? window : typeof global !== 'undefined' ? global : this, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/util.js":
/*!*********************!*\
  !*** ./src/util.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function trimStr(str) {
  return str.replace(/(^\s*)|(\s*$)/g, '');
}

function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}

function firstToUpperCase(str) {
  return str.substr(0, 1).toUpperCase() + str.substr(1);
}

function camelCase(input) {
  return input.toLowerCase().replace(/_(.)/g, function (match, group1) {
    return group1.toUpperCase();
  });
}

function camelCaseWithFirstCharUpper(input) {
  if (!input) {
    return '';
  }

  input = camelCase(input);
  return input[0].toUpperCase() + input.substr(1);
}

function trimSpecial(input) {
  if (!input) {
    return input;
  }

  return trimStr(input.replace(/\|\s*[0-9]*/g, ''));
}

function isDate(date) {
  return new Date(date) !== 'Invalid Date' && !isNaN(new Date(date)) && isNaN(+date);
}

function isInt(n) {
  return n % 1 === 0;
}

var IMPORT_MAP = {
  'Date': 'java.util.Date',
  'List': 'java.util.List'
}; // 支持set和get这种老式的模板

var SET_GET_TPL = "\n    public void setA(T a) {\n        this.a = a;\n    }\n    public T getA() {\n        return a;\n    }\n    ";
var DEFAULT_CLASS_NAME = 'Example';
var DEFAULT_PACKAGE_NAME = 'com.example.tool';

function getBeanFieldFromJson(text, className) {
  if (!text || _typeof(text) === 'object') {
    throw '请输入正确的json格式';
  }

  var jsonObject = null;
  text = trimStr(text);
  text = trimSpecial(text); // 1.先将文本转换成json实体, 把首尾空格去掉，那么如果第一和最后一个字符为[]，说明是json数组，而非对象

  if (text[0] === '[' && text[text.length - 1] === ']') {
    text = '{ "list": ' + text + '}';

    try {
      jsonObject = JSON.parse(text).list[0];
    } catch (e) {
      console.log('[getBeanFieldFromJson]parse json error:', e);
    }
  } else {
    try {
      jsonObject = JSON.parse(text);
    } catch (e) {
      console.log('[getBeanFieldFromJson]parse json error:', e);
    }
  } // 2.将json对象转换成bean类


  var bean = {};
  var attrClassAry = [];

  for (var key in jsonObject) {
    var val = jsonObject[key];
    bean[key] = getTypeFromJsonVal(val, key, attrClassAry);
  }

  if (!className) {
    className = 'A';
  } else {
    className = camelCaseWithFirstCharUpper(className);
    className = trimSpecial(className);
  }

  bean = {
    name: className,
    val: bean
  };
  return [bean].concat(attrClassAry);
}

function toBeanText(bean, packageName, isLomBook) {
  if (!bean) {
    return;
  }

  var beanFields = bean.val;
  var className = bean.name;
  var importText = '';
  var fieldText = '';
  var setterText = '';
  var typeSet = {};
  var tpl = SET_GET_TPL; // 依次遍历每个属性

  for (var key in beanFields) {
    // 如果存在下划线小写格式的属性名，要改成驼峰命名
    var camelKey = camelCase(key); // 生成属性定义

    fieldText += "   private ".concat(beanFields[key], " ").concat(camelKey, ";\n    "); // 记录属性类型,beanFields[key]可能有一些值，是List<Date>之类，要替换成Date

    var type = beanFields[key];

    if (type.indexOf('List<') > -1) {
      type = beanFields[key].replace('List<', '');
      type = type.replace('>', '');
      typeSet['List'] = 'true';
    }

    typeSet[type] = 'true';

    if (!isLomBook) {
      (function () {
        // 生成setter，getter语句
        var tplMap = {
          a: camelKey,
          A: firstToUpperCase(camelKey),
          T: beanFields[key]
        };
        setterText += tpl.replace(/a|A|T/g, function (matched) {
          return tplMap[matched];
        });
      })();
    }
  } // 生成import语句


  for (var t in typeSet) {
    if (IMPORT_MAP[t]) {
      importText += 'import ' + IMPORT_MAP[t] + ';\n';
    }
  }

  if (packageName) {
    importText = 'package ' + packageName + ';\n' + importText;
  } // 把import, 属性定义，setter，getter拼到一起


  var fileContent = '';

  if (isLomBook) {
    fileContent = "".concat(importText, "\nimport lombok.AllArgsConstructor;\nimport lombok.Data;\nimport lombok.NoArgsConstructor;\n\n@Data\n@AllArgsConstructor\n@NoArgsConstructor\npublic class ").concat(className, " {\n\n").concat(fieldText, "\n\n}");
  } else {
    fileContent = "".concat(importText, "\n\npublic class ").concat(className, " {\n\n").concat(fieldText, "\n\n").concat(setterText, "\n\n}");
  }

  return {
    fileContent: fileContent,
    className: className
  };
}

function getTypeFromJsonVal(val, key, attrClassAry) {
  if (val && val.replace) {
    val = val.replace(/ /g, '');
  }

  var typeofStr = _typeof(val);

  if (typeofStr === 'number') {
    if (isInt(val)) {
      return 'int';
    } else {
      return 'double';
    }
  } else if (typeofStr === 'boolean') {
    return typeofStr;
  } else if (isDate(val)) {
    return 'Date';
  } else if (!val) {
    return 'String';
  } else if (typeofStr === 'string') {
    return 'String';
  } else {
    if (isArray(val)) {
      var type = getTypeFromJsonVal(val[0], key, attrClassAry);
      return 'List<' + type + '>';
    } else {
      // 自定义类
      var typeName = camelCaseWithFirstCharUpper(key);
      typeName = trimSpecial(typeName);
      var bean = {};

      for (key in val) {
        var fieldValue = val[key];
        bean[key] = getTypeFromJsonVal(fieldValue, key, attrClassAry);
      }

      attrClassAry.push({
        name: typeName,
        val: bean
      });
      return typeName;
    }
  }
}
/**
 * 执行函数
 * @param text json格式的文本
 * @param className 类名
 * @param packageName 包名称
 * @param isLomBook 是否使用注解形式生成java bean
 * @return {*}
 */


function json2java(text, className, packageName, isLomBook) {
  if (!text) {
    return;
  }

  if (!className) {
    className = DEFAULT_CLASS_NAME;
  }

  if (!packageName) {
    packageName = DEFAULT_PACKAGE_NAME;
  }

  try {
    var beans = getBeanFieldFromJson(text, className);
    return (beans || []).map(function (bean) {
      return toBeanText(bean, packageName, isLomBook);
    });
  } catch (e) {
    console.log('错误解析：', e);
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (json2java);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ "./src/util.js");

var json2java = _util__WEBPACK_IMPORTED_MODULE_0__.default;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (json2java);
})();

__webpack_exports__ = __webpack_exports__.default;
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=main.js.map