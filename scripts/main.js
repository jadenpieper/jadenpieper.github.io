// TODO: Make this something meaningful	
let redirect_uri = 'https://www.jadenpieper.com'
let perms = 'basic_access,email'

DZ.getLoginStatus(function(response) {
	if (response.authResponse) {
		// logged in and connected user, someone you know
		console.log('Logged in...')
		console.log(response)
	} else {
		// no user session available, someone you dont know
		console.log('Not logged in...')
		console.log(response)
	}
});

function loginFunction(){
	console.log('Buton clicked');
	// DZ.login(function(response) {
// 		if(response.authResponse) {
// 			console.log('Welcome! Fetching your information...');
// 			DZ.api('/user/me', function(response) {
// 				console.log('Good to see you, ' + response.name + '.');
// 			});
// 		} else {
// 			console.log('User cancelled login or did not fully authorize.');
// 		}
// 	}, {perms: 'basic_access,email'});
};
function loginFunction(){
	console.log('LoginFunction happened');

	// Then, request the user to log in
	login_url= `https://connect.deezer.com/oauth/auth.php?app_id=${app_id}&redirect_uri=${redirect_uri}&perms=${perms}`;
	window.open(login_url)
	// DZ.login(function(response) {
	// 	console.log(response);
	// 	if (response.authResponse) {
	// 		console.log('Welcome!  Fetching your information.... ');
	// 		DZ.api('/user/me', function(response) {
	// 			console.log('Good to see you, ' + response.name + '.');
	// 		});
	// 	} else {
	// 		console.log('User cancelled login or did not fully authorize.');
	// 	}
	// }, {perms: 'basic_access,email'});
	console.log('After login');
	
};

// Create album item for list
function createAlbumItem(name){
	let li = document.createElement('li');
	li.textContent = name;
	return li;
}

function createTextSection(name, type){
	let h2 = document.createElement(type);
	h2.textContent = name;
	return h2;
}

album_section = document.querySelector('#album-section')

// Set user number
// TODO: Do this via a signed in user if they do that...
let user_num = 4565334962

// Display the user name
let user_api_call = `/user/${user_num}`
DZ.api('/user/4565334962', function(response){
	user_name = response['name'];
	user_name = document.querySelector('#username');
	user_name.textContent = response['name'];
	// console.log("Name of user id 4565334962", response);
});
// Set maximum number of albums to query
// TODO: Make this a variable? Or increase if the number of albums in the query equals this
console.log(window.location.href);
let album_limit = 1000

// Define the api call for getting the library in albums
let api_call = `/user/${user_num}/albums&limit=${album_limit}`
// console.log(api_call)

DZ.api(api_call, function(response){
	let total_albums = `Number of albums in library: ${response.total}`;
	library_info = document.querySelector('#library_info');
	library_info.textContent = total_albums;
	const album_list = document.querySelector('#albums');
	for (let ix =0; ix < 5; ix++) {
		album_ix = Math.floor(Math.random() * response.total)
		album = response.data[album_ix]
		album_result = `${album['artist']['name']} - ${album['title']}`
		album_list.appendChild(createAlbumItem(album_result))
	}

});


// console.log('Before login');
// DZ.getLoginStatus(function(response) {
// 	console.log(response);
// 	if (response.authResponse) {
// 		// logged in and connected user, someone you know
// 		console.log('Someone is logged in')
// 	} else {
// 		console.log('No one is logged in')
// 		// no user session available, someone you dont know
// 	}
// });
// console.log('After login');


// // Then, request the user to log in
// DZ.login(function(response) {
// 	if (response.authResponse) {
// 		console.log('Welcome!  Fetching your information.... ');
// 		DZ.api('/user/me', function(response) {
// 			console.log('Good to see you, ' + response.name + '.');
// 		});
// 	} else {
// 		console.log('User cancelled login or did not fully authorize.');
// 	}
// }, {perms: 'basic_access,email'});