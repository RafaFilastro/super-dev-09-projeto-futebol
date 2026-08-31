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


----------------------------------------------------------------------------------------------------
-- Cadastra o Campeonato Brasileiro Série A de 2026.
INSERT INTO campeonatos (
    nome,
    temporada
)
VALUES (
    'Campeonato Brasileiro Série A',
    2026
);


-- Cadastra os técnicos dos 20 clubes participantes
-- do Campeonato Brasileiro Série A de 2026.
--
-- O campo id não é informado porque é AUTO_INCREMENT.
-- A data de nascimento não será preenchida neste momento,
-- pois essa coluna permite NULL.

INSERT INTO tecnicos (
    nome,
    nacionalidade
)
VALUES
    ('Odair Hellmann', 'Brasileira'),
    ('Eduardo Domínguez', 'Argentina'),
    ('Rogério Ceni', 'Brasileira'),
    ('Rodrigo Bellão', 'Brasileira'),
    ('Rafael Lacerda', 'Brasileira'),
    ('Fernando Diniz', 'Brasileira'),
    ('Fernando Seabra', 'Brasileira'),
    ('Artur Jorge', 'Portuguesa'),
    ('Leonardo Jardim', 'Portuguesa'),
    ('Marcão', 'Brasileira'),
    ('Luís Castro', 'Portuguesa'),
    ('Paulo Pezzolano', 'Uruguaia'),
    ('Rafael Guanaes', 'Brasileira'),
    ('Abel Ferreira', 'Portuguesa'),
    ('Vagner Mancini', 'Brasileira'),
    ('Léo Condé', 'Brasileira'),
    ('Cuca', 'Brasileira'),
    ('Dorival Júnior', 'Brasileira'),
    ('Pedro Emanuel', 'Portuguesa'),
    ('Jair Ventura', 'Brasileira');


-- Cadastra os estádios utilizados pelos clubes do projeto.
-- Flamengo e Fluminense compartilham o Maracanã, por isso
-- existe apenas um registro para esse estádio.

INSERT INTO estadios (
    nome,
    cidade,
    estado,
    capacidade
)
VALUES
    ('Arena da Baixada', 'Curitiba', 'PR', 42372),
    ('Arena MRV', 'Belo Horizonte', 'MG', 46000),
    ('Arena Fonte Nova', 'Salvador', 'BA', 47907),
    ('Estadio Nilton Santos', 'Rio de Janeiro', 'RJ', 46831),
    ('Arena Conda', 'Chapeco', 'SC', 22600),
    ('Neo Quimica Arena', 'Sao Paulo', 'SP', 49205),
    ('Estadio Couto Pereira', 'Curitiba', 'PR', 40502),
    ('Mineirao', 'Belo Horizonte', 'MG', 61846),
    ('Maracana', 'Rio de Janeiro', 'RJ', 78838),
    ('Arena do Gremio', 'Porto Alegre', 'RS', 60540),
    ('Beira-Rio', 'Porto Alegre', 'RS', 50842),
    ('Estadio Jose Maria de Campos Maia', 'Mirassol', 'SP', 15000),
    ('Allianz Parque', 'Sao Paulo', 'SP', 43713),
    ('Estadio Nabi Abi Chedid', 'Braganca Paulista', 'SP', 17724),
    ('Mangueirao', 'Belem', 'PA', 53635),
    ('Vila Belmiro', 'Santos', 'SP', 16068),
    ('Morumbis', 'Sao Paulo', 'SP', 66795),
    ('Sao Januario', 'Rio de Janeiro', 'RJ', 21880),
    ('Barradao', 'Salvador', 'BA', 30618);


-- Cadastra os 20 clubes do projeto.
-- Os IDs dos técnicos e estádios são localizados pelo nome,
-- evitando depender dos valores gerados pelo AUTO_INCREMENT.

