# ⚽ Arquivo da Bola — Projeto Futebol

Projeto acadêmico desenvolvido com **FastAPI, MySQL, HTML, CSS e JavaScript**, com foco principal na construção de uma API REST organizada em camadas e integrada a um frontend para gerenciamento e simulação de partidas de futebol.

A aplicação permite cadastrar e relacionar **técnicos, estádios, clubes, jogadores, campeonatos, partidas e gols**, além de acompanhar uma classificação calculada a partir dos jogos realizados e executar uma simulação visual de partidas com persistência dos gols no banco de dados.

---

## 🎯 Objetivo do projeto

O objetivo principal é praticar conceitos de desenvolvimento back-end e banco de dados, aplicando:

- CRUD completo;
- API REST com FastAPI;
- organização em `schemas`, `repositories` e `controllers`;
- conexão com MySQL;
- relacionamentos com chaves estrangeiras;
- consultas com `JOIN`;
- integridade referencial;
- integração entre front-end e back-end;
- uso de Git e branches em trabalho em dupla.

O frontend foi desenvolvido como camada de apresentação para consumir a API e facilitar a demonstração do projeto.

---

## ✨ Funcionalidades

### Cadastros e CRUD

A aplicação possui CRUD completo para:

- Técnicos;
- Estádios;
- Clubes;
- Jogadores;
- Campeonatos;
- Partidas;
- Gols.

Cada entidade possui endpoints para:

```text
GET     listar registros
GET     consultar por ID
POST    cadastrar
PUT     editar
DELETE  excluir
```

---

## 🔗 Relacionamentos do banco

O projeto utiliza relacionamentos entre as entidades para representar a estrutura do futebol.

```text
Técnico ───────┐
               ├── Clube ─── Jogadores
Estádio ───────┘       │
                       │
Campeonato ─────── Partidas
                       │
                       └── Gols ─── Jogador
```

Principais relações:

- um **clube** possui um técnico;
- um **clube** possui um estádio;
- um **jogador** pertence a um clube;
- uma **partida** pertence a um campeonato;
- uma **partida** possui um clube mandante e um visitante;
- um **gol** pertence a uma partida;
- um **gol** possui um jogador responsável.

O MySQL utiliza **InnoDB** para garantir suporte a chaves estrangeiras e integridade referencial.

---

## 🏆 Classificação dos campeonatos

Na página inicial existe uma tabela de classificação construída dinamicamente a partir dos dados reais das partidas cadastradas.

O usuário pode selecionar um campeonato e visualizar estatísticas calculadas com base nos jogos realizados.

A classificação considera:

- pontos;
- partidas jogadas;
- vitórias;
- empates;
- derrotas;
- saldo de gols.

A ordenação utiliza como critérios principais:

1. pontos;
2. vitórias;
3. saldo de gols;
4. gols marcados.

Assim, a classificação não é fixa: ela é recalculada de acordo com os resultados registrados na API.

---

## 🎮 Simulador de partidas

O projeto também possui um simulador de partidas integrado ao backend.

Ao cadastrar uma partida, ela começa com placar:

```text
0 x 0
```

Na tela de competições é possível selecionar **Jogar partida**.

A simulação apresenta:

- cronômetro acelerado de `00'` a `90'`;
- placar em tempo real;
- campo de futebol animado;
- movimentação da bola;
- narração textual;
- aviso visual de `GOOOOL!`;
- autor e minuto de cada gol;
- timeline de lances;
- intervalo aos `45'`;
- mensagem de **PARTIDA ENCERRADA** ao final;
- opção para visualizar o resultado imediatamente.

O endpoint responsável pela simulação é:

```http
POST /partidas/{id}/simular
```

O resultado não existe apenas no frontend. A simulação atualiza o banco de dados.

---

## ⚽ Persistência e sincronização de gols

Os gols gerados pela simulação são persistidos na tabela `gols`.

Cada registro armazena:

- minuto;
- partida;
- jogador que marcou.

Ao mesmo tempo, o placar armazenado em `partidas` é atualizado.

```text
Simulação
   ↓
Resultado da partida
   ↓
Gols gravados em gols
   ↓
Placar atualizado em partidas
   ↓
Frontend recarrega dados reais
```

Também existe uma rotina para manter placares e registros de gols consistentes:

```http
POST /partidas/sincronizar-gols
```

Essa sincronização é útil para partidas antigas que possuíam um placar registrado, mas ainda não tinham a mesma quantidade de registros correspondentes na tabela `gols`.

Ao cadastrar, editar ou excluir gols, o placar da partida é mantido em sincronia com os eventos persistidos.

> Em partidas antigas que tinham apenas o placar salvo, não existe informação suficiente para recuperar o autor histórico de cada gol. Nesses casos, a sincronização cria eventos compatíveis utilizando jogadores cadastrados nos clubes da partida.

