function searchPlaces(e){
    e.preventDefault(); 
    var city = 'city=' + document.getElementById('city').value + '&'; 
    var country = 'country=' + document.getElementById('country').value + '&'; 
    window.location = '/places/search/database/?' + city + country; 
};
