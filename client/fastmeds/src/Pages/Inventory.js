import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import FormHelperText from '@mui/material/FormHelperText';
import { v4 as uuidv4 } from 'uuid';
import * as api from '../Api';
import showToast from '../Utils/showToastNotification';
import { toast } from 'react-toastify';
import Navbar from '../Components/Navbar';

const Form = styled('form')``;
const Div = styled('div')``;

export default function Register() {
  const navigate = useNavigate();
  const formRef = useRef();

  const [isLoading, setIsLoading] = useState(false);
  const [inputFields, setInputFields] = useState([
    { id: uuidv4(), medName: '', genericName: '', price: 0, quantity: 0 },
  ]);
  const [userFields, setUserFields] = useState({});

  const handleChangeInput = (id, event) => {
    const newInputFields = inputFields.map((i) => {
      if (id === i.id) {
        i[event.target.name] = event.target.value;
      }
      return i;
    });

    setInputFields(newInputFields);
  };

  const handleAddFields = () => {
    setInputFields([...inputFields, { id: uuidv4(), medName: '', genericName: '', price: 0, quantity: 0 }]);
  };

  const handleRemoveFields = (id) => {
    const values = [...inputFields];
    values.splice(
      values.findIndex((value) => value.id === id),
      1
    );
    setInputFields(values);
  };
  const getUser = async (id) => {
    try {
      const res = await api.getUserById(id);
      if (res.data) setUserFields(res.data);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    const id = localStorage.getItem('UserId');
    if (!id) navigate('/auth/login');
    else {
      getUser(id);
      console.log(userFields);
    }
  }, []);
  return (
    <>
      <Navbar isLoggedIn={true} />
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Div
          sx={{
            mt: 6,
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '30px',
            backgroundColor: 'white',
            borderradius: '10px',
            boxShadow:
              '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
          }}
        >
          <Grid container direction="column" justifyContent="center" alignItems="center">
            <Grid item xs={9}>
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '40px',
                  fontWeight: '400',
                  color: '#20639B',
                }}
              >
                FastMeds
              </div>
            </Grid>
          </Grid>
          <Typography component="div" style={{ textAlign: 'center' }}>
            <Box fontSize={26} sx={{ m: 1 }} paddingT>
              Update Inventory
            </Box>
          </Typography>
          <Formik
            innerRef={formRef}
            initialValues={{
              beds: 0,
            }}
            validate={(values) => {
              const errors = {};

              if (values.beds && !values.beds.match(/\d/)) {
                errors.beds = 'No. of beds must be of numeric type';
              }

              return errors;
            }}
            onSubmit={async (values) => {
              console.log(userFields);
              const formdata = {
                medicines: [
                  ...inputFields,
                  { id: uuidv4(), medName: 'beds', genericName: 'beds', price: 0, quantity: values.beds },
                ],
                userId: userFields.id,
              };
              console.log(formdata);
              try {
                setIsLoading(true);

                await toast.promise(
                  api.updateInv(formdata),
                  {
                    pending: 'Updating Inventory',
                    success: {
                      render() {
                        return 'Update Done';
                      },
                    },
                    error: {
                      render(e) {
                        return e?.data?.response?.data?.message || e?.data?.message;
                      },
                    },
                  },
                  { position: 'top-center' }
                );
                navigate('/');
              } catch (e) {
                if (!e?.response?.data?.message) {
                  showToast('ERROR', 'Error in updating inventory!');
                }
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {({ values, errors, touched, setFieldValue, handleChange, handleBlur, handleSubmit }) => (
              <Form sx={{ width: '100%', mt: 1 }} onSubmit={handleSubmit} autoComplete="false">
                {inputFields.map((inputField) => (
                  <Grid key={inputField.id} container direction="row" justifyContent="center" alignItems="center">
                    <Grid item xs={5} sx={{ mx: 1, my: 1 }}>
                      <TextField
                        name="medName"
                        label="Medicine Name"
                        variant="outlined"
                        onBlur={handleBlur}
                        value={inputField.medName}
                        onChange={(event) => handleChangeInput(inputField.id, event)}
                      />
                    </Grid>
                    <Grid item xs={5} sx={{ mx: 1, my: 1 }}>
                      <TextField
                        name="genericName"
                        label="Generic Name"
                        variant="outlined"
                        onBlur={handleBlur}
                        value={inputField.genericName}
                        onChange={(event) => handleChangeInput(inputField.id, event)}
                      />
                    </Grid>
                    <Grid item xs={5} sx={{ mx: 1, my: 1 }}>
                      <TextField
                        name="price"
                        label="Price"
                        variant="outlined"
                        onBlur={handleBlur}
                        value={inputField.price}
                        onChange={(event) => handleChangeInput(inputField.id, event)}
                      />
                    </Grid>
                    <Grid item xs={5} sx={{ mx: 1, my: 1 }}>
                      <TextField
                        name="quantity"
                        label="Quantity"
                        variant="outlined"
                        onBlur={handleBlur}
                        value={inputField.quantity}
                        onChange={(event) => handleChangeInput(inputField.id, event)}
                      />
                    </Grid>
                    <Grid item xs={9} sx={{ mx: 1, my: 1 }}>
                      <IconButton disabled={inputFields.length === 1} onClick={() => handleRemoveFields(inputField.id)}>
                        <RemoveIcon />
                      </IconButton>
                      <IconButton onClick={handleAddFields}>
                        <AddIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Grid container direction="row" justifyContent="center" alignItems="center">
                  <Grid item xs={10} sx={{ mx: 1, my: 1 }}>
                    <TextField
                      fullWidth
                      name="beds"
                      label="Beds Available (required for hospitals)"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.beds}
                      onChange={handleChange}
                    />
                    {touched.beds && errors.beds && (
                      <FormHelperText error id="standard-weight-helper-text-name-register">
                        {errors.beds}
                      </FormHelperText>
                    )}
                  </Grid>
                  <Grid item xs={9}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="secondary"
                      sx={{ mt: 3, mb: 2 }}
                      disabled={isLoading}
                    >
                      Update
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Div>
      </Container>
    </>
  );
}
