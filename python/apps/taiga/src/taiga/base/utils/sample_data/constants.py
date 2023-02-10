# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Copyright (c) 2021-present Kaleidos Ventures SL


################################
# CONSTANTS
################################

# Users
NUM_USER_COLORS = 8

# Workspaces
NUM_WORKSPACE_COLORS = 8

# Projects
NUM_PROJECT_COLORS = 8

# Stories
STORY_TITLE_MAX_SIZE = ((80,) * 3) + ((120,) * 6) + (490,)  # 80 (30%), 120 (60%), 490 (10%)
NUM_STORIES_PER_WORKFLOW = (0, 30)  # (min, max) by default
PROB_STORY_ASSIGNMENTS = {  # 0-99 prob of a story to be assigned by its workflow status
    "new": 10,
    "ready": 40,
    "in-progress": 80,
    "done": 95,
}
PROB_STORY_ASSIGNMENTS_DEFAULT = 25
