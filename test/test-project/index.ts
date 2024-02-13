import { deep } from './deep';
import { deep2 } from './deep2';
import { helper } from './helper';
import { User } from './type';
import { KeyPair } from './interface';

console.log('main');
console.log(deep);
console.log(deep2);

const user: User = { name: 'name' };
console.log(user);
console.log(helper);

const keyPair: KeyPair = { key: 1, value: 'value' };
