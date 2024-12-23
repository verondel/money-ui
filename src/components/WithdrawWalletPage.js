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
  backgroundColor: "#FF6F61", // Цвет для снятия средств
  color: "#FFFFFF",
  borderRadius: "20px",
  fontSize: "1rem",
  fontWeight: "600",
  padding: "10px 20px",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#E65C50",
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

const WithdrawWalletPage = ({ user }) => {
  const [banks, setBanks] = useState([]); // Список доступных банков
  const [selectedBank, setSelectedBank] = useState(null); // Выбранный банк
  const [amount, setAmount] = useState(""); // Сумма снятия
  const [balance, setBalance] = useState(0); // Баланс кошелька
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const fetchBanksAndBalance = async () => {
    try {
      // Запрос банков
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/banks`
      );
      setBanks(response.data);
      console.log('банки ', response.data)

      // Запрос баланса
      // const balanceResponse = await axios.post(
      //   `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/balance`,
      //   { userId: user.id }
      // );
      const balanceResponse = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/balance`, {
        params: { userId: user.id },
      });

      console.log('баланс ', response.data)
      setBalance(balanceResponse.data.balance); // Установка текущего баланса
    } catch (error) {
      console.error("Ошибка загрузки банков и баланса:", error);
    }
  };

  useEffect(() => {
    fetchBanksAndBalance();
  }, []);

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
  };

  const handleWithdraw = async () => {
    const amountNum = parseFloat(amount);

    // Проверяем корректность ввода суммы
    if (isNaN(amountNum) || amountNum <= 0) {
      setSnackbar({
        open: true,
        message: "Введите корректную сумму.",
        severity: "error",
      });
      return;
    }

    // Проверяем, хватает ли средств на балансе
    if (amountNum > balance) {
      setSnackbar({
        open: true,
        message: `Недостаточно средств. Ваш баланс: ${balance} ₽.`,
        severity: "error",
      });
      return;
    }

    try {
      // Выполняем запрос на снятие средств
      await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/withdraw`,
        {
          userId: user.id,
          bankId: selectedBank.id,
          amount: amountNum,
        }
      );

      // Обновляем баланс после успешного снятия
      setBalance(balance - amountNum);

      // Показываем сообщение об успехе
      setSnackbar({
        open: true,
        message: "Снятие успешно выполнено.",
        severity: "success",
      });

      // Сбрасываем поле ввода суммы и закрываем модальное окно
      setAmount(""); // Сброс поля суммы
      setSelectedBank(null); // Закрытие модального окна
      setTimeout(() => {
        window.location.reload(); // Перезагружаем страницу для отрисовки
      }, 500);      
    } catch (error) {
      console.error("Ошибка снятия:", error);
      setSnackbar({
        open: true,
        message: "Ошибка при снятии. Попробуйте снова.",
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
        Снять деньги
      </Typography>
      <Typography variant="h6" align="center" gutterBottom>
        {user.name} {user.surname} {user.middle_name}
      </Typography>
      <Typography variant="h6" align="center" gutterBottom>
        Баланс кошелька: {balance} ₽
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

      {/* Модальное окно для снятия денег */}
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
            label="Сумма снятия"
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
            onClick={handleWithdraw}
          >
            Снять
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

export default WithdrawWalletPage;
