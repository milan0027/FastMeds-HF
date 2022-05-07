import React from 'react';
import Close from '@mui/icons-material/Close';
import { IconButton, Box, Button, TextField, AppBar, Toolbar, Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import Transition from './Transition';
// import AutocompleteCategory from './AutocompleteCategory';
import showToast from '../Utils/showToastNotification';

function CreateMedicineDialog(props) {
  const { openDialogCreate, setOpenDialogCreate, selectedMedicine, setSelectedMedicine } = props;
  const name = selectedMedicine?.name;
  const generic = selectedMedicine?.generic;
  // const category = selectedMedicine?.category;

  const handleCloseDialogCreate = () => {
    setOpenDialogCreate(false);
    setSelectedMedicine(null);
  };

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const fullWidth = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Dialog
      fullScreen={fullScreen}
      fullWidth={fullWidth}
      maxWidth="md"
      open={openDialogCreate}
      onClose={handleCloseDialogCreate}
      TransitionComponent={Transition}
      scroll="body"
    >
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleCloseDialogCreate} aria-label="close">
            <Close />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Add Medicine
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ margin: 3, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: 1,
          }}
        >
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="name"
            label="Name"
            name="name"
            onChange={(e) => setSelectedMedicine({ ...selectedMedicine, name: e.target.value })}
            value={name}
            required
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="generic"
            label="Generic"
            name="generic"
            onChange={(e) => setSelectedMedicine({ ...selectedMedicine, generic: e.target.value })}
            value={generic}
            required
          />
          <br />
          {/* <AutocompleteCategory
            value={category}
            required
            setValue={(newValue) => setSelectedMedicine({ ...selectedMedicine, category: newValue })}
          /> */}
          <br />
          <Box sx={{ p: 1, my: 0, mx: 'auto' }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                if (!generic) {
                  showToast('ERROR', 'Generic name is required!');
                  return;
                } else if (!name) {
                  showToast(ERROR, 'Name is required!');
                  return;
                }
                setSelectedMedicine({ ...selectedMedicine, isNew: true });
                setOpenDialogCreate(false);
              }}
            >
              Add Medicine
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}

export default CreateMedicineDialog;
