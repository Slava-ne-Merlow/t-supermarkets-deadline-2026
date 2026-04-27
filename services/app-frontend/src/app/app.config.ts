import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideTaiga, tuiIconsProvider } from '@taiga-ui/core';

const MINIAPP_ICONS = {
  '@tui.search':
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path vector-effect="non-scaling-stroke" d="m21 21-4.34-4.34"/><circle vector-effect="non-scaling-stroke" cx="11" cy="11" r="8"/></svg>',
  '@tui.star':
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path vector-effect="non-scaling-stroke" d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>',
  '@tui.circle-check':
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle vector-effect="non-scaling-stroke" cx="12" cy="12" r="10"/><path vector-effect="non-scaling-stroke" d="m9 12 2 2 4-4"/></svg>',
  '@tui.link':
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path vector-effect="non-scaling-stroke" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path vector-effect="non-scaling-stroke" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  '@tui.ellipsis':
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle vector-effect="non-scaling-stroke" cx="12" cy="12" r="1"/><circle vector-effect="non-scaling-stroke" cx="19" cy="12" r="1"/><circle vector-effect="non-scaling-stroke" cx="5" cy="12" r="1"/></svg>',
  '@tui.layout-grid':
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect vector-effect="non-scaling-stroke" x="3" y="3" width="7" height="7" rx="1"/><rect vector-effect="non-scaling-stroke" x="14" y="3" width="7" height="7" rx="1"/><rect vector-effect="non-scaling-stroke" x="14" y="14" width="7" height="7" rx="1"/><rect vector-effect="non-scaling-stroke" x="3" y="14" width="7" height="7" rx="1"/></svg>',
  '@tui.chevron-right':
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path vector-effect="non-scaling-stroke" d="m9 18 6-6-6-6"/></svg>',
  '@tui.chevron-left':
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path vector-effect="non-scaling-stroke" d="m15 18-6-6 6-6"/></svg>',
  '@tui.info':
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle vector-effect="non-scaling-stroke" cx="12" cy="12" r="10"/><path vector-effect="non-scaling-stroke" d="M12 16v-4"/><path vector-effect="non-scaling-stroke" d="M12 8h.01"/></svg>'
} as const;

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    tuiIconsProvider(MINIAPP_ICONS),
    provideTaiga({
      apis: 'stable',
      fontScaling: false,
      scrollbars: 'native'
    })
  ]
};
