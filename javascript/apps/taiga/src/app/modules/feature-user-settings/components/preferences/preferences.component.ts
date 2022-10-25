/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos Ventures SL
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { concatLatestFrom } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { RxState } from '@rx-angular/state';
import { Language } from '@taiga/data';
import { combineLatest, map, take } from 'rxjs';
import { selectUser } from '~/app/modules/auth/data-access/+state/selectors/auth.selectors';
import { userSettingsActions } from '~/app/modules/feature-user-settings/data-access/+state/actions/user-settings.actions';
import { selectLanguages } from '~/app/modules/feature-user-settings/data-access/+state/selectors/user-settings.selectors';
import { filterNil } from '~/app/shared/utils/operators';
import { UtilsService } from '~/app/shared/utils/utils-service.service';

@Component({
  selector: 'tg-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['../../styles/user-settings.css', './preferences.component.css'],
  providers: [RxState],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesComponent {
  public readonly model$ = this.state.select();
  public language = new FormControl('');

  constructor(
    private utilsService: UtilsService,
    private store: Store,
    private state: RxState<{
      langLabel: Language['englishName'];
      languages: Language[][];
      currentLang: Language;
    }>
  ) {
    this.store.dispatch(userSettingsActions.initPreferences());

    const currentLang$ = this.store.select(selectUser).pipe(
      filterNil(),
      map((user) => user.lang)
    );

    this.state.connect(
      'languages',
      combineLatest([this.store.select(selectLanguages), currentLang$]).pipe(
        map(([languages, lang]) => {
          const current = languages.find((it) => it.code === lang);
          const defaultLang = languages.find((it) => it.isDefault);
          const userLang = languages.find(
            (it) => it.code === this.utilsService.navigatorLanguage()
          );

          const initialLangs: Language[] = [];

          if (current) {
            initialLangs.push(current);
          }

          if (defaultLang && defaultLang.code !== current?.code) {
            initialLangs.push(defaultLang);
          }

          if (
            userLang &&
            userLang.code !== current?.code &&
            userLang.code !== defaultLang?.code
          ) {
            initialLangs.push(userLang);
          }

          const filteredLangs = languages.filter(
            (lang) => !initialLangs.find((it) => it.code === lang.code)
          );

          const latin = filteredLangs.filter((it) => it.scriptType === 'latin');
          const cyrillic = filteredLangs.filter(
            (it) => it.scriptType === 'cyrillic'
          );
          const hebrew = filteredLangs.filter(
            (it) => it.scriptType === 'hebrew'
          );
          const arabic = filteredLangs.filter(
            (it) => it.scriptType === 'arabic'
          );
          const chinese_and_dev = filteredLangs.filter(
            (it) => it.scriptType === 'chinese_and_devs'
          );

          return [
            initialLangs,
            latin,
            cyrillic,
            hebrew,
            arabic,
            chinese_and_dev,
          ];
        })
      )
    );

    this.state.connect(
      'currentLang',
      combineLatest([this.store.select(selectLanguages), currentLang$]).pipe(
        map(([languages, lang]) => {
          return languages.find((it) => it.code === lang);
        }),
        filterNil()
      )
    );

    this.state
      .select('currentLang')
      .pipe(filterNil(), take(1))
      .subscribe((currentLang) => {
        this.language.setValue(currentLang.code);

        this.state.hold(
          this.language.valueChanges.pipe(
            filterNil(),
            concatLatestFrom(() => this.store.select(selectLanguages))
          ),
          ([lang, languages]) => {
            const newLanguage = languages.find((it) => it.code === lang);
            if (newLanguage) {
              this.store.dispatch(
                userSettingsActions.newLanguage({ lang: newLanguage })
              );
            }
          }
        );
      });
  }

  public trackByIndex(index: number) {
    return index;
  }

  public trackByLanguage(_index: number, language: Language) {
    return language.code;
  }
}
