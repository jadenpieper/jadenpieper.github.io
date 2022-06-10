// TODO: Make this something meaningful	
var redirect_uri = 'https://www.jadenpieper.com'
var perms = 'manage_library'
var access_token = ''

var user_num = ''
var default_user_num = 4565334962
var default_user_name = 'bongobonzo_nologin'
var logged_in = null

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
	api_user_call = '/user/me&' + access_token
	console.log('API Call...')
	console.log(api_user_call)

	DZ.api(api_user_call, function(response){
		console.log(response)
		user_num = response['id'];
		getAlbumsList(response['id'], response['name']);
	});
} else { 
	console.log('No user logged in')
	user_num = default_user_num
	user_name = default_user_name
	logged_in = false
	getAlbumsList(user_num, user_name)
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

// album_section = document.querySelector('#album-section')


console.log('user_num: ' + user_num)
console.log('Logged in: ' + logged_in)
function getAlbumsList(user_num, user_name_str,){
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

	});
}