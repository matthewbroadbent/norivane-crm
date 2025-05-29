import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../stores/authStore';
import Sidebar from './Sidebar';

const Layout = () => {
  const { user, setUser } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      
      <Box sx={{ flexGrow: 1 }}>
        <AppBar 
          position="fixed" 
          sx={{ 
            boxShadow: 1,
            backgroundColor: 'white',
            color: 'text.primary',
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              CRM & Email Marketing
            </Typography>
            
            <IconButton size="large" color="inherit">
              <NotificationsIcon />
            </IconButton>
            
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar 
                sx={{ width: 32, height: 32 }}
                alt={user?.email || 'User'}
                src="/avatar-placeholder.png"
              />
            </IconButton>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleClose}>My account</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            backgroundColor: 'background.default',
            minHeight: '100vh',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
