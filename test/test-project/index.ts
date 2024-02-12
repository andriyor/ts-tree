import { deep } from './deep';
import { deep2 } from './deep2';
import { helper } from './helper';
import { User } from './type';

console.log('main');
console.log(deep);
console.log(deep2);

const user: User = { name: 'name' };
console.log(user);
console.log(helper);
