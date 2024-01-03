INSERT INTO departments (name)
VALUES ("Sales"), 
       ("Marketing"),
       ("Operations");

INSERT INTO roles (title, salary, department_id)
VALUES ("Sales Manager", 100000, 1),
       ("Agent", 60000, 1),
       ("Marketing Manager", 120000, 2),
       ("Brand Strategist", 90000, 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Jennifer", "Ricker", 1, null),
       ("Michael", "Hermann", 2, 1),
       ("Nicole", "Burnside", 2, 1),
       ("Joshua", "Ritchey", 3, null),
       ("Kevin", "Duval", 4, 3);