/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import { createAction, props } from '@ngrx/store';
import {
  InvitationRequest,
  Project,
  ProjectAssistantCreation,
  ProjectCreation,
} from '@taiga/data';

export const createProject = createAction(
  '[NewProject] create project',
  props<{ project: ProjectCreation }>()
);

export const createAssistantProject = createAction(
  '[NewProject] create assistant project',
  props<{ project: ProjectAssistantCreation }>()
);

export const createProjectSuccess = createAction(
  '[NewProject] create project success',
  props<{ project: Project }>()
);

export const createAssistantProjectStories = createAction(
  '[NewProject] create assistant project stories',
  props<{ assistant: ProjectAssistantCreation; project: Project }>()
);

export const createAssistantProjectSuccess = createAction(
  '[NewProject] create assistant project success',
  props<{ project: Project }>()
);

export const createProjectError = createAction(
  '[NewProject] create project error',
  props<{ error: unknown }>()
);

export const createAssistantProjectError = createAction(
  '[NewProject] create assistant project error',
  props<{ error: unknown }>()
);

export const inviteUsersToProject = createAction(
  '[NewProject] invite users',
  props<{
    id: string;
    invitation: InvitationRequest[];
  }>()
);
