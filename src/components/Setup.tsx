import { useState } from 'react'
import {
  Box, Button, Chip, Container, FormControl, InputLabel, MenuItem,
  Paper, Select, Stack, TextField, Typography,
} from '@mui/material'
import { useSession, MEETING_ROLES } from '../store/session'

export default function Setup() {
  const { members, addMember, removeMember, updateMemberRole, startSession } = useSession()
  const [name, setName] = useState('')
  const [role, setRole] = useState('speaker')

  function handleAdd() {
    if (!name.trim()) return
    addMember(name.trim(), role)
    setName('')
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>Toastmasters</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Add attendees and assign their meeting roles
          </Typography>

          {/* Add member row */}
          <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
            <TextField
              size="small"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              sx={{ flex: 1, minWidth: 120 }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Role</InputLabel>
              <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
                {MEETING_ROLES.map((r) => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleAdd} disableElevation>Add</Button>
          </Stack>

          {/* Member list */}
          {members.length > 0 && (
            <Paper variant="outlined" sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
              {members.map((m, i) => (
                <Stack
                  key={m.name}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  px={2}
                  py={1}
                  sx={{ borderTop: i > 0 ? '1px solid' : 'none', borderColor: 'divider' }}
                >
                  <Typography variant="body2" fontWeight={500} flex={1}>{m.name}</Typography>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select
                      value={m.role}
                      onChange={(e) => updateMemberRole(m.name, e.target.value)}
                      sx={{ fontSize: 13 }}
                    >
                      {MEETING_ROLES.map((r) => (
                        <MenuItem key={r.value} value={r.value} sx={{ fontSize: 13 }}>{r.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Chip
                    label="×"
                    size="small"
                    onClick={() => removeMember(m.name)}
                    sx={{ cursor: 'pointer', minWidth: 0, px: 0.5 }}
                  />
                </Stack>
              ))}
            </Paper>
          )}

          <Button
            variant="contained"
            color="success"
            fullWidth
            size="large"
            disabled={members.length === 0}
            onClick={startSession}
            disableElevation
            sx={{ borderRadius: 2 }}
          >
            Start Session
          </Button>
          <Button
            fullWidth
            size="small"
            color="inherit"
            onClick={startSession}
            sx={{ mt: 1, color: 'text.secondary' }}
          >
            Skip setup
          </Button>
        </Paper>
      </Container>
    </Box>
  )
}
