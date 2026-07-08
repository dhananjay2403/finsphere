import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Alert,
  Skeleton,
  Button,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import tradeService from '../services/tradeService';
import { ROUTES } from '../utils/constants';


// Constants

const PAGE_SIZE = 20;

const TABLE_HEADERS = [
  { label: 'Date', align: 'left' },
  { label: 'Symbol', align: 'left' },
  { label: 'Company', align: 'left' },
  { label: 'Type', align: 'center' },
  { label: 'Qty', align: 'right' },
  { label: 'Price', align: 'right' },
  { label: 'Total', align: 'right' },
];

// Wider Date + consistent numeric columns for a polished financial-table feel
const TABLE_GRID = '140px 72px 1fr 82px 64px 110px 120px';


// Helpers

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}


// Sub-components

// Sticky desktop table header
function TableHeader() {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'grid' },
        gridTemplateColumns: TABLE_GRID,
        gap: 2,
        px: 3,
        py: 1.25,
        borderBottom: '2px solid',
        borderColor: 'divider',
        bgcolor: '#FAFAF9',
        borderRadius: '8px 8px 0 0',
        // Sticky header — only sticks within the Paper's scroll container
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}
    >
      {TABLE_HEADERS.map(({ label, align }) => (
        <Typography
          key={label}
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{
            textAlign: align,
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </Typography>
      ))}
    </Box>
  );
}

// Desktop table row for a single trade
function TradeRow({ trade, isLast }) {
  const isBuy = trade.type === 'buy';

  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'grid' },
        gridTemplateColumns: TABLE_GRID,
        gap: 2,
        px: 3,
        py: 2,
        alignItems: 'center',
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: 'divider',
        transition: 'background-color 0.12s ease',
        '&:hover': {
          bgcolor: 'rgba(122, 62, 72, 0.03)',
        },
      }}
    >
      {/* Date + time */}
      <Box>
        <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.83rem' }}>
          {formatDate(trade.executedAt)}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
          {formatTime(trade.executedAt)}
        </Typography>
      </Box>

      {/* Symbol */}
      <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontSize: '0.85rem' }}>
        {trade.symbol}
      </Typography>

      {/* Company */}
      <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.83rem' }}>
        {trade.name}
      </Typography>

      {/* Type badge */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Chip
          icon={
            isBuy
              ? <TrendingUpIcon sx={{ fontSize: '12px !important' }} />
              : <TrendingDownIcon sx={{ fontSize: '12px !important' }} />
          }
          label={isBuy ? 'Buy' : 'Sell'}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.68rem',
            fontWeight: 600,
            bgcolor: isBuy ? 'rgba(21, 128, 61, 0.1)' : 'rgba(220, 38, 38, 0.1)',
            color: isBuy ? '#15803d' : '#dc2626',
            '& .MuiChip-icon': {
              color: isBuy ? '#15803d' : '#dc2626',
              ml: '6px',
            },
          }}
        />
      </Box>

      {/* Quantity */}
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ textAlign: 'right', fontSize: '0.83rem', fontVariantNumeric: 'tabular-nums' }}
      >
        {trade.quantity}
      </Typography>

      {/* Price per share */}
      <Typography
        variant="body2"
        fontWeight={500}
        sx={{ textAlign: 'right', fontSize: '0.83rem', fontVariantNumeric: 'tabular-nums' }}
      >
        ${trade.pricePerShare?.toFixed(2)}
      </Typography>

      {/* Total amount */}
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{
          textAlign: 'right',
          fontSize: '0.83rem',
          color: isBuy ? '#15803d' : '#dc2626',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {isBuy ? '−' : '+'}{formatCurrency(trade.totalAmount)}
      </Typography>
    </Box>
  );
}