INSERT INTO clubes (
    nome,
    cidade,
    estado,
    ano_fundacao,
    id_tecnico,
    id_estadio
)
VALUES
(
    'Athletico Paranaense',
    'Curitiba',
    'PR',
    1924,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Odair Hellmann'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Arena da Baixada'
        LIMIT 1
    )
),
(
    'Atlético Mineiro',
    'Belo Horizonte',
    'MG',
    1908,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Eduardo Domínguez'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Arena MRV'
        LIMIT 1
    )
),
(
    'Bahia',
    'Salvador',
    'BA',
    1931,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Rogério Ceni'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Arena Fonte Nova'
        LIMIT 1
    )
),
(
    'Botafogo',
    'Rio de Janeiro',
    'RJ',
    1904,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Rodrigo Bellão'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Estadio Nilton Santos'
        LIMIT 1
    )
),
(
    'Chapecoense',
    'Chapeco',
    'SC',
    1973,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Rafael Lacerda'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Arena Conda'
        LIMIT 1
    )
),
(
    'Corinthians',
    'Sao Paulo',
    'SP',
    1910,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Fernando Diniz'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Neo Quimica Arena'
        LIMIT 1
    )
),
(
    'Coritiba',
    'Curitiba',
    'PR',
    1909,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Fernando Seabra'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Estadio Couto Pereira'
        LIMIT 1
    )
),
(
    'Cruzeiro',
    'Belo Horizonte',
    'MG',
    1921,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Artur Jorge'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Mineirao'
        LIMIT 1
    )
),
(
    'Flamengo',
    'Rio de Janeiro',
    'RJ',
    1895,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Leonardo Jardim'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Maracana'
        LIMIT 1
    )
),
(
    'Fluminense',
    'Rio de Janeiro',
    'RJ',
    1902,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Marcão'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Maracana'
        LIMIT 1
    )
),
(
    'Grêmio',
    'Porto Alegre',
    'RS',
    1903,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Luís Castro'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Arena do Gremio'
        LIMIT 1
    )
),
(
    'Internacional',
    'Porto Alegre',
    'RS',
    1909,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Paulo Pezzolano'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Beira-Rio'
        LIMIT 1
    )
),
(
    'Mirassol',
    'Mirassol',
    'SP',
    1925,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Rafael Guanaes'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Estadio Jose Maria de Campos Maia'
        LIMIT 1
    )
),
(
    'Palmeiras',
    'Sao Paulo',
    'SP',
    1914,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Abel Ferreira'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Allianz Parque'
        LIMIT 1
    )
),
(
    'Red Bull Bragantino',
    'Braganca Paulista',
    'SP',
    1928,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Vagner Mancini'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Estadio Nabi Abi Chedid'
        LIMIT 1
    )
),
(
    'Remo',
    'Belem',
    'PA',
    1905,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Léo Condé'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Mangueirao'
        LIMIT 1
    )
),
(
    'Santos',
    'Santos',
    'SP',
    1912,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Cuca'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Vila Belmiro'
        LIMIT 1
    )
),
(
    'São Paulo',
    'Sao Paulo',
    'SP',
    1930,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Dorival Júnior'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Morumbis'
        LIMIT 1
    )
),
(
    'Vasco da Gama',
    'Rio de Janeiro',
    'RJ',
    1898,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Pedro Emanuel'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Sao Januario'
        LIMIT 1
    )
),
(
    'Vitória',
    'Salvador',
    'BA',
    1899,
    (
        SELECT id
        FROM tecnicos
        WHERE nome = 'Jair Ventura'
        LIMIT 1
    ),
    (
        SELECT id
        FROM estadios
        WHERE nome = 'Barradao'
        LIMIT 1
    )
);


-- Cadastra jogadores de teste para demonstrar o relacionamento
-- entre jogadores e clubes.
--
-- Estes dados são apenas para desenvolvimento e podem ser
-- substituídos posteriormente por elencos reais.

