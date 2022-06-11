// TODO: Make this something meaningful	
var redirect_uri = 'https://www.jadenpieper.com'
var perms = 'manage_library,delete_library'
var access_token = ''

var user_num = ''
var default_user_num = 4565334962
var default_user_name = 'bongobonzo_no_login'
var logged_in = null

var ptitle = 'AlbumShuffle'
var album_ids = []

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
}

function DeezerPromise(api_call){
	// Wrapper to convert Deezer API calls to Promises
	return new Promise(function(resolve, reject) {
		DZ.api(api_call, resolve)
	});
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
			album_ids.push(album['id'])
			console.log('Album ids: ' + album_ids)
		}
		if(logged_in){
			document.getElementById("SaveButton").disabled = false;
		}
	});
}
async function fetchAsync (url) {
	let response = await fetch(url, 
		{method: 'POST', 
		mode: 'no-cors'
	});
	return response
}
// function findAlbumShufflePlaylist(delete_playlist) {
//
// }

// function CreateAlbumShufflePlaylist(){
// 	playlist_call = `https://api.deezer.com/user/me/playlists&title=${ptitle}&request_method=POST&${access_token}`
// 	console.log(playlist_call)
// 	fetchAsync(playlist_call);
// 	delete_plist = false
// 	playlist_id = findAlbumShufflePlaylist(delete_plist);
// }

function SavePlaylist(){
	
	console.log("Save playlist clicked")
	console.log('User_num ' + user_num)
	// Find and Delete AlbumShuffle if it exists
	delete_plist = true

	find_playlist_call = '/user/' + user_num + '/playlists'
	console.log('Find Playlist call - ')
	console.log(find_playlist_call)
	// Start by finding all playlists
	DeezerPromise(find_playlist_call).then(
		function(response){
	// DZ.api(find_playlist_call, function(response){
		console.log('Looking for playlists to delete')
		for(let i = 0; i<response.total; i++){
			playlist = response.data[i]
			if(playlist['title'] == ptitle){
				console.log('Found ' + playlist['title'] + ', ID: ' + playlist['id'])
				delete_playlist_call = `https://api.deezer.com/playlist/${playlist['id']}&request_method=DELETE&${access_token}`
				console.log(delete_playlist_call)
				// TODO: Pretty sure this flow is wrong, should be a promise?
				return fetchAsync(delete_playlist_call)
			}
		}
	}).then(
		function(){
			console.log('Making playlist')
			playlist_call = `https://api.deezer.com/user/me/playlists&title=${ptitle}&request_method=POST&${access_token}`
			console.log(playlist_call)
			// TODO: Pretty sure this flow is wrong, should be a promise?
			return fetchAsync(playlist_call);
		}
	).then(
		function(){
			return DeezerPromise(find_playlist_call)
		}
	).then(
		function(response){
			console.log('Finding playlist')
			console.log(response)
			var playlist_id = ''
			for(let i = 0; i<response.total; i++){
				playlist = response.data[i]
				if(playlist['title'] == ptitle){
					console.log('Found ' + playlist['title'] + ', ID: ' + playlist['id'])
					playlist_id = playlist['id']

				}
			}
			if(playlist_id == ''){
				console.log('Could not find playlist id...that is not good')
			} else{
				console.log('Found Playlist: ' + playlist_id);
			}
			
			for(let i=0, p = Promise.resolve(); i<album_ids.length; i++){
				album_tracks_call = `https://api.deezer.com/album/${album_ids[i]}/tracks`
				console.log('Album tracks call:')
				console.log(album_tracks_call)
				p = p.then(function(){
					return DeezerPromise(album_tracks_call)
				}).then(
					function(response){
						console.log(response)
						album_track_ids = []
						for(let k = 0; k<response.data.length; k++){
							album_track_ids.push(response.data[k]['id'])
						}
						console.log(album_track_ids)
					}
				)
				// DeezerPromise()
			}
		}
	)
	
	// findAlbumShufflePlaylist(delete_plist)
	// Example of workign api call
	// https://api.deezer.com/user/me/playlists&title=HAHA&request_method=POST&access_token=frTqPqVJlzxdDKqy54yfGItHoAqSGAzOLt6uR7nTmm0yyDJ54LD
	// https://api.deezer.com/user/me/playlists&title=HAHA&request_method=POST&access_token=frTqPqVJlzxdDKqy54yfGItHoAqSGAzOLt6uR7nTmm0yyDJ54LD
	// playlist_id = CreateAlbumShufflePlaylist();
	// console.log('Playlist ID: ' + playlist_id);
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