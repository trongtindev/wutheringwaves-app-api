export const isImage = (type: string) => {
  return [
    'image/svg',
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/webp'
  ].includes(type);
};
