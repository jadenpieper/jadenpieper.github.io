// Initial Deezer SDK
DZ.init({
	appID : 	'517602',
	channelUrl : 'http://jadenpieper.github.io/channel.html'
	
})

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

})