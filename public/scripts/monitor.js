$.extend({
	connectionWorker: function(worker, type){
		var connectType;
		if(type === "offline") {
		    $('.connection').text("sorry, you are now offline...");
		    $('.loader').attr('hidden', true);
			$("#butRefresh").attr("disabled", true).css("cursor", "not-allowed");
		    $('.connection').addClass('offline');
		    $('.connection').addClass('active');
		    connectType = "offline";

		} else {
		    $('.connection').text("you are now online!");
		    $("#butRefresh").attr("disabled", false).css("cursor", "pointer");
		    $('.connection').removeClass('offline');
		    $('.connection').addClass('active');
		    connectType = "online";

		    setTimeout(function () { 
		    	$('.connection').removeClass('active');
			}, 3000);

		}

		if(worker === "typhoon") {
			console.log("[typhoon app] You are " + connectType);
		} else {
			console.log("[ServiceWorker] You are " + connectType);
		}
	}
});

window.addEventListener('online', function(e) {
    // re-sync data with server
	$.connectionWorker("typhoon", "online");

}, false);

window.addEventListener('offline', function(e) {
    // queue up events for server
    $.connectionWorker("typhoon", "offline");

}, false);

// check if the user is connected
if (navigator.onLine) {
    // Arrivals.loadData();
	$.connectionWorker("ServiceWorker", "online");

} else {
    // show offline message
	$.connectionWorker("ServiceWorker", "offline");
}
