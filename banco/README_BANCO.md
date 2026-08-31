# Banco de Dados — Projeto Futebol

Este arquivo serve como **guia de estudo** do banco de dados do projeto de futebol.

A ideia é registrar os principais conceitos usados na criação do banco e explicar
de forma simples o papel de cada um.

---

## 1. Estrutura geral do banco

O banco possui as seguintes tabelas:

- `tecnicos`
- `estadios`
- `campeonatos`
- `clubes`
- `jogadores`
- `partidas`
- `gols`

### Relacionamentos principais

```text
TECNICOS ─────┐
              │
              ▼
            CLUBES ◄──── ESTADIOS
              │
              ▼
          JOGADORES
              │
              ▼
            GOLS
              ▲
              │
           PARTIDAS
          /    │    \
         /     │     \
    CLUBE  CAMPEONATO  CLUBE
   mandante            visitante
```

---

## 2. `utf8mb4`

Exemplo:

```sql
CHARACTER SET utf8mb4
```

O `utf8mb4` define **quais caracteres o banco consegue armazenar**.

Ele permite guardar corretamente textos com:

```text
João
Grêmio
São Paulo
Técnico
Ação
⚽
```

Também permite armazenar emojis.

> **Resumo:** `utf8mb4` = quais caracteres o banco pode armazenar.

---

## 3. `COLLATE`

Exemplo:

```sql
COLLATE utf8mb4_unicode_ci
```

O `COLLATE` define **como os textos serão comparados e ordenados**.

A parte `ci` significa:

```text
Case Insensitive
```

Ou seja, nas comparações, o banco normalmente não diferencia maiúsculas de
minúsculas.

Exemplo:

```text
Corinthians
corinthians
CORINTHIANS
```

Em uma comparação usando uma collation `ci`, esses valores normalmente serão
considerados equivalentes.

Importante: o `COLLATE` **não altera o texto salvo**.

Se for salvo:

```text
Corinthians
```

o banco continua armazenando:

```text
Corinthians
```

> **Resumo:** `COLLATE` = define como os textos serão comparados e ordenados.

---

## 4. `ENGINE=InnoDB`

Exemplo:

```sql
ENGINE=InnoDB;
```

O `InnoDB` é o mecanismo de armazenamento utilizado pelo MySQL para gerenciar
a tabela.

Ele oferece recursos importantes como:

- Foreign Keys;
- transações;
- integridade referencial;
- recuperação após falhas;
- controle de alterações concorrentes.

Para este projeto, um dos pontos mais importantes é o suporte às
**Foreign Keys**.

Exemplo:

Se um clube possuir:

```text
id_tecnico = 500
```

mas não existir nenhum:

```text
tecnicos.id = 500
```

a Foreign Key pode impedir esse cadastro.

Isso ajuda a evitar dados inválidos dentro do banco.

### Por que não validar apenas no frontend?

Porque o frontend não é a única forma de acessar o sistema.

Os dados também podem chegar por:

```text
Frontend
   ↓
Backend
   ↓
Banco
```

ou diretamente por ferramentas como:

```text
Postman → Backend
```

Também podem existir scripts ou acessos diretos ao banco.

Por isso:

- o **frontend** ajuda na experiência do usuário;
- o **backend** aplica regras de negócio e validações;
- o **banco** garante a integridade dos dados.

> **Resumo:** `InnoDB` = mecanismo que gerencia a tabela e oferece recursos
> como Foreign Keys e transações.

---

## 5. `PRIMARY KEY` — PK

Exemplo:

```sql
id INT AUTO_INCREMENT PRIMARY KEY
```

`PRIMARY KEY` significa **Chave Primária**.

Ela identifica de forma única cada registro da tabela.

Exemplo:

```text
tecnicos

id | nome
---|----------------
1  | Abel Ferreira
2  | Fernando Diniz
```

O `id` identifica cada técnico.

Não podem existir dois registros com a mesma Primary Key.

> **Forma simples de lembrar:** PK = quem eu sou.

---

## 6. `AUTO_INCREMENT`

Exemplo:

```sql
id INT AUTO_INCREMENT PRIMARY KEY
```

O `AUTO_INCREMENT` faz o próprio MySQL gerar os IDs.

Por exemplo:

```text
Primeiro técnico  → id = 1
Segundo técnico   → id = 2
Terceiro técnico  → id = 3
```

Assim, não precisamos controlar os IDs manualmente.

---

## 7. `FOREIGN KEY` — FK

`FOREIGN KEY` significa **Chave Estrangeira**.

É uma coluna usada para relacionar um registro com outra tabela.

Exemplo:

```text
tecnicos

id | nome
---|---------------
1  | Abel Ferreira
```

