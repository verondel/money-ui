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
import { jsPDF } from "jspdf";
import axios from "axios";

// Модальные стили
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

  // Поиск клиента и транзакций
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

  // Генерация PDF отчета
  const generatePDF = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Размеры страницы A4
    const pageWidth = 595.28; // A4 ширина
    const pageHeight = 841.89; // A4 высота
    canvas.width = pageWidth * 2; // High resolution
    canvas.height = pageHeight * 2; // High resolution
    ctx.scale(2, 2); // Scale for high resolution

    // Настройка стилей для текста
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";

    // Оформление ФИО и номера кошелька
    ctx.font = "bold 18px Arial";
    ctx.fillText(
      `ФИО: ${userData.surname} ${userData.name} ${userData.middle_name}`,
      20,
      40
    );
    ctx.font = "16px Arial";
    ctx.fillText(`Кошелёк: ${userData.wallet}`, 20, 70);

    // Отрисовка таблицы
    let startY = 100;

    // Задаем ширину колонок и позиции
    const tableWidth = 550; // Общая ширина таблицы
    const columnWidths = [150, 100, 150, 150]; // Ширина колонок
    const columnPositions = [20]; // Начальная позиция колонок

    // Вычисляем позиции каждой колонки
    for (let i = 0; i < columnWidths.length; i++) {
      columnPositions.push(columnPositions[i] + columnWidths[i]);
    }

    const rowHeight = 30; // Высота строки

    // Рисуем заголовок таблицы
    ctx.fillStyle = "#e0e0e0"; // Светло-серый фон для заголовка
    ctx.fillRect(columnPositions[0], startY, tableWidth, rowHeight);

    // Отрисовка текста заголовка
    ctx.fillStyle = "#000"; // Черный текст
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Дата", columnPositions[0] + 10, startY + 20);
    ctx.fillText("Сумма", columnPositions[1] + 10, startY + 20);
    ctx.fillText("Банк", columnPositions[2] + 10, startY + 20);
    ctx.fillText("Подтверждено", columnPositions[3] + 10, startY + 20);

    // Рисуем границы для заголовка
    ctx.strokeStyle = "#000"; // Черный цвет границ
    ctx.lineWidth = 1;
    columnPositions.forEach((pos, index) => {
      if (index < columnPositions.length - 1) {
        ctx.strokeRect(
          pos,
          startY,
          columnWidths[index],
          rowHeight
        );
      }
    });

    // Рисуем строки с данными
    transactions.forEach((transaction, index) => {
      startY += rowHeight;

      // Отрисовка текста для каждой строки
      ctx.fillStyle = "#000";
      ctx.fillText(
        new Date(transaction.date).toLocaleString("ru-RU", {
          timeZone: "Europe/Moscow",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        columnPositions[0] + 10,
        startY + 20
      );
      ctx.fillText(transaction.amount.toString(), columnPositions[1] + 10, startY + 20);
      ctx.fillText(transaction.bankName || "—", columnPositions[2] + 10, startY + 20);
      ctx.fillText(transaction.approved ? "Да" : "Нет", columnPositions[3] + 10, startY + 20);

      // Рисуем границы для строки
      columnPositions.forEach((pos, index) => {
        if (index < columnPositions.length - 1) {
          ctx.strokeRect(
            pos,
            startY,
            columnWidths[index],
            rowHeight
          );
        }
      });
    });

    // Генерация изображения из canvas
    const imgData = canvas.toDataURL("image/png");

    // Генерация PDF с высоким разрешением
    const pdf = new jsPDF("portrait", "pt", [pageWidth, pageHeight]);
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save(`${userData.surname}_${userData.name}_отчет.pdf`);
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
    setShowTopUpPage(true);
  };

  const handleBackFromTopUp = () => {
    setShowTopUpPage(false);
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
                onClick={generatePDF}
              >
                Экспортировать в PDF
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleShowTopUpPage}
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
