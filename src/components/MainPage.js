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

  const handleDownload = () => {
    if (!selectedTransaction) return;

    const doc = new jsPDF();
    const { client, bank, amount, date } = selectedTransaction;

    // Генерация содержимого PDF
    doc.html(document.querySelector("#transaction-check"), {
      callback: function (doc) {
        doc.save("payment-details.pdf");
      },
    });

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