E:

```text
clubes

id | nome      | id_tecnico
---|-----------|-----------
1  | Palmeiras | 1
```

O valor:

```text
id_tecnico = 1
```

aponta para:

```text
tecnicos.id = 1
```

Então:

```text
Palmeiras
    │
    │ id_tecnico = 1
    ▼
Abel Ferreira
```

> **Forma simples de lembrar:** FK = com quem estou relacionado.

---

## 8. `REFERENCES`

Exemplo:

```sql
FOREIGN KEY (id_tecnico)
REFERENCES tecnicos(id)
```

Isso pode ser lido como:

> O campo `id_tecnico` deve possuir um valor existente na coluna `id`
> da tabela `tecnicos`.

Visualmente:

```text
clubes.id_tecnico
        │
        │ FK
        ▼
tecnicos.id
        PK
```

---

## 9. `CONSTRAINT`

Exemplo:

```sql
CONSTRAINT fk_clubes_tecnicos
    FOREIGN KEY (id_tecnico)
    REFERENCES tecnicos(id)
```

O `CONSTRAINT` está dando um **nome para a regra**.

Neste caso:

```text
fk_clubes_tecnicos
```

Pode ser interpretado como:

```text
fk        = Foreign Key
clubes    = tabela de origem
tecnicos  = tabela relacionada
```

A regra completa significa:

> Crie uma restrição chamada `fk_clubes_tecnicos`, dizendo que
> `clubes.id_tecnico` é uma Foreign Key que aponta para `tecnicos.id`.

Também seria possível criar uma Foreign Key sem dar um nome manual para ela,
mas nomear as constraints deixa o banco mais organizado.

---

## 10. Exemplo completo de relacionamento

```sql
CREATE TABLE clubes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    id_tecnico INT NOT NULL,

    CONSTRAINT fk_clubes_tecnicos
        FOREIGN KEY (id_tecnico)
        REFERENCES tecnicos(id)
) ENGINE=InnoDB;
```

Nesse exemplo:

- `clubes.id` é a PK da tabela `clubes`;
- `clubes.id_tecnico` é uma FK;
- `tecnicos.id` é a PK para onde a FK aponta.

---

## 11. `INNER JOIN`

A Foreign Key e o `INNER JOIN` possuem funções diferentes.

### Foreign Key

Serve para:

```text
criar e proteger o relacionamento
```

### INNER JOIN

Serve para:

```text
consultar dados de tabelas relacionadas
```

Exemplo:

```sql
SELECT
    clubes.nome,
    tecnicos.nome
FROM clubes
INNER JOIN tecnicos
    ON clubes.id_tecnico = tecnicos.id;
```

A parte:

```sql
ON clubes.id_tecnico = tecnicos.id
```

diz:

> Junte o clube ao técnico quando o `id_tecnico` do clube for igual ao
> `id` do técnico.

Exemplo:

```text
clubes

nome      | id_tecnico
Palmeiras | 1
              │
              ▼

tecnicos

id | nome
1  | Abel Ferreira
```

Resultado:

```text
Palmeiras | Abel Ferreira
```

> **Forma simples de lembrar:** FK relaciona e protege. JOIN consulta.

---

## 12. Relação `1:N`

Exemplo:

```text
CLUBE
  │
  ├── Jogador 1
  ├── Jogador 2
  ├── Jogador 3
  └── Jogador 4
```

Um clube pode possuir vários jogadores.

Isso é uma relação:

```text
1:N
```

Ou:

```text
um para muitos
```

Nesse caso, a Foreign Key normalmente fica no lado dos muitos:

```text
jogadores.id_clube
```

apontando para:

```text
clubes.id
```

---

## 13. `SMALLINT UNSIGNED`

No projeto usamos:

```sql
ano_fundacao SMALLINT UNSIGNED
```

`SMALLINT` é um tipo usado para armazenar números inteiros menores.

No MySQL:

```text
SMALLINT
-32768 até 32767
```

Com `UNSIGNED`, não são permitidos valores negativos.

Então a faixa passa a ser:

```text
0 até 65535
```

Isso é suficiente para armazenar anos como:

```text
1895
1898
1910
1924
2026
```

### Por que não usamos `YEAR`?

O tipo `YEAR` do MySQL possui uma faixa específica e não aceita alguns anos
anteriores a 1901.

Como existem clubes fundados antes disso, por exemplo:

```text
Flamengo       1895
Vasco da Gama  1898
Vitória        1899
```

foi mais adequado usar:

```sql
SMALLINT UNSIGNED
```

### Por que não usar `INT`?

Também funcionaria.

Porém, um `INT` suporta números muito maiores do que precisamos para um ano.

