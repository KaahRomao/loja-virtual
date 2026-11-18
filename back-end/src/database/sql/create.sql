-- Datas em UTC. Valores monetários em centavos inteiros.
PRAGMA foreign_keys = ON;

CREATE TABLE situacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_situacao TEXT NOT NULL UNIQUE,
    data_criado TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE TABLE estado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_estado TEXT NOT NULL,
    data_criado TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE TABLE categoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_categoria TEXT NOT NULL COLLATE NOCASE,
    id_categoria_pai INTEGER,
    status INTEGER NOT NULL DEFAULT (1),
    FOREIGN KEY (id_categoria_pai) REFERENCES categoria (id)
);

CREATE TABLE cliente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_cliente TEXT NOT NULL COLLATE NOCASE,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    telefone TEXT,
    senha TEXT NOT NULL,
    data_criado TEXT NOT NULL DEFAULT (DATETIME('now')),
    status INTEGER NOT NULL DEFAULT (1)
);

CREATE TABLE administrador (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    senha TEXT NOT NULL,
    data_criado TEXT NOT NULL DEFAULT (DATETIME('now')),
    status INTEGER NOT NULL DEFAULT (1)
);

CREATE TABLE produto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_produto TEXT NOT NULL COLLATE NOCASE,
    descricao TEXT NOT NULL COLLATE NOCASE,
    img_url TEXT NOT NULL,
    preco INTEGER NOT NULL CHECK (preco >= 0),
    unidade TEXT NOT NULL DEFAULT '',
    preco_anterior INTEGER CHECK (preco_anterior > preco),
    estoque INTEGER NOT NULL CHECK (estoque >= 0),
    id_categoria INTEGER NOT NULL,
    id_situacao INTEGER NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria (id),
    FOREIGN KEY (id_situacao) REFERENCES situacao (id)
);

CREATE TABLE carrinho (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL UNIQUE,
    atualizado_em TEXT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente (id)
);

CREATE TABLE endereco (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cep TEXT NOT NULL COLLATE NOCASE,
    rua TEXT NOT NULL COLLATE NOCASE,
    numero TEXT NOT NULL COLLATE NOCASE,
    complemento TEXT COLLATE NOCASE,
    bairro TEXT NOT NULL COLLATE NOCASE,
    cidade TEXT NOT NULL COLLATE NOCASE,
    id_estado INTEGER NOT NULL,
    id_cliente INTEGER NOT NULL,
    status INTEGER NOT NULL DEFAULT (1),
    FOREIGN KEY (id_estado) REFERENCES estado (id),
    FOREIGN KEY (id_cliente) REFERENCES cliente (id)
);

CREATE TABLE pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chave_checkout TEXT,
    preferencia_id TEXT,
    preferencia_url TEXT,
    referencia_pagamento TEXT,
    endereco_entrega TEXT NOT NULL,
    cep_entrega TEXT NOT NULL,
    valor_frete INTEGER NOT NULL,
    prazo_entrega INTEGER NOT NULL CHECK (prazo_entrega > 0),
    valor_total INTEGER NOT NULL CHECK (valor_total > 0),
    id_cliente INTEGER NOT NULL,
    data_criado TEXT NOT NULL DEFAULT (DATETIME('now')),
    id_situacao INTEGER NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente (id),
    FOREIGN KEY (id_situacao) REFERENCES situacao (id)
);

CREATE TABLE produto_carrinho (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_carrinho INTEGER NOT NULL,
    id_produto INTEGER NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    UNIQUE (id_carrinho, id_produto),
    FOREIGN KEY (id_carrinho) REFERENCES carrinho (id),
    FOREIGN KEY (id_produto) REFERENCES produto (id)
);

CREATE TABLE produto_pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido INTEGER NOT NULL,
    id_produto INTEGER NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    valor_unitario INTEGER NOT NULL CHECK (valor_unitario > 0),
    UNIQUE (id_pedido, id_produto),
    FOREIGN KEY (id_pedido) REFERENCES pedido (id),
    FOREIGN KEY (id_produto) REFERENCES produto (id)
);

CREATE TABLE pagamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_transacao_externa TEXT NOT NULL UNIQUE,
    forma_pagamento TEXT NOT NULL,
    id_pedido INTEGER NOT NULL,
    data_aprovacao TEXT,
    id_situacao INTEGER NOT NULL,
    data_criado TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (id_pedido) REFERENCES pedido (id),
    FOREIGN KEY (id_situacao) REFERENCES situacao (id)
);

CREATE TRIGGER trg_produto_carrinho_ai
AFTER INSERT ON produto_carrinho
BEGIN
    UPDATE carrinho SET atualizado_em = DATETIME('now') WHERE id = NEW.id_carrinho;
END;

CREATE TRIGGER trg_produto_carrinho_au
AFTER UPDATE ON produto_carrinho
BEGIN
    UPDATE carrinho SET atualizado_em = DATETIME('now') WHERE id = NEW.id_carrinho;
END;

CREATE TRIGGER trg_produto_carrinho_ad
AFTER DELETE ON produto_carrinho
BEGIN
    UPDATE carrinho SET atualizado_em = DATETIME('now') WHERE id = OLD.id_carrinho;
END;

CREATE TRIGGER trg_produto_pedido_baixa_estoque
AFTER INSERT ON produto_pedido
BEGIN
    UPDATE produto SET estoque = estoque - NEW.quantidade WHERE id = NEW.id_produto;
END;

CREATE UNIQUE INDEX IF NOT EXISTS pedido_checkout ON pedido(id_cliente, chave_checkout);
CREATE UNIQUE INDEX IF NOT EXISTS pedido_referencia ON pedido(referencia_pagamento);
