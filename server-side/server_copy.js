
<!-- 모듈을 가져옴-->

var mysql = require('mysql');
var io = require('socket.io').listen(53297);

<!--커넥션 초기화  -->
var db = mysql.createConnection({
	host: '127.0.0.1',
	port: '3306',
	user: 'root',
	password: 'rltjs206#',
	database: 'chatDB'
});

var loggedIn;

<!-- connection은 모든 클라이언트에 해당하는 것이기 때문에 모든 클라이언트에게 해주는 펑션임-->
io.sockets.on('connection', function (socket){
	

	<!-- 이벤트를 발생시킨 특정 클라이언트에게만 실행시키는 함수-->
	socket.on('signup', function (data){
		
		checkid(data, socket);
		socket.emit('signup', 0);
	
	});
	
	socket.on('login', function (type, data){	
		
		console.log('yo');		

		if(type == 1)
			login(data, socket);
		else
			fblogin(data, socket);

	});
	
	<!--클라이언트에서 message 보내기 버튼을 눌렀을때 실행되는 함 -->
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
		<!-- signup 이벤트리스너를 실행시키면서 파라미터로 check를 보내줌.-->
			socket.emit('signup', 1);
			
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
	
