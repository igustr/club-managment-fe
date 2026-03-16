import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 2,
            p: 3,
            textAlign: 'center',
          }}
        >
          <ErrorOutline sx={{ fontSize: 64, color: 'error.main', opacity: 0.7 }} />
          <Typography variant="h5" fontWeight={700}>
            Midagi läks valesti
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
            Rakenduses tekkis ootamatu viga. Palun proovi uuesti.
          </Typography>
          <Button variant="contained" onClick={this.handleReset} sx={{ mt: 1 }}>
            Mine avalehele
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