INSERT INTO jogadores (
    nome,
    numero,
    posicao,
    id_clube
)
VALUES
(
    'Jogador Athletico',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Athletico Paranaense'
        LIMIT 1
    )
),
(
    'Jogador Atlético',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Atlético Mineiro'
        LIMIT 1
    )
),
(
    'Jogador Bahia',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Bahia'
        LIMIT 1
    )
),
(
    'Jogador Botafogo',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Botafogo'
        LIMIT 1
    )
),
(
    'Jogador Chapecoense',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Chapecoense'
        LIMIT 1
    )
),
(
    'Jogador Corinthians',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Corinthians'
        LIMIT 1
    )
),
(
    'Jogador Coritiba',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Coritiba'
        LIMIT 1
    )
),
(
    'Jogador Cruzeiro',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Cruzeiro'
        LIMIT 1
    )
),
(
    'Jogador Flamengo',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Flamengo'
        LIMIT 1
    )
),
(
    'Jogador Fluminense',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Fluminense'
        LIMIT 1
    )
),
(
    'Jogador Grêmio',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Grêmio'
        LIMIT 1
    )
),
(
    'Jogador Internacional',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Internacional'
        LIMIT 1
    )
),
(
    'Jogador Mirassol',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Mirassol'
        LIMIT 1
    )
),
(
    'Jogador Palmeiras',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Palmeiras'
        LIMIT 1
    )
),
(
    'Jogador Bragantino',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Red Bull Bragantino'
        LIMIT 1
    )
),
(
    'Jogador Remo',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Remo'
        LIMIT 1
    )
),
(
    'Jogador Santos',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Santos'
        LIMIT 1
    )
),
(
    'Jogador São Paulo',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'São Paulo'
        LIMIT 1
    )
),
(
    'Jogador Vasco',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Vasco da Gama'
        LIMIT 1
    )
),
(
    'Jogador Vitória',
    9,
    'Atacante',
    (
        SELECT id
        FROM clubes
        WHERE nome = 'Vitória'
        LIMIT 1
    )
);

-- Cadastra partidas fictícias para testar os relacionamentos.
-- Todas pertencem ao Campeonato Brasileiro Série A de 2026.

INSERT INTO partidas (
    data_partida,
    id_campeonato,
    id_mandante,
    id_visitante,
    gols_mandante,
    gols_visitante
)
VALUES
(
    '2026-08-01 16:00:00',
    (
        SELECT id
        FROM campeonatos
        WHERE nome = 'Campeonato Brasileiro Série A'
          AND temporada = 2026
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Corinthians'
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Palmeiras'
        LIMIT 1
    ),
    2,
    1
),
(
    '2026-08-02 18:30:00',
    (
        SELECT id FROM campeonatos
        WHERE nome = 'Campeonato Brasileiro Série A'
          AND temporada = 2026
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Flamengo'
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Fluminense'
        LIMIT 1
    ),
    1,
    1
),
(
    '2026-08-03 20:00:00',
    (
        SELECT id FROM campeonatos
        WHERE nome = 'Campeonato Brasileiro Série A'
          AND temporada = 2026
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Grêmio'
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Internacional'
        LIMIT 1
    ),
    2,
    2
),
(
    '2026-08-04 19:00:00',
    (
        SELECT id FROM campeonatos
        WHERE nome = 'Campeonato Brasileiro Série A'
          AND temporada = 2026
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Santos'
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'São Paulo'
        LIMIT 1
    ),
    1,
    0
),
(
    '2026-08-05 21:00:00',
    (
        SELECT id FROM campeonatos
        WHERE nome = 'Campeonato Brasileiro Série A'
          AND temporada = 2026
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Atlético Mineiro'
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Cruzeiro'
        LIMIT 1
    ),
    2,
    1
),
(
    '2026-08-06 20:30:00',
    (
        SELECT id FROM campeonatos
        WHERE nome = 'Campeonato Brasileiro Série A'
          AND temporada = 2026
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Bahia'
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Vitória'
        LIMIT 1
    ),
    1,
    0
),
(
    '2026-08-07 19:30:00',
    (
        SELECT id FROM campeonatos
        WHERE nome = 'Campeonato Brasileiro Série A'
          AND temporada = 2026
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Athletico Paranaense'
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Coritiba'
        LIMIT 1
    ),
    2,
    0
),
(
    '2026-08-08 18:00:00',
    (
        SELECT id FROM campeonatos
        WHERE nome = 'Campeonato Brasileiro Série A'
          AND temporada = 2026
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Botafogo'
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Vasco da Gama'
        LIMIT 1
    ),
    1,
    1
),
(
    '2026-08-09 16:00:00',
    (
        SELECT id FROM campeonatos
        WHERE nome = 'Campeonato Brasileiro Série A'
          AND temporada = 2026
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Red Bull Bragantino'
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Mirassol'
        LIMIT 1
    ),
    3,
    1
),
(
    '2026-08-10 20:00:00',
    (
        SELECT id FROM campeonatos
        WHERE nome = 'Campeonato Brasileiro Série A'
          AND temporada = 2026
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Chapecoense'
        LIMIT 1
    ),
    (
        SELECT id FROM clubes
        WHERE nome = 'Remo'
        LIMIT 1
    ),
    1,
    0
);


