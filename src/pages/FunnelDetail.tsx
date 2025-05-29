import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Menu,
  MenuItem,
  CircularProgress,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useFunnelsStore } from '../stores/funnelsStore';
import { useContactsStore } from '../stores/contactsStore';
import FunnelForm from '../components/FunnelForm';
import { format } from 'date-fns';

export default function FunnelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { funnels, stages, loading, error, fetchFunnels, fetchStages, updateFunnel, deleteFunnel } = useFunnelsStore();
  const { contacts, fetchContacts } = useContactsStore();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuContactId, setMenuContactId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchFunnels();
      fetchStages();
      fetchContacts();
    }
  }, [id, fetchFunnels, fetchStages, fetchContacts]);

  const funnel = funnels.find(f => f.id === id);
  const funnelStages = stages
    .filter(stage => stage.funnel_id === id)
    .sort((a, b) => a.order - b.order);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, contactId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuContactId(contactId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuContactId(null);
  };

  const handleEditFunnel = () => {
    setEditDialogOpen(true);
  };

  const handleDeleteFunnel = async () => {
    if (id) {
      await deleteFunnel(id);
      setDeleteDialogOpen(false);
      navigate('/sales-funnels');
    }
  };

  const handleFormSubmit = async (values: any, stageValues: any[]) => {
    if (id && funnel) {
      await updateFunnel(id, values);
      // Update stages would be implemented here
      setEditDialogOpen(false);
    }
  };

  // This would be replaced with actual data from the database
  const getContactsInStage = (stageId: string) => {
    // For demo purposes, we'll just return some random contacts
    return contacts.slice(0, Math.floor(Math.random() * 5));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!funnel) {
    return (
      <Box sx={{ p: 5 }}>
        <Typography variant="h5">Funnel not found</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/sales-funnels')}
          sx={{ mt: 2 }}
        >
          Back to Funnels
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/sales-funnels')}
        sx={{ mb: 3 }}
      >
        Back to Funnels
      </Button>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {funnel.name}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditFunnel}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>
      
      {funnel.description && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1">{funnel.description}</Typography>
        </Paper>
      )}
      
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Funnel Stages
      </Typography>
      
      {funnelStages.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Stages Defined
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Edit this funnel to add stages.
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditFunnel}
          >
            Edit Funnel
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {funnelStages.map((stage, index) => {
            const stageContacts = getContactsInStage(stage.id);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={stage.id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.default',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6" component="div">
                        {stage.name}
                      </Typography>
                      <Chip
                        label={stageContacts.length}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    {index < funnelStages.length - 1 && (
                      <ArrowForwardIcon color="action" />
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 0 }}>
                    <List sx={{ p: 0 }}>
                      {stageContacts.map((contact, idx) => (
                        <React.Fragment key={contact.id}>
                          <ListItem
                            button
                            onClick={() => navigate(`/contacts/${contact.id}`)}
                          >
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {contact.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <ListItemText
                              primary={contact.name}
                              secondary={contact.email}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={(e) => handleOpenMenu(e, contact.id)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {idx < stageContacts.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                      {stageContacts.length === 0 && (
                        <ListItem>
                          <ListItemText
                            primary="No contacts in this stage"
                            secondary="Move contacts here to track their progress"
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                  <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                      startIcon={<AddIcon />}
                      size="small"
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        // This would open a dialog to add contacts to this stage
                      }}
                    >
                      Add Contact
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      {/* Edit Funnel Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Sales Funnel</DialogTitle>
        <DialogContent dividers>
          <FunnelForm
            initialValues={funnel}
            initialStages={funnelStages}
            onSubmit={handleFormSubmit}
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
            Are you sure you want to delete the "{funnel.name}" funnel? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteFunnel}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Contact Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            if (menuContactId) {
              navigate(`/contacts/${menuContactId}`);
            }
            handleCloseMenu();
          }}
        >
          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
          View Contact
        </MenuItem>
        <MenuItem
          onClick={() => {
            // This would open a dialog to move the contact to another stage
            handleCloseMenu();
          }}
        >
          <ArrowForwardIcon fontSize="small" sx={{ mr: 1 }} />
          Move to Stage
        </MenuItem>
        <MenuItem
          onClick={() => {
            // This would remove the contact from the funnel
            handleCloseMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Remove from Funnel
        </MenuItem>
      </Menu>
    </Box>
  );
}
