import { useEffect, useState } from 'react'
import {
  Box, Chip, IconButton, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableFooter, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useSession, FILLER_WORDS, FILLER_KEY_MAP } from '../../store/session'
import type { FillerWord } from '../../store/session'

export default function AhCounter() {
  const { members: memberList, ahCounter, incrementFiller, decrementFiller } = useSession()
  const members = memberList.map((m) => m.name)
  const [selected, setSelected] = useState<string | null>(members[0] ?? null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
      const word = FILLER_KEY_MAP[e.key.toLowerCase()]
      if (word && selected) incrementFiller(selected, word)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, incrementFiller])

  const totals = FILLER_WORDS.reduce<Record<FillerWord, number>>((acc, w) => {
    acc[w] = members.reduce((s, m) => s + (ahCounter[m]?.[w] ?? 0), 0)
    return acc
  }, {} as Record<FillerWord, number>)

  const grandTotal = (member: string) =>
    FILLER_WORDS.reduce((s, w) => s + (ahCounter[member]?.[w] ?? 0), 0)

  return (
    <Stack spacing={2}>
      {/* Keyboard shortcut legend */}
      <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="center">
        <Typography variant="caption" color="text.secondary">Shortcuts (select a row first):</Typography>
        {FILLER_WORDS.map((w) => {
          const key = Object.entries(FILLER_KEY_MAP).find(([, v]) => v === w)?.[0]
          return (
            <Chip
              key={w}
              label={`${key?.toUpperCase()} = ${w}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: 11 }}
            />
          )
        })}
      </Stack>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>Member</TableCell>
              {FILLER_WORDS.map((w) => (
                <TableCell key={w} align="center" sx={{ fontWeight: 600 }}>{w}</TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 600 }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow
                key={member}
                onClick={() => setSelected(member)}
                selected={selected === member}
                hover
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {selected === member && (
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                    )}
                    <Typography variant="body2" fontWeight={500}>{member}</Typography>
                  </Stack>
                </TableCell>
                {FILLER_WORDS.map((word) => (
                  <TableCell key={word} align="center" onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.25}>
                      <Tooltip title="Decrease">
                        <IconButton
                          size="small"
                          onClick={() => decrementFiller(member, word)}
                          sx={{ p: 0.25 }}
                        >
                          <RemoveIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="body2" fontWeight={700} sx={{ minWidth: 24, textAlign: 'center' }}>
                        {ahCounter[member]?.[word] ?? 0}
                      </Typography>
                      <Tooltip title="Increase">
                        <IconButton
                          size="small"
                          onClick={() => incrementFiller(member, word)}
                          sx={{ p: 0.25 }}
                        >
                          <AddIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                ))}
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={700}>{grandTotal(member)}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Totals</TableCell>
              {FILLER_WORDS.map((w) => (
                <TableCell key={w} align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {totals[w]}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                {FILLER_WORDS.reduce((s, w) => s + totals[w], 0)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Stack>
  )
}
