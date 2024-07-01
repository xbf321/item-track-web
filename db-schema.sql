DROP TABLE IF EXISTS records;

CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
    gps TEXT DEFAULT "" NOT NULL,
    locate_datetime INTEGER NOT NULL DEFAULT(0),
    create_datetime INTEGER NOT NULL DEFAULT(0),
    update_datetime INTEGER NOT NULL DEFAULT(0)
);