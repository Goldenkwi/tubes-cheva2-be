# Legacy Database Design

`Tubes-Cheva.sql` is an earlier database design kept for reference only. It is
not compatible with the active Prisma schema because it uses different IDs,
entities, enums, and relationships.

Do not execute this SQL against the application database. Database structure is
managed exclusively through `prisma/schema.prisma` and committed files under
`prisma/migrations/`.
