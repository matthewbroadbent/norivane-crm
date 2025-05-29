import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useFunnelsStore } from '../stores/funnelsStore';
import { useAuthStore } from '../stores/authStore';
import FunnelForm from '../components/FunnelForm';

export default function SalesFunnels() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { funnels, stages, loading, error, fetchFunnels, fetchStages, addFunnel, updateFunnel, deleteFunnel } = useFunnelsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [funnelToDelete, setFunnelToDelete] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuFunnelId, setMenuFunnelId] = useState<string | null>(null);

  useEffect(() => {
    fetchFunnels();
    fetchStages();
  }, [fetchFunnels, fetchStages]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, funnelId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuFunnelId(funnelId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuFunnelId(null);
  };

  const handleAddFunnel = () => {
    setSelectedFunnel(null);
    setFormOpen(true);
  };

  const handleEditFunnel = (funnel: any) => {
    setSelectedFunnel(funnel);
    setFormOpen(true);
    handleCloseMenu();
  };

  const handleDeleteClick = (funnelId: string) => {
    setFunnelToDelete(funnelId);
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const handleConfirmDelete = async () => {
    if (funnelToDelete) {
      await deleteFunnel(funnelToDelete);
      setDeleteDialogOpen(false);
      setFunnelToDelete(null);
    }
  };

  const handleFormSubmit = async (values: any, stageValues: any[]) => {
    if (user) {
      if (selectedFunnel) {
        await updateFunnel(selectedFunnel.id, values);
        // Update stages would be implemented here
      } else {
        const newFunnel = await addFunnel({
          ...values,
          user_id: user.id,
        });
        
        if (newFunnel) {
          // Add stages would be implemented here
        }
      }
      setFormOpen(false);
    }
  };

  const filteredFunnels = funnels.filter(
    (funnel) => funnel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFunnelStages = (funnelId: string) => {
    return stages
      .filter(stage => stage.funnel_id === funnelId)
      .sort((a, b) => a.order - b.order);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Sales Funnels
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddFunnel}
        >
          Create Funnel
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Search funnels..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {filteredFunnels.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Sales Funnels Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create your first sales funnel to track your prospect-to-customer journey.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddFunnel}
          >
            Create Funnel
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredFunnels.map((funnel) => {
            const funnelStages = getFunnelStages(funnel.id);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={funnel.id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: 3,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, funnel.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {funnel.name}
                    </Typography>
                    {funnel.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {funnel.description}
                      </Typography>
                    )}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Stages:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {funnelStages.map((stage, index) => (
                          <Box
                            key={stage.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                bgcolor: 'background.default',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                              }}
                            >
                              {stage.name}
                            </Typography>
                            {index < funnelStages.length - 1 && (
                              <ArrowForwardIcon
                                fontSize="small"
                                sx={{ mx: 0.5, color: 'text.secondary' }}
                              />
                            )}
                          </Box>
                        ))}
                        {funnelStages.length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            No stages defined
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      onClick={() => navigate(`/sales-funnels/${funnel.id}`)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Funnel Form Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedFunnel ? 'Edit Sales Funnel' : 'Create Sales Funnel'}
        </DialogTitle>
        <DialogContent dividers>
          <FunnelForm
            initialValues={selectedFunnel}
            initialStages={selectedFunnel ? getFunnelStages(selectedFunnel.id) : []}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormOpen(false)}
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
            Are you sure you want to delete this sales funnel? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Funnel Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            if (menuFunnelId) {
              const funnel = funnels.find((f) => f.id === menuFunnelId);
              if (funnel) {
                handleEditFunnel(funnel);
              }
            }
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuFunnelId) {
              navigate(`/sales-funnels/${menuFunnelId}`);
            }
            handleCloseMenu();
          }}
        >
          <ArrowForwardIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            // Duplicate functionality would be implemented here
            handleCloseMenu();
          }}
        >
          <DuplicateIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuFunnelId) {
              handleDeleteClick(menuFunnelId);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
