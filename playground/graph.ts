// import { createModuleGraph } from '@thepassle/module-graph';
// import { typescript } from '@thepassle/module-graph/plugins/typescript.js';

// const moduleGraph = createModuleGraph('./test/test-project/index.ts', {
//   plugins: [typescript()]
// });


// moduleGraph.then(res=> {
//   console.log(res)
// })


import { DependencyTree } from '@canva/dependency-tree';



(async () => {
  const dependencyTree = new DependencyTree(['/test/test-project']);
  const {
    missing, // a map from files in any of the given root directories to their (missing) dependencies
    resolved, // a map from files in any of the given root directories to their dependencies
  } = await dependencyTree.gather();

  const directOrTransitiveReferences = DependencyTree.getReferences(resolved, [
    '/test/test-project/index.ts',
  ]);

  console.log(directOrTransitiveReferences);
})()
