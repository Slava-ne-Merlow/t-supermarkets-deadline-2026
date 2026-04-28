import { AfterViewInit, Component, computed, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiHint, TuiIcon, TuiInput, TuiRoot, TuiTextfield } from '@taiga-ui/core';
import { TuiAvatar, TuiProgress, TuiSelect, TuiTabs } from '@taiga-ui/kit';
import { TuiAppBar, TuiCard } from '@taiga-ui/layout';
import { AccountBalanceStore } from './account-balance.store';

type TelegramUser = {
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
};

type TelegramWebApp = {
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  colorScheme?: 'light' | 'dark';
  platform?: string;
  version?: string;
  ready: () => void;
  expand: () => void;
  disableVerticalSwipes?: () => void;
  close: () => void;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
  };
};

type TabId = 'home' | 'payments' | 'city' | 'chat' | 'showcase';

type Tab = {
  id: TabId;
  label: string;
  icon: string;
};

type StorySlide = {
  title: string;
  description: string;
  image: string;
};

type Story = {
  title: string;
  image: string;
  slides: readonly StorySlide[];
};

type HomeSheet = 'operations' | 'cashback' | 'cashbackBalance' | 'survey' | 'topup' | 'orders' | 'cityCategory';

type CitySlide = {
  title: string;
  subtitle: string;
  image: string;
};

type CityCategory = {
  title: string;
  cashback: string;
  image: string;
  size?: 'large';
};

type OperationKind = 'expense' | 'topup';

type Operation = {
  id: number;
  kind: OperationKind;
  day: string;
  dateTime: string;
  merchant: string;
  category: string;
  mcc: string;
  amount: number;
  cashback?: number;
  extraCashback?: number;
  missedCashback?: number;
  partner?: boolean;
  logo: string;
  icon?: string;
  logoTone: string;
};

