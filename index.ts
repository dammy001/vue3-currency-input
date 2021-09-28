import { App, defineAsyncComponent } from 'vue';
import VCurrency from './directive/currency';

export default {
 install(app: App): void {
  app.component(
   'vue-currency',
   defineAsyncComponent(() => import('./components/Currency')),
  );

  //directive
  app.directive('my-directive', VCurrency);
 },
};
