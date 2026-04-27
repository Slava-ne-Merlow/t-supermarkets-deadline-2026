import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AccountBalanceStore {
  private readonly balanceKopecks = signal(677687);

  readonly balanceLabel = computed(() => this.formatMoney(this.balanceKopecks()));

  topUp(rubles: number): void {
    this.balanceKopecks.update(balance => balance + rubles * 100);
  }

  private formatMoney(kopecks: number): string {
    const rubles = kopecks / 100;

    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
      .format(rubles)
      .replace(/\u00a0/g, ' ')
      .concat(' ₽');
  }
}
