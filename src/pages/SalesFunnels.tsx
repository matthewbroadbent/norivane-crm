import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterAlt as FunnelIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

// Mock data for sales funnels
const mockFunnels = [
  {
    id: '1',
    name: 'New Customer Onboarding',
    description: 'Guide new customers through the onboarding process',
    stages: 5,
    contacts: 124,
    lastUpdated: '2023-07-10',
  },
  {
    id: '2',
    name: 'Product Demo Follow-up',
    description: 'Follow up with prospects after product demonstrations',
    stages: 4,
    contacts: 87,
    lastUpdated: '2023-07-08',
  },
  {
    id: '3',
    name: 'Renewal Campaign',
    description: 'Engage with customers approaching subscription renewal',
    stages: 3,
    contacts: 56,
    lastUpdated: '2023-07-05',
  },
];

const SalesFunnels = () => {
  const navigate = useNavigate();
  const [funnels, setFunnels] = useState(mockFunnels);
  const [openDialog, setOpenDialog] = useState(false);
  const [newFunnel, setNewFunnel] = useState({
    name: '',
    description: '',
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewFunnel({ name: '', description: '' });
  };

  const handleCreateFunnel = () => {
    const newFunnelData = {
      id: Date.now().toString(),
      name: newFunnel.name,
      description: newFunnel.description,
      stages: 3, // Default number of stages
      contacts: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setFunnels([...funnels, newFunnelData]);
    handleCloseDialog();
  };

  const handleFunnelClick = (id: string) => {
    navigate(`/sales-funnels/${id}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Sales Funnels</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Create Funnel
        </Button>
      </Box>

      <Grid container spacing={3}>
        {funnels.map((funnel) => (
          <Grid item xs={12} sm={6} md={4} key={funnel.id}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                },
              }}
              onClick={() => handleFunnelClick(funnel.id)}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FunnelIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {funnel.name}
                  </Typography>
                </Box>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {funnel.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip 
                    label={`${funnel.stages} Stages`} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`${funnel.contacts} Contacts`} 
                    size="small" 
                    color="secondary" 
                    variant="outlined" 
                  />
                </Box>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {funnel.lastUpdated}
                </Typography>
                <Button size="small" color="primary">
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Funnel Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Sales Funnel</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Funnel Name"
            fullWidth
            variant="outlined"
            value={newFunnel.name}
            onChange={(e) => setNewFunnel({ ...newFunnel, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newFunnel.description}
            onChange={(e) => setNewFunnel({ ...newFunnel, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateFunnel} 
            variant="contained"
            disabled={!newFunnel.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesFunnels;
