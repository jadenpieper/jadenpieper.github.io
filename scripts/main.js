// TODO: Make this something meaningful	
var redirect_uri = 'https://www.jadenpieper.com'
var perms = 'manage_library,delete_library,listening_history'
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
	console.log('where is update')
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
	console.log('Did this update')
	DZ.api(api_call, function(response){
		let total_albums = `Number of albums in library: ${response.total}`;
		library_info = document.querySelector('#library_info');
		library_info.textContent = total_albums;
		const album_list = document.querySelector('#albums');
		used_ix = []
		tries = 0
		tries_lim = 100
		for (let ix =0; ix < 5; ix++) {
			while (true & tries < tries_lim ) {
				tries = tries + 1
			    album_ix = Math.floor(Math.random() * response.total)
			    if (!used_ix.includes(album_ix)) {
			      used_ix.push(album_ix)
			      break
			    }
			  }	
			album = response.data[album_ix]
			album_result = `${album['artist']['name']} - ${album['title']}`
			album_list.appendChild(createAlbumItem(album_result))
			album_ids.push(album['id'])
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

function SavePlaylist(){
	
	// console.log("Save playlist clicked")
	// console.log('User_num ' + user_num)
	
	// Call for finding all a user's playlists
	find_playlist_call = '/user/' + user_num + '/playlists'
	
	// console.log('Find Playlist call - ')
	// console.log(find_playlist_call)
	
	// Start by finding all playlists
	DeezerPromise(find_playlist_call).then(
		function(response){
			// console.log('Looking for playlists to delete')
			
		   	playlists = response.data 
			  	
			is_next = typeof response.next != "undefined"
			console.log('Do I have next?')
			console.log(is_next)
			
			save_me = 0
			while(is_next & save_me < 10){
				next = response.next.replace('https://api.deezer.com', '')
				console.log('Full response.next then trimmed next:')
				console.log(response.next)
				console.log(next)
				
				console.log('Save me: ' + save_me)
				save_me = save_me + 1
				await DZ.api(next, function(next_response){
					console.log('New playlists:')
					console.log(next_response.data)
					is_next = next_response.next != "undefined"
					// next = next_response.next.replace('https://api.deezer.com/', '')
					console.log('Next:')
					console.log(next)
					
					playlists = playlists.concat(next_response.data)
				});
			}   	
			for(let i = 0; i<playlists.length; i++){
				playlist = playlists[i]
				if(playlist['title'] == ptitle){
					console.log('Found ' + playlist['title'] + ', ID: ' + playlist['id'])
					delete_playlist_call = `https://api.deezer.com/playlist/${playlist['id']}&request_method=DELETE&${access_token}`
					console.log(delete_playlist_call)
					return fetchAsync(delete_playlist_call)
				}
			}
	}).then(
		function(){
			// console.log('Making playlist')
			playlist_call = `https://api.deezer.com/user/me/playlists&title=${ptitle}&request_method=POST&${access_token}`
			// console.log(playlist_call)
			return fetchAsync(playlist_call);
		}
	).then(
		function(){
			// find all user playlists again
			return DeezerPromise(find_playlist_call)
		}
	).then(
		function(response){
			// console.log('Finding playlist')
			// console.log(response)
			var playlist_id = ''
		   	playlists = response.data   	
			
			is_next = typeof response.next != "undefined"
			console.log('Do I have next?')
			console.log(is_next)
			
			save_me = 0
			while(is_next & save_me < 10){
				next = response.next.replace('https://api.deezer.com', '')
				console.log('Full response.next then trimmed next:')
				console.log(response.next)
				console.log(next)
				
				console.log('Save me: ' + save_me)
				save_me = save_me + 1
				await DZ.api(next, function(next_response){
					console.log('New playlists:')
					console.log(next_response.data)
					is_next = next_response.next != "undefined"
					// next = next_response.next.replace('https://api.deezer.com/', '')
					console.log('Next:')
					console.log(next)
					
					playlists = playlists.concat(next_response.data)
				});
			}
			for(let i = 0; i<playlists.length; i++){
				playlist = playlists[i]
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
			// Initialize array for storing all track ids
			all_track_ids = []
			for(let i=0, p = Promise.resolve(); i<album_ids.length; i++){
				// p forces asyncronous call to happen synchronously, ensuring the playlist album order matches that of the display on the website
				p = p.then(
					function(){
						album_tracks_call = `album/${album_ids[i]}/tracks`
						// console.log('Album tracks call:')
						// console.log(album_tracks_call)
						return DeezerPromise(album_tracks_call)
				}).then(
					function(response){
						// Once we've been returned the response from deezer with the album tracks, store them all
						// console.log(response)
						// Array for album track ids
						album_track_ids = []
						if(response.data == null){
							console.log('Missing album, update library')
						} else{
							for(let k = 0; k<response.data.length; k++){
								album_track_ids.push(response.data[k]['id'])
							}
						}
						// console.log(album_track_ids)
						// Store album track ids with running list of all ids
						all_track_ids = all_track_ids.concat(album_track_ids)
						if(i == album_ids.length - 1){
							// We're on our last album
							// console.log(all_track_ids)
							
							// Add tracks to playlist
							add_tracks_call = `https://api.deezer.com/playlist/${playlist_id}/tracks&songs=${all_track_ids.join(',')}&request_method=POST&${access_token}`
							// console.log('Add tracks call: ')
							// console.log(add_tracks_call)
							fetchAsync(add_tracks_call)
						}
					}
				)
			}
		}
	)	
}