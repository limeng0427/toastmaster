import { Paper, Rating, Stack, TextField, Typography } from '@mui/material'
import { useSession } from '../../store/session'
import type { EvaluatorState } from '../../store/session'

const SECTIONS: { key: keyof EvaluatorState; label: string; placeholder: string }[] = [
  { key: 'opening', label: 'Opening', placeholder: 'How was the meeting opened? Energy, welcome, agenda...' },
  { key: 'body', label: 'Body', placeholder: 'Speech quality, timing, variety, engagement...' },
  { key: 'closing', label: 'Closing', placeholder: 'How well was the meeting wrapped up?' },
  { key: 'overall', label: 'Overall', placeholder: 'General impressions and suggestions...' },
]

export default function GeneralEvaluator() {
  const { evaluator, setEvaluatorField } = useSession()

  return (
    <Stack spacing={2.5}>
      {/* Star rating */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" letterSpacing={1} mb={1.5}>
          Meeting Rating
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Rating
            value={evaluator.rating}
            onChange={(_, val) => setEvaluatorField('rating', val ?? 0)}
            size="large"
          />
          {evaluator.rating > 0 && (
            <Typography variant="body2" color="text.secondary">{evaluator.rating}/5</Typography>
          )}
        </Stack>
      </Paper>

      {/* Section notes */}
      {SECTIONS.map(({ key, label, placeholder }) => (
        <Paper key={key} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" letterSpacing={1} mb={1.5}>
            {label}
          </Typography>
          <TextField
            multiline
            rows={3}
            fullWidth
            size="small"
            placeholder={placeholder}
            value={evaluator[key] as string}
            onChange={(e) => setEvaluatorField(key, e.target.value)}
          />
        </Paper>
      ))}
    </Stack>
  )
}
