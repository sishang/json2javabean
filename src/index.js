function trimStr (str) {
  return str.replace(/(^\s*)|(\s*$)/g, '')
}

function isArray (o) {
  return Object.prototype.toString.call(o) === '[object Array]'
}

function firstToUpperCase (str) {
  return str.substr(0, 1).toUpperCase() + str.substr(1)
}

function camelCase (input) {
  return input.toLowerCase().replace(/_(.)/g, function (match, group1) {
    return group1.toUpperCase()
  })
}

function camelCaseWithFirstCharUpper (input) {
  if (!input) {
    return ''
  }

  input = camelCase(input)
  return input[0].toUpperCase() + input.substr(1)
}

function trimSpecial (input) {
  if (!input) {
    return input
  }
  return trimStr(input.replace(/\|\s*[0-9]*/g, ''))
}

function isDate (date) {
  return ((new Date(date) !== 'Invalid Date' && !isNaN(new Date(date))) && isNaN((+date)))
}

function isInt (n) {
  return n % 1 === 0
}

const IMPORT_MAP = {
  'Date': 'java.util.Date',
  'List': 'java.util.List'
}
// 支持set和get这种老式的模板
const SET_GET_TPL = `
    public void setA(T a) {
        this.a = a;
    }
    public T getA() {
        return a;
    }
    `
const DEFAULT_CLASS_NAME = 'Example'
const DEFAULT_PACKAGE_NAME = 'com.example.tool'

function getBeanFieldFromJson (text, className) {
  if (!text || typeof text === 'object') {
    throw '请输入正确的json格式';
  }
  let jsonObject = null
  text = trimStr(text)
  text = trimSpecial(text)
  // 1.先将文本转换成json实体, 把首尾空格去掉，那么如果第一和最后一个字符为[]，说明是json数组，而非对象
  if (text[0] === '[' && text[text.length - 1] === ']') {
    text = '{ "list": ' + text + '}'
    try {
      jsonObject = JSON.parse(text).list[0]
    } catch (e) {
      console.log('[getBeanFieldFromJson]parse json error:', e)
    }
  } else {
    try {
      jsonObject = JSON.parse(text)
    } catch (e) {
      console.log('[getBeanFieldFromJson]parse json error:', e)
    }
  }
  // 2.将json对象转换成bean类
  let bean = {}
  let attrClassAry = []
  for (let key in jsonObject) {
    let val = jsonObject[key]
    bean[key] = getTypeFromJsonVal(val, key, attrClassAry)
  }
  if (!className) {
    className = 'A'
  } else {
    className = camelCaseWithFirstCharUpper(className)
    className = trimSpecial(className)
  }
  bean = { name: className, val: bean }
  return [...[bean], ...attrClassAry]
}

function toBeanText (bean, packageName, isLomBook) {
  if (!bean) {
    return
  }
  let beanFields = bean.val
  let className = bean.name
  let importText = ''
  let fieldText = ''
  let setterText = ''
  let typeSet = {}
  let tpl = SET_GET_TPL

  // 依次遍历每个属性
  for (let key in beanFields) {
    // 如果存在下划线小写格式的属性名，要改成驼峰命名
    let camelKey = camelCase(key)
    // 生成属性定义
    fieldText += `   private ${beanFields[key]} ${camelKey};
    `
    // 记录属性类型,beanFields[key]可能有一些值，是List<Date>之类，要替换成Date
    let type = beanFields[key]
    if (type.indexOf('List<') > -1) {
      type = beanFields[key].replace('List<', '')
      type = type.replace('>', '')
      typeSet['List'] = 'true'
    }
    typeSet[type] = 'true'

    if (!isLomBook) { // 生成setter，getter语句
      let tplMap = {
        a: camelKey,
        A: firstToUpperCase(camelKey),
        T: beanFields[key]
      }
      setterText += tpl.replace(/a|A|T/g, function (matched) {
        return tplMap[matched]
      })
    }
  }
  // 生成import语句
  for (let t in typeSet) {
    if (IMPORT_MAP[t]) {
      importText += 'import ' + IMPORT_MAP[t] + ';\n'
    }
  }
  if (packageName) {
    importText = 'package ' + packageName + ';\n' + importText
  }

  // 把import, 属性定义，setter，getter拼到一起
  let fileContent = ''
  if (isLomBook) {
    fileContent = `${importText}
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ${className} {

${fieldText}

}`;
  } else {
    fileContent = `${importText}

public class ${className} {

${fieldText}

${setterText}

}`;
  }
  return {
    fileContent,
    className
  }
}

function getTypeFromJsonVal (val, key, attrClassAry) {
  if (val && val.replace) {
    val = val.replace(/ /g, '')
  }
  let typeofStr = typeof (val)
  if (typeofStr === 'number') {
    if (isInt(val)) {
      return 'int'
    } else {
      return 'double'
    }
  } else if (typeofStr === 'boolean') {
    return typeofStr
  } else if (isDate(val)) {
    return 'Date'
  } else if (!val) {
    return 'String'
  } else if (typeofStr === 'string') {
    return 'String'
  } else {
    if (isArray(val)) {
      let type = getTypeFromJsonVal(val[0], key, attrClassAry)
      return 'List<' + type + '>'
    } else {
      // 自定义类
      let typeName = camelCaseWithFirstCharUpper(key)
      typeName = trimSpecial(typeName)
      let bean = {}
      for (key in val) {
        let fieldValue = val[key]
        bean[key] = getTypeFromJsonVal(fieldValue, key, attrClassAry)
      }
      attrClassAry.push({ name: typeName, val: bean })
      return typeName
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
function main (text, className, packageName, isLomBook) {
  if (!text) {
    return
  }
  if (!className) {
    className = DEFAULT_CLASS_NAME
  }
  if (!packageName) {
    packageName = DEFAULT_PACKAGE_NAME
  }
  try {
    let beans = getBeanFieldFromJson(text, className)
    return (beans || []).map((bean) => {
      return toBeanText(bean, packageName, isLomBook)
    })
  } catch (e) {
    console.log('错误解析：', e)
  }

}

module.exports = main
