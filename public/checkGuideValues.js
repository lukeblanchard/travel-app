function checkGuideValues(){
    console.log("Testing Check Guides"); 
    var lname = document.getElementById("lname_add").value; 
    var place = document.getElementById("places_add").value; 
    var email = document.getElementById("email_add").value; 
    console.log(lname); 
    console.log(place); 
    console.log(email); 
    if(lname == "" || place == "" || email == ""){
        return false; 
    }
}
