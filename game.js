var socket = io();

var playernumber=document.getElementById("playernumber");
var btngetcard=document.getElementById("btngetcard")
var ready=document.getElementById("ready")
var playzonecard= document.getElementsByClassName("playzonecard")
var playcard=document.getElementsByClassName("card")
const cardContainer = document.getElementById("card-container");



socket.once("getplayercounter",(number)=>{
  playernumber.innerHTML="player counter"+number;
});


cardContainer.addEventListener("click", function(event) {
  socket.emit("checkturn",(turnflag)=>{
    if(turnflag == true){
      let hascardflag=false;
  let [zonenValue, zonekey] = playzonecard.item(0).id.split("-");
    
  if (event.target.classList.contains("card")) {
    for(let i=0 ; i<playcard.length;i++){
      var [chosenValue, chosenkey] = playcard.item(i).id.split("-");
      if(chosenValue==zonenValue || chosenkey == zonekey){
        hascardflag=true;
        break;
      } 
    }
    
    socket.emit("playerhascard",(hascardflag))
    if(hascardflag){
      socket.emit("chosencard",event.target.id)
      socket.on("deletecard",(flag)=>{
        if(flag && playzonecard[0].id == event.target.id){
          console.log("remove"+event.target.id )
          event.target.remove();
          
        }
      
      })
    }

    
    console.log(event.target.id);
  }

    }
    else{
      const card = document.createElement("div");
      card.textContent = "not your turn";
      document.body.appendChild(card);


    }
  })
  
  
});





socket.on("newplayzonecard",(value,key)=>{
  for(let currentplayzonecard of playzonecard){
    currentplayzonecard.setAttribute('id', value+'-'+key);
    currentplayzonecard.textContent = key+" "+value;
  }


})


ready.addEventListener('click',()=>{
  socket.emit("ready",()=>{
    
    ready.innerHTML="unready"


  })


})

socket.on("allPlayersReady",(value,key)=>{
  for (let i = 0; i < 8; i++) {
    getcardtoplayer();
  }
  
  
  
  for(let currentplayzonecard of playzonecard){
    currentplayzonecard.setAttribute('id', value+'-'+key);
    currentplayzonecard.textContent = key+" "+value;
  }






})

socket.on("punishment",(punishcounter)=>{
  if(punishcounter==0){
    getcardtoplayer();
  }
  else{
    for(let i=0 ; i<punishcounter;i++){
      getcardtoplayer();
    }
  }
  
})

btngetcard.addEventListener('click',()=>{
  
  socket.emit("checkturn",(flag)=>{
    if(flag == true){
      socket.emit("playerhascard",(false))

    }
    else{
      const card = document.createElement("div");
      card.textContent = "not your turn";
      document.body.appendChild(card);


    }
  })

})


function getcardtoplayer(){
  socket.emit("getCard", (value,key) => {
    // The server will respond with a value for the card
    if (value != "empty") {
      // Create a new <div> element for the card and add it to the HTML
      const card = document.createElement("button");
      card.classList.add('card');
      card.setAttribute('id', value+'-'+key);
      card.textContent = key+" "+value;
      cardContainer.appendChild(card);
    }
  });
}

