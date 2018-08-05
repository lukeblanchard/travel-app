function searchGuides(e){
    e.preventDefault(); 
    var fname = 'fname=' + document.getElementById('fname').value + '&'; 
    var lname = 'lname=' + document.getElementById('lname').value + '&'; 
    var place = 'place=' + document.getElementById('places_search').value; 
    window.location = '/guides/search/database/?' + fname + lname + place; 
};
