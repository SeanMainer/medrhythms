1. Create a schema/database in your MySQL with the name `inventory_db`. 

```mysql
CREATE DATABASE inventory_db;
```

2. Create a `.env` file in your root directory, and add this line:

```bash
DATABASE_URL=mysql+pymysql://{your mysql password}@localhost:3306/inventory_db
```

Notice that you need to use your own MySQL password and confirm your port number. By default, MySQL database should be on port 3306, but change the port number if necessary 

3. Execute `app/run.py` and test API on Postman

   I did not explicitly assign a port for Flask. Flask will tell you the backend port in the console. It will look like this: 

```bash
[2024-11-26 19:10:17,304] INFO in __init__: Inventory Management System startup
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
```

​	Except for Postman, you can test the index by adding a suffix `/api` to the given link and opening it in the browser, like this http://127.0.0.1:5000/api. Ideally, you should see Hello World.

​	I noticed that sometimes the database may fail to create tables, and there is no warning at all. If this happens to you, you can create tables manually in the database. I provide the SQL lines here for reference:

```sql
CREATE TABLE kit (
                     id VARCHAR(20) PRIMARY KEY,
                     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                     updated_at TIMESTAMP,
                     batch_number VARCHAR(255),
                     status VARCHAR(50) DEFAULT 'Available',
                     distributor VARCHAR(25),
                     dispense_date TIMESTAMP
);

CREATE TABLE phone (
                       id VARCHAR(20) PRIMARY KEY,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       batch_number VARCHAR(255),
                       status VARCHAR(50) DEFAULT 'available',
                       discarded_at TIMESTAMP,
                       kit_id VARCHAR(20),
                       FOREIGN KEY (kit_id) REFERENCES kit(id)
);

CREATE TABLE sim_card (
                          id VARCHAR(20) PRIMARY KEY,
                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          batch_number VARCHAR(255),
                          status VARCHAR(50) DEFAULT 'available',
                          discarded_at TIMESTAMP,
                          kit_id VARCHAR(20),
                          FOREIGN KEY (kit_id) REFERENCES kit(id)
);

CREATE TABLE right_sensor (
                              id VARCHAR(20) PRIMARY KEY,
                              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              batch_number VARCHAR(255),
                              status VARCHAR(50) DEFAULT 'available',
                              discarded_at TIMESTAMP,
                              kit_id VARCHAR(20),
                              FOREIGN KEY (kit_id) REFERENCES kit(id)
);

CREATE TABLE left_sensor (
                             id VARCHAR(20) PRIMARY KEY,
                             created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             batch_number VARCHAR(255),
                             status VARCHAR(50) DEFAULT 'available',
                             discarded_at TIMESTAMP,
                             kit_id VARCHAR(20),
                             FOREIGN KEY (kit_id) REFERENCES kit(id)
);

CREATE TABLE headphone (
                           id VARCHAR(20) PRIMARY KEY,
                           created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           batch_number VARCHAR(255),
                           status VARCHAR(50) DEFAULT 'available',
                           discarded_at TIMESTAMP,
                           kit_id VARCHAR(20),
                           FOREIGN KEY (kit_id) REFERENCES kit(id)
);
```

