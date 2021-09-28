import CurrencyDirective from '../directive/currency';
import {
 defineComponent,
 getCurrentInstance,
 computed,
 ref,
 watch,
 toRefs,
} from 'vue';
import defaults from '../types/Money';
import { format, unformat } from '../utils/format';
import {
 filterOptRestrictions,
 fixed,
 validateRestrictedInput,
} from '../utils';

export default defineComponent({
 inheritAttrs: false,
 directives: {
  currency: CurrencyDirective,
 },
 props: {
  debug: {
   required: false,
   type: Boolean,
   default: false,
  },
  id: {
   required: false,
   type: [Number, String],
   default: () => getCurrentInstance()?.uid,
  },
  modelValue: {
   required: false,
   type: [Number, String],
   default: null,
  },
  modelModifiers: {
   required: false,
   type: Object,
   default: () => ({ number: false }),
  },
  masked: {
   type: Boolean,
   default: false,
  },
  precision: {
   type: Number,
   default: () => defaults.precision,
  },
  decimal: {
   type: String,
   default: () => defaults.decimal,
   validator: (value) => validateRestrictedInput(value, 'decimal'),
  },
  thousands: {
   type: String,
   default: () => defaults.thousands,
   validator: (value) => validateRestrictedInput(value, 'thousands'),
  },
  prefix: {
   type: String,
   default: () => defaults.prefix,
   validator: (value) => validateRestrictedInput(value, 'prefix'),
  },
  suffix: {
   type: String,
   default: () => defaults.suffix,
   validator: (value) => validateRestrictedInput(value, 'suffix'),
  },
  disableNegative: {
   type: Boolean,
   default: false,
  },
  disabled: {
   type: Boolean,
   default: false,
  },
  max: {
   type: [String, Number],
   default: () => defaults.max,
  },
  min: {
   type: [String, Number],
   default: () => defaults.min,
  },
  allowBlank: {
   type: Boolean,
   default: () => defaults.allowBlank,
  },
  minimumNumberOfCharacters: {
   type: Number,
   default: () => defaults.minimumNumberOfCharacters,
  },
  shouldRound: {
   type: Boolean,
   default: () => defaults.shouldRound,
  },
  placeholder: {
   type: String,
   default: '',
  },
  customClass: {
   type: String,
   default: '',
  },
  name: {
   type: String,
   default: '',
  },
 },
 emits: ['update:modelValue', 'validate'],
 template: `
    <input
  type="tel"
  :id="id"
  :value="formattedValue"
  :disabled="disabled"
  :placeholder="placeholder"
  :name="name"
  @change="change"
  v-bind="listeners"
  v-currency="{
   precision,
   decimal,
   thousands,
   prefix,
   suffix,
   disableNegative,
   min,
   max,
   allowBlank,
   minimumNumberOfCharacters,
   debug,
   modelModifiers,
   shouldRound,
  }"
  :class="customClass"
 />
  `,
 setup: (props, { emit, attrs }) => {
  const { modelValue, modelModifiers, masked, precision, shouldRound }: any =
   toRefs(props);

  let value = modelValue?.value;
  if (modelModifiers?.value && modelModifiers?.value?.number) {
   if (shouldRound.value) {
    value = Number(modelValue?.value).toFixed(fixed(precision?.value));
   } else {
    value = Number(modelValue?.value)
     .toFixed(fixed(precision?.value) + 1)
     .slice(0, -1);
   }
  }
  const formattedValue = ref(format(value));

  watch(modelValue, (value) => modelValueWatcher(value as any));

  const modelValueWatcher = (value: string | number | null | undefined) => {
   const formatted = format(
    value,
    filterOptRestrictions({ ...(props as any) }),
    'component watch',
   );
   if (formatted !== formattedValue.value) {
    formattedValue.value = formatted;
   }
  };

  let lastValue: unknown = null as boolean | string | undefined | null;

  const change = (event: any) => {
   let value;
   if (masked.value && !modelModifiers.value.number) {
    value = event.target.value;
   } else {
    value = unformat(
     event.target.value,
     filterOptRestrictions({ ...(props as any) }),
     'component change',
    );
   }
   if (value !== lastValue) {
    lastValue = value;
    emit('update:modelValue', value);
   }
  };
  const listeners = computed(() => {
   const payload = {
    ...attrs,
   };
   delete payload['update:modelValue'];
   return payload;
  });

  return { change, listeners, formattedValue };
 },
});
