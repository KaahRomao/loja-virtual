-- Catálogo de teste extraído do SQLite versionado, com uma linha por produto.

INSERT INTO estado (id, nome_estado) VALUES
  (1, 'AC'),
  (2, 'AL'),
  (3, 'AP'),
  (4, 'AM'),
  (5, 'BA'),
  (6, 'CE'),
  (7, 'DF'),
  (8, 'ES'),
  (9, 'GO'),
  (10, 'MA'),
  (11, 'MT'),
  (12, 'MS'),
  (13, 'MG'),
  (14, 'PA'),
  (15, 'PB'),
  (16, 'PR'),
  (17, 'PE'),
  (18, 'PI'),
  (19, 'RJ'),
  (20, 'RN'),
  (21, 'RS'),
  (22, 'RO'),
  (23, 'RR'),
  (24, 'SC'),
  (25, 'SP'),
  (26, 'SE'),
  (27, 'TO');

INSERT INTO situacao (id, nome_situacao) VALUES
  (1, 'Ativo'),
  (2, 'Inativo'),
  (3, 'Pendente'),
  (4, 'Pago'),
  (5, 'Enviado'),
  (6, 'Entregue'),
  (7, 'Cancelado'),
  (8, 'Aprovado'),
  (9, 'Recusado');

INSERT INTO categoria (id, nome_categoria, id_categoria_pai, status) VALUES
  (1, 'Hortifruti', NULL, 1),
  (2, 'Mercearia', NULL, 1),
  (3, 'Bebidas', NULL, 1),
  (4, 'Laticínios e Frios', NULL, 1),
  (5, 'Padaria', NULL, 1),
  (6, 'Frutas', 1, 1),
  (7, 'Legumes e Verduras', 1, 1);

INSERT INTO produto (id, nome_produto, descricao, img_url, preco, estoque, id_categoria, id_situacao) VALUES
  (1, 'Banana Prata 1kg', 'Banana prata fresca, vendida por quilo.', '/img/produtos/banana-prata.jpg', 699, 120, 6, 1),
  (2, 'Maçã Fuji 1kg', 'Maçã Fuji selecionada, doce e crocante.', '/img/produtos/maca-fuji.jpg', 1099, 80, 6, 1),
  (3, 'Tomate Italiano 1kg', 'Tomate italiano firme, ideal para molhos e saladas.', '/img/produtos/tomate-italiano.jpg', 849, 90, 7, 1),
  (4, 'Alface Crespa un.', 'Alface crespa fresca, pé inteiro.', '/img/produtos/alface-crespa.jpg', 349, 60, 7, 1),
  (5, 'Arroz Branco Tipo 1 5kg', 'Arroz branco tipo 1, pacote de 5kg.', '/img/produtos/arroz-5kg.jpg', 2790, 150, 2, 1),
  (6, 'Feijão Carioca 1kg', 'Feijão carioca tipo 1, pacote de 1kg.', '/img/produtos/feijao-carioca.jpg', 899, 140, 2, 1),
  (7, 'Macarrão Espaguete 500g', 'Macarrão espaguete de sêmola, 500g.', '/img/produtos/macarrao-espaguete.jpg', 459, 200, 2, 1),
  (8, 'Café Torrado e Moído 500g', 'Café torrado e moído, sabor intenso, 500g.', '/img/produtos/cafe-500g.jpg', 2190, 100, 2, 1),
  (9, 'Suco de Laranja Integral 1L', 'Suco de laranja integral, sem açúcar adicionado.', '/img/produtos/suco-laranja-1l.jpg', 1249, 70, 3, 1),
  (10, 'Água Mineral sem Gás 1,5L', 'Água mineral natural sem gás, garrafa de 1,5L.', '/img/produtos/agua-15l.jpg', 249, 300, 3, 1),
  (11, 'Refrigerante Cola 2L', 'Refrigerante sabor cola, garrafa de 2L.', '/img/produtos/refrigerante-cola-2l.jpg', 999, 110, 3, 1),
  (12, 'Leite Integral 1L', 'Leite integral UHT, caixa de 1L.', '/img/produtos/leite-integral-1l.jpg', 549, 250, 4, 1),
  (13, 'Queijo Mussarela Fatiado 200g', 'Queijo mussarela fatiado, bandeja de 200g.', '/img/produtos/mussarela-200g.jpg', 1599, 60, 4, 1),
  (14, 'Iogurte Natural 170g', 'Iogurte natural integral, pote de 170g.', '/img/produtos/iogurte-natural.jpg', 349, 130, 4, 1),
  (15, 'Pão Francês 500g', 'Pão francês assado no dia, 500g.', '/img/produtos/pao-frances.jpg', 1090, 50, 5, 1),
  (16, 'Pão de Forma Tradicional 500g', 'Pão de forma tradicional, pacote de 500g.', '/img/produtos/pao-de-forma.jpg', 799, 85, 5, 1);
