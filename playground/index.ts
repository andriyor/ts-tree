import fs from 'node:fs';
import path from 'node:path';
import { getTreeByFile } from '../src/fileTree';
import { getProjectTreeByFolder, getTreeByFolder } from '../src/folderTree';

// console.dir(getTreeByFolder('test/test-project/**/*.ts'), { depth: null });
// console.log(getTreeByFolder('/Users/aoriekhov/git/work/poynt/mercury-clean/src/pages/settings/**/*.{tsx,ts,js}'));
// console.dir(getTreeByFile('/Users/aoriekhov/git/work/poynt/mercury-clean/src/pages/settings/index.page.tsx'), {depth: null});
// console.dir(getTreeByFile('/Users/aoriekhov/git/work/poynt/mercury-clean/src/containers/bank/form/form.container.tsx'), {depth: null});
// console.dir(getTreeByFile('src/containers/settings/bank-account/bank-account.container.tsx'), {depth: null});
// console.dir(getTreeByFile('src/containers/bank/form/form.container.tsx'), {depth: null});
// console.dir(getTreeByFolder('src/pages/settings/**/!(*.skeleton|*.test).{tsx,ts,js}'), {depth: null});
// console.dir(getProjectTreeByFolder('src/**/!(*.skeleton|*.test).{tsx,ts,js}'))
// console.dir(getProjectTreeByFolder('src/pages/**/!(*.skeleton|*.test).{tsx,ts,js}'))
// console.dir(getProjectTreeByFolder('src/pages/settings/**/!(*.skeleton|*.test).{tsx,ts,js}'))

const tree = getTreeByFolder('src/pages/**/!(*.skeleton|*.test).{tsx,ts,js}')
fs.writeFileSync('tree.json', JSON.stringify(tree, null, 2));
// const tree =  getTreeByFile('src/pages/invoices/index.page.tsx')
// console.dir(tree, {depth: null});
// fs.writeFileSync('in-person-tree.json', JSON.stringify(tree, null, 2));

// const info = getFilesInfo('test/test-project/**/*.ts');
// console.log(info);
// const tree1 = buildTree(info);
// console.dir(tree1, { depth: null });
// fs.writeFileSync('./test/mock/info.json', JSON.stringify(info, null, 2));
// fs.writeFileSync('./test/mock/tree.json', JSON.stringify(tree1, null, 2));

// const filesInfo = getTreeByFile('test/test-project/index.ts');
// console.dir(filesInfo, { depth: null });
//
// console.log(path.relative('/foo/bar', '/foo/bar/baz.json'));
// console.log(
//   path.relative(
//     '/Users/aoriekhov/git/personal/ts-tree',
//     '/Users/aoriekhov/git/personal/ts-tree/test/test-project/index.ts',
//   ),
// );

// fs.writeFileSync('./test/mock/file-info.json', JSON.stringify(filesInfo, null, 2));
// const tree = buildTree(filesInfo);
// console.dir(tree, { depth: null });
// fs.writeFileSync('./test/mock/file-tree-without-id.json', JSON.stringify(tree, null, 2));

// const newTree = cloneDeep(tree);
// for (const color of list(newTree, '**.children.*')) {
//   console.dir(color, { depth: null });
//   set(color, 'id', crypto.randomUUID(), { mutate: true });
// }

// console.dir(newTree, { depth: null });
// fs.writeFileSync('./test/mock/file-tree-with-id.json', JSON.stringify(newTree, null, 2));

// const report = JSON.parse(fs.readFileSync('coverage/coverage-summary copy.json', 'utf-8'));
// const fileTree = getTreeByFile('src/containers/bank/form/form.container.tsx', report);
// console.dir(fileTree, { depth: null });
// fs.writeFileSync('./file-tree.json', JSON.stringify(fileTree, null, 2));

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

// const file = JSON.parse(fs.readFileSync('./test/mock/file-tree-without-id.json', 'utf-8'));
// // const file = JSON.parse(fs.readFileSync('./test/mock/file-tree.json', 'utf-8'));
// console.dir(file, { depth: null });
// for (const color of list(file, '**.children.*')) {
//   console.dir(color, { depth: null });
//   set(color, 'id', crypto.randomUUID(), { mutate: true });
// }
// console.dir(file, { depth: null });
// fs.writeFileSync('./test/mock/tree------.json', JSON.stringify(file, null, 2));
