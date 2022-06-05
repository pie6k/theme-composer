export type LeafBuiltInMethods<T> = {
  $data: T;
  $isLeaf: true;
};

export type LeafBuildInKey = keyof LeafBuiltInMethods<any>;

export const leafBuildInKeys: Array<LeafBuildInKey> = ["$data", "$isLeaf"];
