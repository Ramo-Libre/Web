-- Hace que el CHECK constraint de sync_entities.feature acepte 'todos'
-- Antes de aplicar: corre $ select distinct feature from sync_entities;
-- para verificar que no hay valores inesperados.

alter table sync_entities
  drop constraint if exists sync_entities_feature_check;

alter table sync_entities
  add constraint sync_entities_feature_check
  check (feature in ('ramos', 'schedule', 'escenarios', 'semesters', 'todos'));