-- Cadastra gols de teste.
-- Cada gol está relacionado a uma partida e a um jogador.

INSERT INTO gols (
    minuto,
    id_partida,
    id_jogador
)
VALUES
(
    23,
    (
        SELECT p.id
        FROM partidas p
        INNER JOIN clubes m
            ON p.id_mandante = m.id
        INNER JOIN clubes v
            ON p.id_visitante = v.id
        WHERE m.nome = 'Corinthians'
          AND v.nome = 'Palmeiras'
        LIMIT 1
    ),
    (
        SELECT id
        FROM jogadores
        WHERE nome = 'Jogador Corinthians'
        LIMIT 1
    )
),
(
    67,
    (
        SELECT p.id
        FROM partidas p
        INNER JOIN clubes m
            ON p.id_mandante = m.id
        INNER JOIN clubes v
            ON p.id_visitante = v.id
        WHERE m.nome = 'Corinthians'
          AND v.nome = 'Palmeiras'
        LIMIT 1
    ),
    (
        SELECT id
        FROM jogadores
        WHERE nome = 'Jogador Corinthians'
        LIMIT 1
    )
),
(
    74,
    (
        SELECT p.id
        FROM partidas p
        INNER JOIN clubes m
            ON p.id_mandante = m.id
        INNER JOIN clubes v
            ON p.id_visitante = v.id
        WHERE m.nome = 'Corinthians'
          AND v.nome = 'Palmeiras'
        LIMIT 1
    ),
    (
        SELECT id
        FROM jogadores
        WHERE nome = 'Jogador Palmeiras'
        LIMIT 1
    )
);

----------------------------------------------------------------------------------------------------
-- CONSULTAS PARA TESTES


-- Exibe clubes com seus técnicos e estádios.
SELECT
    clubes.nome AS clube,
    tecnicos.nome AS tecnico,
    estadios.nome AS estadio
FROM clubes
INNER JOIN tecnicos
    ON clubes.id_tecnico = tecnicos.id
INNER JOIN estadios
    ON clubes.id_estadio = estadios.id
ORDER BY clubes.nome;


-- Exibe os jogadores e seus respectivos clubes.
SELECT
    jogadores.nome AS jogador,
    clubes.nome AS clube
FROM jogadores
INNER JOIN clubes
    ON jogadores.id_clube = clubes.id
ORDER BY clubes.nome;


-- Exibe as partidas com mandante, visitante e campeonato.
SELECT
    mandante.nome AS mandante,
    partidas.gols_mandante,
    partidas.gols_visitante,
    visitante.nome AS visitante,
    campeonatos.nome AS campeonato
FROM partidas
INNER JOIN clubes AS mandante
    ON partidas.id_mandante = mandante.id
INNER JOIN clubes AS visitante
    ON partidas.id_visitante = visitante.id
INNER JOIN campeonatos
    ON partidas.id_campeonato = campeonatos.id
ORDER BY partidas.data_partida;


-- Exibe quem marcou cada gol e em qual minuto.
SELECT
    jogadores.nome AS jogador,
    gols.minuto,
    mandante.nome AS mandante,
    visitante.nome AS visitante
FROM gols
INNER JOIN jogadores
    ON gols.id_jogador = jogadores.id
INNER JOIN partidas
    ON gols.id_partida = partidas.id
INNER JOIN clubes AS mandante
    ON partidas.id_mandante = mandante.id
INNER JOIN clubes AS visitante
    ON partidas.id_visitante = visitante.id;
