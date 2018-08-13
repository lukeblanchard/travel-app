function checkPlaceValues(){
    var city = document.getElementById("city_add").value; 
    var country = document.getElementById("country_add").value; 
    console.log(city); 
    console.log(country); 
    if(city == "" || country == ""){
        return false; 
    }
}
