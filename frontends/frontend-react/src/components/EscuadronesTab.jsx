export default function EscuadronesTab({ escuadrones }) {
  return (
    <div className="hud-panel">
      <h3>[ ESCUADRONES REGISTRADOS ]</h3>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#8b949e' }}>
            <th>ID</th>
            <th>CÓDIGO</th>
            <th>ESPECIALIDAD</th>
            <th>MISIÓN ASIGNADA</th>
          </tr>
        </thead>
        <tbody>
          {escuadrones.map(e => (
            <tr key={e.id} style={{ borderBottom: '1px solid #21262d', height: '40px' }}>
              <td>#{e.id}</td>
              <td><strong>{e.nombre_codigo}</strong></td>
              <td>{e.especialidad}</td>
              <td>{e.mision_id ? `#${e.mision_id}` : 'SIN ASIGNAR'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}