import defaults, { VCurrencyOptions } from '../types/Money';
import BigNumber from './bigNumberClass';
import {
 fixed,
 numbersToCurrency,
 onlyNumbers,
 isValidInteger,
 isValidFloat,
 round,
 addThousandSeparator,
 joinIntegerAndDecimal,
} from '../utils';

const unformat = (
 input: string,
 opt: VCurrencyOptions = defaults,
 caller?: any,
): string | number => {
 const negative = opt.disableNegative ? '' : input.indexOf('-') >= 0 ? '-' : '';

 const filtered = input.replace(opt.prefix, '').replace(opt.suffix, '');

 const numbers = onlyNumbers(filtered);

 const bigNumber = new BigNumber(
  negative + numbersToCurrency(numbers, opt.precision),
 );

 /// min and max must be a valid float or integer
 if (opt.max) {
  if (bigNumber.biggerThan(opt.max)) {
   bigNumber.setNumber(opt.max);
  }
 }
 if (opt.min) {
  if (bigNumber.lessThan(opt.min)) {
   bigNumber.setNumber(opt.min);
  }
 }

 let output = bigNumber.toFixed(fixed(opt.precision), opt.shouldRound);

 if (opt.modelModifiers && opt.modelModifiers.number) {
  // @ts-ignore
  output = parseFloat(output);
 }

 return output;
};

const format = (
 input: string | number | null | undefined,
 opt: VCurrencyOptions = defaults,
 caller?: any,
): string => {
 if (input === null || input === undefined) {
  input = '';
 } else {
  if (typeof input === 'number') {
   if (opt.shouldRound) {
    input = input.toFixed(fixed(opt.precision));
   } else {
    input = input.toFixed(fixed(opt.precision) + 1).slice(0, -1);
   }
  } else if (
   opt.modelModifiers &&
   opt.modelModifiers.number &&
   isValidInteger(input)
  ) {
   input = Number(input).toFixed(fixed(opt.precision));
  }
 }

 const negative = opt.disableNegative ? '' : input.indexOf('-') >= 0 ? '-' : '';

 let filtered = input.replace(opt.prefix, '').replace(opt.suffix, '');

 if (!opt.precision && opt.thousands !== '.' && isValidFloat(filtered)) {
  filtered = round(filtered, 0);
 }

 const numbers = onlyNumbers(filtered);

 const bigNumber = new BigNumber(
  negative + numbersToCurrency(numbers, opt.precision),
 );

 // min and max must be a valid float or integer
 if (opt.max) {
  if (bigNumber.biggerThan(opt.max)) {
   bigNumber.setNumber(opt.max);
  }
 }
 if (opt.min) {
  if (bigNumber.lessThan(opt.min)) {
   bigNumber.setNumber(opt.min);
  }
 }

 const currency = bigNumber.toFixed(fixed(opt.precision), opt.shouldRound);

 // test if it is zero 0, or 0.0 or 0.00 and so on...
 if (/^0(\.0+)?$/g.test(currency) && opt.allowBlank) {
  return '';
 }

 let [integer, decimal] = currency.split('.');

 const decimalLength = decimal !== undefined ? decimal.length : 0;

 integer = integer.padStart(opt.minimumNumberOfCharacters - decimalLength, '0');

 integer = addThousandSeparator(integer, opt.thousands);

 const output =
  opt.prefix +
  joinIntegerAndDecimal(integer, decimal, opt.decimal) +
  opt.suffix;

 return output;
};

export { format, unformat };
