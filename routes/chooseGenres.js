genres= [];

function click(genre){
    if(!music.indexOf(genre)){
        music.push(genre);
    }
    else{
        delete music[genre]
    }
}