/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProjectAssistantCreation, ProjectCreation } from '@taiga/data';
import { Observable } from 'rxjs';
import {
  createAssistantProject,
  createProject,
} from '~/app/modules/feature-new-project/+state/actions/new-project.actions';
import { Step } from '~/app/modules/feature-new-project/data/new-project.model';
import { fetchWorkspaceList } from '~/app/modules/workspace/feature-list/+state/actions/workspace.actions';
import { selectWorkspaces } from '~/app/modules/workspace/feature-list/+state/selectors/workspace.selectors';
import {
  TemplateProjectForm,
  TemplateStepComponent,
} from '../template-step/template-step.component';

@Component({
  selector: 'tg-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['../../styles/project.shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewProjectComponent implements OnInit {
  @ViewChild(TemplateStepComponent)
  public templateStepComponent?: TemplateStepComponent;

  constructor(private store: Store, private route: ActivatedRoute) {}

  public workspaceList$ = this.store.select(selectWorkspaces);
  public currentStep: Step = 'init';
  public savedForm?: TemplateProjectForm;

  public formData: ProjectCreation = {
    workspaceId: '',
    name: '',
    description: 'string',
    color: 0,
  };

  public ngOnInit() {
    this.store.dispatch(fetchWorkspaceList());
    this.setQueryParamId();
  }

  public canDeactivate(): boolean | Observable<boolean> {
    if (this.currentStep === 'blank' && this.templateStepComponent) {
      return this.templateStepComponent.canDeactivate();
    }
    return true;
  }

  public setQueryParamId() {
    const id = this.route.snapshot.queryParamMap.get('workspace');
    if (id) {
      this.formData.workspaceId = id;
    }
  }

  public onSelectTemplate(
    step: Step,
    workspaceId: ProjectCreation['workspaceId']
  ) {
    this.formData.workspaceId = workspaceId;
    this.setStep(step);
  }

  public createProject(project: ProjectCreation) {
    this.formData = project;
    this.store.dispatch(createProject({ project: this.formData }));
  }

  public createAssistantProject(project: ProjectAssistantCreation) {
    this.store.dispatch(createAssistantProject({ project }));
  }

  public setStep(step: Step) {
    this.currentStep = step;
  }

  public cancelTemplateStep(savedForm?: TemplateProjectForm) {
    this.setStep('init');

    if (savedForm) {
      this.savedForm = savedForm;
    }
  }

  public cancelAssistantStep() {
    this.setStep('init');
  }
}
