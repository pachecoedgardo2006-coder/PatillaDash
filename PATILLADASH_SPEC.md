# PatillaDash — Documentación Técnica, Arquitectura y Roadmap (MVP v1.0)

> **Propósito del Archivo:** Este documento consolida la visión de negocio, reglas de dominio, arquitectura de software, estructura del repositorio y la hoja de ruta para la asistencia inteligente en el desarrollo del proyecto **PatillaDash**.

---

## 1. Visión y Concepto General

**PatillaDash** es una plataforma web modular (*Single Page Application* - SPA) diseñada para la gestión centralizada y multilocal de negocios dedicados a la venta de bebidas artesanales de patilla ("patillazos") y refrescos.

### 🍉 Modelo de Negocio: Registro por Declaración Operativa
Dado que la fruta y los insumos artesanales presentan variabilidad de rendimiento natural (por ejemplo, una patilla grande puede rendir 15 vasos un día y 12 otro día), el sistema **no** aplica deducción teórica por receta. En su lugar implementa un **"Registro de Operación Diaria por Declaración"**:
1. **Cierre de Turno del Vendedor:** El vendedor reporta al final de su jornada las ventas reales discriminadas por método de pago (*Efectivo* vs. *Transferencia / Nequi / Daviplata*) y la cantidad exacta de insumos consumidos.
2. **Consolidación Administrativa:** El Administrador supervisa en tiempo real los inventarios por local, registra compras de insumos (que incrementan el stock automáticamente), gestiona nómina/pagos a empleados y analiza métricas financieras para decisiones de escalabilidad.

---

## 2. Matriz de Roles y Control de Acceso

| Rol | Alcance | Módulos y Permisos Habilitados |
| :--- | :--- | :--- |
| **Vendedor** | Local asignado únicamente | • Formulario de Registro Diario de Ventas por categoría de producto.<br>• Declaración de suministros consumidos en el turno.<br>• Envío de notas y novedades al Administrador.<br>*Restricción: Sin acceso a estadísticas globales, compras ni sueldos de otros usuarios.* |
| **Administrador** | Global (Todos los locales) | • **Módulo 1:** Monitoreo y alertas de inventario multilocal.<br>• **Módulo 2:** Gestión de pagos y nómina de vendedores.<br>• **Módulo 3:** Registro de compras e incremento de stock.<br>• **Módulo 4:** Dashboard financiero y analítica de rentabilidad.<br>• Gestión de usuarios y locales. |

---

## 3. Alcance Funcional del MVP (Versión 1.0)

### 🧑‍💼 Módulo Vendedor (Operación Diaria)
* **Registro de Ventas:** Formulario por productos/categorías (Vaso 16oz, Vaso 24oz, Jarra, etc.) con división explícita entre Efectivo y Transferencias.
* **Declaración de Insumos:** Registro de insumos gastados en la jornada (ej. 3 patillas, 50 vasos, 2 kg azúcar, 1 bolsa de hielo).
* **Novedades y Observaciones:** Campo de texto para reportar averías, desabastecimiento o incidencias operativas.

### 👑 Módulo Administrador (4 Secciones Estratégicas)
1. **Sección 1 — Monitoreo de Suministros e Inventario Multilocal:**
   * Visualización en tabla/rejilla del stock disponible filtrable por local.
   * Alertas visuales con badges condicionales cuando el insumo está por debajo del `StockMinimoAlerta`.
2. **Sección 2 — Gestión de Pagos a Vendedores:**
   * Registro de anticipos, sueldos diarios/semanales y control de saldo pendiente por empleado y local.
3. **Sección 3 — Entrada de Compras y Reabastecimiento Automático:**
   * Registro de compras de materia prima (insumo, cantidad, costo total, proveedor, local destino).
   * **Efecto en cadena:** El guardado exitoso incrementa directamente el `InventarioLocal` correspondiente.
