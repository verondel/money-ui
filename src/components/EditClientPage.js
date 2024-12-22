import React from "react";
import { Typography, Box } from "@mui/material";

const EditClientPage = () => {
  return (
    <Box>
      <Typography variant="h5">Редактирование данных клиента</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Здесь будет список клиентов с возможностью поиска по фамилии.
      </Typography>
    </Box>
  );
};

export default EditClientPage;
