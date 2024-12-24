import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import axios from 'axios';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const ChartsPage = () => {
  const [data, setData] = useState({ income: {}, expense: {} });
  const [fio, setFio] = useState('');
  const [balanceChartData, setBalanceChartData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/transactions-summary`
        );

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

  const handleFetchBalanceData = async () => {
    try {
      const params = { fio };

      // Добавляем даты, если они указаны
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/balance-history`,
        { params }
      );

      const { transactions } = response.data;

      // Формируем данные для графика
      const labels = transactions.map((txn) => new Date(txn.date));
      const data = transactions.map((txn) => txn.balance);

      setBalanceChartData({
        labels,
        datasets: [
          {
            label: 'Баланс пользователя',
            data,
            borderColor: 'rgba(75, 192, 192, 0.8)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            pointRadius: 5,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)',
            tension: 0.4, // Сглаживание линии
          },
        ],
      });
    } catch (error) {
      console.error('Ошибка получения данных для графика баланса:', error);
    }
  };

  const incomeChartData = {
    labels: data.income.labels,
    datasets: [
      {
        label: 'Приход',
        data: data.income.data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const expenseChartData = {
    labels: data.expense.labels,
    datasets: [
      {
        label: 'Расход',
        data: data.expense.data,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
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
        type: 'category',
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  const balanceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `Баланс: ${context.raw} ₽`,
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'dd.MM.yyyy HH:mm',
        },
        title: {
          display: true,
          text: 'Дата',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Остаток, ₽',
        },
      },
    },
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: '#6E3FF2', fontWeight: 'bold' }}
      >
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

      <Box sx={{ mt: 6 }}>
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{ color: '#6E3FF2', fontWeight: 'bold' }}
        >
          График баланса пользователя
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <TextField
            label="Введите ФИО пользователя"
            variant="outlined"
            value={fio}
            onChange={(e) => setFio(e.target.value)}
            sx={{ width: '300px' }}
          />
          <TextField
            label="Дата начала"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ width: '200px' }}
          />
          <TextField
            label="Дата конца"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            sx={{ width: '200px' }}
          />
          <Button
            variant="contained"
            onClick={handleFetchBalanceData}
            sx={{ backgroundColor: '#6E3FF2' }}
          >
            Построить график
          </Button>
        </Box>

        <Box sx={{ mt: 4 }}>
          {balanceChartData ? (
            <Line data={balanceChartData} options={balanceChartOptions} />
          ) : (
            <Typography align="center" sx={{ color: '#888' }}>
              Введите ФИО и нажмите кнопку, чтобы построить график.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ChartsPage;
