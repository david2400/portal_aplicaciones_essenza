import {DynamicFormSchema} from '@/types/formSchema';

export const categoryFinderSchema: DynamicFormSchema = {
  session_id: '181310961-list_omnichannel-37a87f876ece',
  events: [
    {
      type: 'register_and_render',
      data: {
        brick: {
          id: 'category_step',
          ui_type: 'page_desktop',
          data: {
            metrics: {
              path: '/sell/omni',
              flow: 'list_omnichannel',
              sessionId: '181310961-list_omnichannel-37a87f876ece',
              channels: ['marketplace'],
              form: 'category_form',
            },
          },
          bricks: [
            {
              id: 'detail-container',
              ui_type: 'container',
              data: {},
              bricks: [
                {
                  id: 'page_header',
                  ui_type: 'page_header',
                  data: {
                    subtitle: 'Paso 1 de 3',
                    title: 'Para publicar más rápido, busquemos tu producto en nuestro catálogo',
                    imageLink:
                      'https://http2.mlstatic.com/frontend-assets/sell-list-core-front-end/notebook-v2.svg',
                    leftLink: {
                      title: 'Anterior',
                      href: 'https://www.mercadolibre.com.co/publicar/bomni/hub',
                    },
                  },
                  bricks: [],
                },
                {
                  id: 'category_finder_task',
                  ui_type: 'task_container',
                  data: {
                    collapsible: false,
                    metrics: {
                      path: '/category_finder',
                    },
                    events: [
                      {
                        type: 'close_cost_simulator',
                        data: {},
                      },
                    ],
                    isOpen: true,
                  },
                  bricks: [
                    {
                      id: 'search_hub',
                      ui_type: 'search_hub',
                      data: {
                        searchHub: [
                          {
                            boxTitle: 'Por palabras clave',
                            finderHubHeader: {
                              title: 'Escribe la marca, modelo y características del producto',
                              subtitle:
                                'Cuanto más detalle sumes, mejores serán los resultados para encontrar tu producto.',
                            },
                            finderBar: {
                              placeholder: 'Ej.: Celular Samsung Galaxy A56 5g 256gb 8gb Ram Gris',
                              maxLength: 1000,
                              finderId: 'keywords',
                            },
                            event: {
                              type: 'request',
                              data: {
                                method: 'PATCH',
                                path: 'list/181310961-list_omnichannel-37a87f876ece/category_form/category-finder',
                                loadingEvents: [],
                                errorEvents: [],
                                queryParams: [],
                                pathParams: [],
                                bodyParams: [],
                                headers: [
                                  {
                                    key: 'Authorization',
                                    value:
                                      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXRoIjoibGlzdC8xODEzMTA5NjEtbGlzdF9vbW5pY2hhbm5lbC0zN2E4N2Y4NzZlY2UvY2F0ZWdvcnlfZm9ybS9jYXRlZ29yeS1maW5kZXIiLCJzYWx0IjoiOVNyQ0JhdTZ0ZS9xemlRNldQemhlQT09IiwibWV0aG9kIjoiUEFUQ0gifQ.31BPYoUK9tEYmBq4xX1FGkY6xs81m4mPe4odImjKVYg',
                                  },
                                ],
                                body: {
                                  automaticFilterSelection: true,
                                },
                              },
                            },
                            type: 'keywords',
                          },
                          {
                            boxTitle: 'Por fotos',
                            tag: 'NUEVO',
                            finderHubHeader: {
                              title: 'Sube la mejor foto que tengas',
                              subtitle:
                                'Vamos a usarla para reconocer tu producto y completar por ti los datos que podamos. Podrás revisarlos después.',
                            },
                            searchByPictureComponentData: {
                              requirements:
                                'En formato JPG, JPEG, PNG o WEBP, resolución mínima 500x500 y peso máximo de 10 MB.',
                              dimensions: {
                                width: [50, 2147483647],
                                height: [50, 2147483647],
                              },
                              errorMessage: 'no se pudo subir.',
                              emptyErrorMessage: 'Para continuar, sube al menos una foto del producto.',
                              maxFileSize: '10000KB',
                              extensions: ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'],
                              moderationGlobalMessageData: [],
                              validationsErrorBeforeUpload: {
                                extension: 'no tiene formato jpg, jpeg, png o webp.',
                                maxSize: 'es demasiado grande, supera los 10 MB de peso.',
                                small: 'es muy pequeña. Asegúrate de que tenga más de 500 píxeles en alguno de sus lados.',
                                default: 'Ocurrió un error procesando la foto. Por favor cárgala nuevamente.',
                                large: 'demasiado grande, supera los 1920 píxeles por lado.',
                              },
                              propertiesPhotoStudio: {},
                              disabled: false,
                              isUploadRequired: true,
                              generativeFlowOn: false,
                              inactiveProduct: false,
                            },
                            event: {
                              type: 'request',
                              data: {
                                method: 'PATCH',
                                path: 'list/181310961-list_omnichannel-37a87f876ece/category_form/search-by-picture',
                                loadingEvents: [],
                                errorEvents: [],
                                queryParams: [],
                                pathParams: [],
                                bodyParams: [],
                                headers: [
                                  {
                                    key: 'Authorization',
                                    value:
                                      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXRoIjoibGlzdC8xODEzMTA5NjEtbGlzdF9vbW5pY2hhbm5lbC0zN2E4N2Y4NzZlY2UvY2F0ZWdvcnlfZm9ybS9zZWFyY2gtYnktcGljdHVyZSIsInNhbHQiOiJQV3E2UldkdVlidjZBUmgwckp1V3lRPT0iLCJtZXRob2QiOiJQQVRDSCJ9.e6c0XMOimyvz6alyw5-dC8Y1LglhTpBSrQve_i4vvt8',
                                  },
                                ],
                              },
                            },
                            type: 'photos',
                          },
                          {
                            boxTitle: 'Por código universal',
                            finderHubHeader: {
                              title: 'Ingresa el código universal, que encuentras junto al código de barras del producto',
                              subtitle:
                                'Es un número de 8 a 14 dígitos que nos ayuda a identificar exactamente lo que vendes para completar por ti todos tus datos.',
                            },
                            modalData: {
                              titleCloseModal:
                                'Puedes encontrar el código en la caja o etiqueta, junto al código de barras.',
                              modalLink: 'Conoce más sobre el código universal',
                              titleOpenModal: '¿Cómo encontrar el código universal de tu producto?',
                              content: [
                                {
                                  title: 'Búscalo junto al código de barras',
                                  img: 'https://http2.mlstatic.com/frontend-assets/syi-frontend-core/gtin_universal_code_modal.svg',
                                  description:
                                    'Tiene entre 8 y 14 dígitos, sin letras, excepto en autopartes. Este número es único, no uses el mismo código para diferentes productos.',
                                },
                                {
                                  title: 'Contacta al distribuidor si no lo encuentras',
                                  img: 'https://http2.mlstatic.com/frontend-assets/syi-frontend-core/comments_modal.svg',
                                  description:
                                    'Si tu producto es artesanal o viene sin código, puedes especificar la razón por la que no lo tiene para continuar.',
                                },
                                {
                                  title: 'Evita perder exposición y calidad',
                                  img: 'https://http2.mlstatic.com/frontend-assets/syi-frontend-core/universal_code_list.svg',
                                  description:
                                    'Las publicaciones con el código universal incorrecto o incompleto perderán exposición y calidad, y podrán ser pausadas.',
                                },
                              ],
                            },
                            finderBar: {
                              placeholder: 'Ej.: 887276246529',
                              maxLength: 1000,
                              finderId: 'universal_code',
                            },
                            event: {
                              type: 'request',
                              data: {
                                method: 'PATCH',
                                path: 'list/181310961-list_omnichannel-37a87f876ece/category_form/category-finder',
                                loadingEvents: [],
                                errorEvents: [],
                                queryParams: [],
                                pathParams: [],
                                bodyParams: [],
                                headers: [
                                  {
                                    key: 'Authorization',
                                    value:
                                      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXRoIjoibGlzdC8xODEzMTA5NjEtbGlzdF9vbW5pY2hhbm5lbC0zN2E4N2Y4NzZlY2UvY2F0ZWdvcnlfZm9ybS9jYXRlZ29yeS1maW5kZXIiLCJzYWx0IjoibFdnak40ZDllUU5hTWd1T3IyZ0svZz09IiwibWV0aG9kIjoiUEFUQ0gifQ.m7Gvterq_ejj7jx6XzydGqhFeuESnMp_zOpi42YXuj4',
                                  },
                                ],
                                body: {
                                  automaticFilterSelection: true,
                                },
                              },
                            },
                            type: 'universal_code',
                          },
                        ],
                        footerButton: {
                          label: 'Buscar',
                          loadingLabel: 'Buscando',
                          disabled: false,
                        },
                        apiCallToPredictionSearchEndpointEvent: {
                          type: 'request',
                          data: {
                            method: 'POST',
                            path: 'list/api/prediction_search/',
                            loadingEvents: [],
                            errorEvents: [],
                            queryParams: [],
                            pathParams: [],
                            bodyParams: [],
                            headers: [
                              {
                                key: 'Authorization',
                                value:
                                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXRoIjoibGlzdC9hcGkvcHJlZGljdGlvbl9zZWFyY2gvIiwic2FsdCI6IlRPYTFiQ0o3aWhtNFI2L3FJNVFEaUE9PSIsIm1ldGhvZCI6IlBPU1QifQ.3NBsbJQ0eLEIXTkb32HPU5_DJP1aeoRuIHFf8ppr1Yk',
                              },
                            ],
                            body: {},
                          },
                        },
                      },
                      bricks: [],
                    },
                    {
                      id: 'steps_overview',
                      ui_type: 'stepper',
                      data: {
                        title: 'Tu proceso de publicación',
                        subtitle: 'Seguimos estos pasos para ayudarte a publicar rápidamente.',
                        steps: [
                          {
                            label: 'Describe tu producto',
                            description: 'Buscamos en el catálogo por palabras clave, fotos o código.',
                            status: 'current',
                          },
                          {
                            label: 'Confirma los datos',
                            description: 'Revisa y edita los atributos que detectemos automáticamente.',
                            status: 'upcoming',
                          },
                          {
                            label: 'Publica y configura envíos',
                            description: 'Define costos, stock y activa tu publicación.',
                            status: 'upcoming',
                          },
                        ],
                      },
                      bricks: [
                        {
                          id: 'step_describe_content',
                          ui_type: 'container',
                          data: {},
                          bricks: [
                            {
                              id: 'step_describe_header',
                              ui_type: 'page_header',
                              data: {
                                title: 'Describe tu producto',
                                subtitle:
                                  'Añade palabras clave y sube fotos para que podamos encontrar coincidencias exactas.',
                              },
                            },
                            {
                              id: 'step_describe_summary',
                              ui_type: 'summary',
                              data: {
                                items: [
                                  {
                                    label: 'Palabras clave sugeridas',
                                    value: 'Celular Samsung Galaxy A56 5g 256gb',
                                    helperText: 'Edita los términos para refinar la búsqueda.',
                                  },
                                  {
                                    label: 'Estado de tus fotos',
                                    value: 'Aún no has agregado imágenes.',
                                    helperText: 'Sube hasta 6 fotos con buena iluminación.',
                                  },
                                ],
                              },
                            },
                          ],
                        },
                        {
                          id: 'step_confirm_content',
                          ui_type: 'container',
                          data: {},
                          bricks: [
                            {
                              id: 'step_confirm_header',
                              ui_type: 'page_header',
                              data: {
                                title: 'Confirma los datos detectados',
                                subtitle:
                                  'Revisa la categoría sugerida y completa los atributos obligatorios antes de continuar.',
                              },
                            },
                            {
                              id: 'step_confirm_summary',
                              ui_type: 'summary',
                              data: {
                                items: [
                                  {
                                    label: 'Categoría sugerida',
                                    value: 'Celulares y Teléfonos > Smartphones',
                                    helperText: 'Puedes modificarla si no corresponde.',
                                  },
                                  {
                                    label: 'Atributos pendientes',
                                    value: 'Marca, Modelo, Capacidad, Color',
                                    helperText: 'Completa los datos faltantes para mejorar tus resultados.',
                                  },
                                ],
                              },
                            },
                          ],
                        },
                        {
                          id: 'step_publish_content',
                          ui_type: 'container',
                          data: {},
                          bricks: [
                            {
                              id: 'step_publish_header',
                              ui_type: 'page_header',
                              data: {
                                title: 'Publica y configura envíos',
                                subtitle:
                                  'Define precios, stock y métodos de envío para finalizar tu publicación.',
                              },
                            },
                            {
                              id: 'step_publish_summary',
                              ui_type: 'summary',
                              data: {
                                items: [
                                  {
                                    label: 'Precio sugerido',
                                    value: '$1.500.000 COP',
                                    helperText: 'Basado en publicaciones similares.',
                                  },
                                  {
                                    label: 'Métodos de entrega',
                                    value: 'Envío Full habilitado',
                                    helperText: 'Puedes ofrecer retiro en tienda o envío particular.',
                                  },
                                ],
                                ctaLabel: 'Configurar publicación',
                                ctaEvent: {
                                  type: 'request',
                                  data: {
                                    method: 'POST',
                                    path: 'list/api/publish_demo/',
                                    loadingEvents: ['publish_loading'],
                                    errorEvents: ['publish_failed'],
                                    queryParams: [],
                                    pathParams: [],
                                    bodyParams: [],
                                    headers: [
                                      {
                                        key: 'Authorization',
                                        value: 'Bearer demo-token',
                                      },
                                    ],
                                    body: {
                                      source: 'category_finder_demo',
                                    },
                                  },
                                },
                              },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      id: 'category_summary',
                      ui_type: 'summary',
                      data: {
                        title: 'Resumen de tu búsqueda',
                        subtitle: 'Completa una búsqueda para ver sugerencias y categorías recomendadas.',
                        items: [
                          {
                            id: 'keywords_value',
                            label: 'Última búsqueda por palabras',
                            value: 'Celular Samsung Galaxy A56 5g 256gb',
                            helperText: 'Actualiza tus términos cuando quieras para descubrir coincidencias nuevas.',
                            icon: '🔤',
                          },
                          {
                            id: 'photos_value',
                            label: 'Fotos subidas',
                            value: 'Aún no subiste fotos',
                            helperText: 'Sube hasta 6 imágenes nítidas para mejorar la precisión.',
                            icon: '📷',
                          },
                          {
                            id: 'universal_code_value',
                            label: 'Código universal',
                            value: 'Sin código',
                            helperText: 'Si no lo tienes, te ayudamos igual a categorizar tu producto.',
                            icon: '🆔',
                          },
                        ],
                        ctaLabel: 'Ver coincidencias recomendadas',
                        ctaEvent: {
                          type: 'request',
                          data: {
                            method: 'POST',
                            path: 'list/api/recommendations/',
                            loadingEvents: ['recommendations_loading'],
                            errorEvents: ['recommendations_failed'],
                            queryParams: [],
                            pathParams: [],
                            bodyParams: [],
                            headers: [
                              {
                                key: 'Authorization',
                                value:
                                  'Bearer demo-token',
                              },
                            ],
                            body: {
                              source: 'category_finder_demo',
                            },
                          },
                        },
                      },
                    },
                    {
                      id: 'help_modal',
                      ui_type: 'modal',
                      data: {
                        title: '¿Necesitas ayuda para elegir la categoría?',
                        description:
                          'Conoce tips rápidos para encontrar la mejor coincidencia y mejorar la visibilidad de tu publicación.',
                        triggerLabel: 'Ver consejos',
                        confirmLabel: 'Entendido',
                        cancelLabel: 'Cerrar',
                      },
                      bricks: [
                        {
                          id: 'modal_content',
                          ui_type: 'container',
                          data: {},
                          bricks: [
                            {
                              id: 'modal_tip_header',
                              ui_type: 'page_header',
                              data: {
                                title: 'Mejores prácticas para tu búsqueda',
                                subtitle: 'Optimiza los resultados para llegar a la categoría exacta.',
                              },
                            },
                            {
                              id: 'modal_tip_summary',
                              ui_type: 'summary',
                              data: {
                                items: [
                                  {
                                    label: 'Añade detalles clave',
                                    value: 'Marca, modelo, características principales y color.',
                                  },
                                  {
                                    label: 'Sube fotos nítidas',
                                    value: 'Utiliza fondos claros y buena iluminación.',
                                  },
                                  {
                                    label: 'Verifica el código universal',
                                    value: 'Si lo tienes, nos ayuda a precargar datos exactos.',
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
  ],
};
