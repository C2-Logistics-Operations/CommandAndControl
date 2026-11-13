const getName = (item) => item.item ?? item.nombre ?? 'SIN NOMBRE';
const getStock = (item) => {
  const value = Number(item.stock_disponible ?? item.cantidad ?? 0);
  return Number.isFinite(value) ? value : 0;
};

export default function SupplyTable({ items = [], loading = false }) {
  if (loading) return <p role="status">Cargando inventario...</p>;
  if (!items.length) return <p>No hay suministros registrados.</p>;

  return (
    <div className="table-container">
      <table className="supply-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Artículo</th>
            <th>Categoría</th>
            <th>Stock disponible</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const stock = getStock(item);
            return (
              <tr key={item.id}>
                <td>#{item.id}</td>
                <td>{getName(item)}</td>
                <td>{item.categoria ?? 'SIN CATEGORÍA'}</td>
                <td>{stock} unidades</td>
                <td>{stock > 0 ? 'Disponible' : 'Sin stock'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
