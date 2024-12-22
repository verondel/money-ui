import React, { useState } from "react";
import { AppBar, Tabs, Tab, Box, Typography, Toolbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import ClientsPage from "./ClientsPage";
import ReplenishmentsPage from "./ReplenishmentsPage";
import MainPage from "./MainPage";

// Стили для вкладок с закруглёнными углами
const StyledTab = styled(Tab)({
  textTransform: "none",
  fontSize: "1.1rem",
  fontWeight: "500",
  color: "#6E3FF2",
  margin: "0 10px",
  padding: "10px 30px",
  borderRadius: "25px",
  "&.Mui-selected": {
    color: "#6E3FF2",
    backgroundColor: "#F0E7FF",
    borderRadius: "25px",
  },
  "&:hover": {
    backgroundColor: "#F7F3FF",
    borderRadius: "25px",
  },
});

const Navbar = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box>
      {/* Закреплённый Navbar */}
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid #ddd",
          backgroundColor: "#fff",
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Логотип слева */}
          <Typography
            variant="h6"
            sx={{ color: "#6E3FF2", fontWeight: "bold", cursor: "pointer" }}
          >
            ⚪ money
          </Typography>

          {/* Вкладки по центру */}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Tabs
              value={tabIndex}
              onChange={handleChange}
              TabIndicatorProps={{ style: { display: "none" } }}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <StyledTab label="Главная" />
              <StyledTab label="Клиенты" />
              <StyledTab label="Пополнения" />
              <StyledTab label="Переводы" />
            </Tabs>
          </Box>

          {/* Заглушка справа */}
          <Box sx={{ width: "40px" }} />
        </Toolbar>
      </AppBar>

      {/* Отступ для содержимого */}
      <Box sx={{ mt: 12, p: 3 }}>
        {tabIndex === 0 && <MainPage />}
        {tabIndex === 1 && <ClientsPage />}
        {tabIndex === 2 && <ReplenishmentsPage />}
        {tabIndex === 3 && <Typography variant="h5" align="center">Переводы будут здесь.</Typography>}
      </Box>
    </Box>
  );
};

export default Navbar;
