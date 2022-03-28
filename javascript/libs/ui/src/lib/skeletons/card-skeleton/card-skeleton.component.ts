/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos Ventures SL
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tg-ui-card-skeleton',
  templateUrl: './card-skeleton.component.html',
  styleUrls: ['../skeleton.css', './card-skeleton.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

// NOTES
// Shared angular animations
export class CardSkeletonComponent {}