Então:

```sql
SMALLINT UNSIGNED
```

representa melhor esse tipo de informação.

> **Resumo:** `SMALLINT UNSIGNED` = número inteiro pequeno que não aceita
> valores negativos.

---

## 14. `NOT NULL`

Exemplo:

```sql
nome VARCHAR(100) NOT NULL
```

`NOT NULL` significa que o campo é obrigatório.

Isso não seria permitido:

```text
nome = NULL
```

Já uma coluna sem `NOT NULL` pode ficar sem valor.

Exemplo:

```sql
data_nascimento DATE
```

Nesse caso:

```text
data_nascimento = NULL
```

é permitido.

`NULL` significa que **não existe um valor informado para aquele campo**.

---

## 15. `DEFAULT`

Exemplo usado em `partidas`:

```sql
gols_mandante INT DEFAULT 0
```

Isso significa:

> Se nenhum valor for informado, use `0`.

Por exemplo, uma partida recém-criada pode começar como:

```text
gols_mandante = 0
gols_visitante = 0
```

---

## 16. `DATE` e `DATETIME`

### `DATE`

Guarda apenas a data:

```text
2026-08-31
```

Exemplo:

```sql
data_nascimento DATE
```

### `DATETIME`

Guarda data e horário:

```text
2026-08-31 16:00:00
```

Exemplo:

```sql
data_partida DATETIME
```

Para partidas, `DATETIME` faz sentido porque precisamos saber o dia e o
horário do jogo.

---

## 17. Por que a ordem das tabelas importa?

Uma tabela referenciada precisa existir antes da tabela que possui a Foreign
Key.

Exemplo:

```text
tecnicos
    ↓
 clubes
```

Como `clubes` possui:

```sql
REFERENCES tecnicos(id)
```

a tabela `tecnicos` deve existir primeiro.

Ordem usada no projeto:

```text
1. tecnicos
2. estadios
3. campeonatos
4. clubes
5. jogadores
6. partidas
7. gols
```

---

## 18. Ordem dos `INSERT`

Os dados também devem respeitar os relacionamentos.

Não podemos cadastrar um clube apontando para um técnico que ainda não existe.

Por isso:

```text
1. campeonatos
2. tecnicos
3. estadios
4. clubes
5. jogadores
6. partidas
7. gols
```

---

## 19. Apagando e recriando o banco

Durante o desenvolvimento, podemos apagar todo o banco:

```sql
DROP DATABASE IF EXISTS futebol;
```

Depois recriar:

```sql
CREATE DATABASE futebol
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE futebol;
```

Isso é útil para testar se o arquivo SQL consegue criar o projeto inteiro do
zero.

---

## 20. Resumo rápido para estudo

| Conceito | Significado |
|---|---|
| `utf8mb4` | Define quais caracteres podem ser armazenados |
| `COLLATE` | Define como textos são comparados e ordenados |
| `InnoDB` | Mecanismo que gerencia a tabela |
| `PRIMARY KEY` | Identifica exclusivamente um registro |
| `FOREIGN KEY` | Relaciona um registro com outra tabela |
| `REFERENCES` | Indica para onde a Foreign Key aponta |
| `CONSTRAINT` | Dá um nome a uma regra/restrição |
| `INNER JOIN` | Consulta dados de tabelas relacionadas |
| `AUTO_INCREMENT` | Gera automaticamente o próximo ID |
| `NOT NULL` | Torna uma coluna obrigatória |
| `DEFAULT` | Define um valor padrão |
| `SMALLINT UNSIGNED` | Inteiro pequeno sem valores negativos |
| `DATE` | Armazena uma data |
| `DATETIME` | Armazena uma data e horário |

---

## 21. Frases para memorizar

```text
PK = quem eu sou.

FK = com quem estou relacionado.

FK relaciona e protege.
JOIN consulta.

utf8mb4 = quais caracteres posso guardar.

COLLATE = como os textos serão comparados.

InnoDB = mecanismo que gerencia a tabela.

NOT NULL = campo obrigatório.

AUTO_INCREMENT = o MySQL gera o próximo ID.
```

---

## 22. Próxima etapa do projeto

Depois do banco de dados, o backend seguirá aproximadamente esta estrutura:

```text
BANCO MYSQL
    ↓
CONFIGURAÇÕES
    ↓
CONEXÃO
    ↓
SCHEMAS
    ↓
REPOSITORIES
    ↓
CONTROLLERS
    ↓
FASTAPI
    ↓
SWAGGER / POSTMAN
    ↓
FRONTEND
```

A ideia é desenvolver primeiro uma entidade completa, como `tecnicos`, e
depois repetir o padrão para as demais entidades.
