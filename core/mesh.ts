
import { Vec3, Mesh } from "./types";

/**
 * Computes the normalized direction vectors for all vertices in a mesh.
 *
 * @param mesh - A mesh with vertices
 * @returns An array of unit direction vectors
 */
export function vertexDirections(mesh: Mesh): Vec3[] {
  return mesh.vertices.map(v => Vec3.normalize(v));
}