---

## 🖥️ Frontend

O frontend foi construído com:

- HTML5;
- CSS3;
- JavaScript;
- Fetch API.

Não foi utilizado framework JavaScript, mantendo o projeto simples e focado na API desenvolvida durante o curso.

### Principais telas

- Página inicial;
- classificação do campeonato;
- clubes;
- jogadores;
- técnicos;
- estádios;
- campeonatos;
- partidas;
- gols;
- central de simulação de partidas.

O frontend consome diretamente os endpoints FastAPI e utiliza os relacionamentos existentes para apresentar nomes ao usuário no lugar de IDs sempre que possível.

Exemplo:

```text
id_clube = 10
       ↓
API /clubes
       ↓
Corinthians
```

---

## 🧱 Arquitetura

O backend segue uma organização em camadas:

```text
Requisição HTTP
      ↓
Controller
      ↓
Repository
      ↓
MySQL
      ↓
Repository
      ↓
Schema
      ↓
Resposta JSON
```

### Schemas

Representam os dados utilizados pela aplicação.

```text
src/schemas/
├── tecnico_schema.py
├── estadio_schema.py
├── clube_schema.py
├── jogador_schema.py
├── campeonato_schema.py
├── partida_schema.py
└── gol_schema.py
```

### Repositories

Responsáveis pelas consultas e alterações no banco.

```text
src/repositories/
├── tecnico_repository.py
├── estadio_repository.py
├── clube_repository.py
├── jogador_repository.py
├── campeonato_repository.py
├── partida_repository.py
└── gol_repository.py
```

### Controllers

Responsáveis pelas rotas HTTP da API.

```text
src/controllers/
├── tecnico_controller.py
├── estadio_controller.py
├── clube_controller.py
├── jogador_controller.py
├── campeonato_controller.py
├── partida_controller.py
└── gol_controller.py
```

---

## 📁 Estrutura do projeto

```text
super-dev-09-projeto-futebol/
├── banco/
│   ├── futebol.sql
│   └── README_BANCO.md
│
├── frontend/
│   ├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js
│   │   └── app.js
│   └── index.html
│
├── src/
│   ├── controllers/
│   ├── database/
│   │   └── conexao.py
│   ├── repositories/
│   ├── schemas/
│   ├── settings/
│   │   └── settings.py
│   └── __init__.py
│
├── app.py
├── .env
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 🛠️ Tecnologias utilizadas

### Backend

- Python;
- FastAPI;
- Uvicorn;
- MySQL Connector/Python;
- Dataclasses;
- python-dotenv.

### Banco de dados

- MySQL;
- InnoDB;
- chaves primárias e estrangeiras;
- `INNER JOIN`;
- `utf8mb4`;
- `utf8mb4_unicode_ci`.

### Frontend

- HTML5;
- CSS3;
- JavaScript;
- Fetch API.

### Ferramentas

- Git;
- GitHub;
- Postman;
- Swagger/OpenAPI;
- DBeaver.

---

## 🌐 Principais rotas da API

### Técnicos

```http
GET    /tecnicos
GET    /tecnicos/{id}
POST   /tecnicos
PUT    /tecnicos/{id}
DELETE /tecnicos/{id}
```

### Estádios

```http
GET    /estadios
GET    /estadios/{id}
POST   /estadios
PUT    /estadios/{id}
DELETE /estadios/{id}
```

### Clubes

```http
GET    /clubes
GET    /clubes/{id}
POST   /clubes
PUT    /clubes/{id}
DELETE /clubes/{id}
```

### Jogadores

```http
GET    /jogadores
GET    /jogadores/{id}
POST   /jogadores
PUT    /jogadores/{id}
DELETE /jogadores/{id}
```

### Campeonatos

```http
GET    /campeonatos
GET    /campeonatos/{id}
POST   /campeonatos
PUT    /campeonatos/{id}
DELETE /campeonatos/{id}
```

### Partidas

```http
GET    /partidas
GET    /partidas/{id}
POST   /partidas
PUT    /partidas/{id}
DELETE /partidas/{id}
POST   /partidas/{id}/simular
POST   /partidas/sincronizar-gols
```

### Gols

```http
GET    /gols
GET    /gols/{id}
POST   /gols
PUT    /gols/{id}
DELETE /gols/{id}
```

---

# 🚀 Como executar o projeto

## 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
cd super-dev-09-projeto-futebol
```

Se já possuir o projeto:

```bash
git switch main
git pull origin main
```

---

## 2. Criar o ambiente virtual

### Linux

```bash
python -m venv env
source env/bin/activate
```

### Windows PowerShell

```powershell
python -m venv env
.\env\Scripts\Activate.ps1
```

---

## 3. Instalar as dependências

```bash
python -m pip install -r requirements.txt
```

