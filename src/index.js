export const keys = Object.keys

export const values = obj => keys(obj).map(key => obj[key])

export const compose = (...func) => input => {
  return (func.length <= 5)
    ? (func
      .reverse()
      .reduce((obj, fx) => fx(obj), input))
    : undefined
}

export const uniq = list => {
  return values(createObj(list))
}

export const curryOf3 = func => (...args) => {
  const len = args.length
  return (1 <= len && len <= 3)
    ? args.reduce((fx, arg) => fx(arg), func)
    : _ => undefined
}

export const path = curryOf3(
  path => obj => {
    return path
      .reduce(
        (acc, item) => {
          return acc !== null && acc !== undefined && typeof(acc) === 'object'
            ? acc[item]
            : undefined
        }, obj)
  })

const isGenericType = type => obj => {
  return obj !== null && obj !== undefined && typeof(obj) === 'object' && path(['constructor'], obj) === type
}

export const isArray = isGenericType(Array)

export const isObject = isGenericType(Object)

export const eq1True = list => isArray(list) && list.length === 1 && list[0] === true

export const map = curryOf3(
  func => list => {
    return isArray(list)
      ? list.map(func)
      : (isObject(list)
        ? keys(list).map(
          key => func(list[key], key))
        : undefined
      )
  })

export const reduce = (func, obj) => list => {
    return isArray(list)
      ? list.reduce(func, obj)
      : (isObject(list)
        ? keys(list)
          .reduce(
            (obj, key) => func(obj, list[key], key),
            obj)
        : undefined
      )
  }

export const hasKeys = curryOf3(
  expKey => obj => {
    const keysList = keys(obj)
    return reduce(
      (ret, key) => ret && keysList.indexOf(key) >= 0,
      true
      )(expKey)
  })

export const createObj = arrKeys => arrKeys
  .reduce(
    (obj, val) => {
      obj[val] = val
      return obj
    }, {})

export const invertObj = input => {
  return reduce(
    (obj, val, key) => {
      obj[val] = key
      return obj
    }, {})(input)
}

export const translate = curryOf3(
  dictionary => original => {
    return reduce(
      (obj, ori, des) => {
        obj[des] = path([ori], original)
        return obj
      }, {})(dictionary)
  })

export const uniqWith = (comparator, list) => {
  const outputList = []
  map(
    itemA => {
      const equals = map(
          itemB => comparator(itemA, itemB)
        )(outputList)
        .filter(item => item)

      equals && equals.length === 0 && outputList.push(itemA)
    })(list)
  return outputList
}

const uniqComparator = (A, B) => compose(
  eq1True,
  uniq,
  map(
    key => path([key], A) === path([key], B)),
  keys
)(A)

export const returnUniqObjectMergds = (experimentPool, apiExperiments) => {
  return uniqWith(
    uniqComparator,
    []
    .concat(experimentPool)
    .concat(apiExperiments))
}
