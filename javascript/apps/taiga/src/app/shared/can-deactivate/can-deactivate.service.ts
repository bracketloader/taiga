/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import { Injectable } from '@angular/core';
import { ComponentCanDeactivate } from './can-deactivate.guard';
import { map, zip } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CanDeactivateService {
  private components: ComponentCanDeactivate[] = [];

  public addComponent(component: ComponentCanDeactivate) {
    this.components.push(component);
  }

  public deleteComponent(component: ComponentCanDeactivate) {
    this.components = this.components.filter((it) => it !== component);
  }

  public check() {
    return zip([...this.components.map((it) => it.canDeactivate())]).pipe(
      map((results) => !results.some((it) => !it))
    );
  }
}
