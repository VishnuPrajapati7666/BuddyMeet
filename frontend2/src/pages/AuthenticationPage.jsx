import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import Snackbar from '@mui/material/Snackbar';



// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Authentication() {
  const [username,setUsername]=React.useState("");
  const [password,setPassword]=React.useState("");
  const [name,setName]=React.useState("");
  const [error,setError]=React.useState("");
  const [message,setMessage]=React.useState("");
  const [formState,setFormState]=React.useState(0);
  
  const [open,setOpen]=React.useState(false);

  const {handleLogin,handleRegister}=React.useContext(AuthContext);
  let handleAuth=async()=>{
    try{if(formState===0){
        let result=await handleLogin(username,password);

    }
    if(formState===1){
       let result=await handleRegister(name,username,password);
       setUsername("");
       setMessage(result);
       setOpen(true);
       setError("");
       setFormState(0);
       setPassword("");
    }}
    catch(err){
    console.log("err");
    const msg = err?.response?.data?.message || "Something went wrong";
    setError(msg);
    }
  }

  return (
    <ThemeProvider theme={defaultTheme}>
    <Grid sx={{ height: '100vh' }}>
  <CssBaseline />
  <Grid
    size={{ xs: false, sm: 4, md: 7 }}
    sx={{
      backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
      backgroundRepeat: 'no-repeat',
      backgroundColor: (t) =>
        t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  />
  <Grid
    size={{ xs: 12, sm: 8, md: 5 }}
    component={Paper}
    elevation={6}
    square
  >
    <Box
  sx={{
  my: 8,               // vertical margin
  mx: 4,               // horizontal margin
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: 400,       // professional card width
  margin: 'auto',      // center horizontally
  px: 3,               // optional: inner horizontal padding
  py: 4,               // optional: inner vertical padding
}}
    >
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <div>
        <Button
          variant={formState === 0 ? "contained" : "text"}
          onClick={() => setFormState(0)}
        >
          Sign In
        </Button>
        <Button
          variant={formState === 1 ? "contained" : "text"}
          onClick={() => setFormState(1)}
        >
          Sign Up
        </Button>
      </div>
      <Box component="form" noValidate sx={{ mt: 1 }}>
        {formState === 1 && (
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            value={name}
            name="name"
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        )}

        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p style={{ color: "red" }}>{error}</p>
        <Button
          type="button"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={handleAuth}
        >
          {formState === 0 ? "Login In" : "Register"}
        </Button>
      </Box>
    </Box>
  </Grid>
</Grid>

           <Snackbar>
            open={open}
            autoHideDuration={4000}
            message={message}
           </Snackbar>
    </ThemeProvider>
  );
}