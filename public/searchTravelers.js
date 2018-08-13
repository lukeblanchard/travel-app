function searchTravelers(e){
    e.preventDefault(); 
    var fname = 'fname=' + document.getElementById('fname').value + '&'; 
    var lname = 'lname=' + document.getElementById('lname').value + '&'; 
    var username = 'username=' + document.getElementById('username').value + '&'; 
    window.location = '/travelers/search/database/?' + fname + lname + username; 
};

function browseTravelers(e){
    e.preventDefault(); 
    window.location = '/travelers/search/database/'; 
};
