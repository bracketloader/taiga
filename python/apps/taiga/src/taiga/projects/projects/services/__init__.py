# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Copyright (c) 2021-present Kaleidos Ventures SL
from functools import partial

from fastapi import UploadFile
from taiga.base.db.models import File
from taiga.base.utils.images import get_thumbnail_url
from taiga.conf import settings
from taiga.permissions import services as permissions_services
from taiga.projects.invitations import repositories as pj_invitations_repositories
from taiga.projects.memberships import repositories as pj_memberships_repositories
from taiga.projects.projects import events as projects_events
from taiga.projects.projects import repositories as projects_repositories
from taiga.projects.projects.models import Project
from taiga.projects.projects.services import exceptions as ex
from taiga.projects.roles import repositories as pj_roles_repositories
from taiga.users.models import AnyUser, User
from taiga.workspaces.roles import repositories as ws_roles_repositories
from taiga.workspaces.workspaces import repositories as workspaces_repositories
from taiga.workspaces.workspaces.models import Workspace


async def get_projects(workspace_slug: str) -> list[Project]:
    return await projects_repositories.get_projects(workspace_slug=workspace_slug)


async def get_workspace_projects_for_user(workspace: Workspace, user: User) -> list[Project]:
    role = await ws_roles_repositories.get_workspace_role_for_user(user_id=user.id, workspace_id=workspace.id)
    if role and role.is_admin:
        return await get_projects(workspace_slug=workspace.slug)

    return await projects_repositories.get_workspace_projects_for_user(workspace_id=workspace.id, user_id=user.id)


async def get_workspace_invited_projects_for_user(workspace: Workspace, user: User) -> list[Project]:
    return await projects_repositories.get_workspace_invited_projects_for_user(
        workspace_id=workspace.id, user_id=user.id
    )


async def create_project(
    workspace: Workspace,
    name: str,
    description: str | None,
    color: int | None,
    owner: User,
    logo: UploadFile | None = None,
) -> Project:
    logo_file = None
    if logo:
        logo_file = File(file=logo.file, name=logo.filename)

    project = await projects_repositories.create_project(
        workspace=workspace, name=name, description=description, color=color, owner=owner, logo=logo_file
    )

    template = await projects_repositories.get_template(slug=settings.DEFAULT_PROJECT_TEMPLATE)
    await projects_repositories.apply_template_to_project(template=template, project=project)

    # assign the owner to the project as the default owner role (should be 'admin')
    owner_role = await pj_roles_repositories.get_project_role(project=project, slug=template.default_owner_role)
    if not owner_role:
        owner_role = await pj_roles_repositories.get_first_role(project=project)

    await pj_memberships_repositories.create_project_membership(user=owner, project=project, role=owner_role)

    return project


async def get_project(slug: str) -> Project | None:
    return await projects_repositories.get_project(slug=slug)


async def get_project_detail(project: Project, user: AnyUser) -> Project:
    # TODO: This function needs to be refactored. A Project model object is modified by adding new attributes.
    #       This should be done with a dataclass (for example) that clearly defines and types the content.
    (
        is_project_admin,
        is_project_member,
        project_role_permissions,
    ) = await permissions_services.get_user_project_role_info(user=user, project=project)
    (is_workspace_admin, is_workspace_member, _) = await permissions_services.get_user_workspace_role_info(
        user=user, workspace=project.workspace
    )
    project.workspace = await workspaces_repositories.get_workspace_summary(id=project.workspace.id, user_id=user.id)

    # User related fields
    project.user_permissions = (  # type: ignore[attr-defined]
        await permissions_services.get_user_permissions_for_project(
            is_project_admin=is_project_admin,
            is_workspace_admin=is_workspace_admin,
            is_project_member=is_project_member,
            is_workspace_member=is_workspace_member,
            is_authenticated=user.is_authenticated,
            project_role_permissions=project_role_permissions,
            project=project,
        )
    )

    project.user_is_admin = is_project_admin  # type: ignore[attr-defined]
    project.user_is_member = await pj_memberships_repositories.user_is_project_member(  # type: ignore[attr-defined]
        project.slug, user.id
    )
    project.user_has_pending_invitation = (  # type: ignore[attr-defined]
        False
        if user.is_anonymous
        else await (pj_invitations_repositories.has_pending_project_invitation_for_user(user=user, project=project))
    )

    return project


async def get_logo_thumbnail_url(thumbnailer_size: str, logo_relative_path: str) -> str | None:
    if logo_relative_path:
        return await get_thumbnail_url(logo_relative_path, thumbnailer_size)
    return None


get_logo_small_thumbnail_url = partial(get_logo_thumbnail_url, settings.IMAGES.THUMBNAIL_PROJECT_LOGO_SMALL)
get_logo_large_thumbnail_url = partial(get_logo_thumbnail_url, settings.IMAGES.THUMBNAIL_PROJECT_LOGO_LARGE)


async def update_project_public_permissions(project: Project, permissions: list[str]) -> list[str]:
    if not permissions_services.permissions_are_valid(permissions):
        raise ex.NotValidPermissionsSetError("One or more permissions are not valid. Maybe, there is a typo.")

    if not permissions_services.permissions_are_compatible(permissions):
        raise ex.IncompatiblePermissionsSetError("Given permissions are incompatible")

    project_public_permissions = await projects_repositories.update_project_public_permissions(
        project=project, permissions=permissions
    )

    # TODO: emit an event to users/project with the new permissions when a change happens?
    await projects_events.emit_event_when_project_permissions_are_updated(project=project)

    return project_public_permissions


async def update_project_workspace_member_permissions(project: Project, permissions: list[str]) -> list[str]:
    if not permissions_services.permissions_are_valid(permissions):
        raise ex.NotValidPermissionsSetError("One or more permissions are not valid. Maybe, there is a typo.")

    if not permissions_services.permissions_are_compatible(permissions):
        raise ex.IncompatiblePermissionsSetError("Given permissions are incompatible")

    if not await projects_repositories.project_is_in_premium_workspace(project):
        raise ex.NotPremiumWorkspaceError("The workspace is not a premium one, so these perms cannot be set")

    workspace_permissions = await projects_repositories.update_project_workspace_member_permissions(
        project=project, permissions=permissions
    )

    await projects_events.emit_event_when_project_permissions_are_updated(project=project)

    return workspace_permissions


async def get_workspace_member_permissions(project: Project) -> list[str]:
    if not await projects_repositories.project_is_in_premium_workspace(project):
        raise ex.NotPremiumWorkspaceError("The workspace is not a premium one, so these perms cannot be seen")

    return project.workspace_member_permissions or []