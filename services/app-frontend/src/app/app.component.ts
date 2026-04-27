import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiIcon, TuiInput, TuiRoot, TuiTextfield } from '@taiga-ui/core';
import { TuiAvatar, TuiTabs } from '@taiga-ui/kit';
import { TuiAppBar, TuiCard } from '@taiga-ui/layout';

type TelegramUser = {
  first_name?: string;
  last_name?: string;
  username?: string;
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

type HomeSheet = 'operations' | 'cashback' | 'topup';

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
  imports: [FormsModule, TuiAppBar, TuiAvatar, TuiCard, TuiIcon, TuiInput, TuiRoot, TuiTabs, TuiTextfield],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private readonly webApp = window.Telegram?.WebApp;
  private lastTouchEnd = 0;

  @ViewChild('screen')
  private readonly screen?: ElementRef<HTMLElement>;

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

  readonly user = this.webApp?.initDataUnsafe?.user;
  readonly launchedInTelegram = Boolean(this.webApp);
  readonly platform = this.webApp?.platform ?? 'browser';
  readonly colorScheme = this.webApp?.colorScheme ?? 'light';
  readonly version = this.webApp?.version ?? 'local';

  activeTab: TabId = 'home';
  activeTabIndex = 0;
  searchQuery = '';
  scrollTop = 0;
  searchOpen = false;
  settingsOpen = false;
  activeStoryIndex: number | null = null;
  activeSlideIndex = 0;
  activeHomeSheet: HomeSheet | null = null;

  readonly topUpAmounts = [100, 200, 500, 1000, 2000];

  get displayName(): string {
    return [this.user?.first_name, this.user?.last_name].filter(Boolean).join(' ') || 'Гость';
  }

  get avatarLabel(): string {
    return this.displayName.trim().charAt(0).toUpperCase() || 'Г';
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

  get hasSearchHeader(): boolean {
    return this.isHome || this.isPayments;
  }

  get isStubTab(): boolean {
    return !this.hasSearchHeader;
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

  get contentPlaceholders(): readonly number[] {
    return this.isPayments ? [104, 118, 96, 128, 112, 132] : [122, 126, 118, 146, 104, 132];
  }

  get activeStory(): Story | null {
    return this.activeStoryIndex === null ? null : this.stories[this.activeStoryIndex] ?? null;
  }

  get activeSlide(): StorySlide | null {
    return this.activeStory?.slides[this.activeSlideIndex] ?? null;
  }

  get homeSheetTitle(): string {
    switch (this.activeHomeSheet) {
      case 'operations':
        return 'Все операции';
      case 'cashback':
        return 'Кэшбэк и бонусы';
      case 'topup':
        return 'Пополнить Black';
      default:
        return '';
    }
  }

  ngAfterViewInit(): void {
    document.addEventListener('touchend', this.preventDoubleTapZoom, { passive: false });

    if (!this.webApp) {
      return;
    }

    this.webApp.ready();
    this.webApp.expand();
    this.webApp.disableVerticalSwipes?.();
  }

  ngOnDestroy(): void {
    document.removeEventListener('touchend', this.preventDoubleTapZoom);
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

  selectTab(index: number): void {
    const tab = this.tabs[index];

    if (!tab) {
      return;
    }

    this.activeTabIndex = index;
    this.activeTab = tab.id;
    this.scrollTop = 0;
    this.screen?.nativeElement.scrollTo({ top: 0 });
    this.searchOpen = false;
    this.settingsOpen = false;
    this.closeHomeSheet();
    this.closeStory();
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  openSearch(): void {
    if (!this.hasSearchHeader) {
      return;
    }

    this.searchOpen = true;
    this.closeHomeSheet();
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  closeSearch(): void {
    this.searchOpen = false;
  }

  openSettings(): void {
    if (!this.isHome) {
      return;
    }

    this.settingsOpen = true;
    this.closeHomeSheet();
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  closeSettings(): void {
    this.settingsOpen = false;
  }

  openStory(index: number): void {
    if (!this.stories[index]) {
      return;
    }

    this.activeStoryIndex = index;
    this.activeSlideIndex = 0;
    this.closeHomeSheet();
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

  openHomeSheet(sheet: HomeSheet): void {
    this.activeHomeSheet = sheet;
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  closeHomeSheet(): void {
    this.activeHomeSheet = null;
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

  private readonly preventDoubleTapZoom = (event: TouchEvent): void => {
    const now = Date.now();

    if (now - this.lastTouchEnd <= 300) {
      event.preventDefault();
    }

    this.lastTouchEnd = now;
  };
}
