function reviewGuide(e, id){
    e.preventDefault(); 
    console.log("test update function"); 
    $.ajax({
        url: '/guides/' + id, 
        type: 'POST', 
        data: $('#review-guide').serialize(), 
    })
};
