/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Story } from '@taiga/data';

@Component({
  selector: 'tg-assistant-step-card',
  templateUrl: './assistant-step-card.component.html',
  styleUrls: ['./assistant-step-card.component.css'],
})
export class AssistantStepCardComponent {
  @Input() public story!: Partial<Story>;
  @Input() public index!: number;

  @Output() public removeStory = new EventEmitter();

  public emitRemoveStory() {
    this.removeStory.next(this.story.title);
  }
}
