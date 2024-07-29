import { BadRequestException } from '@nestjs/common';
import { isLocale, isString, length } from 'class-validator';
import {
  POST_CONTENT_LENGTH,
  POST_DESCRIPTION_LENGTH,
  POST_TITLE_LENGTH
} from './post.config';

export const validatorTitleLocalized = (
  locale: string,
  locales: string[],
  localized: { [key: string]: string }
) => {
  if (!isLocale(locale) || !locales.includes(locale)) {
    throw new BadRequestException('invalid_localized_title');
  }
  if (!isString(localized[locale])) {
    throw new BadRequestException('invalid_localized_title');
  }
  if (!length(localized[locale], POST_TITLE_LENGTH[0], POST_TITLE_LENGTH[1])) {
    throw new BadRequestException('invalid_localized_title_length');
  }
};

export const validatorDescriptionLocalized = (
  locale: string,
  locales: string[],
  localized: { [key: string]: string }
) => {
  if (!isLocale(locale) || !locales.includes(locale)) {
    throw new BadRequestException('invalid_description_localized');
  }
  if (!isString(localized[locale])) {
    throw new BadRequestException('invalid_description_localized');
  }
  if (
    !length(
      localized[locale],
      POST_DESCRIPTION_LENGTH[0],
      POST_DESCRIPTION_LENGTH[1]
    )
  ) {
    throw new BadRequestException('invalid_description_localized_length');
  }
};

export const validatorContentLocalized = (
  locale: string,
  locales: string[],
  localized: { [key: string]: string }
) => {
  if (!isLocale(locale) || !locales.includes(locale)) {
    throw new BadRequestException('invalid_content_localized');
  }
  if (!isString(localized[locale])) {
    throw new BadRequestException('invalid_content_localized');
  }
  if (
    !length(localized[locale], POST_CONTENT_LENGTH[0], POST_CONTENT_LENGTH[1])
  ) {
    throw new BadRequestException('invalid_content_localized_length');
  }
};

export const compareObject = (objectA: any, objectB: any) => {
  // Get the keys of both objects
  const keysA = Object.keys(objectA);
  const keysB = Object.keys(objectB);

  // Check if the length of the keys is the same
  if (keysA.length !== keysB.length) {
    return false;
  }

  // Check if every key in objectA exists in objectB
  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false;
    }
  }

  // TODO: check value
  return false;
};

export const compareLocalizedChanged = (objectA: any, objectB: any) => {};

export const extractAttachments = (content: string): string[] => {
  // Regular expression to match <img> tags with the fid attribute
  const imgTagRegex = /<img[^>]*\bfid\b[^>]*>/g;
  const matches = [];
  let match: string[];

  // Use the regex to find all matching img tags
  while ((match = imgTagRegex.exec(content)) !== null) {
    const fid = match[0].split('fid="')[1].split('"')[0];
    if (!matches.includes(fid)) matches.push(fid);
  }

  return matches;
};

export const renderExportContent = (content: string) => {
  return content;
};
