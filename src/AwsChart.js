import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const AwsChart = ({ chartData }) => {
  // Use useRef to store the chart instance reference
  const chartRef = useRef(null);

  useEffect(() => {
    // If chartData is available
    if (chartData) {
      const ctx = document.getElementById("myChart");
      const chartLabels = chartData.map((zone) => {
        const firstRecord = zone.records.length > 0 ? zone.records[0] : "";
        return firstRecord;
      });
      const chartDataValues = chartData.map((zone) => zone.records.length);

      // Destroy the existing chart instance if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Render the new chart
      chartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: "Number of Records",
              data: chartDataValues,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          indexAxis: "y",
          scales: {
            x: {
              beginAtZero: true,
            },
            y: {
              type: "category",
              beginAtZero: true,
            },
          },
          plugins: {
            scrollbar: {
              enabled: true,
              mode: "x",
              padding: 10,
            },
          },
          layout: {
            padding: {},
          },
          scales: {
            x: {
              barPercentage: 0.4,
            },
          },
        },
      });
    }
  }, [chartData]);

  return <canvas id="myChart" width="400" height="400"></canvas>;
};

export default AwsChart;
