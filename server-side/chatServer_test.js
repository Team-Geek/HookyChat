
var mysql = require('mysql');
var io = require('socket.io').listen(53297);

var db = mysql.createConnection({
	host: '127.0.0.1',
	port: '3306',
	user: 'root',
	password: 'rltjs206#',
	database: 'chatDB'
});

var loggedIn;

io.sockets.on('connection', function (socket){
	
	var arr = [];
	arr[0] = 23599685197365248;
	arr[1] = 23593455197365248;

	console.log(JSON.stringify(arr));

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
		io.sockets.emit('message', data);
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
				showRooms(data.userid, socket);
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

		showRooms(data.id, socket);

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
		socket.emit('showRooms', parsed);
	});
}

function enterRoom(data, socket)
{

}