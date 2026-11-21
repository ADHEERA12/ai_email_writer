
import { useState } from 'react'
import './App.css'


import { 
  Box, 
  Container, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  TextField, 
  Typography, 
  Select, 
  Button,
  CircularProgress,
 
} from '@mui/material';
import axios from 'axios';


function App() {
  const[emaili,setemaili] =useState('');
  const[tone,settone] =useState('');
  const[generatedemail,setgeneratedemail] =useState('');
  const[loading,setloading]=useState(false);
  const[error,setError]=useState('');
  
//handles te api call
  const handleSubmit =async()=>{
    setloading(true);
    setError('');
    try{
         const response=await axios.post("http://localhost:8080/api/email/generate",{emaili,tone});
         setgeneratedemail(typeof response.data==='string'? response.data:JSON.stringify(response.data));
    }
    catch(error)
    {
      setError('SOME TECHNICAL ERROR ARISED ,SOO PLEASE TRY AGAIN');
      console.error(error);

    }finally{
      setloading(false);

    }
    
    
  };
  return (
    <Container maxWidth="md" sx={{py:4}}>
      <Typography variant='h3' component="h1" gutterBottom>
        EMAIL REPLY AI</Typography>
      <Box sx={{mx:3}}><TextField fullWidth multiline rows={6}
       variant='outlined' 
       label="Original email content" 
       value={emaili ||''}
       onChange={(e)=>setemaili(e.target.value)}
       sx={{mb:2}}
      />
      <FormControl fullWidth sx={{mb:2}}>
        <InputLabel>Tone (Optional)</InputLabel>
        <Select
          value={tone || ''}
          label={"Tone (Optional)"}
          onChange={(e)=>settone(e.target.value)}>
          <MenuItem value="">None</MenuItem>
          <MenuItem value="professional">Professional</MenuItem>
          <MenuItem value="casual">Casual</MenuItem>
          <MenuItem value="Friendly ">Friendly</MenuItem>
          <MenuItem value="Order">Order</MenuItem>
                    
        </Select>
      </FormControl>
      <Button
         variant='contained'
         onClick={handleSubmit}
         disabled={!emaili ||loading}
         fullWidth>
          {loading ? <CircularProgress size={24}/>:"START GENERATING THE REPLY"}
          

      </Button>

      </Box>
      {
        error &&( <Typography color='error' sx={{mb:2}}>
           {error}
       </Typography>)
      }
      {generatedemail &&(
        <Box sx={{mt:3}}>
          <Typography variant='h6' gutterBottom>Generated Reply:</Typography>
          <TextField fullWidth
          multiline
          rows={6}
          variant='outlined'
          value={generatedemail || ''}
          inputProps={{readOnly:true}}
          />
          <Button
            variant='outlined'
            sx={{mt:2}}
            onClick={()=>navigator.clipboard.writeText(generatedemail)}>
            Copy to ClipBoard
          </Button>
        </Box>
      )}
    </Container>
    
  
    
  )
}

export default App
