import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';


const NAV_LINKS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD },
  { label: 'Trade', path: ROUTES.TRADE },
  { label: 'Portfolio', path: ROUTES.PORTFOLIO },
  { label: 'News', path: ROUTES.NEWS },
  { label: 'Learn', path: ROUTES.LEARN },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setUserMenuAnchor(null);
    logout();
    navigate(ROUTES.HOME);
  };

  const handleMobileClose = () => setMobileOpen(false);

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        sx={{
          bgcolor: 'rgba(255, 253, 251, 0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Toolbar
          sx={{
            px: { xs: 2, md: 4 },
            maxWidth: 1280,
            mx: 'auto',
            width: '100%',
            minHeight: { xs: 56, md: 60 },
          }}
        >
          <Link
            to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            <Typography
              variant="body1"
              fontWeight={700}
              color="text.primary"
              letterSpacing="-0.025em"
            >
              FinSphere
            </Typography>
          </Link>

          {isAuthenticated && <Box sx={{ flex: 1 }} />}

          {isAuthenticated && (
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {NAV_LINKS.map(({ label, path }) => (
                <Button
                  key={path}
                  component={Link}
                  to={path}
                  size="small"
                  disableRipple
                  sx={{
                    color: isActive(path) ? 'primary.main' : 'text.secondary',
                    fontWeight: isActive(path) ? 600 : 400,
                    bgcolor: isActive(path) ? 'rgba(122, 62, 72, 0.08)' : 'transparent',
                    fontSize: '0.875rem',
                    px: 1.5,
                    py: 0.75,
                    '&:hover': {
                      bgcolor: 'rgba(122, 62, 72, 0.06)',
                      color: 'primary.main',
                    },
                  }}
                >
                  {label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flex: 1 }} />

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            {isAuthenticated ? (
              <>
                <IconButton
                  size="small"
                  onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                  aria-label="User menu"
                  aria-controls="user-menu"
                  aria-haspopup="true"
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    {user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </Avatar>
                </IconButton>

                <Menu
                  id="user-menu"
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={() => setUserMenuAnchor(null)}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem
                    onClick={handleLogout}
                    sx={{ fontSize: '0.875rem', color: 'error.main', mt: 0.5 }}
                  >
                    Sign out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to={ROUTES.LOGIN}
                  size="small"
                  sx={{ color: 'text.secondary', fontWeight: 400 }}
                >
                  Sign in
                </Button>
                <Button
                  component={Link}
                  to={ROUTES.REGISTER}
                  variant="contained"
                  size="small"
                  sx={{ px: 2 }}
                >
                  Get started
                </Button>
              </>
            )}
          </Box>

          <IconButton
            sx={{ display: { md: 'none' }, ml: 1 }}
            onClick={() => setMobileOpen(true)}
            aria-label="Open mobile menu"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleMobileClose}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: '#FFFDFB',
            boxShadow: '-4px 0 24px rgb(0 0 0 / 0.08)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="body2" fontWeight={700}>FinSphere</Typography>
          </Box>
          <IconButton size="small" onClick={handleMobileClose} aria-label="Close menu">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <List sx={{ px: 1, pt: 1 }}>
          {isAuthenticated ? (
            <>
              {NAV_LINKS.map(({ label, path }) => (
                <ListItem key={path} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={path}
                    onClick={handleMobileClose}
                    selected={isActive(path)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.25,
                      '&.Mui-selected': {
                        bgcolor: 'rgba(122, 62, 72, 0.08)',
                        '&:hover': { bgcolor: 'rgba(122, 62, 72, 0.12)' },
                      },
                    }}
                  >
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: isActive(path) ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}

              <Divider sx={{ my: 1 }} />

              {user && (
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {user.email}
                  </Typography>
                </Box>
              )}

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => { handleMobileClose(); handleLogout(); }}
                  sx={{ borderRadius: 1, color: 'error.main' }}
                >
                  <ListItemText
                    primary="Sign out"
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to={ROUTES.LOGIN}
                  onClick={handleMobileClose}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemText
                    primary="Sign in"
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mt: 0.5 }}>
                <Button
                  component={Link}
                  to={ROUTES.REGISTER}
                  variant="contained"
                  fullWidth
                  onClick={handleMobileClose}
                  sx={{ mx: 1 }}
                >
                  Get started
                </Button>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
}

export default Navbar;
