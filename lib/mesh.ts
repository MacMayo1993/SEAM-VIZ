
import { Vec3 } from "./vec3";

export type Mesh = {
  vertices: Vec3[];
  normals?: Vec3[];
  indices: number[];
};

export function vertexDirections(mesh: Mesh): Vec3[] {
  return mesh.vertices.map(v => Vec3.normalize(v));
}
