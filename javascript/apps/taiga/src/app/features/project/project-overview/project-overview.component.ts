/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos Ventures SL
 */

import { fetchProject } from '~/app/features/project/project/actions/project.actions';
import { selectProject } from '~/app/features/project/project/selectors/project.selectors';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
@UntilDestroy()
@Component({
  selector: 'tg-project-overview',
  templateUrl: './project-overview.component.html',
  styleUrls: ['./project-overview.component.css'],
})
export class ProjectOverviewComponent implements OnInit, AfterViewChecked {
  @ViewChild('descriptionOverflow')
  public descriptionOverflow?: ElementRef;

  public showDescription = false;
  public hideOverflow = false;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
  ) {}

  public project$ = this.store.select(selectProject);

  public ngOnInit() {
    this.route.paramMap
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.showDescription = false;
        this.hideOverflow = false;
        this.store.dispatch(fetchProject({ slug: params.get('slug')! }));
      });
  }

  public hasClamping(el: HTMLElement) {
    const { clientHeight, scrollHeight } = el;
    return clientHeight !== scrollHeight;
  };

  public toggleShowDescription() {
    this.hideOverflow = !this.hideOverflow;
  }

  public ngAfterViewChecked() {
    if (this.descriptionOverflow && !this.hideOverflow) {
      this.showDescription = this.hasClamping(this.descriptionOverflow.nativeElement);
      this.cd.detectChanges();
    }
  }
}