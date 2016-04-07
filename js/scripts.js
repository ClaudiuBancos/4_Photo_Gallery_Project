/******************************************************
OVERLAY PREP WORK AND FUNCTIONS
*******************************************************/

// ===========Overlay Prep Work===========

// These are basic elements the lightbox overlay uses.
var $overlay = $('<div id="overlay"></div>');
var $container_div = $("<div class='display-image'></div>");
var $image = $("<img>");
var $video = $("<iframe frameborder='0' allowfullscreen></iframe>");
var $caption = $("<p></p>");
var $back_button = $("<img class='button back_button' src='" + icons_path + "arrow_left.png'></img>");
var $forward_button = $("<img class='button forward_button' src='" + icons_path + "arrow_right.png'></img>");

// This variable stores the last gallery image clicked on
// by the user or selected with the buttons or arrow keys.
var current_image = false;

//This code puts the overlay together, attaching all its parts.
$overlay.append($container_div);
$container_div.append($image);
$container_div.append($video);
$overlay.append($caption);
$overlay.append($back_button);
$overlay.append($forward_button);


// And this attaches the completed overlay to the body of the page.
$("body").append($overlay);

// This next block of code attaches a click handler to all parts of the
// overlay except the image/video and the buttons. That is, when the user
// clicks in the "background" of the overlay, the overlay disappears.
// Also, the video stops playing. That's a nice bug fix.

$overlay.click(function(event){
	target = $(event.target);
	if (target.is(".button") || target.is(".display-image img") || target.is(".display-image iframe")) {
	} else {
		$overlay.hide();
		$video.detach();
	}
});


// ===========Overlay Function===========
// This function preps the overlay for display by attaching a click event to
// every link item in the gallery. It is called when the page first loads and
// then every time the search bar reloads the gallery. Probably wouldn't have
// to be called so often if I'd attached a click handler to the gallery instead
// of to each of the links within the gallery. Oh well.

function bootOverlay() {
	$("#gallery a").click(function(event) {
		// Prevent the default click behavior (which is maintained for users without JavaScript)
		event.preventDefault();

		// Record the clicked image.
		current_image = $(this);

		// Adjust caption based on clicked image.
		var captionText = $(this).children("img").attr("alt");
		$caption.text(captionText);

		// This function loads the image or video into the overlay. (See below.)
		loadAsset();

		// Show the completely adjusted overlay.
		$overlay.show();

	});
}

// ===========Button and Arrow Key Functions===========

// Function to load selected image or video into the overlay.
function loadAsset() {
	// If photo, detach video, else if video, detach photo.
	// Then attach and load correct photo/video based on selected link.
	if (current_image.attr("class") === "photo") {
		$video.detach();
		$container_div.prepend($image);
		$image.attr("src", current_image.attr("href"));

	} else if (current_image.attr("class") === "youtube") {
		$image.detach();
		$container_div.append($video);
		$video.attr("src", current_image.attr("id"));
	}

	// Then adjust caption based on selected link.
	var newCaptionText = current_image.children("img").attr("alt");
	$caption.text(newCaptionText);
}



// Function to display the previous photo or video in the overlay.
function loadPrevAsset() {
	if (current_image.prev().length === 0) {
		return;
	} else {
		current_image = current_image.prev();
	}

	loadAsset();
}



// Function to display the next photo or video in the overlay
function loadNextAsset() {
	if (current_image.next().length === 0) {
		return;
	} else {
		current_image = current_image.next();
	}
	
	loadAsset();
}



// This function attaches click handlers to the buttons
// inside the overlay. When clicked, those buttons display
// the previous/next photo or video in the current gallery.
function bootButtons() {
	$(".back_button").click(function() {
		loadPrevAsset();
	});

	$(".forward_button").click(function() {
		loadNextAsset();
	});
}



// This function attaches handlers to the left and right arrow keys.
// When clicked while in the overlay, the arrow keys display the
// previous(left) or next(right) photo or video in the current gallery.
function bootArrowKeys() {
	$(document).keydown(function(event) {
		if (event.which === 37) {
			loadPrevAsset();
		} else if (event.which === 39) {
			loadNextAsset();
		}
	});
}


/******************************************************
SEARCH BAR FUNCTIONS
*******************************************************/

// The first function here should be self-explanatory.
function showAllAssets() {
	for (var i=0; i <= 15; i++) {
		$("#gallery").append(
			"<a class='" + Assets[i].type +
			"' id= '" + Assets[i].embed +
			"'href='" + Assets[i].href +
		 	"'><img src='" + Assets[i].src + 
		 	"' alt='" + Assets[i].alt + "'></a>"
		 );
	}
}

function refillGallery() {
	// Store the value of the search bar into a variable
	// without any regard for capitalization.
	var searchBarValue = $("input").val().toLowerCase();

	// If the search bar is empty, just load the full gallery again.
	if (searchBarValue === "") {
		showAllAssets();
	} else {
		
		// Run through every asset, pulling its alt text (again without any
		// regard for capitalization) to check against the search bar value.
		for (var item of Assets) {
			var alt_text = item.alt;
			alt_text = alt_text.toLowerCase();

			// If a match is found, append a thumbnail-link of the
			// matched asset to the gallery.
			// NOTE: This means that whenever there are multiple matches,
			// they will be displayed in the order of the "Assets" array
			// found in assets.js.
			if (alt_text.search(searchBarValue) >= 0) {
				$("<a class='" + item.type +
					"' id= '" + item.embed +
					"' href='" + item.href + 
		 			"'><img src='" + item.src + 
		 			"' alt='" + item.alt + "'></a>"
		 		).appendTo("#gallery").hide().fadeIn(8000);
			}
		}
	}

	// Because the gallery links were removed and reattached,
	// it's necessary to reattach handlers here. Room for improvement.
	bootOverlay();
}

// This function reloads the gallery based on what is typed into the search bar.
function reloadGallery() {
	$("#gallery a").stop().fadeOut(2000).promise().done(refillGallery());
}


/******************************************************
WHAT HAPPENS AT INITIAL PAGE LOAD
*******************************************************/

//Clear the non-Javascript gallery.
$("#gallery").empty();
//Start with a full gallery.
showAllAssets();
//Attach click handler so the lightbox overlay is ready to go.
bootOverlay();
//Attach handlers to the overlay buttons and the arrow keys.
bootButtons();
bootArrowKeys();
//Attach keyup handler to the search bar.
$("input").keyup(reloadGallery);
