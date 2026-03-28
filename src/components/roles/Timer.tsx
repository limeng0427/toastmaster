import { useState } from 'react'
import {
  Box, Button, FormControl, IconButton, InputAdornment,
  LinearProgress, MenuItem, Paper, Select, Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useSession } from '../../store/session'

function fmtSec(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

type LightColor = 'default' | 'success' | 'warning' | 'error'

function trafficLight(elapsed: number, minSec: number, maxSec: number): { color: LightColor; label: string } {
  if (elapsed >= maxSec) return { color: 'error', label: 'Over time' }
  if (elapsed >= maxSec - 60) return { color: 'warning', label: 'Warning' }
  if (elapsed >= minSec) return { color: 'success', label: 'On time' }
  return { color: 'default', label: 'Not started' }
}

const LIGHT_BG: Record<LightColor, string> = {
  default: '#e0e0e0',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
}

export default function Timer() {
  const { members: memberList, timerSlots, addTimerSlot, removeTimerSlot, updateTimerSlot, startTimer, pauseTimer, resetTimer } = useSession()
  const members = memberList.map((m) => m.name)
  const [newLabel, setNewLabel] = useState('')
  const [newMin, setNewMin] = useState('5')
  const [newMax, setNewMax] = useState('7')

  function handleAdd() {
    if (!newLabel.trim()) return
    addTimerSlot({
      label: newLabel.trim(),
      speaker: '',
      minSec: Math.round(parseFloat(newMin) * 60),
      maxSec: Math.round(parseFloat(newMax) * 60),
    })
    setNewLabel('')
  }

  return (
    <Stack spacing={2}>
      {timerSlots.map((slot) => {
        const light = trafficLight(slot.elapsed, slot.minSec, slot.maxSec)
        const progress = Math.min(100, (slot.elapsed / slot.maxSec) * 100)

        return (
          <Paper
            key={slot.id}
            variant="outlined"
            sx={{ p: 2, borderRadius: 2, borderColor: slot.running ? 'primary.main' : 'divider', bgcolor: slot.running ? 'primary.50' : 'background.paper' }}
          >
            <Stack direction="row" alignItems="flex-start" spacing={2} flexWrap="wrap">
              {/* Traffic light dot */}
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: LIGHT_BG[light.color], mt: 0.75, flexShrink: 0 }} />

              <Stack flex={1} spacing={0.5} minWidth={0}>
                <TextField
                  value={slot.label}
                  onChange={(e) => updateTimerSlot(slot.id, { label: e.target.value })}
                  variant="standard"
                  InputProps={{ disableUnderline: false, sx: { fontWeight: 600 } }}
                  size="small"
                />
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TextField
                      type="number"
                      value={+(slot.minSec / 60).toFixed(1)}
                      onChange={(e) => updateTimerSlot(slot.id, { minSec: Math.round(parseFloat(e.target.value) * 60) })}
                      size="small"
                      variant="standard"
                      InputProps={{ endAdornment: <InputAdornment position="end">–</InputAdornment> }}
                      sx={{ width: 60 }}
                    />
                    <TextField
                      type="number"
                      value={+(slot.maxSec / 60).toFixed(1)}
                      onChange={(e) => updateTimerSlot(slot.id, { maxSec: Math.round(parseFloat(e.target.value) * 60) })}
                      size="small"
                      variant="standard"
                      InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }}
                      sx={{ width: 72 }}
                    />
                  </Stack>
                  <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                    <Select
                      value={slot.speaker}
                      onChange={(e) => updateTimerSlot(slot.id, { speaker: e.target.value })}
                      displayEmpty
                    >
                      <MenuItem value=""><em>— no speaker —</em></MenuItem>
                      {members.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>

              {/* Timer display + controls */}
              <Stack direction="row" alignItems="center" spacing={1} flexShrink={0}>
                <Typography variant="h5" fontFamily="monospace" fontWeight={700} sx={{ minWidth: 64, textAlign: 'right' }}>
                  {fmtSec(slot.elapsed)}
                </Typography>
                {!slot.running ? (
                  <Button size="small" variant="contained" color="success" onClick={() => startTimer(slot.id)} disableElevation>
                    Start
                  </Button>
                ) : (
                  <Button size="small" variant="contained" color="warning" onClick={() => pauseTimer(slot.id)} disableElevation>
                    Pause
                  </Button>
                )}
                <Button size="small" variant="outlined" onClick={() => resetTimer(slot.id)}>Reset</Button>
                <Tooltip title="Remove slot">
                  <IconButton size="small" color="error" onClick={() => removeTimerSlot(slot.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progress}
              color={light.color === 'default' ? 'inherit' : light.color}
              sx={{ mt: 1.5, borderRadius: 1, height: 4 }}
            />
          </Paper>
        )
      })}

      {/* Add slot */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderStyle: 'dashed' }}>
        <Typography variant="caption" color="text.secondary" display="block" mb={1} fontWeight={600}>
          Add speech slot
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Label (e.g. Humorous Speech)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            sx={{ flex: 1, minWidth: 160 }}
          />
          <TextField
            type="number"
            size="small"
            value={newMin}
            onChange={(e) => setNewMin(e.target.value)}
            InputProps={{ endAdornment: <InputAdornment position="end">–</InputAdornment> }}
            sx={{ width: 72 }}
          />
          <TextField
            type="number"
            size="small"
            value={newMax}
            onChange={(e) => setNewMax(e.target.value)}
            InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }}
            sx={{ width: 88 }}
          />
          <Button variant="contained" size="small" onClick={handleAdd} disableElevation>Add</Button>
        </Stack>
      </Paper>
    </Stack>
  )
}
