const autocannon = require('autocannon');

async function runBenchmark() {
  console.log('🚀 Iniciando Prueba de Carga Táctica sobre el Sistema C2...\n');

  const instance = autocannon({
    url: 'http://localhost:3000/api/v1/suministros',
    connections: 100, // 100 conexiones concurrentes
    duration: 30,     // 30 segundos de duración
    pipelining: 1,
    headers: {
      'content-type': 'application/json'
    }
  }, (err, result) => {
    if (err) {
      console.error('Error durante la prueba de carga:', err);
    } else {
      console.log('📊 RESULTADOS DEL BENCHMARKING C2:');
      console.log(`- Solicitudes totales: ${result.requests.total}`);
      console.log(`- Rendimiento (Req/seg): ${result.requests.average}`);
      console.log(`- Latencia Media: ${result.latency.average} ms`);
      console.log(`- Latencia p95: ${result.latency.p95} ms`);
      console.log(`- Tasa de Errores: ${result.errors} fallos`);
    }
  });

  autocannon.track(instance, { renderProgressBar: true });
}

runBenchmark();