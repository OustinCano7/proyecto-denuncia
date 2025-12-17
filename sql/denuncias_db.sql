//COMANDO PARA ENTRAR EN LA TERMINAL DE PHPMYADMIN:
MYSQL -u root -p

//VER LISTA DE BASES DE DATOS CREADAS:
show databases;

//SELECCIONAR BASE DE DATOS:
USE denuncias_db;

//CREAR BASE DE DATOS:
CREATE DATABASE denuncias_db;

//VER LISTA DE TABLAS:
show tables;

///SELECCIONAR TABLA:
select * from denuncias;
select * from evidencias;
select * from log_sesiones;
select * from usuarios;

//ELIMINAR TABLAS:
DROP TABLE denuncias;
DROP TABLE evidencias;
DROP TABLE log_sesiones;
DROP TABLE usuarios;

//CREAR TABLA:
CREATE TABLE denuncias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anonimo TINYINT(1) NOT NULL DEFAULT 0,
    nombre VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(150),
    tipo_denuncia VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    datos_denunciante TEXT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    direccion VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estatus ENUM('PENDIENTE', 'EN PROCESO', 'RESUELTA', 'CANCELADA') 
        NOT NULL DEFAULT 'PENDIENTE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE evidencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    denuncia_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type ENUM('image', 'video', 'audio', 'document') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_denuncia
        FOREIGN KEY (denuncia_id)
        REFERENCES denuncias(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE log_sesiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL,
    fecha_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    rol ENUM('administrador','operador','usuario') NOT NULL DEFAULT 'usuario',
    clave VARCHAR(255) NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inspecciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    denuncia_id INT NOT NULL,
    fecha_inspeccion DATE NOT NULL,
    observaciones TEXT,
    CONSTRAINT fk_inspeccion_denuncia
    FOREIGN KEY (denuncia_id) REFERENCES denuncias(id)
);

CREATE TABLE actas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    denuncia_id INT NOT NULL,
    descripcion TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo ENUM('ACTA','MULTA') DEFAULT 'ACTA',
    CONSTRAINT fk_acta_denuncia
    FOREIGN KEY (denuncia_id) REFERENCES denuncias(id)
);

CREATE TABLE citatorios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    denuncia_id INT NOT NULL,
    fecha_citatorio DATE NOT NULL,
    observaciones TEXT,
    CONSTRAINT fk_citatorio_denuncia
    FOREIGN KEY (denuncia_id) REFERENCES denuncias(id)
);

CREATE TABLE convenios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    denuncia_id INT NOT NULL,
    acuerdos TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_convenio_denuncia
    FOREIGN KEY (denuncia_id) REFERENCES denuncias(id)
);

CREATE TABLE apoyos_seguridad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    denuncia_id INT NOT NULL,
    corporacion VARCHAR(100),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_apoyo_denuncia
    FOREIGN KEY (denuncia_id) REFERENCES denuncias(id)
);

CREATE TABLE multas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    denuncia_id INT NOT NULL,
    monto DECIMAL(10,2),
    motivo TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

