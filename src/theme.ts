export const colors = {
  bg: '#0D0F1C',
  surface: '#161929',
  surfaceRaised: '#1F2338',
  border: '#272B44',
  text: '#F3F4FA',
  textMuted: '#8E94B8',
  textDim: '#5E6488',
  move: '#FF4F7B',
  exercise: '#B6FF4D',
  steps: '#4DD8FF',
  accent: '#8B6CFF',
  muscle: '#FF4A3D',
  muscleSecondary: '#FFA24A',
  body: '#C9CEDB',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 12, md: 18, lg: 26, pill: 999 };

export const type = {
  hero: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.3 },
  body: { fontSize: 15, fontWeight: '500' as const },
  label: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  number: { fontVariant: ['tabular-nums' as const] },
};
