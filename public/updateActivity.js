function updateActivity(id){
    console.log("test update function"); 
    $.ajax({
        url: '/activities/' + id, 
        type: 'PUT', 
        data: $('#update-activity').serialize(), 
        success: function(result){
            window.location.replace("./"); 
        }
    })
};
