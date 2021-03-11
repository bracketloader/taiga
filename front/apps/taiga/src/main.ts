/**
 * Copyright (c) 2014-2021 Taiga Agile LLC
 *
 * This source code is licensed under the terms of the
 * GNU Affero General Public License found in the LICENSE file in
 * the root directory of this source tree.
 */

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { Config } from '@taiga/data'

function init() {
  void import('./app/app.module').then((m) => {
    platformBrowserDynamic()
      .bootstrapModule(m.AppModule)
      .catch((err) => console.error(err));
  });
}

if (environment.production) {
  enableProdMode();
}

if (environment.configRemote) {
  void fetch(environment.configRemote)
    .then(response => response.json())
    .then((config) => {
      environment.configLocal = config as Config;

      init();
    });
} else {
  init();
}

