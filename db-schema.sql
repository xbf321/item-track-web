DROP TABLE IF EXISTS devices;
CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
    imei NUMERIC NOT NULL DEFAULT(0),
    is_online NUMERIC DEFAULT(0) NOT NULL,
    create_datetime INTEGER NOT NULL DEFAULT(0)
);

DROP TABLE IF EXISTS records;

CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
    imei NUMERIC NOT NULL DEFAULT(0),
    iccid NUMERIC DEFAULT(0) NOT NULL,
    csq INTEGER NOT NULL DEFAULT(0),
    gps TEXT DEFAULT "" NOT NULL,
    lbs TEXT NOT NULL DEFAULT "",
    locate_datetime INTEGER NOT NULL DEFAULT(0),
    create_datetime INTEGER NOT NULL DEFAULT(0),
    update_datetime INTEGER NOT NULL DEFAULT(0)
);