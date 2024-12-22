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
      {/* </Container> */}
    </Box>
  );
};

export default AddUserPage;
