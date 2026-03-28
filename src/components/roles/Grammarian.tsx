import {
  IconButton, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useSession } from '../../store/session'

export default function Grammarian() {
  const { members: memberList, grammarian, setWordOfDay, incrementWotd, setMemberNote, setGlobalNotes } = useSession()
  const members = memberList.map((m) => m.name)

  return (
    <Stack spacing={3}>
      {/* Word of the Day */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" letterSpacing={1} mb={1.5}>
          Word of the Day
        </Typography>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <TextField
            size="small"
            label="Word"
            value={grammarian.wordOfDay}
            onChange={(e) => setWordOfDay(e.target.value, grammarian.wordDefinition)}
            sx={{ minWidth: 140 }}
          />
          <TextField
            size="small"
            label="Definition (optional)"
            value={grammarian.wordDefinition}
            onChange={(e) => setWordOfDay(grammarian.wordOfDay, e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
          />
        </Stack>
      </Paper>

      {/* Per-member table */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>Member</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 120 }}>WotD Used</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Grammar Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>{member}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                    <Typography variant="h6" color="primary" fontWeight={700}>
                      {grammarian.wotdUsage[member] ?? 0}
                    </Typography>
                    <Tooltip title="Mark usage">
                      <IconButton size="small" color="primary" onClick={() => incrementWotd(member)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    variant="standard"
                    placeholder="Notes…"
                    value={grammarian.notes[member] ?? ''}
                    onChange={(e) => setMemberNote(member, e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Global notes */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" letterSpacing={1} mb={1.5}>
          Global Notes
        </Typography>
        <TextField
          multiline
          rows={4}
          fullWidth
          size="small"
          placeholder="Overall language observations…"
          value={grammarian.globalNotes}
          onChange={(e) => setGlobalNotes(e.target.value)}
        />
      </Paper>
    </Stack>
  )
}
