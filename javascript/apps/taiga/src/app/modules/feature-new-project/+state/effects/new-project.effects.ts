/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { pessimisticUpdate } from '@nrwl/angular';
import { TuiNotification } from '@taiga-ui/core';
import { ProjectApiService } from '@taiga/api';
import { Project, ProjectCreation, Workflow } from '@taiga/data';
import { forkJoin } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import * as NewProjectActions from '~/app/modules/feature-new-project/+state/actions/new-project.actions';
import { AppService } from '~/app/services/app.service';
import { ButtonLoadingService } from '~/app/shared/directives/button-loading/button-loading.service';

@Injectable()
export class NewProjectEffects {
  public createProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewProjectActions.createProject),
      pessimisticUpdate({
        run: (action) => {
          this.buttonLoadingService.start();
          console.log(action.project);
          return this.projectApiService.createProject(action.project).pipe(
            switchMap(this.buttonLoadingService.waitLoading()),
            map((project: Project) => {
              return NewProjectActions.createProjectSuccess({ project });
            })
          );
        },
        onError: (_, httpResponse: HttpErrorResponse) => {
          this.buttonLoadingService.error();

          this.appService.errorManagement(httpResponse, {
            500: {
              type: 'toast',
              options: {
                label: 'errors.create_project',
                message: 'errors.please_refresh',
                status: TuiNotification.Error,
              },
            },
          });
          return NewProjectActions.createProjectError({
            error: httpResponse,
          });
        },
      })
    );
  });

  public createProjectSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(
          NewProjectActions.createProjectSuccess,
          NewProjectActions.createAssistantProjectSuccess
        ),
        map((action) => {
          void this.router.navigate(
            ['/project/', action.project.id, action.project.slug, 'kanban'],
            {
              state: { invite: true },
            }
          );
        })
      );
    },
    { dispatch: false }
  );

  public createAssistantProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewProjectActions.createAssistantProject),
      pessimisticUpdate({
        run: (action) => {
          const projectData: ProjectCreation = {
            name: action.project.name,
            description: action.project.description,
            color: action.project.color,
            logo: action.project.logo,
            workspaceId: action.project.workspaceId,
          };
          return this.projectApiService.createProject(projectData).pipe(
            map((project: Project) => {
              return NewProjectActions.createAssistantProjectStories({
                assistant: action.project,
                project,
              });
            })
          );
        },
        onError: (_, httpResponse: HttpErrorResponse) => {
          this.appService.errorManagement(httpResponse, {
            500: {
              type: 'toast',
              options: {
                label: 'errors.create_project',
                message: 'errors.please_refresh',
                status: TuiNotification.Error,
              },
            },
          });
          return NewProjectActions.createProjectError({
            error: httpResponse,
          });
        },
      })
    );
  });

  public createAssistantProjectStories$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewProjectActions.createAssistantProjectStories),
      map(({ assistant, project }) => {
        this.projectApiService
          .getWorkflows(project.id)
          .pipe(
            map((workflow: Workflow[]) => {
              const storiesApiCall = assistant.stories.map((story) => {
                return this.projectApiService.createStory(
                  {
                    title: story.title || '',
                    status: {
                      name: workflow[0].statuses[0].name,
                      slug: workflow[0].statuses[0].slug,
                      color: workflow[0].statuses[0].color,
                    },
                  },
                  project.id,
                  workflow[0].slug
                );
              });
              forkJoin(storiesApiCall).pipe(take(1)).subscribe();
            })
          )
          .pipe(take(1))
          .subscribe();
        return project;
      }),
      map((project) => {
        return NewProjectActions.createAssistantProjectSuccess({ project });
      })
    );
  });

  constructor(
    private buttonLoadingService: ButtonLoadingService,
    private actions$: Actions,
    private projectApiService: ProjectApiService,
    private router: Router,
    private appService: AppService
  ) {}
}
