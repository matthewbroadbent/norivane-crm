import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';
import { Database } from '../types/supabase';

type Funnel = Database['public']['Tables']['funnels']['Row'];
type FunnelStage = Database['public']['Tables']['funnel_stages']['Row'];

interface FunnelFormProps {
  initialValues?: Partial<Funnel>;
  initialStages?: FunnelStage[];
  onSubmit: (values: any, stages: any[]) => void;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Funnel name is required'),
  description: Yup.string(),
});

export default function FunnelForm({ initialValues, initialStages = [], onSubmit, onCancel }: FunnelFormProps) {
  const { user } = useAuthStore();
  const [stages, setStages] = useState<any[]>(
    initialStages.length > 0
      ? initialStages.sort((a, b) => a.order - b.order)
      : [
          { name: 'Lead', order: 0, temp_id: 'temp_0' },
          { name: 'Prospect', order: 1, temp_id: 'temp_1' },
          { name: 'Qualified', order: 2, temp_id: 'temp_2' },
          { name: 'Proposal', order: 3, temp_id: 'temp_3' },
          { name: 'Closed Won', order: 4, temp_id: 'temp_4' },
        ]
  );
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [newStageName, setNewStageName] = useState('');

  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(
        {
          ...values,
          user_id: user?.id,
        },
        stages
      );
    },
  });

  const handleAddStage = () => {
    if (newStageName) {
      const newOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order)) + 1 : 0;
      setStages([
        ...stages,
        {
          name: newStageName,
          order: newOrder,
          temp_id: `temp_${Date.now()}`,
        },
      ]);
      setStageDialogOpen(false);
      setNewStageName('');
    }
  };

  const handleDeleteStage = (index: number) => {
    const newStages = [...stages];
    newStages.splice(index, 1);
    
    // Reorder stages
    newStages.forEach((stage, idx) => {
      stage.order = idx;
    });
    
    setStages(newStages);
  };

  const moveStage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= stages.length) return;
    
    const newStages = [...stages];
    const [movedStage] = newStages.splice(fromIndex, 1);
    newStages.splice(toIndex, 0, movedStage);
    
    // Reorder stages
    newStages.forEach((stage, idx) => {
      stage.order = idx;
    });
    
    setStages(newStages);
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Funnel Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            multiline
            rows={3}
            value={formik.values.description}
            onChange={formik.handleChange}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">Funnel Stages</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setStageDialogOpen(true)}
              variant="outlined"
              size="small"
            >
              Add Stage
            </Button>
          </Box>
          
          <Paper variant="outlined" sx={{ p: 0 }}>
            <List sx={{ p: 0 }}>
              {stages.map((stage, index) => (
                <ListItem
                  key={stage.id || stage.temp_id}
                  divider={index < stages.length - 1}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteStage(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <IconButton
                      size="small"
                      sx={{ mr: 1, cursor: 'grab' }}
                    >
                      <DragIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <ListItemText primary={stage.name} />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          size="small"
                          disabled={index === 0}
                          onClick={() => moveStage(index, index - 1)}
                        >
                          ↑
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={index === stages.length - 1}
                          onClick={() => moveStage(index, index + 1)}
                        >
                          ↓
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              ))}
              {stages.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No stages defined"
                    secondary="Click 'Add Stage' to create your first funnel stage"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={stages.length === 0}
          >
            {initialValues?.id ? 'Update Funnel' : 'Create Funnel'}
          </Button>
        </Grid>
      </Grid>
      
      {/* Add Stage Dialog */}
      <Dialog open={stageDialogOpen} onClose={() => setStageDialogOpen(false)}>
        <DialogTitle>Add New Stage</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="stageName"
            label="Stage Name"
            fullWidth
            variant="outlined"
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStageDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddStage}
            variant="contained"
            disabled={!newStageName}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
