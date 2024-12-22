import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Modal,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";

// Стили для кнопок банков
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

// Стили для модального окна
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
  outline: "none",
};

const TopUpWalletPage = ({ user }) => {
  const [banks, setBanks] = useState([]); // Список доступных банков
  const [selectedBank, setSelectedBank] = useState(null); // Выбранный банк
  const [amount, setAmount] = useState(""); // Сумма пополнения
  const [limit, setLimit] = useState(0); // Лимит пополнений
  const [monthlyTotal, setMonthlyTotal] = useState(0); // Сумма пополнений за месяц
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const fetchBanks = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/banks`
      );
      setBanks(response.data);
    } catch (error) {
      console.error("Ошибка загрузки банков:", error);
    }
  };


  const fetchLimitAndTransactions = async () => {
    try {
      console.log("Идентификатор пользователя:", user.id); // Проверяем user.id

      // Получение лимита пополнений
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/limits`
      );
      setLimit(response.data.limit);

      // Получение транзакций за последний месяц
      const transactionsResponse = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/monthly-transactions`,
        { userId: user.id }
      );

      // Проверка и установка суммы транзакций
      const total = transactionsResponse.data?.total || 0;
      setMonthlyTotal(total);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Если сервер возвращает 404, установите сумму транзакций в 0
        console.warn("У клиента пока нет транзакций.");
        setMonthlyTotal(0);
      } else {
        // Для других ошибок логируем сообщение
        console.error("Ошибка загрузки данных:", error);
      }
    }
  };


  useEffect(() => {
    fetchBanks();
    fetchLimitAndTransactions();
  }, []);

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
  };

  const handleTopUp = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setSnackbar({
        open: true,
        message: "Введите корректную сумму.",
        severity: "error",
      });
      return;
    }

    if (monthlyTotal + amountNum > limit) {
      setSnackbar({
        open: true,
        message: `Превышен лимит. Пополнения за месяц: ${monthlyTotal}, доступный лимит: ${limit}.`,
        severity: "error",
      });
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/top-up`,
        {
          userId: user.id,
          bankId: selectedBank.id,
          amount: amountNum,
        }
      );
      setSnackbar({
        open: true,
        message: "Пополнение успешно выполнено.",
        severity: "success",
      });
      setAmount(""); // Сброс поля суммы
      setSelectedBank(null); // Закрытие модального окна
    } catch (error) {
      console.error("Ошибка пополнения:", error);
      setSnackbar({
        open: true,
        message: "Ошибка при пополнении. Попробуйте снова.",
        severity: "error",
      });
    }
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Пополнить кошелёк
      </Typography>
      <Typography variant="h6" align="center" gutterBottom>
        {user.name} {user.surname} {user.middle_name}
      </Typography>
      <Typography variant="h6" align="center" gutterBottom>
        Номер кошелька: {user.wallet}
      </Typography>

      <Grid container spacing={3} justifyContent="center" sx={{ mt: 3 }}>
        {banks.map((bank) => (
          <Grid item xs={12} sm={6} md={4} key={bank.id}>
            <StyledButton
              fullWidth
              onClick={() => handleBankSelect(bank)}
            >
              {bank.name}
            </StyledButton>
          </Grid>
        ))}
      </Grid>

      {/* Модальное окно для пополнения */}
      <Modal open={!!selectedBank} onClose={() => setSelectedBank(null)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            {selectedBank?.name}
          </Typography>
          <Typography gutterBottom>
            {user.name} {user.surname} {user.middle_name}
          </Typography>
          <Typography gutterBottom>Кошелёк: {user.wallet}</Typography>
          <Typography gutterBottom>Телефон: {user.phone}</Typography>
          <TextField
            fullWidth
            label="Сумма пополнения"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleTopUp}
          >
            Пополнить
          </Button>
        </Box>
      </Modal>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ fontSize: "1rem", width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TopUpWalletPage;
