import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Регистрируем компоненты Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Графики приходов и расходов
const ChartsPage = () => {
  const [data, setData] = useState({ income: {}, expense: {} });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/transactions-summary`);
        
        // Ожидаем данные в формате: [{ userId, userName, income, expense }]
        const formattedData = response.data.reduce(
          (acc, curr) => {
            acc.income.labels.push(curr.userName);
            acc.income.data.push(curr.income);

            acc.expense.labels.push(curr.userName);
            acc.expense.data.push(curr.expense);

            return acc;
          },
          {
            income: { labels: [], data: [] },
            expense: { labels: [], data: [] },
          }
        );

        setData(formattedData);
      } catch (error) {
        console.error('Ошибка загрузки данных для графиков:', error);
      }
    };

    fetchData();
  }, []);
  console.log(data.income.data)
  const incomeChartData = {
    labels: data.income.labels,
    datasets: [
      {
        label: 'Приход',
        data: data.income.data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Цвет столбцов
      },
    ],
  };

  const expenseChartData = {
    labels: data.expense.labels,
    datasets: [
      {
        label: 'Расход',
        data: data.expense.data,
        backgroundColor: 'rgba(255, 99, 132, 0.6)', // Цвет столбцов
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} ₽`,
        },
      },
    },
    scales: {
      x: {
        type: 'category', // Обязательно укажите тип шкалы
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#6E3FF2', fontWeight: 'bold' }}>
        Графики приходов и расходов
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" align="center" gutterBottom>
          Приход по пользователям
        </Typography>
        <Bar data={incomeChartData} options={chartOptions} />
      </Box>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" align="center" gutterBottom>
          Расход по пользователям
        </Typography>
        <Bar data={expenseChartData} options={chartOptions} />
      </Box>
    </Box>
  );
};

export default ChartsPage;
