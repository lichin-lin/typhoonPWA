(function(){
	'use strict';

	var initialTyphoon = {
		type: '輕度颱風',
		name: '範例颱風',
		lat:  '25',
		lng:  '120',
	};

	var app = {
	    isLoading: true,
	    hasRequestPending: false,
		positionRecord: {},
	    spinner: document.querySelector('.loader'),
	    typhoon: document.querySelector('.typhoon'),
	    container: document.querySelector('.main'),
	}

	/*****************************************************************************
	*
	* Event listeners for UI elements
	*
	****************************************************************************/

	document.getElementById('butRefresh').addEventListener('click', function() {
		// Refresh
		app.updateTyphoon();
		app.saveTyphoonData();
		console.log("[typhoon app] updating..., hasRequestPending=>" + app.hasRequestPending);
	});


	/*****************************************************************************
	*
	* Methods to update/refresh the UI
	*
	****************************************************************************/

	// Updates a weather card with the latest weather forecast. If the card
	// doesn't already exist, it's cloned from the template.
	app.updateTyphoon = function() {
		app.getTyphoonPosition();
		if (app.isLoading) {
			app.spinner.setAttribute('hidden', true);
			app.container.removeAttribute('hidden');
			app.isLoading = false;
		}
	};


	/*****************************************************************************
     *
     * Methods for dealing with the model
     *
     ****************************************************************************/

	 app.apppendData = function(data) {
		 $('#intro').empty();
		 var currentdate = new Date();
		 var datetime = "最後更新: " + currentdate.getDate() + "/"
		                 + (currentdate.getMonth()+1)  + "/"
		                 + currentdate.getFullYear() + " @ "
		                 + currentdate.getHours() + ":"
		                 + currentdate.getMinutes() + ":"
		                 + currentdate.getSeconds();
		 $('#intro').append(`<span>${data.type}</span>`);
		 $('#intro').append(`<span>${data.name}</span>`);
		 $('#intro').append(`<span>${data.lat}</span>`);
		 $('#intro').append(`<span>${data.lng}</span>`);
		 $('#intro').append(`<span>${datetime}</span>`);
		 app.positionRecord = data
		 console.log("[typhoon app] after append:" + app.positionRecord.name);
	 }

    // Gets a forecast for a specific city and update the card with the data
    app.getTyphoonPosition = function() {
		var data;
		var url = 'https://quote-b781f.firebaseio.com/typhoon.json';
		if ('caches' in window) {
			console.log("[typhoon app] get position from caches");
			caches.match(url).then(function(response) {
				if (response) {
					response.json().then(function(json) {
						// Only update if the XHR is still pending, otherwise the XHR
						// has already returned and provided the latest data.
						if (app.hasRequestPending) {
							console.log('[typhoon app] typhoon Updated From Cache');
							app.apppendData(json);
							return;
						}
					});
				}
			});
		}
		console.log("[typhoon app] get position from api");
		app.hasRequestPending = true;
		//  	var res;
		// $.get(url, function(res){
		//   	data = res;
		// })
		// .done(function() {
		//   	console.log('[typhoon app] typhoon Updated From network');
		//   	app.apppendData(data);
		// })
		// .fail(function() {
		//   	console.log(`fail! ${data}`);
		// })
		// Make the XHR to get the data, then update the card
	    var request = new XMLHttpRequest();
	    request.onreadystatechange = function() {
	      if (request.readyState === XMLHttpRequest.DONE) {
	        if (request.status === 200) {
	          var response = JSON.parse(request.response);
			  console.log(response + ", try to find name: " + response.name);
	        //   response.name = 'name';
	          app.hasRequestPending = false;
	          console.log('[App] Forecast Updated From Network');
	          app.apppendData(response);
	        }
	      }
	    };
	    request.open('GET', url);
	    request.send();
	}

    // Save list to localStorage, see note below about localStorage.
    app.saveTyphoonData = function() {
		var record = JSON.stringify(app.positionRecord);
		console.log("[typhoon app] show save record: "  + record);

		localStorage.record = record;
		console.log("[typhoon app] show local record: " + localStorage.record);
    };

	/*****************************************************************************
     *
     * Code required to start the app
     *
     * NOTE: To simplify this getting started guide, we've used localStorage.
     *   localStorage is a syncronous API and has serious performance
     *   implications. It should not be used in production applications!
     *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
     *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
     *
     ****************************************************************************/

    app.positionRecord = localStorage.record;
	// if record exist!
    if (app.positionRecord) {
		console.log("[typhoon app] fetch from exist data.");
		app.positionRecord = JSON.parse(app.positionRecord);
		app.updateTyphoon();
		app.saveTyphoonData();
    } else {
		console.log("[typhoon app] fetch first time data.");
		app.apppendData(initialTyphoon);
		app.positionRecord = initialTyphoon
		app.saveTyphoonData();
    }
})()