type OperationGroup = {
  day: string;
  items: readonly Operation[];
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    TuiAppBar,
    TuiAvatar,
    TuiCard,
    TuiHint,
    TuiIcon,
    TuiInput,
    TuiProgress,
    TuiRoot,
    TuiSelect,
    TuiTabs,
    TuiTextfield
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private readonly webApp = window.Telegram?.WebApp;
  readonly accountBalanceStore = inject(AccountBalanceStore);
  private lastTouchEnd = 0;
  private homeSheetCloseTimer: ReturnType<typeof window.setTimeout> | null = null;
  private accountScreenCloseTimer: ReturnType<typeof window.setTimeout> | null = null;
  private settingsScreenCloseTimer: ReturnType<typeof window.setTimeout> | null = null;
  private operationDetailCloseTimer: ReturnType<typeof window.setTimeout> | null = null;
  private citySliderTimer: ReturnType<typeof window.setInterval> | null = null;
  private citySwipeStartX: number | null = null;

  @ViewChild('screen')
  private readonly screen?: ElementRef<HTMLElement>;

  @ViewChild('searchInput')
  set searchInput(input: ElementRef<HTMLInputElement> | undefined) {
    if (!input || !this.searchOpen) {
      return;
    }

    window.requestAnimationFrame(() => input.nativeElement.focus());
  }

  readonly tabs: readonly Tab[] = [
    { id: 'home', label: 'Главная', icon: '@tui.star' },
    { id: 'payments', label: 'Платежи', icon: '@tui.circle-check' },
    { id: 'city', label: 'Город', icon: '@tui.link' },
    { id: 'chat', label: 'Чат', icon: '@tui.ellipsis' },
    { id: 'showcase', label: 'Витрина', icon: '@tui.layout-grid' }
  ];

  readonly stories: readonly Story[] = [
    {
      title: 'Сервисы и продукты',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=720&q=80',
      slides: [
        {
          title: 'Сервисы рядом',
          description: 'Собрали быстрые действия для покупок, платежей и ежедневных задач.',
          image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1080&q=80'
        },
        {
          title: 'Кэшбэк недели',
          description: 'Выбирайте категории и забирайте больше бонусов за привычные покупки.',
          image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1080&q=80'
        },
        {
          title: 'Умные платежи',
          description: 'Платите в пару тапов и следите за регулярными списаниями.',
          image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1080&q=80'
        }
      ]
    },
    {
      title: 'Ближайший банкомат',
      image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=720&q=80',
      slides: [
        {
          title: 'Найдите точку рядом',
          description: 'Покажем ближайшие банкоматы и полезные места на карте.',
          image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1080&q=80'
        }
      ]
    },
    {
      title: 'Городские события',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=720&q=80',
      slides: [
        {
          title: 'Афиша на вечер',
          description: 'Концерты, выставки и стендап - выбирайте событие под настроение.',
          image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1080&q=80'
        },
        {
          title: 'Билеты без очередей',
          description: 'Сохраняйте подборки и переходите к покупке прямо из миниапы.',
          image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1080&q=80'
        },
        {
          title: 'Выходные в городе',
          description: 'Маршруты для прогулок, еды и коротких поездок рядом.',
          image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1080&q=80'
        },
        {
          title: 'Спецпредложения',
          description: 'Смотрите скидки партнеров и планируйте досуг выгоднее.',
          image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1080&q=80'
        }
      ]
    },
    {
      title: 'Дом и уборка',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=720&q=80',
      slides: [
        {
          title: 'Дом без лишних забот',
          description: 'Закажите клининг, проверьте чек-лист и освободите вечер.',
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1080&q=80'
        },
        {
          title: 'План на неделю',
          description: 'Напоминания помогут не забыть бытовые задачи и покупки.',
          image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1080&q=80'
        }
      ]
    },
    {
      title: 'Свежие продукты',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=720&q=80',
      slides: [
        {
          title: 'Корзина на ужин',
          description: 'Овощи, фрукты и готовые наборы - соберите заказ быстрее.',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1080&q=80'
        },
        {
          title: 'Сезонные подборки',
          description: 'Покажем продукты, которые сейчас особенно хороши.',
          image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1080&q=80'
        },
        {
          title: 'Рецепты в один тап',
          description: 'Выберите блюдо, а список покупок соберется автоматически.',
          image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1080&q=80'
        }
      ]
    },
    {
      title: 'Кофе и встречи',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=720&q=80',
      slides: [
        {
          title: 'Места для встреч',
          description: 'Кофейни поблизости, тихие столики и быстрые маршруты.',
          image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1080&q=80'
        }
      ]
    },
    {
      title: 'Путешествия рядом',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=720&q=80',
      slides: [
        {
          title: 'Маршрут на день',
          description: 'Короткие поездки, красивые места и идеи для выходных.',
          image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1080&q=80'
        },
        {
          title: 'Соберите план',
          description: 'Добавляйте точки, сохраняйте маршрут и делитесь с друзьями.',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80'
        }
      ]
    }
  ];

  readonly operationGroups = signal<readonly OperationGroup[]>([
    {
      day: 'Сегодня',
      items: [
        {
          id: 1,
          kind: 'expense',
          day: 'Сегодня',
          dateTime: '28 апреля · 12:18',
          merchant: 'ВкусВилл',
          category: 'Супермаркеты',
          mcc: '5411',
          amount: 1240,
          cashback: 12,
          extraCashback: 37,
          partner: true,
          logo: 'ВВ',
          logoTone: '#32a852'
        },
        {
          id: 2,
          kind: 'expense',
          day: 'Сегодня',
          dateTime: '28 апреля · 09:44',
          merchant: 'Кофейня у дома',
          category: 'Кафе и рестораны',
          mcc: '5812',
          amount: 320,
          cashback: 3,
          logo: 'К',
          logoTone: '#8b5a2b'
        },
        {
          id: 11,
          kind: 'topup',
          day: 'Сегодня',
          dateTime: '28 апреля · 08:10',
          merchant: 'Пополнение счета',
          category: 'Перевод с карты',
          mcc: '0000',
          amount: 2000,
          logo: '+',
          icon: '@tui.plus',
          logoTone: '#1f8f4d'
        }
      ]
    },
    {
      day: 'Вчера',
      items: [
        {
          id: 3,
          kind: 'expense',
          day: 'Вчера',
          dateTime: '27 апреля · 21:07',
          merchant: 'Подружка',
          category: 'Красота',
          mcc: '5977',
          amount: 890,
          missedCashback: 45,
          partner: true,
          logo: 'П',
          logoTone: '#d82d86'
        },
        {
          id: 4,
          kind: 'expense',
          day: 'Вчера',
          dateTime: '27 апреля · 18:32',
          merchant: 'Метро',
          category: 'Супермаркеты',
          mcc: '5411',
          amount: 3480,
          cashback: 35,
          extraCashback: 104,
          partner: true,
          logo: 'М',
          logoTone: '#174ea6'
        },
        {
          id: 5,
          kind: 'expense',
          day: 'Вчера',
          dateTime: '27 апреля · 10:15',
          merchant: 'Такси',
          category: 'Транспорт',
          mcc: '4121',
          amount: 510,
          logo: 'Т',
          logoTone: '#303237'
        },
        {
          id: 12,
          kind: 'topup',
          day: 'Вчера',
          dateTime: '27 апреля · 08:50',
          merchant: 'Пополнение баланса',
          category: 'СБП',
          mcc: '0000',
          amount: 1000,
          logo: '+',
          icon: '@tui.plus',
          logoTone: '#1f8f4d'
        }
      ]
    },
    {
      day: '24 апреля',
      items: [
        {
          id: 6,
          kind: 'expense',
          day: '24 апреля',
          dateTime: '24 апреля · 15:22',
          merchant: 'Теремок',
          category: 'Фастфуд',
          mcc: '5814',
          amount: 616,
          cashback: 6,
          logo: 'Т',
          logoTone: '#e30613'
        },
        {
          id: 7,
          kind: 'expense',
          day: '24 апреля',
          dateTime: '24 апреля · 13:05',
          merchant: 'Лента',
          category: 'Супермаркеты',
          mcc: '5411',
          amount: 2210,
          missedCashback: 66,
          partner: true,
          logo: 'Л',
          logoTone: '#005bbb'
        },
        {
          id: 8,
          kind: 'expense',
          day: '24 апреля',
          dateTime: '24 апреля · 11:34',
          merchant: 'Ашан',
          category: 'Супермаркеты',
          mcc: '5411',
          amount: 1780,
          cashback: 18,
          extraCashback: 53,
          partner: true,
          logo: 'А',
          logoTone: '#d71920'
        }
      ]
    },
    {
      day: '22 апреля',
      items: [
        {
          id: 9,
          kind: 'expense',
          day: '22 апреля',
          dateTime: '22 апреля · 20:46',
          merchant: 'Дикси',
          category: 'Супермаркеты',
          mcc: '5411',
          amount: 960,
          missedCashback: 29,
          partner: true,
          logo: 'Д',
          logoTone: '#f58220'
        },
        {
          id: 10,
          kind: 'expense',
          day: '22 апреля',
          dateTime: '22 апреля · 17:18',
          merchant: 'Глобус',
          category: 'Супермаркеты',
          mcc: '5411',
          amount: 2890,
          cashback: 29,
          extraCashback: 87,
          partner: true,
          logo: 'Г',
          logoTone: '#18884f'
        }
      ]
    }
  ]);

  readonly user = this.webApp?.initDataUnsafe?.user;
  readonly launchedInTelegram = Boolean(this.webApp);
  readonly platform = this.webApp?.platform ?? 'browser';
  readonly colorScheme = this.webApp?.colorScheme ?? 'light';
  readonly version = this.webApp?.version ?? 'local';

  activeTab: TabId = 'home';
  activeTabIndex = 0;
  searchQuery = '';
  scrollTop = 0;
  accountScrollTop = 0;
  searchOpen = false;
  settingsOpen = false;
  settingsScreenClosing = false;
  activeStoryIndex: number | null = null;
  activeSlideIndex = 0;
  activeHomeSheet: HomeSheet | null = null;
  homeSheetClosing = false;
  accountScreenOpen = false;
  accountScreenClosing = false;
  activeOperation: Operation | null = null;
  operationDetailClosing = false;
  selectedCity = 'Москва';
  cities = signal<readonly string[]>(['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск']);
  citySlideIndex = 0;
  activeCityCategory: CityCategory | null = null;

  readonly topUpAmounts = [100, 200, 500, 1000, 2000];
  readonly transferDeepLink = 'bank100000000004://Main/PayByMobileNumber?numberPhone=+79269061483&amount=100';
  readonly citySlides: readonly CitySlide[] = [
    {
      title: 'Вас ждет яркое лето',
      subtitle: 'И призы за покупки в Шопинге',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=82'
    },
    {
      title: 'Билеты на вечер',
      subtitle: 'Кино, концерты и театр рядом',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=82'
    },
    {
      title: 'Супермаркеты рядом',
      subtitle: 'Покупки с дополнительным кэшбэком',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=82'
    },
    {
      title: 'Маршрут на выходные',
      subtitle: 'Короткие поездки и места для прогулок',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82'
    },
    {
      title: 'Сервисы для дома',
      subtitle: 'Клининг, доставка и бытовые задачи',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=82'
    }
  ];
  readonly cityCategories: readonly CityCategory[] = [
    {
      title: 'Путешествия',
      cashback: 'до 5%',
      size: 'large',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=720&q=82'
    },
    {
      title: 'Топливо',
      cashback: '1%',
      image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=720&q=82'
    },
    {
      title: 'Супермаркеты',
      cashback: 'до 15%',
      image: 'https://images.unsplash.com/photo-1601599963565-b7ba29c8e3ff?auto=format&fit=crop&w=720&q=82'
    },
    {
      title: 'Кино',
      cashback: 'до 10%',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=720&q=82'
    },
    {
      title: 'Рестораны',
      cashback: 'до 7%',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=720&q=82'
    }
  ];
  readonly spendingTotal = computed(() =>
    this.operationGroups().reduce(
      (total, group) =>
        total + group.items.reduce((sum, operation) => sum + (operation.kind === 'expense' ? operation.amount : 0), 0),
      0
    )
  );
  readonly spendingTotalLabel = computed(() => `${this.formatRubles(this.spendingTotal())} ₽`);
  readonly cashbackOperationGroups = computed<readonly OperationGroup[]>(() =>
    this.operationGroups()
      .map(group => ({
        day: group.day,
        items: group.items.filter(operation => this.operationCashbackTotal(operation) > 0)
      }))
      .filter(group => group.items.length > 0)
  );
  readonly cashbackTotal = computed(() =>
    this.cashbackOperationGroups().reduce(
      (total, group) => total + group.items.reduce((sum, operation) => sum + this.operationCashbackTotal(operation), 0),
      0
    )
  );
  readonly cashbackTotalLabel = computed(() => `${this.formatRubles(this.cashbackTotal())} ₽`);

  get displayName(): string {
    return [this.user?.first_name, this.user?.last_name].filter(Boolean).join(' ') || 'Гость';
  }

  get avatarLabel(): string {
    return this.displayName.trim().charAt(0).toUpperCase() || 'Г';
  }

  get avatarUrl(): string | null {
    return this.user?.photo_url ?? null;
  }

  get username(): string {
    return this.user?.username ? `@${this.user.username}` : 'без username';
  }

  get isHome(): boolean {
    return this.activeTab === 'home';
  }

  get isPayments(): boolean {
    return this.activeTab === 'payments';
  }

  get isCity(): boolean {
    return this.activeTab === 'city';
  }

  get hasSearchHeader(): boolean {
    return this.isHome || this.isPayments;
  }

  get isStubTab(): boolean {
    return this.activeTab === 'chat' || this.activeTab === 'showcase';
  }

  get searchCollapsed(): boolean {
    return this.hasSearchHeader && this.scrollTop > 8;
  }

  get headerCollapsed(): boolean {
    return this.scrollTop > 42;
  }

  get title(): string {
    return this.tabs[this.activeTabIndex]?.label ?? 'Главная';
  }

  get appBarTitle(): string {
    return this.headerCollapsed ? this.title : '';
  }

  get accountBarCollapsed(): boolean {
    return this.accountScrollTop > 120;
  }

  get contentPlaceholders(): readonly number[] {
    return this.isPayments ? [104, 118, 96, 128, 112, 132] : [];
  }

  get activeStory(): Story | null {
    return this.activeStoryIndex === null ? null : this.stories[this.activeStoryIndex] ?? null;
  }

  get activeSlide(): StorySlide | null {
    return this.activeStory?.slides[this.activeSlideIndex] ?? null;
  }

  get isLargeHomeSheet(): boolean {
    return this.activeHomeSheet === 'operations' || this.activeHomeSheet === 'cashback' || this.activeHomeSheet === 'cashbackBalance';
  }

  get homeSheetTitle(): string {
    switch (this.activeHomeSheet) {
      case 'operations':
        return 'Операции';
      case 'cashback':
        return 'Кэшбэк и бонусы';
      case 'cashbackBalance':
        return 'Кэшбэк';
      case 'survey':
        return 'Опрос';
      case 'topup':
        return 'Пополнить Black';
      case 'orders':
        return 'Заказы';
      case 'cityCategory':
        return this.activeCityCategory?.title ?? 'Город';
      default:
        return '';
    }
  }

  ngAfterViewInit(): void {
    document.addEventListener('touchend', this.preventDoubleTapZoom, { passive: false });
    this.loadCities();
    this.startCitySlider();

    if (!this.webApp) {
      return;
    }

    this.webApp.ready();
    this.webApp.expand();
    this.webApp.disableVerticalSwipes?.();
  }

  ngOnDestroy(): void {
    document.removeEventListener('touchend', this.preventDoubleTapZoom);
    this.clearHomeSheetCloseTimer();
    this.clearAccountScreenCloseTimer();
    this.clearSettingsScreenCloseTimer();
    this.clearOperationDetailCloseTimer();
    this.clearCitySliderTimer();
  }

  markReady(): void {
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  close(): void {
    this.webApp?.close();
  }

  onScroll(event: Event): void {
    this.scrollTop = (event.target as HTMLElement).scrollTop;
  }

  onAccountScroll(event: Event): void {
    this.accountScrollTop = (event.target as HTMLElement).scrollTop;
  }

  selectTab(index: number): void {
    const tab = this.tabs[index];

    if (!tab) {
      return;
    }

    this.activeTabIndex = index;
    this.activeTab = tab.id;
    this.scrollTop = 0;
    this.accountScrollTop = 0;
    this.screen?.nativeElement.scrollTo({ top: 0 });
    this.searchOpen = false;
    this.closeSettings(true);
    this.closeAccountScreen(true);
    this.closeHomeSheet(true);
    this.closeOperationDetail(true);
    this.closeStory();
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  openSearch(): void {
    this.searchOpen = true;
    this.closeSettings();
    this.closeAccountScreen();
    this.closeHomeSheet();
    this.closeOperationDetail();
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  closeSearch(): void {
    this.searchOpen = false;
  }

  openSettings(): void {
    if (!this.isHome) {
      return;
    }

    this.clearSettingsScreenCloseTimer();
    this.settingsScreenClosing = false;
    this.settingsOpen = true;
    this.closeAccountScreen();
    this.closeHomeSheet();
    this.closeOperationDetail();
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  closeSettings(immediate = false): void {
    if (!this.settingsOpen) {
      return;
    }

    this.clearSettingsScreenCloseTimer();

    if (immediate) {
      this.settingsScreenClosing = false;
      this.settingsOpen = false;
      return;
    }

    this.settingsScreenClosing = true;
    this.settingsScreenCloseTimer = window.setTimeout(() => {
      this.settingsOpen = false;
      this.settingsScreenClosing = false;
      this.settingsScreenCloseTimer = null;
    }, 280);
  }

  openStory(index: number): void {
    if (!this.stories[index]) {
      return;
    }

    this.activeStoryIndex = index;
    this.activeSlideIndex = 0;
    this.closeSettings();
    this.closeAccountScreen();
    this.closeHomeSheet();
    this.closeOperationDetail();
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  closeStory(): void {
    this.activeStoryIndex = null;
    this.activeSlideIndex = 0;
  }

  nextStorySlide(): void {
    const story = this.activeStory;

    if (!story) {
      return;
    }

    if (this.activeSlideIndex < story.slides.length - 1) {
      this.activeSlideIndex += 1;
      return;
    }

    if (this.activeStoryIndex !== null && this.activeStoryIndex < this.stories.length - 1) {
      this.activeStoryIndex += 1;
      this.activeSlideIndex = 0;
      return;
    }

    this.closeStory();
  }

  previousStorySlide(): void {
    if (!this.activeStory) {
      return;
    }

    if (this.activeSlideIndex > 0) {
      this.activeSlideIndex -= 1;
      return;
    }

    if (this.activeStoryIndex !== null && this.activeStoryIndex > 0) {
      this.activeStoryIndex -= 1;
      this.activeSlideIndex = this.stories[this.activeStoryIndex].slides.length - 1;
    }
  }

  openAccountScreen(): void {
    this.clearAccountScreenCloseTimer();
    this.accountScreenClosing = false;
    this.accountScreenOpen = true;
    this.accountScrollTop = 0;
    this.closeHomeSheet(true);
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  closeAccountScreen(immediate = false): void {
    if (!this.accountScreenOpen) {
      return;
    }

    this.clearAccountScreenCloseTimer();

    if (immediate) {
      this.accountScreenClosing = false;
      this.accountScreenOpen = false;
      return;
    }

    this.accountScreenClosing = true;
    this.accountScreenCloseTimer = window.setTimeout(() => {
      this.accountScreenOpen = false;
      this.accountScreenClosing = false;
      this.accountScreenCloseTimer = null;
    }, 280);
  }

  openHomeSheet(sheet: HomeSheet): void {
    this.clearHomeSheetCloseTimer();
    this.homeSheetClosing = false;
    this.closeOperationDetail(true);
    this.activeHomeSheet = sheet;
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  openCityCategory(category: CityCategory): void {
    this.activeCityCategory = category;
    this.openHomeSheet('cityCategory');
  }

  onCitySwipeStart(event: TouchEvent): void {
    this.citySwipeStartX = event.changedTouches[0]?.clientX ?? null;
  }

  onCitySwipeEnd(event: TouchEvent): void {
    const startX = this.citySwipeStartX;
    const endX = event.changedTouches[0]?.clientX;

    this.citySwipeStartX = null;

    if (startX === null || endX === undefined || Math.abs(endX - startX) < 42) {
      return;
    }

    if (endX < startX) {
      this.nextCitySlide();
    } else {
      this.previousCitySlide();
    }

    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  private nextCitySlide(): void {
    this.citySlideIndex = (this.citySlideIndex + 1) % this.citySlides.length;
  }

  private previousCitySlide(): void {
    this.citySlideIndex = (this.citySlideIndex + this.citySlides.length - 1) % this.citySlides.length;
  }

  openOperationDetail(operation: Operation): void {
    this.clearOperationDetailCloseTimer();
    this.operationDetailClosing = false;
    this.activeOperation = operation;
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  closeOperationDetail(immediate = false): void {
    if (!this.activeOperation) {
      return;
    }

    this.clearOperationDetailCloseTimer();

    if (immediate) {
      this.operationDetailClosing = false;
      this.activeOperation = null;
      return;
    }

    this.operationDetailClosing = true;
    this.operationDetailCloseTimer = window.setTimeout(() => {
      this.activeOperation = null;
      this.operationDetailClosing = false;
      this.operationDetailCloseTimer = null;
    }, 280);
  }

  topUpBalance(amount: number): void {
    this.accountBalanceStore.topUp(amount);
    this.addTopUpOperation(amount);
    this.webApp?.HapticFeedback?.impactOccurred('medium');
    this.closeHomeSheet();
  }

  formatRubles(amount: number): string {
    return new Intl.NumberFormat('ru-RU', {
      maximumFractionDigits: 0
    })
      .format(amount)
      .replace(/\u00a0/g, ' ');
  }

  operationCashbackTotal(operation: Operation): number {
    return (operation.cashback ?? 0) + (operation.extraCashback ?? 0);
  }

  closeHomeSheet(immediate = false): void {
    if (!this.activeHomeSheet) {
      return;
    }

    this.clearHomeSheetCloseTimer();

    if (immediate) {
      this.homeSheetClosing = false;
      this.activeHomeSheet = null;
      this.closeOperationDetail(true);
      return;
    }

    this.closeOperationDetail();
    this.homeSheetClosing = true;
    this.homeSheetCloseTimer = window.setTimeout(() => {
      this.activeHomeSheet = null;
      this.homeSheetClosing = false;
      this.homeSheetCloseTimer = null;
    }, 280);
  }

  openDeepLink(url: string): void {
    this.webApp?.HapticFeedback?.impactOccurred('light');

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  private clearHomeSheetCloseTimer(): void {
    if (!this.homeSheetCloseTimer) {
      return;
    }

    window.clearTimeout(this.homeSheetCloseTimer);
    this.homeSheetCloseTimer = null;
  }

  private addTopUpOperation(amount: number): void {
    const now = new Date();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const operation: Operation = {
      id: now.getTime(),
      kind: 'topup',
      day: 'Сегодня',
      dateTime: `Сегодня · ${time}`,
      merchant: 'Пополнение счета',
      category: 'Пополнение баланса',
      mcc: '0000',
      amount,
      logo: '+',
      icon: '@tui.plus',
      logoTone: '#1f8f4d'
    };

    this.operationGroups.update(groups => {
      const today = groups[0];

      if (today?.day === 'Сегодня') {
        return [{ ...today, items: [operation, ...today.items] }, ...groups.slice(1)];
      }

      return [{ day: 'Сегодня', items: [operation] }, ...groups];
    });
  }

  private clearAccountScreenCloseTimer(): void {
    if (!this.accountScreenCloseTimer) {
      return;
    }

    window.clearTimeout(this.accountScreenCloseTimer);
    this.accountScreenCloseTimer = null;
  }

  private clearOperationDetailCloseTimer(): void {
    if (!this.operationDetailCloseTimer) {
      return;
    }

    window.clearTimeout(this.operationDetailCloseTimer);
    this.operationDetailCloseTimer = null;
  }

  private clearSettingsScreenCloseTimer(): void {
    if (!this.settingsScreenCloseTimer) {
      return;
    }

    window.clearTimeout(this.settingsScreenCloseTimer);
    this.settingsScreenCloseTimer = null;
  }

  private clearCitySliderTimer(): void {
    if (!this.citySliderTimer) {
      return;
    }

    window.clearInterval(this.citySliderTimer);
    this.citySliderTimer = null;
  }

  private startCitySlider(): void {
    this.clearCitySliderTimer();
    this.citySliderTimer = window.setInterval(() => this.nextCitySlide(), 3600);
  }

  private loadCities(): void {
    fetch('cities.txt')
      .then(response => (response.ok ? response.text() : ''))
      .then(text => {
        const cities = text
          .split(/\r?\n/)
          .map(city => city.trim())
          .filter(Boolean);

        if (cities.length > 0) {
          this.cities.set(cities);
          this.selectedCity = cities.includes(this.selectedCity) ? this.selectedCity : cities[0];
        }
      })
      .catch(() => undefined);
  }

  private readonly preventDoubleTapZoom = (event: TouchEvent): void => {
    const now = Date.now();

    if (now - this.lastTouchEnd <= 300) {
      event.preventDefault();
    }

    this.lastTouchEnd = now;
  };
}
