# Manage API urls

## Trailing slash

The API v2 is configured to be served **without trailing slash**.

## Nesting urls

Endpoint's urls may be nested up to the first ancestor. Project is considered with enough autonomy to be a first level.

Examples for workspaces:

POST /workspaces
GET, PATCH, DELETE /workspaces/<ws_id>
LIST /workspaces/<ws_id>/projects
LIST /workspaces/<ws_id>/memberships

Examples for projects:

POST /projects
GET, PATCH, DELETE /projects/<pj_id>
LIST /projects/<pj_id>/memberships
POST, LIST  /projects/<pj_id>/invitations
PATCH, DELETE /projects/<pj_id>/memberships/<username>
GET /projects/<pj_id>/workflows

Examples for stories:

POST, LIST /projects/<pj_id>/workflows/<wf_slug>/stories
GET, PATCH, DELETE /projects/<pj_id>/stories/<ref>
POST /projects/<pj_id>/stories/<ref>/assignments
DELETE /projects/<pj_id>/stories/<ref>/assignments/<username>

## Routes

In `routers/routes.py` we can find the first and some important second level of the urls; the rest of the url is defined in each api entry. For example:

```python
# routes.py
workspaces = AuthAPIRouter(prefix="/workspaces", tags=["workspaces"])
workspaces_invitations = AuthAPIRouter(tags=["workspaces invitations"])
workspaces_memberships = AuthAPIRouter(tags=["workspaces memberships"])
projects = AuthAPIRouter(tags=["projects"])
projects_invitations = AuthAPIRouter(tags=["projects invitations"])
projects_memberships = AuthAPIRouter(tags=["projects memberships"])

# projects/api.py
@routes.workspaces.get("/workspaces/{workspace_id}/projects")
@routes.projects.get("/projects/{id}")

# projects/memberships/api.py
@routes.projects_memberships.get("/projects/{id}/memberships")

```
