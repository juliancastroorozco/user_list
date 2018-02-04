var users = JSON.parse(localStorage.getItem('users')) || [],
	table, map, info_window, marker,
	$user_list,
	//pages
	$list_page,
	$form_page,
	//form variables
	$user_form,
	$user_id,
	$add_user,
	$cancel_user,
	$lat,
	$lng,
	$location,
	$success_msg;

/**
 * Edit a user for a given ID
 * @param  id 
 */
function edit_user(id) {
	$user_form.trigger("reset");
	$user_form.find('h2').text('Edit User');
	$user_id.val(id);
	var user = table.row(id).data();
	//populate form
	$.each(user, function (k, v) {
		$user_form.find("input[name='" + k + "']").val(v);
	});
	//default value for location
	if (!user.location) {
		user.location = "0, 0";
	}
	//translate location to lat/lon
	var user_pos_parts = user.location.split(',')
	var user_pos;
	if (user_pos_parts.length == 2) {
		$lat.val(user_pos_parts[0].trim());
		$lng.val(user_pos_parts[1].trim());
		user_pos = { lat: +user_pos_parts[0].trim(), lng: +user_pos_parts[1].trim() }
	}

	$list_page.hide();
	$form_page.show().delay(100)
		.queue(function (next) {
			init_map(user_pos);
			next();
		});
}
/**
 * Show form to add an user
 */
function add_user() {
	$user_form.trigger("reset");
	$user_form.find('h2').text('Add User');
	$list_page.hide();
	$form_page.show().delay(100)
		.queue(function (next) {
			init_map();
			next();
		});
}
/**
 * Close user form
 */
function cancel_user() {
	$list_page.show();
	$form_page.hide();
}
/**
 * Resets the map to a given position
 * @param user_pos 
 */
function init_map(user_pos) {
	var default_pos = user_pos || { lat: -37.808, lng: 144.935 };//default map center Melbourne
	//map help tooltip
	info_window = new google.maps.InfoWindow;
	info_window.setPosition(default_pos);
	info_window.setContent('Drag me.');

	map = new google.maps.Map(document.getElementById('map'), {
		center: default_pos,
		zoom: 6
	});
	//marker dragable by user
	marker = new google.maps.Marker({
		position: new google.maps.LatLng(default_pos.lat, default_pos.lng),
		draggable: true,
		title: "Drag me"
	});
	//marker drag save position in form
	google.maps.event.addListener(marker, 'dragend', function (evt) {
		$lat.val(evt.latLng.lat().toFixed(3));
		$lng.val(evt.latLng.lng().toFixed(3));
		$location.val(evt.latLng.lat().toFixed(3) + ', ' + evt.latLng.lng().toFixed(3));
	});
	map.setCenter(marker.position);
	marker.setMap(map);
}
/**
 * Init datatable with user data from localstorage
 */
function init_table() {
	table = $user_list.DataTable({
		"data": users,
		"responsive": true,
		"columns": [
			{ "data": "name" },
			{ "data": "email" },
			{ "data": "location" },
			{
				"data": "dob",
				"render": function (data, type, full, meta) {
					return '<input type="date" value="' + data + '" readonly style="border: none;background-color: transparent;" />';
				},
			},
			{
				"data": null,
				"render": function (data, type, full, meta) {
					return '<button data-user_id=' + meta.row + ' onclick="edit_user(' + meta.row + ')" class="btn btn-primary edit_user" role="button">Edit</a>';
				},
				"orderable": false
			}
		]
	});

}
/**
 * Init button listeners
 * @param params 
 */
function init_listeners() {
	$user_list = $('#user_list');
	//pages
	$list_page = $("#list_page");
	$form_page = $("#form_page");
	//form variables
	$user_form = $("#user_form");
	$user_id = $("#user_id");
	$add_user = $("#add_user");
	$cancel_user = $("#cancel_user");
	$lat = $("#lat");
	$lng = $("#lng");
	$location = $("#location");
	$success_msg = $("#success_msg");

	$add_user.click(add_user);
	$cancel_user.click(cancel_user);
	$user_form.submit(function (e) {
		e.preventDefault();
		var id = $user_id.val();
		var user = {};
		//set location based on lat/lon
		$location.val($lat.val() + ', ' + $lng.val());
		//build user object
		$.each($(this).serializeArray(), function (_, kv) {
			user[kv.name] = kv.value;
		});
		//To add an user
		if (id == '' || !(id >= 0)) {
			id = users.length;
			table
				.row
				.add(user)
				.draw();
		} else {//edit an user
			table
				.row(id)
				.data(user)
				.draw();
		}
		//update local storage
		users[id] = user;
		localStorage.setItem('users', JSON.stringify(users));
		//close modal
		$cancel_user.click();
		$success_msg.show().delay(1000).slideUp();
	});
}
$(document).ready(function () {
	init_listeners();
	init_table();
});