4. **Sección 4 — Dashboard y Analítica de Negocio:**
   * KPIs: Ingresos Totales vs. Gastos (Compras + Nómina) $\rightarrow$ Margen Neto.
   * Comparativa de métodos de pago (Efectivo vs. Transferencias) para auditoría de caja.
   * Ranking de locales más rentables y productos más vendidos.

---

## 4. Límites y Restricciones (Scope Boundaries v1.0)

* **Sin deducción automática por receta:** La merma de inventario ocurre por la declaración explícita de consumos del vendedor al cierre de turno.
* **Sin pasarela de pago bancaria ni DIAN:** Los pagos por transferencia se verifican y registran manualmente; no hay integración directa con APIs bancarias ni facturación electrónica en la V1.
* **Persistencia local en desarrollo con SQLite:** Base de datos `patilladash.db`. EF Core abstrae el acceso a datos para permitir cambiar la conexión a PostgreSQL o SQL Server sin alterar la lógica de negocio.
* **Canal de notificaciones interno:** Sin alertas por SMS/WhatsApp externos; las alertas de stock residen en el dashboard administrativo.

---

## 5. Estándares Técnicos, Arquitectura y Seguridad

### 🏛️ Backend (.NET 10 Web API - Clean Architecture)
* **Domain:** Entidades puras, Enums, Interfaces de Repositorios (0 dependencias externas).
* **Application:** DTOs, Interfaces de Servicios, Servicios de Casos de Uso, Validadores FluentValidation.
* **Infrastructure:** `PatillaDbContext`, Mapeos Fluent API, Repositorios EF Core, Generador JWT (`JwtTokenGenerator`), `IPasswordHasher` (`PasswordHasher`).
* **Api:** Controladores delgados (delegación directa a `Application`), Inyección de Dependencias, Middleware de Errores Global (`ProblemDetails` RFC 7807), Políticas CORS.

### 🛡️ Seguridad
* **Autenticación & Autorización:** JWT Bearer con claims (`Id`, `Email`, `Rol`, `LocalId`).
* **Protección de Endpoints:** Atributos `[Authorize(Roles = "Administrador")]` y `[Authorize(Roles = "Vendedor")]`.
* **Contraseñas:** Hash seguro con `IPasswordHasher` / PBKDF2 / BCrypt.
* **Validación estricta:** `FluentValidation` en capa de aplicación interceptado por un filtro global.

### 🌐 Frontend (Vanilla JS + Vite + Tailwind CSS)
* **Arquitectura SPA:** Sin recargas de página, enrutador cliente con *Route Guards* basados en JWT y roles.
* **HTTP Client:** Axios con interceptores automáticos para inyección del header `Authorization: Bearer <token>` y redirección en respuestas `401 Unauthorized`.
* **UI/UX:** Tailwind CSS para diseño responsivo adaptado a dispositivos móviles de vendedores y pantallas de escritorio administrativas.

---

## 6. Estructura Completa del Repositorio

