// TODO: Make this something meaningful	
var redirect_uri = 'https://www.jadenpieper.com'
var perms = 'manage_library,delete_library'
var access_token = ''

var user_num = ''
var default_user_num = 4565334962
var default_user_name = 'bongobonzo_no_login'
var logged_in = null

var ptitle = 'AlbumShuffle'

current_url = new URL(window.location.href)

// Set user number
if(current_url.hash){
	// Have a hash => probably have an access token
	hash_parts = current_url.hash.split('&')
	for (let i=0; i<hash_parts.length; i++){
		access_loc = hash_parts[i].search('access_token')
		if (access_loc > -1) {
			access_token = hash_parts[i].slice(access_loc,hash_parts[i].length)
			console.log(access_token)
			logged_in = true;
			break;
		}
	}
}
if(logged_in){
	console.log('Logged in');
	logged_in = true
	api_user_call = '/user/me&' + access_token
	console.log('API Call...')
	console.log(api_user_call)

	DZ.api(api_user_call, function(response){
		user_num = response['id'];
		getAlbumsList(response['id'], response['name'], logged_in);
	});
} else { 
	console.log('No user logged in')
	user_num = default_user_num
	user_name = default_user_name
	logged_in = false
	getAlbumsList(user_num, user_name, logged_in)
	findAlbumShufflePlaylist()
}


function loginFunction(){
	// Then, request the user to log in (note we use the Client Flow by saying response_type=token)
	login_url= `https://connect.deezer.com/oauth/auth.php?app_id=${app_id}&redirect_uri=${redirect_uri}&perms=${perms}&response_type=token`;
	window.open(login_url)

	
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

function getAlbumsList(user_num, user_name_str, logged_in){
	// user_num = user_response['id']
	user_name = document.querySelector('#username');
	user_name.textContent = user_name_str;
	// Display the user name
	let user_api_call = `/user/${user_num}`
	// DZ.api(user_api_call, function(response){
// 		user_name = response['name'];
// 		user_name = document.querySelector('#username');
// 		user_name.textContent = response['name'];
// 	});
	// Set maximum number of albums to query
	// TODO: Make this a variable? Or increase if the number of albums in the query equals this
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
		if(logged_in){
			document.getElementById("SaveButton").disabled = false;
		}
	});
}
async function fetchAsync (url) {
	console.log('Enter fetchAsync contenttype')
	let response = await fetch(url, 
		{method: 'POST', 
		mode: 'no-cors'
	});
	console.log(response);
}
function findAlbumShufflePlaylist() {
	find_playlist_call = '/user/' + user_num + '/playlists'
	console.log('Find Playlist call - ')
	console.log(find_playlist_call)
	DZ.api(find_playlist_call, function(response){
		for(let i = 0; i<response.total; i++){
			playlist = response.data[i]
			if(playlist['title'] == ptitle){
				console.log('Found ' + playlist['title'] + ', ID: ' + playlist['id'])
				delete_playlist_call = `https://api.deezer.com/playlist/${playlist['id']}&request_method=DELETE&${access_token}`
				console.log(delete_playlist_call)
				fetchAsync(delete_playlist_call)
			}
		}
	})
}

function SavePlaylist(){
	
	console.log("Save playlist clicked")
	console.log('User_num ' + user_num)
	// playlist_call = '/user/me/playlists'
// 	console.log('Playlist call: ' + playlist_call)
//     // Create a playlist
//     DZ.api(playlist_call, 'POST', {access_token: access_token, title : "Album Shuffle"}, function(response){
// 		console.log(response)
//     	console.log("My new playlist ID", response.id);
//     });
	// Example of workign api call
	// https://api.deezer.com/user/me/playlists&title=HAHA&request_method=POST&access_token=frTqPqVJlzxdDKqy54yfGItHoAqSGAzOLt6uR7nTmm0yyDJ54LD
	// https://api.deezer.com/user/me/playlists&title=HAHA&request_method=POST&access_token=frTqPqVJlzxdDKqy54yfGItHoAqSGAzOLt6uR7nTmm0yyDJ54LD
	playlist_call = `https://api.deezer.com/user/me/playlists&title=${ptitle}&request_method=POST&${access_token}`
	console.log(playlist_call)
	data = fetchAsync(playlist_call)
	// Flow: * 
	// * Get Playlist ID
	// * Get track ids for each album in order
	// * Combine into a comma separated list
	// * Send request
	// e.g.
	// https://api.deezer.com/playlist/10426085322/tracks&songs=COMMASEPARATEDSONGS&request_method=POST&access_token=ACCESS_TOKEN
	track_template = ''
	// const userAction = async () => {
	//   const response = await fetch(playlist_call);
	//   // const myJson = await response.json(); //extract JSON from the http response
	//   // // do something with myJson
	//   console.log(response)
	// }
    // const response = await fetch(playlist_call);
	// console.log(response)
	// console.log(userAction)
	
}