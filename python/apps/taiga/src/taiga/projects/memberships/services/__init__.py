# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Copyright (c) 2021-present Kaleidos Ventures SL

from uuid import UUID

from taiga.base.api.pagination import Pagination
from taiga.permissions import services as permissions_services
from taiga.projects.memberships import events as memberships_events
from taiga.projects.memberships import repositories as memberships_repositories
from taiga.projects.memberships.models import ProjectMembership
from taiga.projects.memberships.services import exceptions as ex
from taiga.projects.projects.models import Project
from taiga.projects.roles import repositories as pj_roles_repositories
from taiga.projects.roles.models import ProjectRole
from taiga.stories.assignments import repositories as story_assignments_repositories


async def get_paginated_project_memberships(
    project: Project, offset: int, limit: int
) -> tuple[Pagination, list[ProjectMembership]]:
    memberships = await memberships_repositories.get_project_memberships(
        filters={"project_id": project.id}, offset=offset, limit=limit
    )
    total_memberships = await memberships_repositories.get_total_project_memberships(filters={"project_id": project.id})

    pagination = Pagination(offset=offset, limit=limit, total=total_memberships)

    return pagination, memberships


async def get_project_membership(project_id: UUID, username: str) -> ProjectMembership:
    return await memberships_repositories.get_project_membership(
        filters={"project_id": project_id, "username": username}
    )


async def _is_membership_the_only_admin(membership_role: ProjectRole, project_role: ProjectRole) -> bool:
    if membership_role.is_admin and not project_role.is_admin:
        num_admins = await memberships_repositories.get_total_project_memberships(
            filters={"role_id": membership_role.id}
        )
        return True if num_admins == 1 else False
    else:
        return False


async def update_project_membership(membership: ProjectMembership, role_slug: str) -> ProjectMembership:
    project_role = await (
        pj_roles_repositories.get_project_role(filters={"project_id": membership.project_id, "slug": role_slug})
    )

    if not project_role:
        raise ex.NonExistingRoleError("Role does not exist")

    if await _is_membership_the_only_admin(membership_role=membership.role, project_role=project_role):
        raise ex.MembershipIsTheOnlyAdminError("Membership is the only admin")

    # Check if new role has view_story permission
    view_story_is_deleted = False
    if membership.role.permissions:
        view_story_is_deleted = await permissions_services.is_view_story_permission_deleted(
            old_permissions=membership.role.permissions, new_permissions=project_role.permissions
        )

    membership.role = project_role
    updated_membership = await memberships_repositories.update_project_membership(membership=membership)

    await memberships_events.emit_event_when_project_membership_is_updated(membership=updated_membership)

    # Unassign stories for user if the new role doesn't have view_story permission
    if view_story_is_deleted:
        await story_assignments_repositories.delete_story_assignment(
            filters={"project_id": membership.project_id, "username": membership.user.username}
        )

    return updated_membership


# TODO: when there is a delete_project_membership service, we have to unassign stories too
