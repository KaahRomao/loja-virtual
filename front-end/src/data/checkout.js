export function checkoutDestination(state) {
  const path = state?.returnTo;
  return typeof path === "string" && /^\/(?:checkout\/(?:endereco|pagamento|confirmacao)|pedido\/\d+)(?:\?[^#]*)?$/.test(path)
    ? path
    : null;
}
