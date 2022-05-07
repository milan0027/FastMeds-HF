import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';
import * as api from '../Api';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const id = localStorage.getItem('UserId');
  const getUser = async () => {
    try {
      const res = await api.getUserById(id);
      if (res.data) setIsLoggedIn(true);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    getUser();
  }, []);

  const signOut = () => {
    localStorage.removeItem('UserId');
    setIsLoggedIn(false);
  };

  return (
    <div>
      <Navbar isLoggedIn={isLoggedIn} signOut={signOut} />
    </div>
  );
};

export default Home;
