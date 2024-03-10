import { deep } from './deep';
import { deep2 } from './deep2';
import { helper } from './helper';
import { User } from './type';
import { KeyPair } from './interface';
import { Direction } from './enum';
import { DirectionConst } from './asConst';
import defaultSum from './default';
import { useModuleOutsideDir } from './nested/use-module-outside-dir';
import { TestProject } from './typeWithImport';

console.log('main');
console.log(deep);
console.log(deep2);

const user: User = { name: 'name' };
console.log(user);
console.log(helper);

const keyPair: KeyPair = { key: 1, value: 'value' };
console.log(keyPair);
const direction = Direction.Down;
console.log(direction);
console.log(DirectionConst);
console.log(defaultSum(1, 2));
console.log(useModuleOutsideDir);

const t: TestProject = {
  user: {
    filed: 'some'
  }
}
console.log(t);
