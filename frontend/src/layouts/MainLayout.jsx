import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from '../components/Navbar';


function MainLayout() {

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1, bgcolor: '#F8F4EF' }}>
        <Outlet />
      </Box>
    </Box>
  );
}


export default MainLayout;
