import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function Sound() {
  const [age, setAge] = useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };
  return (
    <Box>
      <Typography variant="h5" gutterBottom align="left">
        Sound
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <InputLabel
          id="sound-select-label"
          sx={{ alignItems: "center", display: "flex" }}
        >
          Alarm Sound:
        </InputLabel>
        <FormControl>
          <Select
            labelId="sound-select-label"
            id="sound-select"
            value={age}
            onChange={handleChange}
          >
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
