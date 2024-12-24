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
  Modal,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { jsPDF } from "jspdf";

// Стили для кнопок и модального окна
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

const StyledButtonSecondary = styled(Button)({
  backgroundColor: "#d32f2f",
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

// const modalStyle = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 500,
//   bgcolor: "background.paper",
//   boxShadow: 24,
//   p: 4,
//   borderRadius: "10px",
// };
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%", // Увеличиваем ширину до 80% от ширины экрана
  height: "27%", // Увеличиваем высоту до 90% от высоты экрана
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "20px",
  overflowY: "auto", // Добавляем прокрутку для контента, если он выходит за пределы окна
};

// Основной компонент
const MainPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

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
    fetchTransactions();
  }, []);

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTransaction(null);
  };

const handleDownload = async () => {
  if (!selectedTransaction) return;

  const { client, bank, amount, date } = selectedTransaction;

  // Получение ID клиента по ФИО
  let clientId = null;
  try {
    const clientResponse = await axios.get(
      `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/client-id`,
      {
        params: {
          name: client.name,
          surname: client.surname,
          middle_name: client.middle_name,
        },
      }
    );
    clientId = clientResponse.data.clientId;
    console.log(clientId)
  } catch (error) {
    console.error("Ошибка получения ID клиента:", error);
    return alert("Не удалось получить данные клиента. Попробуйте позже.");
  }
  console.log(clientId)
  // Получение остатка с сервера
  let userId = clientId;
  let remainingBalance = 0;
  try {
    const balanceResponse = await axios.get(
      `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/balance`,
      {
        params: { userId },
      }
    );
    remainingBalance = balanceResponse.data.balance;
  } catch (error) {
    console.error("Ошибка получения остатка:", error);
    remainingBalance = "Ошибка загрузки";
  }

  // Получение номера телефона клиента с сервера
  let clientNumber = "";
  try {
    const clientNumberResponse = await axios.get(
      `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/client-number`,
      {
        params: { clientId },
      }
    );
    clientNumber = clientNumberResponse.data.phone || client.phone;
  } catch (error) {
    console.error("Ошибка получения номера клиента:", error);
    clientNumber = "Ошибка загрузки";
  }

  // Генератор случайного номера платежа
  const generatePaymentNumber = () => {
    return `B${Math.random().toString().slice(2, 10)}${Math.random().toString().slice(2, 16)}`;
  };

  const paymentNumber = generatePaymentNumber();

  // Создаем Canvas
  const canvas = document.createElement("canvas");
  canvas.width = 400; // Уменьшили ширину
  canvas.height = 600; // Уменьшили высоту
  const ctx = canvas.getContext("2d");

  // Фон и базовые стили
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "14px Arial";
  ctx.fillStyle = "#000000";

  // Номер кошелька
  ctx.fillText("Номер кошелька", 20, 40);
  ctx.font = "16px Arial";
  ctx.fillText(client.wallet, 20, 60);

  // Разделитель
  ctx.strokeStyle = "#cccccc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, 80);
  ctx.lineTo(380, 80);
  ctx.stroke();

  // Дата и время
  ctx.font = "14px Arial";
  ctx.fillText("Дата и время:", 20, 100);
  ctx.fillText(new Date(date).toLocaleString("ru-RU"), 20, 120);

  // ФИО клиента
  ctx.font = "18px Arial bold";
  ctx.fillText(
    `${client.surname} ${client.name} ${client.middle_name.charAt(0)}.`,
    20,
    160
  );

  // Сумма
  ctx.font = "25px Arial bold";
  ctx.fillText(`${amount} ₽`, 20, 200);

  // Остаток
  ctx.font = "14px Arial";
  ctx.fillText("Остаток:", 300, 190);
  ctx.font = "16px Arial";
  ctx.fillText(`${remainingBalance} ₽`, 300, 210);

  // Разделитель
  ctx.strokeStyle = "#cccccc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, 240);
  ctx.lineTo(380, 240);
  ctx.stroke();

  // Детали платежа
  ctx.font = "16px Arial";
  ctx.fillText("Детали платежа", 20, 270);
  ctx.font = "14px Arial";
  ctx.fillText(`Телефон: ${clientNumber}`, 20, 300);
  ctx.fillText(`Банк: ${bank.name}`, 20, 330);

  // Назначение платежа
  ctx.font = "16px Arial";
  ctx.fillText("Назначение платежа", 20, 370);
  ctx.font = "14px Arial";
  ctx.fillText(`Система Быстрых Платежей`, 20, 400);
  ctx.fillText(`Пополнение счета в ${bank.name}`, 20, 420);
  ctx.fillText(`Платеж № ${paymentNumber}`, 20, 440);

  // Конвертация Canvas в изображение и добавление в PDF
  const imgData = canvas.toDataURL("image/png");
  const doc = new jsPDF({
    unit: "px",
    format: "a4",
  });

  // Смещаем чек влево и уменьшаем его на странице
  doc.addImage(imgData, "PNG", 40, 20, 300, 450);
  doc.save("payment-details.pdf");
  handleCloseModal();
};

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: "#6E3FF2", fontWeight: "bold" }}>
        Все транзакции
      </Typography>

      <Box sx={{ mt: 3, mb: 3, display: "flex", justifyContent: "center", gap: 2 }}>
        <TextField
          label="Фильтр по клиенту"
          variant="outlined"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ width: "300px" }}
        />
        <StyledButton onClick={() => fetchTransactions(filter)}>Фильтровать</StyledButton>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Клиент</TableCell>
              <TableCell>Кошелёк</TableCell>
              <TableCell>Банк</TableCell>
              <TableCell align="right">Сумма</TableCell>
              <TableCell align="center">Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                onClick={() => handleRowClick(transaction)}
                sx={{ cursor: "pointer" }}
              >
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
                <TableCell>{transaction.client.wallet}</TableCell>
                <TableCell>{transaction.bank.name}</TableCell>
                <TableCell align="right">{transaction.amount}</TableCell>
                <TableCell align="center">{transaction.approved ? "✅" : "❌"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {selectedTransaction && (
            <Box id="transaction-check">
              <Typography variant="h5" align="center" gutterBottom sx={{ color: "#6E3FF2", fontWeight: "bold" }}>
                Получить чек по транзакции
              </Typography>
              <Box sx={{mt:3}}></Box>
              <TableContainer component={Paper} sx={{ borderRadius: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Дата</TableCell>
                      <TableCell>Клиент</TableCell>
                      <TableCell>Кошелёк</TableCell>
                      <TableCell>Банк</TableCell>
                      <TableCell align="right">Сумма</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ cursor: "pointer" }}>
                      <TableCell>
                        {new Date(selectedTransaction.date).toLocaleString("ru-RU", {
                          timeZone: "Europe/Moscow",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        {selectedTransaction.client.surname} {selectedTransaction.client.name} {selectedTransaction.client.middle_name}
                      </TableCell>
                      <TableCell>{selectedTransaction.client.wallet}</TableCell>
                      <TableCell>{selectedTransaction.bank.name}</TableCell>
                      <TableCell align="right">{selectedTransaction.amount}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>


              {/* <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <strong>Номер кошелька:</strong> {selectedTransaction.client.wallet}
              </Box>
              <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
                <strong>Дата:</strong> {new Date(selectedTransaction.date).toLocaleString("ru-RU")}
              </Box>
              <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
                <strong>Клиент:</strong> {selectedTransaction.client.surname}{" "}
                {selectedTransaction.client.name} {selectedTransaction.client.middle_name}
              </Box>
              <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
                <strong>Банк:</strong> {selectedTransaction.bank.name}
              </Box>
              <Box sx={{ mt: 1, mb: 3, display: "flex", gap: 2 }}>
                <strong>Сумма:</strong> {selectedTransaction.amount} ₽
              </Box> */}
            </Box>
          )}
          <Box sx={{mt:3}}></Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <StyledButtonSecondary onClick={handleCloseModal}>
              Отмена
            </StyledButtonSecondary>
            <StyledButton onClick={handleDownload}>Скачать</StyledButton>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default MainPage;
