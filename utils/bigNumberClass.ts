/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
 guessFloatPrecision,
 isValidFloat,
 isValidInteger,
 removeLeadingZeros,
 round,
} from '../utils';

type NumberType = number | string | BigInt;

// @ts-ignore
BigInt.prototype.toJSON = function () {
 return this.toString();
};

export default class BigNumber {
 private number?: BigInt;
 private decimal?: number;

 constructor(number: NumberType) {
  this.setNumber(number);
 }

 getNumber(): BigInt {
  return this.number!; //null assertion
 }

 getDecimalPrecision(): number {
  return this.decimal!; //null assertion
 }

 setNumber(number: any): void {
  this.decimal = 0;

  if (typeof number === 'bigint') {
   this.number = number;
  } else if (typeof number === 'number') {
   //convert to string
   this.setupString(number.toString());
  } else if (typeof number === 'string') {
   this.setupString(number);
  } else {
   throw new Error(
    `BigNumber has received and invalid typeof: ${typeof number}. Only bigint, number and string are permitted.`,
   );
  }
 }

 setupString(number: string): void {
  number = removeLeadingZeros(number);

  if (isValidInteger(number)) {
   this.number = BigInt(number);
  } else if (isValidFloat(number)) {
   this.decimal = guessFloatPrecision(number);
   this.number = BigInt(number.replace('.', ''));
  } else {
   throw new Error(
    `BigNumber has received and invalid format for the constructor: ${number}`,
   );
  }
 }

 toFixed(precision: number = 0, shouldRound: boolean = true): string {
  let string = this.toString();
  const diff = precision - this.getDecimalPrecision();
  if (diff > 0) {
   if (!string.includes('.')) {
    string += '.';
   }
   return string.padEnd(string.length + diff, '0');
  }
  if (diff < 0) {
   if (shouldRound) {
    return round(string, precision);
   }
   return string.slice(0, diff);
  }
  return string;
 }

 toString(): string {
  let string = this.number!.toString();
  if (this.decimal) {
   let isNegative = false;
   if (string.charAt(0) === '-') {
    string = string.substring(1);
    isNegative = true;
   }
   string = string.padStart(string.length + this.decimal, '0');
   string = `${string.slice(0, -this.decimal)}.${string.slice(-this.decimal)}`;
   string = removeLeadingZeros(string);

   return (isNegative ? '-' : '') + string;
  }
  return string;
 }

 lessThan(thatBigNumber: NumberType | BigNumber): boolean {
  const [thisNumber, thatNumber] = this.adjustComparisonNumbers(thatBigNumber);
  return thisNumber < thatNumber;
 }

 biggerThan(thatBigNumber: NumberType | BigNumber): boolean {
  const [thisNumber, thatNumber] = this.adjustComparisonNumbers(thatBigNumber);
  return thisNumber > thatNumber;
 }

 isEqual(thatBigNumber: NumberType | BigNumber): boolean {
  const [thisNumber, thatNumber] = this.adjustComparisonNumbers(thatBigNumber);
  return thisNumber === thatNumber;
 }

 adjustComparisonNumbers(thatNumberParam: NumberType | BigNumber): BigInt[] {
  let thatNumber: BigNumber;
  if (thatNumberParam.constructor.name !== 'BigNumber') {
   thatNumber = new BigNumber(thatNumberParam as NumberType);
  } else {
   thatNumber = thatNumberParam as BigNumber;
  }

  const diff = this.getDecimalPrecision() - thatNumber.getDecimalPrecision();

  let thisNum = this.getNumber();
  let thatNum = thatNumber.getNumber();

  if (diff > 0) {
   // @ts-ignore
   thatNum = thatNumber.getNumber() * 10n ** BigInt(diff);
  } else if (diff < 0) {
   // @ts-ignore
   thisNum = this.getNumber() * 10n ** BigInt(diff * -1);
  }

  return [thisNum, thatNum];
 }
}
