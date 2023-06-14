/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import { Router } from '@angular/router';
import { randUuid } from '@ngneat/falso';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ProjectApiService } from '@taiga/api';
import { StoryDetailMockFactory, UserCommentMockFactory } from '@taiga/data';
import { cold, hot } from 'jest-marbles';
import { Observable } from 'rxjs';

import { AppService } from '~/app/services/app.service';
import { LocalStorageService } from '~/app/shared/local-storage/local-storage.service';
import { getTranslocoModule } from '~/app/transloco/transloco-testing.module';
import {
  StoryDetailActions,
  StoryDetailApiActions,
} from '../actions/story-detail.actions';
import { StoryDetailCommentsEffects } from './story-detail-comments.effects';
import { storyDetailFeature } from '../reducers/story-detail.reducer';

describe('StoryDetailEffects', () => {
  let actions$: Observable<Action>;
  let spectator: SpectatorService<StoryDetailCommentsEffects>;
  let store: MockStore;

  const createService = createServiceFactory({
    service: StoryDetailCommentsEffects,
    providers: [
      provideMockActions(() => actions$),
      provideMockStore({ initialState: {} }),
    ],
    imports: [getTranslocoModule()],
    mocks: [ProjectApiService, AppService, Router, LocalStorageService],
  });

  beforeEach(() => {
    spectator = createService();
    store = spectator.inject(MockStore);
  });
  it('initStory - should redirect to fetchComments action', () => {
    const effects = spectator.inject(StoryDetailCommentsEffects);
    const story = StoryDetailMockFactory();
    const projectId = randUuid();

    const comments = [UserCommentMockFactory(), UserCommentMockFactory()];

    store.overrideSelector(storyDetailFeature.selectCommentsOrder, 'createdAt');
    store.overrideSelector(storyDetailFeature.selectComments, comments);

    const action = StoryDetailActions.initStory({
      projectId,
      storyRef: story.ref,
    });
    const outcome = StoryDetailApiActions.fetchComments({
      projectId,
      storyRef: story.ref,
      order: 'createdAt',
      offset: 2,
    });

    actions$ = hot('-a', { a: action });
    const expected = hot('-b', { b: outcome });

    expect(effects.redirectToFetchComments$).toBeObservable(expected);
  });

  it('changeOrderComments - should redirect to fetchComments action', () => {
    const effects = spectator.inject(StoryDetailCommentsEffects);
    const story = StoryDetailMockFactory();
    const projectId = randUuid();
    const action = StoryDetailActions.changeOrderComments({
      projectId,
      storyRef: story.ref,
      order: 'createdAt',
    });
    const outcome = StoryDetailApiActions.fetchComments({
      projectId,
      storyRef: story.ref,
      order: 'createdAt',
      offset: 0,
    });

    actions$ = hot('-a', { a: action });
    const expected = hot('-b', { b: outcome });

    expect(effects.changeOrderComments$).toBeObservable(expected);
  });

  it('should fetch comments successfully', () => {
    const projectApiService = spectator.inject(ProjectApiService);
    const story = StoryDetailMockFactory();
    const projectId = randUuid();
    const action = StoryDetailApiActions.fetchComments({
      projectId,
      storyRef: story.ref,
      order: 'createdAt',
      offset: 0,
    });
    const effects = spectator.inject(StoryDetailCommentsEffects);
    const comments = [UserCommentMockFactory(), UserCommentMockFactory()];
    const outcome = StoryDetailApiActions.fetchCommentsSuccess({
      comments: comments,
      total: comments.length,
      order: 'createdAt',
      offset: 0,
    });

    actions$ = hot('-a', { a: action });
    const response = cold('-a|', { a: { comments, total: comments.length } });
    const expected = cold('--b', { b: outcome });

    projectApiService.getComments.mockReturnValue(response);

    expect(effects.fetchComments$).toBeObservable(expected);
  });
});
