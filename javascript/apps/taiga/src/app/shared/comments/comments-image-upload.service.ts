/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import { Injectable, inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { ProjectApiService } from '@taiga/api';
import { EditorImageUpload } from '~/app/shared/editor/editor-image-upload.service';

@Injectable({
  providedIn: 'root',
})
export class CommentsImageUploadService implements EditorImageUpload {
  public projectApiService = inject(ProjectApiService);
  public state = inject<RxState<any>>(RxState);

  public imageUploadHandler(blobInfo: {
    filename: () => string;
    blob: () => Blob;
  }): Promise<string> {
    const file = new File([blobInfo.blob()], blobInfo.filename());

    return new Promise((resolve) => {
      resolve('');
      // this.projectApiService
      //   .uploadStoriesMediafiles(
      //     this.state.get('projectId'),
      //     this.state.get('story').ref,
      //     [file]
      //   )
      //   .subscribe((result) => {
      //     resolve(result[0].file);
      //   });
    });
  }
}
