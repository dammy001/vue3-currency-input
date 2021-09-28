import { App, defineAsyncComponent } from 'vue';

export default {
 install(app: App): void {
  app.component(
   'vue-currency',
   defineAsyncComponent(() => import('./components/Currency')),
  );
 },
};
