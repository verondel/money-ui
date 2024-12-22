import React, { useState } from "react";
import { Box, Grid, Typography, Card, CardActionArea, CardContent } from "@mui/material";
import AddUserPage from "./AddUserPage";
import EditClientPage from "./EditClientPage";
import { styled } from "@mui/material/styles";

// Стили для карточек
const StyledCard = styled(Card)({
  borderRadius: "20px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
  },
});

const ClientsPage = () => {
  const [activeView, setActiveView] = useState(null);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "90vh", p: 3 }}>
      {!activeView && (
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={5} md={4}>
            <StyledCard onClick={() => setActiveView("add")}>
              <CardActionArea>
                <CardContent sx={{ textAlign: "center", p: 5 }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6E3FF2" }}>
                    Добавить клиента
                  </Typography>
                </CardContent>
              </CardActionArea>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={5} md={4}>
            <StyledCard onClick={() => setActiveView("edit")}>
              <CardActionArea>
                <CardContent sx={{ textAlign: "center", p: 5 }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6E3FF2" }}>
                    Изменить данные
                  </Typography>
                </CardContent>
              </CardActionArea>
            </StyledCard>
          </Grid>
        </Grid>
      )}

      {activeView === "add" && (
        <Box>
          <AddUserPage />
          <Typography
            onClick={() => setActiveView(null)}
            sx={{ mt: 0, cursor: "pointer", textAlign: "center", color: "#6E3FF2" }}
          >
            Назад
          </Typography>
        </Box>
      )}

      {activeView === "edit" && (
        <Box>
          <EditClientPage />
          <Typography
            onClick={() => setActiveView(null)}
            sx={{ mt: 0, cursor: "pointer", textAlign: "center", color: "#6E3FF2" }}
          >
            Назад
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ClientsPage;