```text
PatillaDash/
├── README.md                                     # Documentación general y contratos de API
├── PatillaDash.sln                               # Solución principal .NET 10
├── .gitignore                                    # Exclusiones de Git (.db, /bin, /obj, node_modules)
│
├── src/
│   ├── Backend/
│   │   ├── PatillaDash.Domain/                   # Capa 1: Dominio Puro (0 Dependencias)
│   │   │   ├── Entities/
│   │   │   │   ├── Usuario.cs                    # [Id, Nombre, Email, PasswordHash, Rol, LocalId]
│   │   │   │   ├── Local.cs                      # [Id, Nombre, Direccion, Activo]
│   │   │   │   ├── Suministro.cs                 # [Id, Nombre, UnidadMedida, StockMinimoAlerta]
│   │   │   │   ├── InventarioLocal.cs            # [Id, LocalId, SuministroId, CantidadDisponible]
│   │   │   │   ├── Producto.cs                   # [Id, Nombre, PrecioBase, Categoria]
│   │   │   │   ├── RegistroVentaDiaria.cs        # [Id, LocalId, VendedorId, Fecha, TotalEfectivo, TotalTransferencia, Notas]
│   │   │   │   ├── DetalleVentaDiaria.cs         # [Id, RegistroVentaDiariaId, ProductoId, CantidadVendida, Subtotal]
│   │   │   │   ├── ConsumoSuministroDiario.cs    # [Id, RegistroVentaDiariaId, SuministroId, CantidadGastada]
│   │   │   │   ├── PagoEmpleado.cs               # [Id, LocalId, VendedorId, Monto, FechaPago, Observacion]
│   │   │   │   └── CompraInsumo.cs               # [Id, LocalId, SuministroId, Cantidad, CostoTotal, Fecha, Proveedor]
│   │   │   ├── Enums/
│   │   │   │   ├── RolUsuario.cs                 # Administrador | Vendedor
│   │   │   │   └── UnidadMedida.cs               # Unidades | Kilogramos | Litros | Bolsas
│   │   │   └── Interfaces/
│   │   │       ├── IUsuarioRepository.cs
│   │   │       ├── ILocalRepository.cs
│   │   │       ├── ISuministroRepository.cs
│   │   │       ├── IInventarioRepository.cs
│   │   │       ├── IVentaRepository.cs
│   │   │       ├── IPagoEmpleadoRepository.cs
│   │   │       └── ICompraRepository.cs
│   │   │
│   │   ├── PatillaDash.Application/              # Capa 2: Casos de Uso y Reglas de Aplicación
│   │   │   ├── DependencyInjection.cs            # Registro DI de servicios y validadores FluentValidation
│   │   │   ├── DTOs/
│   │   │   │   ├── Auth/                         # LoginDto, RegisterDto, AuthResponseDto
│   │   │   │   ├── Ventas/                       # CrearVentaDiariaDto, DetalleVentaDto, ConsumoDto, VentaResumenDto
│   │   │   │   ├── Inventario/                   # InventarioLocalDto, ActualizarStockDto
│   │   │   │   ├── Compras/                      # CrearCompraDto, CompraResumenDto
│   │   │   │   ├── Pagos/                        # RegistrarPagoDto, PagoResumenDto
│   │   │   │   └── Estadisticas/                 # DashboardEstadisticasDto, VentasPorMetodoPagoDto
│   │   │   ├── Interfaces/
│   │   │   │   ├── IAuthService.cs
│   │   │   │   ├── IVentaService.cs
│   │   │   │   ├── IInventarioService.cs
│   │   │   │   ├── ICompraService.cs
│   │   │   │   ├── IPagoEmpleadoService.cs
│   │   │   │   └── IEstadisticasService.cs
│   │   │   │   ├── IJwtTokenGenerator.cs
│   │   │   │   └── IPasswordHasher.cs
│   │   │   ├── Services/
│   │   │   │   ├── AuthService.cs                # Emisión de tokens y verificación de credenciales
│   │   │   │   ├── VentaService.cs               # Registra venta diaria y descuenta stock declarado
│   │   │   │   ├── InventarioService.cs          # Consulta de stock por local y estado de alerta
│   │   │   │   ├── CompraService.cs              # Registra compra e incrementa stock en InventarioLocal
│   │   │   │   ├── PagoEmpleadoService.cs        # Gestión de pagos y nómina
│   │   │   │   └── EstadisticasService.cs        # Agregación financiera y métricas comparativas
│   │   │   └── Validators/                       # Validadores FluentValidation por DTO
│   │   │
│   │   ├── PatillaDash.Infrastructure/           # Capa 3: Persistencia, EF Core y Servicios Externos
│   │   │   ├── DependencyInjection.cs            # Registro de DbContext SQLite, Repositorios y Auth
│   │   │   ├── Persistence/
│   │   │   │   ├── PatillaDbContext.cs           # Contexto EF Core y DbSets
│   │   │   │   ├── Configurations/               # Mapeos Fluent API para entidades (10 entidades)
│   │   │   │   └── Migrations/                   # Historial de migraciones EF Core (InitialCreate)
│   │   │   ├── Repositories/                     # Implementación concreta de repositorios (7 repositorios)
│   │   │   └── Auth/
│   │   │       ├── JwtTokenGenerator.cs          # Generador de claims y tokens JWT
│   │   │       └── PasswordHasher.cs             # Hasher de contraseñas con BCrypt
│   │   │
│   │   └── PatillaDash.Api/                      # Capa 4: Endpoints HTTP y Configuración
│   │       ├── Program.cs                        # DI, Middlewares, CORS, DbContext, Auth, ProblemDetails, Scalar
│   │       ├── appsettings.json                  # Cadena de conexión SQLite ("Data Source=patilladash.db")
│   │       ├── Controllers/
│   │       │   ├── AuthController.cs             # POST /api/auth/login, POST /api/auth/register
│   │       │   ├── VentasController.cs           # POST /api/ventas/diaria, GET /api/ventas/local/{localId}
│   │       │   ├── InventarioController.cs       # GET /api/inventario/local/{localId}, PUT /api/inventario/stock
│   │       │   ├── ComprasController.cs          # POST /api/compras, GET /api/compras
│   │       │   ├── PagosController.cs            # POST /api/pagos, GET /api/pagos/vendedor/{id}, GET /api/pagos/local/{id}
│   │       │   └── EstadisticasController.cs     # GET /api/estadisticas/dashboard
│   │       ├── Filters/
│   │       │   └── ValidationFilter.cs           # Filtro global FluentValidation
│   │       └── Middleware/
│   │           └── GlobalExceptionHandler.cs     # Formateador RFC 7807 (ProblemDetails)
│   │
│   └── Frontend/                                 # Aplicación Cliente SPA (Vite + Tailwind CSS + JS)
│       ├── index.html                            # Contenedor raíz (<div id="app"></div>)
│       ├── package.json                          # Scripts y dependencias frontend
│       ├── vite.config.js                        # Configuración del bundler Vite
│       ├── postcss.config.js                     # Procesador PostCSS para Tailwind
│       ├── tailwind.config.js                    # Temas, paleta de colores y componentes
│       └── src/
│           ├── main.js                           # Punto de entrada JS
│           ├── assets/
│           │   └── style.css                     # Directivas Tailwind (@import "tailwindcss")
│           ├── router/
│           │   └── router.js                     # Router cliente SPA con Route Guards
│           ├── services/
│           │   ├── api.js                        # Cliente Axios con interceptor Bearer Token
│           │   ├── auth.service.js
│           │   ├── ventas.service.js
│           │   ├── inventario.service.js
│           │   └── estadisticas.service.js
│           ├── components/                       # Componentes reutilizables
│           │   ├── navbar.js
│           │   ├── sidebar.js
│           │   ├── modal.js
│           │   └── statCard.js
│           └── views/                            # Vistas renderizadas dinámicamente
│               ├── auth/
│               │   └── loginView.js
│               ├── vendedor/
│               │   └── registroDiarioView.js     # Formulario Ventas + Consumos + Notas
│               └── admin/
│                   ├── suministrosView.js        # Stock por local y badges de alerta
│                   ├── pagosEmpleadosView.js     # Control de nómina y pagos
│                   ├── comprasView.js            # Entrada de facturas y compras
│                   └── estadisticasView.js       # Dashboard de métricas y gráficos
```

