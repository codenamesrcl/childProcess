module.exports = {
	generate: generate
}

var exec = require('child_process').exec;

//generate a new ExecRunner
function generate(command, eventHandler){
	return new ExecRunner(command, eventHandler);
}


function ExecRunner(command, eventHandler){
	this.command = command;
	this.eventHandler = eventHandler;
	this.instance = null;
	this.isRunning = false;

	if(!command){
		//opting to not throw an error for now, just going to create an
		//empty command
		this.command = "";
	}
	if(!eventHandler){
		//opting to not throw an error for now, just going to create an 
		//empty function
		this.eventHandler = function(){};
	}
}
ExecRunner.prototype.run = function(){

	if(this.instance != null){
		console.log('instance already running, killing process');
		this.kill();
	}

	if(this.command.length > 0){
		this.instance = exec(this.command,
		  function (error, stdout, stderr) {}.bind(this)
		);
		
		this.isRunning = true;

		this.instance.stdout.on('data', function (data) {
			this.eventHandler("stdout.data", data);
		}.bind(this));

		this.instance.stderr.on('data', function(data){
			this.eventHandler("stderr.data", data);
		}.bind(this));

		this.instance.on('close', function (code) {
			this.isRunning = false;
			this.eventHandler("close", code);
		}.bind(this));

		this.instance.on('exit', function(code){
			this.isRunning = false;
			this.eventHandler("exit", code);
			this.instance = null;
		}.bind(this));
	}
	else{
		throw "No command has been set for this process";
	}
}
ExecRunner.prototype.kill = function(){
	var execKiller = require("tree-kill");
	
	if(this.instance){
		execKiller(this.instance.pid, 'SIGKILL', function(err) {
		    // Do things 
		});
		//this.instance.kill('SIGTERM');
	}
}
ExecRunner.prototype.setCommand = function(command, run){
	this.command = command;
	if(run){ 
		this.run(); 
	}
	else{ 
		if(this.instance){ 
			this.kill(); 
		} 
	}
}



//event handler example when creating a childProcess runner
//basically the eventHandler handles child events like stdio
// var eventHandler = function(eventtype, data){
// 	switch(eventtype){
// 		case "stdout.data":
// 			_appendStdOut(data);
// 			break;
// 		case "close":
// 			vm.status = "idle";	
// 			_execRunner.kill();
// 			vm.started = false;
// 			_appendStdOut("process closed with code " + data);
// 			break;
// 		case 'exit':
// 			vm.status = "idle";	
// 			_execRunner.kill();
// 			vm.started = false;
// 			_appendStdOut("process exited with code " + data);
// 			break;
// 	}
// }