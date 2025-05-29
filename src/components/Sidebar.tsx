import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  FilterAlt as FunnelIcon,
  Email as EmailIcon,
  CalendarMonth as CalendarIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Campaign as CampaignIcon,
  MailOutline as TemplateIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [emailOpen, setEmailOpen] = useState(false);

  const handleEmailClick = () => {
    setEmailOpen(!emailOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      text: 'Contacts',
      icon: <PeopleIcon />,
      path: '/contacts',
    },
    {
      text: 'Sales Funnels',
      icon: <FunnelIcon />,
      path: '/sales-funnels',
    },
    {
      text: 'Email Marketing',
      icon: <EmailIcon />,
      submenu: true,
      open: emailOpen,
      onClick: handleEmailClick,
      items: [
        {
          text: 'Campaigns',
          icon: <CampaignIcon />,
          path: '/email/campaigns',
        },
        {
          text: 'Templates',
          icon: <TemplateIcon />,
          path: '/email/templates',
        },
      ],
    },
    {
      text: 'Calendar',
      icon: <CalendarIcon />,
      path: '/calendar',
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: 'none',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src="/logo-placeholder.png" 
          alt="Logo" 
          style={{ height: 40 }} 
        />
      </Box>
      <Divider />
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={item.submenu ? item.onClick : () => navigate(item.path)}
                selected={!item.submenu && isActive(item.path)}
                sx={{
                  borderRadius: '0 20px 20px 0',
                  mx: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {item.submenu && (item.open ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>
            {item.submenu && (
              <Collapse in={item.open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.items.map((subItem) => (
                    <ListItemButton
                      key={subItem.text}
                      onClick={() => navigate(subItem.path)}
                      selected={isActive(subItem.path)}
                      sx={{
                        pl: 4,
                        borderRadius: '0 20px 20px 0',
                        mx: 1,
                        '&.Mui-selected': {
                          bgcolor: 'primary.light',
                          '&:hover': {
                            bgcolor: 'primary.light',
                          },
                        },
                      }}
                    >
                      <ListItemIcon>{subItem.icon}</ListItemIcon>
                      <ListItemText primary={subItem.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
