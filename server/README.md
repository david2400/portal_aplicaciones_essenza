# Server Data Access Layer

Capa de acceso a datos server-side optimizada para **Next.js 15 Server Components**, replicando la arquitectura usada en `kleverkid/apps/draco/server` pero alimentada por la spec `endpoint.json` de Essenza.

## Arquitectura

```
server/
├── lib/                          # Infraestructura compartida
│   ├── env.ts                    # Variables de entorno (server-only)
│   ├── server-fetch.ts           # HTTP client con native fetch + Next.js cache
│   ├── cache-tags.ts             # Tags centralizados para revalidación on-demand
│   ├── essenza-openapi-types.ts  # Tipos generados desde endpoint.json
│   └── index.ts                  # Barrel export
│
├── domains/                      # Separación por dominio (tags OpenAPI)
│   ├── shipping-logistics/
│   │   ├── types.ts              # Tipos específicos del dominio
│   │   ├── repository.ts         # Acceso a datos + cache tags
│   │   ├── queries.ts            # Funciones cacheadas (React.cache)
│   │   ├── actions.ts            # Server Actions ('use server')
│   │   └── index.ts              # Barrel export del dominio
│   └── ...                       # Resto de tags del endpoint.json
│
└── index.ts                      # Export principal (server fetch, env, tags, etc.)
```

## Convenciones Essenza

- **snake_case** para nombres de funciones/constantes públicas dentro de `domains/*`.
- **Tags = dominios**: cada `tag` del OpenAPI genera un subdirectorio en `domains/`.
- **Cache tags** siguen el patrón `dominio:entidad[:id]` para soportar revalidación selectiva.
- **Tipos**: se reutilizan los generados por `openapi-typescript` (`lib/essenza-openapi-types.ts`).
- **Contrato en snake_case**: el API (JSON, Swagger y `field_errors`) usa snake_case, y los modelos, esquemas y
  campos de formulario del panel usan exactamente esos nombres (`unit_price`, `sku_id`). Las excepciones son los
  parámetros de URL (`@RequestParam`, p. ej. `carrierId`) y los campos de orden (`sort=unitPrice`), que el backend
  recibe con el nombre Java. Las props de componentes, variables y claves i18n siguen en camelCase
  (`fieldKey("guide_number")` → `fields.guideNumber`).
- Todos los módulos bajo `server/` deben iniciar con `import 'server-only';`.

## Flujo recomendado

1. Con el backend arrancado, descarga la spec: `curl http://localhost:8083/v3/api-docs -o endpoint.json`.
2. Regenera tipos (desde `apps/essenza-tienda-virtual`): `pnpm dlx openapi-typescript@7 endpoint.json --output server/lib/essenza-openapi-types.ts`.
   No edites el archivo generado a mano: `pnpm check-types` señala lo que haya que ajustar.
3. Implementa/actualiza el dominio correspondiente (tipos, repositorios, queries, actions).
4. Consume queries/actions desde Server Components o Client Components (vía Server Actions) según corresponda.

## Ejemplo

```tsx
import { get_tracking_by_id } from '@/server/domains/shipping-logistics';

export default async function TrackingDetailPage({ params }: { params: { id: string } }) {
  const tracking = await get_tracking_by_id({ id: Number(params.id) });
  return <TrackingDetail data={tracking} />;
}
```

```tsx
'use client';

import { update_dispatch_detail_action } from '@/server/domains/shipping-logistics';

export function UpdateDispatchDetailForm({ id }: { id: number }) {
  async function handleSubmit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    await update_dispatch_detail_action({ id, ...payload });
  }

  return <form action={handleSubmit}>...</form>;
}
```
