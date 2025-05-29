import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
} from '@mui/material';
import {
  People as ContactsIcon,
  Email as EmailIcon,
  FilterAlt as FunnelIcon, // Changed from Funnel to FilterAlt
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../stores/authStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    contacts: 0,
    campaigns: 0,
    funnels: 0,
    events: 0,
  });
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      // Fetch counts
      const [contactsResponse, campaignsResponse, funnelsResponse, eventsResponse] = await Promise.all([
        supabase.from('contacts').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('campaigns').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('funnels').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('events').select('id', { count: 'exact' }).eq('user_id', user.id),
      ]);

      setStats({
        contacts: contactsResponse.count || 0,
        campaigns: campaignsResponse.count || 0,
        funnels: funnelsResponse.count || 0,
        events: eventsResponse.count || 0,
      });

      // Fetch recent contacts
      const { data: contacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentContacts(contacts || []);

      // Fetch upcoming events
      const today = new Date().toISOString();
      const { data: events } = await supabase
        .from('events')
        .select('*, contacts(*)')
        .eq('user_id', user.id)
        .gte('start_time', today)
        .order('start_time', { ascending: true })
        .limit(5);

      setUpcomingEvents(events || []);
    };

    fetchDashboardData();
  }, [user]);

  const StatCard = ({ title, value, icon, color, onClick }: any) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
          <Avatar sx={{ bgcolor: color }}>
            {icon}
          </Avatar>
        </Box>
        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mt: 'auto' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Contacts"
            value={stats.contacts}
            icon={<ContactsIcon />}
            color="primary.main"
            onClick={() => navigate('/contacts')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Email Campaigns"
            value={stats.campaigns}
            icon={<EmailIcon />}
            color="secondary.main"
            onClick={() => navigate('/email-campaigns')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sales Funnels"
            value={stats.funnels}
            icon={<FunnelIcon />}
            color="success.main"
            onClick={() => navigate('/sales-funnels')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Calendar Events"
            value={stats.events}
            icon={<CalendarIcon />}
            color="warning.main"
            onClick={() => navigate('/calendar')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Recent Contacts" 
              action={
                <Button color="primary" onClick={() => navigate('/contacts')}>
                  View All
                </Button>
              }
            />
            <Divider />
            <List sx={{ p: 0 }}>
              {recentContacts.length > 0 ? (
                recentContacts.map((contact) => (
                  <ListItem 
                    key={contact.id} 
                    divider 
                    button 
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar>{contact.name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={contact.name}
                      secondary={contact.email}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(contact.created_at)}
                    </Typography>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No contacts found" />
                </ListItem>
              )}
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Upcoming Events" 
              action={
                <Button color="primary" onClick={() => navigate('/calendar')}>
                  View Calendar
                </Button>
              }
            />
            <Divider />
            <List sx={{ p: 0 }}>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <ListItem key={event.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <CalendarIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={event.title}
                      secondary={event.contacts?.name || 'No contact'}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(event.start_time)}
                    </Typography>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No upcoming events" />
                </ListItem>
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
