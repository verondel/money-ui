import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";

// Стили для кнопки
const StyledButton = styled(Button)({
  backgroundColor: "#6E3FF2",
  color: "#FFFFFF",
  borderRadius: "20px",
  fontSize: "1rem",
  fontWeight: "600",
  padding: "10px 20px",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#5A2FCC",
  },
});

// Главная страница с таблицей всех транзакций
const MainPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState(""); // Поле для фильтрации по имени клиента

  // Загрузка всех транзакций
  const fetchTransactions = async (clientName = "") => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/all-transactions`,
        { params: { clientName } }
      );
      setTransactions(response.data);
    } catch (error) {
      console.error("Ошибка загрузки транзакций:", error);
    }
  };

  useEffect(() => {
    fetchTransactions(); // Загрузка при инициализации компонента
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleFilterSubmit = () => {
    fetchTransactions(filter); // Загрузка с фильтром
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* <Typography variant="h4" align="center" gutterBottom>
        Все транзакции
      </Typography> */}
      <Typography variant="h4" align="center" gutterBottom sx={{ color: "#6E3FF2", fontWeight: "bold" }}>
        Все транзакции
      </Typography>

      {/* Поле для фильтрации */}
      <Box sx={{ mt:3, mb: 3, display: "flex", justifyContent: "center", gap: 2 }}>
        <TextField
          label="Фильтр по клиенту"
          variant="outlined"
          value={filter}
          onChange={handleFilterChange}
          sx={{ width: "300px" }}
        />
        <StyledButton onClick={handleFilterSubmit}>Фильтровать</StyledButton>
      </Box>

      {/* Таблица с транзакциями */}
      <TableContainer component={Paper} sx={{ borderRadius: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Клиент</TableCell>
              <TableCell>Банк</TableCell>
              <TableCell align="right">Сумма</TableCell>
              <TableCell align="center">Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.date).toLocaleString("ru-RU", {
                    timeZone: "Europe/Moscow",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  {transaction.client.surname} {transaction.client.name} {transaction.client.middle_name}
                </TableCell>
                <TableCell>{transaction.bank.name}</TableCell>
                <TableCell align="right">{transaction.amount}</TableCell>
                <TableCell align="center">
                  {transaction.approved ? "✅" : "❌"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MainPage;
