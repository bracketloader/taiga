# Create feature

A feature is one or more group of componentes and service that can have a state (ngrx).

## Common feature

```bash
npx ng g @schematics/angular:module --name=TodoList --project=taiga --module=commons.module --path=apps/taiga/src/app/commons
```

Open `/apps/taiga/src/app/commons/commons.module.ts` and add the new module to `exports`.

## Page

If the component is the page root we have to add it to pages.module.

```bash
npx ng g @schematics/angular:module --name=TodoList --project=taiga --module=pages.module --path=apps/taiga/src/app/pages --route=todos
```

This will create/update the following files.

```bash
CREATE apps/taiga/src/app/pages/todo-list/todo-list.module.ts
CREATE apps/taiga/src/app/pages/todo-list/todo-list.component.css
CREATE apps/taiga/src/app/pages/todo-list/todo-list.component.html
CREATE apps/taiga/src/app/pages/todo-list/todo-list.component.spec.ts
CREATE apps/taiga/src/app/pages/todo-list/todo-list.component.ts
UPDATE apps/taiga/src/app/pages/pages.module.ts
```

### Add an state

```bash
npx ng g @ngrx/schematics:feature TodoList --module=todo-list.module.ts --project=taiga --path=apps/taiga/src/app/pages/todo-list --group --no-interactive
```

This will create/update the following files.

```bash
CREATE apps/taiga/src/app/pages/todo-list/actions/todo-list.actions.spec.ts
CREATE apps/taiga/src/app/pages/todo-list/actions/todo-list.actions.ts
CREATE apps/taiga/src/app/pages/todo-list/reducers/todo-list.reducer.spec.ts
CREATE apps/taiga/src/app/pages/todo-list/reducers/todo-list.reducer.ts
CREATE apps/taiga/src/app/pages/todo-list/effects/todo-list.effects.spec.ts
CREATE apps/taiga/src/app/pages/todo-list/effects/todo-list.effects.ts
CREATE apps/taiga/src/app/pages/todo-list/selectors/todo-list.selectors.spec.ts
CREATE apps/taiga/src/app/pages/todo-list/selectors/todo-list.selectors.ts
UPDATE apps/taiga/src/app/pages/todo-list/todo-list.module.ts
```

### Create a feature submodule

If your feature complex enough rememember to create new modules inside the feature.

For example: 

```bash
npx ng g @schematics/angular:module --name=TodoListConfig --project=taiga --module=todo-list.module --path=apps/taiga/src/app/pages/todo-list --route=config
```

This will create/update the following files.

```bash
CREATE apps/taiga/src/app/pages/todo-list/todo-list-config/todo-list-config.module.ts
CREATE apps/taiga/src/app/pages/todo-list/todo-list-config/todo-list-config.component.css
CREATE apps/taiga/src/app/pages/todo-list/todo-list-config/todo-list-config.component.html
CREATE apps/taiga/src/app/pages/todo-list/todo-list-config/todo-list-config.component.spec.ts
CREATE apps/taiga/src/app/pages/todo-list/todo-list-config/todo-list-config.component.ts
UPDATE apps/taiga/src/app/pages/todo-list/todo-list.module.ts
```

### Testing selectors

https://ngrx.io/guide/store/testing#testing-selectors

### Testing reducers

https://ngrx.io/guide/store/testing#testing-reducers