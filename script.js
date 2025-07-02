const model = { centroids: [], feature_names: [] };
let clusterData = [];
let chart;

fetch('kmeans_model_bestk.json')
  .then(res => res.json())
  .then(data => {
    model.centroids = data.centroids;
    model.feature_names = data.feature_names;
    initInputs();
  })
  .catch(err => alert('Gagal memuat model: ' + err));

function showMenu(menuId, event) {
  document.querySelectorAll('main > section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById(menuId).classList.add('active');
  event.target.classList.add('active');

  if (menuId === 'menu-chart') updateChart();
  if (menuId === 'menu-history') updateTable();
}

function initInputs() {
  const container = document.getElementById("inputFields");
  container.innerHTML = "";
  model.feature_names.forEach((name, i) => {
    container.innerHTML += `
      <label for="f${i}">${name}:</label>
      <input type="number" id="f${i}" />
    `;
  });
}

function addData() {
  const values = model.feature_names.map((_, i) => parseFloat(document.getElementById(`f${i}`).value));
  if (values.some(v => isNaN(v))) {
    alert("Semua input harus angka!");
    return;
  }

  let minDist = Infinity;
  let cluster = 0;
  model.centroids.forEach((c, i) => {
    const dist = values.reduce((acc, val, j) => acc + Math.pow(val - c[j], 2), 0);
    if (dist < minDist) {
      minDist = dist;
      cluster = i;
    }
  });

  clusterData.push({ features: values, cluster });
  updateTable();
  updateChart();
  model.feature_names.forEach((_, i) => document.getElementById(`f${i}`).value = "");
}

function updateTable() {
  const head = document.getElementById("tableHead");
  const body = document.getElementById("tableBody");
  head.innerHTML = `<tr>${model.feature_names.map(f => `<th>${f}</th>`).join('')}<th>Cluster</th></tr>`;
  body.innerHTML = "";
  clusterData.forEach(d => {
    body.innerHTML += `<tr>${d.features.map(v => `<td>${v}</td>`).join('')}<td>${d.cluster + 1}</td></tr>`;
  });
}

function resetRiwayat() {
  if (confirm("Hapus semua riwayat data?")) {
    clusterData = [];
    updateTable();
    updateChart();
  }
}

function updateChart() {
  const ctx = document.getElementById("clusterChart").getContext("2d");
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];
  const datasets = model.centroids.map((_, k) => ({
    label: `Cluster ${k + 1}`,
    data: clusterData.filter(d => d.cluster === k).map(d => ({
      x: d.features[0],
      y: d.features[1]
    })),
    backgroundColor: colors[k % colors.length]
  }));

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'scatter',
    data: { datasets },
    options: {
      scales: {
        x: { title: { display: true, text: model.feature_names[0] } },
        y: { title: { display: true, text: model.feature_names[1] } }
      },
      plugins: {
        legend: { labels: { color: 'white' } },
        title: { display: true, text: 'Visualisasi Klaster' }
      }
    }
  });
}
