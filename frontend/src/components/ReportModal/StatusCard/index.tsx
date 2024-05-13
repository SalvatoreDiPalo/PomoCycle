import {
  Box,
  BoxProps,
  Paper,
  PaperProps,
  SvgIconProps,
  Typography,
  styled,
} from "@mui/material";

interface StatusCardProps {
  Icon: React.FC<SvgIconProps>;
  label: string;
  value: number | string;
}

const StyledPaper = styled(Paper)<PaperProps>(({ theme }) => ({
  height: 72,
  padding: 8,
  backgroundColor:
    theme.palette.mode === "light" ? "#f2f2f2" : theme.palette.background.paper,
  "> p": {
    textAlign: "right",
  },
}));

const BoxAsHeader = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  "> svg": {
    alignSelf: "center",
  },
}));

export default function StatusCard({ Icon, label, value }: StatusCardProps) {
  return (
    <StyledPaper elevation={3}>
      <BoxAsHeader>
        <Icon />
        <Typography variant="h6">{value}</Typography>
      </BoxAsHeader>
      <Typography variant="overline" component="p">
        {label}
      </Typography>
    </StyledPaper>
  );
}
