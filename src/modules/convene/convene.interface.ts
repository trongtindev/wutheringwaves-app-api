export interface IConveneHistory {
  time: string;
  name: string;
  qualityLevel: number;
}

export interface IAfterImportConveneEventArgs {
  playerId: number;
  items: IConveneHistory[][];
}
