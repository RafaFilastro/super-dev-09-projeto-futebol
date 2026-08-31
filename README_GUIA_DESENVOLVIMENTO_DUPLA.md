# Guia de Desenvolvimento — Projeto Futebol

Este arquivo serve como referência para **os dois integrantes do projeto**.

A ideia é garantir que ambos trabalhem com os mesmos:

- nomes de arquivos;
- nomes de funções;
- nomes de classes;
- rotas;
- organização de pastas;
- fluxo de Git.

Assim, quando as duas branches forem integradas, o projeto segue um único padrão.

---

# 1. Estrutura geral do projeto

```text
super-dev-09-projeto-futebol/
├── banco/
│   ├── futebol.sql
│   └── README_BANCO.md
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
├── .env
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

---

# 2. Preparar o projeto localmente

## Se ainda não clonou

```bash
git clone URL_DO_REPOSITORIO
cd super-dev-09-projeto-futebol
```

## Se já possui o projeto

```bash
git switch main
git pull origin main
```

---

# 3. Criar o ambiente virtual

## Linux

```bash
python -m venv env
source env/bin/activate
```

## Windows PowerShell

```powershell
python -m venv env
.\env\Scripts\Activate.ps1
```

---

# 4. Instalar as dependências

```bash
python -m pip install -r requirements.txt
```

---

# 5. Criar o arquivo `.env`

## Linux

```bash
cp .env.example .env
```

## Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Depois configurar:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=SUA_SENHA
DB_NAME=futebol

APP_HOST=127.0.0.1
APP_PORT=8000
```

> O arquivo `.env` não deve ser enviado ao Git.

---

# 6. Criar o banco

Executar:

```text
banco/futebol.sql
```

no MySQL.

---

# 7. Testar a conexão com o MySQL

```bash
python -c "from src.database.conexao import conectar; conexao = conectar(); print('Conectado:', conexao.is_connected()); conexao.close()"
```

Resultado esperado:

```text
Conectado: True
```

---

# 8. Divisão do trabalho

## Rafael

Branch:

```text
feature/cadastros-clubes
```

Responsável por:

```text
tecnicos
estadios
clubes
jogadores
```

---

## Dupla

Branch:

```text
feature/competicoes-partidas
```

Responsável por:

```text
campeonatos
partidas
gols
```

---

# 9. Padrão de desenvolvimento

Cada entidade deve possuir:

```text
schema
  ↓
repository
  ↓
controller
  ↓
CRUD
```

O objetivo é que todas sigam a mesma organização.

---

# 10. Arquivos da parte do Rafael

## Schemas

```text
src/schemas/
├── tecnico_schema.py
├── estadio_schema.py
├── clube_schema.py
└── jogador_schema.py
```

## Repositories

```text
src/repositories/
├── tecnico_repository.py
├── estadio_repository.py
├── clube_repository.py
└── jogador_repository.py
```

## Controllers

```text
src/controllers/
├── tecnico_controller.py
├── estadio_controller.py
├── clube_controller.py
└── jogador_controller.py
```

---

# 11. Arquivos da parte da dupla

## Schemas

```text
src/schemas/
├── campeonato_schema.py
├── partida_schema.py
└── gol_schema.py
```

## Repositories

```text
src/repositories/
├── campeonato_repository.py
├── partida_repository.py
└── gol_repository.py
```

## Controllers

```text
src/controllers/
├── campeonato_controller.py
├── partida_controller.py
└── gol_controller.py
```

---

# 12. Estrutura completa esperada

```text
src/
├── controllers/
│   ├── tecnico_controller.py
│   ├── estadio_controller.py
│   ├── clube_controller.py
│   ├── jogador_controller.py
│   ├── campeonato_controller.py
│   ├── partida_controller.py
│   └── gol_controller.py
│
├── database/
│   └── conexao.py
│
├── repositories/
│   ├── tecnico_repository.py
│   ├── estadio_repository.py
│   ├── clube_repository.py
│   ├── jogador_repository.py
│   ├── campeonato_repository.py
│   ├── partida_repository.py
│   └── gol_repository.py
│
├── schemas/
│   ├── tecnico_schema.py
│   ├── estadio_schema.py
│   ├── clube_schema.py
│   ├── jogador_schema.py
│   ├── campeonato_schema.py
│   ├── partida_schema.py
│   └── gol_schema.py
│
└── settings/
    └── settings.py
```

---

# 13. Padrão dos nomes das classes de Schema

Usar nomes no singular e em PascalCase.

```text
Tecnico
Estadio
Clube
Jogador
Campeonato
Partida
Gol
```

Exemplo:

```python
class Tecnico(BaseModel):
    ...
```

Se forem criados schemas diferentes para entrada e saída, manter padrão como:

```text
TecnicoCriar
TecnicoAtualizar
TecnicoResposta
```

Aplicar o mesmo padrão para todas as entidades.

