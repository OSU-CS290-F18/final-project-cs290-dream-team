function addBlog() {


	var postRequest = new XMLHttpRequest();
	var requestURL = '/create';
	postRequest.open('POST', requestURL);

	var blog = document.getElementById('blog-input');

	if((!blog) || blog.value === "") {alert('no can do');return;}

	var requestBody = JSON.stringify({
			"blog": blog.value.trim(),
			"tags": []
			});

	postRequest.setRequestHeader('Content-Type', 'application/json');
	postRequest.send(requestBody);

	blog.value = "";
	blog.focus();

	var cmdLine = document.getElementById('command-input');
	cmdLine.value = "";
}

function processCommand() {

	var cmds  = document.getElementById('command-input').value.trim();
	if (cmds[1] === "p") { addBlog();}
	else if (cmds[1] === "f") {sendCommand();}
	else if (cmds[1] === "n") {addNew();}
	else {alert('no can do')};
}

function addNew() {

	var cmds  = document.getElementById('command-input');
	var cmdsArr = cmds.value.trim().replace(/#/g,"").split(' ');
	var jasStr = JSON.stringify(cmdsArr);
	var cmdStr = jasStr.toString();
	var getRequest = new XMLHttpRequest();
	var requestURL = '/commands/' + cmdStr;
	getRequest.open('GET', requestURL);

	getRequest.setRequestHeader('Content-Type', 'application/json');

	getRequest.addEventListener("load", function() {
			var cont  = document.getElementById('contentId');
			cont.innerHTML = getRequest.responseText;


			cmds.value = "";
			var blog = document.getElementById('blog-input');
			blog.value = "";
			blog.focus();

			});

	getRequest.send();

}

function sendCommand() {

	var cmds  = document.getElementById('command-input').value.replace(/#/g,"").trim();
	var cmdsArr = cmds.split(' ');
	var jasStr = JSON.stringify(cmdsArr);
	var cmdStr = jasStr.toString();
	var getRequest = new XMLHttpRequest();
	var requestURL = '/commands/' + cmdStr;
	console.log(requestURL);


	getRequest.open('GET', requestURL);

	getRequest.setRequestHeader('Content-Type', 'application/json');

	getRequest.addEventListener("load", function() {
			var cont = document.getElementById('contentId');
			cont.innerHTML = getRequest.responseText;
			var cmds  = document.getElementById('command-input');
			cmds.value = "";
			cmds.focus();

			});

	getRequest.send();



}



window.addEventListener('keyup', function(e) {
		var cmdLine = document.getElementById('command-input');
		if (cmdLine) {
		if (e.keyCode === 27) {
		if (cmdLine) {
		cmdLine.value = ":";
		cmdLine.focus();
		}

		}
		}
		});


window.addEventListener('DOMContentLoaded', function () {

		var cmdLine = document.getElementById('command-input');
		if (cmdLine) {
		cmdLine.addEventListener('keyup', function(e){
				if (e.keyCode === 13) processCommand();
				});

		}

		var blog = document.getElementById('blog-input');
		if (blog) blog.focus();
		var addPhotoButton = document.getElementById('add-blog-button');
		if (addPhotoButton) {
		addPhotoButton.addEventListener('click', addBlog);
		}


		});
