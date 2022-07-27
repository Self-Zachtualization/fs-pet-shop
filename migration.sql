DROP TABLE IF EXISTS pets;

CREATE TABLE pets (
  id SERIAL,
  name TEXT,
  kind TEXT,
  age INTEGER
);

INSERT INTO pets (name, kind, age) VALUES ('Fido', 'rainbow', 7);
INSERT INTO pets (name, kind, age) VALUES ('Buttons', 'snake', 5);
INSERT INTO pets (name, kind, age) VALUES ('Cornflake', 'parakeet', 3);
INSERT INTO pets (name, kind, age) VALUES ('Bro', 'dog', 5);