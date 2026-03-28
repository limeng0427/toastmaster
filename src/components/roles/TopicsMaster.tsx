import { useState } from 'react'
import {
  Box, Button, Chip, FormControl, IconButton, MenuItem,
  Paper, Select, Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useSession } from '../../store/session'

function fmtSec(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

type DotColor = '#e0e0e0' | '#4caf50' | '#ff9800' | '#f44336'

function trafficDot(elapsed: number): DotColor {
  if (elapsed >= 120) return '#f44336'
  if (elapsed >= 90) return '#ff9800'
  if (elapsed >= 60) return '#4caf50'
  return '#e0e0e0'
}

export default function TopicsMaster() {
  const { members: memberList, topics, addTopic, removeTopic, markTopicDone, updateTopic, startTopicTimer, pauseTopicTimer, resetTopicTimer } = useSession()
  const members = memberList.map((m) => m.name)
  const [question, setQuestion] = useState('')
  const [speaker, setSpeaker] = useState('')

  function handleAdd() {
    if (!question.trim()) return
    addTopic(question.trim(), speaker)
    setQuestion('')
    setSpeaker('')
  }

  return (
    <Stack spacing={2}>
      {/* Add topic */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderStyle: 'dashed' }}>
        <Typography variant="caption" color="text.secondary" display="block" mb={1} fontWeight={600}>
          Add table topic
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Topic question…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              displayEmpty
            >
              <MenuItem value=""><em>— speaker —</em></MenuItem>
              {members.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              <MenuItem value="Guest">Guest</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" size="small" onClick={handleAdd} disableElevation>Add</Button>
        </Stack>
      </Paper>

      {topics.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          No topics yet. Add one above.
        </Typography>
      )}

      {topics.map((topic, i) => (
        <Paper
          key={topic.id}
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            opacity: topic.done ? 0.6 : 1,
            borderColor: topic.running ? 'primary.main' : 'divider',
            bgcolor: topic.running ? 'primary.50' : topic.done ? 'grey.50' : 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Typography variant="body2" color="text.disabled" fontFamily="monospace" mt={0.3} flexShrink={0}>
              {String(i + 1).padStart(2, '0')}
            </Typography>

            <Stack flex={1} spacing={0.75} minWidth={0}>
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{ textDecoration: topic.done ? 'line-through' : 'none', color: topic.done ? 'text.disabled' : 'text.primary' }}
              >
                {topic.question}
              </Typography>
              <FormControl size="small" variant="standard" sx={{ maxWidth: 160 }}>
                <Select
                  value={topic.speaker}
                  onChange={(e) => updateTopic(topic.id, { speaker: e.target.value })}
                  displayEmpty
                >
                  <MenuItem value=""><em>— speaker —</em></MenuItem>
                  {members.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  <MenuItem value="Guest">Guest</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Timer + actions */}
            <Stack direction="row" alignItems="center" spacing={0.5} flexShrink={0}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: trafficDot(topic.elapsed), flexShrink: 0 }} />
              <Typography variant="body2" fontFamily="monospace" fontWeight={700} sx={{ minWidth: 40, textAlign: 'right' }}>
                {fmtSec(topic.elapsed)}
              </Typography>

              {!topic.running ? (
                <Button size="small" variant="contained" color="success" disabled={topic.done} onClick={() => startTopicTimer(topic.id)} disableElevation sx={{ minWidth: 52 }}>
                  Start
                </Button>
              ) : (
                <Button size="small" variant="contained" color="warning" onClick={() => pauseTopicTimer(topic.id)} disableElevation sx={{ minWidth: 52 }}>
                  Pause
                </Button>
              )}
              <Tooltip title="Reset timer">
                <IconButton size="small" onClick={() => resetTopicTimer(topic.id)}>
                  <Typography variant="caption">↺</Typography>
                </IconButton>
              </Tooltip>

              <Tooltip title={topic.done ? 'Mark undone' : 'Mark done'}>
                <IconButton size="small" color={topic.done ? 'success' : 'default'} onClick={() => markTopicDone(topic.id)}>
                  {topic.done ? <CheckCircleIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Remove">
                <IconButton size="small" color="error" onClick={() => removeTopic(topic.id)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}
