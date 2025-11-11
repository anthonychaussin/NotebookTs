import Convert from 'ansi-to-html';

const ANSI_PATTERN = /\u001B\[[0-9;?]*[ -\/]*[@-~]/;

const convert = new Convert({newline: true});

export const hasAnsiEscape = (value: string): boolean => ANSI_PATTERN.test(value);

export const renderAnsiText = (value: string): string => convert.toHtml(value);

export const convertAnsiIfNeeded = (value: string): string =>
        hasAnsiEscape(value) ? renderAnsiText(value) : value;
