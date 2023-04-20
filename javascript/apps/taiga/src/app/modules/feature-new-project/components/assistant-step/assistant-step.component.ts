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
      role: string;
      organization: string;
      type: string;
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
      role: ['', Validators.required],
      organization: ['', Validators.required],
      type: ['', Validators.required],
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

  public generateCard() {
    const role = this.formValue.role;
    const organization = this.formValue.organization;
    const type = this.formValue.type;
    const description = this.formValue.description;
    const stories = this.formValue.stories;
    const prompt = `
      I am a ${role} working in a ${organization} on a ${type} project. I need to ${description} My current project epics are ${stories.join(
      ', '
    )}. Create a new Epic
      The response should be in JSON format. The title should be a short summary and the description should explain the user story in a short paragraph.
      It should use the following structure with no other text:

      {"title": "", "description": ""}
    `;

    const options = {
      prompt,
      temperature: 0.7,
      max_tokens: 1000,
    };

    this.openAiService
      .getDataFromOpenAI(options)
      .pipe(untilDestroyed(this))
      .subscribe((data: string) => {
        const story: Partial<Story> = JSON.parse(data) as Partial<Story>;
        const stories = this.formValue.stories;
        stories.push(story);
        this.templateProjectForm.get('stories')?.setValue(stories);
        this.cd.detectChanges();
      });
  }

  public initGenerateStories() {
    const role = this.formValue.role;
    const organization = this.formValue.organization;
    const type = this.formValue.type;
    const description = this.formValue.description;
    const prompt = `
      I am a ${role} working in a ${organization} on a ${type} project. I need to ${description} Create a list of epics for this project.
      The response should be in JSON format. The title should be a short summary and the description should explain the user story in a short paragraph.
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
      temperature: 0.5,
      max_tokens: 2000,
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

  public removeStory(title: string) {
    const storyList = this.formValue.stories.filter(
      (story) => story.title !== title
    );
    this.templateProjectForm.get('stories')?.setValue(storyList);
    this.cd.detectChanges();
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
