import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)({
  borderRadius: "20px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  padding: "30px",
  width: "100%",
  maxWidth: "600px",
  margin: "auto",
});

const StyledButton = styled(Button)({
  backgroundColor: "#6E3FF2",
  color: "#FFFFFF",
  borderRadius: "25px",
  fontSize: "1.1rem",
  fontWeight: "600",
  padding: "12px 30px",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#5A2FCC",
  },
});

const theme = createTheme({
  typography: {
    fontFamily: "Montserrat, sans-serif",
  },
});

const AddUserPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    middle_name: "",
    birth: "",
    phone: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
    wallet: "",
  });

  const [isConsentGiven, setIsConsentGiven] = useState(false);

  const validateForm = () => {
    const { name, surname, birth, phone } = formData;
    const currentDate = new Date();
    const birthDate = new Date(birth);
    const age = currentDate.getFullYear() - birthDate.getFullYear();

    if (name.trim().length < 1) {
      setSnackbar({
        open: true,
        message: "Имя должно содержать хотя бы 1 символ.",
        severity: "error",
        wallet: "",
      });
      return false;
    }

    if (surname.trim().length < 1) {
      setSnackbar({
        open: true,
        message: "Фамилия должна содержать хотя бы 1 символ.",
        severity: "error",
        wallet: "",
      });
      return false;
    }

    if (!birth || isNaN(birthDate.getTime()) || age < 18 || age > 100) {
      setSnackbar({
        open: true,
        message: "Возраст должен быть от 18 до 100 лет.",
        severity: "error",
        wallet: "",
      });
      return false;
    }

    if (!/^\+7\d{10}$/.test(phone)) {
      setSnackbar({
        open: true,
        message: "Телефон должен начинаться с +7 и содержать 11 цифр.",
        severity: "error",
        wallet: "",
      });
      return false;
    }

    if (!isConsentGiven) {
      setSnackbar({
        open: true,
        message: "Вы должны дать согласие на обработку персональных данных.",
        severity: "error",
        wallet: "",
      });
      return false;
    }

    return true;
  };

  const generateWallet = () => {
    return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleConsentChange = (e) => {
    setIsConsentGiven(e.target.checked);
  };

  const generateConsentCanvas = () => {
    const { name, surname, middle_name } = formData;
    const fullName = `${surname} ${name} ${middle_name}`;

    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = "16px Arial";
    ctx.fillText("Согласие на обработку персональных данных", 50, 50);

    const text = `Я, ${fullName}, субъект персональных данных, 
в соответствии с Федеральным законом № 152-ФЗ 
«О персональных данных» свободно, в своей воле и в своем интересе, а также 
подтверждая свою дееспособность, ДАЮ СОГЛАСИЕ обществу с ограниченной 
ответственностью небанковской кредитной организации «Мани» (ИНН 7750005725,
ОГРН 1127711000031, город Москва, Садовническая улица, дом 82, строение 2, 
https://money.ru/) (далее — НКО) на обработку моих персональных данных 
на следующих условиях:

Цель обработки: рассмотрение вопроса о соответствии имеющимся вакансиям НКО, 
проведение собеседований.
Обрабатываемые персональные данные относятся к категории «иные».

Я уведомлен, что НКО не осуществляет обработку специальных категорий 
персональных данных и биометрических данных.

Состав обрабатываемых персональных данных: фамилия, имя, адрес электронной 
почты, номер контактного телефона, а также в случае самостоятельного предоставления 
субъектом данных: персональные данные, содержащиеся в резюме и/или портфолио 
(в том числе ссылки на социальные сети, отчество, дата рождения, гражданство, 
сведения о трудовой деятельности) и иные самостоятельно предоставленные данные.

Действия с персональными данными и способы их обработки: автоматизированная и 
неавтоматизированная (смешанная) обработка с совершением НКО следующих действий: 
сбор, запись, систематизация, накопление, хранение, уточнение (обновление, изменение), 
извлечение, использование, удаление, уничтожение персональных данных.

Сроки обработки: согласие действует до достижения цели обработки персональных 
данных или до момента отзыва согласия.

Передача третьим лицам: нет.
Отзыв согласия: Я осведомлен, что согласие может быть отозвано в любой момент 
путем направления письменного заявления по адресу, указанному в начале текста настоящего 
Согласия, или представителю по адресу dpo@money.ru.`;

    const lineHeight = 20;
    const lines = text.split("\n");
    let y = 80;

    for (let line of lines) {
      ctx.fillText(line, 50, y);
      y += lineHeight;
    }

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "consent.png";
    link.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const wallet = generateWallet();
      const dataToSubmit = { ...formData, wallet };
      await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/client`,
        dataToSubmit
      );
      setSnackbar({
        open: true,
        message: `Клиент успешно добавлен! Wallet: ${wallet}`,
        severity: "success",
        wallet,
      });
      setFormData({
        name: "",
        surname: "",
        middle_name: "",
        birth: "",
        phone: "",
      });
      setIsConsentGiven(false);
    } catch (error) {
      console.error("Error adding user:", error);
      setSnackbar({
        open: true,
        message: "Ошибка добавления пользователя. Попробуйте снова.",
        severity: "error",
        wallet: "",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box 
    sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "85vh" }}>
      <StyledCard>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom sx={{ color: "#6E3FF2", fontWeight: "bold" }}>
            Добавить клиента
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Фамилия"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Отчество"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Дата рождения"
                  type="date"
                  name="birth"
                  value={formData.birth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Телефон"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7XXXXXXXXXX"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={isConsentGiven} onChange={handleConsentChange} />}
                  label={
                    <Typography
                      variant="body2"
                      sx={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={generateConsentCanvas}
                    >
                      Согласие на обработку персональных данных
                    </Typography>
                  }
                />
              </Grid>
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <StyledButton type="submit">Добавить клиента</StyledButton>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </StyledCard>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={10000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ fontSize: "1.2rem", width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddUserPage;
