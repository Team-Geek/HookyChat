
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
		io.sockets.in(data.room).emit('message', data);
	});

	socket.on('enter', function (type, data){
		if(socket.id)
		{
			enterRoom(type, socket);
		}
	});

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
				+ data.newId + '", "' + data.newNickname + '")');
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
				setTimeout(function(){initializeRoom(data.userid, socket)}, 1000);
				//showRooms(data.id, socket);
				showCraatedRooms(data.userid, socket);
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
				+ data.id + '", "' + data.id + '")');

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
		showCraatedRooms(data.id, socket);
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

function createRoom(data, socket)
{
	db.query('select UUID_SHORT()', function (error, room_id){
		db.query('SELECT * FROM Roomlist WHERE id=' + room_id, function (error, response) {
			if(response.length == 0)
			{
				db.query('insert into Roomlist values ( (select UUID_SHORT()), "' + data.room_name + '", ' + data.isPrivate + ', "' + data.room_password + '")');
			}
			else
			{
				createRoom(data, socket);
			}
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

function showCraatedRooms(userid, socket)
{
	
	db.query('SELECT * FROM Roomlist', function(error, roominfo) {
		console.log(roominfo);
		socket.emit('showRooms', '#searchlist', roominfo);
	});
	
}

function switchRoom(data, socket)
{

}

function enterRoom(type, socket)
{

}

