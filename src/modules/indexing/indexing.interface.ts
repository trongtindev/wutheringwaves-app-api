export interface IIndexingGoogleStatus {
  url: string;
  latestUpdate: {
    url: string;
    type: 'URL_UPDATED';
    notifyTime: string;
  };
  latestRemove: {
    url: string;
    type: 'URL_DELETED';
    notifyTime: string;
  };
}