---

## 7. Ficha Técnica y Herramientas

* **Backend:** C# / .NET 10 (Web API).
* **ORM:** Entity Framework Core 10 con SQLite (`Microsoft.EntityFrameworkCore.Sqlite`).
* **Seguridad:** JWT (JSON Web Tokens) con BCrypt / `IPasswordHasher`.
* **Validación:** FluentValidation.
* **Frontend:** Vanilla JavaScript (ES6+ Modules) estructurado como SPA con Vite.js.
* **Estilos:** Tailwind CSS v3/v4 con PostCSS.
* **Cliente HTTP:** Axios.
* **Entorno & SO:** Linux Ubuntu, Git, GitHub.

---

## 8. Hoja de Ruta de Desarrollo (Roadmap MVP)

### 📌 FASE 1: Configuración de la Solución y Arquitectura de Capas
- [x] Crear la solución `PatillaDash.sln` y la raíz del proyecto.
- [x] Crear los 4 proyectos Backend (`Domain`, `Application`, `Infrastructure`, `Api`).
- [x] Establecer dependencias entre capas (`Application -> Domain`, `Infrastructure -> Application, Domain`, `Api -> Infrastructure, Application`).
- [x] Inicializar repositorio Git y configurar `.gitignore` (excluyendo bases de datos `.db`, carpetas `/bin`, `/obj`, y `node_modules`).
- [x] Configurar proyecto Frontend base con Vite, Tailwind CSS y estructura de carpetas en `src/`.

