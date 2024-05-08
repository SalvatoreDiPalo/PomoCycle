import { useSnackbar } from "notistack";
import { Fragment, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

export const useSnackbarWithAction = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleClickWithAction = useCallback(
    (message: string) => {
      enqueueSnackbar(message, {
        variant: "default",
        action: (key) => (
          <Fragment>
            <IconButton aria-label="close" onClick={() => closeSnackbar(key)}>
              <CloseIcon />
            </IconButton>
          </Fragment>
        ),
      });
    },
    [enqueueSnackbar, closeSnackbar]
  );

  return handleClickWithAction;
};
