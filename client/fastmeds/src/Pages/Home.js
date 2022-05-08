import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';
import * as api from '../Api';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import showToast from '../Utils/showToastNotification';
import { toast } from 'react-toastify';
import Card from '../Components/Card';
import Paper from '@mui/material/Paper';
import image from '../background3.jpg';
const Home = () => {
  //  const navigate = useNavigate();
  // const formRef = useRef();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [medList, setMedList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  if (!navigator.geolocation) showToast('ERROR', 'Please give permission to access location');
  else {
    navigator.geolocation.getCurrentPosition(success, error);
  }
  let lat;
  let long;
  function success(pos) {
    const crd = pos.coords;
    lat = crd.latitude.toString();
    long = crd.longitude.toString();
  }
  function error(err) {
    showToast('ERROR', `ERROR(${err.code}): ${err.message}`);
  }
  const id = localStorage.getItem('UserId');

  const getUser = async (id) => {
    try {
      if (id) {
        const res = await api.getUserById(id);
        if (res.data) setIsLoggedIn(true);
      }
    } catch (e) {
      console.log(e);
    }
  };
  const getList = async () => {
    try {
      const res = await api.getAllMedicine();
      if (res.data) setMedList(res.data);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    getUser(id);
    getList();
  }, []);

  const signOut = () => {
    localStorage.removeItem('UserId');
    setIsLoggedIn(false);
  };
  const [formData, setFormData] = useState({
    item: '',
    quantity: 0,
    latitude: '',
    longitude: '',
  });

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const newFormData = {
        ...formData,
        latitude: lat,
        longitude: long,
      };
      const { data } = await toast.promise(
        api.searchItem(newFormData),
        {
          pending: 'Finding Stores...',
          success: {
            render() {
              return 'Request Successful';
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
      setStoreList(data);
    } catch (e) {
      console.log(e);
      if (!e?.response?.data?.message) {
        showToast('ERROR', 'Error in finding medicine!');
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        height: '100vw',
      }}
    >
      <Navbar isLoggedIn={isLoggedIn} signOut={signOut} />

      <Container
        component="main"
        maxWidth="xl"
        sx={{
          mt: 6,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
        }}
      >
        <Paper elevation={3} sx={{ width: '100%' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-around',
                flexDirection: { sm: 'column', md: 'row' },
                alignItems: 'center',
                margin: '15px 0px',
              }}
            >
              <Stack spacing={2} style={{ display: 'inline-block', width: '35%' }}>
                <Autocomplete
                  freeSolo
                  id="free-solo-2-demo"
                  onChange={(e, value) => {
                    setFormData({ ...formData, item: String(value) });
                  }}
                  disableClearable
                  options={medList.map((option) => option.name)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Medicines"
                      InputProps={{
                        ...params.InputProps,
                        type: 'search',
                      }}
                    />
                  )}
                />
              </Stack>
              <input
                placeholder="Quantity"
                style={{ padding: '0px 10px', width: '35%', height: '50px', fontSize: '16px' }}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                type="number"
              />
            </div>
            <Button style={{ width: '15%' }} onClick={(e) => submitForm(e)} variant="contained" disabled={isLoading}>
              Submit
            </Button>
          </Box>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'start',
            }}
            style={{ margin: '0px 30px', padding: '20px' }}
          >
            {storeList.map((store) => {
              return <Card key={store._id} store={store} />;
            })}
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default Home;
