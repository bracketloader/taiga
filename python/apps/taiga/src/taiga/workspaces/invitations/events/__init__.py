# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Copyright (c) 2023-present Kaleidos INC

from typing import Iterable

from taiga.events import events_manager
from taiga.workspaces.invitations.events.content import WorkspaceInvitationContent
from taiga.workspaces.invitations.models import WorkspaceInvitation
from taiga.workspaces.workspaces.models import Workspace

CREATE_WORKSPACE_INVITATION = "workspaceinvitations.create"


async def emit_event_when_workspace_invitations_are_created(
    workspace: Workspace,
    invitations: Iterable[WorkspaceInvitation],
) -> None:
    # Publish event on every user channel
    for invitation in filter(lambda i: i.user, invitations):
        await events_manager.publish_on_user_channel(
            user=invitation.user,  # type: ignore[arg-type]
            type=CREATE_WORKSPACE_INVITATION,
            content=WorkspaceInvitationContent(
                workspace=invitation.workspace.b64id,
            ),
        )

    # Publish on the workspace channel
    if invitations:
        await events_manager.publish_on_workspace_channel(
            workspace=workspace,
            type=CREATE_WORKSPACE_INVITATION,
        )