// Mobile card for a single trade
function TradeCard({ trade }) {
  const isBuy = trade.type === 'buy';

  return (
    <Box
      sx={{
        display: { xs: 'flex', md: 'none' },
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isBuy ? 'rgba(21, 128, 61, 0.1)' : 'rgba(220, 38, 38, 0.1)',
            flexShrink: 0,
          }}
        >
          {isBuy
            ? <TrendingUpIcon sx={{ fontSize: 15, color: '#15803d' }} />
            : <TrendingDownIcon sx={{ fontSize: 15, color: '#dc2626' }} />}
        </Box>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography variant="body2" fontWeight={700}>{trade.symbol}</Typography>
            <Typography variant="caption" color="text.disabled">·</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              {isBuy ? 'Buy' : 'Sell'} {trade.quantity} sh
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 180, display: 'block' }}>
            {trade.name}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
            {formatDate(trade.executedAt)}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography variant="body2" fontWeight={700} color={isBuy ? '#15803d' : '#dc2626'}>
          {isBuy ? '−' : '+'}{formatCurrency(trade.totalAmount)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          @ ${trade.pricePerShare?.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
}

// Loading skeletons
function LoadingSkeletons() {
  return (
    <>
      {/* Desktop */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          sx={{
            display: { xs: 'none', md: 'grid' },
            gridTemplateColumns: TABLE_GRID,
            gap: 2,
            px: 3,
            py: 2,
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            <Skeleton width={90} height={14} animation="wave" />
            <Skeleton width={55} height={11} animation="wave" sx={{ mt: 0.25 }} />
          </Box>
          <Skeleton width={45} height={14} animation="wave" />
          <Skeleton width="80%" height={14} animation="wave" />
          <Skeleton width={44} height={22} sx={{ borderRadius: 2 }} animation="wave" />
          <Skeleton width={28} height={14} animation="wave" sx={{ ml: 'auto' }} />
          <Skeleton width={55} height={14} animation="wave" sx={{ ml: 'auto' }} />
          <Skeleton width={70} height={14} animation="wave" sx={{ ml: 'auto' }} />
        </Box>
      ))}

      {/* Mobile */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          sx={{
            display: { xs: 'flex', md: 'none' },
            gap: 1.5,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Skeleton variant="circular" width={32} height={32} animation="wave" />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="40%" height={14} animation="wave" />
            <Skeleton width="70%" height={12} animation="wave" sx={{ mt: 0.25 }} />
            <Skeleton width="30%" height={11} animation="wave" sx={{ mt: 0.25 }} />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Skeleton width={70} height={14} animation="wave" />
            <Skeleton width={50} height={11} animation="wave" sx={{ mt: 0.25 }} />
          </Box>
        </Box>
      ))}
    </>
  );
}


// Main component
function Transactions() {
  const navigate = useNavigate();

  const [trades, setTrades] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const fetchPage = useCallback(async (pageNum) => {
    setLoading(true);
    setError('');
    try {
      const result = await tradeService.getHistory({ page: pageNum, limit: PAGE_SIZE });
      setTrades(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setError('Could not load transaction history. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(page); }, [fetchPage, page]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      {/* Back to dashboard — pinned left, flush with the container edge across
          all breakpoints (kept out of the centered header block below). */}
      <Box sx={{ mb: 1 }}>
        <Button
          size="small"
          startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
          onClick={() => navigate(ROUTES.DASHBOARD)}
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.8rem',
            minWidth: 0,
            px: 0,
            py: 0.5,
            '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
          }}
        >
          Dashboard
        </Button>
      </Box>

      {/* Page header — centered */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.025em">
          Transactions
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Your complete trade history
        </Typography>

        {!loading && total > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Chip
              label={`${total} trade${total !== 1 ? 's' : ''}`}
              size="small"
              sx={{
                bgcolor: 'rgba(122, 62, 72, 0.08)',
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '0.72rem',
              }}
            />
          </Box>
        )}
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>{error}</Alert>
      )}

      {/* Table container */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'white',
          overflow: 'hidden',
        }}
      >
        {/* Desktop sticky header */}
        <TableHeader />

        {/* Loading */}
        {loading && (
          <Box sx={{ p: { xs: 2, md: 0 } }}>
            <LoadingSkeletons />
          </Box>
        )}

        {/* Empty state */}
        {!loading && !error && trades.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <SwapHorizIcon sx={{ fontSize: 40, color: '#e2e8f0', mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              No transactions yet
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Your trade history will appear here once you start trading.
            </Typography>
          </Box>
        )}

        {/* Trade rows */}
        {!loading && trades.length > 0 && (
          <Box sx={{ px: { xs: 2, md: 0 } }}>
            {trades.map((trade, idx) => (
              <Box key={trade._id}>
                <TradeRow trade={trade} isLast={idx === trades.length - 1} />
                <TradeCard trade={trade} />
              </Box>
            ))}
          </Box>
        )}

        {/* Pagination footer */}
        {!loading && totalPages > 1 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              py: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: '#FAFAF9',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Page {page} of {totalPages} · {total} trade{total !== 1 ? 's' : ''}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                disabled={page <= 1}
                onClick={handlePrev}
                sx={{
                  borderColor: 'divider',
                  color: 'text.secondary',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                }}
              >
                Prev
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={page >= totalPages}
                onClick={handleNext}
                sx={{
                  borderColor: 'divider',
                  color: 'text.secondary',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

    </Container>
  );
}


export default Transactions;
