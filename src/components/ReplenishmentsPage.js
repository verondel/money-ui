import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Modal,
  Snackbar,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import TopUpWalletPage from "./TopUpWalletPage"; // Подключаем страницу пополнения
import axios from "axios";

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

const ReplenishmentsPage = () => {
  const [searchInput, setSearchInput] = useState(""); // Поле ввода поиска
  const [userData, setUserData] = useState(null); // Данные пользователя
  const [transactions, setTransactions] = useState([]); // Список транзакций пользователя
  const [isModalOpen, setModalOpen] = useState(false); // Модальное окно при отсутствии пользователя
  const [showTopUpPage, setShowTopUpPage] = useState(false); // Показывать страницу пополнения
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSearch = async () => {
    try {
      const [surname, name, middle_name] = searchInput.split(" ");

      if (!name || !surname || !middle_name) {
        setSnackbar({
          open: true,
          message: "Введите полное ФИО через пробел.",
          severity: "error",
        });
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/check-client`,
        { name, surname, middle_name }
      );

      if (response.data.exists) {
        setUserData(response.data.user);
        setTransactions(response.data.transactions);
      } else {
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Ошибка при поиске пользователя:", error);
      setSnackbar({
        open: true,
        message: "Ошибка при поиске. Попробуйте позже.",
        severity: "error",
      });
    }
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleAddUser = () => {
    setModalOpen(false);
    window.location.href = "/add-user";
  };

  const handleShowTopUpPage = () => {
    setShowTopUpPage(true); // Показать страницу пополнения
  };

  const handleBackFromTopUp = () => {
    setShowTopUpPage(false); // Вернуться обратно
  };

  const exportToPDF = () => {
    console.log("Экспортировать в PDF");
  };

  if (showTopUpPage) {
    return <TopUpWalletPage user={userData} onBack={handleBackFromTopUp} />;
  }

  return (
    <Box sx={{ p: 4 }}>
      {!userData && (
        <Box sx={{ maxWidth: "500px", margin: "0 auto" }}>
          <Typography variant="h5" align="center" gutterBottom>
            Найти пользователя
          </Typography>
          <TextField
            fullWidth
            label="Введите ФИО (через пробел)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            variant="outlined"
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleSearch}
          >
            Искать
          </Button>
        </Box>
      )}

      {userData && (
        <Box>
          <Typography variant="h4" align="center" gutterBottom>
            {userData.surname} {userData.name} {userData.middle_name}
          </Typography>
          <Typography variant="h6" align="center" gutterBottom>
            Номер кошелька: {userData.wallet}
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                  <TableCell align="center">Банк</TableCell>
                  <TableCell align="center">Подтверждение</TableCell>
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
                        second: "2-digit",
                      })}
                    </TableCell>
                    <TableCell align="right">{transaction.amount}</TableCell>
                    <TableCell align="center">{transaction.bankName}</TableCell>
                    <TableCell align="center">
                      {transaction.approved ? "✅" : "❌"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={exportToPDF}
              >
                Экспортировать в PDF
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleShowTopUpPage} // Обработчик кнопки "Пополнить кошелёк"
              >
                Пополнить кошелёк
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      <Modal open={isModalOpen} onClose={closeModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Пользователь не найден
          </Typography>
          <Typography gutterBottom>
            К сожалению, такого клиента нет в базе. Хотите его добавить?
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleAddUser}
              >
                Добавить
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={closeModal}
              >
                Отмена
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ fontSize: "1.2rem", width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReplenishmentsPage;
