export interface IConveneHistory {
  time: string;
  name: string;
  resourceId: number;
  resourceType: string;
  qualityLevel: number;
}

export interface IAfterImportConveneEventArgs {
  playerId: number;
  items: IConveneHistory[][];
}