---

# 14. Padrão de funções nos repositories

Usar os mesmos nomes em todos:

```text
listar()
buscar_por_id()
cadastrar()
atualizar()
excluir()
```

Exemplo:

```python
def listar():
    ...

def buscar_por_id(id: int):
    ...

def cadastrar(...):
    ...

def atualizar(id: int, ...):
    ...

def excluir(id: int):
    ...
```

Evitar misturar padrões como:

```text
get_all()
find_by_id()
create()
delete()
```

em uma entidade e português em outra.

O projeto deve seguir um único padrão em português.

---

# 15. Padrão de rotas

Todas as rotas devem usar nomes no plural.

## Técnicos

```http
GET    /tecnicos
GET    /tecnicos/{id}
POST   /tecnicos
PUT    /tecnicos/{id}
DELETE /tecnicos/{id}
```

## Estádios

```http
GET    /estadios
GET    /estadios/{id}
POST   /estadios
PUT    /estadios/{id}
DELETE /estadios/{id}
```

## Clubes

```http
GET    /clubes
GET    /clubes/{id}
POST   /clubes
PUT    /clubes/{id}
DELETE /clubes/{id}
```

## Jogadores

```http
GET    /jogadores
GET    /jogadores/{id}
POST   /jogadores
PUT    /jogadores/{id}
DELETE /jogadores/{id}
```

## Campeonatos

```http
GET    /campeonatos
GET    /campeonatos/{id}
POST   /campeonatos
PUT    /campeonatos/{id}
DELETE /campeonatos/{id}
```

## Partidas

```http
GET    /partidas
GET    /partidas/{id}
POST   /partidas
PUT    /partidas/{id}
DELETE /partidas/{id}
```

## Gols

```http
GET    /gols
GET    /gols/{id}
POST   /gols
PUT    /gols/{id}
DELETE /gols/{id}
```

---

# 16. Ordem recomendada para desenvolver

## Rafael

Desenvolver uma entidade completa antes de começar a próxima:

```text
tecnicos
   ↓
estadios
   ↓
clubes
   ↓
jogadores
```

Para cada uma:

```text
schema
  ↓
repository
  ↓
controller
  ↓
teste
```

---

## Dupla

Sugestão:

```text
campeonatos
   ↓
partidas
   ↓
gols
```

Também seguindo:

```text
schema
  ↓
repository
  ↓
controller
  ↓
teste
```

---

# 17. Arquivos compartilhados

Evitar editar ao mesmo tempo arquivos centrais como:

```text
app.py
main.py
```

ou qualquer outro arquivo que registre todos os routers.

Cada pessoa cria seus controllers normalmente em sua branch.

Na integração final, os routers serão adicionados juntos ao arquivo principal.

Isso reduz conflitos de Git.

---

# 18. Fluxo das branches

```text
                         main
                           │
                   base compartilhada
                           │
              ┌────────────┴────────────┐
              │                         │
 feature/cadastros-clubes    feature/competicoes-partidas
              │                         │
           Rafael                      Dupla
              │                         │
         tecnicos                  campeonatos
         estadios                  partidas
         clubes                    gols
         jogadores
              │                         │
              └────────────┬────────────┘
                           │
                       integração
                           │
                          main
```

---

# 19. Commits

Antes:

```bash
git status
```

Adicionar alterações:

```bash
git add .
```

Exemplos de commits:

```bash
git commit -m "feat: implementa CRUD de tecnicos"
```

```bash
git commit -m "feat: implementa CRUD de campeonatos"
```

```bash
git commit -m "feat: implementa CRUD de partidas"
```

Para o primeiro push da branch:

## Rafael

```bash
git push -u origin feature/cadastros-clubes
```

## Dupla

```bash
git push -u origin feature/competicoes-partidas
```

Depois:

```bash
git push
```

---

# 20. Antes da integração

Cada pessoa deve conferir:

```text
schema funcionando
repository funcionando
controller funcionando
GET funcionando
GET por ID funcionando
POST funcionando
PUT funcionando
DELETE funcionando
```

Testar no Swagger ou Postman.

---

# 21. Regra para a integração

Não fazer merge direto na `main` sem testar as duas partes juntas.

Fluxo:

```text
trabalhar na branch
        ↓
testar
        ↓
commit
        ↓
push
        ↓
integrar as duas branches
        ↓
registrar todos os routers
        ↓
testar API completa
        ↓
merge final na main
```

---

# 22. Resumo dos padrões combinados

```text
Tabelas:
plural

Arquivos:
singular_schema.py
singular_repository.py
singular_controller.py

Classes:
PascalCase no singular

Funções repository:
listar
buscar_por_id
cadastrar
atualizar
excluir

Rotas:
plural

Código:
nomes em português

Git:
cada integrante trabalha em sua própria branch
```

O mais importante é que os dois usem os mesmos padrões durante todo o projeto.
