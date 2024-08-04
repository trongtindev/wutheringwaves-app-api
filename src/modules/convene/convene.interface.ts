export interface IConvene {
  time: string;
  name: string;
  resourceId: number;
  resourceType: string;
  qualityLevel: number;
}

export interface IAfterImportConveneEventArgs {
  playerId: number;
  serverId: string;
  items: IConvene[][];
}
