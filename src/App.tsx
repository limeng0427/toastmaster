import { useState, useRef } from 'react'
import {
  AppBar, Box, Button, Chip, Drawer, FormControl, IconButton,
  MenuItem, Select, Stack, Tab, Tabs, Toolbar, Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useSession, ALL_ROLES, ROLE_LABELS, MEETING_ROLES } from './store/session'
import type { RoleId } from './store/session'
import { exportSession } from './utils/export'
import Setup from './components/Setup'
import AhCounter from './components/roles/AhCounter'
import Timer from './components/roles/Timer'
import Grammarian from './components/roles/Grammarian'
import GeneralEvaluator from './components/roles/GeneralEvaluator'
import TopicsMaster from './components/roles/TopicsMaster'

function ManageDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { members, addMember, removeMember, updateMemberRole } = useSession()
  const [name, setName] = useState('')
  const [role, setRole] = useState('speaker')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleAdd() {
    if (!name.trim()) return
    addMember(name.trim(), role)
    setName('')
    inputRef.current?.focus()
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 320, p: 2.5 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight={600}>Manage Attendees</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Stack>

      {/* Add row */}
      <Stack spacing={1} mb={2}>
        <Stack direction="row" spacing={1}>
          <Box
            component="input"
            ref={inputRef}
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleAdd()}
            placeholder="Name"
            sx={{
              flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1,
              px: 1.5, py: 1, fontSize: 14, outline: 'none',
              '&:focus': { borderColor: 'primary.main' },
            }}
          />
          <Button variant="contained" onClick={handleAdd} disableElevation size="small">Add</Button>
        </Stack>
        <FormControl size="small" fullWidth>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            {MEETING_ROLES.map((r) => (
              <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Member list */}
      <Stack spacing={0.5}>
        {members.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            No attendees yet
          </Typography>
        )}
        {members.map((m) => (
          <Stack key={m.name} direction="row" alignItems="center" spacing={1}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, px: 1.5, py: 0.75 }}
          >
            <Typography variant="body2" fontWeight={500} flex={1} noWrap>{m.name}</Typography>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={m.role}
                onChange={(e) => updateMemberRole(m.name, e.target.value)}
                sx={{ fontSize: 12 }}
              >
                {MEETING_ROLES.map((r) => (
                  <MenuItem key={r.value} value={r.value} sx={{ fontSize: 12 }}>{r.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton size="small" onClick={() => removeMember(m.name)}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        ))}
      </Stack>
    </Drawer>
  )
}

const ROLE_COMPONENT: Record<RoleId, React.ReactNode> = {
  ah: <AhCounter />,
  timer: <Timer />,
  grammarian: <Grammarian />,
  evaluator: <GeneralEvaluator />,
  topics: <TopicsMaster />,
}

export default function App() {
  const { started, members, ahCounter, timerSlots, grammarian, evaluator, topics, resetSession } = useSession()
  const [activeTab, setActiveTab] = useState<RoleId>('ah')
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (!started) return <Setup />

  const memberNames = members.map((m) => m.name)

  function handleExport() {
    exportSession({ members: memberNames, ahCounter, timerSlots, grammarian, evaluator, topics })
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <ManageDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} flex={1}>Toastmasters</Typography>
          <Chip label={`${members.length} attendee${members.length !== 1 ? 's' : ''}`} size="small" variant="outlined" />
          <Button size="small" variant="outlined" onClick={() => setDrawerOpen(true)}>Manage</Button>
          <Button size="small" variant="contained" disableElevation onClick={handleExport}>Export</Button>
          <Button
            size="small"
            color="error"
            onClick={() => { if (confirm('End session and reset all data?')) resetSession() }}
          >
            End
          </Button>
        </Toolbar>

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 0 } }}
        >
          {ALL_ROLES.map((role) => (
            <Tab key={role} value={role} label={ROLE_LABELS[role]} />
          ))}
        </Tabs>
      </AppBar>

      <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 3 }}>
        {ROLE_COMPONENT[activeTab]}
      </Box>
    </Box>
  )
}
