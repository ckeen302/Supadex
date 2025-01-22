import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceHistoryProps {
  priceHistory: { date: string; price: number }[];
}

const PriceHistoryChart: React.FC<PriceHistoryProps> = ({ priceHistory }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={priceHistory}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(24,191,191,0.2)" />
        <XAxis 
          dataKey="date" 
          stroke="#00FFFF"
          tick={{ fill: '#00FFFF' }}
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis 
          stroke="#00FFFF"
          tick={{ fill: '#00FFFF' }}
          tickFormatter={(value) => `$${value.toFixed(2)}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15,47,47,0.9)',
            border: '1px solid #18BFBF',
            borderRadius: '4px',
          }}
          labelStyle={{ color: '#00FFFF' }}
          itemStyle={{ color: '#00FFFF' }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          labelFormatter={(label) => new Date(label).toLocaleDateString()}
        />
        <Line type="monotone" dataKey="price" stroke="#18BFBF" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PriceHistoryChart;

