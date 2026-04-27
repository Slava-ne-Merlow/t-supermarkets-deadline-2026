import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideTaiga } from '@taiga-ui/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideTaiga({
      apis: 'stable',
      fontScaling: false,
      scrollbars: 'native'
    })
  ]
};
