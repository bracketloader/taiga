# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Copyright (c) 2021-present Kaleidos Ventures SL

import pytest
from taiga.workflows import repositories
from tests.utils import factories as f

pytestmark = pytest.mark.django_db


##########################################################
# get_project_workflows
##########################################################


async def test_get_project_workflows_ok() -> None:
    project = await f.create_project()

    workflows = await repositories.get_project_workflows(project_slug=project.slug)

    assert len(workflows) == 1
    assert len(workflows[0].statuses) == 4


async def test_get_project_without_workflows_ok() -> None:
    project = await f.create_simple_project()

    workflows = await repositories.get_project_workflows(project_slug=project.slug)

    assert len(workflows) == 0