---

## 4. Configurar as variáveis de ambiente

Crie o `.env` a partir do exemplo.

### Linux

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Configure:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=SUA_SENHA
DB_NAME=futebol

APP_HOST=127.0.0.1
APP_PORT=8000
```

> O `.env` contém configurações locais e não deve ser enviado ao Git.

---

## 5. Criar o banco de dados

Execute o arquivo:

```text
banco/futebol.sql
```

em uma instância MySQL.

---

## 6. Testar a conexão

```bash
python -c "from src.database.conexao import conectar; conexao = conectar(); print('Conectado:', conexao.is_connected()); conexao.close()"
```

Resultado esperado:

```text
Conectado: True
```

---

## 7. Iniciar a aplicação

Na raiz do projeto:

```bash
python -m uvicorn app:app --reload
```

A aplicação estará disponível em:

```text
Frontend
http://127.0.0.1:8000/

Swagger
http://127.0.0.1:8000/docs
```

O FastAPI também é responsável por servir os arquivos estáticos do frontend.

---

## 🧪 Testes

Os endpoints podem ser testados por:

- frontend;
- Swagger;
- Postman.

Antes de integrar alterações, recomenda-se validar:

```text
GET
GET por ID
POST
PUT
DELETE
relacionamentos
simulação de partidas
persistência dos gols
sincronização do placar
```

Exemplo de teste direto do simulador:

```http
POST /partidas/1/simular
```

---

## 🌿 Fluxo de desenvolvimento com Git

O projeto foi desenvolvido em dupla utilizando branches separadas para reduzir conflitos.

```text
                         main
                           │
                    base compartilhada
                           │
              ┌────────────┴────────────┐
              │                         │
 feature/cadastros-clubes    feature/competicoes-partidas
              │                         │
   técnicos / estádios         campeonatos
   clubes / jogadores          partidas / gols
              │                         │
              └────────────┬────────────┘
                           │
                       integração
                           │
                          main
```

Fluxo utilizado:

```text
criar branch
     ↓
desenvolver
     ↓
testar
     ↓
commit
     ↓
push
     ↓
Pull Request
     ↓
revisão
     ↓
merge na main
```

Antes da integração final, as alterações da `main` foram trazidas para a branch em desenvolvimento para resolver conflitos e testar o projeto completo antes do merge.

---

## 👥 Divisão do desenvolvimento

O backend foi dividido entre os dois integrantes.

### Cadastros e estrutura dos clubes

- técnicos;
- estádios;
- clubes;
- jogadores.

### Competições

- campeonatos;
- partidas;
- gols.

Após a implementação individual, as duas partes foram integradas e testadas em conjunto.

---

## 📚 Conceitos praticados

Durante o desenvolvimento foram trabalhados conceitos como:

- API REST;
- métodos HTTP;
- status HTTP;
- schemas de entrada e saída;
- SQL parametrizado;
- cursores e conexões com banco;
- `commit` de transações;
- `AUTO_INCREMENT`;
- PK e FK;
- integridade referencial;
- `INNER JOIN`;
- relacionamento entre tabelas;
- tratamento de registros inexistentes com `HTTPException`;
- organização em camadas;
- consumo de API com JavaScript;
- atualização dinâmica do DOM;
- persistência de eventos de partida;
- Git, branches, Pull Requests e resolução de conflitos.

---

## 📌 Observações

- Para simular uma partida, os clubes envolvidos precisam possuir jogadores cadastrados.
- O frontend utiliza os dados persistidos pela API; a classificação e os contadores não são valores estáticos.
- O projeto foi desenvolvido com foco didático, priorizando clareza da arquitetura e prática dos conteúdos estudados.
- Caso o navegador mantenha versões antigas de CSS ou JavaScript após uma atualização, utilize `Ctrl + Shift + R` para forçar o recarregamento dos arquivos.

---

## 🎓 Contexto acadêmico

Projeto desenvolvido como atividade do curso **Super.dev / Proway**, com foco principal em **Python, FastAPI, banco de dados MySQL e desenvolvimento de APIs**.

O frontend foi incorporado como uma camada adicional para apresentar visualmente os dados e demonstrar a integração completa entre banco, backend e interface.

---

## ✅ Resultado

O **Arquivo da Bola** evoluiu de um CRUD acadêmico para uma aplicação integrada de futebol capaz de:

```text
cadastrar entidades
        ↓
relacionar dados no MySQL
        ↓
expor informações pela API
        ↓
consumir a API no frontend
        ↓
registrar partidas e gols
        ↓
simular jogos
        ↓
atualizar placares e estatísticas
        ↓
gerar uma classificação dinâmica
```

Isso permite demonstrar em um único projeto conceitos de banco de dados, backend, integração de APIs, frontend e versionamento de código.
