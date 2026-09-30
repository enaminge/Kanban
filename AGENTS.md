# Proyecto Kanban

## Requisitos del negocio

- Un MVP (Producto Mínimo Viable) de una aplicación de gestión de proyectos estilo Kanban como aplicación web.
- La aplicación web debe tener un solo tablero.
- El tablero tiene 5 columnas fijas que se pueden renombrar.
- Cada tarjeta tiene solo un título y detalles.
- Interfaz de arrastrar y soltar para mover tarjetas entre columnas.
- Agregar una nueva tarjeta a una columna; editar el título y los detalles de una tarjeta; eliminar una tarjeta existente.
- Un chat al costado derecho permite manejar el tablero con instrucciones en lenguaje natural (agregar, editar, mover y eliminar tarjetas, renombrar columnas).
- Interfaz totalmente en español y adaptada a cualquier dispositivo.
- Sin funcionalidades adicionales: sin archivo, sin búsqueda ni filtrado. Que sea simple. - La prioridad es una interfaz de usuario (UI/UX) elegante, profesional y atractiva, con funciones muy sencillas.
- La aplicación debe abrirse con datos de ejemplo para el tablero único.

## Detalles técnicos

- Implementada como una aplicación NextJS moderna, renderizada en el cliente.
- La aplicación NextJS debe crearse en un subdirectorio `frontend`.
- Sin persistencia.
- Sin gestión de usuarios para el MVP.
- Utilizar bibliotecas populares.
- Lo más simple posible, pero con una interfaz de usuario elegante.

## Esquema de colores

- Amarillo de acento: `#ecad0a` - líneas de acento, resaltados.
- Azul principal: `#209dd7` - enlaces, secciones clave.
- Morado secundario: `#753991` - botones de envío, acciones importantes.
- Azul marino oscuro: `#032147` - encabezados principales.
- Gris texto: `#888888` - texto de apoyo, etiquetas.

## Estrategia

1. Elaborar un plan con criterios de éxito para cada fase. Incluir la estructura del proyecto, incluyendo `.gitignore`, y pruebas unitarias rigurosas.

2. Ejecutar el plan asegurándose de que se cumplan todos los criterios.
3. Realizar pruebas de integración exhaustivas con Playwright o similar, corrigiendo los defectos.
4. Finalizar solo cuando el MVP esté terminado y probado, con el servidor en funcionamiento y listo para el usuario.

## Estándares de codificación

1. Utilizar las últimas versiones de las bibliotecas y enfoques idiomáticos actuales.
2. Mantener la simplicidad: NUNCA sobreingeniería, SIEMPRE simplificar, SIN programación defensiva innecesaria. Sin funciones adicionales: centrarse en la simplicidad.

3. Ser conciso. Mantener el README mínimo. IMPORTANTE: no usar emojis.
