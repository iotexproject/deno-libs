export const isHttp = (uri: string) => {
  return uri?.startsWith('http://') || uri.startsWith('https://');
};
export const isIpfs = (uri: string) => {
  return uri?.startsWith('ipfs://');
};

export const getIpfsUrl = (uri: string) => {
  return uri?.replace('ipfs://', 'https://ipfs.io/ipfs/');
};


export const isImgUrl = (uri: string) => {
  return /^.*\.(jpg|jpeg|png|gif|bmp|svg|ico)$/i.test(uri);
};

export const getUrl = (uri: string): string | null => {
  if (isHttp(uri)) {
    return uri;
  }
  if (isIpfs(uri)) {
    return getIpfsUrl(uri);
  }
  return null
};
