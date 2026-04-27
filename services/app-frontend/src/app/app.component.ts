import { AfterViewInit, Component } from '@angular/core';
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
  badge?: string;
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
  imports: [FormsModule, TuiAppBar, TuiAvatar, TuiCard, TuiIcon, TuiInput, TuiRoot, TuiTabs, TuiTextfield],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  private readonly webApp = window.Telegram?.WebApp;

  readonly tabs: readonly Tab[] = [
    { id: 'home', label: 'Главная', icon: '@tui.star' },
    { id: 'payments', label: 'Платежи', icon: '@tui.circle-check' },
    { id: 'city', label: 'Город', icon: '@tui.link' },
    { id: 'chat', label: 'Чат', icon: '@tui.ellipsis', badge: '11' },
    { id: 'showcase', label: 'Витрина', icon: '@tui.layout-grid' }
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
    return this.hasSearchHeader && this.scrollTop > 12;
  }

  get headerCollapsed(): boolean {
    return !this.hasSearchHeader || this.scrollTop > 68;
  }

  get title(): string {
    return this.tabs[this.activeTabIndex]?.label ?? 'Главная';
  }

  get appBarTitle(): string {
    return this.hasSearchHeader && !this.headerCollapsed ? '' : this.title;
  }

  get contentPlaceholders(): readonly number[] {
    return this.isPayments ? [104, 118, 96, 128, 112, 132] : [122, 126, 118, 146, 104, 132];
  }

  ngAfterViewInit(): void {
    if (!this.webApp) {
      return;
    }

    this.webApp.ready();
    this.webApp.expand();
    this.webApp.disableVerticalSwipes?.();
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
    this.searchOpen = false;
    this.settingsOpen = false;
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  openSearch(): void {
    if (!this.hasSearchHeader) {
      return;
    }

    this.searchOpen = true;
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
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  closeSettings(): void {
    this.settingsOpen = false;
  }
}
