import { VCurrencyOptions } from '../types/Money';

export const RESTRICTED_CHARACTERS: string[] = ['+', '-'];
export const RESTRICTED_OPTIONS: string[] = [
 'decimal',
 'thousands',
 'prefix',
 'suffix',
];

export const fixed = (precision: number): number =>
 Math.max(0, Math.min(precision, 1000));

export const numbersToCurrency = (
 numbers: string,
 precision: number,
): string => {
 numbers = numbers.padStart(precision + 1, '0');
 return precision === 0
  ? numbers
  : `${numbers.slice(0, -precision)}.${numbers.slice(-precision)}`;
};

export const onlyNumbers = (input: number | string): string => {
 input = input ? input.toString() : '';
 return input.replace(/\D+/g, '') || '0';
};

export const addThousandSeparator = (
 integer: string,
 separator: string,
): string => integer.replace(/(\d)(?=(?:\d{3})+\b)/gm, `$1${separator}`);

export const joinIntegerAndDecimal = (
 integer: string,
 decimal: string,
 separator: string,
) => (decimal ? integer + separator + decimal : integer);

export const validateRestrictedInput = (
 value: any,
 caller: string,
): boolean => {
 if (RESTRICTED_CHARACTERS.includes(value)) {
  console.warn(
   `vue-currency-input "${caller}" property don't accept "${value}" as a value.`,
  );
  return false;
 }
 if (/\d/g.test(value)) {
  console.warn(
   `vue-currency-input "${caller}" property don't accept "${value}" (any number) as a value.`,
  );
  return false;
 }
 return true;
};

export const validateRestrictedOptions = (opt: VCurrencyOptions): boolean => {
 for (const target of RESTRICTED_OPTIONS) {
  const isValid = validateRestrictedInput(opt[target], target);
  if (!isValid) {
   return false;
  }
 }
 return true;
};

export const filterOptRestrictions = (
 opt: VCurrencyOptions,
): VCurrencyOptions => {
 for (const option of RESTRICTED_OPTIONS) {
  opt[option] = opt[option].replace(/\d+/g, '');
  for (const character of RESTRICTED_CHARACTERS) {
   opt[option] = opt[option].replaceAll(character, '');
  }
 }
 return opt;
};

export const guessFloatPrecision = (string: string): number => {
 const total = string.length;
 const index = string.indexOf('.');
 return total - (index + 1);
};

export const removeLeadingZeros = (string: string): string =>
 string.replace(/^(-?)0+(?!\.)(.+)/, '$1$2');

export const isValidInteger = (str: string): boolean => /^-?[\d]+$/g.test(str);

export const isValidFloat = (str: string): boolean =>
 /^-?[\d]+(\.[\d]+)$/g.test(str);

export const replaceAt = (
 str: string,
 index: number,
 chr: string | number,
): string => {
 if (index > str.length - 1) return str;
 return str.substring(0, index) + chr + str.substring(index + 1);
};

export const round = (string: string, precision: number): string => {
 const diff = precision - guessFloatPrecision(string);
 if (diff >= 0) return string;

 let firstPiece = string.slice(0, diff);
 const lastPiece = string.slice(diff);

 if (firstPiece.charAt(firstPiece.length - 1) === '.') {
  firstPiece = firstPiece.slice(0, -1);
 }

 if (parseInt(lastPiece.charAt(0), 10) >= 5) {
  for (let i = firstPiece.length - 1; i >= 0; i -= 1) {
   const char = firstPiece.charAt(i);
   if (char !== '.' && char !== '-') {
    const newValue = parseInt(char, 10) + 1;
    if (newValue < 10) {
     return replaceAt(firstPiece, i, newValue);
    }
    firstPiece = replaceAt(firstPiece, i, '0');
   }
  }
  return `1${firstPiece}`;
 }
 return firstPiece;
};

export const setCursor = (el: HTMLInputElement, position: number): void => {
 const setSelectionRange = () => el.setSelectionRange(position, position);
 if (el === document.activeElement) {
  setSelectionRange();
  setTimeout(setSelectionRange, 1);
 }
};

export const event = (name: string): Event => {
 const evt = document.createEvent('Event');
 evt.initEvent(name, true, true);
 return evt;
};
