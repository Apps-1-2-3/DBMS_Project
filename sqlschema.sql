
mysql> use smarthostel
Database changed
mysql> show tables;
+-----------------------+
| Tables_in_smarthostel |
+-----------------------+
| attendance            |
| choice                |
| employees             |
| hostels               |
| mealmenu              |
| room                  |
| roomassignedto        |
| student               |
| studentphoneno        |
| users                 |
+-----------------------+
10 rows in set (0.04 sec)

mysql> desc attendance;
+-------------+------------------+------+-----+---------+----------------+
| Field       | Type             | Null | Key | Default | Extra          |
+-------------+------------------+------+-----+---------+----------------+
| id          | bigint           | NO   | PRI | NULL    | auto_increment |
| location    | varchar(255)     | YES  |     | NULL    |                |
| time_stamp  | datetime(6)      | NO   |     | NULL    |                |
| type        | enum('IN','OUT') | NO   |     | NULL    |                |
| studentid   | varchar(255)     | NO   | MUL | NULL    |                |
| employeessn | varchar(255)     | YES  | MUL | NULL    |                |
+-------------+------------------+------+-----+---------+----------------+
6 rows in set (0.02 sec)

mysql> desc choice;
+-----------+------------------------------------+------+-----+---------+----------------+
| Field     | Type                               | Null | Key | Default | Extra          |
+-----------+------------------------------------+------+-----+---------+----------------+
| optid     | bigint                             | NO   | PRI | NULL    | auto_increment |
| date      | date                               | NO   |     | NULL    |                |
| meal_time | enum('BREAKFAST','DINNER','LUNCH') | NO   |     | NULL    |                |
| opted_out | bit(1)                             | YES  |     | NULL    |                |
| studentid | varchar(255)                       | NO   | MUL | NULL    |                |
+-----------+------------------------------------+------+-----+---------+----------------+
5 rows in set (0.00 sec)

mysql> desc employees;
+-------------+------------------------------------------------+------+-----+---------+-------+
| Field       | Type                                           | Null | Key | Default | Extra |
+-------------+------------------------------------------------+------+-----+---------+-------+
| ssn         | varchar(255)                                   | NO   | PRI | NULL    |       |
| first_name  | varchar(255)                                   | NO   |     | NULL    |       |
| last_name   | varchar(255)                                   | NO   |     | NULL    |       |
| middle_name | varchar(255)                                   | YES  |     | NULL    |       |
| role        | enum('ADMIN','MESS_STAFF','SECURITY','WARDEN') | NO   |     | NULL    |       |
+-------------+------------------------------------------------+------+-----+---------+-------+
5 rows in set (0.01 sec)

mysql> desc hostels;
+--------------+----------------------+------+-----+---------+-------+
| Field        | Type                 | Null | Key | Default | Extra |
+--------------+----------------------+------+-----+---------+-------+
| hostel_no    | varchar(255)         | NO   | PRI | NULL    |       |
| hostel_name  | varchar(255)         | NO   |     | NULL    |       |
| total_floors | int                  | YES  |     | NULL    |       |
| total_rooms  | int                  | YES  |     | NULL    |       |
| type         | enum('BOYS','GIRLS') | YES  |     | NULL    |       |
+--------------+----------------------+------+-----+---------+-------+
5 rows in set (0.02 sec)

mysql> desc mealmenu;
+-----------+------------------------------------------------------------------------------+------+-----+---------+----------------+
| Field     | Type                                                                         | Null | Key | Default | Extra          |
+-----------+------------------------------------------------------------------------------+------+-----+---------+----------------+
| poolid    | bigint                                                                       | NO   | PRI | NULL    | auto_increment |
| category  | varchar(255)                                                                 | YES  |     | NULL    |                |
| day       | enum('FRIDAY','MONDAY','SATURDAY','SUNDAY','THURSDAY','TUESDAY','WEDNESDAY') | NO   |     | NULL    |                |
| meal_time | enum('BREAKFAST','DINNER','LUNCH')                                           | NO   |     | NULL    |                |
| menu_item | varchar(255)                                                                 | NO   |     | NULL    |                |
+-----------+------------------------------------------------------------------------------+------+-----+---------+----------------+
5 rows in set (0.02 sec)

mysql> desc room;
+-----------+--------------+------+-----+---------+-------+
| Field     | Type         | Null | Key | Default | Extra |
+-----------+--------------+------+-----+---------+-------+
| room_no   | varchar(255) | NO   | PRI | NULL    |       |
| capacity  | int          | NO   |     | NULL    |       |
| floor     | int          | YES  |     | NULL    |       |
| hostel_no | varchar(255) | NO   |     | NULL    |       |
+-----------+--------------+------+-----+---------+-------+
4 rows in set (0.00 sec)

mysql> desc roomassignedto;
+---------------+--------------+------+-----+---------+----------------+
| Field         | Type         | Null | Key | Default | Extra          |
+---------------+--------------+------+-----+---------+----------------+
| id            | bigint       | NO   | PRI | NULL    | auto_increment |
| assigned_date | date         | YES  |     | NULL    |                |
| is_active     | bit(1)       | YES  |     | NULL    |                |
| room_no       | varchar(255) | NO   | MUL | NULL    |                |
| studentid     | varchar(255) | NO   | MUL | NULL    |                |
+---------------+--------------+------+-----+---------+----------------+
5 rows in set (0.00 sec)

mysql> desc student;
+-------------+--------------+------+-----+---------+-------+
| Field       | Type         | Null | Key | Default | Extra |
+-------------+--------------+------+-----+---------+-------+
| studentid   | varchar(255) | NO   | PRI | NULL    |       |
| first_name  | varchar(255) | NO   |     | NULL    |       |
| hostel_no   | varchar(255) | YES  |     | NULL    |       |
| last_name   | varchar(255) | NO   |     | NULL    |       |
| middle_name | varchar(255) | YES  |     | NULL    |       |
| room_no     | varchar(255) | YES  |     | NULL    |       |
+-------------+--------------+------+-----+---------+-------+
6 rows in set (0.00 sec)

mysql> desc studentphoneno;
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id         | bigint       | NO   | PRI | NULL    | auto_increment |
| is_primary | bit(1)       | YES  |     | NULL    |                |
| phone_no   | varchar(255) | NO   |     | NULL    |                |
| studentid  | varchar(255) | NO   | MUL | NULL    |                |
+------------+--------------+------+-----+---------+----------------+
4 rows in set (0.02 sec)

mysql> desc users;
+--------------+--------------------------------------+------+-----+---------+----------------+
| Field        | Type                                 | Null | Key | Default | Extra          |
+--------------+--------------------------------------+------+-----+---------+----------------+
| id           | bigint                               | NO   | PRI | NULL    | auto_increment |
| email        | varchar(255)                         | NO   | UNI | NULL    |                |
| name         | varchar(255)                         | NO   |     | NULL    |                |
| password     | varchar(255)                         | NO   |     | NULL    |                |
| role         | enum('ADMIN','MESS_STAFF','STUDENT') | NO   |     | NULL    |                |
| room_number  | varchar(255)                         | YES  |     | NULL    |                |
| employee_ssn | varchar(255)                         | YES  | UNI | NULL    |                |
| student_id   | varchar(255)                         | YES  | UNI | NULL    |                |
+--------------+--------------------------------------+------+-----+---------+----------------+
8 rows in set (0.02 sec)
