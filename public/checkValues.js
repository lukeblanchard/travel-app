function checkValues(){
    var guide = document.getElementById("guides_add").value; 
    var title = document.getElementById("title").value; 
    console.log(title); 
    console.log(guide); 
    if(guide == "" || title == ""){
        return false; 
    }
}
