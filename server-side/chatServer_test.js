
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
	
	socket.on('signup', function (data){
		
		checkid(data, socket);
		//socket.emit('signup', 0);
	
	});
	
	socket.on('login', function (type, data){	
		
		console.log('yo');		
		console.log(data);

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

	});
}

function createRoom(data, socket)
{
	
}
	
