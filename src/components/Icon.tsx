import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'rings'
  | 'dumbbell'
  | 'timer'
  | 'chart'
  | 'play'
  | 'pause'
  | 'reset'
  | 'flag'
  | 'check'
  | 'close'
  | 'flame'
  | 'clock'
  | 'plus'
  | 'minus'
  | 'chevron'
  | 'run'
  | 'bolt';

export function Icon({ name, size = 22, color = '#fff', strokeWidth = 2 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const p = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'rings' && (
        <>
          <Circle cx={12} cy={12} r={9} {...p} />
          <Circle cx={12} cy={12} r={5} {...p} />
        </>
      )}
      {name === 'dumbbell' && (
        <>
          <Path d="M7 12h10" {...p} />
          <Rect x={3} y={8} width={4} height={8} rx={1.2} {...p} />
          <Rect x={17} y={8} width={4} height={8} rx={1.2} {...p} />
        </>
      )}
      {name === 'timer' && (
        <>
          <Circle cx={12} cy={13} r={8} {...p} />
          <Path d="M12 9v4l2.5 2.5M9.5 2.5h5" {...p} />
        </>
      )}
      {name === 'chart' && <Path d="M5 20V11M12 20V4M19 20v-6" {...p} />}
      {name === 'play' && <Path d="M7 4.5v15l12-7.5z" {...p} fill={color} />}
      {name === 'pause' && <Path d="M8 5v14M16 5v14" {...p} strokeWidth={strokeWidth + 1.5} />}
      {name === 'reset' && <Path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4" {...p} />}
      {name === 'flag' && <Path d="M5 21V4M5 4h11l-2 4 2 4H5" {...p} />}
      {name === 'check' && <Path d="M5 12.5l4.5 4.5L19 7.5" {...p} />}
      {name === 'close' && <Path d="M6 6l12 12M18 6L6 18" {...p} />}
      {name === 'flame' && <Path d="M12 21c4 0 7-2.8 7-7 0-4.5-4-7-4.5-11-2.5 2-3.5 4.5-3 7-1.5-.5-2.5-2-2.5-3.5C7 8.5 5 11 5 14c0 4.2 3 7 7 7z" {...p} />}
      {name === 'clock' && (
        <>
          <Circle cx={12} cy={12} r={9} {...p} />
          <Path d="M12 7v5l3 2" {...p} />
        </>
      )}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...p} />}
      {name === 'minus' && <Path d="M5 12h14" {...p} />}
      {name === 'chevron' && <Path d="M9 5l7 7-7 7" {...p} />}
      {name === 'run' && (
        <>
          <Circle cx={14} cy={4.5} r={1.8} {...p} />
          <Path d="M8 21l3-6 3 2v4M6 11l4-3 4 1 2 3h3M11 15l2-6" {...p} />
        </>
      )}
      {name === 'bolt' && <Path d="M13 2L5 14h6l-1 8 8-12h-6z" {...p} />}
    </Svg>
  );
}
