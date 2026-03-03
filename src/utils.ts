import { FileGraphOutput } from './fileGraph';


/**
 * Finds all files that should be deleted cascadingly when deleting a target file.
 * A file should be deleted cascadingly if it's only used by files that are being deleted.
 *
 * @param graph - The dependency graph
 * @param pathToDelete - The path of the file to delete
 * @returns Array of file paths to delete (including the original file)
 */
export function findCascadingDeletes(graph: FileGraphOutput, pathToDelete: string): string[] {
  // Build a map of file -> files that use it (reverse dependencies)
  const usedBy = new Map<string, Set<string>>();

  // Build a map of file -> files it depends on (forward dependencies)
  const dependsOn = new Map<string, Set<string>>();

  // Initialize maps for all nodes
  for (const node of graph.nodes) {
    usedBy.set(node.id, new Set());
    dependsOn.set(node.id, new Set());
  }

  // Populate the maps from edges
  for (const edge of graph.edges) {
    // source depends on target
    dependsOn.get(edge.source)?.add(edge.target);
    // target is used by source
    usedBy.get(edge.target)?.add(edge.source);
  }

  // Set of files to delete
  const toDelete = new Set<string>([pathToDelete]);

  // Queue for processing - start with the initial file's dependencies
  const queue: string[] = Array.from(dependsOn.get(pathToDelete) || []);

  while (queue.length > 0) {
    const candidate = queue.shift()!;

    // Skip if already marked for deletion
    if (toDelete.has(candidate)) {
      continue;
    }

    // Get all files that use this candidate
    const users = usedBy.get(candidate) || new Set();
    console.log('candidate', candidate);
    console.log('users', users);

    // Check if ALL users of this candidate are in the toDelete set
    const allUsersBeingDeleted = Array.from(users).every((user) => toDelete.has(user));

    if (allUsersBeingDeleted && users.size > 0) {
      // This file should be deleted cascadingly
      toDelete.add(candidate);

      // Add its dependencies to the queue to check them too
      const candidateDeps = dependsOn.get(candidate) || new Set();
      queue.push(...Array.from(candidateDeps));
    }
  }

  return Array.from(toDelete);
}
