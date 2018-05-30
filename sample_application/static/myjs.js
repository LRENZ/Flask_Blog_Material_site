$('.resizeme').each(function(){
    $(this).load(function(){
        var maxWidth = $(this).width(); // Max width for the image
        var maxHeight = $(this).height();   // Max height for the image
        $(this).css("width", "auto").css("height", "auto"); // Remove existing CSS
        $(this).removeAttr("width").removeAttr("height"); // Remove HTML attributes
        var width = $(this).width();    // Current image width
        var height = $(this).height();  // Current image height

        if(width > height) {
            // Check if the current width is larger than the max
            if(width > maxWidth){
                var ratio = maxWidth / width;   // get ratio for scaling image
                $(this).css("width", maxWidth); // Set new width
                $(this).css("height", height * ratio);  // Scale height based on ratio
                height = height * ratio;    // Reset height to match scaled image
            }
        } else {
            // Check if current height is larger than max
            if(height > maxHeight){
                var ratio = maxHeight / height; // get ratio for scaling image
                $(this).css("height", maxHeight);   // Set new height
                $(this).css("width", width * ratio);    // Scale width based on ratio
                width = width * ratio;  // Reset width to match scaled image
            }
        }
    });
});