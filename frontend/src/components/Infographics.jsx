import { Box, Typography } from '@mui/material';

const COLORS = {
  burgundy: '#7A3E48',
  rose: '#C88C96',
  beige: '#F8F4EF',
  clay: '#B07A61',
  divider: '#E8DED5',
  softPink: 'rgba(122, 62, 72, 0.08)',
  white: '#FFFDFB',
  text: '#1F1A17',
  textSecondary: '#6B6B6B',
};

const PALETTE = [COLORS.burgundy, COLORS.rose, COLORS.clay, '#D4A59A', COLORS.divider];

/* Wrapper */

function DiagramWrapper({ title, children }) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: COLORS.white,
        overflow: 'hidden',
        mb: 3,
      }}
    >
      {title && (
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: 0 }}>
          <Typography variant="body2" fontWeight={600} color="primary.main" sx={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </Typography>
        </Box>
      )}
      <Box sx={{ p: { xs: 2, sm: 3 }, overflowX: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
}

/* STOCK MARKET FLOW (Buyer → Exchange → Seller) */

export function StockMarketFlowDiagram({ title }) {
  const nodes = [
    { label: 'Buyer', sub: 'You', emoji: '🧑' },
    { label: 'Exchange', sub: 'NYSE / NASDAQ', emoji: '🏛' },
    { label: 'Seller', sub: 'Another Investor', emoji: '🤝' },
  ];
  const colors = [COLORS.burgundy, COLORS.clay, COLORS.rose];

  return (
    <DiagramWrapper title={title}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: { xs: 0, sm: 0 } }}>
        {nodes.map((node, i) => (
          <Box key={i} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center', minWidth: { sm: 120 } }}>
              <svg width="64" height="64" viewBox="0 0 64 64" style={{ display: 'block', margin: '0 auto' }}>
                <circle cx="32" cy="32" r="30" fill={colors[i]} opacity="0.12" />
                <circle cx="32" cy="32" r="22" fill={colors[i]} opacity="0.25" />
                <text x="32" y="32" textAnchor="middle" dominantBaseline="central" fontSize="22">
                  {node.emoji}
                </text>
              </svg>
              <Typography variant="body2" fontWeight={700} sx={{ mt: 1, fontSize: '0.82rem', color: colors[i] }}>
                {node.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                {node.sub}
              </Typography>
            </Box>
            {i < nodes.length - 1 && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 1, sm: 0 }, px: { sm: 1.5 } }}>
                <svg width="36" height="20" viewBox="0 0 36 20" style={{ display: 'block' }}>
                  <line x1="2" y1="10" x2="28" y2="10" stroke={COLORS.burgundy} strokeWidth="2" strokeDasharray="4 3" />
                  <path d="M24 5 L30 10 L24 15" stroke={COLORS.burgundy} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      {/* Ownership flow note */}
      <Box sx={{ mt: 2.5, p: 1.5, bgcolor: COLORS.beige, borderRadius: 1.5, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
          💡 When you buy a stock, money goes to the seller and you receive ownership shares — the exchange matches both sides.
        </Typography>
      </Box>
    </DiagramWrapper>
  );
}

/* ETF DIVERSIFICATION (ETF → Multiple Companies) */

export function ETFDiversificationDiagram({ title }) {
  const companies = [
    { name: 'AAPL', pct: 20 },
    { name: 'MSFT', pct: 18 },
    { name: 'GOOGL', pct: 15 },
    { name: 'AMZN', pct: 12 },
    { name: 'TSLA', pct: 10 },
    { name: '95+ more', pct: 25 },
  ];
  const compColors = [COLORS.burgundy, COLORS.rose, COLORS.clay, '#D4A59A', COLORS.divider, '#d1c7be'];

  return (
    <DiagramWrapper title={title}>
      {/* Central ETF node */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 80, height: 80, borderRadius: '50%',
            bgcolor: COLORS.burgundy, color: '#fff',
            fontWeight: 800, fontSize: '1rem',
            boxShadow: `0 0 0 6px rgba(122, 62, 72, 0.12)`,
          }}
        >
          ETF
        </Box>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, fontSize: '0.72rem' }}>
          One purchase gives you all of these ↓
        </Typography>
      </Box>

      {/* Branching arrows */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <svg width="200" height="24" viewBox="0 0 200 24" style={{ display: 'block' }}>
          <line x1="100" y1="0" x2="100" y2="12" stroke={COLORS.divider} strokeWidth="2" />
          <line x1="16" y1="12" x2="184" y2="12" stroke={COLORS.divider} strokeWidth="2" />
          {[16, 52, 88, 124, 152, 184].map((x, i) => (
            <line key={i} x1={x} y1="12" x2={x} y2="24" stroke={COLORS.divider} strokeWidth="2" />
          ))}
        </svg>
      </Box>

      {/* Company grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(6, 1fr)' }, gap: 1 }}>
        {companies.map(({ name, pct }, i) => (
          <Box key={name} sx={{ textAlign: 'center', p: 1.5, bgcolor: COLORS.beige, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
            <Box
              sx={{
                width: 32, height: 32, borderRadius: '50%', mx: 'auto', mb: 0.5,
                bgcolor: compColors[i], color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.55rem',
              }}
            >
              {name.length <= 5 ? name : '...'}
            </Box>
            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.65rem', display: 'block' }}>
              {name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              ~{pct}%
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 2, p: 1.5, bgcolor: COLORS.softPink, borderRadius: 1.5, textAlign: 'center', border: '1px solid', borderColor: 'rgba(122, 62, 72, 0.15)' }}>
        <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ fontSize: '0.72rem' }}>
          💡 Instead of buying 100 stocks separately, one ETF gives you instant diversification.
        </Typography>
      </Box>
    </DiagramWrapper>
  );
}

/* COMPARISON TABLE DIAGRAM */

export function ComparisonTableDiagram({ title, headers, rows }) {
  return (
    <DiagramWrapper title={title}>
      <Box sx={{ overflowX: 'auto' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            '& th': {
              p: { xs: 1, sm: 1.5 },
              textAlign: 'left',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderBottom: '2px solid',
              borderColor: COLORS.burgundy,
              color: COLORS.burgundy,
              whiteSpace: 'nowrap',
            },
            '& td': {
              p: { xs: 1, sm: 1.5 },
              fontSize: '0.72rem',
              borderBottom: '1px solid',
              borderColor: COLORS.divider,
              color: COLORS.textSecondary,
              lineHeight: 1.5,
            },
            '& tr:last-child td': {
              borderBottom: 'none',
            },
            '& tr:nth-of-type(even) td': {
              bgcolor: COLORS.beige,
            },
          }}
        >
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={ci === 0 ? { fontWeight: 600, color: COLORS.text } : undefined}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </DiagramWrapper>
  );
}

/* COMPOUNDING TIMELINE */

export function CompoundingTimelineDiagram({ title }) {
  const data = [
    { year: 'Year 0', value: '₹10,000', growth: '', bar: 10 },
    { year: 'Year 5', value: '₹16,289', growth: '+63%', bar: 24 },
    { year: 'Year 10', value: '₹26,533', growth: '+165%', bar: 40 },
    { year: 'Year 15', value: '₹43,219', growth: '+332%', bar: 56 },
    { year: 'Year 20', value: '₹70,400', growth: '+604%', bar: 72 },
    { year: 'Year 30', value: '₹1,86,792', growth: '+1768%', bar: 100 },
  ];

  return (
    <DiagramWrapper title={title}>
      {/* Snowball visual */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: { xs: 0.5, sm: 1.5 }, mb: 3, height: 120 }}>
        {data.map(({ year, bar }, i) => (
          <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <Box
              sx={{
                width: { xs: '100%', sm: 36 },
                height: `${bar}%`,
                minHeight: 12,
                bgcolor: PALETTE[i % PALETTE.length],
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.5s ease',
              }}
            />
            <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.58rem', color: 'text.secondary', textAlign: 'center' }}>
              {year.replace('Year ', 'Y')}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Data rows */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {data.map(({ year, value, growth }, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              bgcolor: i === data.length - 1 ? COLORS.softPink : COLORS.beige,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: i === data.length - 1 ? 'rgba(122, 62, 72, 0.2)' : 'transparent',
            }}
          >
            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.72rem', minWidth: 55 }}>
              {year}
            </Typography>
            <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.78rem', color: COLORS.burgundy }}>
              {value}
            </Typography>
            {growth && (
              <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 600 }}>
                {growth}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 2, p: 1.5, bgcolor: COLORS.softPink, borderRadius: 1.5, textAlign: 'center', border: '1px solid', borderColor: 'rgba(122, 62, 72, 0.15)' }}>
        <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ fontSize: '0.72rem' }}>
          🔄 ₹10,000 → ₹1,86,792 in 30 years at 10% annual return — your money earned ₹1,76,792 on its own!
        </Typography>
      </Box>
    </DiagramWrapper>
  );
}

/* PORTFOLIO ALLOCATION DIAGRAM (Diversification) */

export function PortfolioAllocationDiagram({ title }) {
  const segments = [
    { label: 'Indian Stocks', pct: 35, color: COLORS.burgundy },
    { label: 'US Stocks', pct: 20, color: COLORS.rose },
    { label: 'Gold', pct: 15, color: '#D4A017' },
    { label: 'Bonds', pct: 15, color: COLORS.clay },
    { label: 'Fixed Deposits', pct: 10, color: '#9E8DA0' },
    { label: 'Cash', pct: 5, color: COLORS.divider },
  ];

  let cumulative = 0;
  const paths = segments.map((seg) => {
    const startAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += seg.pct;
    const endAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const r = 70;
    const cx = 110;
    const cy = 110;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = seg.pct / 100 > 0.5 ? 1 : 0;
    const innerR = 40;
    const ix1 = cx + innerR * Math.cos(startAngle);
    const iy1 = cy + innerR * Math.sin(startAngle);
    const ix2 = cx + innerR * Math.cos(endAngle);
    const iy2 = cy + innerR * Math.sin(endAngle);
    return { ...seg, path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z` };
  });

  return (
    <DiagramWrapper title={title}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3 }}>
        <Box sx={{ flexShrink: 0 }}>
          <svg width="220" height="220" viewBox="0 0 220 220" style={{ maxWidth: '100%', display: 'block', margin: '0 auto' }}>
            {paths.map((seg, i) => (
              <path key={i} d={seg.path} fill={seg.color} stroke={COLORS.white} strokeWidth="2" />
            ))}
            <text x="110" y="105" textAnchor="middle" fontSize="11" fontWeight="700" fill={COLORS.burgundy}>Diversified</text>
            <text x="110" y="120" textAnchor="middle" fontSize="11" fontWeight="700" fill={COLORS.burgundy}>Portfolio</text>
          </svg>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {segments.map((seg) => (
            <Box key={seg.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: seg.color, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{seg.label}</Typography>
                  <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ fontSize: '0.75rem' }}>{seg.pct}%</Typography>
                </Box>
                <Box sx={{ height: 4, bgcolor: '#f1ece8', borderRadius: 2, mt: 0.3 }}>
                  <Box sx={{ height: 4, width: `${seg.pct}%`, bgcolor: seg.color, borderRadius: 2 }} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Box sx={{ mt: 2, p: 1.5, bgcolor: COLORS.softPink, borderRadius: 1.5, textAlign: 'center', border: '1px solid rgba(122,62,72,0.15)' }}>
        <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ fontSize: '0.72rem' }}>
          🛡️ Spreading across 6 asset classes means no single crash can wipe out your entire portfolio.
        </Typography>
      </Box>
    </DiagramWrapper>
  );
}

/* RISK vs RETURN CHART (Risk Management) */

export function RiskReturnChart({ title }) {
  const points = [
    { label: 'Fixed Deposits', risk: 10, ret: 12, color: '#15803d' },
    { label: 'Govt Bonds', risk: 18, ret: 22, color: '#65a30d' },
    { label: 'Corp Bonds', risk: 32, ret: 38, color: '#ca8a04' },
    { label: 'Index Funds', risk: 52, ret: 58, color: COLORS.clay },
    { label: 'Blue Chip', risk: 62, ret: 68, color: COLORS.rose },
    { label: 'Small Cap', risk: 78, ret: 80, color: COLORS.burgundy },
    { label: 'Crypto', risk: 94, ret: 90, color: '#7c3aed' },
  ];
  const W = 280;
  const H = 180;
  const PAD = 36;

  return (
    <DiagramWrapper title={title}>
      <Box sx={{ overflowX: 'auto' }}>
        <svg width={W} height={H + 30} viewBox={`0 0 ${W} ${H + 30}`} style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}>
          <line x1={PAD} y1={PAD} x2={PAD} y2={H} stroke={COLORS.divider} strokeWidth="1.5" />
          <line x1={PAD} y1={H} x2={W - 10} y2={H} stroke={COLORS.divider} strokeWidth="1.5" />
          <text x={PAD + (W - PAD - 10) / 2} y={H + 22} textAnchor="middle" fontSize="9" fill={COLORS.textSecondary}>Risk →</text>
          <text x={12} y={PAD + (H - PAD) / 2} textAnchor="middle" fontSize="9" fill={COLORS.textSecondary} transform={`rotate(-90, 12, ${PAD + (H - PAD) / 2})`}>Return →</text>
          <line x1={PAD + 5} y1={H - 5} x2={W - 15} y2={PAD + 5} stroke={COLORS.divider} strokeWidth="1" strokeDasharray="4 3" />
          {points.map((pt, i) => {
            const x = PAD + (pt.risk / 100) * (W - PAD - 10);
            const y = H - (pt.ret / 100) * (H - PAD);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={6} fill={pt.color} opacity={0.9} />
                <text x={x} y={y - 10} textAnchor="middle" fontSize="7" fill={COLORS.text} fontWeight="600">{pt.label}</text>
              </g>
            );
          })}
        </svg>
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
        {[{ label: 'Low Risk / Low Return', color: '#15803d' }, { label: 'Medium Risk / Medium Return', color: COLORS.clay }, { label: 'High Risk / High Return', color: COLORS.burgundy }].map((item) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>{item.label}</Typography>
          </Box>
        ))}
      </Box>
    </DiagramWrapper>
  );
}

/* TECHNICAL ANALYSIS DIAGRAM */

export function TechnicalAnalysisDiagram({ title }) {
  const candles = [
    { o: 120, h: 135, l: 115, c: 130 },
    { o: 130, h: 140, l: 125, c: 128 },
    { o: 128, h: 145, l: 120, c: 142 },
    { o: 142, h: 155, l: 138, c: 150 },
    { o: 150, h: 158, l: 140, c: 138 },
    { o: 138, h: 142, l: 125, c: 128 },
    { o: 128, h: 138, l: 120, c: 135 },
    { o: 135, h: 148, l: 130, c: 145 },
  ];
  const W = 280;
  const H = 160;
  const PL = 10; const PR = 10; const PT = 10; const PB = 10;
  const minPrice = 110;
  const maxPrice = 165;
  const priceRange = maxPrice - minPrice;
  const candleW = (W - PL - PR) / candles.length;
  const toY = (price) => PT + ((maxPrice - price) / priceRange) * (H - PT - PB);
  const supportY = toY(120);
  const resistY = toY(155);
  const maPoints = candles.map((c, i) => {
    const x = PL + i * candleW + candleW / 2;
    const y = toY((c.o + c.h + c.l + c.c) / 4);
    return `${x},${y}`;
  }).join(' ');

  return (
    <DiagramWrapper title={title}>
      <Box sx={{ overflowX: 'auto' }}>
        <svg width={W} height={H + 40} viewBox={`0 0 ${W} ${H + 40}`} style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}>
          <line x1={PL} y1={supportY} x2={W - PR} y2={supportY} stroke="#15803d" strokeWidth="1.5" strokeDasharray="5 3" opacity={0.8} />
          <text x={W - PR - 2} y={supportY - 3} textAnchor="end" fontSize="7" fill="#15803d" fontWeight="700">Support ~₹120</text>
          <line x1={PL} y1={resistY} x2={W - PR} y2={resistY} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="5 3" opacity={0.8} />
          <text x={W - PR - 2} y={resistY - 3} textAnchor="end" fontSize="7" fill="#dc2626" fontWeight="700">Resistance ~₹155</text>
          <polyline points={maPoints} fill="none" stroke={COLORS.burgundy} strokeWidth="2" opacity={0.8} />
          {candles.map((c, i) => {
            const x = PL + i * candleW;
            const midX = x + candleW / 2;
            const isGreen = c.c >= c.o;
            const color = isGreen ? '#15803d' : '#dc2626';
            const bodyTop = toY(Math.max(c.o, c.c));
            const bodyBot = toY(Math.min(c.o, c.c));
            const bodyH = Math.max(bodyBot - bodyTop, 1);
            return (
              <g key={i}>
                <line x1={midX} y1={toY(c.h)} x2={midX} y2={toY(c.l)} stroke={color} strokeWidth="1" />
                <rect x={x + 2} y={bodyTop} width={candleW - 4} height={bodyH} fill={color} opacity={0.85} rx="1" />
              </g>
            );
          })}
          <text x={W / 2} y={H + 30} textAnchor="middle" fontSize="8" fill={COLORS.textSecondary}>8-week price chart</text>
        </svg>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1, mt: 1.5 }}>
        {[
          { label: '🟩 Green candle', detail: 'Price closed HIGHER than it opened' },
          { label: '🟥 Red candle', detail: 'Price closed LOWER than it opened' },
          { label: '〰️ Moving avg', detail: 'Smoothed trend line to show direction' },
        ].map((item, i) => (
          <Box key={i} sx={{ p: 1.25, bgcolor: COLORS.beige, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem', display: 'block', mb: 0.25 }}>{item.label}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1.4 }}>{item.detail}</Typography>
          </Box>
        ))}
      </Box>
    </DiagramWrapper>
  );
}

/* EMOTION CYCLE DIAGRAM (Market Psychology) */

export function EmotionCycleDiagram({ title }) {
  const emotions = [
    { label: 'Optimism', sub: 'Market looks good', color: '#65a30d', angle: 0 },
    { label: 'Excitement', sub: 'Prices rising fast', color: '#ca8a04', angle: 45 },
    { label: 'Euphoria', sub: 'Peak of the market', color: '#dc2626', angle: 90 },
    { label: 'Anxiety', sub: 'Something feels off', color: '#ea580c', angle: 135 },
    { label: 'Denial', sub: "It'll bounce back", color: COLORS.rose, angle: 180 },
    { label: 'Panic', sub: 'Selling everything!', color: COLORS.burgundy, angle: 225 },
    { label: 'Capitulation', sub: 'Market bottoms out', color: '#7c3aed', angle: 270 },
    { label: 'Recovery', sub: 'Smart money buys', color: '#0284c7', angle: 315 },
  ];

  const W = 280;
  const cx = 140;
  const cy = 140;
  const r = 95;

  return (
    <DiagramWrapper title={title}>
      <Box sx={{ overflowX: 'auto' }}>
        <svg width={W} height={W} viewBox={`0 0 ${W} ${W}`} style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.divider} strokeWidth="2" strokeDasharray="6 3" />
          <text x={cx} y={cy - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill={COLORS.burgundy}>Market</text>
          <text x={cx} y={cy + 8} textAnchor="middle" fontSize="10" fontWeight="700" fill={COLORS.burgundy}>Cycle</text>
          {emotions.map((em, i) => {
            const rad = (em.angle * Math.PI) / 180;
            const x = cx + r * Math.cos(rad);
            const y = cy + r * Math.sin(rad);
            const isRight = x > cx + 10;
            const isLeft = x < cx - 10;
            const labelX = isRight ? x + 18 : isLeft ? x - 18 : x;
            const labelAnchor = isRight ? 'start' : isLeft ? 'end' : 'middle';
            const labelY = y + (y < cy ? -10 : 12);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={13} fill={em.color} opacity={0.92} />
                <text x={x} y={y + 4} textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff">{em.label}</text>
                <text x={labelX} y={labelY} textAnchor={labelAnchor} fontSize="6" fill={COLORS.textSecondary}>{em.sub}</text>
              </g>
            );
          })}
        </svg>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1, mt: 1.5 }}>
        {[
          { label: '📈 Best Buy Zone', sub: 'Recovery phase', color: '#0284c7' },
          { label: '⚠️ Danger Zone', sub: 'Euphoria phase', color: '#dc2626' },
          { label: '💡 Stay Rational', sub: 'Ignore market noise', color: '#15803d' },
          { label: '😱 Avoid Panic', sub: 'Biggest investing mistake', color: COLORS.burgundy },
        ].map((item, i) => (
          <Box key={i} sx={{ p: 1.25, bgcolor: COLORS.beige, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem', display: 'block', color: item.color, mb: 0.2 }}>{item.label}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{item.sub}</Typography>
          </Box>
        ))}
      </Box>
    </DiagramWrapper>
  );
}

/* BUSINESS VALUATION FLOW (Fundamental Analysis) */

export function BusinessValuationFlow({ title }) {
  const steps = [
    { icon: '📊', label: 'Revenue', detail: 'Total sales earned by the company in a year', color: '#0284c7' },
    { icon: '💰', label: 'Profit (Net Income)', detail: 'Revenue minus all expenses and taxes', color: '#065f46' },
    { icon: '📈', label: 'Earnings Per Share (EPS)', detail: 'Net profit ÷ total shares outstanding', color: COLORS.clay },
    { icon: '🔍', label: 'Valuation — P/E Ratio', detail: 'Share Price ÷ EPS = how expensive the stock is', color: COLORS.rose },
    { icon: '✅', label: 'Investment Decision', detail: 'Compare P/E to peers — Buy, Hold, or Sell?', color: COLORS.burgundy },
  ];

  return (
    <DiagramWrapper title={title}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((step, i) => (
          <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.75, bgcolor: i === 0 ? COLORS.softPink : COLORS.beige, border: '1px solid', borderColor: i === 0 ? 'rgba(122,62,72,0.2)' : 'divider', borderRadius: 2, width: '100%' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>
                {step.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.82rem', color: step.color }}>{step.label}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.4 }}>{step.detail}</Typography>
              </Box>
              <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: `${step.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: step.color, fontSize: '0.78rem', flexShrink: 0 }}>
                {i + 1}
              </Box>
            </Box>
            {i < steps.length - 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.25 }}>
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path d="M10 2 L10 16 M6 12 L10 16 L14 12" stroke={COLORS.burgundy} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 2, p: 1.5, bgcolor: COLORS.softPink, borderRadius: 1.5, textAlign: 'center', border: '1px solid rgba(122,62,72,0.15)' }}>
        <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ fontSize: '0.72rem' }}>
          💡 P/E of 15 means investors pay ₹15 for every ₹1 of earnings. Lower P/E may mean undervalued.
        </Typography>
      </Box>
    </DiagramWrapper>
  );
}

