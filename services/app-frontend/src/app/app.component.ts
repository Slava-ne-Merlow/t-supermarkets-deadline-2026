import { AfterViewInit, Component } from '@angular/core';

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
  close: () => void;
  MainButton?: {
    setText: (text: string) => void;
    show: () => void;
    onClick: (callback: () => void) => void;
  };
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
  };
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
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  private readonly webApp = window.Telegram?.WebApp;

  readonly user = this.webApp?.initDataUnsafe?.user;
  readonly launchedInTelegram = Boolean(this.webApp);
  readonly platform = this.webApp?.platform ?? 'browser';
  readonly colorScheme = this.webApp?.colorScheme ?? 'light';
  readonly version = this.webApp?.version ?? 'local';

  get displayName(): string {
    return [this.user?.first_name, this.user?.last_name].filter(Boolean).join(' ') || 'Гость';
  }

  get username(): string {
    return this.user?.username ? `@${this.user.username}` : 'без username';
  }

  ngAfterViewInit(): void {
    if (!this.webApp) {
      return;
    }

    this.webApp.ready();
    this.webApp.expand();
    this.webApp.MainButton?.setText('Закрыть');
    this.webApp.MainButton?.show();
    this.webApp.MainButton?.onClick(() => this.webApp?.close());
  }

  markReady(): void {
    this.webApp?.HapticFeedback?.impactOccurred('light');
  }

  close(): void {
    this.webApp?.close();
  }
}
