
import './App.css';
import axios from 'axios';
import { Card, 
         CardBody, 
         CardTitle, 
         CardSubtitle,
         FormGroup,
         Label,
         Input,
         FormText,
         Button } from 'reactstrap';
import { useEffect, useState } from 'react';
import ClipLoader from "react-spinners/ClipLoader";
import 'bootstrap/dist/css/bootstrap.css';





function App() 
{

  // set states
  let [state, setState] = useState({loading: false, display: [], downloadable: false, objFile: false, selectedFile: ''})

  //submit function
  function submitCsv ()
  {
    // create from data
    let formData = new FormData();
    // select the file
    let csvFile = document.querySelector('#csvFile');
    // attach the file to the payload
    formData.append("csv", csvFile.files[0]);
    // set loading to true
    setState({...state, loading: true})

    // make the call with the attached payload
    axios.post('https://zyi6murfv7.execute-api.ca-central-1.amazonaws.com/dev/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
    })
    .then(response  => {
   
      // setback loading to false
      setState({...state, loading: false, display: response.data.resultSet, downloadable: true, objFile: response.data.objLink})
    })
    .catch(err =>{
      console.log('error on request: ', err)
      // catch error and display message
      setState({...state, loading: false, display: ['Please attach a CSV File'], downloadable: false, objFile: false})
    })
  }




  function downloadJSON ()
  {
    if(state.display.length > 0 && state.downloadable)
    {
      // create a link tag
      const element = document.createElement("a");
      // format the data to string
      const str_display = JSON.stringify(state.display)
      // create a blob using the string
      const file = new Blob([str_display], {type: 'application/json'});
      // create the object URL from the BLOB file
      element.href = URL.createObjectURL(file);
      // Set the File name for download
      element.download =  "newFile.json";
      // append the element in the body
      document.body.appendChild(element); 
      // launch a click event
      element.click();
    }
    else
    {
      // handle error if no data available
      setState({...state, display: ['Nothing to download.'], objFile: false})
    }
  
  }


  // handle file change - control the file input
  function onFileChange (event)
  {
    console.log('event file change')
    setState({...state, selectedFile: event.target.value})
  }


  
  // clears the display state at the beginning on load
  /**
   * adding an empty array on the second parameter ensures this portion runs at least once
   */
  useEffect(()=> { 
    setState({...state, display: [], downloadable: false, selectedFile: ''})
    console.log('current state: ', state)
  }, [])
  


  return (
    <div className="App" style={{padding: '25px', minHeight: '65vh', display: 'flex', flexFlow: 'row wrap', justifyContent:'center', alignContent: 'space-around'}}>
      <div style={{width: '350px', height: '150px', margin: '30px'}}>
        <Card> 
          <CardBody>
            <CardTitle tag="h5">
              Upload File
            </CardTitle>
            <CardSubtitle
              className="mb-2 text-muted"
              tag="h6"
            >
              Upload using Multer and inMemory storage
            </CardSubtitle>
            <FormGroup>
              <Label for="csvFile" hidden>
                File
              </Label>
              <Input
                id="csvFile"
                name="file"
                type="file"
                onChange={onFileChange}
                value={state.selectedFile}
              />
              <FormText>
                Select CSV File.
              </FormText>
            </FormGroup>
            <Button onClick={submitCsv}>
              Submit
            </Button>
            {
              // if the filename of the uploaded file is present, create a link to it to s3
              state.objFile != false ?
              <div>
              <br/>
              <a href={'https://upload-csv-app.s3.ca-central-1.amazonaws.com/'+state.objFile}>Uploaded file in s3</a>
              </div> :
              ''
            }
          </CardBody>
        </Card>
      </div>

      <div style={{width: '350px', height: '150px', margin: '30px'}}>
        <Card> 
          <CardBody>
            <CardTitle tag="h5">
              Display Result
            </CardTitle>
            <Button onClick={downloadJSON}>
              Download as JSON
            </Button>
            <div style={{width: '100%', height: '400px', overflow:'scroll', paddingBottom: '15px'}}>
            {
              // if display state has items inside, display it, otherwise display the loader
              state.display.length > 0 ?
              state.display.map((dta, index) => <p key={index}>{JSON.stringify(dta)}</p>) :
              <ClipLoader loading={state.loading} size={100} />
            }
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default App;
