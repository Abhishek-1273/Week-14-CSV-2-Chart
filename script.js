const chartColors = [
  "#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F",
  "#EDC948", "#B07AA1", "#FF9DA7", "#9C755F", "#BAB0AC"
];

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

//  Reusable function
function setupCSVChart(fileInputId, typeInputId, canvasId, downloadBtnId) {
  const fileInput = document.getElementById(fileInputId);
  const chartTypeInput = document.getElementById(typeInputId);
  const ctx = document.getElementById(canvasId).getContext('2d');
  const canvas = ctx.canvas;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  let chartInstance;

  fileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      const rows = text.trim().split('\n').map(r => r.split(','));

      const headers = rows[0];
      const labels = rows.slice(1).map(r => r[0]);
      const data = rows.slice(1).map(r => parseFloat(r[1]));

      console.log("Headers:", headers);
      console.log("Labels:", labels);
      console.log("Data:", data);

      const shuffledColors = shuffle([...chartColors]).slice(0, data.length);

      if (chartInstance) chartInstance.destroy();

      chartInstance = new Chart(ctx, {
        type: chartTypeInput.value || "bar",
        data: {
          labels: labels,
          datasets: [{
            label: headers[1] || "Value",
            data: data,
            backgroundColor: shuffledColors,
            borderColor: "black",
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            datalabels: {
              display: (context) => {
                const type = context.chart.config.type;
                return true;
              },
              color: "#3f3f3fff",
              font: { weight: "bold" },
              align: (context) => {
                const type = context.chart.config.type;
                if (type === "line") return "top";
                return "center";
              },
              anchor: (context) => {
                const type = context.chart.config.type;
                if (type === "bar") return "center";
                return "center";
              },
              offset: (context) => {
                const type = context.chart.config.type;
                if (type === "pie" || type === "doughnut") return 10; return 4;
              },
              formatter: (value, context) => {
                const type = context.chart.config.type;
                if (type === "bar" || type === "line") {
                  return value;
                }
                let label = context.chart.data.labels[context.dataIndex];
                return `${label}: ${value}`;
              }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.label}: ${context.raw}`;
                }
              }
            }
          },
          scales: chartTypeInput.value === "pie" || chartTypeInput.value === "doughnut"
            ? {}
            : {
              y: {
                beginAtZero: true,
                title: { display: true, text: headers[1] || "Y-Axis" },
                ticks: { color: "black" },
                grid: { color: "rgba(0,0,0,0.4)" }
              },
              x: {
                title: { display: true, text: headers[0] || "X-Axis" },
                ticks: { color: "black" },
                grid: { color: "rgba(0,0,0,0.4)" }
              }
            }
        },
        plugins: [ChartDataLabels]
      });
    };
    reader.readAsText(file);
  });

  //  Download button tied to this chart instance
  document.getElementById(downloadBtnId).addEventListener("click", function () {
    if (!chartInstance) return;
    const link = document.createElement('a');
    link.href = chartInstance.toBase64Image('image/png', 1.0);
    link.download = "chart.png";
    link.click();
  });
}

//  Setup charts
setupCSVChart("csvFile1", "type1", "Chart1", "download1");
setupCSVChart("csvFile2", "type2", "Chart2", "download2");
setupCSVChart("csvFile3", "type3", "Chart3", "download3");
setupCSVChart("csvFile4", "type4", "Chart4", "download4");
