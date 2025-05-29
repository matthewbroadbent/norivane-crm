import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

// Mock data for funnel details
const mockFunnelData = {
  '1': {
    id: '1',
    name: 'New Customer Onboarding',
    description: 'Guide new customers through the onboarding process',
    stages: [
      'Initial Contact',
      'Welcome Email',
      'Product Setup',
      'Training Session',
      'Follow-up',
    ],
    contacts: [
      { id: '1', name: 'John Doe', email: 'john.doe@example.com', stage: 0 },
      { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', stage: 1 },
      { id: '3', name: 'Robert Johnson', email: 'robert.j@example.com', stage: 2 },
      { id: '4', name: 'Emily Davis', email: 'emily.d@example.com', stage: 3 },
      { id: '5', name: 'Michael Brown', email: 'michael.b@example.com', stage: 4 },
    ],
  },
  '2': {
    id: '2',
    name: 'Product Demo Follow-up',
    description: 'Follow up with prospects after product demonstrations',
    stages: [
      'Demo Completed',
      'Initial Follow-up',
      'Needs Assessment',
      'Proposal',
    ],
    contacts: [
      { id: '6', name: 'Sarah Wilson', email: 'sarah.w@example.com', stage: 0 },
      { id: '7', name: 'David Miller', email: 'david.m@example.com', stage: 1 },
      { id: '8', name: 'Lisa Taylor', email: 'lisa.t@example.com', stage: 2 },
    ],
  },
  '3': {
    id: '3',
    name: 'Renewal Campaign',
    description: 'Engage with customers approaching subscription renewal',
    stages: [
      'Renewal Notice',
      'Check-in Call',
      'Renewal Decision',
    ],
    contacts: [
      { id: '9', name: 'Thomas Anderson', email: 'thomas.a@example.com', stage: 0 },
      { id: '10', name: 'Jessica Lee', email: 'jessica.l@example.com', stage: 1 },
    ],
  },
};

const FunnelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [funnel, setFunnel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedFunnel, setEditedFunnel] = useState({
    name: '',
    description: '',
  });
  const [addContactDialogOpen, setAddContactDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    stage: 0,
  });

  useEffect(() => {
    // Simulate API call to get funnel data
    const fetchFunnel = () => {
      setLoading(true);
      setTimeout(() => {
        if (id && mockFunnelData[id as keyof typeof mockFunnelData]) {
          const funnelData = mockFunnelData[id as keyof typeof mockFunnelData];
          setFunnel(funnelData);
          setEditedFunnel({
            name: funnelData.name,
            description: funnelData.description,
          });
        }
        setLoading(false);
      }, 500);
    };

    fetchFunnel();
  }, [id]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleSaveEdit = () => {
    setFunnel({
      ...funnel,
      name: editedFunnel.name,
      description: editedFunnel.description,
    });
    setEditDialogOpen(false);
  };

  const handleAddContactClick = () => {
    setAddContactDialogOpen(true);
  };

  const handleAddContactDialogClose = () => {
    setAddContactDialogOpen(false);
    setNewContact({
      name: '',
      email: '',
      stage: 0,
    });
  };

  const handleAddContact = () => {
    const newContactData = {
      id: Date.now().toString(),
      name: newContact.name,
      email: newContact.email,
      stage: newContact.stage,
    };

    setFunnel({
      ...funnel,
      contacts: [...funnel.contacts, newContactData],
    });

    handleAddContactDialogClose();
  };

  const handleMoveContact = (contactId: string, newStage: number) => {
    const updatedContacts = funnel.contacts.map((contact: any) => {
      if (contact.id === contactId) {
        return { ...contact, stage: newStage };
      }
      return contact;
    });

    setFunnel({
      ...funnel,
      contacts: updatedContacts,
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Loading funnel details...</Typography>
      </Box>
    );
  }

  if (!funnel) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Funnel not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">{funnel.name}</Typography>
          <Typography variant="body1" color="text.secondary">
            {funnel.description}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleAddContactClick}
            sx={{ mr: 1 }}
          >
            Add Contact
          </Button>
          <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEditClick}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit Funnel
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete Funnel
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <EmailIcon fontSize="small" sx={{ mr: 1 }} />
              Send Campaign
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
        <Stepper alternativeLabel>
          {funnel.stages.map((stage: string, index: number) => (
            <Step key={index} completed={false}>
              <StepLabel>{stage}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Contacts by Stage
      </Typography>

      <Grid container spacing={3}>
        {funnel.stages.map((stage: string, stageIndex: number) => {
          const stageContacts = funnel.contacts.filter(
            (contact: any) => contact.stage === stageIndex
          );

          return (
            <Grid item xs={12} md={6} lg={4} key={stageIndex}>
              <Card elevation={0}>
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                  <Typography variant="h6">{stage}</Typography>
                  <Typography variant="body2">
                    {stageContacts.length} contacts
                  </Typography>
                </Box>
                <CardContent sx={{ p: 0 }}>
                  <List>
                    {stageContacts.length > 0 ? (
                      stageContacts.map((contact: any) => (
                        <ListItem
                          key={contact.id}
                          secondaryAction={
                            <Box>
                              {stageIndex > 0 && (
                                <Button
                                  size="small"
                                  onClick={() =>
                                    handleMoveContact(contact.id, stageIndex - 1)
                                  }
                                >
                                  ←
                                </Button>
                              )}
                              {stageIndex < funnel.stages.length - 1 && (
                                <Button
                                  size="small"
                                  onClick={() =>
                                    handleMoveContact(contact.id, stageIndex + 1)
                                  }
                                >
                                  →
                                </Button>
                              )}
                            </Box>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>{contact.name.charAt(0)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={contact.name}
                            secondary={contact.email}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText
                          primary="No contacts in this stage"
                          primaryTypographyProps={{
                            color: 'text.secondary',
                            variant: 'body2',
                            sx: { fontStyle: 'italic' },
                          }}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit Funnel Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Funnel</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Funnel Name"
            fullWidth
            variant="outlined"
            value={editedFunnel.name}
            onChange={(e) =>
              setEditedFunnel({ ...editedFunnel, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editedFunnel.description}
            onChange={(e) =>
              setEditedFunnel({ ...editedFunnel, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog
        open={addContactDialogOpen}
        onClose={handleAddContactDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Contact to Funnel</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={newContact.name}
            onChange={(e) =>
              setNewContact({ ...newContact, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newContact.email}
            onChange={(e) =>
              setNewContact({ ...newContact, email: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="Stage"
            fullWidth
            variant="outlined"
            value={newContact.stage}
            onChange={(e) =>
              setNewContact({
                ...newContact,
                stage: Number(e.target.value),
              })
            }
          >
            {funnel.stages.map((stage: string, index: number) => (
              <MenuItem key={index} value={index}>
                {stage}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddContactDialogClose}>Cancel</Button>
          <Button
            onClick={handleAddContact}
            variant="contained"
            disabled={!newContact.name || !newContact.email}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FunnelDetail;
