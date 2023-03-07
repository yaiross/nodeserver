const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/game.js', (req, res) => {
  res.sendFile(__dirname + '/game.js');
});
app.get('/style.css', (req, res) => {
  res.sendFile(__dirname + '/style.css');
});


var playercounter=0;
var bankcardcount=104;
var turn=0;
var turndiraction=1;
var players={};
var allPlayersReady=false;
var currentplayzonecard={};
var punsihcard=0;

var bank={
  1:["green","blue","red","yellow","green","blue","red","yellow"],
  2:["green","blue","red","yellow","green","blue","red","yellow"],
  3:["green","blue","red","yellow","green","blue","red","yellow"],
  4:["green","blue","red","yellow","green","blue","red","yellow"],
  5:["green","blue","red","yellow","green","blue","red","yellow"],
  6:["green","blue","red","yellow","green","blue","red","yellow"],
  7:["green","blue","red","yellow","green","blue","red","yellow"],
  8:["green","blue","red","yellow","green","blue","red","yellow"],
  9:["green","blue","red","yellow","green","blue","red","yellow"],
  "+2":["green","blue","red","yellow","green","blue","red","yellow"],
  "stop":["green","blue","red","yellow","green","blue","red","yellow"],
  "change turn":["green","blue","red","yellow","green","blue","red","yellow"],
  "wild":[1,1,1,1],
  "wild +4":[1,1,1,1],

}


io.on('connection', (socket) => {
  console.log('user number '+playercounter +" is connected");
  console.log(socket.id)
  players[socket.id]=false;

  playercounter++;
  socket.emit("getplayercounter",playercounter)

  socket.on("ready",()=>{
    if(!players[socket.id]){
      players[socket.id]=true;
    }
    else{
      players[socket.id]=false;
    }
    
    console.log("ready "+socket.id)
    for (let index = 0; index < Object.values(players).length; index++) {
      if(!Object.values(players)[index]){
        allPlayersReady=false;
        
        break
      }
      allPlayersReady=true;
    }
    console.log(players)
    console.log(allPlayersReady)
    if (allPlayersReady==true){
      let keylist = Object.keys(bank);
      let indexofkey;
      do {
        indexofkey = Math.floor(Math.random() * keylist.length);
      } while (bank[keylist[indexofkey]].length === 0 && bankcardcount !== 0);
    
      const indexofcard = Math.floor(Math.random() * bank[keylist[indexofkey]].length)
      const value = getcardfrombank(keylist[indexofkey], indexofcard);
      currentplayzonecard[keylist[indexofkey]]=value;
      io.emit("allPlayersReady",value,keylist[indexofkey])
      console.log("start")
    }
    

  })
  socket.on("playerhascard",(flag)=>{
    if(!flag){
      
      socket.emit("punishment",punsihcard)
      punsihcard=0;
      turn=Math.abs(turn+turndiraction);
    }
   


  })
  socket.on("chosencard",(chosencard)=>{
    
    var [chosenValue, chosenkey] = chosencard.split("-");
    var flag=false;
    for (let key in currentplayzonecard) {
      if(chosenkey=="change turn" && chosenValue==currentplayzonecard[key]){
        turndiraction= turndiraction - (turndiraction*2);
        delete currentplayzonecard[key];
          flag=true;
          break;

      }
      if(chosenkey=="stop" && chosenValue==currentplayzonecard[key]){
        turn=Math.abs(turn+turndiraction);
        delete currentplayzonecard[key];
          flag=true;
          break;

      }
      if(chosenkey=="+2" && key=="+2"){
        
          punsihcard=punsihcard+2;
          delete currentplayzonecard[key];
          flag=true;
          break;
        
      }
      
      if(chosenkey=="wild +4"  ){
          punsihcard=punsihcard+4;
          delete currentplayzonecard[key];
          flag=true;
          break;
        
        
      }
      if(chosenkey=="wild" ){
        delete currentplayzonecard[key];
        flag=true;
        break;
      }
      if(chosenkey==key|| chosenValue==currentplayzonecard[key]){
        delete currentplayzonecard[key];
        flag=true;
        break;
        
      }
      
    }
    if(flag){
      currentplayzonecard[chosenkey]=chosenValue
      io.emit("newplayzonecard",currentplayzonecard[chosenkey],chosenkey);
      socket.emit("deletecard",flag)
      turn=Math.abs(turn+turndiraction);
      
    }
    
    
    

  })


  socket.on("checkturn",(callback)=>{
      flag=false
      playerslist=Object.keys(players)
      if(socket.id==playerslist[turn% playerslist.length]){
        flag=true
        callback(flag) 
      }
      callback(flag) 

    });
  
    // Emit a random card value for each of the three requested cards
    socket.on("getCard", (callback) => {
      let keylist = Object.keys(bank);
      let indexofkey;
      do {
        indexofkey = Math.floor(Math.random() * keylist.length);
      } while (bank[keylist[indexofkey]].length === 0 && bankcardcount !== 0);
    
      const indexofcard = Math.floor(Math.random() * bank[keylist[indexofkey]].length)
      const value = getcardfrombank(keylist[indexofkey], indexofcard);
      callback(value,keylist[indexofkey]);
    });

  



  socket.on('disconnect', () => {
    console.log('user disconnected '+socket.id);
    playercounter--;
    delete players[socket.id];
  });
 
  allPlayersReady==false;

});



function getcardfrombank(key, number) {
  if (bankcardcount==0) {
    return "empty";
  }
  const value = bank[key][number];
  bank[key].splice(number, 1);
  bankcardcount--;
  return value;
}




server.listen(3000, () => {
  console.log('listening on *:3000');
});