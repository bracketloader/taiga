/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { WorkspaceMembership, Workspace } from '@taiga/data';
import { RxState } from '@rx-angular/state';
import {
  selectWorkspace,
  selectNonMembersList,
  selectNonMembersLoading,
  selectTotalNonMembers,
  selectNonMembersOffset,
} from '~/app/modules/workspace/feature-detail/+state/selectors/workspace-detail.selectors';
import { Store } from '@ngrx/store';
import { filterNil } from '~/app/shared/utils/operators';
import { MEMBERS_PAGE_SIZE } from '~/app/modules/workspace/feature-detail/workspace-feature.constants';
import { map } from 'rxjs/operators';
import { workspaceDetailApiActions } from '~/app/modules/workspace/feature-detail/+state/actions/workspace-detail.actions';
import { invitationWorkspaceActions } from '~/app/shared/invite-user-modal/data-access/+state/actions/invitation.action';
import { slideInOut } from '~/app/shared/utils/animations';

@Component({
  selector: 'tg-workspace-detail-people-non-members',
  templateUrl: './workspace-detail-people-non-members.component.html',
  styleUrls: ['./workspace-detail-people-non-members.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RxState],
  animations: [slideInOut],
})
export class WorkspaceDetailPeopleNonMembersComponent
  implements OnInit, AfterContentInit
{
  public MEMBERS_PAGE_SIZE = MEMBERS_PAGE_SIZE;
  public model$ = this.state.select().pipe(
    map((model) => {
      const pageStart = model.offset + 1;
      const pageEnd = pageStart + model.nonMembers.length - 1;

      return {
        ...model,
        pageStart,
        pageEnd,
        hasNextPage: pageEnd < model.total,
        hasPreviousPage: !!model.offset,
      };
    })
  );
  public animationDisabled = true;

  constructor(
    private state: RxState<{
      nonMembers: WorkspaceMembership[];
      loading: boolean;
      total: number;
      offset: number;
      workspace: Workspace | null;
    }>,
    private store: Store
  ) {}

  public ngOnInit(): void {
    this.state.connect('nonMembers', this.store.select(selectNonMembersList));
    this.state.connect('loading', this.store.select(selectNonMembersLoading));
    this.state.connect('total', this.store.select(selectTotalNonMembers));
    this.state.connect('offset', this.store.select(selectNonMembersOffset));
    this.state.connect(
      'workspace',
      this.store.select(selectWorkspace).pipe(filterNil())
    );
  }

  public ngAfterContentInit() {
    setTimeout(() => {
      this.animationDisabled = false;
    }, 1000);
  }

  public trackByIndex(index: number) {
    return index;
  }

  public inviteToWorkspace(email: string) {
    this.store.dispatch(
      invitationWorkspaceActions.inviteUsers({
        id: this.state.get('workspace')!.id,
        invitation: [{ usernameOrEmail: email }],
      })
    );
  }

  public next() {
    this.store.dispatch(
      workspaceDetailApiActions.getWorkspaceNonMembers({
        id: this.state.get('workspace')!.id,
        offset: this.state.get('offset') + MEMBERS_PAGE_SIZE,
      })
    );
  }

  public prev() {
    this.store.dispatch(
      workspaceDetailApiActions.getWorkspaceNonMembers({
        id: this.state.get('workspace')!.id,
        offset: this.state.get('offset') - MEMBERS_PAGE_SIZE,
      })
    );
  }
}