/* PORTFOLIO TYPE DIAGRAM (Portfolio Construction) */

export function PortfolioTypeDiagram({ title }) {
  const portfolios = [
    {
      type: 'Conservative',
      emoji: '🛡️',
      color: '#15803d',
      desc: 'Capital preservation first',
      segments: [
        { label: 'Bonds', pct: 50, color: '#15803d' },
        { label: 'FD/Cash', pct: 20, color: '#65a30d' },
        { label: 'Stocks', pct: 20, color: COLORS.clay },
        { label: 'Gold', pct: 10, color: '#D4A017' },
      ],
    },
    {
      type: 'Balanced',
      emoji: '⚖️',
      color: COLORS.clay,
      desc: 'Growth with stability',
      segments: [
        { label: 'Stocks', pct: 50, color: COLORS.burgundy },
        { label: 'Bonds', pct: 25, color: '#15803d' },
        { label: 'Gold', pct: 15, color: '#D4A017' },
        { label: 'Cash', pct: 10, color: COLORS.divider },
      ],
    },
    {
      type: 'Growth',
      emoji: '🚀',
      color: COLORS.burgundy,
      desc: 'Maximum long-term returns',
      segments: [
        { label: 'Indian Stocks', pct: 50, color: COLORS.burgundy },
        { label: 'US/Intl Stocks', pct: 30, color: COLORS.rose },
        { label: 'Gold', pct: 10, color: '#D4A017' },
        { label: 'Bonds', pct: 10, color: '#15803d' },
      ],
    },
  ];

  return (
    <DiagramWrapper title={title}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
        {portfolios.map((p) => (
          <Box key={p.type} sx={{ p: 2, bgcolor: COLORS.beige, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography sx={{ fontSize: '1.2rem' }}>{p.emoji}</Typography>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.82rem', color: p.color }}>{p.type}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{p.desc}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', height: 14, borderRadius: 1, overflow: 'hidden', mb: 1.5 }}>
              {p.segments.map((seg) => (
                <Box key={seg.label} sx={{ width: `${seg.pct}%`, bgcolor: seg.color }} />
              ))}
            </Box>
            {p.segments.map((seg) => (
              <Box key={seg.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: seg.color }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{seg.label}</Typography>
                </Box>
                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.65rem' }}>{seg.pct}%</Typography>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </DiagramWrapper>
  );
}

/* GLOBAL DIVERSIFICATION DIAGRAM (Global Investing) */

export function GlobalDiversificationDiagram({ title }) {
  const markets = [
    { region: 'India 🇮🇳', pct: 35, color: COLORS.burgundy, examples: 'Nifty 50, SENSEX, Nifty Midcap' },
    { region: 'USA 🇺🇸', pct: 30, color: '#0284c7', examples: 'S&P 500, NASDAQ, Russell 2000' },
    { region: 'International 🌏', pct: 20, color: COLORS.clay, examples: 'Europe, Japan, Emerging Markets' },
    { region: 'Gold 🥇', pct: 15, color: '#D4A017', examples: 'Safe haven & inflation hedge' },
  ];

  return (
    <DiagramWrapper title={title}>
      <Box sx={{ display: 'flex', height: 24, borderRadius: 2, overflow: 'hidden', mb: 2.5 }}>
        {markets.map((m) => (
          <Box key={m.region} sx={{ width: `${m.pct}%`, bgcolor: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {m.pct >= 20 && (
              <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.6rem' }}>{m.pct}%</Typography>
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {markets.map((m) => (
          <Box key={m.region} sx={{ display: 'flex', gap: 1.5, p: 1.5, bgcolor: COLORS.beige, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', alignItems: 'center' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: '#fff', fontSize: '0.75rem' }}>{m.pct}%</Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem', color: m.color }}>{m.region}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.67rem' }}>{m.examples}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 2, p: 1.5, bgcolor: COLORS.softPink, borderRadius: 1.5, border: '1px solid rgba(122,62,72,0.15)', textAlign: 'center' }}>
        <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ fontSize: '0.72rem' }}>
          🌍 When India's market falls, the US or Europe may be rising — global spread smooths your journey.
        </Typography>
      </Box>
    </DiagramWrapper>
  );
}

/* BLOCKCHAIN DIAGRAM (Cryptocurrency Basics) */

export function BlockchainDiagram({ title }) {
  const blocks = [
    { id: '#001', tx: 'Alice → Bob: 0.5 BTC', hash: '0xA3F2…', prev: 'Genesis', color: COLORS.burgundy },
    { id: '#002', tx: 'Bob → Carol: 0.2 BTC', hash: '0xB7C1…', prev: '0xA3F2…', color: COLORS.rose },
    { id: '#003', tx: 'Carol → Dave: 0.1 BTC', hash: '0xD9E4…', prev: '0xB7C1…', color: COLORS.clay },
  ];

  return (
    <DiagramWrapper title={title}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 0, alignItems: { xs: 'stretch', sm: 'flex-start' } }}>
        {blocks.map((block, i) => (
          <Box key={block.id} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', flex: 1 }}>
            <Box sx={{ p: 2, bgcolor: COLORS.beige, border: '2px solid', borderColor: block.color, borderRadius: 2, flex: 1, minWidth: { sm: 100 } }}>
              <Typography variant="caption" fontWeight={800} sx={{ color: block.color, fontSize: '0.7rem', display: 'block', mb: 0.75 }}>Block {block.id}</Typography>
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Transaction</Typography>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.67rem', display: 'block', color: COLORS.text }}>{block.tx}</Typography>
              </Box>
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Hash</Typography>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.67rem', display: 'block', color: block.color, fontFamily: 'monospace' }}>{block.hash}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Prev Hash</Typography>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.67rem', display: 'block', fontFamily: 'monospace', color: COLORS.textSecondary }}>{block.prev}</Typography>
              </Box>
            </Box>
            {i < blocks.length - 1 && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 0.5, sm: 0 }, px: { sm: 0.5 } }}>
                <svg width="24" height="20" viewBox="0 0 24 20">
                  <line x1="2" y1="10" x2="18" y2="10" stroke={COLORS.burgundy} strokeWidth="2" strokeDasharray="3 2" />
                  <path d="M14 6 L20 10 L14 14" stroke={COLORS.burgundy} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.25, mt: 2 }}>
        {[
          { icon: '🔗', label: 'Linked', detail: 'Each block references the previous — tampering breaks the entire chain' },
          { icon: '🌐', label: 'Decentralized', detail: 'No single bank controls it — thousands of computers verify every transaction' },
          { icon: '🔒', label: 'Immutable', detail: 'Once recorded, transactions cannot be altered or deleted by anyone' },
        ].map((item, i) => (
          <Box key={i} sx={{ p: 1.5, bgcolor: COLORS.softPink, borderRadius: 1.5, border: '1px solid rgba(122,62,72,0.12)' }}>
            <Typography sx={{ fontSize: '1.1rem', mb: 0.5 }}>{item.icon}</Typography>
            <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ fontSize: '0.72rem', display: 'block', mb: 0.25 }}>{item.label}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.67rem', lineHeight: 1.4 }}>{item.detail}</Typography>
          </Box>
        ))}
      </Box>
    </DiagramWrapper>
  );
}
