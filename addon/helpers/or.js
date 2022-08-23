import { helper } from '@ember/component/helper';
import { isArray } from '@ember/array';
import { get } from '@ember/object';

function truthConvert(result) {
  const truthy = result && get(result, 'isTruthy');
  if (typeof truthy === 'boolean') {
    return truthy;
  }

  if (isArray(result)) {
    return get(result, 'length') !== 0;
  } else {
    return !!result;
  }
}

export function or(params) {
  for (let i = 0, len = params.length; i < len; i++) {
    if (truthConvert(params[i]) === true) {
      return params[i];
    }
  }
  return params[params.length - 1];
}

export default helper(or);
