import './App.css';
import { Routes, BrowserRouter, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import Home from './Pages/Home';

import Login from './Pages/Login';
import Register from './Pages/Register';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path={'/'} element={<Home />} />
          <Route path={'/auth/login'} element={<Login />} />
          <Route path={'/auth/register'} element={<Register />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
