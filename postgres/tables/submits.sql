BEGIN TRANSACTION;

CREATE TABLE submits (
    id serial PRIMARY KEY,
    link VARCHAR(155),
    user_id INT NOT NULL
);

COMMIT;