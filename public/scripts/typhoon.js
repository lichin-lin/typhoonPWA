(function(){
	'use strict';

	var initialTyphoon = {
		type: '輕度颱風',
		name: '範例颱風',
		lat:  '25',
		lng:  '120',
		distance: 2000,
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
		console.log("[typhoon app] (1/2)updating..., hasRequestPending => " + app.hasRequestPending);
		app.updateTyphoon();
		app.saveTyphoonData();
		console.log("[typhoon app] (2/2)update finish, hasRequestPending => " + app.hasRequestPending);
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
	 	 $('.typhoonImg').empty();
		 $('#intro').empty();

		 // assume typhoon speed = 20km/hr
		 // [海上颱風警報] 應發布：
		 // 預測颱風之7級風暴風範圍可能侵襲臺灣或金門、馬祖100公里以內海域時之前24小時(20km/hr * 24hr)。
		 // [陸上颱風警報] 應發布：
		 // 預測颱風之7級風暴風範圍可能臺灣或金門、馬祖陸上之前18小時。
		 var seaWarnings = 100 + 100 + 24*20;
		 var landWarning = 100 + 18*20;
		 var typhoonImgSrc = "";

		 var currentdate = new Date();
		 var dayType = currentdate.getHours < 12? "PM" : "AM";
		 var dayHour = (currentdate.getHours() < 10? "0": "") + currentdate.getHours();
		 var dayMin  = (currentdate.getMinutes() < 10? "0": "") + currentdate.getMinutes();
		 var daySec  = (currentdate.getSeconds() < 10? "0": "") + currentdate.getSeconds();
		 var datetime =  dayHour + ":" + dayMin + ":" + daySec + " " + dayType;

		 if(data.distance > seaWarnings) {
		 	typhoonImgSrc = "small.png";
		 } else if (data.distance > landWarning) {
		 	typhoonImgSrc = "middle.png";
		 } else {
		 	typhoonImgSrc = "danger.png";
		 }

		 $('#intro').append(`<span>${data.type}-${data.name}</span>`);
		 $('#intro').append(`<span>E${data.lng}, N${data.lat}</span>`);
		 $('#intro').append(`<span class="tip">距離</span><span>${data.distance} km</span>`);
		 $('#intro').append(`<span>通常您不會離海岸超過100km</span>`);
		 $('#intro').append(`<span class="tip">最後更新</span><span>${datetime}</span>`);

		 $('.typhoonImg').append(`<img src="./images/${typhoonImgSrc}"/>`)
		 app.positionRecord = data
		 console.log("[typhoon app] append typhoon [" + app.positionRecord.name + "] finish: ");
	 }

    // Gets a forecast for a specific city and update the card with the data
    app.getTyphoonPosition = function() {
		var data;
		var url = 'https://quote-b781f.firebaseio.com/typhoon.json';
		if ('caches' in window) {
			console.log("[typhoon app] getting position from caches...");
			caches.match(url).then(function(response) {
				if (response) {
					response.json().then(function(json) {
						// Only update if the XHR is still pending, otherwise the XHR
						// has already returned and provided the latest data.
						if (app.hasRequestPending) {
							console.log('[typhoon app] data Updated From Cache');
							app.apppendData(json);
							return;
						}
					});
				}
			});
		}
		console.log("[typhoon app] getting position from api...");
		app.hasRequestPending = true;

	    var request = new XMLHttpRequest();
	    request.onreadystatechange = function() {
	      if (request.readyState === XMLHttpRequest.DONE) {
	        if (request.status === 200) {
	          var response = JSON.parse(request.response);
	          app.hasRequestPending = false;
	          console.log('[typhoon data Updated From Network');
			  // alert("[network update]");
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
		console.log("[typhoon app] show save record: ");//  + record);

		localStorage.record = record;
		console.log("[typhoon app] show local record: ");// + localStorage.record);
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
