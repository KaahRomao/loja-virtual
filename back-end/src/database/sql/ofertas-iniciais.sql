UPDATE produto SET preco_anterior = preco, preco = 599
WHERE img_url = '/img/produtos/banana-prata.jpg' AND nome_produto = 'Banana Prata 1kg'
  AND preco = 699 AND preco_anterior IS NULL AND estoque > 0;

UPDATE produto SET preco_anterior = preco, preco = 2490
WHERE img_url = '/img/produtos/arroz-5kg.jpg' AND nome_produto = 'Arroz Branco Tipo 1 5kg'
  AND preco = 2790 AND preco_anterior IS NULL AND estoque > 0;

UPDATE produto SET preco_anterior = preco, preco = 499
WHERE img_url = '/img/produtos/leite-integral-1l.jpg' AND nome_produto = 'Leite Integral 1L'
  AND preco = 549 AND preco_anterior IS NULL AND estoque > 0;
