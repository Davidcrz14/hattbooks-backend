export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'HattBooks API',
    version: '1.0.0',
    description: `
# HattBooks API

API REST para **HattBooks** - Plataforma de lectura social gamificada.

## Características

- Autenticación con Auth0
- Perfiles de usuario y seguimiento social
- Gestión de biblioteca personal
- Sistema de reseñas y calificaciones
- Citas y anotaciones de libros
- Sistema de logros y gamificación
- Estadísticas de lectura

## Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT de Auth0.

Incluye el token en el header:
\`\`\`
Authorization: Bearer <tu_token_jwt>
\`\`\`

## Formato de Respuestas

### Respuesta Exitosa
\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
\`\`\`

### Respuesta de Error
\`\`\`json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": 400,
    "details": { ... }
  }
}
\`\`\`
    `,
    contact: {
      name: 'HattBooks Team',
      url: 'https://hattbooks.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Development server',
    },
    {
      url: 'https://api.hattbooks.com/api',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Endpoints de autenticación con Auth0',
    },
    {
      name: 'Health',
      description: 'Health check del servidor',
    },
  ],
  paths: {
    '/auth/register-local': {
      post: {
        tags: ['Authentication'],
        summary: 'Registro con email y contraseña',
        description: 'Crea una nueva cuenta de usuario con autenticación tradicional (email/password)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'username', 'displayName', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john@example.com',
                  },
                  username: {
                    type: 'string',
                    minLength: 3,
                    maxLength: 30,
                    example: 'johndoe',
                  },
                  displayName: {
                    type: 'string',
                    example: 'John Doe',
                  },
                  password: {
                    type: 'string',
                    minLength: 8,
                    example: 'SecurePass123!',
                    description: 'Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números',
                  },
                  avatar: {
                    type: 'string',
                    format: 'uri',
                    example: 'https://example.com/avatar.jpg',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuario registrado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: {
                          type: 'string',
                          description: 'JWT token para autenticación',
                          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        },
                        message: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/auth/login-local': {
      post: {
        tags: ['Authentication'],
        summary: 'Login con email y contraseña',
        description: 'Autentica un usuario con email y contraseña tradicional',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john@example.com',
                  },
                  password: {
                    type: 'string',
                    example: 'SecurePass123!',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login exitoso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: {
                          type: 'string',
                          description: 'JWT token para autenticación',
                        },
                        message: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health Check',
        description: 'Verifica que el servidor esté funcionando correctamente',
        responses: {
          200: {
            description: 'Servidor funcionando correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'HattBooks API is running' },
                    timestamp: { type: 'string', format: 'date-time' },
                    environment: { type: 'string', example: 'development' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Registrar nuevo usuario',
        description: 'Crea una nueva cuenta de usuario después de la autenticación con Auth0',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['auth0Id', 'email', 'username', 'displayName'],
                properties: {
                  auth0Id: {
                    type: 'string',
                    description: 'Auth0 user ID (sub claim)',
                    example: 'auth0|123456789',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'Email del usuario',
                    example: 'john.doe@example.com',
                  },
                  username: {
                    type: 'string',
                    minLength: 3,
                    maxLength: 30,
                    pattern: '^[a-zA-Z0-9_]+$',
                    description: 'Nombre de usuario único (3-30 caracteres, solo letras, números y guiones bajos)',
                    example: 'johndoe',
                  },
                  displayName: {
                    type: 'string',
                    maxLength: 100,
                    description: 'Nombre para mostrar',
                    example: 'John Doe',
                  },
                  avatar: {
                    type: 'string',
                    format: 'uri',
                    description: 'URL de la imagen de avatar (opcional)',
                    example: 'https://example.com/avatar.jpg',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuario registrado exitosamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          409: { $ref: '#/components/responses/Conflict' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login de usuario',
        description: 'Autentica un usuario existente y actualiza el último login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['auth0Id'],
                properties: {
                  auth0Id: {
                    type: 'string',
                    description: 'Auth0 user ID',
                    example: 'auth0|123456789',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login exitoso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout de usuario',
        description: 'Cierra la sesión del usuario (principalmente operación del lado del cliente)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Logout exitoso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        message: { type: 'string', example: 'Logged out successfully' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Obtener usuario actual',
        description: 'Obtiene el perfil completo del usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Perfil del usuario',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      put: {
        tags: ['Authentication'],
        summary: 'Actualizar perfil de usuario',
        description: 'Actualiza la información del perfil del usuario autenticado',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  displayName: {
                    type: 'string',
                    maxLength: 100,
                    description: 'Nombre para mostrar',
                    example: 'John Updated',
                  },
                  bio: {
                    type: 'string',
                    maxLength: 500,
                    description: 'Biografía del usuario',
                    example: 'Lover of books and coffee',
                  },
                  avatar: {
                    type: 'string',
                    format: 'uri',
                    description: 'URL de la imagen de avatar',
                    example: 'https://example.com/new-avatar.jpg',
                  },
                  preferences: {
                    type: 'object',
                    description: 'Preferencias del usuario',
                    properties: {
                      isPrivate: { type: 'boolean', example: false },
                      showReadingGoals: { type: 'boolean', example: true },
                      emailNotifications: { type: 'boolean', example: false },
                      theme: {
                        type: 'string',
                        enum: ['light', 'dark', 'auto'],
                        example: 'dark',
                      },
                      language: { type: 'string', example: 'es' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Perfil actualizado exitosamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT de Auth0. Obtén tu token desde Auth0 y úsalo en el header Authorization',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          username: { type: 'string', example: 'johndoe' },
          displayName: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
          avatar: { type: 'string', format: 'uri', nullable: true },
          bio: { type: 'string', example: 'Book lover', nullable: true },
          karma: { type: 'integer', example: 100 },
          reputation: { type: 'integer', example: 50 },
          level: { type: 'integer', example: 5 },
          readingStats: {
            type: 'object',
            properties: {
              booksRead: { type: 'integer', example: 42 },
              pagesRead: { type: 'integer', example: 15230 },
              currentStreak: { type: 'integer', example: 7 },
              longestStreak: { type: 'integer', example: 30 },
              lastReadingDate: { type: 'string', format: 'date-time', nullable: true },
            },
          },
          preferences: {
            type: 'object',
            properties: {
              isPrivate: { type: 'boolean', example: false },
              showReadingGoals: { type: 'boolean', example: true },
              emailNotifications: { type: 'boolean', example: true },
              theme: { type: 'string', enum: ['light', 'dark', 'auto'], example: 'auto' },
              language: { type: 'string', example: 'es' },
            },
          },
          followersCount: { type: 'integer', example: 125 },
          followingCount: { type: 'integer', example: 78 },
          createdAt: { type: 'string', format: 'date-time' },
          lastLogin: { type: 'string', format: 'date-time' },
        },
      },
      UserResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              message: { type: 'string', example: '¡Bienvenido a HattBooks!' },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Error description' },
              code: { type: 'integer', example: 400 },
              details: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Request inválido',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: {
                message: 'Validation failed',
                code: 400,
                details: [
                  { field: 'email', message: 'Valid email is required' },
                ],
              },
            },
          },
        },
      },
      Unauthorized: {
        description: 'No autorizado - Token inválido o ausente',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: {
                message: 'Unauthorized',
                code: 401,
              },
            },
          },
        },
      },
      NotFound: {
        description: 'Recurso no encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: {
                message: 'User not found',
                code: 404,
              },
            },
          },
        },
      },
      Conflict: {
        description: 'Conflicto - El recurso ya existe',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: {
                message: 'Username already taken',
                code: 409,
              },
            },
          },
        },
      },
      TooManyRequests: {
        description: 'Demasiadas peticiones - Rate limit excedido',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: {
                message: 'Too many authentication attempts, please try again later.',
                code: 429,
              },
            },
          },
        },
      },
    },
  },
};
