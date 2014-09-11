
var mysql = require('mysql');
var io = require('socket.io').listen(53297);

var db = mysql.createConnection({
	host: '127.0.0.1',
	port: '3306',
	user: 'root',
	password: 'rltjs206#',
	database: 'chatDB'
});

io.sockets.on('connection', function (socket){		

	socket.roomlist = [];
	socket.room_ids = [];
	socket.user_id = '';

	socket.on('signup', function (data){
		
		checkid(data, socket);
		
		//socket.emit('signup', 0);
	
	});
	
	socket.on('login', function (type, data){

		if(type == 1)
			login(data, socket);
		else
			fblogin(data, socket);

	});	
	
	socket.on('message', function (data){
		console.log(data);

		//send messages to clients in certain rooms
		io.sockets.in(data.room).emit('message', data);
	});

	socket.on('create', function (room_data){
		console.log(room_data);
		createRoom(room_data, socket);
	})

	socket.on('enter', function (room_id){
		console.log(room_id);
		if(socket.user_id)
		{
			enterRoom(room_id, socket);
		}
	});

	socket.on('leave', function (room_id){

		if(socket.user_id)
		{
			leaveRoom(room_id, socket);
		}
	})



});

function checkid(data, socket)
{
	var check = 0;
	
	db.query('SELECT * FROM UserInfo WHERE userid="' + data.newId + '"', function(error, ids){
		console.log(ids.length);
		if(ids.length > 0)
		{
			check = 1;
		}
		
		
		db.query('SELECT * FROM UserInfo WHERE nickname="' + data.newNickname + '"', function(error, nicknames){
			console.log(nicknames.length);
			if(nicknames.length > 0)
			{
				check = 2;
			}
			
			if(check == 0)
			{
				db.query('INSERT INTO Userlist VALUES ("' 
				+ data.newId + '", "' + data.newPassword + '")');

				db.query('INSERT INTO UserInfo VALUES ("' 
				+ data.newId + '", "' + data.newNickname + '", "[]")');
			}
		
			socket.emit('signup', check);
			
		});
				
	});
		
}

function login(data, socket)
{
		
	db.query('SELECT * FROM Userlist WHERE userid="' + data.userid 
	+ '" AND password="' + data.password + '"', function(error, results){
		if(results.length != 0)
		{
			db.query('SELECT * FROM UserInfo WHERE userid="' + data.userid + '"', function(error2, userinfo){
				socket.emit('loginSuccess', userinfo[0]);
				console.log(data.userid);
				setTimeout(function(){initializeRoom(data.userid, socket)}, 1000);
				//showRooms(data.id, socket);
				showCraatedRooms();
				socket.user_id = data.userid;
			});				
		}
		else
		{
			socket.emit('loginFailed');
		}
	});
}

function fblogin(data, socket)
{
	db.query('SELECT * FROM UserInfo WHERE userid="' + data.id + '"', function(error, userinfo) {
		if(userinfo.length == 0)
		{
			db.query('INSERT INTO UserInfo VALUES ("' 
				+ data.id + '", "' + data.id + '", "[]")');

			socket.emit('loginSuccess', {
				userid:data.id,
				nickname:data.id
			});
		}
		else
		{
			socket.emit('loginSuccess', userinfo[0]);
		}

		socket.user_id = data.id;
		
		console.log('badd');
		setTimeout(function(){initializeRoom(data.id, socket)}, 1000);
		//showRooms(data.id, socket);
		showCraatedRooms();
	});
}

function initializeRoom(userid, socket)
{
	db.query('SELECT * FROM UserInfo WHERE userid="' + userid + '"', function(error, userinfo){
						
		parsed = JSON.parse(userinfo[0].joined_room);

		parsed.forEach(function(entry, index) {
			
			db.query('SELECT * FROM Roomlist WHERE id="' + parsed[index] + '"', function(error, rooms){				
								
				if(rooms.length > 0)
				{
					//put the clients into the rooms
					socket.join(parsed[index]);												
					socket.roomlist[index] = rooms[0];
					socket.room_ids[index] = rooms[0].id;
				}

				if(index == (parsed.length - 1))
				{	
					socket.emit('initRoompage', socket.roomlist);
					socket.emit('showRooms', '#roomlist',  socket.roomlist);
				}

			});
		});		
	});
}

