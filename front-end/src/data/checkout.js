export function checkoutDestination(state) {
  const path = state?.returnTo;
  return typeof path === "string" && /^\/(?:checkout\/(?:endereco|pagamento|confirmacao)|pedido\/\d+)(?:\?[^#]*)?$/.test(path)
    ? path
    : null;
}

export function loginDestination(state) {
  const path = state?.returnTo;
  const allowed = typeof path === "string" &&
    /^\/(?:admin(?:\/(?:produtos(?:\/\d+)?|pedidos|categorias))?|conta(?:\/pedidos)?)$/.test(path);
  return allowed ? path : checkoutDestination(state);
}
