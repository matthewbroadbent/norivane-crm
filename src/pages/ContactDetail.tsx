import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Tabs,
  Tab,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  CalendarMonth as CalendarIcon,
  Phone as PhoneIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useContactsStore } from '../stores/contactsStore';
import { useEmailStore } from '../stores/emailStore';
import { useFunnelsStore } from '../stores/funnelsStore';
import { useCalendarStore } from '../stores/calendarStore';
import ContactForm from '../components/ContactForm';
import EmailTemplateForm from '../components/EmailTemplateForm';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contact-tabpanel-${index}`}
      aria-labelledby={`contact-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  const { contacts, tags, loading, error, fetchContacts, fetchTags, updateContact, deleteContact } = useContactsStore();
  const { templates, fetchTemplates } = useEmailStore();
  const { funnels, stages, fetchFunnels, fetchStages } = useFunnelsStore();
  const { events, fetchEvents } = useCalendarStore();
  
  const contact = contacts.find(c => c.id === id);
  
  useEffect(() => {
    if (id) {
      fetchContacts();
      fetchTags();
      fetchTemplates();
      fetchFunnels();
      fetchStages();
      fetchEvents();
    }
  }, [id, fetchContacts, fetchTags, fetchTemplates, fetchFunnels, fetchStages, fetchEvents]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleEditContact = () => {
    setEditDialogOpen(true);
  };
  
  const handleDeleteContact = async () => {
    if (id) {
      await deleteContact(id);
      setDeleteDialogOpen(false);
      navigate('/contacts');
    }
  };
  
  const handleUpdateContact = async (values: any) => {
    if (id) {
      await updateContact(id, values);
      setEditDialogOpen(false);
    }
  };
  
  const handleAddNote = async () => {
    if (id && newNote.trim() && contact) {
      const currentNotes = contact.notes || '';
      const timestamp = format(new Date(), 'MMM d, yyyy h:mm a');
      const formattedNote = `[${timestamp}] ${newNote}\n\n${currentNotes}`;
      
      await updateContact(id, { notes: formattedNote });
      setNewNote('');
      setNoteDialogOpen(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!contact) {
    return (
      <Box sx={{ p: 5 }}>
        <Typography variant="h5">Contact not found</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/contacts')}
          sx={{ mt: 2 }}
        >
          Back to Contacts
        </Button>
      </Box>
    );
  }
  
  // Filter events for this contact
  const contactEvents = events.filter(e => e.contact_id === id)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  
  // Get contact's funnel stage if any
  const contactStage = { name: 'Not in any funnel', funnel: 'None' };
  
  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/contacts')}
        sx={{ mb: 3 }}
      >
        Back to Contacts
      </Button>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem', mr: 2 }}
                >
                  {contact.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5" component="h1">
                    {contact.name}
                  </Typography>
                  <Chip
                    label={contact.status}
                    size="small"
                    color={
                      contact.status === 'customer'
                        ? 'success'
                        : contact.status === 'prospect'
                        ? 'primary'
                        : contact.status === 'lead'
                        ? 'info'
                        : 'default'
                    }
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
              <Box>
                <IconButton onClick={handleEditContact}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Contact Information
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">{contact.email}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">{contact.phone}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                Added on {format(new Date(contact.created_at), 'MMMM d, yyyy')}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Tags
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {/* This would show actual tags for the contact */}
              <Chip label="VIP" size="small" sx={{ bgcolor: '#1976d2', color: 'white' }} />
              <Chip label="Needs Follow-up" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
              <Chip label="+ Add Tag" size="small" variant="outlined" />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Sales Funnel
            </Typography>
            
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Current Stage:</strong> {contactStage.name}
              </Typography>
              <Typography variant="body2">
                <strong>Funnel:</strong> {contactStage.funnel}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
                fullWidth
                onClick={() => setEmailDialogOpen(true)}
                sx={{ mb: 1 }}
              >
                Send Email
              </Button>
              <Button
                variant="outlined"
                startIcon={<CalendarIcon />}
                fullWidth
                onClick={() => navigate('/calendar', { state: { contactId: id } })}
              >
                Schedule Meeting
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="contact tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Activity" />
              <Tab label="Notes" />
              <Tab label="Emails" />
              <Tab label="Meetings" />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              
              <List>
                <ListItem divider>
                  <ListItemText
                    primary="Email Sent: Monthly Newsletter"
                    secondary={`Sent on ${format(new Date('2023-07-15'), 'MMMM d, yyyy')}`}
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemText
                    primary="Meeting Scheduled: Product Demo"
                    secondary={`Scheduled for ${format(new Date('2023-07-20'), 'MMMM d, yyyy h:mm a')}`}
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemText
                    primary="Status Changed: Lead → Prospect"
                    secondary={`Changed on ${format(new Date('2023-07-10'), 'MMMM d, yyyy')}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Contact Created"
                    secondary={`Created on ${format(new Date(contact.created_at), 'MMMM d, yyyy')}`}
                  />
                </ListItem>
              </List>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Notes</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setNoteDialogOpen(true)}
                >
                  Add Note
                </Button>
              </Box>
              
              {contact.notes ? (
                <Paper variant="outlined" sx={{ p: 2, whiteSpace: 'pre-wrap' }}>
                  <Typography variant="body2">{contact.notes}</Typography>
                </Paper>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No notes yet. Click "Add Note" to create one.
                </Typography>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Email History</Typography>
                <Button
                  startIcon={<EmailIcon />}
                  variant="contained"
                  onClick={() => setEmailDialogOpen(true)}
                >
                  Send Email
                </Button>
              </Box>
              
              <List>
                <ListItem divider>
                  <ListItemText
                    primary="Monthly Newsletter"
                    secondary={`Sent on ${format(new Date('2023-07-15'), 'MMMM d, yyyy')} • Opened: Yes • Clicked: Yes`}
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemText
                    primary="Welcome Email"
                    secondary={`Sent on ${format(new Date('2023-07-01'), 'MMMM d, yyyy')} • Opened: Yes • Clicked: No`}
                  />
                </ListItem>
              </List>
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Meetings</Typography>
                <Button
                  startIcon={<CalendarIcon />}
                  variant="contained"
                  onClick={() => navigate('/calendar', { state: { contactId: id } })}
                >
                  Schedule Meeting
                </Button>
              </Box>
              
              {contactEvents.length > 0 ? (
                <List>
                  {contactEvents.map((event) => (
                    <ListItem key={event.id} divider>
                      <ListItemText
                        primary={event.title}
                        secondary={`${format(new Date(event.start_time), 'MMMM d, yyyy h:mm a')} - ${format(new Date(event.end_time), 'h:mm a')}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No meetings scheduled with this contact yet.
                </Typography>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Edit Contact Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Contact</DialogTitle>
        <DialogContent dividers>
          <ContactForm
            initialValues={contact}
            onSubmit={handleUpdateContact}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {contact.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteContact}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Send Email Dialog */}
      <Dialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Send Email to {contact.name}</DialogTitle>
        <DialogContent dividers>
          <EmailTemplateForm
            onSubmit={(values) => {
              // This would send the email
              console.log('Sending email:', values);
              setEmailDialogOpen(false);
            }}
            onCancel={() => setEmailDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Add Note Dialog */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
      >
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="note"
            label="Note"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddNote}
            variant="contained"
            disabled={!newNote.trim()}
          >
            Add Note
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
