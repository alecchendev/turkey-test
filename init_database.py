import sqlite3
from sqlite3 import Error

def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by db_file
    :param db_file: database file
    :return: Connection object or None
    """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)

    return conn


def create_table(conn, create_table_sql):
    """ create a table from the create_table_sql statement
    :param conn: Connection object
    :param create_table_sql: a CREATE TABLE statement
    :return:
    """
    try:
        c = conn.cursor()
        c.execute(create_table_sql)
    except Error as e:
        print(e)

def insert_table(conn, insert_sql):
    """ insert a row into a table
    :param conn: Connection object
    :param insert_sql: a INSERT INTO statement
    :return:
    """
    try:
        c = conn.cursor()
        c.execute(insert_sql)
        conn.commit()
    except Error as e:
        print(e)

def main():
    database = "./database/database.db"

    sql_create_games_table = """
    CREATE TABLE IF NOT EXISTS games (
        id integer PRIMARY KEY,
        token text NOT NULL,
        type text NOT NULL,
        start_time timestamp default (strftime('%s', 'now')) NOT NULL,
        queries integer default 0 NOT NULL
    );
    """

    sql_create_scoreboard_table = """
    CREATE TABLE IF NOT EXISTS scoreboard (
        id integer PRIMARY KEY,
        name text NOT NULL,
        ai_right integer default 0 NOT NULL,
        ai_wrong integer default 0 NOT NULL,
        human_right integer default 0 NOT NULL,
        human_wrong integer default 0 NOT NULL
    );
    """

    insert_basic_sql = """
    INSERT INTO scoreboard(name) VALUES('basic')
    """

    # create a database connection
    conn = create_connection(database)

    # create tables
    if conn is not None:
        # create games table
        create_table(conn, sql_create_games_table)

        # create scoreboard table
        create_table(conn, sql_create_scoreboard_table)

        # insert one row to scoreboard
        insert_table(conn, insert_basic_sql)

    else:
        print("Error! cannot create the database connection.")


if __name__ == '__main__':
    main()