import {
 filterOptRestrictions,
 fixed,
 numbersToCurrency,
 setCursor,
 validateRestrictedOptions,
 event,
} from '../utils';
import { format, unformat } from '../utils/format';
import defaults, { VCurrencyOptions } from '../types/Money';
import { DirectiveBinding } from 'vue';

// TODO this option is used for ALL directive instances
let opt: VCurrencyOptions | null = null;

const setValue = (el: HTMLInputElement, caller: any) => {
 if (!validateRestrictedOptions(opt!)) return;

 let positionFromEnd = el.value.length - el.selectionEnd!;

 el.value = format(el.value, opt!, caller);

 positionFromEnd = Math.max(positionFromEnd, opt!.suffix.length);
 positionFromEnd = el.value.length - positionFromEnd;
 positionFromEnd = Math.max(positionFromEnd, opt!.prefix.length);

 setCursor(el, positionFromEnd);

 el.dispatchEvent(event('change'));
};

export default {
 mounted(el: HTMLInputElement, binding: DirectiveBinding) {
  if (!binding.value) return;

  opt = filterOptRestrictions({ ...defaults, ...binding.value });

  if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
   const els = el.getElementsByTagName('input');
   if (els.length !== 1) {
    throw new Error(`v-money3 requires 1 input, found ${els.length}`);
   } else {
    el = els[0];
   }
  }

  el.onkeydown = (e) => {
   const backspacePressed = e.code === 'Backspace' || e.code === 'Delete';
   const isAtEndPosition = el.value.length - el.selectionEnd! === 0;

   if (
    opt!.allowBlank &&
    backspacePressed &&
    isAtEndPosition &&
    unformat(el.value, opt!) === 0
   ) {
    el.value = '';
    el.dispatchEvent(event('change'));
   }

   if (e.key === '+') {
    let number = unformat(el.value, opt!);
    if (typeof number === 'string') {
     number = parseFloat(number);
    }
    if (number < 0) {
     el.value = String(number * -1);
    }
   }
  };

  el.oninput = () => {
   if (/^[1-9]$/.test(el.value)) {
    el.value = numbersToCurrency(el.value, fixed(opt!.precision));
   }
   setValue(el, 'directive oninput');
  };
  setValue(el, 'directive mounted');
 },
 updated(el: HTMLInputElement, binding: DirectiveBinding) {
  if (!binding.value) {
   return;
  }
  opt = filterOptRestrictions({ ...defaults, ...binding.value });
  setValue(el, 'directive updated');
 },
 beforeUnmount(el: HTMLInputElement) {
  el.onkeydown = null;
  el.oninput = null;
  el.onfocus = null;
 },
};
