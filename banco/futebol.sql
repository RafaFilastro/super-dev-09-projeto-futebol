-- Cria o banco de dados futebol caso ele ainda não exista.
-- utf8mb4 permite armazenar acentos, caracteres especiais e emojis.
-- COLLATE define como os textos serão comparados e ordenados.
CREATE DATABASE IF NOT EXISTS futebol
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;


-- Define o banco futebol como o banco que será utilizado
-- pelos próximos comandos.
USE futebol;


-- Cria a tabela de técnicos.
-- O id é a chave primária e será gerado automaticamente.
CREATE TABLE tecnicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    nacionalidade VARCHAR(50),
    data_nascimento DATE
) ENGINE=InnoDB;


-- Cria a tabela de estádios.
-- Essa tabela não possui nenhuma chave estrangeira.
CREATE TABLE estadios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    capacidade INT
) ENGINE=InnoDB;


-- Cria a tabela de campeonatos.
-- YEAR pode ser utilizado aqui porque as temporadas são anos atuais.
CREATE TABLE campeonatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    temporada YEAR NOT NULL
) ENGINE=InnoDB;


-- Cria a tabela de clubes.
-- Cada clube possui um técnico e um estádio relacionados
-- através de chaves estrangeiras.
CREATE TABLE clubes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    ano_fundacao SMALLINT UNSIGNED,
    id_tecnico INT NOT NULL,
    id_estadio INT NOT NULL,

    CONSTRAINT fk_clubes_tecnicos
        FOREIGN KEY (id_tecnico)
        REFERENCES tecnicos(id),

    CONSTRAINT fk_clubes_estadios
        FOREIGN KEY (id_estadio)
        REFERENCES estadios(id)
) ENGINE=InnoDB;


-- Cria a tabela de jogadores.
-- Cada jogador pertence a um clube através da chave
-- estrangeira id_clube.
CREATE TABLE jogadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    numero INT,
    posicao VARCHAR(50),
    data_nascimento DATE,
    id_clube INT NOT NULL,

    CONSTRAINT fk_jogadores_clubes
        FOREIGN KEY (id_clube)
        REFERENCES clubes(id)
) ENGINE=InnoDB;


-- Cria a tabela de partidas.
-- Cada partida pertence a um campeonato e possui dois clubes:
-- um mandante e um visitante.
CREATE TABLE partidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_partida DATETIME NOT NULL,
    id_campeonato INT NOT NULL,
    id_mandante INT NOT NULL,
    id_visitante INT NOT NULL,
    gols_mandante INT DEFAULT 0,
    gols_visitante INT DEFAULT 0,

    CONSTRAINT fk_partidas_campeonatos
        FOREIGN KEY (id_campeonato)
        REFERENCES campeonatos(id),

    CONSTRAINT fk_partidas_mandantes
        FOREIGN KEY (id_mandante)
        REFERENCES clubes(id),

    CONSTRAINT fk_partidas_visitantes
        FOREIGN KEY (id_visitante)
        REFERENCES clubes(id)
) ENGINE=InnoDB;


-- Cria a tabela de gols.
-- Cada gol está relacionado a uma partida e ao jogador
-- responsável pelo gol.
CREATE TABLE gols (
    id INT AUTO_INCREMENT PRIMARY KEY,
    minuto INT NOT NULL,
    id_partida INT NOT NULL,
    id_jogador INT NOT NULL,

    CONSTRAINT fk_gols_partidas
        FOREIGN KEY (id_partida)
        REFERENCES partidas(id),

    CONSTRAINT fk_gols_jogadores
        FOREIGN KEY (id_jogador)
        REFERENCES jogadores(id)
) ENGINE=InnoDB;

