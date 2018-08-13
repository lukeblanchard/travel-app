function searchActivities(e){
    e.preventDefault(); 
    var place = 'place=' + document.getElementById('places_search').value + '&'; 
    var price = 'price=' + document.getElementById('price').value + '&'; 
    var category = 'category=' + document.getElementById('category').value; 
    console.log(category);
    window.location = '/activities/search/database/?' + place + price + category; 
};

function browseActivities(e){
    e.preventDefault(); 
    window.location = '/activities/search/database/'; 
};
