// import { remove } from 'wild-wild-path';
// const info = getFilesInfo('test/test-project/**/*.ts');
// console.log(info);
// const tree1 = buildTree(info);
// const withoutids = remove(tree1, '**.id');
// console.dir(tree1, { depth: null });
// fs.writeFileSync('./test/mock/info.json', JSON.stringify(info, null, 2));
// fs.writeFileSync('./test/mock/tree.json', JSON.stringify(withoutids, null, 2));
import fs from 'node:fs';
import { remove } from 'wild-wild-path';
import { buildTree, getTreeByFile } from '../src/main';
const filesInfo = getTreeByFile('test/test-project/index.ts');
console.log(filesInfo);
fs.writeFileSync('./test/mock/file-info.json', JSON.stringify(filesInfo, null, 2));
const tree = buildTree(Object.values(filesInfo));
console.dir(tree, { depth: null });
const withoutids = remove(tree, '**.id');
fs.writeFileSync('./test/mock/file-tree.json', JSON.stringify(withoutids, null, 2));

// const filesInfo = getTreeByFile('src/containers/bank/form/form.container.tsx');
// console.log(filesInfo);
// const tree = buildTree(Object.values(filesInfo));
// console.dir(tree, { depth: null });
// fs.writeFileSync('./file-tree.json', JSON.stringify(tree));

// import { set, iterate, list } from 'wild-wild-path';
// const k = [
//   {
//     name: 'sds',
//   },
//   {
//     name: 'ssgds',
//   },
// ];

// // console.log(set(k, '*.id', crypto.randomUUID()));

// for (const color of iterate(k, '*')) {
//   set(color, 'id', '33', { mutate: true });
//   console.log(color); // 'red', 'blue'
// }

// console.log(k);

// const c = {
//   name: 'ssgds',
// };

// set(c, 'id', '33', { mutate: true });
// console.log(c);

// const file = JSON.parse(fs.readFileSync('./test/mock/file-tree.json', 'utf-8'));
// console.dir(file, { depth: null });
// for (const color of list(file, '**.children.*')) {
//   console.dir(color, { depth: null });
//   set(color, 'id', crypto.randomUUID(), { mutate: true, childFirst: true });
// }
// console.dir(file, { depth: null });