### 📌 FASE 2: Desarrollo del Backend (.NET 10 + SQLite)
#### 2.1 Domain & Entidades
- [x] Crear entidades de dominio: `Usuario`, `Local`, `Suministro`, `InventarioLocal`, `Producto`, `RegistroVentaDiaria`, `DetalleVentaDiaria`, `ConsumoSuministroDiario`, `PagoEmpleado`, `CompraInsumo`.
- [x] Crear Enums de dominio: `RolUsuario`, `UnidadMedida`.
- [x] Definir interfaces de repositorios en `Domain/Interfaces`.

#### 2.2 Application & Casos de Uso
- [x] Definir DTOs para Auth, Ventas Diarias, Inventario, Compras, Pagos y Estadísticas.
- [x] Implementar `AuthService` (autenticación y emisión de JWT con claims de Rol y LocalId).
- [x] Implementar `VentaService` (guardado de venta diaria, desglose de pagos y deducción del inventario según insumos declarados).
- [x] Implementar `CompraService` (registro de compras con incremento atómico de stock en `InventarioLocal`).
- [x] Implementar `InventarioService` (consultas de insumos por local y cálculo de stock crítico).
- [x] Implementar `PagoEmpleadoService` (historial y registro de nómina).
- [x] Implementar `EstadisticasService` (cálculo de balance neto, ratios por método de pago y ranking de ventas).
- [x] Configurar validadores con `FluentValidation` para todos los DTOs.

#### 2.3 Infrastructure & Persistencia SQLite
- [x] Configurar `PatillaDbContext` con proveedor SQLite (`Microsoft.EntityFrameworkCore.Sqlite`).
- [x] Configurar mappings con Fluent API (relaciones, llaves foráneas y conversión de enums).
- [x] Generar y ejecutar migración inicial (`InitialCreate`) para crear `patilladash.db`.
- [x] Implementar repositorios concretos con Entity Framework Core.
- [x] Implementar `JwtTokenGenerator` y hasher de contraseñas.

#### 2.4 API, Middlewares y Seguridad
- [x] Configurar `Program.cs` (Inyección de Dependencias, Connection String, Autenticación JWT, CORS, ProblemDetails).
- [x] Implementar Controladores: `AuthController`, `VentasController`, `InventarioController`, `ComprasController`, `PagosController`, `EstadisticasController`.
- [x] Configurar `GlobalExceptionHandler` con formato RFC 7807 (`ProblemDetails`).
- [x] Configurar `ValidationFilter` global para DTOs con FluentValidation.
- [x] Configurar políticas CORS para peticiones desde el Frontend Vite SPA.
- [x] Habilitar documentación OpenAPI y Scalar API Reference.

> **Detalles técnicos completados en 2.4 a considerar:**
> - Todos los 6 controladores creados y securizados con `[Authorize(Roles = "...")]`.
> - Enrutamiento RESTful completado con control de acceso por `LocalId` en el rol `Vendedor`.
> - `ValidationFilter` intercepta y valida automáticamente cualquier DTO contra los validadores de `Application` respondiendo con `400 Bad Request` y formato `ValidationProblemDetails`.
> - `GlobalExceptionHandler` unifica respuestas de error ante excepciones no controladas en formato RFC 7807.
> - `Scalar.AspNetCore` integrado para explorar y probar la API en desarrollo `/scalar/v1`.

