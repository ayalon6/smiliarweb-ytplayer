import React from 'react';
import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import API from "./utils/API";

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import YouTube from 'react-youtube';

const useStyles = makeStyles(theme => ({
  root: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    color: 'white',
    padding: '0 30px',
    overflow: 'hidden',
    height: '100vh'
  },
  playlist: {
    height: 380,
    width: 200,
  },
  player: {
    height: 380,
    width: 600,
  },
  container: {
    padding: 5
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  ListItemText: {
    fonSize: '10px important'
  }

}));

function generate(list, classes, deleteCallBack) {
  console.log('list', list);
  return list.map(value =>
    React.cloneElement(<ListItem>
      <ListItemText
        className={classes.ListItemText}
        primary={value.title}
        secondary={'duration :' + value.duration + ' sec'}
      />
      <ListItemSecondaryAction>
        {deleteCallBack ? <IconButton edge="end" aria-label="delete">
          <DeleteIcon onClick={() => deleteCallBack(value.id)} />
        </IconButton> : ''}
      </ListItemSecondaryAction>
    </ListItem>, {
      key: value.id,
    }),
  );
}

function Playlist(props) {


  const classes = useStyles();

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      API.post('/playlist', { url: props.url }).then((res) => {
        props.callbacks.setHelp('Enter youtube url');
        props.callbacks.setUrl('');
        props.callbacks.setList(res.data);

      })
        .catch((err) => {
          props.callbacks.setHelp('invalid url')
        });
    }
  }

  const handleChange = (event) => {
    const newUrl = event.target.value;
    props.callbacks.setUrl(newUrl);
  }


  return props.list ? (
    <Grid className={classes['container']}>
      <Grid>
        <TextField
          required
          id="outlined-required"
          className={classes.textField}
          helperText={props.help}
          margin="dense"
          variant="outlined"
          value={props.url}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
      </Grid>
      <Grid>
        <List dense={true} style={{ height: 250, overflow: 'auto' }} >
          {generate(props.list, classes, props.callbacks.deleteListItemById)}
        </List>
      </Grid>
    </Grid>
  ) : (
      <div>Loading...</div>
    );
}

function Player(props) {
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1
    }
  }
  const _onReady = (event) => {
    event.target.playVideo();
  }

  const _onEnd = (event) => {
    props.callbacks.deleteListItemById(props.list[0]['id'])
  }

  return (
    props.list[0] ?
      <div>
        <YouTube
          videoId={props.list[0]['id']}
          opts={opts}
          onReady={_onReady}
          onEnd={_onEnd}
        />
      </div> :
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
      >
        <Grid style={{ padding: 170 }}>
          Welcome to youtube easy list player
      </Grid>
      </Grid>
  )
}



function App() {
  React.useEffect(() => {
    API.get('/playlist').then((res) => {
      setList(res.data);
    })
  }, [])
  const [url, setUrl] = React.useState('');
  const [help, setHelp] = React.useState('Enter youtube url');
  const [list, setList] = React.useState([]);

  const [spacing] = React.useState(2);
  const classes = useStyles();
  const components = [
    { component: Playlist, style: 'playlist' },
    { component: Player, style: 'player' }
  ]

  const deleteListItemById = (id) => {
    API.delete('/playlist/' + id)
      .then((res) => {
        setList(res.data);
      })
  }

  return (
    <div className="App">
      <Grid container className={classes.root} spacing={2}>
        <h1>Ayalon's awesome youtube player</h1>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={spacing} >
            {components.map(Value => (
              <Grid key={Value.style} item>
                <Paper className={classes[Value.style]} >
                  <Value.component list={list} url={url} help={help} callbacks={
                    {
                      'setUrl': setUrl,
                      'setHelp': setHelp,
                      'setList': setList,
                      'deleteListItemById': deleteListItemById
                    }
                  } />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
