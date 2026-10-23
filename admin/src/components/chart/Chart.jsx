import React from "react";
import "./chart.css";

import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Chart = ({ data = [], title, dataKey, grid = true }) => {
  console.log(data);

  return (
    <div className="admin-chart">
      {title && <h3 className="chart-title">{title}</h3>}

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 12,
              left: -15,
              bottom: 0,
            }}
          >
            {grid && (
              <CartesianGrid
                stroke="rgba(30, 58, 47, 0.08)"
                strokeDasharray="4 4"
                vertical={false}
              />
            )}

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgba(30, 58, 47, 0.55)",
                fontSize: 10,
              }}
            />

            <Tooltip
              contentStyle={{
                background: "var(--th-surface-pure)",
                border: "1px solid rgba(30, 58, 47, 0.12)",
                borderRadius: "8px",
                boxShadow: "0 8px 24px rgba(30, 58, 47, 0.08)",
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
              }}
            />

            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="var(--th-accent)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 4,
                fill: "var(--th-accent)",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;
