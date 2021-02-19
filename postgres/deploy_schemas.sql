-- Deploy fresh DB tables
\i '/docker-entrypoint-initdb.d/tables/users.sql'
\i '/docker-entrypoint-initdb.d/tables/login.sql'
\i '/docker-entrypoint-initdb.d/tables/submits.sql'

-- For testing purposes only. This file will add dummy data
-- \i '/docker-entrypoint-initdb.d/seed/seed.sql'