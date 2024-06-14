export interface IConveneHistory {
  name: string;
  qualityLevel: number;
  resourceId: number;
  resourceType: string;
  time: string;
}

export interface IAfterImportConveneEventArgs {
  playerId: number;
  items: IConveneHistory[];
  cardPoolType: number;
}
