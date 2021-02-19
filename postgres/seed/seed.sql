BEGIN TRANSACTION;

INSERT INTO users (name, email, entries, joined) VALUES ('Pop', 'pope@gmail.com', 0, '1-1-2021');
INSERT INTO login (hash, email) VALUES ('kjhkjshskjhdk23dsd', 'pope@gmail.com');

COMMIT: