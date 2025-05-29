import { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Email as EmailIcon, 
  People as PeopleIcon, 
  TrendingUp as TrendingUpIcon, 
  CalendarToday as CalendarIcon 
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Mock data for the dashboard
const emailStats = [
  { month: 'Jan', sent: 400, opened: 240, clicked: 100 },
  { month: 'Feb', sent: 300, opened: 198, clicked: 80 },
  { month: 'Mar', sent: 200, opened: 120, clicked: 50 },
  { month: 'Apr', sent: 278, opened: 189, clicked: 90 },
  { month: 'May', sent: 189, opened: 130, clicked: 60 },
  { month: 'Jun', sent: 239, opened: 180, clicked: 85 },
];

const recentContacts = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', date: '2023-07-15' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', date: '2023-07-14' },
  { id: 3, name: 'Robert Johnson', email: 'robert.j@example.com', date: '2023-07-13' },
  { id: 4, name: 'Emily Davis', email: 'emily.d@example.com', date: '2023-07-12' },
];

const upcomingEvents = [
  { id: 1, title: 'Client Meeting', date: '2023-07-20 10:00 AM' },
  { id: 2, title: 'Product Demo', date: '2023-07-21 2:00 PM' },
  { id: 3, title: 'Team Sync', date: '2023-07-22 9:00 AM' },
];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Contacts
                </Typography>
                <Typography variant="h5">1,254</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'secondary.light', mr: 2 }}>
                <EmailIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Emails Sent
                </Typography>
                <Typography variant="h5">8,632</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Open Rate
                </Typography>
                <Typography variant="h5">68.7%</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                <CalendarIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Upcoming Events
                </Typography>
                <Typography variant="h5">12</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Email Performance Chart */}
        <Grid item xs={12} md={8}>
          <Card elevation={0}>
            <CardHeader title="Email Performance" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={emailStats}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sent" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="opened" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="clicked" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Contacts */}
        <Grid item xs={12} md={4}>
          <Card elevation={0}>
            <CardHeader title="Recent Contacts" />
            <CardContent sx={{ p: 0 }}>
              <List>
                {recentContacts.map((contact, index) => (
                  <Box key={contact.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>{contact.name.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={contact.name}
                        secondary={contact.email}
                      />
                    </ListItem>
                    {index < recentContacts.length - 1 && <Divider variant="inset" component="li" />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Upcoming Events */}
        <Grid item xs={12}>
          <Card elevation={0}>
            <CardHeader title="Upcoming Events" />
            <CardContent sx={{ p: 0 }}>
              <List>
                {upcomingEvents.map((event, index) => (
                  <Box key={event.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <CalendarIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={event.title}
                        secondary={event.date}
                      />
                    </ListItem>
                    {index < upcomingEvents.length - 1 && <Divider variant="inset" component="li" />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