function showRooms(userid, socket)
{
	db.query('SELECT * FROM UserInfo WHERE userid="' + userid + '"', function(error, userinfo){
		
		var parsed = JSON.parse(userinfo[0].joined_room);
		var roomlist = [];

		for(var i=0; i < parsed.length; i++)
		{
			db.query('SELECT * FROM Roomlist WHERE id="' + parsed[i] + '', function(error, rooms){
				roomlist[i] = rooms[i]
			});
		}		
		
		socket.emit('showRooms', '#roomlist',  parsed);
	});
}

function showCraatedRooms()
{
	
	db.query('SELECT * FROM Roomlist', function(error, roominfo) {		
		io.sockets.emit('showRooms', '#searchlist', roominfo);
	});
	
}

function createRoom(room_data, socket)
{
	var sql;

	db.query('select CAST(UUID_SHORT() as CHAR) as id', function(error, uuid){

		console.log(uuid[0].id);
		console.log(room_data.privacy );

		if(room_data.privacy == true)
		{
			sql = 'INSERT INTO Roomlist VALUES ( "' + uuid[0].id +'", "' + room_data.room_name + '", 1, "' + room_data.room_password + '")';
		}
		else
		{
			sql = 'INSERT INTO Roomlist VALUES ( "' + uuid[0].id +'", "' + room_data.room_name + '", 0, "")';
		}

		db.query(sql);

		setTimeout(function(){
			enterRoom(uuid[0].id, socket);
			showCraatedRooms();
		}, 500);

	});

}

function switchRoom(data, socket)
{

}

function enterRoom(room_id, socket)
{	
	console.log('enterromm');

	

	if(socket.room_ids.indexOf(room_id) == -1)
	{
		db.query('SELECT * FROM Roomlist WHERE id="' + room_id + '"', function( error, roominfo){			

			if(roominfo.length == 1)
			{
				socket.join(room_id);

				socket.emit('initRoompage', roominfo);
				socket.emit('showPage', room_id);

				socket.room_ids.push(room_id);
				socket.roomlist.push(roominfo[0]);
				var roomlist = JSON.stringify(socket.room_ids);
				
				db.query("UPDATE UserInfo SET joined_room='" + roomlist + "' WHERE userid='" + socket.user_id + "'");
				socket.emit('showRooms', '#roomlist', socket.roomlist);
			}
			else if(roominfo.length == 0)
			{
				socket.emit('showMessageBox', '#closedRoom');
			}
		});
	}
	else
	{
		socket.emit('showPage', room_id);
	}
}

//leaving the room with id
function leaveRoom(room_id, socket)
{
	console.log('leave room');
	var index;

	//leave the room
	socket.leave(room_id);	

	

	if((index = socket.room_ids.indexOf(room_id)) != -1)
	{
		 console.log('1st' + index);
		 socket.room_ids.splice(index, 1);
	}
				
	for(index = 0; index < socket.roomlist.length; index++)
	{
		if(room_id == socket.roomlist[index].id)
		{
			socket.roomlist.splice(index, 1);
		}
	}
	
	console.log(socket.room_ids);
	console.log(socket.roomlist);

	var roomlist = JSON.stringify(socket.room_ids);

	db.query("UPDATE UserInfo SET joined_room='" + roomlist + "' WHERE userid='" + socket.user_id + "'");
	socket.emit('showRooms', '#roomlist', socket.roomlist);

	checkEmpty(room_id, socket);
}

function checkEmpty(room_id, socket)
{
	db.query('SELECT * FROM UserInfo WHERE joined_room LIKE "%' + room_id + '%"', function(error, userlist) {

		if(userlist.length == 0)
		{
			console.log('DELETE FROM Roomlist WHERE id="' + room_id + '"');
			db.query('DELETE FROM Roomlist WHERE id="' + room_id + '"');
			showCraatedRooms();
		}
	});
}