### 📌 FASE 3: Desarrollo del Frontend SPA (Vanilla JS + Tailwind CSS)
#### 3.1 Infraestructura Frontend & Router
- [ ] Configurar `index.html` y directivas Tailwind CSS.
- [ ] Construir enrutador cliente (`router.js`) con manejo de rutas protegidas y *Route Guards* por Rol.
- [ ] Configurar cliente Axios (`api.js`) con interceptores para Bearer Token y manejo de expiración de sesión (401).

#### 3.2 Componentes Reutilizables
- [ ] Crear componentes: `Navbar`, `Sidebar` (con renderizado condicional según rol), `Modal` y `StatCard`.

#### 3.3 Vistas de Usuario
- [ ] **Vista Auth (`loginView.js`):** Inicio de sesión con almacenamiento seguro de token y redirección según rol.
- [ ] **Vista Vendedor (`registroDiarioView.js`):** Formulario de ventas categorizadas (Efectivo/Transferencia), declaración de insumos consumidos y notas.
- [ ] **Vista Admin - Suministros (`suministrosView.js`):** Rejilla/tabla de stock por local con badges de alerta de stock mínimo.
- [ ] **Vista Admin - Pagos (`pagosEmpleadosView.js`):** Registro de anticipos/sueldos e historial de nómina por local.
- [ ] **Vista Admin - Compras (`comprasView.js`):** Formulario de compras con actualización en tiempo real de inventario.
- [ ] **Vista Admin - Estadísticas (`estadisticasView.js`):** KPIs financieros, desglose de métodos de pago y ranking de locales.

> **Puntos clave a tener en cuenta para la Fase 3:**
> 1. **Manejo del Token JWT:** Guardar el token en `localStorage` o `sessionStorage`, decodificar el payload en el cliente para obtener `rol`, `localId`, `nombre`, y expirar la sesión automáticamente ante respuestas `401 Unauthorized`.
> 2. **Enrutamiento SPA:** Usar History API o Hash routing (`#/...`) en `router.js` con Guards que redirijan a `/login` si no hay sesión o a su panel correspondiente (`/vendedor/registro` o `/admin/dashboard`) según rol.
> 3. **Consumo de Endpoints:** Consumir los endpoints expuestos en `http://localhost:5136/api/...` respetando la estructura de DTOs definida en el Backend.

### 📌 FASE 4: Integración, Pruebas y Despliegue
- [ ] Pruebas end-to-end del flujo del vendedor (reporte diario -> actualización de stock e ingresos).
- [ ] Pruebas end-to-end del flujo de compras (ingreso de factura -> incremento automático en inventario).
- [ ] Validación de seguridad en rutas SPA (intento de acceso directo por URL no autorizada).
- [ ] Seed de datos de prueba y limpieza en BD SQLite.
- [ ] Verificación de desacoplamiento de BD para migración futura a PostgreSQL/SQL Server.

---

## 9. Directrices para la IA del IDE

Al generar código para este proyecto:
1. **Mantener la separación estricta de capas:** No colocar lógica de negocio en controladores ni dependencias de infraestructura en la capa `Domain`.
2. **Respetar la convención de nomenclatura C#:** `PascalCase` para clases, métodos y propiedades públicas; `camelCase` o `_camelCase` para variables locales y campos privados.
3. **No asumir recetas fijas:** Mantener el modelo donde el inventario se descuenta a partir de los insumos declarados en el reporte de venta diaria, no por vaso vendido.
4. **Respuestas HTTP estandarizadas:** Manejar errores con `ProblemDetails` y validar entradas exclusivamente mediante `FluentValidation`.
5. **Frontend Modular:** En el frontend de Vanilla JS, organizar la UI en módulos ES6 reutilizables respetando el patrón de vistas y servicios desacoplados con Axios.
