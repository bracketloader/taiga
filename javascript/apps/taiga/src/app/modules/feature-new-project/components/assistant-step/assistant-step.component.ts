/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProjectAssistantCreation, Story, Workspace } from '@taiga/data';
import { RandomColorService } from '@taiga/ui/services/random-color/random-color.service';
import { OpenAiService } from 'libs/api/src/lib/shared/openai/open-ai.service';

interface StoryList {
  stories: Partial<Story>[];
}

@UntilDestroy()
@Component({
  selector: 'tg-assistant-step',
  templateUrl: './assistant-step.component.html',
  styleUrls: [
    '../../styles/project.shared.css',
    './assistant-step.component.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantStepComponent implements OnInit {
  @Input()
  public selectedWorkspaceId!: ProjectAssistantCreation['workspaceId'];

  @Input()
  public workspaces!: Workspace[];

  @Output()
  public emitCancel = new EventEmitter();

  @Output()
  public emitCreateProject = new EventEmitter();

  public templateProjectForm!: FormGroup;

  public get workspace() {
    return this.templateProjectForm.get('workspace')?.value as Workspace;
  }

  public get stories() {
    return this.templateProjectForm.get('stories')
      ?.value as ProjectAssistantCreation['stories'];
  }

  public get formValue() {
    return this.templateProjectForm.value as {
      workspace: Workspace;
      name: string;
      description: string;
      color: number;
      logo: File;
      stories: Partial<Story>[];
    };
  }

  constructor(
    private fb: FormBuilder,
    private openAiService: OpenAiService,
    private cd: ChangeDetectorRef
  ) {}

  public ngOnInit() {
    this.initForm();
  }

  public initForm() {
    this.templateProjectForm = this.fb.group({
      workspace: [this.selectedWorkspaceId, Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      color: [RandomColorService.randomColorPicker(), Validators.required],
      logo: '',
      stories: [],
    });

    this.templateProjectForm
      .get('workspace')
      ?.setValue(this.getCurrentWorkspace());
  }

  public previousStep() {
    this.templateProjectForm.reset();
    this.emitCancel.next(null);
  }

  public getCurrentWorkspace() {
    return this.workspaces.find(
      (workspace) => workspace.id === this.selectedWorkspaceId
    );
  }

  public initGenerateStories() {
    const description = this.formValue.description;
    const prompt = `
      You are a product manager for an app development startup. You should create the basic user stories to get started in an agile project management app project with the following description: ${description}.
      Please provide a list of user stories required to develop this project.
      The response should be in JSON format where the title should be a short summary and the description should explain the user story in a short paragraph.
      It should use the following structure with no other text:

      {
        "stories": [
          {"title": "", "description": ""},
          {"title": "", "description": ""},
          {"title": "", "description": ""},
          {"title": "", "description": ""},
          {"title": "", "description": ""}
        ]
      }
    `;

    const options = {
      prompt,
      temperature: 0.1,
      max_tokens: 922,
    };

    this.openAiService
      .getDataFromOpenAI(options)
      .pipe(untilDestroyed(this))
      .subscribe((data: string) => {
        const storiesList: StoryList = JSON.parse(data) as StoryList;
        this.templateProjectForm.get('stories')?.setValue(storiesList.stories);
        this.cd.detectChanges();
      });
  }

  public trackByStoryIndex(index: number) {
    return index;
  }

  public createProject() {
    if (this.templateProjectForm.valid) {
      const workspace: Workspace = this.formValue.workspace;
      const formData = {
        workspaceId: workspace.id,
        name: this.formValue.name,
        description: this.formValue.description,
        color: this.formValue.color,
        logo: '',
        stories: this.formValue.stories,
      };
      this.emitCreateProject.next(formData);
    }
  }
}
