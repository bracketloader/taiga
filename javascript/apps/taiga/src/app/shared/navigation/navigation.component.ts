/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { selectUser } from '~/app/modules/auth/data-access/+state/selectors/auth.selectors';
import { AuthService } from '~/app/modules/auth/services/auth.service';
import { NavigationService } from './navigation.service';
@Component({
  selector: 'tg-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
  public openProjectsDropdown = false;
  public openUserDropdown = false;

  public user$ = this.store.select(selectUser);
  public logged$ = this.user$.pipe(map(() => this.authService.isLogged()));

  constructor(
    private store: Store,
    private authService: AuthService,
    private navigationService: NavigationService
  ) {}

  public scrollToMainArea() {
    this.navigationService.scrollToMainArea();
  }
}
