/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos Ventures SL
 */

import { createAction, props } from '@ngrx/store';
import { Project, User, Workspace } from '@taiga/data';

export const setWorkspaceList = createAction(
  '[WorkspaceList] set',
  props<{workspaces: Workspace[]}>()
);

export const fetchWorkspaceList = createAction(
  '[WorkspaceList] Fetch'
);

export const fetchWorkspaceListSuccess = createAction(
  '[WorkspaceList] Fetch success',
  props<{workspaces: Workspace[]}>()
);

export const createWorkspace = createAction(
  '[WorkspaceList] Create new workspace',
  props<{name: Workspace['name'], color: Workspace['color'], userId: User['id']}>()
);

export const createWorkspaceSuccess = createAction(
  '[WorkspaceList] Create new workspace success',
  props<{workspace: Workspace}>()
);

export const createFormHasError = createAction(
  '[WorkspaceList] Create Form has error',
  props<{hasError: boolean}>()
);

export const fetchWorkspaceProjects = createAction(
  '[WorkspaceList] Fetch workspace projects',
  props<{slug: Workspace['slug']}>()
);

export const fetchWorkspaceProjectsSuccess = createAction(
  '[WorkspaceList] Fetch workspace projects success',
  props<{slug: Workspace['slug'], projects: Project[]}>()
);