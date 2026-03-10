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
- Todos los módulos bajo `server/` deben iniciar con `import 'server-only';`.

## Flujo recomendado

1. Actualiza `endpoint.json` con los contratos más recientes.
2. Regenera tipos con `pnpm exec openapi-typescript apps/draco/endpoint.json --output apps/draco/server/lib/essenza-openapi-types.ts`.
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
